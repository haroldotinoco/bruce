export type OrchestrationFailureClass =
  | 'temporal_retryable_failure'
  | 'domain_non_retryable_failure'
  | 'bullmq_retry_exhausted'
  | 'dlq_replay_required'
  | 'handoff_validation_failed'
  | 'duplicate_suppressed'
  | 'unexpected_event_type'
  | 'state_unavailable';

export interface FailurePolicyEntry {
  class: OrchestrationFailureClass;
  retryable: boolean;
  owner: 'temporal' | 'bullmq' | 'handoff' | 'http' | 'module';
  operatorAction: string;
  terminal: boolean;
}

export const ORCHESTRATION_FAILURE_POLICY: Record<OrchestrationFailureClass, FailurePolicyEntry> = {
  temporal_retryable_failure: {
    class: 'temporal_retryable_failure',
    retryable: true,
    owner: 'temporal',
    operatorAction: 'Inspect Temporal activity history; retry is owned by workflow/activity policy.',
    terminal: false,
  },
  domain_non_retryable_failure: {
    class: 'domain_non_retryable_failure',
    retryable: false,
    owner: 'module',
    operatorAction: 'Treat as a business terminal state and inspect module result details.',
    terminal: true,
  },
  bullmq_retry_exhausted: {
    class: 'bullmq_retry_exhausted',
    retryable: true,
    owner: 'bullmq',
    operatorAction: 'Inspect source queue and DLQ payload before replay.',
    terminal: false,
  },
  dlq_replay_required: {
    class: 'dlq_replay_required',
    retryable: true,
    owner: 'bullmq',
    operatorAction: 'Fix routing, payload, or downstream availability, then run events:retry-dlq.',
    terminal: false,
  },
  handoff_validation_failed: {
    class: 'handoff_validation_failed',
    retryable: false,
    owner: 'handoff',
    operatorAction: 'Fix upstream handoff payload or schema mapping before replaying.',
    terminal: true,
  },
  duplicate_suppressed: {
    class: 'duplicate_suppressed',
    retryable: false,
    owner: 'module',
    operatorAction: 'Confirm the original event reached started/completed state before ignoring.',
    terminal: true,
  },
  unexpected_event_type: {
    class: 'unexpected_event_type',
    retryable: false,
    owner: 'bullmq',
    operatorAction: 'Fix routing policy or worker expectedEventTypes before replay.',
    terminal: true,
  },
  state_unavailable: {
    class: 'state_unavailable',
    retryable: true,
    owner: 'http',
    operatorAction: 'Poll again; if persistent, inspect Temporal query handler and worker health.',
    terminal: false,
  },
};

export function getFailurePolicy(
  failureClass: OrchestrationFailureClass,
): FailurePolicyEntry {
  return ORCHESTRATION_FAILURE_POLICY[failureClass];
}
