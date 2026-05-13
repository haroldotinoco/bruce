# Failure Modes and Recovery Report

## Executive Summary

Bruce has two primary recovery systems: Temporal retries for workflow activities and BullMQ retries plus DLQ for inter-module events. Temporal handles long-running module work and activity retries; BullMQ handles durable cross-module delivery. The basic mechanics exist, but operational behavior is not yet consistently documented across modules, and some failure states can be misclassified as successful no-ops.

The most important risk is the boundary between inter-module event handling and Temporal workflow start. If a subscriber marks an event as deduplicated before a workflow successfully starts, a transient start failure can suppress replay for that event. The second major risk is inconsistent job API semantics across modules.

## Failure Taxonomy

### BullMQ Inter-Module Events

- Event payload validation failures occur in `packages/events/src/create-module-worker.ts`.
- Queue defaults are configured in `packages/events/src/bruce-queues.ts`.
- Exhausted or unrecoverable failures are copied to `bruce-events-dlq`.
- Replay support exists in `packages/events/src/dlq-retry.ts`.

### Temporal Workflows and Activities

- Activity retries are configured inside `proxyActivities` blocks in module workflows.
- Workflow-level failures are surfaced through Temporal status and optional `queryState`.
- Opportunity uses explicit quality-gate failures and non-retryable application failures for terminal quality cases.
- Add-Venture marks pipeline runs failed and rethrows workflow errors.

### Handoff Validation

- Opportunity and Add-Venture use `BRUCE_HANDOFF_VALIDATE_STRICT` to decide whether validation failures stop execution or warn and continue.
- Non-strict mode preserves throughput but can push contract failures downstream.

### HTTP Job APIs

- Opportunity distinguishes not-found and transient workflow status failures more clearly.
- Other modules often collapse status lookup failures into generic 404-style responses.

## Findings

**High: dedupe can happen before confirmed workflow start.** `apps/add-venture/src/services/inter-module-structuring.ts` uses Redis event dedupe for `opportunity.advanced`. If dedupe is set before `startVentureStructuringWorkflow` succeeds, a transient start failure may block the same event from being retried normally.

**High: no-op event handlers can hide routing mistakes.** If a worker receives an unexpected event type and returns without throwing, BullMQ marks the job successful. This converts an orchestration misconfiguration into a silent drop.

**Medium: DLQ exists but the runbook is thin.** `packages/events/src/dlq-retry.ts`, `packages/events/src/dlq-monitor.ts`, and queue names exist, but `LOCAL_TEST.md` focuses on Temporal and API verification rather than DLQ inspection or replay.

**Medium: job route error mapping is inconsistent.** Opportunity has more nuanced status behavior, while Add-Venture-like modules can treat many `getWorkflowStatus` failures as 404. This makes operator diagnosis harder.

**Medium: validation strictness changes recovery behavior.** In strict mode, invalid handoffs are retryable or DLQ-able failures. In non-strict mode, they may continue into workflows and surface as agent quality or persistence issues.

**Low: DLQ copy failure only logs.** If the worker fails to add a failed job to the DLQ, the system logs the issue but may not provide a durable secondary record.

## Improvement Opportunities

- Move event dedupe acknowledgement after successful Temporal workflow start, or record a two-phase state such as `received` then `started`.
- Add metrics for ignored event types, DLQ enqueue failures, and strict handoff validation failures.
- Document a BullMQ runbook with queue names, inspection steps, DLQ replay, and expected failure signatures.
- Standardize job status APIs across modules around `not_found`, `running`, `completed`, `failed`, `state_unavailable`, and `upstream_unavailable`.
- Treat strict validation as required in environments where downstream automation is expected to be reliable.
- Add replay safety guidance: what is idempotent, what is not, and how dedupe keys affect replay.

## Recommended Next Checks

- Simulate a malformed inter-module event and verify it reaches `bruce-events-dlq`.
- Simulate a transient handler failure and verify retry counts and eventual DLQ behavior.
- Test Add-Venture event dedupe when Temporal workflow start fails after the event is received.
- Compare all `apps/*/src/routes/jobs.ts` files for status and error response drift.
- Add DLQ recovery steps to the operator golden path.
