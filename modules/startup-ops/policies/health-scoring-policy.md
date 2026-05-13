# Health Scoring Policy

## Scoring Rubrics by Dimension

### Activation Dimension (0-100 scale)

**Inputs**: activation_rate (40%), onboarding_completion_rate (35%), new_signups_trend (25%)

| Score Range | Activation Rate | Onboarding Rate | Signups Trend | Interpretation |
|-------------|-----------------|-----------------|---------------|-----------------|
| 90-100 | > 80% | > 85% | Growing | Excellent conversion, strong onboarding, good demand signal |
| 70-89 | 60-80% | 75-85% | Stable/Growing | Good activation with strong funnel |
| 50-69 | 40-60% | 55-75% | Stable | Acceptable activation, some friction points |
| 30-49 | 20-40% | 35-55% | Declining | Poor activation, requires investigation |
| 0-29 | < 20% | < 35% | Declining | Critical activation problem, high friction |

**Calculation**:
```
activation_score = (activation_rate × 0.40) + (onboarding_rate × 0.35) + (signups_trend_score × 0.25)
```
Where signups_trend_score = score based on 4-week trend (0-100).

### Retention Dimension (0-100 scale)

**Inputs**: D7_retention (40%), D30_retention (40%), churn_rate (20%)

| Score Range | D7 Retention | D30 Retention | Churn Rate | Interpretation |
|-------------|--------------|---------------|-----------|-----------------|
| 90-100 | > 70% | > 50% | < 5% | Excellent retention, strong product fit |
| 70-89 | 55-70% | 40-50% | 5-10% | Good retention with sustainable churn |
| 50-69 | 40-55% | 25-40% | 10-15% | Acceptable but needs improvement |
| 30-49 | 25-40% | 15-25% | 15-25% | Poor retention, product issues likely |
| 0-29 | < 25% | < 15% | > 25% | Critical retention problem |

**Calculation**:
```
retention_score = (d7_retention × 0.40) + (d30_retention × 0.40) + ((100 - churn_rate) × 0.20)
```

**Special Rule**: If D7 retention < 10%, cap dimension score at 20 (critical indicator of product-market fit failure).

### Revenue Dimension (0-100 scale)

**Inputs**: MRR_growth_rate (50%), new_to_churned_MRR_ratio (30%), ARR_trajectory (20%)

| Score Range | MRR Growth | NMR:CMR Ratio | ARR Trend | Interpretation |
|-------------|-----------|--------------|-----------|-----------------|
| 90-100 | > 15%/month | > 3:1 | Rapidly growing | Exceptional revenue, strong expansion |
| 70-89 | 10-15%/month | 2:1 to 3:1 | Growing | Good growth, controlled churn |
| 50-69 | 5-10%/month | 1.5:1 to 2:1 | Stable | Moderate growth, balanced metrics |
| 30-49 | 0-5%/month | 1:1 to 1.5:1 | Flat/Declining | Slowing growth or churn concerns |
| 0-29 | Negative | < 1:1 | Declining | Declining revenue, churn outpacing growth |

**Calculation**:
```
mrr_growth_score = (growth_rate + 20) × 2.5  // Normalize -20% to +30% onto 0-100 scale
ratio_score = (ratio / 3) × 100  // Normalize 0:1 to 3:1 ratio onto 0-100 scale
revenue_score = (mrr_growth_score × 0.50) + (ratio_score × 0.30) + (arr_trend_score × 0.20)
```

**Special Rule**: If MRR negative (declining), cap dimension score at 15 (existential risk).

### Product Quality Dimension (0-100 scale)

**Inputs**: NPS (40% if available, else 0% and redistribute), feature_adoption_rate (35%), engagement_metrics (25%)

| Score Range | NPS | Feature Adoption | Engagement | Interpretation |
|-------------|-----|-----------------|-----------|-----------------|
| 90-100 | > 70 | > 75% | > 60% | Excellent product, high satisfaction |
| 70-89 | 50-70 | 60-75% | 45-60% | Good product fit, areas to improve |
| 50-69 | 30-50 | 40-60% | 30-45% | Acceptable quality, issues present |
| 30-49 | 10-30 | 20-40% | 15-30% | Significant quality concerns |
| 0-29 | < 10 | < 20% | < 15% | Critical quality problems |

