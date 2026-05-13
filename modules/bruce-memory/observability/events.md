# BruceMemory Events

## Event Catalog

All events emitted by bruce-memory module for observability and inter-module communication.

### Learning Ingestion Events

#### bruce-memory.learning.validation-started
**Trigger**: Validation step begins for incoming learning record
**Payload**: `{ query_id, venture_id, source_module, timestamp }`
**Severity**: INFO
**Consumed By**: Logging, monitoring
**Retention**: 90 days
**Frequency**: Per learning record

#### bruce-memory.learning.ingested
**Trigger**: Learning record successfully validated, normalized, and stored
**Payload**: `{ learning_id, venture_id, source_module, quality_score, confidence, timestamp }`
**Severity**: INFO
**Consumed By**: Pattern extractor, query agent, monitoring
**Retention**: Indefinite
**Frequency**: Per successful ingestion
**Note**: This event signals availability of new learning for pattern extraction

#### bruce-memory.learning.rejected
**Trigger**: Learning record failed validation (low confidence, missing metadata, duplicate)
**Payload**: `{ learning_id, venture_id, source_module, rejection_reason, confidence, timestamp }`
**Severity**: WARNING
**Consumed By**: Logging, source module (for feedback), monitoring
**Retention**: 180 days
**Frequency**: Per rejected learning
**Note**: Rejection reason included for human review

### Pattern Extraction Events

#### bruce-memory.extraction.started
**Trigger**: Weekly pattern extraction workflow begins
**Payload**: `{ extraction_job_id, lookback_weeks, learnings_to_analyze, timestamp }`
**Severity**: INFO
**Consumed By**: Monitoring, alerting
**Retention**: 90 days
**Frequency**: Weekly (Sundays 3 AM)

#### bruce-memory.pattern.extracted
**Trigger**: New pattern published to pattern store
**Payload**: `{ pattern_id, statement, evidence_ventures, confidence, evidence_count, applicability_scope, timestamp }`
**Severity**: INFO
**Consumed By**: Intelligence synthesizer, query agent, monitoring, cross-venture analyst
**Retention**: Indefinite
**Frequency**: Variable (0-50 per week)
**Note**: Multiple patterns can be extracted in single cycle

#### bruce-memory.pattern.rejected
**Trigger**: Candidate pattern did not meet publication threshold
**Payload**: `{ pattern_statement, evidence_count, confidence, reason_rejected, timestamp }`
**Severity**: INFO
**Consumed By**: Monitoring, analysts (for gap analysis)
**Retention**: 90 days
**Frequency**: Variable (0-20 per week)

#### bruce-memory.extraction.completed
**Trigger**: Weekly pattern extraction workflow finished (success or partial success)
**Payload**: `{ extraction_job_id, patterns_extracted, patterns_updated, learnings_processed, duration_seconds, timestamp }`
**Severity**: INFO
**Consumed By**: Monitoring, alerting, reporting
**Retention**: 90 days
**Frequency**: Weekly (Sundays)

#### bruce-memory.extraction.skipped
**Trigger**: Weekly extraction skipped (no new learnings, insufficient data)
**Payload**: `{ extraction_job_id, reason, timestamp }`
**Severity**: INFO
**Consumed By**: Monitoring
**Retention**: 90 days
**Frequency**: Occasional

### Intelligence Synthesis Events

#### bruce-memory.intelligence.synthesized
**Trigger**: Monthly intelligence snapshot successfully created
**Payload**: `{ snapshot_id, period_start, period_end, key_patterns_count, strategic_implications_count, emerging_signals_count, timestamp }`
**Severity**: INFO
**Consumed By**: bruce-core, leadership dashboards, monitoring
**Retention**: Indefinite
**Frequency**: Monthly (1st of month, 6 AM)
**Note**: Signals availability of new strategic intelligence

### Query Events

#### bruce-memory.query.served
**Trigger**: On-demand query successfully processed and response returned
**Payload**: `{ query_id, requesting_module, question, patterns_returned, confidence_overall, latency_ms, timestamp }`
**Severity**: INFO
**Consumed By**: Monitoring, analytics, performance tracking
**Retention**: 90 days
**Frequency**: Per query (varies)

#### bruce-memory.query.no-results
**Trigger**: On-demand query processed but returned no matching patterns
**Payload**: `{ query_id, requesting_module, question, timestamp }`
**Severity**: INFO
**Consumed By**: Analytics (for gap analysis), monitoring
**Retention**: 90 days
**Frequency**: Variable
**Note**: Used to identify missing patterns or coverage gaps

#### bruce-memory.query.timeout
**Trigger**: Query processing exceeded 30-second SLA
**Payload**: `{ query_id, requesting_module, reason, partial_results_returned, duration_seconds, timestamp }`
**Severity**: WARNING
**Consumed By**: Alerting, performance monitoring
**Retention**: 30 days
**Frequency**: Rare (indicates performance issue)

### Cross-Venture Analysis Events

#### bruce-memory.cross-venture-analysis.completed
**Trigger**: Bi-weekly cross-venture analysis finished
**Payload**: `{ analysis_job_id, ventures_analyzed, findings_count, correlations_found, timestamp }`
**Severity**: INFO
**Consumed By**: Intelligence synthesizer, monitoring
**Retention**: 90 days
**Frequency**: Bi-weekly (1st and 15th of month, 4 AM)

### System Events

#### bruce-memory.vector-db.connection-lost
**Trigger**: Vector database connection failure detected
**Payload**: `{ error, retry_count, fallback_mode, timestamp }`
**Severity**: ERROR
**Consumed By**: Alerting, ops team, monitoring
**Retention**: 30 days
**Frequency**: Rare (indicates infrastructure issue)

#### bruce-memory.pattern-store.update-stale
**Trigger**: Pattern store detected > 8 weeks without new patterns
**Payload**: `{ last_update_timestamp, days_since_update, timestamp }`
**Severity**: WARNING
**Consumed By**: Alerting, ops team
**Retention**: 30 days
**Frequency**: Triggered if stale period detected
**Note**: Indicates potential extraction pipeline failure

## Event Bus Integration

- **Event broker**: Kafka or AWS EventBridge
- **Retention policy**: As specified per event type
- **Ordering guarantee**: FIFO within single event type
- **Acknowledgment**: At-least-once delivery (consumer responsible for idempotency)

## Example Event Flow

### Complete Happy Path
1. bruce-memory.learning.ingested → Learning available for pattern extraction
2. bruce-memory.extraction.started → Batch job begins
3. bruce-memory.pattern.extracted → New pattern discovered
4. bruce-memory.extraction.completed → Batch job finished
5. bruce-memory.cross-venture-analysis.completed → Correlation analysis complete
6. bruce-memory.intelligence.synthesized → Monthly snapshot ready
7. bruce-memory.query.served → Another module queries the new pattern
