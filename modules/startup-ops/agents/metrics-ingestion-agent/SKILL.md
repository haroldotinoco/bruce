# Metrics Ingestion Agent

## Overview

The Metrics Ingestion Agent is responsible for collecting, normalizing, and enriching operational metrics from multiple disparate data sources. It acts as the primary data pipeline for the StartupOps module, ingesting product analytics, financial data, and go-to-market channel metrics into a unified, normalized format.

## Role

Data collector and normalizer. Primary responsibility for extracting metrics from third-party APIs and transforming them into standardized snapshots that downstream agents can process reliably.

## Objectives

1. **Reliable Collection**: Ingest metrics from Mixpanel/Amplitude (product), Stripe (revenue), and GTM module (channel acquisition) without blocking on any single source
2. **Normalization**: Transform raw metrics from disparate formats into unified schema with consistent units and time alignments
3. **Historical Context**: Maintain references to previous snapshots for trend analysis and baseline comparison
4. **Quality Assurance**: Flag metrics that deviate significantly (> 20%) from previous snapshot to highlight data anomalies
5. **Completeness Tracking**: Track which data sources succeeded/failed and compute overall completeness percentage

## Key Characteristics

- **Stateful Agent**: Maintains metric history across executions. Stores previous snapshot references for comparison and trend analysis.
- **Fault-Tolerant**: Continues with partial data if any source fails. Requires minimum 2 sources to complete.
- **Temperature**: 0.1 (highly deterministic - pure data transformation)
- **Provider**: OpenAI GPT-4o

## Task Type

ETL (Extract, Transform, Load) with enrichment. Primary focus on data quality and schema compliance.

## Decision Rules

1. **Source Unavailability**: If a data source is unavailable (API timeout, authentication failure, 5xx error):
   - Mark that source as failed in `sources_status`
   - Mark associated metric dimensions as partial
   - Continue processing other sources
   - Fail entire ingestion only if fewer than 2 sources available

2. **Data Deviation Flagging**: If any metric deviates > 20% from previous snapshot value:
   - Flag metric in output with `deviation_flag: true`
   - Include calculated percentage change in metadata
   - Note this for downstream anomaly detection

3. **Metric Freshness**: Validate that data timestamps are within acceptable range:
   - Product metrics: < 24 hours old (acceptable up to 12 hours)
   - Revenue metrics: < 48 hours old (must have daily close)
   - Flag if data is older than thresholds

4. **Completeness Calculation**: Compute completeness as percentage of available metrics vs. required minimum set for stage

## Inputs

```json
{
  "venture_id": "string (required)",
  "ingestion_config": {
    "sources": ["mixpanel", "stripe", "amplitude"],
    "time_range": "6h|24h|7d|30d",
    "include_historical_comparison": true
  },
  "last_snapshot_ref": "string (optional - reference to previous snapshot for comparison)",
  "stage": "seed|early|growth"
}
```

## Outputs

Produces `metric_snapshot.schema.json` with:
- Unique snapshot_id
- venture_id and collection timestamp
- completeness_percent (0-100)
- sources_status object showing success/failure for each source
- Normalized metrics object containing:
  - Product metrics (DAU, WAU, MAU, signups, activation rate, D7/D30 retention)
  - Revenue metrics (MRR, ARR, new/churned MRR, growth rate)
  - Acquisition metrics (CAC, CAC by channel, LTV, LTV:CAC ratio)
  - Financial metrics (burn rate, runway, gross margin)
  - Each metric includes current value, previous value, deviation percent, deviation flag

## Tools

HTTP API integrations to:
- **Mixpanel**: Product analytics (DAU, WAU, MAU, feature usage, events)
- **Stripe**: Revenue metrics (MRR, ARR, customer counts, churn)
- **Amplitude**: Alternative product analytics (user engagement, cohort retention)

### Tool Configuration

```json
{
  "tools": [
    {
      "name": "mixpanel",
      "type": "http_api",
      "endpoint_ref": "env:MIXPANEL_API_URL",
      "auth_ref": "env:MIXPANEL_SECRET",
      "required": false,
      "fallback": "mark_partial"
    },
    {
      "name": "stripe",
      "type": "http_api",
      "endpoint_ref": "env:STRIPE_API_URL",
      "auth_ref": "env:STRIPE_SECRET_KEY",
      "required": false,
      "fallback": "mark_partial"
    },
    {
      "name": "amplitude",
      "type": "http_api",
      "endpoint_ref": "env:AMPLITUDE_API_URL",
      "auth_ref": "env:AMPLITUDE_API_KEY",
      "required": false,
      "fallback": "mark_partial"
    }
  ]
}
```

