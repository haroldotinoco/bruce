# Opportunity Module Metrics

## Key Performance Indicators

All metrics are captured and aggregated at the weekly cycle level and rolled up monthly/quarterly.

---

## Discovery Metrics

### opportunities_discovered_per_cycle
**Definition:** Count of unique opportunities identified in a single discovery cycle

**Target:** 15 ± 5 opportunities per week (12 minimum, 25 maximum)

**Calculation:** COUNT(opportunities) WHERE status = "discovered" per scan_cycle_id

**Aggregation:**
- Weekly: Sum of all opportunities in 7-day cycle
- Monthly: Average of weekly values
- Quarterly: Average of monthly values

**Alert Threshold:**
- Below 12/week: Discovery insufficient; expand source coverage
- Above 25/week: Volume management required; rank and hold excess for next cycle

**Example Data:**
```json
{
  "metric": "opportunities_discovered_per_cycle",
  "week": "scan-2024-04-01",
  "value": 14,
  "target": 15,
  "variance": -1,
  "status": "within_target"
}
```

---

### discovery_confidence_distribution
**Definition:** Percentage of opportunities discovered at each confidence tier

**Tiers:**
- High: ≥ 0.8
- Medium: 0.7 - 0.79
- Low: 0.6 - 0.69
- Below Threshold: < 0.6 (should be rare)

**Target:** 60% ≥ 0.7 confidence (medium or high)

**Calculation:** COUNT(opportunity) / TOTAL WHERE discovery_confidence >= X

**Example Data:**
```json
{
  "metric": "discovery_confidence_distribution",
  "week": "scan-2024-04-01",
  "distribution": {
    "high_0_8_plus": {
      "count": 4,
      "percentage": 28.6
    },
    "medium_0_7_to_0_79": {
      "count": 6,
      "percentage": 42.9
    },
    "low_0_6_to_0_69": {
      "count": 4,
      "percentage": 28.6
    },
    "below_threshold_under_0_6": {
      "count": 0,
      "percentage": 0
    }
  },
  "target_medium_or_high_pct": 71.5,
  "target": 60,
  "status": "exceeds_target"
}
```

---

### geographic_diversity
**Definition:** Count of distinct geographic regions represented in discovered opportunities

**Target:** ≥ 3 regions per cycle

**Regions:** North America, Western Europe, APAC (excluding Singapore), LATAM, Middle East, Other

**Calculation:** COUNT(DISTINCT geographic_region) WHERE discovered = true

**Example Data:**
```json
{
  "metric": "geographic_diversity",
  "week": "scan-2024-04-01",
  "regions_covered": [
    "North America",
    "Western Europe",
    "APAC"
  ],
  "region_count": 3,
  "target": 3,
  "status": "meets_target"
}
```

---

### vertical_diversity
**Definition:** Count of distinct industry verticals represented in discovered opportunities

**Target:** ≥ 4 verticals per cycle

**Verticals:** Healthcare, Financial Services, Enterprise Software, Supply Chain, Sustainability, Education, Manufacturing, Other

**Calculation:** COUNT(DISTINCT vertical) WHERE discovered = true

**Example Data:**
```json
{
  "metric": "vertical_diversity",
  "week": "scan-2024-04-01",
  "verticals_covered": [
    "Healthcare",
    "Financial Services",
    "Enterprise Software",
    "Supply Chain"
  ],
  "vertical_count": 4,
  "target": 4,
  "status": "meets_target"
}
```

---

### source_concentration
**Definition:** Percentage of discoveries sourced from top source

**Target:** No single source > 30% of discoveries

**Calculation:** (COUNT(discovery_source = "X") / TOTAL) * 100 for top source

**Alert:** If any source > 30%, expand source diversity

**Example Data:**
```json
{
  "metric": "source_concentration",
  "week": "scan-2024-04-01",
  "top_source": "TechCrunch",
  "top_source_concentration_pct": 21.4,
  "target": 30,
  "status": "within_target",
  "source_breakdown": {
    "TechCrunch": 21.4,
    "VentureBeat": 14.3,
    "SEC.gov": 14.3,
    "LinkedIn": 14.3,
    "Other": 35.7
  }
}
```

---

## Analysis Metrics

### analysis_quality_score_distribution
**Definition:** Distribution of analysis quality scores (0-1) across all analyzed opportunities

**Target Mean:** ≥ 0.80

**Calculation:** AVG(analysis_quality_score) for all analyzed opportunities in cycle

**Example Data:**
```json
{
  "metric": "analysis_quality_score_distribution",
  "week": "scan-2024-04-01",
  "analyzed_count": 14,
  "mean_quality_score": 0.82,
  "min_quality_score": 0.68,
  "max_quality_score": 0.95,
  "percentile_25": 0.78,
  "percentile_50": 0.83,
  "percentile_75": 0.87,
  "target_mean": 0.80,
  "status": "exceeds_target"
}
```

