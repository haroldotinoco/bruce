# Opportunity Module Correlation IDs

## Overview

Correlation IDs enable end-to-end tracing of opportunities through the discovery, analysis, scoring, prioritization, and advancement pipeline. They are essential for debugging, auditing, and understanding the complete lifecycle of each opportunity.

---

## Correlation ID Structure

### scan_cycle_id

**Format:** `scan-YYYY-MM-DD`

**Example:** `scan-2024-04-01`

**Scope:** All opportunities discovered in a single discovery cycle (7-day period)

**Generation:** Created at the start of `weekly-discovery-cycle` workflow

**Propagation:** Included in all events and data records for the entire week

**Lifetime:** Valid from discovery cycle start until forwarding to AddVenture

**Usage:**
```json
{
  "scan_cycle_id": "scan-2024-04-01",
  "opportunities_in_cycle": 14,
  "cycle_start": "2024-04-01T06:00:00Z",
  "cycle_end": "2024-04-01T08:00:00Z"
}
```

---

### opportunity_id

**Format:** `opp-YYYY-MM-SEQUENCE`

**Example:** `opp-2024-04-001` (first opportunity discovered on April 2024)

**Scope:** Unique identifier for a single opportunity, persistent across its entire lifecycle

**Generation:** Created during market-scanner discovery phase

**Propagation:** Included in all events, analysis, scoring, and prioritization records for that opportunity

**Lifetime:** Valid from discovery through advanced status (and beyond if rejected/reconsidered)

**Usage:**
```json
{
  "opportunity_id": "opp-2024-04-001",
  "title": "AI-powered compliance automation for SMBs",
  "first_seen": "2024-04-06T06:00:00Z",
  "lifecycle_stage": "advanced"
}
```

---

### trace_id

**Format:** `{scan_cycle_id}-{opportunity_id}` OR `{scan_cycle_id}-opp-SEQUENCE`

**Example:** `scan-2024-04-01-opp-001`

**Scope:** Unique trace for a single opportunity's journey through the entire pipeline in a single cycle

**Generation:** Created when opportunity enters analysis phase (inherited from scan_cycle_id + opportunity_id)

**Propagation:** Included in all step-level events:
- opportunity.analyzed
- opportunity.scored
- opportunity.ranked
- opportunity.advanced/rejected/reconsider
- opportunity.forwarded

**Lifetime:** Valid throughout the opportunity's processing in that cycle; re-used if opportunity re-evaluated in future cycle

**Usage Example:**
```
Timeline of trace_id: scan-2024-04-01-opp-001

06:00 — event: opportunity.scan.started (scan_cycle_id: scan-2024-04-01)
06:45 — event: opportunity.scan.completed (scan_cycle_id: scan-2024-04-01)
06:50 — event: opportunity.analyzed (trace_id: scan-2024-04-01-opp-001)
07:20 — event: opportunity.scored (trace_id: scan-2024-04-01-opp-001)
07:50 — event: opportunity.ranked (trace_id: scan-2024-04-01-opp-001)
08:00 — event: opportunity.forwarded (scan_cycle_id: scan-2024-04-01)
```

---

## Correlation ID Propagation Rules

### Rule 1: scan_cycle_id Propagates Through Entire Cycle

Every opportunity discovered in a cycle carries its scan_cycle_id through all processing steps:

```
market-scanner → opportunity-analyst → scoring-agent → prioritization-agent → bruce-core
                    ↓ scan_cycle_id included in all events & payloads
```

### Rule 2: opportunity_id Persists Across Lifecycles

An opportunity retains its opportunity_id even if:
- Re-evaluated in a future cycle
- Rejected and later reconsidered
- Advanced then de-prioritized for resource reasons

Example:
```
Cycle 1 (scan-2024-04-01): opp-2024-04-001 scored 72, marked "reconsider"
Cycle 2 (scan-2024-04-08): opp-2024-04-001 re-analyzed, new trace_id: scan-2024-04-08-opp-001, rescored 78, advanced
```

### Rule 3: trace_id Unique Per Cycle per Opportunity

If an opportunity is re-evaluated in a future cycle, it receives a new trace_id reflecting the new cycle:

```
Cycle 1: trace_id = scan-2024-04-01-opp-001
Cycle 2: trace_id = scan-2024-04-08-opp-001 (same opportunity_id, new trace_id)
```

### Rule 4: All Downstream Events Include Both IDs

