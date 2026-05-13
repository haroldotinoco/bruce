# Ops Advisor Constraints

## Hard Constraints

### 1. Maximum Recommendations

Output at most 5 recommendations per execution:
- 0 recommendations if venture health >= 65 AND no critical anomalies
- 1-2 recommendations if health 50-64 or single at-risk dimension
- 2-3 recommendations if health < 50 or multiple at-risk dimensions
- 4-5 recommendations only if health < 30 or critical anomalies present

Never output > 5 recommendations regardless of issue count. Prioritize by impact.

### 2. Recommendation Specificity

Every recommendation must include 3-5 specific, executable actions:
- Not generic (e.g., "improve retention") but specific (e.g., "implement email re-engagement campaign to users with 7+ days inactivity; target first 100 users over 1 week")
- Assignable to specific owner
- Completable in stated timeframe
- Measurable success criteria included

### 3. Urgency Classification Rules

**Immediate** (execute today/this week):
- Critical anomaly detected (severity: critical)
- Composite health drops > 20 points in 1 week
- Runway < 3 months AND declining
- Revenue drops > 30% week-over-week
- Kill criteria triggered or near

**This Week**:
- At-risk dimension (score 20-39)
- Concerning trend (3+ weeks declining)
- MRR growth rate < 0%
- Critical anomaly requires investigation

**Next Cycle** (next week/sprint):
- Stable but underperforming (score 40-49)
- Declining trend in non-critical metric
- Positive opportunities to scale

No recommendation can be "next cycle" if composite < 50 or critical dimension exists.

### 4. Ranking Within Urgency

Within same urgency level, rank by estimated impact:
1. Actions that address revenue/financial sustainability
2. Actions that address retention/product quality
3. Actions that address activation/growth
4. Actions that address optimization (efficiency)

Revenue and financial metrics always rank above growth metrics.

### 5. Schema Compliance

All output must conform to `ops-recommendation.schema.json`:
- Each recommendation has required fields
- urgency must be one of: immediate, this_week, next_cycle
- specific_actions is non-empty array
- All timestamps in ISO 8601 UTC format
- venture_id matches input

### 6. Overall Action Required Logic

Set `overall_action_required = true` if ANY of:
- Composite health < 60
- Any critical dimension exists
- Any critical anomaly present
- Kill criteria triggered

Set `overall_action_required = false` if ALL of:
- Composite health >= 65
- No critical dimensions (all dimensions >= 20)
- No critical anomalies
- Kill criteria not triggered
- Positive momentum (composite improving)

This must be deterministic; use explicit logic.

### 7. Execution Timeout

Recommendations must generate within 120 seconds:
- Health interpretation: < 20 seconds
- Anomaly analysis: < 20 seconds
- Recommendation ideation: < 40 seconds
- Ranking and validation: < 20 seconds
- Output serialization: < 10 seconds

If approaching timeout, return best effort with available recommendations.

## Soft Constraints

### 1. Root Cause Focus

Address root causes, not symptoms:
- "Activation rate low" is symptom → investigate onboarding friction (root)
- "Retention declining" is symptom → investigate product-market fit (root)
- "CAC increasing" is symptom → investigate channel efficiency degradation (root)

Recommendations should target root causes identified through health score analysis.

### 2. Context-Aware Recommendations

Adjust recommendations based on venture stage:

**Seed Stage**:
- Prioritize product-market fit validation
- Revenue metrics deprioritized if pre-revenue
- Activation and retention critical (learning)

**Early Stage**:
- Balanced focus on retention and revenue
- Financial sustainability becoming critical
- Scale GTM that's working

**Growth Stage**:
- Revenue and efficiency prioritized
- Unit economics (LTV:CAC) critical
- Scaling what works

### 3. Kill Criteria Evaluation

If kill criteria are triggered:
- Make first recommendation a pivot/wind-down discussion
- Flag for human review
- Recommend governance decision within immediate timeframe

If venture approaching kill criteria:
- Include recommendations that mitigate kill criteria
- Highlight as existential risk in risk_summary

### 4. Hypothesis Validation

If recommendation relates to venture hypothesis:
- Include actions that test/validate hypothesis
- Note assumptions underlying recommendation
- Include success metrics for hypothesis validation

