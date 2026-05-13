# Portfolio Module Events

## Event Catalog

All events emitted by the portfolio module follow this base structure:

```json
{
  "event_id": "evt_unique_id",
  "event_type": "event.name",
  "triggered_at": "2026-04-06T18:00:00Z",
  "correlation_id": "cycle_20260406_00",
  "severity": "info|warning|error|critical",
  "source": "portfolio-module",
  "payload": { }
}
```

---

## Review Cycle Events

### portfolio.review.started
**Severity**: info
**Payload**:
```json
{
  "cycle_id": "cycle_20260406_00",
  "trigger_type": "scheduled|on-demand|emergency",
  "triggered_by": "scheduler|user_id|anomaly_alert",
  "scope": "full|single_venture",
  "venture_id": "optional_id_if_single_venture",
  "started_at": "2026-04-06T18:00:00Z",
  "expected_duration_hours": 168
}
```
**When**: At start of each review cycle
**Subscribers**: portfolio-reporter, dashboard

### portfolio.review.completed
**Severity**: info
**Payload**:
```json
{
  "cycle_id": "cycle_20260406_00",
  "completed_at": "2026-04-07T18:00:00Z",
  "duration_hours": 24,
  "decisions_count": 4,
  "scale_count": 1,
  "iterate_count": 1,
  "continue_count": 2,
  "kill_count": 0,
  "human_confirmations": 1,
  "report_id": "report_20260406_cycle"
}
```

---

## Venture Decision Events

### venture.decision.made
**Severity**: warning (high-stakes) or info (standard)
**Payload**:
```json
{
  "decision_id": "dec_20260406_001",
  "venture_id": "complify",
  "venture_name": "Complify",
  "decision": "scale|iterate|pause|kill|continue",
  "confidence": 0.90,
  "decided_by": "autonomous|human",
  "decided_by_agent": "governance-decision-agent",
  "decided_at": "2026-04-06T16:45:00Z",
  "review_cycle_id": "cycle_20260406_00",
  "rationale_summary": "Meets all 4 SCALE criteria...",
  "next_review_date": "2026-04-20"
}
```
**When**: After governance-decision-agent completes analysis
**Subscribers**: human-review-gate, portfolio-reporter, bruce-core, venture founder

### venture.decision.emitted
**Severity**: info
**Payload**:
```json
{
  "decision_id": "dec_20260406_001",
  "venture_id": "complify",
  "decision": "scale",
  "new_budget": 18000,
  "new_headcount": 3.0,
  "effective_date": "2026-04-07",
  "emitted_at": "2026-04-07T01:00:00Z",
  "correlation_id": "cycle_20260406_00"
}
```
**When**: After decision approval; sent to bruce-core for execution
**Subscribers**: bruce-core, financial system, operations

---

## Resource Allocation Events

### resource.allocation.planned
**Severity**: info
**Payload**:
```json
{
  "allocation_plan_id": "alloc_20260406_001",
  "cycle_id": "cycle_20260406_00",
  "total_budget_allocated": 44000,
  "total_headcount": 6.2,
  "ventures_affected": 4,
  "changes": [
    {
      "venture_id": "complify",
      "budget_delta": 6000,
      "headcount_delta": 1.0,
      "rationale": "SCALE decision"
    }
  ],
  "concentration_risk": {
    "max_venture_pct": 0.409,
    "exceeds_threshold": true,
    "threshold": 0.40
  }
}
```

### resource.allocated
**Severity**: info
**Payload**:
```json
{
  "allocation_id": "alloc_20260407_exec_001",
  "cycle_id": "cycle_20260406_00",
  "ventures_allocated": 4,
  "total_budget": 44000,
  "allocations": [
    {
      "venture_id": "complify",
      "budget": 18000,
      "headcount": 3.0,
      "effective_from": "2026-04-07"
    }
  ],
  "emitted_at": "2026-04-07T02:00:00Z"
}
```
**When**: After allocation decisions executed
**Subscribers**: bruce-core, finance system, operations

---

## Venture Lifecycle Events

### venture.killed
**Severity**: critical
**Payload**:
```json
{
  "kill_id": "kill_20260323_logify_001",
  "venture_id": "logify",
  "venture_name": "Logify",
  "killed_at": "2026-03-23T10:00:00Z",
  "weeks_lived": 40,
  "decision_id": "dec_20260320_kill_001",
  "kill_reason": "hypothesis_disproven|no_traction|unit_economics_broken|market_blocked|burn_unsustainable|founder_attrition",
  "final_mrr": 320,
  "modules_notified": [
    "startup-ops",
    "bruce-core",
    "bruce-memory",
    "opportunity"
  ],
  "learnings_count": 3
}
```

### venture.scaled
**Severity**: warning
**Payload**:
```json
{
  "venture_id": "complify",
  "decision_id": "dec_20260406_001",
  "scaled_at": "2026-04-07T02:00:00Z",
  "previous_budget": 12000,
  "new_budget": 18000,
  "budget_multiplier": 1.5,
  "previous_headcount": 2.0,
  "new_headcount": 3.0
}
```

### venture.paused
**Severity**: warning
**Payload**:
```json
{
  "venture_id": "venture_id",
  "decision_id": "dec_id",
  "paused_at": "timestamp",
  "pause_duration_days": 60,
  "pause_reason": "string",
  "skeleton_crew_headcount": 0.5,
  "pause_budget": 1200
}
```

