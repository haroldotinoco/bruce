# Health Scoring Agent Constraints

## Hard Constraints

### 1. Rubric Application Consistency

Scoring rubrics must be applied deterministically and consistently:

- Same metric values must always produce identical scores across runs
- Rubric boundaries are hard thresholds (e.g., > 80% activation = 90+ score)
- Use linear interpolation between rubric breakpoints for intermediate values
- No subjective judgment; all decisions must be rule-based

**Verification**: Same metric snapshot must produce ± 0.1 variance in scores across 10 runs.

### 2. Stage-Dependent Weights

Composite score calculation must use stage-appropriate weights:

**Early/Seed Stage Weights**:
- Activation: 25%
- Retention: 25%
- Product Quality: 20%
- Financial Sustainability: 20%
- Revenue: 5%
- Market Fit: 5%

**Growth Stage Weights**:
- Revenue: 25%
- Retention: 20%
- Financial Sustainability: 20%
- Market Fit: 20%
- Activation: 10%
- Product Quality: 5%

All weights must sum to 100%. If dimension has insufficient data, exclude from calculation and renormalize remaining weights to sum to 100%.

### 3. Minimum Data Requirements

Do not calculate composite health score if:
- More than 2 dimensional scores marked "insufficient data"
- Less than 4 of 6 dimensions have valid scores
- Critical input metrics missing (e.g., activation_rate, MRR)

**Fallback**: Return partial health report with available dimensions only, indicate missing dimensions, suggest metric ingestion retry.

### 4. Schema Compliance

All output must conform exactly to `health-report.schema.json`:

- Each dimension score must be 0-100 integer
- Composite score must be 0-100 number (with decimals allowed)
- Status must be one of: "critical", "at_risk", "healthy", "insufficient_data"
- Trends must be one of: "improving", "stable", "declining", "n/a"
- All timestamps in ISO 8601 UTC format
- required fields must never be null

### 5. Execution Timeout

Scoring must complete within 60 seconds:

- Rubric application: < 10 seconds
- Historical lookup: < 15 seconds
- Trend calculation: < 10 seconds
- Score calculation and validation: < 10 seconds
- Output serialization: < 5 seconds
- Total budget: 60 seconds

If approaching timeout, return best effort with available data.

### 6. Risk Classification Accuracy

Risk thresholds are hard boundaries:

- **Critical Dimension**: Score < 20 (non-negotiable)
- **At-Risk Dimension**: Score 20-39 (inclusive of 20)
- **Healthy Dimension**: Score 40-100

- **Critical Composite**: Score < 30
- **Warning Composite**: Score 30-49
- **Healthy Composite**: Score 50-100

All thresholds non-negotiable. No rounding that would change classification.

## Soft Constraints

### 1. Rubric Details

Each dimension uses specific metrics as foundation:

**Activation Dimension**:
- Primary: activation_rate (40% weight)
- Secondary: onboarding_completion_rate (35% weight)
- Tertiary: new_signups_trend (25% weight)
- Default if missing: Use 50 (neutral) for that component

**Retention Dimension**:
- Primary: D7_retention (40% weight)
- Secondary: D30_retention (40% weight)
- Tertiary: churn_rate (20% weight)
- Floor: If D7 < 10%, dimension score capped at 20 max (critical threshold)

**Revenue Dimension**:
- Primary: MRR_growth_rate (50% weight)
- Secondary: new_to_churned_MRR_ratio (30% weight)
- Tertiary: ARR_trajectory (20% weight)
- Special: If MRR negative (declining), dimension score capped at 15 max

**Product Quality Dimension**:
- Primary: NPS_score (40% weight) - if unavailable, use 50 neutral
- Secondary: feature_adoption_rate (35% weight)
- Tertiary: bug_report_rate (25% weight) - inverse (higher bugs = lower score)
- Default if NPS unavailable: Redistribute weights 50% feature_adoption, 50% engagement metrics