---

### data_gap_frequency
**Definition:** Number and types of data gaps encountered during analysis

**Target:** < 15% of opportunities with material data gaps

**Categories:**
- tam_unestimable: Cannot estimate TAM
- willingness_to_pay_untested: No customer validation
- competitive_landscape_unclear: <2 competitors identified
- regulatory_path_unclear: Compliance requirements unknown

**Calculation:** COUNT(opportunities_with_gap) / TOTAL

**Example Data:**
```json
{
  "metric": "data_gap_frequency",
  "week": "scan-2024-04-01",
  "total_analyzed": 14,
  "opportunities_with_gaps": 2,
  "gap_frequency_pct": 14.3,
  "target": 15,
  "status": "within_target",
  "gap_types": {
    "tam_unestimable": 1,
    "willingness_to_pay_untested": 0,
    "competitive_landscape_unclear": 1,
    "regulatory_path_unclear": 0
  }
}
```

---

## Scoring Metrics

### score_distribution
**Definition:** Distribution of scores across all scored opportunities

**Target:**
- Advance (75-100): 15-25%
- Reconsider (60-74): 40-50%
- Reject (<60): 25-35%

**Calculation:** COUNT(opportunities) / TOTAL in each band

**Example Data:**
```json
{
  "metric": "score_distribution",
  "week": "scan-2024-04-01",
  "total_scored": 14,
  "distribution": {
    "advance_75_plus": {
      "count": 3,
      "percentage": 21.4,
      "target_range": "15-25%",
      "status": "within_target"
    },
    "reconsider_60_to_74": {
      "count": 6,
      "percentage": 42.9,
      "target_range": "40-50%",
      "status": "within_target"
    },
    "reject_below_60": {
      "count": 5,
      "percentage": 35.7,
      "target_range": "25-35%",
      "status": "slightly_above_target"
    }
  },
  "average_score": 61.2,
  "median_score": 62,
  "std_dev": 18.4
}
```

---

### dimension_inflation_tracking
**Definition:** Average score by dimension to detect scoring bias

**Target:** All dimensions 20 ± 3 average points (balanced scoring)

**Calculation:** AVG(dimension_score) for each dimension across all opportunities

**Alert:** If any dimension avg > 23 or < 17, recalibrate rubric

**Example Data:**
```json
{
  "metric": "dimension_inflation_tracking",
  "week": "scan-2024-04-01",
  "total_scored": 14,
  "dimensions": {
    "market_size": {
      "average": 18.6,
      "min": 0,
      "max": 25,
      "target": 20,
      "variance": -1.4,
      "status": "within_tolerance"
    },
    "urgency": {
      "average": 20.2,
      "min": 5,
      "max": 25,
      "target": 20,
      "variance": 0.2,
      "status": "well_calibrated"
    },
    "competition": {
      "average": 17.8,
      "min": 0,
      "max": 25,
      "target": 20,
      "variance": -2.2,
      "status": "within_tolerance"
    },
    "strategic_fit": {
      "average": 20.5,
      "min": 5,
      "max": 25,
      "target": 20,
      "variance": 0.5,
      "status": "well_calibrated"
    }
  }
}
```

---

### advancement_rate
**Definition:** Percentage of opportunities scoring ≥ 75 that actually advance to AddVenture

**Target:** ≥ 75% advancement of "advance" recommendations

**Calculation:** (COUNT(advanced = true) / COUNT(recommendation = "advance")) * 100

**Note:** Some "advance" opportunities may not advance immediately due to resource constraints; this tracks the follow-through rate.

**Example Data:**
```json
{
  "metric": "advancement_rate",
  "week": "scan-2024-04-01",
  "opportunities_recommended_advance": 3,
  "opportunities_actually_advanced": 3,
  "advancement_rate_pct": 100,
  "target": 75,
  "status": "exceeds_target"
}
```

---

### rejection_defensibility
**Definition:** Quarterly audit of rejected opportunities to validate scoring decisions

**Target:** ≥ 80% of rejections defensible in hindsight

**Methodology:**
- 3 months post-rejection, review market for any signals contradicting original rejection
- Score: defensible if market evolution supports original rejection reasoning
- Example: Blockchain rejected for "47 competitors" — if still true 3 months later, defensible

**Example Data:**
```json
{
  "metric": "rejection_defensibility",
  "quarter": "Q1-2024",
  "rejections_reviewed": 12,
  "rejections_defensible": 10,
  "defensibility_rate_pct": 83.3,
  "target": 80,
  "status": "exceeds_target",
  "indefensible_examples": [
    {
      "opportunity_id": "opp-2024-02-015",
      "original_rejection_reason": "market_too_small",
      "current_status": "major_funding_round_indicates_larger_market"
    }
  ]
}
```

