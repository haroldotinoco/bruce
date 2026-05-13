# Anomaly Detector Agent

## Overview

The Anomaly Detector Agent identifies statistically significant anomalies and concerning trends in operational metrics by comparing current values against historical baselines. It detects sudden drops, trending declines, positive breakouts, and sustained degradation to surface signals requiring immediate attention.

## Role

Statistical anomaly detector and trend analyst. Identifies signals that require escalation before they become crises.

## Objectives

1. **Anomaly Detection**: Identify metrics deviating significantly (> 2 standard deviations) from 4-week rolling average
2. **Trend Analysis**: Detect 3+ consecutive weeks of decline or concerning directional movement
3. **Breakout Detection**: Identify positive metric growth (> 40% week-over-week) as validation signals
4. **Severity Classification**: Classify anomalies as info, warning, or critical based on impact and metric importance
5. **Escalation Routing**: Flag anomalies requiring immediate action for escalation workflow

## Key Characteristics

- **Statistical Rigor**: Uses 2-sigma threshold and rolling baseline for anomaly detection
- **Contextual Awareness**: Considers health scores for severity context
- **Actionable Output**: Includes recommendations for each detected anomaly
- **Temperature**: 0.2 (analytical with some contextual reasoning)
- **Provider**: Anthropic Claude Sonnet 4.6

## Task Type

Time series analysis with statistical anomaly detection. Contextual evaluation using health scores.

## Decision Rules

1. **Anomaly Detection**: Metric triggers anomaly if:
   - Value deviates > 2 standard deviations from 4-week rolling average, OR
   - Absolute percentage change > 30% week-over-week, OR
   - 3+ consecutive weeks of 5%+ decline

2. **Anomaly Type Classification**:
   - **Sudden Drop**: Single week decline > 15% or > 2-sigma
   - **Concerning Trend**: 3+ weeks consecutive decline of 5%+ each
   - **Positive Breakout**: Single week growth > 40%
   - **Sustained Decline**: 4+ weeks of negative weeks

3. **Severity Assignment**:
   - **Critical**:
     - Sudden drop in core revenue metric (MRR > 30% drop)
     - Retention drop below 30% D7
     - Runway < 3 months and declining
     - Any metric < 20% of 4-week average
   - **Warning**:
     - 15-30% metric drop
     - 2+ consecutive weeks decline
     - Trend change in important acquisition channel
   - **Info**:
     - Metric volatility < 15%
     - Positive anomalies/breakouts
     - Trend changes in minor metrics

4. **Escalation Routing**:
   - **Requires Escalation**: severity = "critical" OR metric is {MRR, runway_months, d7_retention}

5. **Recommendation Generation**: Suggest specific investigation angles based on anomaly type

## Inputs

```json
{
  "current_snapshot": {
    "snapshot_id": "string",
    "metrics": { ... }
  },
  "last_4_snapshots": [
    { "snapshot_id": "string", "metrics": { ... } },
    { "snapshot_id": "string", "metrics": { ... } },
    { "snapshot_id": "string", "metrics": { ... } },
    { "snapshot_id": "string", "metrics": { ... } }
  ],
  "health_scores": {
    "composite_score": 0-100,
    "dimension_scores": { ... }
  },
  "venture_context": {
    "stage": "seed|early|growth",
    "known_events": ["string (e.g., 'paid_campaign_launch')"]
  }
}
```

## Outputs

Produces `anomaly.schema.json` array with:
- anomaly_id, venture_id, detected_at
- type (enum: sudden_drop, concerning_trend, positive_breakout, sustained_decline)
- metric_name
- severity (enum: info, warning, critical)
- current_value, baseline_value, delta_percent
- description and recommendation
- requires_escalation (boolean)
- anomaly_count_by_severity object

## Statistical Thresholds

### Z-Score Calculation

For each metric with 4+ previous values:
```
z_score = (current_value - rolling_mean) / rolling_std_dev

Threshold: |z_score| > 2.0 triggers anomaly
```

### Rolling Average & StdDev

Use 4-week rolling calculation:
- rolling_mean = average of last 4 snapshot values
- rolling_std_dev = standard deviation of last 4 values
- Minimum requirement: 4 historical snapshots

### Percentage Change Thresholds

- > 30% week-over-week: Automatic flag
- > 15% week-over-week: Flag for severity assessment
- > 40% growth: Positive breakout

### Trend Detection

**Concerning Trend**: 3+ consecutive weeks meeting any of:
- 5%+ decline week-over-week, OR
- Metric trending toward unfavorable zone (e.g., D7 retention < 40%)

**Positive Trend**: 3+ consecutive weeks of 5%+ growth OR metric recovering from anomaly

## Severity Context

Severity assignment also considers:
- **Metric Importance**: Revenue metrics weighted higher than engagement
- **Stage**: Growth stage ventures flag revenue anomalies sooner
- **Health Score Context**: If composite score already < 50, reduce anomaly thresholds by 10%
- **Business Impact**: Estimate user impact from metric anomaly

### Metric Importance Ranking

| Rank | Metrics | Rationale |
|------|---------|-----------|
| 1 | MRR, ARR, runway_months | Revenue sustainability |
| 2 | D7_retention, D30_retention, churn_rate | Product-market fit |
| 3 | activation_rate, new_signups | User acquisition health |
| 4 | CAC, LTV, ltv_cac_ratio | Unit economics |
| 5 | engagement, feature_adoption | Product quality |

## SLAs

- **Anomaly Detection Latency**: Detect within 5 minutes of data availability
- **Severity Assignment Accuracy**: Classify correctly per rubric 95%+ of time
- **False Positive Rate**: < 10% (metric volatility misclassified as anomaly)

## Integration Points

- **Inputs**: metric-snapshot from metrics-ingestion-agent, health-scores from health-scoring-agent
- **Outputs**: ops-advisor (for recommendations), anomaly-escalation workflow (if critical)
- **State**: Maintains rolling baseline history (4+ snapshots)
- **Observability**: Emits anomaly events by severity

## Failure Modes

| Scenario | Handling |
|----------|----------|
| Fewer than 2 historical snapshots | Cannot calculate z-score; flag for contextual assessment only |
| Metric null in current snapshot | Skip anomaly detection; do not flag as anomaly |
| Metric null in historical snapshots | Use only available data; note data quality issue |
| Metric value becomes negative (impossible) | Log error; exclude from calculation |
| Metric value > 1000x baseline | Investigate for data error; flag with low confidence |
| All metrics stable (low volatility) | Return no anomalies; normal operation |

## Provider Configuration

- **Model**: anthropic/claude-sonnet-4-6
- **Temperature**: 0.2 (analytical evaluation with contextual reasoning)
- **Max Tokens**: 3000
- **Timeout**: 120 seconds per execution

## Observability

Emits events:
- `anomaly.detected.critical`: Critical severity anomaly found
- `anomaly.detected.warning`: Warning severity anomaly found
- `anomaly.detected.info`: Info level anomaly (for tracking)
- `anomaly.trend.concerning`: Concerning 3+ week trend
- `anomaly.trend.positive`: Positive trend breakout
- `anomaly.escalation.required`: Anomaly requires escalation
- `anomaly.false_positive.flagged`: Potential false positive (metric volatility)

## Known Limitations

- Requires 4+ historical snapshots for statistical validity. With fewer, use percentage change thresholds only.
- Positive anomalies in negative metrics (declining burn rate) require context interpretation.
- Seasonal patterns not considered; may produce false positives during expected seasonal fluctuations.
- External events (product launch, marketing campaigns) not automatically detected; require annotation.
