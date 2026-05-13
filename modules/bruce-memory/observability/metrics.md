# BruceMemory Metrics

## Key Performance Indicators

### Learning Ingestion Metrics

#### Learning Ingestion Rate
- **Metric**: `bruce_memory_learnings_ingested_per_day`
- **Type**: Counter (cumulative)
- **Unit**: learnings/day
- **Target**: > 5 learnings/day (at least weekly contributions from ventures)
- **Alert Threshold**: < 3 learnings/day for 7 days (potential data gathering issue)
- **Aggregation**: Daily, weekly, monthly

#### Learning Quality Distribution
- **Metric**: `bruce_memory_learning_quality_score_distribution`
- **Type**: Histogram
- **Unit**: Percentage (0-100)
- **Buckets**: [0-25], [25-50], [50-75], [75-100]
- **Target**: > 80% of learnings score >= 75
- **Alert Threshold**: > 20% of learnings score < 50 (quality degradation)

#### Learning Confidence Distribution
- **Metric**: `bruce_memory_learning_confidence_distribution`
- **Type**: Histogram
- **Unit**: Confidence (0-1)
- **Buckets**: [0-0.4], [0.4-0.6], [0.6-0.8], [0.8-1.0]
- **Target**: > 60% of learnings confidence >= 0.7
- **Alert Threshold**: > 30% in [0-0.4] bucket (low confidence submissions)

#### Ingestion Latency
- **Metric**: `bruce_memory_ingestion_latency_ms`
- **Type**: Histogram (percentiles: p50, p95, p99)
- **Unit**: Milliseconds
- **Target**: p95 < 500ms (per learning record)
- **Alert Threshold**: p99 > 5000ms (performance degradation)
- **SLA**: 99th percentile < 2 seconds

### Pattern Extraction Metrics

#### Patterns Extracted Per Cycle
- **Metric**: `bruce_memory_patterns_extracted_per_cycle`
- **Type**: Gauge
- **Unit**: Count
- **Target**: 3-10 patterns per week (normal variance acceptable)
- **Alert Threshold**: 0 patterns for 2 consecutive cycles (extraction failure)
- **Notes**: Cycle = weekly Sunday 3 AM run

#### Pattern Confidence Distribution
- **Metric**: `bruce_memory_pattern_confidence_distribution`
- **Type**: Histogram
- **Unit**: Confidence (0-1)
- **Current State**: Count of patterns in buckets [0.4-0.6], [0.6-0.8], [0.8-1.0]
- **Target**: > 70% of active patterns confidence >= 0.7
- **Alert Threshold**: Majority of patterns < 0.6 (weak evidence base)

#### Evidence Count Distribution
- **Metric**: `bruce_memory_pattern_evidence_count_distribution`
- **Type**: Histogram
- **Unit**: Number of supporting ventures
- **Buckets**: [3], [4-5], [6-10], [11+]
- **Target**: > 40% of patterns evidence from 6+ ventures
- **Alert Threshold**: All patterns evidence from exactly 3 ventures (minimum threshold only)

#### Emerging Patterns (Pending Evidence)
- **Metric**: `bruce_memory_emerging_patterns_count`
- **Type**: Gauge
- **Unit**: Count
- **Target**: 2-5 emerging patterns tracked
- **Alert Threshold**: > 15 emerging patterns (accumulating without publication)
- **Lifetime**: Max 60 days before archival if unpublished

#### Contradicted Patterns
- **Metric**: `bruce_memory_contradicted_patterns_count`
- **Type**: Gauge
- **Unit**: Count
- **Target**: < 5 contradicted patterns at any time
- **Alert Threshold**: > 10 (indicates pattern instability)

#### Pattern Staleness
- **Metric**: `bruce_memory_stale_patterns_percentage`
- **Type**: Gauge
- **Unit**: Percentage of active patterns
- **Definition**: Patterns not validated/updated in last 6 months
- **Target**: < 20% stale
- **Alert Threshold**: > 35% stale (knowledge base degradation)

#### Extraction Pipeline Duration
- **Metric**: `bruce_memory_extraction_cycle_duration_seconds`
- **Type**: Histogram (percentiles: p50, p95, p99)
- **Unit**: Seconds
- **Target**: p95 < 600 seconds (10 minutes)
- **Alert Threshold**: p99 > 1800 seconds (extraction timeout)
- **SLA**: Weekly cycle completes within 15 minutes

### Intelligence Synthesis Metrics

#### Key Patterns in Latest Snapshot
- **Metric**: `bruce_memory_key_patterns_in_snapshot`
- **Type**: Gauge
- **Unit**: Count
- **Target**: 5-10 key patterns per monthly snapshot
- **Alert Threshold**: < 3 key patterns (insufficient intelligence)