---

## Pipeline Metrics

### opportunity_status_distribution
**Definition:** Count of opportunities at each stage of the opportunity lifecycle

**Stages:** discovered, screening, analyzing, scored, rejected, advanced

**Calculation:** COUNT(opportunity) WHERE status = X

**Example Data:**
```json
{
  "metric": "opportunity_status_distribution",
  "as_of_date": "2024-04-06T20:00:00Z",
  "distribution": {
    "discovered": 142,
    "screening": 8,
    "analyzing": 5,
    "scored": 0,
    "rejected": 47,
    "advanced": 12
  },
  "total_in_pipeline": 214,
  "notes": "High 'discovered' count reflects hold-over for volume management"
}
```

---

### pipeline_duration_per_step
**Definition:** Average time each opportunity spends in each pipeline step

**Target:**
- Discovery → Analysis: Same day (same cycle)
- Analysis → Scoring: Same day (same cycle)
- Scoring → Prioritization: Same day (same cycle)
- Prioritization → Output: Same day (same cycle)

**Calculation:** AVG(exit_time - entry_time) for each step

**Example Data:**
```json
{
  "metric": "pipeline_duration_per_step",
  "cycle": "scan-2024-04-01",
  "step_durations": {
    "discovery_to_analysis": {
      "average_seconds": 45,
      "min_seconds": 30,
      "max_seconds": 120,
      "target_seconds": 300
    },
    "analysis_to_scoring": {
      "average_seconds": 180,
      "min_seconds": 120,
      "max_seconds": 600,
      "target_seconds": 900
    },
    "scoring_to_prioritization": {
      "average_seconds": 45,
      "min_seconds": 30,
      "max_seconds": 90,
      "target_seconds": 300
    },
    "prioritization_to_output": {
      "average_seconds": 15,
      "min_seconds": 5,
      "max_seconds": 30,
      "target_seconds": 60
    }
  },
  "total_cycle_duration_minutes": 120,
  "target_cycle_duration_minutes": 45,
  "notes": "Exceeded target due to batch size (14 opportunities); normal for comprehensive cycles"
}
```

---

## Quality Assurance Metrics

### scoring_consistency
**Definition:** Variance in scoring for similar opportunities (calibration check)

**Target:** Similar opportunities (same vertical, similar TAM) within 5 points

**Methodology:** Monthly, identify 3-5 pairs of similar opportunities and verify scores within tolerance

**Example Data:**
```json
{
  "metric": "scoring_consistency",
  "month": "2024-04",
  "comparison_pairs": [
    {
      "pair": 1,
      "opportunity_a": "opp-2024-04-001",
      "opportunity_b": "opp-2024-04-003",
      "vertical": "fintech",
      "tam_similarity": "medium",
      "score_a": 82,
      "score_b": 76,
      "score_variance": 6,
      "tolerance": 5,
      "status": "slightly_outside_tolerance"
    }
  ],
  "overall_consistency": "acceptable",
  "notes": "Variance of 6 points acceptable given different urgency signals (compliance has regulatory tailwind)"
}
```

---

## Monitoring & Alerting

### SLA Compliance
- Weekly discovery cycle completes by Monday 8:00 AM UTC: Target 100%
- Individual opportunity analysis < 15 minutes: Target 95%
- Scoring accuracy (defensible post-hoc): Target ≥ 80%

### Alert Triggers
- Discovery rate <12 or >25 per week
- Any dimension average score >23 or <17
- Data gap frequency >15%
- Pipeline backlog >50 opportunities in "analyzing" stage
- Any rejection defensibility issue flagged in post-hoc review

---

## Monthly & Quarterly Reviews

### Monthly Metrics Review Cadence
Every month (first Friday), review:
1. Opportunities discovered, analyzed, scored, advanced
2. Discovery confidence distribution (target 60%+ ≥ 0.7)
3. Geographic & vertical diversity
4. Source concentration
5. Data gap patterns

### Quarterly Deep-Dive
Every quarter (first day of month), review:
1. Trend analysis: How have focus areas evolved?
2. Competitive landscape: New entrants in our target verticals?
3. Portfolio alignment: Are discoveries matching strategy?
4. Process improvement: Any policy rules leading to poor decisions?
5. Rejection defensibility: Audit 10-15 rejections
6. Scoring calibration: Any dimension inflation detected?

---

## Metric Retention & History

- Daily metrics: Retained for 30 days (hot storage)
- Weekly aggregates: Retained for 1 year (queryable)
- Monthly aggregates: Retained for 5 years (archive)
- Quarterly deep-dive findings: Retained for 5 years
- Annual audits: Retained indefinitely