Any event emitted after opportunity-analysis includes both scan_cycle_id AND trace_id for full traceability:

```json
{
  "event_name": "opportunity.scored",
  "scan_cycle_id": "scan-2024-04-01",
  "opportunity_id": "opp-2024-04-001",
  "trace_id": "scan-2024-04-01-opp-001",
  "timestamp": "2024-04-06T07:20:00Z"
}
```

---

## Correlation ID Usage in Queries & Logs

### Query by scan_cycle_id
**Purpose:** Understand all opportunities processed in a specific weekly cycle

```sql
SELECT * FROM opportunities
WHERE scan_cycle_id = 'scan-2024-04-01'
```

**Returns:**
- All 14 opportunities discovered in that cycle
- Their discovery confidence, analysis quality, scores, recommendations
- Enables cycle-level reporting and metrics

### Query by opportunity_id
**Purpose:** Understand complete lifecycle of a single opportunity

```sql
SELECT * FROM events
WHERE opportunity_id = 'opp-2024-04-001'
ORDER BY timestamp
```

**Returns:**
- Every event in the opportunity's lifecycle:
  - Discovery (scan.completed)
  - Analysis (analyzed)
  - Scoring (scored)
  - Prioritization (ranked)
  - Advancement (forwarded)
- Enables opportunity-level audit trail

### Query by trace_id
**Purpose:** Debug a specific opportunity's processing in a specific cycle

```sql
SELECT * FROM events
WHERE trace_id = 'scan-2024-04-01-opp-001'
```

**Returns:**
- All step-level events for that opportunity in that cycle
- Timestamps, agent versions, scores, decisions
- Enables detailed debugging of why a decision was made

---

## Practical Example: End-to-End Tracing

### Scenario: Compliance Automation Opportunity Advanced to AddVenture

**Journey Timeline with Correlation IDs:**

```
STEP 1: DISCOVERY
Time: 2024-04-06T06:00:00Z
Event: opportunity.scan.started
Correlation IDs:
  - scan_cycle_id: scan-2024-04-01
  - opportunity_id: TBD (not yet created)
Payload: scan themes, filters, geography

STEP 2: OPPORTUNITY FOUND
Time: 2024-04-06T06:30:00Z
Event: opportunity.scan.completed
Correlation IDs:
  - scan_cycle_id: scan-2024-04-01
  - opportunity_id: opp-2024-04-001 (CREATED)
  - trace_id: scan-2024-04-01-opp-001 (CREATED)
Payload: discovered opportunities including our compliance automation opportunity

STEP 3: ANALYSIS BEGINS
Time: 2024-04-06T06:45:00Z
Event: opportunity.analyzed
Correlation IDs:
  - scan_cycle_id: scan-2024-04-01
  - opportunity_id: opp-2024-04-001
  - trace_id: scan-2024-04-01-opp-001
Payload: market size, competitive landscape, analysis quality 0.85

STEP 4: SCORING
Time: 2024-04-06T07:20:00Z
Event: opportunity.scored
Correlation IDs:
  - scan_cycle_id: scan-2024-04-01
  - opportunity_id: opp-2024-04-001
  - trace_id: scan-2024-04-01-opp-001
Payload: dimension scores (16, 22, 18, 22), total score 82, recommendation "advance"

STEP 5: PRIORITIZATION
Time: 2024-04-06T07:50:00Z
Event: opportunity.ranked
Correlation IDs:
  - scan_cycle_id: scan-2024-04-01
  - opportunity_id: opp-2024-04-001
  - trace_id: scan-2024-04-01-opp-001
Payload: rank 1 among 14 opportunities in cycle

STEP 6: FORWARDING TO AddVenture
Time: 2024-04-06T08:00:00Z
Event: opportunity.forwarded
Correlation IDs:
  - scan_cycle_id: scan-2024-04-01
  - opportunity_id: opp-2024-04-001
  - trace_id: scan-2024-04-01-opp-001
  - destination_module: bruce-core / AddVenture
Payload: forwarded to queue with full analysis, scoring, ranking context

STEP 7: ADDVENTURE INTAKE (Cross-Module)
Time: 2024-04-06T08:05:00Z
Event: venture.received (in AddVenture module)
Correlation IDs:
  - source_module: opportunity
  - scan_cycle_id: scan-2024-04-01 (PROPAGATED)
  - opportunity_id: opp-2024-04-001 (PROPAGATED)
  - venture_id: NEW (AddVenture creates its own ID)
Payload: receives opportunity data with all upstream context
```

