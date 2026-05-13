# Opportunity Module Events

## Event Catalog

All events emitted by the opportunity module follow the naming pattern: `opportunity.[scope].[action]`

---

### 1. opportunity.scan.started

**When Emitted:** At the beginning of market-scanner agent execution

**Trigger:** `weekly-discovery-cycle` workflow step "market-scan" initiated

**Payload:**
```json
{
  "event_name": "opportunity.scan.started",
  "timestamp": "2024-04-06T06:00:00Z",
  "scan_id": "scan-2024-04-01",
  "scan_cycle_id": "weekly-discovery-cycle-1",
  "scan_themes": ["healthcare-admin", "fintech-compliance"],
  "geographic_scope": ["North America", "Western Europe"],
  "triggered_by": "schedule",
  "schedule_cron": "0 6 * * MON"
}
```

**Severity:** INFO

**Downstream Consumers:** Monitoring systems, logging pipeline

---

### 2. opportunity.scan.completed

**When Emitted:** When market-scanner agent finishes and returns opportunities

**Trigger:** `weekly-discovery-cycle` workflow step "market-scan" completes successfully

**Payload:**
```json
{
  "event_name": "opportunity.scan.completed",
  "timestamp": "2024-04-06T06:45:00Z",
  "scan_id": "scan-2024-04-01",
  "scan_cycle_id": "weekly-discovery-cycle-1",
  "opportunities_found": 14,
  "sources_queried": 127,
  "geographic_coverage": ["North America", "Western Europe"],
  "scan_duration_seconds": 2700,
  "discovery_confidence_distribution": {
    "above_0_8": 4,
    "0_7_to_0_8": 6,
    "0_6_to_0_7": 4
  }
}
```

**Severity:** INFO

**Downstream Consumers:** Opportunity-analyst agent input, metrics aggregation

---

### 3. opportunity.analyzed

**When Emitted:** When opportunity-analyst agent completes analysis of an opportunity

**Trigger:** `weekly-discovery-cycle` workflow step "opportunity-analysis" completes per opportunity

**Payload:**
```json
{
  "event_name": "opportunity.analyzed",
  "timestamp": "2024-04-06T06:50:00Z",
  "opportunity_id": "opp-2024-04-001",
  "scan_cycle_id": "scan-2024-04-01",
  "trace_id": "scan-2024-04-01-opp-001",
  "analyst_version": "opportunity-analyst-v1.1",
  "analysis_complete": true,
  "analysis_quality_score": 0.85,
  "tam_estimate": 28000000000,
  "tam_confidence": 0.78,
  "competitive_count": 8,
  "analysis_duration_seconds": 180,
  "data_gaps": []
}
```

**Severity:** INFO

**Downstream Consumers:** Scoring-agent input, metrics aggregation

---

### 4. opportunity.analysis.failed

**When Emitted:** When opportunity-analyst agent fails to complete analysis

**Trigger:** `weekly-discovery-cycle` workflow step "opportunity-analysis" fails on an opportunity

**Payload:**
```json
{
  "event_name": "opportunity.analysis.failed",
  "timestamp": "2024-04-06T07:30:00Z",
  "opportunity_id": "opp-2024-04-005",
  "scan_cycle_id": "scan-2024-04-01",
  "trace_id": "scan-2024-04-01-opp-005",
  "analyst_version": "opportunity-analyst-v1.1",
  "error_type": "data_unavailable",
  "error_message": "Could not estimate TAM: sources paywalled",
  "retry_count": 2,
  "action_taken": "marked_incomplete",
  "failed_at_step": "opportunity-analysis"
}
```

**Severity:** WARN

**Downstream Consumers:** Error tracking, workflow retry logic, human review escalation

---

### 5. opportunity.scored

**When Emitted:** When scoring-agent agent completes scoring of an opportunity

**Trigger:** `weekly-discovery-cycle` workflow step "opportunity-scoring" completes per opportunity

**Payload:**
```json
{
  "event_name": "opportunity.scored",
  "timestamp": "2024-04-06T07:20:00Z",
  "opportunity_id": "opp-2024-04-001",
  "scan_cycle_id": "scan-2024-04-01",
  "trace_id": "scan-2024-04-01-opp-001",
  "scorer_version": "scoring-agent-v1.0",
  "total_score": 82,
  "recommendation": "advance",
  "dimensions": {
    "market_size": 16,
    "urgency": 22,
    "competition": 18,
    "strategic_fit": 22
  },
  "bonuses_applied": 0,
  "penalties_applied": 0,
  "scoring_duration_seconds": 45
}
```

**Severity:** INFO

**Downstream Consumers:** Prioritization-agent input, metrics aggregation

---

### 6. opportunity.score.complete

**When Emitted:** When all opportunities in a batch have been scored

**Trigger:** `weekly-discovery-cycle` workflow step "opportunity-scoring" completes all items

**Payload:**
```json
{
  "event_name": "opportunity.score.complete",
  "timestamp": "2024-04-06T07:45:00Z",
  "scan_cycle_id": "scan-2024-04-01",
  "opportunities_scored": 14,
  "score_distribution": {
    "75_plus": 3,
    "60_to_74": 6,
    "below_60": 5
  },
  "average_score": 61.2,
  "total_batch_duration_seconds": 900
}
```

**Severity:** INFO

**Downstream Consumers:** Prioritization-agent input, metrics aggregation

---

### 7. opportunity.ranked

**When Emitted:** When prioritization-agent completes ranking of opportunities

**Trigger:** `weekly-discovery-cycle` workflow step "opportunity-prioritization" completes

