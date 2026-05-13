# Documentation Drift and Operator Golden Path Report

## Executive Summary

Bruce has several overlapping operational narratives: `README.md`, `LOCAL_TEST.md`, `todo/QUICK_START.md`, roadmap phase docs, `.env.example`, root scripts, and CI/test configuration. They mostly agree on the core stack: pnpm, Docker services, Postgres migrations, Temporal, dev JWT auth, Bruce-Core, and Opportunity. Drift appears in how to start services, how auth should be configured, whether Redis event bus is default, which tests truly run, and which modules are considered scaffolded versus implemented.

The operator golden path should become a single canonical runbook. Today, an agent or human can follow different docs and arrive at different assumptions about which processes to run, which env vars are required, and which tests provide confidence.

## Drift Findings

**Medium: multiple startup paths compete.** `LOCAL_TEST.md` emphasizes `pnpm dev` and optional `pnpm workers`, while `todo/QUICK_START.md` describes running Bruce-Core and Opportunity in separate filtered `tsx` commands. Both can be valid, but the docs do not clearly explain when to choose each.

**Medium: event bus default is ambiguous.** Code in `packages/events/src/event-bus.ts` falls back to in-memory behavior unless Redis mode and `REDIS_URL` are configured. `.env.example` points users toward Redis-style local behavior. The docs should distinguish code defaults from recommended multi-process local defaults.

**Medium: auth docs are split.** `todo/QUICK_START.md` describes dev JWT behavior when Clerk is not configured. `LOCAL_TEST.md` adds nuance around `AUTH_DEV_JWT_ONLY`. These should be merged to avoid token confusion.

**Medium: integration E2E scripts require more env than the script name implies.** Root scripts include integration and E2E variants, but real HTTP E2E depends on flags and tokens such as `BRUCE_E2E_INTEGRATION` and `BRUCE_E2E_TOKEN`.

**Medium: Vitest workspace may not include every package with tests.** `vitest.workspace.ts` enumerates many projects, while some package-level configs may sit outside that list. This can lead to false confidence from `pnpm test`.

**Medium: roadmap docs may lag the current working tree.** `todo/10-gap-and-plans.md` describes several apps as scaffold-only, while the tree includes new app, route, middleware, OpenAPI, Temporal, and dashboard files. The roadmap should be refreshed after the current implementation settles.

**Low: variable capture examples are inconsistent.** Some docs show `jq` extraction of job/workflow IDs; others reference variables like `JOB_ID` or `WORKFLOW_ID` without always showing the capture step nearby.

## Golden Path Narrative

1. Install dependencies with `pnpm install`.
2. Start infra with `pnpm run infra:up`.
3. Copy `.env.example` to `.env` and choose an explicit local mode for auth, event bus, Temporal workers, and LLM keys.
4. Run database migrations with `pnpm --filter @bruce/db run db:migrate`.
5. Generate a dev token using `scripts/print-dev-jwt.mjs` when running in dev JWT mode.
6. Start the minimal vertical slice first: Bruce-Core, Opportunity, Temporal, Postgres, Redis.
7. Verify `/health` for the target services.
8. Run an Opportunity scan and poll its job/workflow status.
9. If testing cross-module orchestration, run Add-Venture and its event worker, then verify `opportunity.advanced` starts structuring.
10. Use Temporal UI and workflow routes to confirm status before expanding to Brand-Aid, Builder, GTM, Startup-Ops, Portfolio, and Bruce-Memory.

## Improvement Opportunities

- Merge `LOCAL_TEST.md` and `todo/QUICK_START.md` into one decision-oriented operator runbook, or clearly label one as quick vertical smoke and the other as full-stack local testing.
- Add a startup matrix: command, modules started, ports, workers, required env, and expected use case.
- Add an auth matrix: Clerk mode, dev JWT mode, `AUTH_DEV_JWT_ONLY`, expected token source, and common failure symptoms.
- Add an event bus matrix: in-memory, Redis pub/sub, BullMQ queues, and which flows use each.
- Refresh `todo/10-gap-and-plans.md` after current branch work is finalized.
- Align `vitest.workspace.ts`, root scripts, and CI so “test” means the same thing locally and in automation.
- Add DLQ and event replay steps to the runbook.

## Recommended Next Checks

- Walk the docs from a clean checkout and record every missing env var, undefined variable, or port mismatch.
- Compare root `package.json` scripts to the commands shown in `README.md`, `LOCAL_TEST.md`, and `todo/QUICK_START.md`.
- Confirm which apps `pnpm dev` actually starts through Turbo.
- Confirm whether `pnpm test` includes all package-level Vitest configs that should be part of the default suite.
- Update the roadmap only after deciding which new untracked app/dashboard files are part of the intended implementation baseline.
