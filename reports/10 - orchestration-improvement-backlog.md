# Orchestration Improvement Backlog Report

## Executive Summary

The analysis points to a clear theme: Bruce has the right building blocks for orchestration, but the sources of truth are fragmented. Contracts, events, workflows, dashboard readiness, docs, evals, and observability each describe part of the system. To make agents and workflows easy to orchestrate, the next improvements should focus on explicit topology, strict handoff contracts, traceable IDs, standardized recovery behavior, and visible readiness.

This backlog is intentionally non-code as written: it prioritizes decisions, documentation, governance, and recurring report checks. Some items will later become implementation work, but they should first be clarified through product and architecture agreement.

## Highest-Leverage Priorities

### P0: Establish an Orchestration Source of Truth

Create one authoritative registry or report that lists, per module:

- Temporal task queue.
- Workflow names.
- Start routes.
- Job/status routes.
- Consumed events.
- Emitted events.
- Handoff contracts.
- Dashboard readiness.
- Worker/runtime readiness.
- Observability identifiers.

Evidence:

- `workflow-orchestration-matrix.md`
- `event-routing-coverage-report.md`
- `dashboard-runtime-truth-report.md`

Why it matters: agents need a reliable map before they can coordinate workflows predictably.

### P0: Classify Every Event and Handoff

Every emitted event should be labeled as one of:

- Durable downstream trigger.
- Terminal lifecycle signal.
- Telemetry-only event.
- Deprecated or stub event.

Evidence:

- `event-routing-coverage-report.md`
- `handoff-integrity-report.md`

Why it matters: `brand-aid.pipeline.completed`, `bruce-memory.pipeline.completed`, `bruce-core` subscription stubs, and `skipQueue` agent events currently blur the operational meaning of “event.”

### P0: Align Runtime Handoffs with Contract Schemas

Decide whether `module-handoff.schema.json` or `InterModuleEvent` is the operational envelope. Then align validators, generated types, docs, and runtime payloads.

Evidence:

- `handoff-integrity-report.md`
- `agent-workflow-behavior-rules.md`

Why it matters: orchestration should fail at handoff boundaries, not later inside downstream agents.

### P1: Define a Lifecycle Correlation Root

Pick one correlation root that travels through:

- Temporal workflows.
- Observability runs.
- Inter-module events.
- LLM usage records.
- Dashboard workflow links.
- Logs and DLQ payloads.

Evidence:

- `observability-traceability-report.md`
- `failure-recovery-report.md`

Why it matters: operators should reconstruct a full run without guessing which ID type they are holding.

### P1: Standardize Failure and Recovery Semantics

Define shared states and runbooks for:

- Temporal retryable failures.
- Non-retryable domain failures.
- BullMQ retry exhaustion.
- DLQ replay.
- Handoff validation failure.
- Duplicate suppression.
- Unknown or ignored event types.

Evidence:

- `failure-recovery-report.md`
- `documentation-drift-golden-path-report.md`

Why it matters: automated agents need predictable recovery behavior, and humans need clear operational steps.

### P1: Make Workflow Behavior Rules Explicit

Create a per-module behavior catalog that states:

- Agent responsibilities.
- Retry policy.
- Quality gates.
- Escalation rules.
- Handoff conditions.
- Terminal states.
- Which `modules/*/workflows/*.workflow.json` files are authoritative, design-only, or stale.

Evidence:

- `agent-workflow-behavior-rules.md`

Why it matters: current rules are distributed across prompts, schemas, Temporal code, env vars, and docs.

### P1: Separate Dashboard Visibility from Runtime Readiness

Define and expose readiness dimensions:

- Visible in navigation.
- Has generated manifest.
- Has live HTTP data source.
- Has Temporal workflow routes.
- Has event worker.
- Has eval coverage.
- Has current docs.

Evidence:

- `dashboard-runtime-truth-report.md`
- `eval-coverage-agent-quality-report.md`

Why it matters: users and agents should not mistake mock visibility or manifest presence for operational readiness.

### P2: Promote Eval Coverage into a Quality Signal

Move from framework-only evals to module-critical evals:

- Convert narrative scenarios and fixtures into `.eval.json`.
- Add handoff correctness metrics.
- Distinguish stubbed evals from live-agent evals.
- Run all modules with `.eval.json` in CI or scheduled checks.

Evidence:

- `eval-coverage-agent-quality-report.md`

Why it matters: orchestration quality depends on agent outputs being structurally correct and decision-ready.

### P2: Consolidate the Operator Golden Path

Create one canonical local/runbook path that covers:

- Infra startup.
- Env configuration.
- Auth mode.
- Event bus mode.
- Workers and app processes.
- E2E checks.
- Temporal UI.
- DLQ inspection and replay.

Evidence:

- `documentation-drift-golden-path-report.md`
- `failure-recovery-report.md`

Why it matters: agents and humans need a consistent way to reproduce and verify workflow behavior.

## Recurring Health Checks

Run these reports periodically or before major workflow releases:

- Event names emitted vs `DEFAULT_EVENT_ROUTING`.
- Contract schemas vs runtime validators.
- Workflow manifests vs Temporal workflow implementation.
- Dashboard `realAvailable` and provider wiring vs backend readiness.
- Eval scenarios vs agent inventory.
- Observability ID coverage in events and workflow responses.
- DLQ volume, replay success, and ignored event counts.
- Docs commands vs root `package.json` scripts and CI jobs.

## Decision Log Needed

The following decisions should be made before broad implementation work:

- Is Bruce-Core the lifecycle coordinator, or is orchestration intentionally decentralized?
- Should GTM depend only on Builder, or on both Builder and Brand-Aid?
- Is `module-handoff.schema.json` intended to be runtime-enforced or architectural documentation?
- Should `modules/*/workflows/*.workflow.json` become runtime config, generated docs, or archived design material?
- Which environments should enforce strict handoff validation?
- Which dashboard modules are meant to be live in the next milestone?
- Which evals should block merges versus run as advisory quality reports?

## Suggested Execution Order

1. Publish the orchestration source-of-truth registry from the current reports.
2. Classify all events and handoffs.
3. Decide the canonical handoff envelope.
4. Define lifecycle correlation ID policy.
5. Standardize failure taxonomy and DLQ runbook.
6. Mark workflow manifests as authoritative, design-only, or stale.
7. Refresh dashboard readiness truth.
8. Convert top narrative evals into runnable evals.
9. Consolidate operator docs.
10. Re-run the full analytic report set after changes and compare drift.
