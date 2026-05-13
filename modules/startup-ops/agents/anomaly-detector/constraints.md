# Anomaly Detector Constraints

## Hard Constraints

### 1. Z-Score Threshold

Anomaly detection via z-score requires:
- Minimum 4 historical snapshots with valid metric values
- Threshold: |z-score| > 2.0 (2 standard deviations)
- Cannot calculate z-score with fewer than 2 historical values; use percentage change thresholds instead

**Calculation**:
```
z = (current_value - rolling_mean) / rolling_std_dev
rolling_mean = average of last 4 values
rolling_std_dev = standard deviation of last 4 values
```

Failing to meet this requirement disqualifies metric from z-score based detection.

### 2. Percentage Change Thresholds

Metrics automatically trigger anomaly if meeting any of:
- Week-over-week change > 30% (increase or decrease)
- Week-over-week change > 15% AND metric already trending down
- Change > 40% growth flagged as "positive_breakout"

Applied regardless of historical snapshot availability.

### 3. Trend Detection Rules

**Concerning Trend**: Flagged if all of:
- 3+ consecutive snapshots showing decline
- Each snapshot decline >= 5% from previous
- Sustained direction (not fluctuation)

**Positive Trend**: Flagged if:
- 3+ consecutive snapshots showing growth >= 5% from previous
- Validates recovery or acceleration

Cannot declare trend with fewer than 4 historical snapshots (need 4 to identify 3 consecutive changes).

### 4. Severity Classification

Severity levels are deterministic based on explicit rules:

**Critical Severity Triggers**:
- MRR drops > 30% week-over-week, OR
- D7 retention drops below 30%, OR
- Runway drops below 3 months, OR
- Any metric < 20% of 4-week average, OR
- Composite health score drops > 20 points in 1 week, OR
- Critical anomaly (z-score > 3.5) in core metric

**Warning Severity Triggers**:
- 15-30% metric drop, OR
- 2+ consecutive weeks of 5%+ decline, OR
- Metric importance rank 1-2 with 10%+ deviation

**Info Severity Triggers**:
- Metric volatility < 15%, OR
- Positive anomalies/breakouts, OR
- Metric importance rank 4-5

No subjective judgment; all classifications must follow explicit rules.

### 5. Metric Importance Hierarchy

Metric importance drives escalation routing:

| Rank | Metrics | Default Sensitivity |
|------|---------|-------------------|
| 1 | MRR, ARR, runway_months | 15% deviation threshold |
| 2 | D7_retention, D30_retention, churn_rate | 20% threshold |
| 3 | activation_rate, new_signups, CAC | 25% threshold |
| 4 | engagement, feature_adoption | 30% threshold |
| 5 | ancillary metrics | 35% threshold |

Lower rank metrics require larger deviations to trigger warning level anomaly.

### 6. Escalation Routing

Anomaly requires escalation (escalation_required: true) if:
- severity = "critical", OR
- type in {sudden_drop, sustained_decline} AND metric_rank <= 2, OR
- Multiple (2+) anomalies of warning severity in same period

All escalation routing must follow these rules without exception.

### 7. Output Schema Compliance

All output must conform exactly to `anomaly.schema.json`:

- Every anomaly must have required fields: anomaly_id, metric_name, type, severity, current_value, baseline_value, description, recommendation, requires_escalation
- delta_percent must be mathematically correct (current - baseline) / baseline * 100
- anomaly_id must be unique per execution
- All timestamps in ISO 8601 UTC format
- Anomaly count sums must equal array length

### 8. Execution Timeout

Detection must complete within 120 seconds:
- Statistical calculations: < 30 seconds
- Trend analysis: < 20 seconds
- Severity assignment: < 20 seconds
- Recommendation generation: < 30 seconds
- Output validation: < 10 seconds

If approaching timeout, return best effort with available anomalies.

## Soft Constraints

### 1. False Positive Reduction

Minimize false positives from normal volatility:

- Check if metric shows consistent high volatility (>20% week-over-week noise)
- If yes, require z-score > 2.5 instead of 2.0 for that metric
- Flag potential false positives in notes
- Do not suppress; surface with low confidence note

### 2. Context-Aware Sensitivity

Adjust anomaly sensitivity based on venture state:

**If composite health < 50**: Reduce anomaly threshold by 10% (trigger earlier)
**If composite health < 30**: Reduce anomaly threshold by 20% (high sensitivity)
**If composite health >= 75**: Increase threshold by 5% (reduce noise)

