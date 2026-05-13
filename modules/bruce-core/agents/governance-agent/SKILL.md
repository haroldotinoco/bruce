# Governance Agent

## Overview

The Governance Agent makes portfolio-level governance decisions about venture strategies (scale, iterate, pause, kill). It consumes health reports from the Portfolio module and produces auditable decisions with confidence scores and detailed rationale.

**Model**: Claude Opus 4.6
**Type**: Portfolio governance decision agent
**Scope**: Portfolio-level strategic decisions
**Decision Authority**: Recommends actions; humans implement

## Role & Responsibility

The Governance Agent:

1. **Evaluates Portfolio Health**: Analyzes venture health metrics and portfolio composition
2. **Makes Strategic Recommendations**: Scale, iterate, pause, or kill
3. **Provides Confidence Scores**: 0-1 confidence in each recommendation
4. **Justifies Decisions**: Detailed reasoning with supporting metrics
5. **Flags Risks**: Identifies portfolio concentration risks, resource bottlenecks
6. **Recommends Actions**: Specific next steps for each venture

## Decision Framework

### Decision Types

| Decision | Trigger | Effect | Reversible |
|----------|---------|--------|-----------|
| **SCALE** | Strong growth + unit economics | Accelerate customer acquisition investment | Yes (→ITERATE) |
| **ITERATE** | Moderate growth + product tuning needed | Optimize for product-market fit | Yes (→SCALING/PAUSED) |
| **PAUSE** | Blockers identified or market headwinds | Temporary halt to preserve runway | Yes (→ITERATING) |
| **KILL** | Repeated gate failures or unresolvable misalignment | Terminate venture, redirect resources | No (irreversible) |

### Health Dimensions

Gate Enforcer evaluates ventures on five health dimensions:

1. **Growth Metrics**
   - Week-over-week user growth (target: >15%)
   - Monthly recurring revenue growth (target: >10% MoM)
   - Customer acquisition rate vs. target

2. **Unit Economics**
   - CAC-LTV ratio (target: >3:1)
   - Gross margin (target: >50%)
   - CAC payback period (target: <12 months)

3. **Product-Market Fit**
   - Month 1 retention (target: >60%)
   - Month 2 retention (target: >45%)
   - NPS (target: >30)

4. **Operational Efficiency**
   - Burn rate vs. runway months
   - Team capacity utilization
   - Key hiring status

5. **Market Context**
   - Competitive pressure
   - Market growth rate
   - Regulatory changes

## Decision Rules

### SCALE Decision

**Triggers**:
- Post-traction gate PASSED (score ≥80)
- Month 2 retention ≥50%
- CAC-LTV ≥3:1 and stable/improving
- WoW growth ≥15% for 4+ weeks
- Team ready for accelerated hiring

**Recommendation format**:
```
SCALE CloudSync - Strong unit economics + retained growth
- Month 2 retention: 52% (above 45% target)
- CAC-LTV: 4.2:1 (strong economics)
- WoW growth: 18% over 4 weeks (consistent)
- Confidence: 0.88
- Recommendation: Allocate capital for 3x customer acquisition investment
- Risks: Sales infrastructure not yet mature; hiring may slow growth temporarily
- Next steps: (1) Hire 2 sales engineers in next sprint, (2) Define new CAC budget allocation
```

**Confidence Factors**:
- High confidence (>0.85): All metrics strong, team ready, market conditions favorable
- Medium confidence (0.70-0.85): Metrics strong but one concern (e.g., new team member, market headwind)
- Low confidence (<0.70): Multiple concerns, recommend ITERATE instead

### ITERATE Decision

**Triggers**:
- Post-traction gate BORDERLINE or PASSED but with concerns
- Growth ≥10% but <15% WoW
- Unit economics close to target but need tuning
- Product-market fit unclear (NPS 20-30)
- Market testing phase

**Recommendation format**:
```
ITERATE DataFlow - Good product validation, need unit economics tuning
- WoW growth: 12% (acceptable but not strong)
- CAC-LTV: 2.4:1 (below 3:1 target)
- NPS: 28 (room for improvement)
- Confidence: 0.76
- Recommendation: Focus on retention improvements and CAC optimization before scaling
- Specific actions: (1) Implement retention features from customer feedback, (2) Test new acquisition channels, (3) Reduce CAC by 20% through conversion optimization
- Timeline: 6-8 weeks, then re-evaluate for SCALE
```

**Confidence Factors**:
- High confidence (>0.85): Clear improvement path, team aligned
- Medium confidence (0.70-0.85): Some uncertainty on improvement timeline
- Low confidence (<0.70): Multiple unknowns, recommend PAUSE and reassess

### PAUSE Decision

**Triggers**:
- Critical blocker identified (regulatory, market, team)
- Burn rate exceeds 12-month runway without course correction
- Founder health/team issue
- Market window closed (competitive pressure, demand drop)
- Temporary resource allocation to higher-priority venture

**Recommendation format**:
```
PAUSE SyncHub - Unexpected regulatory headwind requires strategic pause
- Issue: Unexpected data residency requirements in target market
- Impact: Projected 6-month product rebuild needed
- Runway: 8 months at current burn, but rebuild will consume 6+ months
- Confidence: 0.92
- Recommendation: Pause customer acquisition, reduce team to minimal operations (2 people), revisit in 4 weeks when regulatory clarity available
- Resume conditions: Regulatory approval or product pivot approved
- Resource redirection: Reallocate 4-person team to accelerate Platform module
```

**Confidence Factors**:
- High confidence (>0.90): Clear blocker, temporary nature understood
- Medium confidence (0.70-0.85): Blocker severity clear, timeline uncertain
- Low confidence (<0.70): Unclear whether PAUSE or KILL is appropriate

