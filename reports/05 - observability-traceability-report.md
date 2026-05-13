# Observability and Traceability Report

## Executive Summary

Bruce has a solid observability backbone in `packages/observability` and `packages/contracts/src/observability`, with module HTTP routes exposing workflow runs to the dashboard. A workflow run can include hierarchical steps, logs, LLM usage, status, and Temporal workflow identifiers.

The biggest traceability issue is identifier fragmentation. Temporal workflow IDs, observability run UUIDs, scan IDs, event IDs, BullMQ job IDs, correlation IDs, venture IDs, and dashboard route IDs are related but not unified. Opportunity has special scan-id fallback behavior, while other modules depend more directly on workflow or observability IDs.

## ID Lineage

Primary identifiers:

- `workflow_runs.id`: canonical observability run UUID.
- `workflow_runs.temporal_workflow_id`: Temporal workflow ID used by clients and route fallback.
- `workflow_runs.account_id`: tenant/account scope.
- `workflow_runs.venture_id`: optional venture linkage.
- `workflow_steps.id`: observability step UUID.
- `workflow_steps.key`: stable logical step key inside a run.
- `step_log_entries.id`: log/event row ID.
- `llm_usage_events.id`: LLM usage row ID.
- `llm_usage_events.correlation_id`: LLM-level correlation field.
- `InterModuleEvent.event_id`: durable inter-module event envelope ID.
- `InterModuleEvent.correlation_id`: inter-module event correlation field.
- BullMQ job ID: queue-level delivery ID, distinct from `event_id`.
- Opportunity scan ID: domain ID that can resolve to a workflow through `apps/opportunity/src/routes/workflows.ts`.

## Evidence Reviewed

- `packages/observability/src/step-logger.ts`
- `packages/observability/src/temporal-activities.ts`
- `packages/observability/src/workflow-loader.ts`
- `packages/observability/src/llm-usage.ts`
- `packages/contracts/src/observability/workflow.ts`
- `packages/contracts/src/common/inter-module-event.ts`
- `packages/events/src/emit-event.ts`
- `packages/events/src/routing.ts`
- `apps/dashboard/src/app/core/data-sources/workflow.router.ts`
- `apps/dashboard/src/app/features/workflow/workflow-detail.component.ts`
- `apps/opportunity/src/routes/workflows.ts`
- `__test-run-fecomercio.json`

## Findings

**High: traceability depends on multiple IDs rather than one lineage record.** Operators need to know whether they are holding a Temporal workflow ID, observability UUID, scan ID, event ID, or route ID. These IDs are not automatically interchangeable.

**Medium: Opportunity has the best ID bridge.** `apps/opportunity/src/routes/workflows.ts` can resolve scan IDs to Temporal IDs and then to observability runs. Other modules do not appear to have equivalent domain-ID bridges.

**Medium: dashboard workflow lookup can rely on probing.** `WorkflowDataSourceRouter` can try multiple modules when a module hint is not present. This is convenient but can hide missing module context and produce unnecessary 404s or slow lookups.

**Medium: inter-module events are not first-class children of observability runs.** Events carry `event_id` and `correlation_id`, but a handoff event is not guaranteed to carry `workflow_runs.id` or `temporal_workflow_id`. That makes cross-module reconstruction dependent on payload conventions and logs.

**Low: the Runs page and workflow detail can represent different truths.** Some dashboard run views are mock-backed while workflow detail can use `WORKFLOW_DS` and real observability routes.

**Low: LLM usage attribution depends on execution context.** `observabilityRunId`, `observabilityStepKey`, and related fields need to be threaded through agent calls for usage rows to attach cleanly to steps.

## Improvement Opportunities

- Define a correlation root for the entire lifecycle, preferably one that can be carried through Temporal memos, observability runs, inter-module events, and logs.
- Include `observability_run_id` and `temporal_workflow_id` in durable handoff event payloads where practical.
- Add a shared resolver endpoint or registry for domain IDs to workflow IDs across modules.
- Require dashboard navigation to preserve `moduleId` whenever possible.
- Align mock Runs UI with real workflow observability or clearly label it as mock/sample data.
- Create an operator-facing ID glossary and incident checklist.

## Recommended Next Checks

- Use `__test-run-fecomercio.json` as a fixture to verify `ActiveWorkflow` response shape and dashboard assumptions.
- Trace a live Opportunity scan through Add-Venture and record every ID generated along the way.
- Grep for LLM calls that omit observability context.
- Confirm whether all module workflows call `obsStartRun` with `temporalWorkflowId`.
- Decide whether inter-module event payloads should always include upstream run identifiers.