### Querying This Journey

**To understand why this opportunity advanced:**
```
SELECT * FROM events WHERE opportunity_id = 'opp-2024-04-001' ORDER BY timestamp
```

Returns: Complete timeline from discovery → advanced, including all scores and decisions

**To understand the full cycle this opportunity was part of:**
```
SELECT * FROM opportunities WHERE scan_cycle_id = 'scan-2024-04-01'
```

Returns: All 14 opportunities in the cycle, showing this one's rank relative to others

**To debug the scoring decision for this opportunity:**
```
SELECT * FROM events WHERE trace_id = 'scan-2024-04-01-opp-001'
```

Returns: Only the events for this opportunity in this cycle, enabling detailed review of scoring logic

---

## Cross-Module Correlation

### Opportunity → AddVenture

When an opportunity advances to AddVenture module:

**Correlation ID Handoff:**
```json
{
  "from_module": "opportunity",
  "to_module": "bruce-core/addventure",
  "opportunity_id": "opp-2024-04-001",
  "scan_cycle_id": "scan-2024-04-01",
  "opportunity_data": { ... },
  "opportunity_module_context": {
    "discovery_confidence": 0.82,
    "analysis_quality": 0.85,
    "final_score": 82,
    "recommendation": "advance",
    "competitive_landscape": { ... }
  }
}
```

**AddVenture Uses:**
- opportunity_id: To track back to discovery context
- scan_cycle_id: To understand discovery timing/context
- Creates new venture_id for next phase

**Trace Continuation:** If AddVenture creates a venture from this opportunity, it propagates:
- opportunity_id: Links venture back to discovery
- scan_cycle_id: Enables full audit trail from discovery to venture

---

## Logging Integration

### Structured Logging Format

All logs include correlation IDs in structured format:

```
[2024-04-06T07:20:00Z] [INFO] [opportunity.scored]
  scan_cycle_id=scan-2024-04-01
  opportunity_id=opp-2024-04-001
  trace_id=scan-2024-04-01-opp-001
  agent=scoring-agent-v1.0
  score=82
  recommendation=advance
  message="Opportunity scored; advancing to prioritization"
```

### Distributed Tracing Headers

For HTTP/gRPC cross-service calls, include correlation IDs:

```
X-Trace-ID: scan-2024-04-01-opp-001
X-Request-ID: opp-2024-04-001
X-Scan-Cycle: scan-2024-04-01
```

---

## Best Practices

1. **Always include scan_cycle_id in batch operations** — Enables cycle-level analysis
2. **Always include trace_id in step-level events** — Enables opportunity-level debugging
3. **Preserve opportunity_id across re-evaluations** — Maintains history even if reconsidered later
4. **Log both IDs in every event** — Enables flexible querying by cycle, opportunity, or trace
5. **Propagate to downstream modules** — AddVenture, GTM, and other modules can trace back to discovery
6. **Use in alerts & escalations** — Include relevant IDs when escalating decisions to human review

---

## Troubleshooting & Audit

### Example: "Why was this opportunity advanced?"

1. Note opportunity_id: opp-2024-04-001
2. Query: `SELECT * FROM events WHERE opportunity_id = 'opp-2024-04-001'`
3. Review: See discovery → analysis → scoring → advancement timeline
4. Debug score: Use trace_id to find scoring event with dimension breakdown

### Example: "How many opportunities advanced in April?"

1. Find all scan_cycle_ids for April: scan-2024-04-01, scan-2024-04-08, scan-2024-04-15, scan-2024-04-22, scan-2024-04-29
2. Query: `SELECT * FROM opportunities WHERE scan_cycle_id IN (...) AND recommendation = 'advance'`
3. Aggregates: Count, average score, vertical distribution, etc.

### Example: "This opportunity was re-evaluated twice; show both cycles"

1. Note opportunity_id: opp-2024-04-005
2. Query: `SELECT * FROM events WHERE opportunity_id = 'opp-2024-04-005'`
3. See: Two trace_ids (scan-2024-04-01-opp-005, scan-2024-04-08-opp-005)
4. Compare: Scores, recommendations, rationale between cycles

---

## Retention & Archival

- **Hot storage (queryable):** All correlation IDs for 90 days
- **Cold storage (archive):** All correlation IDs for 2 years
- **Enables:** Quarterly audits, annual calibration, historical trend analysis
