# Agent and Workflow Behavior Rules Report

## Executive Summary

Bruce agent behavior is split across `modules/*/agents`, runtime loaders in `packages/agent-runtime`, workflow manifests under `modules/*/workflows`, executable Temporal workflows under `apps/*/src/temporal`, and environment-driven quality settings. The executable behavior is primarily in TypeScript workflows and activities, while many JSON workflow files appear to be design artifacts rather than runtime inputs.

For orchestration agents, the most important gap is that decision rules are not in one place. Retry policies, quality gates, handoff thresholds, constraints, and escalation behavior are spread across schemas, prompts, docs, env vars, and workflow code.

## Rules Inventory

### Agent definition rules

Agent directories under `modules/<module>/agents/<agent>` commonly contain:

- `SKILL.md` for the main behavioral prompt.
- `capabilities.json` for model/provider/runtime metadata.
- `input.schema.json` and `output.schema.json` for structured input/output.
- `tools.json` for declared tools when present.
- `constraints.md` for human-readable rules.
- `examples` for documentation or future eval data.

Runtime loading in `packages/agent-runtime/src/agent-loader.ts` treats `SKILL.md`, capabilities, schemas, and optional tools as primary. `constraints.md` is not automatically enforced unless its constraints are duplicated into schemas, prompts, or workflow logic.

### Agent execution rules

`packages/agent-runtime/src/agent-runner.ts` enforces:

- Input schema parsing before LLM execution.
- Output schema parsing after LLM execution.
- A bounded outer retry loop.
- JSON-mode style input formatting.
- Special output merge behavior for `briefing-interpreter`.

`packages/agent-runtime/src/execute-agent.ts` adds execution events and input/output hashing for observability-style logging.

### Workflow rules

Executable rules are found in:

- `apps/opportunity/src/temporal/workflows.ts`
- `apps/opportunity/src/config/opportunity-quality.ts`
- `apps/opportunity/src/lib/opportunity-screening-helpers.ts`
- `apps/add-venture/src/temporal/workflows.ts`
- `apps/*/src/temporal/workflows.ts` for thin pipeline modules

Design-level or planning-level rules are found in:

- `modules/opportunity/workflows/*.workflow.json`
- `modules/add-venture/workflows/venture-structuring-pipeline.workflow.json`
- `modules/bruce-core/workflows/*.workflow.json`
- `modules/*/workflows/*.workflow.json`

## Findings

**High: JSON workflow manifests do not appear to drive runtime orchestration.** The repo contains rich `*.workflow.json` files, but the implemented behavior is in Temporal TypeScript files. Agents that read the manifests as authoritative may infer behavior that is not actually executed.

**High: Add-Venture manifest and implementation diverge.** `modules/add-venture/workflows/venture-structuring-pipeline.workflow.json` describes parallelism, critique thresholds, iteration, and escalation. `apps/add-venture/src/temporal/workflows.ts` implements a linear sequence through the volume agents, critic, composer, persistence, and completion event.

**Medium: Opportunity behavior is richer in code than in the workflow manifest.** Opportunity screening includes quality retries, candidate variation, thresholds, prioritization, observability steps, and advancement scores that are not fully represented by the simple manifest.

**Medium: `constraints.md` is advisory-only at runtime.** Constraints can be useful to humans and agents, but they are not a reliable source of enforcement unless reflected in schemas or Temporal logic.

**Medium: retry policies exist in multiple forms.** Agent capabilities can describe retry policy, while `AgentRunner` and Temporal `proxyActivities` also define retries. Operators may not know which layer is authoritative.

**Low: shared runtime has agent-specific behavior.** The `briefing-interpreter` merge behavior in the core runner suggests agent-specific contract repair has leaked into generic infrastructure.

## Improvement Opportunities

- Mark workflow JSON files as `design`, `runtime`, or `deprecated` so agents do not confuse intent with implementation.
- Create a behavior-rule catalog per module: inputs, outputs, retry policy, quality gates, handoff conditions, terminal states, and escalation states.
- Move important `constraints.md` rules into schemas, evals, or explicit workflow checks.
- Align retry configuration between capabilities, agent runtime, and Temporal activity policies.
- Remove agent-specific repair logic from shared runtime or document it as a known compatibility shim.
- Make quality gate values visible in the dashboard or a generated report so operators know what caused retry or rejection.

## Recommended Next Checks

- Compare every `modules/*/workflows/*.workflow.json` file to the corresponding `apps/*/src/temporal/workflows.ts`.
- Inventory `constraints.md` files and classify each constraint as enforced, prompt-only, or stale.
- Trace `OPPORTUNITY_*` quality environment variables from `.env.example` into workflow behavior.
- Decide whether `modules/*/workflows` should become a source for generating orchestration docs, tests, or runtime configuration.
