# Inter-Module Handoff Integrity Report

## Executive Summary

Bruce has a strong contract foundation under `modules/contracts`, generated TypeScript surfaces under `packages/contracts/src/generated`, and focused Opportunity-to-Add-Venture handoff helpers in `packages/handoff`. The main integrity gap is that the canonical `module-handoff.schema.json` envelope is not the shape that most runtime module-to-module traffic enforces. Runtime orchestration mostly moves through `@bruce/events` using `InterModuleEvent`, dotted event names, and loose payload records.

The highest-risk area is the first production handoff: `opportunity.advanced` from Opportunity into Add-Venture. It has useful validation and metrics, but strict validation is environment-gated, the Zod validator is more permissive than the JSON schema, and payload fallback logic can hide missing handoff data. Later pipeline hops are even looser: several downstream modules construct placeholder inputs rather than validating rich `*-to-*` contract payloads.

## Evidence Reviewed

- `modules/contracts/module-handoff.schema.json`
- `modules/contracts/module-event.schema.json`
- `modules/contracts/opportunity-to-venture.schema.json`
- `modules/contracts/venture-to-brand.schema.json`
- `modules/contracts/venture-to-builder.schema.json`
- `modules/contracts/builder-to-gtm.schema.json`
- `modules/CONTRACT_ARCHITECTURE.txt`
- `packages/contracts/src/common/inter-module-event.ts`
- `packages/contracts/src/generated/contracts`
- `packages/handoff/src/validate.ts`
- `packages/handoff/src/payload.ts`
- `packages/handoff/src/workflow.ts`
- `packages/events/src/emit-event.ts`
- `packages/events/src/routing.ts`
- `apps/opportunity/src/temporal/activities.ts`
- `apps/add-venture/src/services/inter-module-structuring.ts`
- `apps/*/src/services/inter-module.ts`

## Findings

**High: canonical handoff envelope is not the runtime envelope.** `module-handoff.schema.json` defines `handoff_id`, `from_module`, `to_module`, `venture_id`, `payload`, `metadata`, and validation metadata. Runtime inter-module dispatch is generally `InterModuleEvent` with `event_type`, `source_module`, `payload`, `event_id`, and `correlation_id`. This creates two mental models for agents and operators.

**High: Opportunity-to-Venture validation is inconsistent across schema layers.** `opportunity-to-venture.schema.json` uses strict JSON Schema semantics, while `OpportunityToVentureHandoffSchema` in `packages/handoff/src/validate.ts` allows extra keys. A payload can be accepted by runtime Zod validation but fail canonical schema validation later.

**Medium: strict validation is opt-in.** `apps/opportunity/src/temporal/activities.ts` can continue emitting `opportunity.advanced` after validation warnings unless `BRUCE_HANDOFF_VALIDATE_STRICT` is enabled. Add-Venture mirrors this non-strict behavior on consume, so invalid handoffs can still start downstream work.

**Medium: fallback payload resolution can mask upstream contract failures.** `resolveOpportunityFromInterModulePayload` in `packages/handoff/src/payload.ts` can synthesize minimal opportunity data when `venture_handoff` is missing. That helps resilience but weakens handoff integrity because missing upstream data may become an agent-quality issue instead of a clear contract failure.

**Medium: downstream handoffs are mostly not contract-driven.** After `venture.qualified`, modules such as Brand-Aid, Builder, GTM, Startup-Ops, Portfolio, and Bruce-Memory often build default or minimal inputs inside `apps/*/src/services/inter-module.ts`. The published schemas for `venture-to-brand`, `venture-to-builder`, `builder-to-gtm`, and related contracts are not yet the operational source of truth.

**Low: `brand-aid.pipeline.completed` emits without an obvious durable downstream consumer.** Brand-Aid emits a completion event, but `packages/events/src/routing.ts` does not route that event. This may be intentional parallelism, but it should be explicit because the contract architecture implies richer stage handoffs.

**Low: Bruce-Core subscribes to `opportunity.advanced` but only logs.** `apps/bruce-core/src/events/module-event-worker.ts` receives the event through routing but appears to be a stub. That can mislead orchestration agents into assuming core state is updated.

## Improvement Opportunities

- Choose one authoritative inter-module envelope: either adopt the generated handoff envelope in runtime events or document `InterModuleEvent` as the true operational envelope.
- Align JSON Schema and Zod behavior for Opportunity-to-Venture, especially around additional properties and required fields.
- Treat strict validation as the default for staging and production handoffs.
- Make fallback payload resolution visible through a critical metric or fail-fast policy on durable inter-module handoffs.
- Extend runtime validation beyond Opportunity-to-Venture to the later `*-to-*` pipeline contracts.
- Replace placeholder downstream inputs with payloads derived from validated upstream outputs or explicit artifact references.
- Clarify whether Brand-Aid and Builder are parallel independent branches or whether GTM depends on both.

## Recommended Next Checks

- Diff all `modules/contracts/*-to-*.schema.json` files against the payloads actually passed in `apps/*/src/services/inter-module*.ts`.
- Search for runtime imports of `@bruce/contracts/generated` and decide whether generated contracts are intended for app enforcement.
- Trace one real `opportunity.advanced` event through Add-Venture with strict validation both enabled and disabled.
- Decide whether Bruce-Core should persist, validate, or ignore `opportunity.advanced`.
