# Orchestration Source of Truth

This document is the human-readable companion to the executable registries:

- `packages/events/src/orchestration-registry.ts`
- `packages/events/src/routing-policy.ts`
- `packages/events/src/failure-policy.ts`
- `packages/handoff/src/module-handoffs.ts`
- `packages/observability/src/id-glossary.ts`

If this document and code disagree, update the code registry first and then refresh this summary.

## Architecture Decision

Bruce orchestration is currently a decentralized event saga rooted at `opportunity`.

- Temporal owns durable module execution.
- BullMQ event queues own cross-module progression.
- `InterModuleEvent` is the durable transport envelope.
- `ModuleHandoffEnvelope` is the canonical contract envelope carried inside `InterModuleEvent.payload.handoff` or `InterModuleEvent.payload.handoffs.<target-module>`.
- `correlation_id` is the lifecycle correlation root and must travel through Temporal memo/args, observability runs, events, logs, DLQ payloads, and dashboard links.

## Event Classifications

| Classification | Meaning |
| --- | --- |
| `durable_downstream_trigger` | Starts or resumes a downstream module workflow. Must have subscribers unless intentionally disabled. |
| `terminal_lifecycle_signal` | Marks completion or lifecycle state without a default downstream queue subscriber. |
| `telemetry_only` | Observability event that should not drive orchestration. |
| `deprecated_or_stub` | Known non-runtime or transitional event. Must not silently drive production workflows. |

Current durable triggers:

| Event | Publisher | Subscribers | Contract |
| --- | --- | --- | --- |
| `opportunity.advanced` | `opportunity` | `add-venture` | `opportunity-to-venture` |
| `venture.qualified` | `add-venture` | `brand-aid`, `builder` | `venture-to-brand`, `venture-to-builder` |
| `builder.pipeline.completed` | `builder` | `gtm` | `builder-to-gtm` |
| `gtm.pipeline.completed` | `gtm` | `startup-ops` | `gtm-to-startup-ops` |
| `startup-ops.pipeline.completed` | `startup-ops` | `portfolio` | `startup-ops-to-portfolio` |
| `portfolio.pipeline.completed` | `portfolio` | `bruce-memory`, `bruce-core` | `portfolio-to-memory`, `portfolio-to-bruce-core` |

Current terminal signals:

| Event | Publisher | Reason |
| --- | --- | --- |
| `brand-aid.pipeline.completed` | `brand-aid` | Brand completion is not a GTM prerequisite in the current saga. |
| `bruce-memory.pipeline.completed` | `bruce-memory` | Memory ingestion closes the default chain. |
| `bruce-core.venture.created` | `bruce-core` | Venture creation is a lifecycle marker, not a default queue trigger. |

## Module Topology

| Module | Task queue | Start routes | Status routes | Consumes | Emits | Dashboard data |
| --- | --- | --- | --- | --- | --- | --- |
| `opportunity` | `bruce-opportunity` | `/scans`, `/scans/quick` | `/jobs/:id`, `/workflows/:run_id` | none | `opportunity.advanced` | live |
| `add-venture` | `bruce-add-venture` | `/structuring` | `/jobs/:id`, `/workflows/:run_id` | `opportunity.advanced` | `venture.qualified` | live |
| `brand-aid` | `bruce-brand-aid` | `/pipeline` | `/jobs/:id`, `/workflows/:run_id` | `venture.qualified` | `brand-aid.pipeline.completed` | mock |
| `builder` | `bruce-builder` | `/pipeline` | `/jobs/:id`, `/workflows/:run_id` | `venture.qualified` | `builder.pipeline.completed` | mock |
| `gtm` | `bruce-gtm` | `/pipeline` | `/jobs/:id`, `/workflows/:run_id` | `builder.pipeline.completed` | `gtm.pipeline.completed` | mock |
| `startup-ops` | `bruce-startup-ops` | `/pipeline` | `/jobs/:id`, `/workflows/:run_id` | `gtm.pipeline.completed` | `startup-ops.pipeline.completed` | mock |
| `portfolio` | `bruce-portfolio` | `/pipeline` | `/jobs/:id`, `/workflows/:run_id` | `startup-ops.pipeline.completed` | `portfolio.pipeline.completed` | mock |
| `bruce-memory` | `bruce-bruce-memory` | `/pipeline` | `/jobs/:id`, `/workflows/:run_id` | `portfolio.pipeline.completed` | `bruce-memory.pipeline.completed` | mock |
| `bruce-core` | `bruce-bruce-core` | `/ventures/:id/start-analysis` | `/jobs/:id`, `/workflows/:run_id` | `portfolio.pipeline.completed` | `bruce-core.venture.created` | mock |

## Failure Semantics

| Failure class | Owner | Retryable | Operator action |
| --- | --- | --- | --- |
| `temporal_retryable_failure` | Temporal | yes | Inspect activity history; workflow policy owns retries. |
| `domain_non_retryable_failure` | Module | no | Treat as a business terminal state and inspect module result details. |
| `bullmq_retry_exhausted` | BullMQ | yes | Inspect source queue and DLQ payload. |
| `dlq_replay_required` | BullMQ | yes | Fix routing, payload, or downstream availability, then run `pnpm run events:retry-dlq`. |
| `handoff_validation_failed` | Handoff | no | Fix upstream payload/schema mapping before replay. |
| `duplicate_suppressed` | Module | no | Confirm original event reached `started` or completed before ignoring. |
| `unexpected_event_type` | BullMQ | no | Fix routing policy or worker `expectedEventTypes` before replay. |
| `state_unavailable` | HTTP | yes | Poll again; if persistent, inspect Temporal query handler and worker health. |

## Recurring Checks

Run these before workflow releases:

```bash
pnpm test -- --project @bruce/events --project @bruce/handoff
pnpm --filter @bruce/agent-runtime test
pnpm --filter dashboard build:manifests
```

The tests check that:

- emitted event literals are classified,
- routing subscribers match consumed events,
- task queue names match app Temporal config,
- every workflow manifest declares `manifest_status`,
- handoff envelopes remain parseable and validated.

## Open Decisions

- Bruce-Core is a governance/coordinator module, not the current saga root. Revisit only if product wants Core to own the whole lifecycle.
- GTM currently depends on Builder completion only. Add a Brand-Aid join only after defining a join contract and timeout behavior.
- Workflow JSON manifests are `design` unless explicitly marked `runtime`; TypeScript Temporal implementations are the executable source today.
- Strict handoff validation should stay on by default in local and CI; production rollout can choose warning mode only with explicit risk acceptance.
- Dashboard live-data expansion should follow readiness metadata, not navigation visibility.
- Eval gates should become blocking only for critical handoff contracts first.