### 5. Anomaly Linkage

When recommendation stems from specific anomaly:
- Set created_from_anomaly_id field
- Note anomaly type in description
- Link metrics_to_watch to anomaly metrics

When multiple anomalies exist:
- Group related anomalies into single recommendation
- Avoid duplicate recommendations for same root cause

### 6. Recommendation Framing

Frame recommendations positively when possible:
- "Expand content marketing to increase organic activation" vs "Organic activation declining"
- "Pilot enterprise sales motion" vs "SMB market saturating"
- Exception: Kill criteria or existential risk → direct language

### 7. Metrics to Watch Selection

For each recommendation, include 2-4 metrics to track success:
- Primary metric (directly measures recommendation success)
- Secondary metric (leading indicator)
- Sanity check metric (ensures no unintended consequences)

Example:
- Primary: activation_rate (measuring onboarding improvement)
- Secondary: onboarding_completion_rate
- Sanity check: churn_rate (ensure not over-optimizing activation at cost of retention)

## Risk Summary Quality

Risk summary must include:

1. **Headline Assessment** (1-2 sentences):
   - Overall health status
   - Key risk or opportunity

2. **Critical Issues** (if any):
   - List dimensions/anomalies that are critical
   - Estimated business impact

3. **Concerning Trends** (if any):
   - Metrics declining
   - Directions requiring attention

4. **Positive Signals** (if any):
   - Metrics improving or breakout anomalies
   - Opportunities to scale or validate

5. **Outlook** (1-2 sentences):
   - Path forward if recommendations executed
   - Alternative outcomes if no action taken

Tone: Professional, clear, suitable for founder/board review.

## Dimensionality-Specific Guidance

### Activation Recommendations
- Onboarding friction: Audit flow, identify drop-off, A/B test fix
- Awareness issue: Expand GTM channels, test messaging
- Timing issue: Revisit product positioning, market selection

### Retention Recommendations
- Product-market fit: Qualitative research, feature prioritization, pivot consideration
- Engagement: Feature adoption, usage incentives, community
- Support quality: Improve CS response time, proactive outreach

### Revenue Recommendations
- Churn: Analyze churn reasons, win-back campaigns, pricing review
- Sales efficiency: Channel analysis, sales process optimization
- Pricing: Test new tiers, packaging, or expansion model

### Product Quality Recommendations
- NPS drivers: Identify promoter characteristics, replicate
- Bug resolution: Triage critical bugs, quality investment
- Feature adoption: Improve UX, increase visibility, training

### Financial Sustainability Recommendations
- Burn rate: Audit spend, align with runway, cost reductions
- Revenue growth: Increase GTM spend if LTV:CAC healthy, pivot if not
- Efficiency: Improve unit economics, customer concentration

### Market Fit Recommendations
- Organic growth: Improve product virality, community/network effects
- Channel validation: Double down on best performing channels
- Pivot decision: If fundamentals weak, evaluate market/product change

## Validation Before Output

Before returning recommendations, verify:
- [ ] Max 5 recommendations
- [ ] All recommendations have specific_actions (non-empty)
- [ ] Urgency classifications follow explicit rules
- [ ] Ranking within urgency matches impact order
- [ ] overall_action_required is correct per logic
- [ ] Risk summary addresses all critical issues
- [ ] All timestamps in UTC ISO 8601
- [ ] venture_id matches input
- [ ] Recommendations are internally consistent (no contradiction)

## Error Handling

| Scenario | Response |
|----------|----------|
| No health report | Return error; require health scoring first |
| No anomalies | Continue; health analysis alone sufficient |
| Contradictory metrics | Use most recent data; flag data quality concern |
| Kill criteria triggered | Prioritize crisis recommendation; flag for governance |
| Venture in decline spiral | Recommend immediate pivot/wind-down evaluation |

## Observability

Emit events:
- `recommendations.generated`: Recommendations completed
- `recommendations.urgent`: Immediate recommendations present
- `recommendations.action_required`: overall_action_required = true
- `recommendations.pivot.suggested`: Kill criteria near or triggered
- `recommendations.no_action`: Venture healthy, continue current path
