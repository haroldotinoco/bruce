# Dashboard Truth vs Runtime Truth Report

## Executive Summary

The dashboard presents a broad product surface across modules, agents, workflows, metrics, and runs. Runtime truth is narrower. Live data depends on `MODULE_REGISTRY`, environment data-source preferences, token availability, provider wiring, and gateway routes. Several dashboard areas are intentionally or structurally mock-backed even when backend apps exist.

For orchestration, the risk is that users and agents may infer readiness from UI visibility. A module can appear in navigation, manifests, or mocks without being live through HTTP, workers, workflows, and dashboard data sources.

## Visible vs Runtime Truth

Visible sources:

- `apps/dashboard/src/app/core/config/module-registry.ts`
- `apps/dashboard/src/assets/manifests/agents.json`
- `apps/dashboard/src/assets/manifests/modules.json`
- `apps/dashboard/scripts/build-manifests.mjs`
- `apps/dashboard/src/app/layout/sidebar.component.ts`
- `apps/dashboard/src/app/features/*`

Runtime gates:

- `apps/dashboard/src/app/core/data-sources/data-mode.service.ts`
- `apps/dashboard/src/environments/environment.ts`
- `apps/dashboard/src/environments/environment.prod.ts`
- `apps/dashboard/src/app/core/data-sources/providers.ts`
- `apps/dashboard/src/app/core/auth/token.service.ts`
- `apps/dashboard/src/app/core/http/api.service.ts`
- `apps/api-gateway/src/app.ts`

Roadmap/documentation reference:

- `todo/10-gap-and-plans.md`

## Findings

**High: UI visibility does not equal backend readiness.** `MODULE_REGISTRY` makes modules visible as product areas, while provider wiring and `realAvailable` decide what can actually use live data.

**High: many dashboard data sources remain mock-only.** Provider wiring keeps Bruce-Core, metrics, runs, and several module feature data sources on mocks. This can make the product feel complete while live behavior is narrower.

**Medium: real mode can silently downgrade to mock mode.** `DataModeService` requires desired real mode, module `realAvailable`, and an available token. Without all three, the dashboard resolves to mock data.

**Medium: manifest truth is repository truth, not runtime truth.** `build-manifests.mjs` walks `modules/*/agents/*/capabilities.json`. It does not prove an agent is deployed, callable, healthy, evaluated, or wired to a workflow.

**Medium: generated agent metadata can be sparse.** If `capabilities.json` lacks description or capability detail, the dashboard may show incomplete agent cards even though agent folders exist.

**Medium: workflow detail can be real while surrounding pages are mock.** `WORKFLOW_DS` can query live module workflow routes, but other views such as runs or metrics may still be mock-backed.

**Low: production environment config appears dev-shaped.** `environment.prod.ts` uses localhost-style configuration, which can mislead deployment assumptions unless replaced during build.

**Low: `todo/10-gap-and-plans.md` may lag current app scaffolding.** The repository has many new app HTTP files and dashboard files; the roadmap should be treated as a planning document, not runtime evidence.

## Improvement Opportunities

- Create a single module readiness model with fields for navigation, HTTP health, workflow routes, Temporal worker, event worker, dashboard data source, and manifest completeness.
- Display readiness state explicitly in the dashboard instead of inferring readiness from presence in navigation.
- Separate mock/demo data from live operational data in labels and banners.
- Add a real Bruce-Core data source if Bruce-Core is intended to be live in the dashboard.
- Make agent manifests include runtime readiness and evaluation coverage, not just filesystem presence.
- Refresh `todo/10-gap-and-plans.md` against current app and dashboard capabilities.

## Recommended Next Checks

- Trace one live dashboard Opportunity request through `ApiService` to `apps/api-gateway/src/app.ts` and then to `apps/opportunity`.
- Trace one Add-Venture live request the same way.
- Identify every provider in `providers.ts` that is mock-only and decide whether that is intentional for the current milestone.
- Compare `agents.json` with actual `modules/*/agents` after running the manifest build script.
- Compare dashboard workflow models in `apps/dashboard/src/app/core/models/index.ts` with shared observability contracts in `packages/contracts/src/observability`.
