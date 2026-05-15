import { describe, expect, it } from 'vitest';
import {
  getFailurePolicy,
  ORCHESTRATION_FAILURE_POLICY,
  type OrchestrationFailureClass,
} from './failure-policy.js';

describe('orchestration failure policy', () => {
  it('defines recovery semantics for the standard failure classes', () => {
    const expected: OrchestrationFailureClass[] = [
      'temporal_retryable_failure',
      'domain_non_retryable_failure',
      'bullmq_retry_exhausted',
      'dlq_replay_required',
      'handoff_validation_failed',
      'duplicate_suppressed',
      'unexpected_event_type',
      'state_unavailable',
    ];

    expect(Object.keys(ORCHESTRATION_FAILURE_POLICY).sort()).toEqual([...expected].sort());
    expect(getFailurePolicy('handoff_validation_failed')).toMatchObject({
      retryable: false,
      owner: 'handoff',
      terminal: true,
    });
    expect(getFailurePolicy('dlq_replay_required')).toMatchObject({
      retryable: true,
      owner: 'bullmq',
      terminal: false,
    });
  });
});