**Calculation with NPS**:
```
product_quality_score = (nps_score × 0.40) + (feature_adoption × 0.35) + (engagement_score × 0.25)
```

**Calculation without NPS**:
```
product_quality_score = (feature_adoption × 0.60) + (engagement_score × 0.40)
```

### Financial Sustainability Dimension (0-100 scale)

**Inputs**: runway_months (40%), burn_rate_trend (30%), LTV_to_CAC_ratio (30%)

| Score Range | Runway | Burn Trend | LTV:CAC | Interpretation |
|-------------|--------|-----------|---------|-----------------|
| 90-100 | > 24 months | Declining | > 3:1 | Sustainable path, strong efficiency |
| 70-89 | 18-24 months | Stable | 2-3:1 | Good financial health |
| 50-69 | 12-18 months | Stable/Inc | 1.5-2:1 | Adequate, monitor burn |
| 30-49 | 6-12 months | Increasing | 1-1.5:1 | Financial pressure emerging |
| 0-29 | < 6 months | Rapidly inc | < 1:1 | Critical financial stress |

**Calculation**:
```
runway_score = min(runway_months / 24 * 100, 100)  // Linear 0-100 scale
burn_trend_score = 50 + (trend_direction × 25)  // Declining = +25, Stable = 0, Increasing = -25
ltv_cac_score = (ratio / 3) × 100  // Linear scale 0:1 to 3:1 onto 0-100

financial_score = (runway_score × 0.40) + (burn_trend_score × 0.30) + (ltv_cac_score × 0.30)
```

**Special Rule**: If runway < 3 months, cap dimension score at 25 (emergency indicator).

### Market Fit Dimension (0-100 scale)

**Inputs**: NPS_trend (30%), organic_growth_rate (35%), activation_rate_trend (35%)

| Score Range | NPS Trend | Organic Growth | Activation Trend | Interpretation |
|-------------|-----------|----------------|-----------------|
| 90-100 | Increasing | > 10%/week | Improving | Strong market demand validation |
| 70-89 | Stable/Positive | 5-10%/week | Stable/Improving | Good market fit, growing organically |
| 50-69 | Flat | 2-5%/week | Stable | Moderate market fit |
| 30-49 | Declining | 0-2%/week | Declining | Weak market fit signals |
| 0-29 | Declining rapidly | < 0%/week | Declining | Poor market fit, weak demand |

**Calculation**:
```
nps_trend_score = 50 + (trend_direction × 25)  // Improving = +25, Stable = 0, Declining = -25
organic_growth_score = min(growth_rate / 10 * 100, 100)  // Linear 0-10% onto 0-100 scale
activation_trend_score = 50 + (trend_direction × 25)  // Same as NPS

market_fit_score = (nps_trend_score × 0.30) + (organic_growth_score × 0.35) + (activation_trend_score × 0.35)
```

## Composite Score Calculation

Weighted average of 6 dimensions with stage-dependent weights.

### Early/Seed Stage Weights

Emphasizes product validation and retention over revenue:

```
composite_score =
  (activation_score × 0.25) +
  (retention_score × 0.25) +
  (product_quality_score × 0.20) +
  (financial_sustainability_score × 0.20) +
  (revenue_score × 0.05) +
  (market_fit_score × 0.05)
```

**Rationale**: Early-stage ventures prioritize product-market fit validation. Revenue is secondary to retention and activation signals. Financial metrics important but growth is not yet primary goal.

### Growth Stage Weights

Emphasizes revenue efficiency and market fit:

```
composite_score =
  (revenue_score × 0.25) +
  (retention_score × 0.20) +
  (financial_sustainability_score × 0.20) +
  (market_fit_score × 0.20) +
  (activation_score × 0.10) +
  (product_quality_score × 0.05)
```

