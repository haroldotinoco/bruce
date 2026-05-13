# BruceMemory Correlation IDs

## Overview
Correlation IDs enable tracing of data and requests through the entire BruceMemory system and across BruceAI modules.

## ID Formats and Prefixes

### learning_id
**Format**: `learn-{YYYYMMDD}-{SEQUENCE}`
- Example: `learn-20260405-001`, `learn-20260405-042`
- Scope: Unique per learning record, globally unique
- Lifespan: Indefinite (retained in learning store)
- Usage: Reference in patterns, queries, audit logs

**Generation**: Assigned during learning ingestion validation step

### pattern_id
**Format**: `pat-{SEQUENCE}`
- Example: `pat-001`, `pat-042`
- Scope: Unique per pattern record, globally unique
- Lifespan: Indefinite (retained in pattern store even if deprecated)
- Usage: Reference in snapshots, queries, intelligence outputs

**Generation**: Assigned during pattern extraction when confidence >= 0.6

### snapshot_id
**Format**: `snap-{YYYYMMDD}-{MONTH_NAME}`
- Example: `snap-20260401-april`, `snap-20260501-may`
- Scope: Unique per monthly synthesis, globally unique
- Lifespan: Indefinite (retained for historical reference)
- Usage: Intelligence output, thesis change tracking

**Generation**: Assigned at start of monthly synthesis workflow

### query_id
**Format**: `q-{YYYYMMDD}-{SEQUENCE}` (system-generated) or caller-provided UUID
- Example: `q-20260405-001`, `q-20260405-gtm-001` (if caller-provided)
- Scope: Unique per query, globally unique within 90-day retention window
- Lifespan: 90 days (logs retained for audit, then purged)
- Usage: Query tracing, performance monitoring, gap analysis

**Generation**: Caller can provide custom ID or system generates sequential

### extraction_job_id
**Format**: `extr-{YYYYMMDD}-{SEQUENCE}`
- Example: `extr-20260405-001` (weekly Sunday extraction)
- Scope: Unique per extraction cycle, globally unique
- Lifespan**: 90 days (logs retained for troubleshooting, then purged)
- Usage: Linking learnings processed to patterns extracted, pipeline troubleshooting

**Generation**: Assigned at start of weekly/manual extraction workflow

## Propagation Rules

### Learning → Pattern Lineage
When a pattern is extracted, it includes:
```
pattern: {
  pattern_id: "pat-003",
  evidence_venture_ids: ["v-001", "v-002", "v-003"],
  supporting_learning_record_ids: [
    "learn-20260331-015",
    "learn-20260402-008",
    "learn-20260403-021",
    ...
  ]
}
```

**Propagation**: Pattern stores references to all learning_ids that provided evidence.

### Pattern → Intelligence Snapshot Lineage
When intelligence snapshot created:
```
snapshot: {
  snapshot_id: "snap-20260401-april",
  key_patterns: [
    {
      pattern_id: "pat-001",
      confidence: 0.87,
      evidence_count: 8,
      supporting_learning_record_count: 18
    },
    ...
  ]
}
```

**Propagation**: Snapshot stores references to pattern_ids included.

### Query → Pattern Lineage
When query returns patterns:
```
response: {
  query_id: "q-20260405-001",
  relevant_patterns: [
    {
      pattern_id: "pat-003",
      statement: "...",
      supporting_learning_record_ids: [
        "learn-20260331-015",
        "learn-20260402-008",
        ...
      ]
    }
  ]
}
```

**Propagation**: Query response includes pattern_ids and underlying learning_ids.

## Trace Scenarios

### Scenario 1: Trace Learning to Pattern to Query
1. Portfolio module submits learning: `learn-20260405-042` (TruckRoute Pro kill postmortem)
2. Learning ingested and stored with embedding
3. Weekly extraction runs: `extr-20260407-001` processes learning
4. Pattern extracted: `pat-003` (supply chain domain expertise) includes `learn-20260405-042` in supporting evidence
5. Monthly synthesis: `snap-20260501-april` includes `pat-003` in key_patterns
6. Opportunity module queries: `q-20260506-002` ("supply chain SaaS patterns")
7. Query returns `pat-003` with full lineage back to `learn-20260405-042`

**Complete trace**: `learn-20260405-042` → `extr-20260407-001` → `pat-003` → `snap-20260501-april` → `q-20260506-002`

### Scenario 2: Trace Query Back to Source Learning
Opportunity module receives pattern result from query and wants to understand evidence:

1. Query result includes: `query_id: q-20260405-001`, `pattern_id: pat-001`
2. Lookup pattern metadata: `pat-001` includes `supporting_learning_record_ids: [learn-20260405-001, learn-20260402-015, ...]`
3. Retrieve learning details from learning store
4. Understand specific ventures and data behind pattern
5. Validate relevance for their current decision

**Reverse trace**: `q-20260405-001` → `pat-001` → `[learn-20260405-001, learn-20260402-015, ...]`

### Scenario 3: Audit Trail for Intelligence Snapshot
Leadership wants to understand basis for monthly intelligence snapshot:

1. Snapshot: `snap-20260501-april` includes strategic implication: "Unit economics validation by week 8"
2. Trace back to source: `pat-001` (confidence 0.87) and `pat-004` (confidence 0.81)
3. Lookup pattern evidence: `pat-001` supports `[v-001, v-002, v-004]` (8 learning records)
4. Retrieve specific learning records to validate claim
5. Understand venture data and outcomes supporting intelligence

**Audit trace**: `snap-20260501-april` → `pat-001` → `[learn-20260401-001, learn-20260330-042, ...]`

## Storage and Retrieval

### Primary Key Indexes
- **learning_id**: Full-text search on narrative, tags, venture_id
- **pattern_id**: Index on confidence, status, applicability_scope
- **snapshot_id**: Index on period_start, period_end
- **query_id**: Index on requesting_module, timestamp

### Cross-Reference Indexes
- **pattern.supporting_learning_record_ids**: Index by pattern_id → learning_ids
- **snapshot.key_patterns**: Index by snapshot_id → pattern_ids
- **query_response.relevant_patterns**: Index by query_id → pattern_ids

### Retention and Cleanup
- **learning_id**: Retained indefinite (audit trail)
- **pattern_id**: Retained indefinite (pattern store immutable)
- **snapshot_id**: Retained indefinite (intelligence history)
- **query_id**: Retained 90 days, then logs purged (but pattern/learning references persist)
- **extraction_job_id**: Retained 90 days, then logs purged

## Implementation Notes

### ID Collision Prevention
- Sequential IDs use date + counter: ensures no collisions within single day
- Custom IDs from callers must be validated (UUID v4 recommended)
- Pattern IDs use global counter (not date-based) to ensure monotonic ordering

### ID Visibility in Outputs
- Learning IDs: Visible in pattern evidence, never exposed in external intelligence
- Pattern IDs: Visible in snapshots, queries, and intelligence (anonymized venture references)
- Snapshot IDs: Visible to leadership and authorized modules only
- Query IDs: Logged for 90 days, visible to caller and ops team

### Logging and Monitoring
All events include correlation IDs for full trace-through:
```
event: bruce-memory.pattern.extracted
pattern_id: pat-003
extraction_job_id: extr-20260407-001
supporting_learning_ids: [learn-20260405-042, learn-20260402-015]
timestamp: 2026-04-07T03:15:22Z
```

This enables complete lineage tracking from event bus logs.
