import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { wrapUntrustedContent, wrapUserRequest } from '../messages/utils';
import { Actors, ExecutionState } from '../event/types';
import type { AgentOutput, ExecutionPlanStep, PlanStepProgress } from '../types';
import { BaseAgent, type BaseAgentOptions } from './base';

const VALIDATION_TIMEOUT_MS = 45_000;

export const validationOutputSchema = z.object({
  operation_match: z.enum(['match', 'deviation', 'unverified']),
  success_verification: z.enum(['verified', 'failed', 'unverified']),
  reasoning: z.string(),
  detected_issues: z.array(z.string()),
  recommended_next_action: z.string(),
  step_status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'requires_revalidation']),
});

type ValidatorModelOutput = z.infer<typeof validationOutputSchema>;
export type ValidationOutput = ValidatorModelOutput & {
  planned_step_id: string;
  executed_operation: { name: string; arguments: unknown; argumentNames: string[] };
};

export interface ValidationRequest {
  task: string;
  originalExecutionPlan: ExecutionPlanStep[];
  executionPlan: PlanStepProgress[];
  plannedStep: PlanStepProgress;
  action: Record<string, unknown>;
  beforeEvidence: string;
  afterEvidence: string;
  actionResult: { success: boolean; extractedContent: string | null; error: string | null };
}

function getUnverifiedResult(request: ValidationRequest, reason: string): ValidationOutput {
  const [name, args] = Object.entries(request.action)[0] ?? ['unknown', {}];
  return {
    operation_match: 'unverified',
    success_verification: 'unverified',
    reasoning: reason,
    detected_issues: ['The post-execution audit could not be completed.'],
    recommended_next_action: 'Recheck the browser state and replan if needed.',
    step_status: 'requires_revalidation',
    planned_step_id: request.plannedStep.id,
    executed_operation: {
      name,
      arguments: args,
      argumentNames: args && typeof args === 'object' ? Object.keys(args) : [],
    },
  };
}

export class ValidatorAgent extends BaseAgent<typeof validationOutputSchema, ValidatorModelOutput> {
  constructor(options: BaseAgentOptions) {
    super(validationOutputSchema, options, { id: 'validator' });
  }

  async validate(request: ValidationRequest): Promise<ValidationOutput> {
    this.context.emitEvent(
      Actors.VALIDATOR,
      ExecutionState.STEP_START,
      `Auditing executed action: ${Object.keys(request.action)[0] ?? 'unknown'}`,
    );
    try {
      const safeRequest = {
        original_task: wrapUserRequest(request.task),
        original_planner_execution_plan: wrapUntrustedContent(JSON.stringify(request.originalExecutionPlan)),
        planner_execution_plan: wrapUntrustedContent(JSON.stringify(request.executionPlan)),
        current_planned_step: wrapUntrustedContent(JSON.stringify(request.plannedStep)),
        operation_executed_by_navigator: wrapUntrustedContent(JSON.stringify(request.action)),
        browser_state_before_execution: wrapUntrustedContent(request.beforeEvidence),
        browser_state_after_execution: wrapUntrustedContent(request.afterEvidence),
        execution_result: wrapUntrustedContent(JSON.stringify(request.actionResult)),
      };
      const validationController = new AbortController();
      const abortValidation = () => validationController.abort();
      if (this.context.controller.signal.aborted) {
        validationController.abort();
      } else {
        this.context.controller.signal.addEventListener('abort', abortValidation, { once: true });
      }
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const output = await Promise.race([
        this.invoke(
          [this.prompt.getSystemMessage(), new HumanMessage(JSON.stringify(safeRequest))],
          validationController.signal,
        ),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            validationController.abort();
            reject(new Error('Validator request timed out'));
          }, VALIDATION_TIMEOUT_MS);
        }),
      ]).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
        this.context.controller.signal.removeEventListener('abort', abortValidation);
      });
      const [name, args] = Object.entries(request.action)[0] ?? ['unknown', {}];
      const result: ValidationOutput = {
        ...output,
        planned_step_id: request.plannedStep.id,
        executed_operation: {
          name,
          arguments: args,
          argumentNames: args && typeof args === 'object' ? Object.keys(args) : [],
        },
      };
      const auditStatus = `${result.operation_match}; outcome ${result.success_verification}: ${result.reasoning}`;
      const auditPassed = result.operation_match === 'match' && result.success_verification === 'verified';
      this.context.emitEvent(Actors.VALIDATOR, auditPassed ? ExecutionState.STEP_OK : ExecutionState.STEP_FAIL, auditStatus);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.context.emitEvent(Actors.VALIDATOR, ExecutionState.STEP_FAIL, `Post-execution audit is unverified: ${message}`);
      return getUnverifiedResult(request, `Post-execution audit unavailable: ${message}`);
    }
  }

  async execute(): Promise<AgentOutput<ValidatorModelOutput>> {
    return { id: this.id, error: 'ValidatorAgent must be called with an executed action' };
  }
}
