# GTM (Go-To-Market) Module

## Overview
The GTM module orchestrates the complete go-to-market execution for a launched product: from initial channel strategy through content system creation, campaign launches, real-time performance tracking, and weekly governance.

## Module Objectives
1. Select optimal marketing channels based on product, audience, and resource constraints
2. Build scalable content systems with messaging, templates, and calendars
3. Launch and monitor campaigns with A/B testing and budget discipline
4. Interpret performance data and reallocate resources to winning channels
5. Design and prioritize growth experiments
6. Produce weekly governance reports for leadership decision-making

## Agents (6)
- **channel-strategist** — Ranks and selects channels
- **content-system-agent** — Builds messaging matrix, templates, calendars
- **campaign-manager** — Creates campaign briefs, A/B plans, budget allocation
- **analytics-agent** — Interprets performance, identifies winners/losers
- **growth-experimenter** — Designs and prioritizes growth experiments
- **weekly-governance-agent** — Produces governance reports and recommendations

## Key Workflows
- `gtm-strategy.workflow.json` — Strategy definition and channel selection
- `campaign-launch.workflow.json` — Campaign brief → launch execution
- `weekly-performance-review.workflow.json` — Metrics → insights → governance report
- `channel-rebalancing.workflow.json` — CAC-triggered budget reallocation

## State Management
- Active campaigns and channel mix tracked in `module-state.schema.json`
- Execution details (pending content, in-flight campaigns) in `execution-state.schema.json`

## Policies
- **channel-policy.md** — Channel evaluation, kill thresholds, minimum budgets
- **content-policy.md** — Brand voice, approval workflows, cadence
- **budget-policy.md** — Allocation rules, reallocation triggers, spend caps

## Events & Observability
Events: `gtm.strategy.completed`, `campaign.launched`, `campaign.paused`, `channel.killed`, `budget.reallocated`, `weekly-report.generated`

Metrics: CAC per channel, conversion rates, content velocity