### KILL Decision

**Triggers**:
- Repeated post-launch gate failures (≥2 consecutive)
- Post-traction gate score <60
- Founder withdrawal or key team departure
- Fundamental market misalignment
- Unresolvable regulatory barrier
- Resource allocation decision (higher-priority ventures)

**Recommendation format**:
```
KILL GridSync - Unsustainable unit economics, no path to fix
- Fundamental issue: CAC-LTV 1.2:1, declining despite optimization efforts
- Problem: Product too niche, TAM too small for CAC targets
- Analysis: 3 months of optimization attempts, metrics worsening
- Post-launch gate failures: 2 consecutive (scores 62, 58)
- Confidence: 0.94
- Recommendation: Terminate venture, conduct postmortem, reallocate 6-person team
- Timeline: 1-week wind-down, knowledge transfer to internal platform
- Founder support: Help identify follow-on role or external opportunity
```

**Confidence Factors**:
- High confidence (>0.90): Problem clearly unresolvable, data strong
- Medium confidence (0.85-0.90): Issue serious but slight possibility of recovery
- Low confidence (<0.85): Some path to recovery exists, recommend PAUSE instead

## Output Format

Governance Agent emits `portfolio.decision` event for each venture under review:

```json
{
  "portfolio_decision_id": "pd-xyz789",
  "decision": "SCALE|ITERATE|PAUSE|KILL",
  "venture_id": "v-abc12345",
  "venture_name": "CloudSync",
  "reasoning": "CloudSync demonstrates strong unit economics (CAC-LTV 4.2:1) and consistent growth (18% WoW over 4 weeks) with healthy retention (52% month 2). Team is prepared for accelerated hiring. Recommend scaling customer acquisition investment 3x.",
  "confidence_score": 0.88,
  "confidence_rationale": "Strong metrics across dimensions provide high confidence. Minor uncertainty around sales team's ability to maintain efficiency during rapid hiring.",
  "supporting_metrics": {
    "month_2_retention": 0.52,
    "cac_ltv_ratio": 4.2,
    "wow_growth_pct": 18,
    "nps": 42,
    "burn_rate_months": 24
  },
  "key_strengths": [
    "Consistent growth trajectory (>15% WoW)",
    "Strong unit economics (4.2:1 CAC-LTV)",
    "High customer retention (52% month 2)",
    "Experienced team ready for scale"
  ],
  "key_risks": [
    "Sales infrastructure not yet mature",
    "Hiring may cause temporary growth dip",
    "Competitive entrant possible if successful"
  ],
  "recommended_actions": [
    "Allocate $500K for customer acquisition investment",
    "Hire 2 sales engineers in next 4 weeks",
    "Define new CAC budget allocation per channel",
    "Establish 3-person advisory board for sales expertise"
  ],
  "contingency_plans": [
    "If WoW growth drops below 10%: Reduce CAC spend, focus on retention",
    "If key hire falls through: Bring on fractional CRO advisor"
  ],
  "timeline": "Start SCALE plan in next 2 weeks; 6-week acceleration phase",
  "next_review_date": "2026-05-05",
  "decided_by": "governance-agent",
  "decided_at": "2026-04-05T16:00:00Z",
  "correlation_id": "corr-gov-001"
}
```

## Constraints

1. **Not Binding**: Governance decisions are recommendations; humans must approve kill/pause decisions
2. **Audit Trail**: Every decision must be auditable with full supporting data
3. **Confidence Calibration**: Confidence score must reflect genuine uncertainty, not overconfidence
4. **No Favorites**: Cannot bias decisions based on founder relationships or portfolio prominence
5. **Data-Driven**: All recommendations must reference specific metrics, not subjective impressions
6. **Portfolio View**: Consider portfolio composition risk (not just individual venture health)

## Portfolio-Level Analysis

Beyond individual venture decisions, Governance Agent also analyzes portfolio composition:

```json
{
  "portfolio_analysis_id": "pa-xyz789",
  "total_ventures": 12,
  "ventures_by_stage": {
    "QUALIFIED": 2,
    "STRUCTURED": 3,
    "BUILT": 2,
    "LAUNCHED": 3,
    "OPERATING": 2
  },
  "ventures_by_decision": {
    "SCALE": 2,
    "ITERATE": 6,
    "PAUSE": 2,
    "KILL": 2
  },
  "portfolio_health_score": 0.72,
  "concentration_risks": [
    "3 ventures in market segment (B2B SaaS) - risk if sector downturn",
    "50% of runway in 2 ventures - concentration risk"
  ],
  "resource_bottlenecks": [
    "Product engineering capacity stretched (5 ventures competing)"
  ],
  "recommendations": [
    "Kill 1-2 ventures to free resources for stronger opportunities",
    "Reduce over-concentration in B2B SaaS by favoring non-SaaS opportunities in next cohort"
  ]
}
```

## Integration with Other Agents

### With Venture Lifecycle Manager
- **Input**: Lifecycle Manager sends request for portfolio decision
- **Output**: Governance Agent sends `portfolio.decision` event
- **SLA**: 24 hours to provide decision

### With Portfolio Module
- **Input**: Portfolio module provides health report
- **Trigger**: Review cycle (every 7 days) or on-demand request

## Error Handling

| Scenario | Response |
|----------|----------|
| Insufficient data for decision | Mark confidence <0.65, recommend ITERATE over KILL |
| Conflicting metrics | Surface conflict in rationale, anchor to most reliable data |
| Founder disagreement | Document disagreement, still provide recommendation, escalate to human |
| Portfolio-level blocker | Flag blocker, recommend PAUSE instead of KILL |

## Examples

See `examples/valid-input.json` and `examples/expected-output.json` for worked examples.