#### Strategic Implications Per Snapshot
- **Metric**: `bruce_memory_strategic_implications_per_snapshot`
- **Type**: Gauge
- **Unit**: Count
- **Target**: 3-6 actionable implications per month
- **Alert Threshold**: 0 implications (synthesis failure)

#### Emerging Signals Identified
- **Metric**: `bruce_memory_emerging_signals_per_snapshot`
- **Type**: Gauge
- **Unit**: Count
- **Target**: 1-3 emerging signals per month
- **Alert Threshold**: None (emerging signals are optional)

#### Thesis Updates
- **Metric**: `bruce_memory_thesis_updates_per_snapshot`
- **Type**: Counter (cumulative)
- **Unit**: Count
- **Target**: 2-5 thesis updates per month
- **Alert Threshold**: None (updates reflect learning progress)

### Query Performance Metrics

#### Queries Processed Per Hour
- **Metric**: `bruce_memory_queries_processed_per_hour`
- **Type**: Counter (cumulative)
- **Unit**: queries/hour
- **Target**: Variable based on portfolio activity (0-20)
- **Alert Threshold**: Sudden spike to > 50/hour (possible automated scraping)

#### Query Hit Rate
- **Metric**: `bruce_memory_query_hit_rate`
- **Type**: Gauge (rolling 7-day average)
- **Unit**: Percentage
- **Calculation**: (queries with results >= 1 pattern) / (total queries)
- **Target**: > 70% of queries return at least 1 pattern
- **Alert Threshold**: < 40% (insufficient pattern coverage)

#### Query Response Latency
- **Metric**: `bruce_memory_query_response_latency_ms`
- **Type**: Histogram (percentiles: p50, p95, p99)
- **Unit**: Milliseconds
- **Target**: p95 < 500ms, p99 < 2000ms
- **Alert Threshold**: p99 > 30000ms (SLA breach)
- **SLA**: 99th percentile < 30 seconds

#### No-Results Queries
- **Metric**: `bruce_memory_no_results_query_count_per_day`
- **Type**: Counter (daily)
- **Unit**: Count
- **Target**: < 20% of total daily queries
- **Alert Threshold**: > 50% no-results rate (pattern coverage issue)

#### Patterns Returned Per Query
- **Metric**: `bruce_memory_patterns_per_query_distribution`
- **Type**: Histogram
- **Unit**: Count of patterns
- **Buckets**: [0], [1], [2-3], [4-5]
- **Target**: Majority of queries return 2-3 patterns
- **Notes**: Used to understand pattern relevance

### System Health Metrics

#### Vector Database Connection Status
- **Metric**: `bruce_memory_vector_db_connection_status`
- **Type**: Gauge (0=down, 1=healthy)
- **Unit**: Status
- **Target**: 1 (always connected)
- **Alert Threshold**: 0 (connection failure)

#### Vector Index Status
- **Metric**: `bruce_memory_vector_index_status`
- **Type**: Gauge (0=stale, 1=rebuilding, 2=healthy)
- **Unit**: Status
- **Target**: 2 (healthy)
- **Alert Threshold**: 0 (stale index, > 24 hours since last update)

#### Pattern Store Size
- **Metric**: `bruce_memory_pattern_store_size_count`
- **Type**: Gauge
- **Unit**: Count of patterns
- **Target**: Growing steadily (5-10 per month)
- **Alert Threshold**: Flatline for > 8 weeks (extraction stall)

#### Learning Store Size
- **Metric**: `bruce_memory_learning_store_size_count`
- **Type**: Gauge
- **Unit**: Count of learnings
- **Target**: Growing monotonically (5-20 per day)
- **Alert Threshold**: Flatline for > 30 days (ingestion stall)

#### Synthesis Latency
- **Metric**: `bruce_memory_synthesis_duration_seconds`
- **Type**: Histogram
- **Unit**: Seconds
- **Target**: < 300 seconds (5 minutes)
- **Alert Threshold**: > 1800 seconds (30 minutes, timeout)
- **Frequency**: Monthly

## Dashboard Layout

### Real-Time Dashboard
- Learning Ingestion Rate (last 24h)
- Query Hit Rate (last 7d rolling)
- Query Response Latency (p95, p99)
- Vector DB Connection Status
- Pattern Store Size (growth trend)

### Weekly Dashboard
- Patterns Extracted (this week)
- Pattern Confidence Distribution
- Emerging Patterns Count
- Extraction Pipeline Duration
- Learning Quality Distribution

### Monthly Dashboard
- Key Patterns in Latest Snapshot
- Strategic Implications Count
- Emerging Signals Identified
- Query Volume by Requesting Module
- Pattern Staleness Rate
