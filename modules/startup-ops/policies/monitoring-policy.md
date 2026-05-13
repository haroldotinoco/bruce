# Monitoring Policy

## Ingestion Schedule

### Active Ventures
Ventures in active development/early growth phases run continuous monitoring:
- **Real-time monitoring workflow**: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Weekly health check**: Every Monday at 08:00 UTC
- **Metric snapshot collection**: On-demand triggers available via API

### Paused Ventures
Ventures in pause/wind-down phases run reduced monitoring:
- **Monitoring cycle**: Daily at 18:00 UTC (once per day)
- **Weekly health check**: Disabled or moved to monthly
- **Snapshot retention**: 4-week retention, then archive

## Required Metrics by Stage

### Seed Stage Minimum Metrics
All ventures in seed stage must have data ingestion for:

**Product Metrics** (required: 3 of 4):
- Daily Active Users (DAU)
- New Signups
- Activation Rate (signup-to-active conversion)
- D7 Retention (optional but recommended)

**Revenue Metrics** (required: 1 of 1, but may be $0):
- Monthly Recurring Revenue (MRR) - may be zero if pre-revenue

**Financial Metrics** (required: 2 of 2):
- Burn Rate (monthly cash burn)
- Runway (months of cash remaining)

**Minimum total: 6 of 8 metrics (75%)**

If venture cannot provide required metrics:
- Seed stage ventures must at least provide DAU and burn rate
- Ventures without sufficient data cannot graduate to early stage
- Portfolio must decide if venture is measurement-ready

### Early Stage Minimum Metrics
All ventures in early stage must have data ingestion for:

**Product Metrics** (required: 5 of 7):
- DAU, WAU, MAU (3 required)
- New Signups (required)
- Activation Rate (required)
- D7 Retention (required)
- D30 Retention (strongly recommended)

**Revenue Metrics** (required: 4 of 5):
- MRR (required)
- ARR (required)
- Customer Count (required)
- Churn Rate (required)
- New/Churned MRR breakdown (recommended)

**Acquisition Metrics** (required: 1 of 3):
- CAC - Customer Acquisition Cost
- LTV - Lifetime Value
- LTV:CAC Ratio

**Financial Metrics** (required: 3 of 3):
- Burn Rate
- Runway
- Gross Margin

**Minimum total: 13 of 18 metrics (72%)**

Ventures missing any required category cannot receive ops advice or health scoring.

### Growth Stage Minimum Metrics
All ventures in growth stage must have complete data ingestion for all categories:

**Product Metrics** (required: 7 of 8):
- DAU, WAU, MAU
- New Signups, Activation Rate, D7 Retention, D30 Retention
- Onboarding Completion Rate

**Revenue Metrics** (required: 7 of 8):
- MRR, ARR, Customer Count, Churn Rate
- New MRR, Churned MRR, MRR Growth Rate
- Revenue per Customer

**Acquisition Metrics** (required: 3 of 3):
- CAC, LTV, LTV:CAC Ratio

**Financial Metrics** (required: 3 of 3):
- Burn Rate, Runway, Gross Margin

**Minimum total: 20 of 25 metrics (80%)**

Missing metrics result in health report with "insufficient data" flags.

## Metric Freshness SLA

Data must meet freshness requirements or is excluded from health scoring:

### Product Metrics Freshness
- DAU, WAU, MAU: < 12 hours old (preferred < 6 hours)
- Activation Rate: < 12 hours old
- Retention: < 12 hours old
- Flag: Metrics 12-24 hours old marked as "freshness_warning"
- Exclude: Metrics > 24 hours old from snapshot

### Revenue Metrics Freshness
- MRR, ARR, Customer Counts: < 48 hours old (allows for daily close delay)
- Churn Rate: < 48 hours old
- Flag: Metrics 48-72 hours old marked as "freshness_warning"
- Exclude: Metrics > 72 hours old from snapshot

### Acquisition Metrics Freshness
- CAC, LTV: < 72 hours old (less frequent updates acceptable)
- Flag: Metrics 72-120 hours old marked as "freshness_warning"
- Exclude: Metrics > 120 hours old from snapshot

### Business Rule
- If any metric exceeds freshness SLA, include in snapshot but flag for downstream agents
- Health scoring may proceed with flagged metrics; agent notes data quality concern
- If > 50% of metrics exceed SLA, mark health report as "partial_data" and reduce confidence threshold

## Source Unavailability Handling

When data source becomes unavailable:

### Step 1: Retry Strategy
- Immediate retry (no delay)
- First retry: 1 second delay
- Second retry: 4 second delay
- Third retry: 16 second delay
- After 3 failures: Treat source as unavailable

