# Metrics Ingestion Agent Constraints

## Hard Constraints

### 1. Minimum Source Requirement

The agent must have at least 2 of the 3 available data sources (Mixpanel/Amplitude, Stripe, GTM) returning data to produce a valid snapshot.

- **If 3 sources available**: All three succeed or partially succeed (completeness >= 80%)
- **If 2 sources available**: At least 2 must return data (completeness >= 60%)
- **If < 2 sources available**: Ingestion fails; return error status without producing snapshot

**Rationale**: With fewer than 2 sources, confidence in metric values drops significantly. Incomplete data from a single source creates unreliable baselines for trend analysis.

### 2. Data Freshness SLA

All collected metrics must meet freshness requirements to be included in snapshot:

- **Product Metrics (DAU, WAU, MAU, retention, activation)**: Must be < 12 hours old
  - Data older than 12 hours may be included but flagged as `freshness_warning: true`
  - Data older than 24 hours is excluded from snapshot

- **Revenue Metrics (MRR, ARR, customer counts, churn)**: Must be < 48 hours old
  - Daily close data acceptable up to 48 hours (allows for one day lag)
  - Data older than 48 hours is excluded

- **Acquisition Metrics (CAC, LTV, channel data)**: Must be < 72 hours old
  - Less frequent update cycle acceptable
  - Flag if older than 48 hours

**Rationale**: Stale data leads to incorrect health scores and delayed anomaly detection. Different metric types have different acceptable latencies based on collection frequency.

### 3. Schema Compliance

All output metrics must conform exactly to `metric-snapshot.schema.json`:

- Every metric in output must have: `value`, `previous_value`, `deviation_percent`, `deviation_flag`, `source`
- Use `null` for metrics that are unavailable; do not omit fields
- Numeric values must respect min/max constraints (e.g., retention rates 0-100, user counts >= 0)
- Timestamp fields must be ISO 8601 format in UTC
- String fields must not exceed specified maxLength

**Rationale**: Downstream agents depend on consistent schema for reliable processing. Missing or malformed fields cause downstream processing failures.

### 4. Rate Limiting Compliance

Respect all data source API rate limits:

- **Mixpanel**: 10 requests/second maximum
  - Batch similar requests to minimize call count
  - Cache aggregated data queries when possible

- **Stripe**: 25 requests/second maximum
  - Use cursor pagination for large result sets
  - Batch lookup operations

- **Amplitude**: 10 requests/second maximum
  - Use aggregated endpoints instead of raw event queries
  - Implement request queuing

**Retry Strategy**: Exponential backoff with maximum 3 retry attempts
- First retry: 1 second delay
- Second retry: 4 second delay
- Third retry: 16 second delay
- After 3 failures: Mark source as failed

**Rationale**: Exceeding rate limits results in API bans and service degradation. Batching and caching improve efficiency.

### 5. Execution Timeout

Ingestion must complete within 300 seconds (5 minutes) from execution start to snapshot return:

- 300 seconds total budget for entire execution
- Approximately 100 seconds per data source (with parallelization)
- If approaching 250 seconds with incomplete collection, fail gracefully with partial data

**Timeout per request**: 30 seconds per individual API call. If exceeded, treat as source unavailable.

**Rationale**: Longer executions block monitoring workflows and delay anomaly detection. Real-time monitoring requires predictable, bounded latency.

### 6. Error Handling and Logging

All errors must be logged with sufficient detail for debugging:

- Log every API call with endpoint, parameters, response time
- Log all API errors with status code, error message, and timestamp
- Log source unavailability with reason (timeout, auth failure, 5xx error)
- Never suppress or silently ignore errors

**Error Reporting**: Errors must be surfaced in `sources_status` object:
```json
"sources_status": {
  "stripe": {
    "status": "failed",
    "error": "401 Unauthorized: Invalid API key",
    "metric_count": 0
  }
}
```

**Rationale**: Transparent error reporting enables rapid debugging and monitoring of data pipeline health.

## Soft Constraints

### 1. Metric Deviation Flagging

Flag metrics that deviate > 20% from previous snapshot value:

- Calculate percentage change: `(current - previous) / previous * 100`
- Set `deviation_flag: true` if absolute value of change > 20%
- Include calculated `deviation_percent` in output
- Do not fail on deviations; flag for downstream processing

**Exceptions to flagging**:
- First snapshot (no previous value): Do not flag
- Previous value was 0 or null: Do not flag (cannot calculate percentage change)
- Metric is new to venture: Do not flag

**Rationale**: Large deviations may indicate either positive growth or concerning problems. Flagging allows downstream agents to investigate without blocking ingestion.

### 2. Historical Reference Maintenance

Maintain references to last 4 metric snapshots for trend analysis:

- Store snapshot_ids and key metrics from each of last 4 snapshots
- Include in agent state for comparison
- Use for baseline calculation and deviation detection
- Expire snapshots older than 30 days

**Rationale**: Historical context enables more sophisticated anomaly detection and trend analysis by downstream agents.

### 3. Source Health Tracking

Track health of each data source over time:

- Count consecutive successes/failures
- Calculate source success rate (successes / total runs)
- Record last failure timestamp and reason
- Alert if source success rate < 70%

**Rationale**: Early warning of data pipeline degradation enables proactive remediation before it impacts health scoring.

## Stage-Specific Requirements

### Seed Stage

Minimum required metrics for completeness calculation:
- Product: DAU, new signups, activation_rate, d7_retention (4 required)
- Revenue: MRR (1 required)
- Financial: burn_rate, runway_months (2 required)
- **Total minimum: 7 of 15 metrics (47%)**

Revenue metrics may be sparse at seed stage (MVP phase). Focus on product metrics.

### Early Stage

Minimum required metrics for completeness:
- Product: DAU, WAU, new_signups, activation_rate, d7_retention, d30_retention (6 required)
- Revenue: MRR, ARR, customer_count, churn_rate (4 required)
- Financial: burn_rate, runway_months, gross_margin (3 required)
- **Total minimum: 13 of 18 metrics (72%)**

Revenue metrics becoming more important as product-market fit clarifies.

### Growth Stage

Minimum required metrics for completeness:
- Product: DAU, WAU, MAU, activation_rate, d7_retention, d30_retention, onboarding_completion_rate (7 required)
- Revenue: MRR, ARR, new_mrr, churned_mrr, customer_count, new_customers, churned_customers (7 required)
- Acquisition: CAC, LTV, ltv_cac_ratio (3 required)
- Financial: burn_rate, runway_months, gross_margin (3 required)
- **Total minimum: 20 of 25 metrics (80%)**

All metric categories expected to be available at growth stage.

## Fallback Behaviors

### When Mixpanel Unavailable

- Attempt to fetch product metrics from Amplitude instead
- If Amplitude also unavailable, mark all product metrics as partial
- Continue with Stripe and GTM data if available
- Set `sources_status.product: "partial"` or `"failed"`

### When Stripe Unavailable

- Mark all revenue metrics as partial/unavailable
- Continue with product metrics from Mixpanel/Amplitude
- Set `sources_status.stripe: "partial"` or `"failed"`
- Mark in output: `revenue.*.value = null`

### When Both Product Source Unavailable

- Mark entire product dimension as failed
- Continue if Stripe available (completeness degrades)
- Fail ingestion only if also Stripe unavailable

### When Rate Limited

- Implement exponential backoff (1s, 4s, 16s delays)
- Retry up to 3 times
- After 3 failures, treat as source unavailable
- Log rate limit event with retry details

### When Data Too Old

- Include metric in snapshot but set `freshness_warning: true`
- Mark field with note: "data older than SLA"
- Downstream agents may choose to exclude from scoring
- Do not fail ingestion due to freshness

## Compliance Verification

Before returning snapshot, verify:

- [ ] Schema compliance: All required fields present with correct types
- [ ] Source status: At least 2 sources have data
- [ ] Completeness: Minimum threshold met for venture stage
- [ ] Timestamps: All timestamps in ISO 8601 UTC format
- [ ] Numeric ranges: All values within specified min/max
- [ ] Freshness: No metrics older than hard SLA (unless flagged)
- [ ] Deviations: Flagged accurately for > 20% changes
- [ ] Errors: All errors logged and surfaced in sources_status

**Execution fails** if any of the above verifications fail.