---

## Human Review Events

### human.confirmation.requested
**Severity**: warning
**Payload**:
```json
{
  "confirmation_id": "conf_20260406_001",
  "decision_id": "dec_20260406_001",
  "venture_id": "complify",
  "decision_type": "scale|kill|large_pause",
  "requested_at": "2026-04-06T16:45:00Z",
  "deadline": "2026-04-09T16:45:00Z",
  "escalation_level": "portfolio_lead|ceo",
  "context": {
    "confidence": 0.90,
    "rationale": "..."
  }
}
```
**When**: Kill decision or large scale decision requires human confirmation
**Subscribers**: leadership, dashboard, notification system

### human.confirmation.received
**Severity**: warning
**Payload**:
```json
{
  "confirmation_id": "conf_20260406_001",
  "decision_id": "dec_20260406_001",
  "approved": true,
  "confirmed_at": "2026-04-06T14:30:00Z",
  "confirmed_by": "sarah_chen",
  "confirmation_notes": "Exceptional metrics. Strong founder. Approve full scale plan.",
  "time_to_confirm_hours": 22
}
```

### human.confirmation.expired
**Severity**: critical
**Payload**:
```json
{
  "confirmation_id": "conf_id",
  "decision_id": "dec_id",
  "expired_at": "timestamp",
  "decision_revoked": true,
  "escalation_required": true
}
```

---

## Emergency/Alert Events

### portfolio.anomaly.detected
**Severity**: critical
**Payload**:
```json
{
  "anomaly_id": "anom_20260410_001",
  "anomaly_type": "mrr_collapse|retention_drop|burn_increase|churn_spike",
  "venture_id": "complify",
  "metric": "mrr",
  "previous_value": 18000,
  "current_value": 12500,
  "variance_pct": -0.305,
  "threshold": -0.50,
  "detected_at": "2026-04-10T08:00:00Z",
  "triggered_emergency_review": true
}
```

### portfolio.concentration.risk
**Severity**: warning
**Payload**:
```json
{
  "alert_id": "conc_20260406_001",
  "max_venture_id": "complify",
  "max_venture_pct": 0.409,
  "threshold": 0.40,
  "exceeds_by_pct": 0.9,
  "detected_at": "2026-04-06T18:00:00Z",
  "mitigation_options": [
    "cap_at_threshold",
    "reduce_other_ventures",
    "accept_breach_with_monitoring"
  ]
}
```

---

## Analysis Events

### portfolio.analysis.started
**Severity**: info
**Payload**:
```json
{
  "analysis_id": "ana_20260406_001",
  "cycle_id": "cycle_20260406_00",
  "agent": "portfolio-analyst",
  "started_at": "2026-04-06T19:00:00Z",
  "ventures_in_scope": 4
}
```

### portfolio.analysis.completed
**Severity**: info
**Payload**:
```json
{
  "analysis_id": "ana_20260406_001",
  "cycle_id": "cycle_20260406_00",
  "completed_at": "2026-04-06T20:30:00Z",
  "ventures_analyzed": 4,
  "key_findings": [
    "Complify is our strongest performer",
    "ZenNote pivot shows early promise",
    "MetaThink launch imminent",
    "TaskFlow at crossroads"
  ]
}
```

### portfolio.risk.assessed
**Severity**: info
**Payload**:
```json
{
  "risk_assessment_id": "risk_20260406_001",
  "cycle_id": "cycle_20260406_00",
  "agent": "risk-monitor",
  "assessed_at": "2026-04-06T21:30:00Z",
  "portfolio_risk_score": 6,
  "portfolio_risk_level": "moderate",
  "high_risk_ventures": 1,
  "concentration_risk": "high"
}
```

### portfolio.report.generated
**Severity**: info
**Payload**:
```json
{
  "report_id": "report_20260406_cycle",
  "cycle_id": "cycle_20260406_00",
  "generated_at": "2026-04-07T01:00:00Z",
  "decisions_included": 4,
  "allocations_included": 4,
  "page_count": 12
}
```

### portfolio.decisions.emitted
**Severity**: info
**Payload**:
```json
{
  "emission_id": "emit_20260407_001",
  "cycle_id": "cycle_20260406_00",
  "emitted_at": "2026-04-07T02:00:00Z",
  "ventures_decided": 4,
  "decisions_emitted": [
    {
      "venture_id": "complify",
      "decision": "scale",
      "decision_id": "dec_20260406_001"
    }
  ],
  "target_system": "bruce-core"
}
```

---

## Event Retention Policy

- **Transient events** (in-progress reviews): Retained 7 days
- **Decision events**: Retained indefinitely (historical record)
- **Alert events**: Retained 90 days
- **All events**: Searchable by correlation_id, venture_id, cycle_id, decision_id
- **Archive**: Events > 1 year moved to cold storage; still searchable

---

## Event Subscription Model

**Portfolio Dashboard**: Subscribes to all events
**Bruce-Core**: Subscribes to venture.decision.emitted, resource.allocated
**Bruce-Memory**: Subscribes to venture.killed
**Opportunity Module**: Subscribes to portfolio.analysis.completed
**Finance System**: Subscribes to resource.allocated
**Leadership Notifications**: Subscribes to human.confirmation.requested, venture.killed, critical anomalies