### Step 2: Graceful Degradation
Fallback behavior when source unavailable:

**If Stripe unavailable**:
- Mark revenue metrics as partial/unavailable
- Continue with Mixpanel/Amplitude for product metrics
- Mark revenue dimension "insufficient_data" in health report
- Continue health scoring with available dimensions

**If Mixpanel unavailable, Amplitude available**:
- Use Amplitude instead for product metrics
- Mark Mixpanel as failed, Amplitude as success
- No gap in product metric collection

**If both Mixpanel and Amplitude unavailable**:
- Mark product metrics partial
- Continue with Stripe if available
- Completeness drops significantly but ingestion continues

**If 2+ sources unavailable**:
- Log error
- Continue ingestion with available sources
- Completeness must be < 60% to fail ingestion

### Step 3: Minimum Viability
- Require minimum 2 of 3 sources available to complete ingestion
- If only 1 source available, fail ingestion (do not produce partial snapshot)
- Return error status requesting retry

### Step 4: Communication
- Log all unavailability events with timestamp, duration, reason
- Track source health over time (success rate, MTTR)
- Alert operations if any source success rate < 70%

## Completeness Calculation

Completeness percentage reflects metrics successfully collected vs. required minimum for stage:

**Seed Stage**:
- Required minimum: 6 metrics
- Metric collected: +1 point each
- Completeness = (collected / 6) × 100
- Minimum to proceed: 75%

**Early Stage**:
- Required minimum: 13 metrics
- Metric collected: +1 point each
- Completeness = (collected / 13) × 100
- Minimum to proceed: 80%

**Growth Stage**:
- Required minimum: 20 metrics
- Metric collected: +1 point each
- Completeness = (collected / 20) × 100
- Minimum to proceed: 85%

Completeness scores guide downstream agent behavior:
- > 90%: Full confidence in health scoring
- 80-90%: Proceed with caution flags
- 60-80%: Partial health report, reduced confidence
- < 60%: Fail ingestion, request retry

## Metric Quality Thresholds

### Data Validation Rules

**Metric Value Bounds**:
- Rates/percentages: 0-100% (clip values outside range, log error)
- User counts (DAU, WAU, MAU): >= 0, must be integers
- Retention rates: 0-100%
- CAC/LTV: >= 0, numeric
- Runway: >= 0, numeric
- Burn rate: typically > 0 (negative = net positive cash flow, flag as unusual)

**Data Freshness Checks**:
- Timestamps in future: Reject and retry
- Timestamps > 1 year old: Reject as historical data
- Negative time ranges: Reject and log

**Logical Consistency**:
- MAU >= WAU >= DAU (violations logged but not rejected)
- Customer churn <= total customers
- New customers + churned customers reasonable vs. churn rate
- MRR growth = (new - churned) / previous MRR (validate within 5%)

### Deviation Flagging
When comparing to previous snapshot:
- Flag metric if current value differs > 20% from previous value
- Examples: DAU drops 25% week-over-week → flag; MRR grows 35% → flag
- Deviations flagged for anomaly detector attention
- First snapshot (no previous) never flagged

## Monitoring Compliance Verification

Weekly compliance check verifies:
- [ ] All active ventures have metric collection run in past 6 hours
- [ ] All paused ventures have daily collection completed
- [ ] Average ingestion latency < 5 minutes
- [ ] Source availability: each source > 95% success rate
- [ ] Metric completeness: meets stage minimum
- [ ] Data freshness: meets SLA
- [ ] Anomalies detected: all escalated appropriately
- [ ] Health reports: all ventures scored weekly

Non-compliant ventures trigger investigation and remediation.

## Monitoring Alerts

Alert operations if:
- **Source Down**: Any source unavailable > 1 hour → "source-unavailable" alert
- **Low Completeness**: Metric completeness < 60% → "low-completeness" alert
- **Stale Data**: Metric freshness SLA exceeded → "stale-data" alert
- **Anomaly Escalation**: Critical anomaly detected → "escalation-required" alert
- **High Failure Rate**: Source success rate drops < 80% → "source-reliability" alert

## Retention and Archival

### Data Retention Policy
- **Metric snapshots**: Keep last 52 weeks (1 year) in hot storage
- **Health reports**: Keep last 52 weeks (1 year) in hot storage
- **Anomalies**: Keep last 26 weeks (6 months) in hot storage
- **Execution logs**: Keep 90 days in hot storage
- **Archive**: Move > 1 year data to cold storage (searchable but slower)

### Compliance Records
- Maintain audit trail of all ingestion runs (timestamps, sources, completeness)
- Archive weekly compliance checks for 2 years
- Support audits and historical analysis with searchable archive