**Rationale**: Growth-stage ventures have validated product. Focus shifts to revenue growth, efficiency, and sustainability. Activation less critical (assumed high at this stage). Product quality maintenance important but lower priority.

### Handling Missing Dimensions

If dimension score marked "insufficient_data":
1. Exclude from weighted average
2. Renormalize weights to sum to 1.0
3. Multiply each remaining weight by (1.0 / sum_remaining_weights)
4. Note in output which dimensions excluded
5. Reduce confidence if > 1 dimension missing

**Example**: Early stage venture missing revenue data.
- Original weights: A=0.25, R=0.25, P=0.20, F=0.20, Rev=0.05, M=0.05
- Sum without Rev: 0.95
- New weights: A=0.263, R=0.263, P=0.211, F=0.211, M=0.053

## Alert Thresholds

### Composite Score Thresholds

| Score | Status | Action |
|-------|--------|--------|
| >= 65 | Healthy | Continue current strategy; monitor trends |
| 50-64 | Warning | Address at-risk dimensions; weekly review recommended |
| 30-49 | At-Risk | Urgent action required; escalate to leadership |
| < 30 | Critical | Emergency intervention required; consider pivot/wind-down |

### Dimensional Thresholds

| Score | Status | Action |
|-------|--------|--------|
| >= 40 | Healthy | Maintain; look for optimization opportunities |
| 20-39 | At-Risk | Requires focus and improvement plan |
| < 20 | Critical | Emergency intervention needed; single biggest risk |

**Rule**: If any dimension < 20, flag as critical regardless of composite score.

## Trend Determination

Trend calculated by comparing current score to previous period:

- **Improving**: Current score > Previous score + 2 points
- **Stable**: Current score within ±2 points of Previous score
- **Declining**: Current score < Previous score - 2 points
- **N/A**: No previous report or data insufficient

Minimum 2-point delta to avoid flagging normal volatility.

## Composite Trend

Composite trend determined by:
1. Calculate trend for each dimension
2. If 3+ dimensions improving: composite trend = improving
3. If 3+ dimensions declining: composite trend = declining
4. Otherwise: composite trend = stable

Alternative: Use composite score delta with 3-point minimum threshold.

## Special Cases

### Ventures with Extreme Growth
If venture shows explosive growth (> 50% MRR growth/month):
- Do not artificially cap scores for "overheating"
- Validate data quality (potential data error)
- Monitor sustainability and burn rate carefully
- Revenue score may legitimately be 95-100

### Early-Stage, Pre-Revenue Ventures
If venture has $0 MRR (pre-revenue):
- Use 50 (neutral) for revenue score
- Exclude from composite if <1 month post-launch
- Or use 20 (indicating early stage) if validating pricing
- Clear policy in venture context

### Ventures in Pivot
If venture recently pivoted (< 4 weeks):
- Mark health report as "post-pivot"
- Use limited historical trend (only compare within pivot)
- Don't penalize for pre-pivot declines
- Expect metrics to be noisy during transition

## Quality Assurance

Before finalizing health report:

1. **Score Range Check**: All dimension scores 0-100
2. **Composite Calculation**: Verify within ± 0.5 of manual calculation
3. **Weight Sum**: Confirm weights sum to 1.0
4. **Threshold Application**: Correct status assigned per thresholds
5. **Trend Logic**: Trends match score deltas
6. **Data Sources**: All metrics from valid snapshot
7. **Consistency**: Same input always produces identical output

## Governance and Escalation

Health scores feed governance decisions:

| Composite | Action |
|-----------|--------|
| >= 70 | No intervention; continue execution |
| 60-69 | Quarterly review; address specific dimensions |
| 50-59 | Monthly check-ins; develop improvement plan |
| 40-49 | Bi-weekly reviews; strategic decisions pending |
| 30-39 | Weekly governance meetings; pivot evaluation |
| < 30 | Emergency board session; wind-down planning |

Portfolio leadership uses health scores and trends to guide venture support and resource allocation.
