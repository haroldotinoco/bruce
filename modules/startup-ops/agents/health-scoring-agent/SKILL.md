# Health Scoring Agent

## Overview

The Health Scoring Agent transforms raw operational metrics into actionable health scores across six critical dimensions. It applies stage-appropriate rubrics, calculates dimensional scores with consistency rules, and produces a composite health score that executive stakeholders can use to quickly assess venture operational status.

## Role

Health score calculator and dimension evaluator. Translates raw metrics into 0-100 dimensional scores with trend indicators and alert flags.

## Objectives

1. **Dimensional Scoring**: Calculate 0-100 scores for activation, retention, revenue, product quality, financial sustainability, and market fit
2. **Composite Scoring**: Aggregate dimensional scores into single health metric with stage-appropriate weights
3. **Trend Analysis**: Track trend direction for each dimension (improving, stable, declining)
4. **Risk Flagging**: Flag at-risk dimensions (< 40) and critical dimensions (< 20)
5. **Stage-Aware Evaluation**: Apply different rubrics and weights based on venture stage

## Key Characteristics

- **Deterministic Scoring**: Uses explicit rubrics with clear metric-to-score mapping
- **Stage-Appropriate**: Different scoring weights for seed/early vs growth stage
- **Structured Output**: Uses JSON schema with defined score ranges and flag indicators
- **Lightweight**: Processes metric snapshots without external API calls
- **Temperature**: 0.1 (highly deterministic evaluation)
- **Provider**: OpenAI GPT-4o with structured outputs

## Task Type

Data transformation and evaluation using stage-appropriate rubrics. Deterministic scoring with consistency rules.

## Decision Rules

1. **Dimensional Scoring**: Use explicit rubric per dimension:
   - **Activation**: Based on activation_rate and onboarding_completion_rate
   - **Retention**: Based on D7 and D30 retention rates, churn rate
   - **Revenue**: Based on MRR growth rate, ARR trajectory, new vs churned MRR ratio
   - **Product Quality**: Based on NPS (if available), feature adoption, bug report rate (if available)
   - **Financial Sustainability**: Based on runway months, burn rate trend, unit economics
   - **Market Fit**: Based on NPS trend, organic growth rate, activation rate trend

2. **Composite Score Calculation**: Weighted average with stage-dependent weights:
   - **Seed/Early Stage**:
     - Activation: 25%
     - Retention: 25%
     - Product Quality: 20%
     - Financial Sustainability: 20%
     - Market Fit: 10%
   - **Growth Stage**:
     - Revenue: 25%
     - Retention: 20%
     - Financial Sustainability: 20%
     - Market Fit: 20%
     - Activation: 10%
     - Product Quality: 5%

3. **Risk Thresholds**:
   - Composite score < 30: CRITICAL
   - Composite score < 50: WARNING
   - Any dimension < 20: CRITICAL dimension
   - Any dimension < 40: AT-RISK dimension

4. **Trend Determination**: Based on previous score (if available):
   - Trend up: Current > Previous + 2 points
   - Trend down: Current < Previous - 2 points
   - Stable: Within 2 points of previous

5. **Missing Data Handling**:
   - If metric data missing, score that sub-dimension at 50 (neutral)
   - Mark dimension as "insufficient data" if > 50% sub-metrics missing
   - Do not calculate composite if > 2 dimensional scores marked insufficient

## Inputs

```json
{
  "metric_snapshot": {
    "snapshot_id": "string",
    "venture_id": "string",
    "metrics": { ... }
  },
  "stage": "seed|early|growth",
  "nps_data": { "score": number, "sample_size": number },
  "previous_health_report_ref": "string (optional)"
}
```

## Outputs

Produces `health-report.schema.json` with:
- Unique health_report_id
- venture_id and scored_at timestamp
- stage
- Six dimensional scores (0-100): activation, retention, revenue, product_quality, financial_sustainability, market_fit
- Composite score (0-100)
- Trend per dimension (improving|stable|declining)
- List of at_risk_dimensions (< 40)
- List of critical_dimensions (< 20)
- Period covered

## Scoring Rubrics

### Activation Dimension (0-100)

Based on: activation_rate (40%), onboarding_completion_rate (35%), new_signups trend (25%)

| Score | Activation Rate | Onboarding Rate | Interpretation |
|-------|-----------------|-----------------|-----------------|
| 90-100 | > 80% | > 85% | Excellent conversion from signup to active user |
| 70-89 | 60-80% | 75-85% | Good activation with strong onboarding |
| 50-69 | 40-60% | 55-75% | Acceptable but room for improvement |
| 30-49 | 20-40% | 35-55% | Poor activation, immediate focus needed |
| 0-29 | < 20% | < 35% | Critical activation problem |

### Retention Dimension (0-100)

Based on: D7_retention (40%), D30_retention (40%), churn_rate (20%)

| Score | D7 Retention | D30 Retention | Interpretation |
|-------|--------------|---------------|-----------------|
| 90-100 | > 70% | > 50% | Excellent retention, strong product fit |
| 70-89 | 55-70% | 40-50% | Good retention, some churn normal |
| 50-69 | 40-55% | 25-40% | Acceptable but needs improvement |
| 30-49 | 25-40% | 15-25% | Poor retention, product issues likely |
| 0-29 | < 25% | < 15% | Critical retention problem |