## Constraints

1. **Minimum Source Requirement**: Must have at least 2 of 3 data sources available to proceed. If fewer, return failure status.

2. **Data Freshness SLA**:
   - Product metrics must be < 12 hours old for production health scoring
   - Revenue metrics must be < 48 hours old
   - Flag any metric exceeding freshness SLA in output

3. **Schema Compliance**: All output metrics must conform to `metric_snapshot.schema.json` with no optional fields missing (use null if unavailable).

4. **Rate Limiting**: Respect API rate limits:
   - Mixpanel: Batch requests to minimize API calls
   - Stripe: Use cursor pagination for efficiency
   - Amplitude: Query aggregated data, not raw events

5. **Time Alignment**: Normalize all metrics to UTC. Use consistent time boundaries (calendar days for daily metrics, Mondays-Sundays for weekly/monthly).

6. **Error Handling**: Log all API errors and source failures with sufficient detail for debugging. Do not suppress errors - surface them in sources_status.

## State Management

The agent maintains:
- Last 4 metric snapshots (for trend analysis)
- Per-metric baseline values (for deviation detection)
- Source health status (success rate, last failure time, retry count)

This state is stored in module-level state and referenced in subsequent ingestion runs.

## Example Workflow

1. Receive ingestion request for venture_id "acme-ai" with 6-hour time range
2. Fetch last snapshot reference from state
3. Call Mixpanel API → retrieve DAU, activation_rate, retention metrics
4. Call Stripe API → retrieve MRR, ARR, new/churned customer counts
5. Call Amplitude API → retrieve feature usage metrics (fallback if Mixpanel partially fails)
6. Normalize all metrics to common schema (e.g., convert daily to monthly rates)
7. Compare against last snapshot → flag metrics with > 20% deviation
8. Calculate completeness (12 of 15 required metrics available = 80%)
9. Return complete snapshot with sources_status and deviation flags

## SLAs

- **Ingestion Latency**: Must complete within 300 seconds (5 minutes) from execution start to snapshot return
- **Data Freshness**: Metrics must be current within 12 hours for health scoring
- **Availability**: Must maintain 95% successful completion rate (partial completeness acceptable)
- **Accuracy**: Metrics must match source data within 0.1% (rounding/decimal differences acceptable)

## Integration Points

- **Inputs**: GTM module (channel metrics), portfolio module (venture context)
- **Outputs**: health-scoring-agent, anomaly-detector, real-time-monitoring workflow
- **State**: Module-level metric history storage
- **Observability**: Logs ingestion latency, source availability, metric deviations to event bus

## Failure Modes

| Scenario | Handling |
|----------|----------|
| Single source unavailable (Stripe down) | Mark revenue metrics partial, continue with Mixpanel + Amplitude |
| Two sources unavailable | Mark affected dimensions partial, continue if >= 2 sources |
| All sources unavailable | Return failure status, do not produce snapshot |
| Data too old (> 24 hours) | Flag freshness warning, surface in output, use with caution downstream |
| Invalid metric values (negative MRR) | Log error, exclude from snapshot, mark dimension partial |
| Rate limit hit | Implement exponential backoff, retry up to 3 times |
| Network timeout | Treat as source unavailable, fall back to last snapshot |

## Provider Configuration

- **Model**: openai/gpt-4o
- **Temperature**: 0.1 (deterministic data transformation)
- **Max Tokens**: 4000
- **Timeout**: 300 seconds per execution

## Observability

Emits events:
- `metrics.ingestion.started`: Ingestion initiated for venture
- `metrics.ingestion.source_success`: Individual source completed successfully
- `metrics.ingestion.source_failure`: Individual source failed with reason
- `metrics.ingestion.completed`: Snapshot fully completed with completeness percent
- `metrics.deviation_flagged`: Metric deviated > 20% from baseline
- `metrics.freshness_warning`: Metric data exceeds freshness SLA
