import { describe, expect, it } from 'vitest';
import {
  mergeExecutionPlanProgress,
  resolvePostExecutionStatus,
  selectPlanStep,
  shouldReplanAfterValidation,
} from '../validationPolicy';
import type { PlanStepProgress } from '../types';
import type { ValidationOutput } from '../agents/validator';

const plan: PlanStepProgress[] = [
  { id: 'search', description: 'Search for the item', success_criteria: 'Search results are visible', status: 'completed' },
  { id: 'open-result', description: 'Open a relevant result', success_criteria: 'The result page is open', status: 'pending' },
  { id: 'report', description: 'Summarize the result', success_criteria: 'A sourced summary is ready', status: 'completed' },
];

function validation(overrides: Partial<ValidationOutput> = {}): ValidationOutput {
  return {
    operation_match: 'match',
    success_verification: 'verified',
    reasoning: 'Evidence matches the plan.',
    planned_step_id: 'open-result',
    executed_operation: { name: 'click_element', arguments: { index: 2 }, argumentNames: ['index'] },
    detected_issues: [],
    recommended_next_action: '',
    step_status: 'completed',
    ...overrides,
  };
}

describe('validation policy', () => {
  it('selects the earliest unfinished step so later completed steps cannot hide a skipped step', () => {
    expect(selectPlanStep(plan, 'click_element')?.id).toBe('open-result');
  });

  it('does not allow task completion while any planned step remains unfinished', () => {
    expect(selectPlanStep(plan, 'done')?.id).toBe('open-result');
  });

  it('creates a final verification step only after every planned step is complete', () => {
    const completed = plan.map(step => ({ ...step, status: 'completed' as const }));
    expect(selectPlanStep(completed, 'done')?.id).toBe('task-completion');
  });

  it('reuses a completed step during replay when the history plan has already been traversed', () => {
    const completed = plan.map(step => ({ ...step, status: 'completed' as const }));
    expect(selectPlanStep(completed, 'click_element', true)?.id).toBe('report');
  });

  it('does not invent a plan for an unplanned action', () => {
    expect(selectPlanStep([], 'click_element')).toBeUndefined();
  });

  it('marks a step complete only after a matching operation and evidence based verification', () => {
    expect(resolvePostExecutionStatus(validation())).toBe('completed');
    expect(resolvePostExecutionStatus(validation({ operation_match: 'deviation' }))).toBe('requires_revalidation');
    expect(resolvePostExecutionStatus(validation({ success_verification: 'unverified' }))).toBe('requires_revalidation');
  });

  it('distinguishes a matching but unsuccessful operation from an unverified deviation', () => {
    expect(resolvePostExecutionStatus(validation({ step_status: 'in_progress' }))).toBe('in_progress');
    expect(resolvePostExecutionStatus(validation({ success_verification: 'failed', step_status: 'failed' }))).toBe('failed');
    expect(shouldReplanAfterValidation(validation({ operation_match: 'deviation' }))).toBe(true);
    expect(shouldReplanAfterValidation(validation({ success_verification: 'unverified' }))).toBe(true);
    expect(shouldReplanAfterValidation(validation({ step_status: 'in_progress' }))).toBe(false);
  });

  it('preserves progress only when the step identity and success criteria are unchanged', () => {
    const previous = [{ ...plan[0], status: 'completed' as const }];
    expect(mergeExecutionPlanProgress(previous, [plan[0]])[0].status).toBe('completed');
    expect(
      mergeExecutionPlanProgress(previous, [{ ...plan[0], success_criteria: 'A different result is visible' }])[0].status,
    ).toBe('pending');
  });
});