**Payload:**
```json
{
  "event_name": "opportunity.ranked",
  "timestamp": "2024-04-06T07:50:00Z",
  "scan_cycle_id": "scan-2024-04-01",
  "trace_id": "scan-2024-04-01",
  "opportunities_ranked": 14,
  "advanced_opportunities": 3,
  "reconsider_opportunities": 6,
  "rejected_opportunities": 5,
  "top_opportunity": {
    "opportunity_id": "opp-2024-04-001",
    "title": "AI-powered compliance automation for SMBs",
    "score": 82,
    "rank": 1
  }
}
```

**Severity:** INFO

**Downstream Consumers:** Bruce Core dispatcher, metrics aggregation

---

### 8. opportunity.prioritization.complete

**When Emitted:** When prioritization is fully complete and ready for output

**Trigger:** `weekly-discovery-cycle` workflow step "opportunity-prioritization" finalizes

**Payload:**
```json
{
  "event_name": "opportunity.prioritization.complete",
  "timestamp": "2024-04-06T08:00:00Z",
  "scan_cycle_id": "scan-2024-04-01",
  "cycle_duration_minutes": 120,
  "status": "ready_for_forwarding",
  "output_destinations": ["bruce-core.dispatch"],
  "cycle_summary": {
    "discovered": 14,
    "analyzed": 14,
    "scored": 14,
    "ranked": 14,
    "advancing": 3
  }
}
```

**Severity:** INFO

**Downstream Consumers:** Bruce Core dispatcher, cycle completion tracking

---

### 9. opportunity.cycle.complete

**When Emitted:** When an entire discovery-analysis-scoring-ranking cycle completes

**Trigger:** `weekly-discovery-cycle` workflow step "output-to-bruce-core" completes

**Payload:**
```json
{
  "event_name": "opportunity.cycle.complete",
  "timestamp": "2024-04-06T08:00:00Z",
  "scan_cycle_id": "scan-2024-04-01",
  "cycle_type": "weekly-discovery",
  "total_processing_time_minutes": 120,
  "opportunities_discovered": 14,
  "opportunities_advanced": 3,
  "advancement_rate": 0.21,
  "metrics": {
    "avg_discovery_confidence": 0.76,
    "avg_analysis_quality": 0.82,
    "avg_score": 61.2,
    "source_count": 127
  }
}
```

**Severity:** INFO

**Downstream Consumers:** Metrics aggregation, reporting, audit logs

---

### 10. opportunity.forwarded

**When Emitted:** When opportunities are successfully forwarded to AddVenture module (Bruce Core)

**Trigger:** `weekly-discovery-cycle` workflow step "output-to-bruce-core" successfully emits to queue

**Payload:**
```json
{
  "event_name": "opportunity.forwarded",
  "timestamp": "2024-04-06T08:00:00Z",
  "scan_cycle_id": "scan-2024-04-01",
  "destination_module": "bruce-core",
  "opportunities_forwarded": 3,
  "forwarded_opportunities": [
    "opp-2024-04-001",
    "opp-2024-04-002",
    "opp-2024-04-003"
  ],
  "forwarding_status": "success",
  "message_id": "msg-001234"
}
```

**Severity:** INFO

**Downstream Consumers:** Bruce Core intake, cross-module tracking

---

### 11. opportunity.rejected

**When Emitted:** When an opportunity is rejected (score < 60)

**Trigger:** Scoring-agent completes with "reject" recommendation

**Payload:**
```json
{
  "event_name": "opportunity.rejected",
  "timestamp": "2024-04-06T07:35:00Z",
  "opportunity_id": "opp-2024-04-010",
  "scan_cycle_id": "scan-2024-04-01",
  "trace_id": "scan-2024-04-01-opp-010",
  "score": 10,
  "recommendation": "reject",
  "rejection_reason": "score_below_60",
  "key_factors": [
    "unproven_customer_demand",
    "47_competitors",
    "dominant_incumbent",
    "low_tam_confidence"
  ]
}
```

**Severity:** INFO

**Downstream Consumers:** Archive system, metrics aggregation

---

### 12. opportunity.reconsider

**When Emitted:** When an opportunity scores in the "reconsider" band (60-74)

**Trigger:** Scoring-agent completes with "reconsider" recommendation

**Payload:**
```json
{
  "event_name": "opportunity.reconsider",
  "timestamp": "2024-04-06T07:28:00Z",
  "opportunity_id": "opp-2024-04-006",
  "scan_cycle_id": "scan-2024-04-01",
  "score": 68,
  "recommendation": "reconsider",
  "action_required": "portfolio_review",
  "rationale": "Market emerging but regulatory clarity uncertain"
}
```

**Severity:** WARN

**Downstream Consumers:** Portfolio leadership queue, metrics aggregation

---

## Event Correlation

All events within a single weekly discovery cycle share:
- **scan_cycle_id**: Unique identifier for the 7-day cycle (e.g., "scan-2024-04-01")
- **trace_id**: Unique identifier for an individual opportunity's journey (e.g., "scan-2024-04-01-opp-001")

This allows cross-module tracing of an opportunity's complete path from discovery → analysis → scoring → prioritization → advancement.

## Event Severity Levels

- **INFO**: Standard operational event; no action required
- **WARN**: Attention recommended; reconsider decision or flag for review
- **ERROR**: Processing failed; escalate for human review
- **CRITICAL**: System failure or data integrity issue; immediate escalation required

## Event Retention & Archival

- All events retained for 90 days in hot storage (queryable)
- After 90 days, archived to cold storage (yearly retention)
- Used for quarterly audits and annual scoring calibration