Adjustment applies to percentage change thresholds and z-score interpretation.

### 3. Known Event Annotation

If venture_context includes known_events:
- Check for metric anomalies that could explain the event
- Link anomalies to known events (e.g., "Churn spike aligns with product incident reported")
- Reduce likelihood of false escalation if anomaly correlates with known temporary event
- But still report; flag as "context: known_event"

### 4. Baseline Calculation Best Effort

With limited historical data:
- 4+ snapshots: Full 4-week rolling average
- 2-3 snapshots: Average of available data
- 1 snapshot: Use previous value for percentage comparison
- 0 snapshots: Cannot calculate baseline; skip z-score, use absolute value assessment

### 5. Trend Consistency Check

Before flagging trend anomaly, verify:
- Direction is consistent (all weeks positive change or all negative)
- Magnitude is meaningful (>= 5% per period minimum)
- Trend is not explained by single outlier

If single snapshot explains entire trend, flag as "sudden_drop/spike" not "concerning_trend".

### 6. Recommendation Specificity

Generate recommendations specific to anomaly type:

**For sudden_drop**: "Investigate MRR drop. Check customer churn list, review recent cancellations/downgrades, verify no billing system issues"

**For concerning_trend**: "D7 retention declining consistently. Review product changes, user feedback, onboarding efficacy over past month"

**For positive_breakout**: "Activation rate spike - validate sustainability, identify successful channels, consider scaling what's working"

**For sustained_decline**: "Runway declining steadily despite stable revenue. Review burn rate breakdown - identify cost increases"

Recommendations must be actionable, not generic.

## Stage-Specific Adjustments

### Seed Stage

- Increase thresholds by 20% (higher volatility expected)
- Focus anomalies on retention and activation
- Revenue anomalies deprioritized if < 10k/month
- Financial sustainability less critical if > 12 month runway

### Early Stage

- Use standard thresholds (baseline)
- All metric categories monitored equally
- Escalate revenue anomalies if > 20% deviation

### Growth Stage

- Decrease thresholds by 10% (mature business, changes are significant)
- Revenue and financial metrics escalated at lower thresholds
- Activation and engagement anomalies still monitored but lower priority
- Unit economics (LTV:CAC) changes trigger investigation

## Data Quality Handling

| Scenario | Response |
|----------|----------|
| Metric null in current snapshot | Skip anomaly detection for that metric; do not flag |
| Metric null in 1+ historical snapshots | Use only non-null values; note data gaps |
| Metric becomes negative (impossible) | Log error; exclude from calculation; flag data quality issue |
| Metric values > 1000x baseline | Flag as potential data error; calculate anomaly with low confidence |
| Zero division (std_dev = 0) | Metric has no volatility; cannot calculate z-score; use percentage change only |
| All snapshots have same value | Metric is flat; any deviation is anomalous; use > 5% threshold |

## Anomaly Type Classification Rules

**sudden_drop**: Single snapshot shows > 15% decline OR z-score < -2.0
**concerning_trend**: 3+ consecutive snapshots declining OR metric trending to unfavorable zone
**positive_breakout**: Single snapshot growth > 40% OR z-score > 2.5 on positive growth metric
**sustained_decline**: 4+ consecutive snapshots of decline OR metric approaching critical threshold

Classify only one primary type per anomaly; include secondary context in description if multiple factors present.

## SLA Compliance

Before returning output, verify:
- [ ] All required fields present for each anomaly
- [ ] delta_percent calculations correct (± 0.5%)
- [ ] severity classifications follow explicit rules
- [ ] anomaly_count_by_severity sums match array length
- [ ] escalation_required flag accurate per rules
- [ ] No anomalies have null metric names
- [ ] All anomaly_ids are unique
- [ ] Timestamps in UTC ISO 8601 format
- [ ] Execution completed within 120 seconds

**Execution fails** if any SLA verification fails.

## Observability Events

Emit events for each anomaly detected:
- `anomaly.detected.critical`: Critical anomaly with escalation required
- `anomaly.detected.warning`: Warning-level anomaly for monitoring
- `anomaly.detected.info`: Information-level anomaly (data point)
- `anomaly.trend.concerning`: Multi-week concerning trend identified
- `anomaly.trend.positive`: Positive growth trend validation
- `anomaly.false_positive.suspected`: Anomaly flagged with low confidence (potential volatility)
- `anomaly.escalation.required`: Anomaly requires immediate escalation routing

Use events for real-time alerting and audit trail.
