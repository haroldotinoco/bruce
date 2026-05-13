# Evaluation and Agent Quality Coverage Report

## Executive Summary

Bruce has a useful evaluation framework in `packages/evals`, but automated eval coverage is much smaller than the agent surface. The repo contains many agent definitions under `modules/*/agents`, but only two machine-readable `.eval.json` scenarios were found: one for Opportunity and one for Brand-Aid.

The current eval runner is also not a live agent-quality signal by default. `packages/evals/src/run-evals.ts` uses a stubbed `defaultRunAgent`, so CI evals mainly test scoring and scenario plumbing rather than actual LLM/agent behavior. Narrative evaluation files and fixtures exist for several modules, but they are not consumed by the eval runner.

## Coverage Inventory

Framework files:

- `packages/evals/src/cli.ts`
- `packages/evals/src/run-evals.ts`
- `packages/evals/src/score.ts`
- `packages/evals/src/report.ts`
- `packages/evals/src/types.ts`
- `packages/evals/src/score.test.ts`

Machine-readable evals:

- `modules/opportunity/evaluations/market-sizing.eval.json`
- `modules/brand-aid/evaluations/brand-positioning.eval.json`

Narrative or fixture eval material exists under:

- `modules/add-venture/evaluations`
- `modules/builder/evaluations`
- `modules/bruce-core/evaluations`
- `modules/bruce-memory/evaluations`
- `modules/gtm/evaluations`
- `modules/opportunity/evaluations`
- `modules/portfolio/evaluations`

Agent inventory reviewed under:

- `modules/add-venture/agents`
- `modules/brand-aid/agents`
- `modules/builder/agents`
- `modules/bruce-core/agents`
- `modules/bruce-memory/agents`
- `modules/gtm/agents`
- `modules/opportunity/agents`
- `modules/portfolio/agents`
- `modules/startup-ops/agents`

CI reference:

- `.github/workflows/test.yml`
- `todo/09-testing-evals.md`

## Findings

**High: runnable eval coverage is minimal.** Only Opportunity and Brand-Aid have `.eval.json` scenarios. Most modules and most agents have no automated eval scenario despite having agent definitions, schemas, and narrative evaluation materials.

**High: default eval execution is stubbed.** `defaultRunAgent` returns canned or echo-like outputs instead of calling real agents. This means a passing eval does not prove real agent quality unless a live `RunAgentFn` is injected.

**Medium: CI does not make evals a strong gate.** The GitHub workflow runs only the Opportunity eval path on `main`, with `continue-on-error: true`. Brand-Aid, the other module with a `.eval.json`, is not included in the observed CI eval command.

**Medium: semantic scoring is lightweight.** The scoring implementation uses a simple token-overlap style semantic similarity rather than embedding-backed or LLM-judge evaluation described in `todo/09-testing-evals.md`.

**Medium: narrative eval assets are not connected to the runner.** Existing markdown scenarios and fixture JSON files could become a useful eval suite, but today they are mostly documentation.

**Low: Startup-Ops appears to have agents without an evaluations directory.** This leaves a visibility gap for operational-agent quality.

## Improvement Opportunities

- Convert high-value narrative scenarios into `.eval.json`, starting with Opportunity, Add-Venture, Builder, and Portfolio.
- Add one smoke eval per critical handoff-producing agent.
- Wire a live `RunAgentFn` for local or gated CI runs where secrets and cost controls are available.
- Keep stubbed eval mode, but label it as framework validation rather than agent-quality validation.
- Expand CI to run every module that has `.eval.json`.
- Add eval dimensions specifically for handoff correctness: required fields, artifact references, score thresholds, status decisions, and downstream-readiness.
- Promote captured successful runs, such as `__test-run-fecomercio.json`, into golden examples.

## Recommended Next Checks

- Map every production Temporal agent invocation to a corresponding eval or fixture.
- Run `pnpm evals opportunity --report` and `pnpm evals brand-aid --report` to establish baseline report format.
- Review `todo/09-testing-evals.md` and classify items as implemented, partial, or not started.
- Decide which evals should block PRs and which should remain scheduled/non-blocking due to LLM cost or flakiness.
