# BullMQ Event DLQ Recovery Runbook

## Queues

- Per-subscriber queues: `bruce-events-<subscriber>`, for example `bruce-events-add-venture`.
- Dead-letter queue: `bruce-events-dlq`.
- Replay command: `pnpm --filter @bruce/events retry-dlq`.

## Failure Classes

- `invalid_job_payload`: job data does not match the inter-module job envelope.
- `invalid_event_envelope`: `InterModuleEvent` validation failed.
- `unexpected_event_type`: a subscriber received an event outside its declared `expectedEventTypes`.
- `handler_failed`: subscriber handler threw after retries.
- `dlq_enqueue_failed`: exhausted job could not be copied into the DLQ.

## Inspection Steps

1. Identify the source queue and subscriber from the DLQ payload.
2. Record `event_id`, `event_type`, `correlation_id`, `venture_id`, `sourceQueue`, and `failedReason`.
3. Search logs for the same `event_id` and `correlation_id`.
4. Check whether the event is safe to replay:
   - Handoff validation failures are safe after correcting the payload or strictness setting.
   - Unexpected event type failures require routing or worker configuration fixes before replay.
   - Workflow-start failures are safe to replay if the module dedupe state is not `started`.
5. Requeue with `pnpm --filter @bruce/events retry-dlq`.
6. Confirm the target queue drains and the event worker logs `Module event processed`.

## Add-Venture Dedupe Safety

`opportunity.advanced` handling records a two-phase Redis state:

- `received`: event was accepted but `ventureAdditionWorkflow` has not successfully started.
- `started`: Temporal workflow start returned a workflow ID; duplicate events are skipped.
- `failed`: workflow start failed; BullMQ retry or DLQ replay may attempt the event again.

Only `started` suppresses replay. A transient Temporal start failure should not permanently consume the event.

## Metrics

- `bruce_events_unexpected_total{event_type,subscriber}`: unexpected event type deliveries.
- `bruce_events_dlq_enqueue_failed_total{source_queue}`: failures while copying exhausted jobs to DLQ.
- `bruce_handoff_validation_failed_total{stage}`: strict or non-strict handoff validation failures.

## Replay Guardrails

- Fix routing/configuration before replaying `unexpected_event_type` jobs.
- Replay one DLQ batch at a time and verify downstream workflows before repeating.
- Keep the original `event_id`; idempotent handlers use it for duplicate suppression.
- For Add-Venture, inspect Redis state for `bruce:add-venture:<account_id>:intermodule:<event_id>:state` before manual replay.
