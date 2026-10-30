import type { PlanStepProgress } from './types';
import type { ValidationOutput } from './agents/validator';

export function selectPlanStep(
  steps: PlanStepProgress[],
  actionName: string,
  replayingHistory = false,
): PlanStepProgress | undefined {
  const current = steps.find(step => step.status !== 'completed');
  if (current) return current;
  if (steps.length === 0) return undefined;

  if (replayingHistory) {
    return { ...steps[steps.length - 1], status: 'in_progress' };
  }
  if (actionName !== 'done' || !steps.every(step => step.status === 'completed')) return undefined;

  return {
    id: 'task-completion',
    description: 'Verify that the requested task is complete',
    success_criteria: 'The task outcome is supported by the current browser state and recorded action results.',
    status: 'in_progress',
  };
}

export function resolvePostExecutionStatus(output: ValidationOutput): PlanStepProgress['status'] {
  if (output.operation_match === 'match' && output.success_verification === 'verified') {
    if (output.step_status === 'completed' || output.step_status === 'in_progress') return output.step_status;
  }
  if (output.operation_match === 'match' && output.success_verification === 'failed') return 'failed';
  return 'requires_revalidation';
}

export function shouldReplanAfterValidation(output: ValidationOutput): boolean {
  return output.operation_match !== 'match' || output.success_verification !== 'verified';
}

export function mergeExecutionPlanProgress(
  previous: PlanStepProgress[],
  next: Array<Omit<PlanStepProgress, 'status'>>,
): PlanStepProgress[] {
  const previousStatuses = new Map(
    previous.map(step => [`${step.id}\u0000${step.description}\u0000${step.success_criteria}`, step.status]),
  );
  return next.map(step => ({
    ...step,
    status: previousStatuses.get(`${step.id}\u0000${step.description}\u0000${step.success_criteria}`) ?? 'pending',
  }));
}