### Revenue Dimension (0-100)

Based on: MRR_growth_rate (50%), new_to_churned_MRR_ratio (30%), ARR_trajectory (20%)

| Score | MRR Growth | New:Churned Ratio | Interpretation |
|-------|-----------|------------------|-----------------|
| 90-100 | > 15%/month | > 3:1 | Exceptional revenue growth, strong expansion |
| 70-89 | 10-15%/month | 2:1 to 3:1 | Good growth with controlled churn |
| 50-69 | 5-10%/month | 1.5:1 to 2:1 | Moderate growth, balanced acquisition/churn |
| 30-49 | 0-5%/month | 1:1 to 1.5:1 | Slowing growth or churn exceeding new MRR |
| 0-29 | Negative | < 1:1 | Declining revenue, churn outpacing growth |

### Product Quality Dimension (0-100)

Based on: NPS (40%), feature_adoption_rate (35%), bug_report_rate (25%)

| Score | NPS | Feature Adoption | Interpretation |
|-------|-----|-----------------|-----------------|
| 90-100 | > 70 | > 75% | Excellent product, high satisfaction |
| 70-89 | 50-70 | 60-75% | Good product fit, room for improvement |
| 50-69 | 30-50 | 40-60% | Acceptable, but quality issues present |
| 30-49 | 10-30 | 20-40% | Significant quality concerns |
| 0-29 | < 10 | < 20% | Critical quality problems |

If NPS data unavailable, use 50% weight on feature adoption and 50% on engagement metrics.

### Financial Sustainability Dimension (0-100)

Based on: runway_months (40%), burn_rate_trend (30%), unit_economics (30%)

| Score | Runway | Burn Trend | Unit Economics | Interpretation |
|-------|--------|-----------|----------------|-----------------|
| 90-100 | > 24 months | Declining/stable | LTV:CAC > 3:1 | Sustainable growth path |
| 70-89 | 18-24 months | Stable | LTV:CAC 2-3:1 | Good financial health |
| 50-69 | 12-18 months | Stable/increasing | LTV:CAC 1.5-2:1 | Adequate but monitor burn |
| 30-49 | 6-12 months | Increasing | LTV:CAC 1-1.5:1 | Financial pressure emerging |
| 0-29 | < 6 months | Rapidly increasing | LTV:CAC < 1:1 | Critical financial stress |

### Market Fit Dimension (0-100)

Based on: NPS_trend (30%), organic_growth_rate (35%), activation_rate_trend (35%)

| Score | NPS Trend | Organic Growth | Activation Trend | Interpretation |
|-------|-----------|----------------|-----------------|
| 90-100 | Increasing | > 10%/week | Improving | Strong market demand |
| 70-89 | Stable/positive | 5-10%/week | Stable/improving | Good market fit |
| 50-69 | Flat | 2-5%/week | Stable | Moderate market fit |
| 30-49 | Declining | 0-2%/week | Declining | Weak market fit signals |
| 0-29 | Declining rapidly | < 0%/week | Declining | Poor market fit |

## Composite Score Formula

**Weighted Average** with stage-dependent weights:

```
Composite = (Activation × wA) + (Retention × wR) + (Revenue × wRev) + (ProductQuality × wPQ) + (FinancialSustainability × wFS) + (MarketFit × wMF)

Early/Seed Stage: wA=0.25, wR=0.25, wPQ=0.20, wFS=0.20, wRev=0.05, wMF=0.05
Growth Stage: wRev=0.25, wR=0.20, wFS=0.20, wMF=0.20, wA=0.10, wPQ=0.05
```

Weights must sum to 1.0. If any dimension marked "insufficient data", exclude from weighted average and renormalize weights to sum to 1.0.

## SLAs

- **Scoring Latency**: Must complete within 60 seconds from metric snapshot input
- **Consistency**: Same metric snapshot must produce identical scores across runs
- **Accuracy**: Dimension scores must match rubric within ± 1 point

## Integration Points

- **Inputs**: metric-snapshot from metrics-ingestion-agent
- **Outputs**: ops-advisor, weekly-ops-reporter, anomaly-detector (uses for severity context)
- **State**: Stores previous health reports for trend calculation
- **Observability**: Emits health score events for monitoring

## Failure Modes

| Scenario | Handling |
|----------|----------|
| Missing metric snapshot | Return error, do not calculate |
| > 2 dimensional scores with insufficient data | Return error, require metric ingestion retry |
| Invalid metric values (negative rates, rates > 100%) | Log error, use 50 (neutral) for affected sub-metric |
| Composite score NaN (weights don't sum to 1) | Log error, recalculate with normalized weights |
| Previous health report not found | Calculate composite without trend, mark trend as N/A |

## Provider Configuration

- **Model**: openai/gpt-4o
- **Temperature**: 0.1 (deterministic evaluation)
- **Max Tokens**: 2000
- **Timeout**: 60 seconds per execution

## Observability

Emits events:
- `health.score.calculated`: Health score completed with composite score
- `health.dimension.at_risk`: Dimension score < 40
- `health.dimension.critical`: Dimension score < 20
- `health.composite.critical`: Composite score < 30
- `health.composite.warning`: Composite score < 50
- `health.trend.improving`: Dimension showing improving trend
- `health.trend.declining`: Dimension showing declining trend
