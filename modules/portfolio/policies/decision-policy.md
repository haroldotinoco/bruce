# Portfolio Governance Decision Policy

## Overview

This policy defines the decision criteria for portfolio governance actions: SCALE, ITERATE, PAUSE, KILL, and CONTINUE. Decisions are based on quantitative metrics and qualitative factors evaluated by the governance-decision-agent with human oversight for high-stakes decisions (kills, large scale-ups).

---

## KILL Criteria

A venture should be killed when **any one of the following is met** and no exceptional circumstances override the decision:

### 1. No Meaningful Traction (Timing: 8+ weeks post-launch)
- **Metric**: < 100 DAU **AND** < $500 MRR
- **Rationale**: After 8 weeks, a venture should show at least modest early traction. This combination indicates the core value proposition is not resonating.
- **Exception**: If the venture is intentionally operating in stealth mode or pre-launch phase, skip this criterion.

### 2. Unsustainable Unit Economics
- **Metric**: CAC > 2x LTV **for 6+ consecutive weeks** with no improving trajectory
- **Rationale**: Even with some traction, if acquisition cost is more than twice lifetime value and not improving, the business model is fundamentally broken.
- **Calculation**:
  - CAC = Total marketing spend / New customers
  - LTV = Average revenue per customer × Gross margin × Average lifetime (months)
- **Exception**: For viral or organic-driven products where CAC is artificially low, focus on LTV/CAC trend rather than absolute ratio.

### 3. Hypothesis Disproven
- **Metric**: < 1% conversion rate with sufficient traffic (n >= 1,000 visits) over 4+ weeks
- **Rationale**: The core hypothesis about product-market fit is falsified by user behavior at scale.
- **Details**:
  - Conversion = Activated users / Total visitors
  - "Sufficient traffic" = at least 1,000 unique visitors to the product
  - "4+ weeks" = sustained low conversion, not a one-week anomaly
- **Exception**: If product has non-standard funnel (e.g., API-first, enterprise deals), apply custom conversion logic.

### 4. Market Access Blocked
- **Metric**: Regulatory, technical, or competitive barrier confirmed and unresolvable within 6 months
- **Examples**:
  - Regulatory block: "Payment processor won't service this market"
  - Technical: "Core technology patented by competitor; licensing unavailable"
  - Competitive: "Market captured by entrenched player with 80%+ share and switching costs >> customer LTV"
- **Rationale**: Market opportunity no longer exists regardless of execution.

### 5. Burn Rate Unsustainable
- **Metric**: Monthly burn > available runway ÷ 2 months **AND** no clear funding path
- **Rationale**: Venture will run out of money in < 2 months with no way to extend runway.
- **Details**:
  - Runway = Cash on hand / Monthly burn
  - "No clear funding path" = not in active fundraising process with serious interested investors OR not on track to profitability
  - Decision: Extend runway first via profitability or funding before killing.

---

## SCALE Criteria

A venture should be scaled when **ALL of the following are met**:

### 1. Strong Traction (Metric: MRR growth > 20% MoM for 3+ consecutive months)
- **Rationale**: Consistent strong growth shows product-market fit and execution capability.
- **Calculation**: (MRR this month - MRR last month) / MRR last month > 0.20
- **Duration**: 3 consecutive calendar months

### 2. Healthy Unit Economics
- **Metric**: LTV/CAC ratio > 3x **AND** improving or stable
- **Rationale**: Sustainable acquisition model with room for profitability.
- **Details**:
  - LTV and CAC must both be confidently measured (at least 20 customer cohorts)
  - Trend matters: ratio should be stable or improving, not declining

### 3. Strong Retention
- **Metric**: Day 30 retention (D30) > 40% **for current cohort**
- **Rationale**: Users are sticky; product delivers ongoing value.
- **Definition**: D30 = Active users on day 30 / Activated users on day 0
- **Timing**: Measured on most recent full cohort (at least 30 days old)

### 4. Composite Health Score > 75 for 4+ weeks
- **Metric**: Average of (product-market-fit score + traction score + unit-economics score + team score + runway score) > 75
- **Rationale**: Venture is performing well across all dimensions.
- **Scoring**: Each dimension 0-100
  - Product-market-fit: User feedback, NPS, problem discovery
  - Traction: Growth rate, adoption breadth
  - Unit-economics: LTV/CAC, gross margin, path to profitability
  - Team: Founder capability, domain expertise, cohesion
  - Runway: Months of cash available

---

## ITERATE Criteria

A venture should iterate when:

### Conditions Met
1. **Some traction** but not meeting SCALE criteria
   - MRR growth 10-20% MoM OR
   - 50+ DAU (showing early product-market fit signal) OR
   - LTV/CAC ratio 1.5-3x (improving but not yet healthy)

2. **Hypothesis partially validated**
   - Conversion rate 0.3-1% (weak but not disproven) OR
   - NPS 20-40 (users like it but not strongly) OR
   - Retention D30 20-40% (users return but not consistently)

3. **No kill criteria met**
   - Has > 2 months runway
   - No regulatory blockers
   - Burn rate manageable relative to progress

### Action for Iterate
- Maintain current or slight increase in allocation
- Focus resources on: GTM pivot, product changes, or market expansion
- Set 2-3 specific milestones for next review cycle
- Recheck decision in 2 weeks post-implementation of changes

---

## PAUSE Criteria

A venture should be paused when:

### Conditions Met
1. **External blocker** that may resolve in < 90 days
   - Market timing issue (market not ready; company entering target market)
   - Regulatory pending (awaiting decision; not permanently blocked)
   - Key team member temporarily unavailable but committed to return
   - Waiting for strategic partner decision

2. **Venture shows potential** (not a kill-level concern)
   - Health score > 40
   - Some positive metrics (even if slow)
   - Founder commitment confirmed despite blocker

### Action for Pause
- Reduce allocation: Maintain 1-2 FTE skeleton crew + essential infrastructure
- Set hard deadline for pause: 30, 60, or 90 days (explicit in decision)
- Define pause exit criteria: Blocker resolved? YES = resume, NO = evaluate for kill
- Document reason and expected resolution
- Budget savings from pause is reallocated to scaling ventures

### When Pause Becomes Kill
If pause period expires and blocker is NOT resolved, venture automatically enters kill evaluation (no credit extended for second pause).

---

## CONTINUE Criteria

A venture should continue (status quo) when:

### Conditions Met
1. **Meets health baseline** but not ready to scale
   - Health score >= 50
   - Runway > 4 months
   - Founder has not raised kill concerns

2. **Trajectory is positive** but early
   - Growth rate positive or inflecting
   - Recent product changes showing early traction signs
   - Team executing well against plan

### Action for Continue
- Maintain current allocation unchanged
- Review in standard 2-week cycle
- Monitor for changes warranting ITERATE or SCALE decision

---

## Human-in-the-Loop Requirements

### Mandatory Human Confirmation
The following decisions **always require human confirmation** before execution:

1. **KILL decisions** (100% of cases)
   - Escalation to leadership
   - Review kill record
   - Confirmation of learning extraction plan
   - Decision must be made within 72 hours of agent recommendation

2. **SCALE decisions with large budget increase** (> 1.5x current allocation)
   - Confirmation required
   - Review of resource plan
   - Approval within 48 hours

3. **PAUSE decisions > 90 days**
   - Confirmation required (avoid indefinite pauses)

### Autonomous Approval (No Human Required)
- CONTINUE decisions
- Small allocation adjustments (< 20% budget change)
- ITERATE decisions
- PAUSE decisions <= 90 days

### Human Review Timeline
- Kill decision confirmation: < 72 hours
- Scale decision confirmation: < 48 hours
- Default escalation if no human confirms: Hold decision pending escalation

---

## Decision Making Process

1. **Data Collection** (startup-ops module) - 24 hours
2. **Agent Analysis** (portfolio-analyst) - 24 hours
3. **Risk Assessment** (risk-monitor) - 12 hours
4. **Governance Decision** (governance-decision-agent) - 12 hours
5. **Human Gate** (if required) - 24-72 hours
6. **Execution** (bruce-core) - Next cycle

**Total SLA**: Decisions made within 48 hours of data collection (non-blocking if awaiting human confirmation).

---

## Exceptional Circumstances

The governance-decision-agent may override standard criteria if:

1. **Black swan event** impacting entire market (e.g., regulatory collapse, competitor acquisition shutting market)
   - Kill decision can be made without full metric validation
   - Human confirmation still required

2. **Strategic pivot** approved at leadership level
   - Metrics-driven criteria temporarily suspended
   - Decision documented with strategic rationale

3. **Force majeure** (founder death, critical infrastructure failure)
   - Special decision category
   - Always requires human judgment

---

## Metrics Reporting

All decisions must include:
- Primary metrics supporting decision
- Confidence score (0-100)
- Data freshness (when was this data collected?)
- Outliers and anomalies noted
- Assumptions made (e.g., cohort retention extrapolation)

---

## Revision History
- **2026-04-06**: Initial version