**Financial Sustainability Dimension**:
- Primary: runway_months (40% weight)
- Secondary: burn_rate_trend (30% weight) - use as trend indicator
- Tertiary: LTV_to_CAC_ratio (30% weight)
- Floor: If runway < 3 months, dimension score capped at 25 max (urgent escalation signal)

**Market Fit Dimension**:
- Primary: NPS_trend (30% weight) - directional change vs previous NPS
- Secondary: organic_growth_rate (35% weight)
- Tertiary: activation_rate_trend (35% weight)
- Default: If NPS unavailable, use 50% organic_growth, 50% engagement_growth_rate

### 2. Trend Calculation

Trend determination based on comparison with previous health report (if available):

- **Improving**: Current dimension score > Previous score + 2 points
- **Stable**: Current dimension score within ± 2 points of previous
- **Declining**: Current dimension score < Previous score - 2 points
- **N/A**: No previous report available or data insufficient

Composite trend: Use same logic on composite scores, minimum delta 3 points for "improving"/"declining".

### 3. Interpolation Between Rubric Points

For metrics falling between defined rubric breakpoints, use linear interpolation:

```
score = min + (metric_value - min_value) / (max_value - min_value) * (max_score - min_score)
```

Example for Activation (40-80% activation rate maps to 50-89 score):
- 40% activation = 50 score
- 60% activation = 70 score
- 80% activation = 89 score

Apply this to all dimensions for smooth scoring without gaps.

### 4. Missing Data Handling

If critical metric missing for a dimension:

- Mark dimension with status "insufficient_data"
- Use default value 50 (neutral) for that metric component
- Note which metrics missing in "based_on" field
- Only use this dimension for composite if other dimensions present

Example: If NPS unavailable but feature adoption present, use feature adoption at higher weight with neutral default for NPS component.

### 5. Historical Lookup Best Effort

Attempt to retrieve previous 4 health reports for trend analysis:

- If 4 reports available: Full 4-week trend calculation
- If 2-3 reports available: Calculate trend with available data
- If 1 report available: Simple 1-period comparison only
- If 0 reports available: No trend, mark all trends as "n/a"

Do not fail if historical data unavailable; continue with current period scoring.

### 6. Dimensional Insights

Include brief reason/explanation in output for each at-risk or critical dimension:

```json
{
  "dimension": "retention",
  "score": 28,
  "reason": "D7 retention at 22% is below healthy threshold (40%+); indicates product-market fit issues or onboarding quality problems"
}
```

Insights should be concise but actionable.

## Output Quality Validation

Before returning health report, validate:

- [ ] All dimension scores are 0-100
- [ ] Composite score is mathematically correct (within ± 0.5 from manual calculation)
- [ ] Status fields use only allowed enums
- [ ] Trends use only allowed enums
- [ ] All timestamps in UTC ISO 8601 format
- [ ] At-risk and critical dimension lists are accurate
- [ ] Weights sum to 1.0 (or renormalized correctly)
- [ ] Stage matches input parameter
- [ ] Metric snapshot reference is valid
- [ ] Period dates are in chronological order

**Execution fails** if any validation fails.

## Error Handling

| Scenario | Response |
|----------|----------|
| Invalid stage parameter | Return error; reject execution |
| Composite score NaN | Log error; recalculate with normalized weights |
| Metric value outside expected range (e.g., 150% retention) | Log warning; treat as max value (100%) |
| Previous health report corrupted | Log warning; continue without trend |
| Score calculation > 100 | Cap at 100; log warning |
| Score calculation < 0 | Floor at 0; log warning |

## Observability

Emit events:
- `health.score.calculated`: Health score completed
- `health.dimension.at_risk`: Any dimension 20-39
- `health.dimension.critical`: Any dimension < 20
- `health.composite.critical`: Composite < 30
- `health.composite.warning`: Composite 30-49
- `health.trend.improving`: Any dimension improving
- `health.trend.declining`: Any dimension declining
