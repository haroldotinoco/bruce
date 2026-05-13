# Portfolio Module — Correlation IDs

## Overview

The portfolio module participates in distributed traces that span multiple modules. Every review cycle, every decision, and every allocation must be traceable from trigger to effect in Bruce Core.

## ID Types

### `review_cycle_id`
- **Format**: `review-{YYYYMMDD}-{uuid4_short}` — e.g. `review-20260406-a3f9b2`
- **Scope**: A single end-to-end portfolio review cycle (all ventures, all decisions)
- **Created by**: portfolio-review-cycle workflow on start
- **Propagated to**: all steps within the cycle, all emitted events, all produced decisions
- **Persisted in**: module-state (last_review_id), all decision records, the governance report

### `decision_id`
- **Format**: `dec-{venture_id_short}-{YYYYMMDD}-{uuid4_short}` — e.g. `dec-complify-20260406-7c1d`
- **Scope**: A single governance decision for a single venture
- **Created by**: governance-decision-agent when producing a decision
- **Propagated to**: allocation records, kill records, bruce-core handoff payload, human confirmation requests
- **Persisted in**: venture-decision.schema.json, portfolio-to-bruce-core handoff, kill-record (if applicable)

### `allocation_id`
- **Format**: `alloc-{venture_id_short}-{YYYYMMDD}` — e.g. `alloc-complify-20260406`
- **Scope**: A resource allocation adjustment for one venture in one cycle
- **Created by**: allocation-agent
- **Propagated to**: bruce-core handoff, financial tracking systems
- **Persisted in**: allocation-decision.schema.json

### `correlation_id`
- **Format**: UUID v4 — e.g. `f47ac10b-58cc-4372-a567-0e02b2c3d479`
- **Scope**: A single workflow execution (one run of any workflow in this module)
- **Created by**: Temporal.io orchestrator at workflow start
- **Propagated to**: every activity within the workflow, every log line, every emitted event
- **Use**: Join all log lines from a single workflow execution

### `trace_id`
- **Format**: OpenTelemetry W3C Trace Context — 32 hex chars — e.g. `4bf92f3577b34da6a3ce929d0e0e4736`
- **Scope**: End-to-end distributed trace spanning multiple modules (e.g. startup-ops → portfolio → bruce-core)
- **Created by**: The first module in the chain (startup-ops when emitting health report)
- **Propagated via**: HTTP headers (`traceparent`), event payload `metadata.trace_id` field
- **Use**: Trace a venture decision all the way from the metric that triggered it to the lifecycle state change in Bruce Core

## Propagation Rules

```
startup-ops emits health report
  └── trace_id: T1 (originated in startup-ops)
      └── portfolio receives event
            └── review_cycle_id: RC1 created
                correlation_id: C1 created (this workflow run)
                trace_id: T1 propagated
                └── governance-decision-agent produces decision
                      └── decision_id: D1
                          review_cycle_id: RC1
                          correlation_id: C1
                          trace_id: T1
                          └── portfolio emits portfolio-to-bruce-core
                                └── decision_id: D1
                                    trace_id: T1 (bruce-core picks it up)
```

## Structured Log Format

Every log line from the portfolio module must include:

```json
{
  "timestamp": "2026-04-06T14:32:11.204Z",
  "level": "info",
  "module": "portfolio",
  "workflow_id": "portfolio-review-cycle",
  "review_cycle_id": "review-20260406-a3f9b2",
  "correlation_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "venture_id": "complify-001",
  "decision_id": "dec-complify-20260406-7c1d",
  "agent": "governance-decision-agent",
  "message": "Kill decision produced — awaiting human confirmation",
  "decision": "kill",
  "confidence": 0.91
}
```

## Joining Logs Across Modules

To trace a venture decision from metric anomaly to lifecycle change:

```sql
-- All events related to a single decision
SELECT * FROM logs
WHERE trace_id = '4bf92f3577b34da6a3ce929d0e0e4736'
ORDER BY timestamp ASC;

-- All decisions in a review cycle
SELECT * FROM logs
WHERE review_cycle_id = 'review-20260406-a3f9b2'
  AND level IN ('warning', 'error')
ORDER BY timestamp ASC;

-- Full history of a venture across all modules
SELECT * FROM logs
WHERE venture_id = 'complify-001'
ORDER BY timestamp ASC;
```
