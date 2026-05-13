# Event Routing and Subscriber Coverage Report

## Executive Summary

Durable inter-module routing is centralized in `packages/events`: `emitEvent` validates an `InterModuleEvent`, resolves subscribers from `DEFAULT_EVENT_ROUTING`, and enqueues one BullMQ job per subscriber queue. App workers consume `bruce-events-<module>` queues through `createModuleEventWorker`.

The topology is readable but not fully governed. Several events are emitted with no default route and with no-subscriber warnings suppressed. `bruce-core` is listed as a subscriber for `opportunity.advanced` but currently behaves as a logging stub. Worker handlers often return successfully when the event type does not match, which makes unexpected routing a silent no-op.

## Event Topology

Durable routing is defined in `packages/events/src/routing.ts`:

- `opportunity.advanced` routes to `add-venture` and `bruce-core`.
- `venture.qualified` routes to `brand-aid` and `builder`.
- `builder.pipeline.completed` routes to `gtm`.
- `gtm.pipeline.completed` routes to `startup-ops`.
- `startup-ops.pipeline.completed` routes to `portfolio`.
- `portfolio.pipeline.completed` routes to `bruce-memory`.

Emitters reviewed:

- `apps/opportunity/src/temporal/activities.ts` emits `opportunity.advanced`.
- `apps/add-venture/src/temporal/activities.ts` emits `venture.qualified`.
- `apps/brand-aid/src/temporal/activities.ts` emits `brand-aid.pipeline.completed`.
- `apps/builder/src/temporal/activities.ts` emits `builder.pipeline.completed`.
- `apps/gtm/src/temporal/activities.ts` emits `gtm.pipeline.completed`.
- `apps/startup-ops/src/temporal/activities.ts` emits `startup-ops.pipeline.completed`.
- `apps/portfolio/src/temporal/activities.ts` emits `portfolio.pipeline.completed`.
- `apps/bruce-memory/src/temporal/activities.ts` emits `bruce-memory.pipeline.completed`.

Consumers reviewed:

- `apps/add-venture/src/events/module-event-worker.ts` handles `opportunity.advanced`.
- `apps/bruce-core/src/events/module-event-worker.ts` receives `opportunity.advanced` but logs only.
- `apps/brand-aid/src/events/module-event-worker.ts` handles `venture.qualified`.
- `apps/builder/src/events/module-event-worker.ts` handles `venture.qualified`.
- `apps/gtm/src/events/module-event-worker.ts` handles `builder.pipeline.completed`.
- `apps/startup-ops/src/events/module-event-worker.ts` handles `gtm.pipeline.completed`.
- `apps/portfolio/src/events/module-event-worker.ts` handles `startup-ops.pipeline.completed`.
- `apps/bruce-memory/src/events/module-event-worker.ts` handles `portfolio.pipeline.completed`.

## Findings

**Medium: some emitted events are intentionally or accidentally unrouted.** `brand-aid.pipeline.completed` and `bruce-memory.pipeline.completed` are emitted, but no default subscribers are listed. If those are terminal signals, they need explicit documentation. If they are meant to continue orchestration, the chain is incomplete.

**Medium: Bruce-Core is a routed no-op for `opportunity.advanced`.** Routing says Bruce-Core is a subscriber, but the worker currently logs a stub message. That creates a false sense that the event updates core state or dispatch history.

**Medium: Brand-Aid and Builder run in parallel, but only Builder continues the chain.** `venture.qualified` fans out to both modules. GTM starts from `builder.pipeline.completed`, not from Brand-Aid output. If GTM strategy depends on brand positioning, the current route graph does not enforce that dependency.

**Low: unexpected event types can be acknowledged as success.** Module workers typically ignore event types that do not match their expected event. Because the handler returns normally, BullMQ treats the job as complete rather than a routing error.

**Low: there are multiple event systems.** Durable BullMQ routing, `getEventBus()` pub/sub events, and agent runtime `emitEvent(..., { skipQueue: true })` all coexist. Agents and operators need a clear distinction between durable workflow triggers and telemetry-style events.

**Low: no-subscriber warnings are commonly suppressed.** Several completion emitters pass `warnWhenNoSubscribers: false`. This is useful for terminal events, but it also reduces drift detection.

## Improvement Opportunities

- Create a generated or reviewed inventory of all `emitEvent` event names and compare it to `DEFAULT_EVENT_ROUTING`.
- Classify every emitted event as `durable trigger`, `terminal signal`, or `telemetry`.
- Remove Bruce-Core from `opportunity.advanced` routing until it performs real work, or implement the expected core-side behavior.
- Add metrics for ignored event types inside module workers.
- Decide whether GTM should depend on Builder only or on both Builder and Brand-Aid.
- Enable no-subscriber warnings in development and CI-like environments for non-terminal events.
- Add routing tests that fail when a new durable event is emitted without a documented subscriber policy.

## Recommended Next Checks

- Trace a complete lifecycle from `opportunity.advanced` through `portfolio.pipeline.completed` and confirm which events are visible in BullMQ.
- Inspect DLQ counts for `bruce-events-*` queues to discover misrouted or malformed events.
- Decide whether `brand-aid.pipeline.completed` should be a terminal product signal, a GTM prerequisite, or a dashboard-only event.
- Inventory `getEventBus().emit` and `emitEvent(...skipQueue)` call sites separately from BullMQ routing.
