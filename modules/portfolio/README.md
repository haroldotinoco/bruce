# Portfolio Module

## Objective

The Portfolio module is BruceAI's investment governance engine. It analyzes all active ventures in the portfolio, allocates resources based on performance, and makes the critical scale/iterate/pause/kill decisions on a 2–4 week review cycle. Every decision is structured, auditable, and traced back to data.

The module answers the core governance question: **given what we know about every venture right now, where should we concentrate effort and capital?**

## Agents

| Agent | Provider | Role |
|---|---|---|
| `portfolio-analyst` | anthropic/claude-opus-4-6 | Ingests all venture health reports; produces comparative portfolio analysis ranking ventures by composite health score and identifying patterns |
| `risk-monitor` | openai/o1 | Evaluates portfolio-level risk: concentration, burn vs. runway, co-dependencies between ventures, market correlation |
| `allocation-agent` | openai/gpt-4o | Computes resource allocation recommendations — which ventures get more budget, which get less, which share infrastructure |
| `governance-decision-agent` | anthropic/claude-opus-4-6 | Makes final scale/iterate/pause/kill decisions with full rationale, confidence score, and supporting data references |
| `portfolio-reporter` | anthropic/claude-sonnet-4-6 | Composes the governance report for operators: what was decided, why, and what to watch next cycle |

## Execution Chain

```
[Every 2 weeks / on critical anomaly trigger]
         │
         ▼
portfolio-analyst
  Collect all health reports from startup-ops
  Rank ventures by composite health score
  Identify portfolio patterns and outliers
         │
         ▼
risk-monitor
  Evaluate concentration risk
  Check burn vs. runway across portfolio
  Flag co-dependent ventures
         │
         ▼
allocation-agent
  Compute budget deltas per venture
  Identify resource sharing opportunities
  Produce ranked allocation plan
         │
         ▼
governance-decision-agent
  Make scale/iterate/pause/kill decision per venture
  Apply kill criteria (see decision-policy.md)
  Set confidence scores and next milestones
         │
    ┌────┴────┐
    │ kill?   │ ──yes──▶ human confirmation required
    └────┬────┘
         │ (all others: autonomous)
         ▼
portfolio-reporter
  Compose governance report
  Summarize decisions and rationale
         │
         ▼
emit portfolio-to-bruce-core handoff
  Bruce Core applies decisions to venture state machine
```

## Workflows

| Workflow | Trigger | Description |
|---|---|---|
| `portfolio-review-cycle` | Schedule (every 2 weeks) or critical anomaly event | Full review cycle: analysis → risk → allocation → decisions → report |
| `venture-decision` | On demand (single venture) | Isolated decision pipeline for one venture |
| `resource-allocation` | Post-review | Allocation adjustment execution |
| `kill-process` | After kill decision confirmed | Complete kill sequence including learning extraction |

## Contracts

### Internal
- `portfolio-snapshot.schema.json` — snapshot of all ventures with health scores at review time
- `allocation-decision.schema.json` — resource allocation delta per venture
- `venture-decision.schema.json` — final decision with rationale, confidence, next milestones
- `kill-record.schema.json` — full kill record for archival and learning extraction

### Cross-module (global contracts/)
- **Input**: `startup-ops-to-portfolio.schema.json` — weekly health reports from each venture
- **Output**: `portfolio-to-bruce-core.schema.json` — decisions sent back to Bruce Core

## State

| File | Type | Description |
|---|---|---|
| `state/module-state.schema.json` | Persisted | Portfolio composition, current allocations, review schedule, historical kill/scale counts |
| `state/execution-state.schema.json` | Ephemeral | Current review cycle status, pending human confirmations, decisions in-flight |

## Policies

| Policy | Summary |
|---|---|
| `policies/decision-policy.md` | Kill/scale/iterate/pause criteria, data requirements, human-in-the-loop rules |
| `policies/allocation-policy.md` | Max concentration (40% single venture), minimum allocation, reallocation triggers |
| `policies/review-cadence-policy.md` | Standard 2-week cycle, emergency review triggers, 48h decision SLA |

### Kill Criteria (from decision-policy.md)
A venture is killed when ANY of these are true:
- No meaningful traction 8+ weeks post-launch (< 100 DAU AND < $500 MRR)
- CAC > 2× LTV with no improving trajectory for 6+ consecutive weeks
- Core hypothesis disproven (< 1% conversion with ≥ 1,000 visits/week for 6 weeks)
- Market access confirmed blocked (regulatory, technical, or competitive barrier)
- Burn rate unsustainable with runway < 2 months and no funding path

Kill decisions **always require human operator confirmation** before execution.

## Observability

- `observability/events.md` — all events: portfolio.review.started, venture.decision.made, venture.killed, venture.scaled, resource.allocated
- `observability/metrics.md` — portfolio health distribution, kill/scale/iterate rates, avg cycle duration
- `observability/correlation-ids.md` — review_cycle_id, decision_id, allocation_id format and propagation

## How Orchestration Works End-to-End

1. **Trigger**: Either the 2-week schedule fires, or startup-ops emits a `anomaly.critical` event
2. **Data collection**: portfolio-analyst pulls the latest health report for every active venture from the startup-ops module event bus
3. **Parallel analysis**: risk-monitor runs concurrently with portfolio-analyst (independent inputs)
4. **Sequential decisions**: allocation-agent depends on both analyst + risk outputs; governance-decision-agent depends on allocation
5. **Human gate**: Kill decisions are held in `state/execution-state.schema.json` as `pending_human_confirmations` until an operator responds (48h SLA; unresponded kills default to "pause" not kill)
6. **Emit to Bruce Core**: Each confirmed decision is emitted as a `portfolio-to-bruce-core` handoff, which triggers the appropriate lifecycle transition in Bruce Core's state machine
7. **Learning extraction**: Kill records are automatically sent to bruce-memory for pattern extraction
