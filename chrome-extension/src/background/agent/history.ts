import type { ActionResult, PlanStepProgress, StepMetadata, ValidationLogEntry } from './types';
import type { BrowserStateHistory } from '../browser/views';

export class AgentStepRecord {
  modelOutput: string | null;
  result: ActionResult[];
  state: BrowserStateHistory;
  metadata?: StepMetadata | null;

  constructor(
    modelOutput: string | null,
    result: ActionResult[],
    state: BrowserStateHistory,
    metadata?: StepMetadata | null,
  ) {
    this.modelOutput = modelOutput;
    this.result = result;
    this.state = state;
    this.metadata = metadata;
  }
}

export class AgentStepHistory {
  history: AgentStepRecord[];
  validationLogs: ValidationLogEntry[];
  executionPlan?: PlanStepProgress[];

  constructor(history?: AgentStepRecord[], validationLogs?: ValidationLogEntry[]) {
    this.history = history ?? [];
    this.validationLogs = validationLogs ?? [];
  }
}
