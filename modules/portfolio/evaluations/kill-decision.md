# Kill Decision Evaluation: "Logify"

## Scenario: B2B Logistics SaaS Reaches Kill Criteria

**Decision ID**: dec_20260320_kill_001
**Venture**: Logify (AI-powered logistics optimization for SMBs)
**Review Date**: March 20, 2026
**Decision Date**: March 23, 2026

---

## Venture Overview

### Background
- **Launched**: June 2025
- **Weeks Live**: 40 (10 months)
- **Founder**: Alex Patel (previously logistics ops at mid-market logistics firm)
- **Team Size**: 2 FTE (Founder + 1 engineer)
- **Initial Hypothesis**: SMB logistics firms need AI to optimize routes; willing to pay $500-2000/month for 5-15% cost savings

### Current Metrics

| Metric | Value | Trend |
|--------|-------|-------|
| **DAU** | 47 | ↘️ (peak 120 at week 8) |
| **MRR** | $320 | ↘️ (peak $1,200 at week 10) |
| **Paid Users** | 4 | Flat |
| **Churn Rate (Monthly)** | 45% | ↗️ (increasing) |
| **Burn Rate** | $9,000/month | Steady |
| **Runway** | 2.3 months | Decreasing |
| **CAC** | $890 | High |
| **LTV** | $420 | Low |
| **LTV/CAC Ratio** | 0.47x | ✗ Critical |
| **Retention D30** | 18% | Very low |
| **Product Launches** | 3 major features (Oct, Dec, Feb) | Limited traction improvement |

---

## Kill Criteria Evaluation

### Criterion 1: No Meaningful Traction (After 8+ weeks)
**Metric Threshold**: < 100 DAU AND < $500 MRR

✓ **KILL CRITERIA MET**
- **DAU**: 47 (< 100) ✓
- **MRR**: $320 (< $500) ✓
- **Weeks**: 40 weeks (>>8 weeks) ✓

**Analysis**: At 10 months post-launch, Logify has not achieved even modest early traction. The trajectory has been downward since week 10 peak.

---

### Criterion 2: Unsustainable Unit Economics
**Metric Threshold**: CAC > 2x LTV for 6+ consecutive weeks with no improving trajectory

✓ **KILL CRITERIA MET**
- **CAC**: $890
- **LTV**: $420
- **Ratio**: 0.47x (actually inverse; CAC is far larger than LTV)
- **Duration**: Last 20+ weeks showing no improvement
- **Calculation Details**:
  - **CAC breakdown**: Spent $3,560 on Google Ads + 2 months founder sales time (value ~$2,500) / 4 customers = ~$1,515 actual CAC (conservative estimate using $890)
  - **LTV breakdown**: 4 customers × 7.5 months average lifespan (before churn) × $320 MRR / 4 = $420 (actual LTV even lower given 45% monthly churn)
  - **Ratio**: $890 / $420 = 2.1x (exceeds 2x threshold)

✓ **KILL CRITERIA MET**

**Analysis**: Unit economics are broken beyond repair. Even with zero CAC (organic), LTV of $420 doesn't support the business model at any reasonable cost structure.

---

### Criterion 3: Hypothesis Disproven
**Metric Threshold**: < 1% conversion rate with sufficient traffic (n >= 1,000 visits) over 4+ weeks

✓ **KILL CRITERIA MET**
- **Total Website Visitors (10 months)**: ~4,200
- **Trial Sign-ups**: 52
- **Conversion to Trial**: 1.2% (acceptable)
- **Trial to Paid**: 4 / 52 = 7.7% (acceptable at first glance)
- **Conversion from Visitor to Paid**: 4 / 4,200 = 0.095% (far below 1% threshold)

**Deep Hypothesis Examination**:
- **Hypothesis**: "SMB logistics firms need AI optimization; will pay for cost savings"
- **Reality**: Trial users appreciate the product, but don't perceive sufficient value to pay
- **Evidence**:
  - 48 trial users didn't convert (92% churn from trial)
  - Interviews revealed: "Nice tool, but we solve this internally" or "Already have vendor relationships"
  - No trial user reported 5%+ cost savings despite marketing claims
  - Interviews indicate: Real decision-makers (CTOs/Ops leads) weren't using trial; just tried it

**Failure Point**: The core hypothesis is disproven. SMB logistics firms don't perceive enough value from the product to pay. Distribution and product-market fit both lacking.

✓ **KILL CRITERIA MET**

---

### Criterion 4: Market Access Blocked
**Criteria**: Regulatory, technical, or competitive barrier confirmed and unresolvable within 6 months

**Partial Risk**
- **Competitive**: Already dominated by enterprise vendors (Descartes, Samsara, Fourkites) who have enterprise budgets
- **Regulatory**: Not a blocker (no regulated market)
- **Technical**: Not a blocker (AI capabilities available)
- **Distribution**: Very hard (B2B SMB logistics is fragmented and sticky)

**Verdict**: Market is competitive but not blocked. However, combined with other criteria, this is secondary.

---

### Criterion 5: Burn Rate Unsustainable
**Metric Threshold**: Monthly burn > available runway ÷ 2

- **Monthly Burn**: $9,000
- **Cash on Hand**: ~$21,000 (estimated)
- **Runway**: 2.3 months
- **Runway ÷ 2**: 1.15 months
- **Burn vs Threshold**: $9,000 > $9,565 threshold (yes)

**Verdict**: Runway is collapsing. Venture will be out of money in ~2 months with no funding path. This is a hard stop.

✓ **KILL CRITERIA MET**

---

## Summary: Kill Criteria Met

| Criterion | Threshold | Logify Status | Met |
|-----------|-----------|---------------|-----|
| **No Traction** | <100 DAU & <$500 MRR (8+ weeks) | 47 DAU, $320 MRR (40 weeks) | ✓ YES |
| **Broken Unit Econ** | CAC > 2x LTV (6+ weeks) | CAC $890 > 2x LTV $420 (20+ weeks) | ✓ YES |
| **Hypothesis Disproven** | <1% visitor-to-paid conversion (4+ weeks) | 0.095% (40+ weeks) | ✓ YES |
| **Market Blocked** | Regulatory/tech/competitive barrier | Competitive but not blocked | ✗ NO |
| **Burn Unsustainable** | Runway < 2 months, no funding path | 2.3 months runway, no funding interest | ✓ YES |

**Result**: **4 out of 5 kill criteria clearly met.** Recommendation: KILL

---

## Governance Decision

### Agent Recommendation
- **Decision**: KILL
- **Confidence**: 92%
- **Rationale Summary**:
  - Venture meets 4 out of 5 kill criteria
  - 10 months of data; trajectory is clear
  - Team is capable but hypothesis simply didn't validate
  - Resource better deployed elsewhere
  - Window for pivoting is closing (2.3 months runway)

### Supporting Data

#### Growth Trajectory (40 weeks of data)
```
Week 1-8:   MRR grows from $0 to $1,200 (encouraging)
Week 8-14:  MRR stable $1,000-1,200 (plateau)
Week 14-28: MRR declines to $400 (churn exceeds new sales)
Week 28-40: MRR flat $300-400 (4 customers, stable low)
```

#### Customer Feedback Themes
- Trial users: "Interesting, but we don't have this problem" (60%)
- Trial users: "Good, but too expensive for our use case" (20%)
- Trial users: "We use different vendor already" (15%)
- Trial users: "Would use if we were enterprise-sized" (5%)

#### Founder Sentiment
- Founder Alex has expressed: "Not sure product is right for market; considering pivot to enterprise segment"
- Founder has started exploring: "Alternative hypothesis around freight broker software"
- Implication: Founder's own assessment suggests current path is not viable

---

## Kill Record Creation

### Kill Record Details

```json
{
  "kill_id": "kill_20260323_logify_001",
  "venture_id": "logify",
  "venture_name": "Logify",
  "killed_at": "2026-03-23T10:00:00Z",
  "weeks_lived": 40,
  "decision_id": "dec_20260320_kill_001",
  "peak_metrics": {
    "mrr": 1200,
    "mrr_achieved_week": 10,
    "dau": 120,
    "dau_achieved_week": 8,
    "users": 52
  },
  "kill_reason": "hypothesis_disproven",
  "detailed_rationale": "After 40 weeks (10 months), Logify did not achieve product-market fit in the SMB logistics optimization market. Initial hypothesis that SMB logistics firms would pay $500-2000/month for AI-powered route optimization was disproven by: (1) Only 4/52 trial users converted to paid (7.7%), implying insufficient perceived value, (2) Interviews with prospects and customers revealed fundamental mismatch—customers solve this internally or via existing vendors, with switching costs prohibitive, (3) Unit economics unsustainable: CAC $890 vs LTV $420 (2.1x ratio), (4) Churn increasing to 45% monthly, (5) Runway depleting to 2.3 months with no meaningful funding prospects. While the team is capable and product is functional, the market hypothesis is disproven and path to profitability is not viable.",
  "final_metrics": {
    "mrr": 320,
    "dau": 47,
    "users": 4,
    "monthly_burn": 9000,
    "runway_months": 2.3,
    "team_size": 2
  },
  "learnings_extracted": [
    "SMB logistics market is sticky with enterprise vendor relationships; difficult to displace for cost optimization alone",
    "Hypothesis validation: Trial-to-paid conversion is a strong signal for product-market fit; <8% implies missing value prop",
    "Market timing: Distribution through consultants/integrators may be required for logistics tech (not true for many SaaS verticals)",
    "Product was functional but did not address real customer problem; feature quality alone insufficient without product-market fit",
    "Founder pivot: After 10 months of decline, founder instinct now pointing toward adjacent hypothesis (freight brokers). Consider supporting pivot or clean shutdown.",
    "Unit economics: With CAC $890, would need LTV >$2,670 to achieve healthy 3x ratio; logistics SMB market too price-sensitive",
    "Geographic factor: SMB logistics varies by region (US regional, international variants). Single-market GTM insufficient.",
    "Competitive landscape: Underestimated incumbent vendor relationships and enterprise platform expansion into SMB segment"
  ],
  "learning_record_refs": [
    "learning_20260323_logify_market_fit",
    "learning_20260323_logify_unit_econ",
    "learning_20260323_logify_distribution"
  ],
  "customer_impact": {
    "active_customers": 4,
    "action_taken": "migrated",
    "details": "The 4 paying customers (logistics firms managing 5-25 vehicles each) were notified of shutdown on 2026-03-22. Offered: (1) 3-month access extension to find alternative, (2) Full refund of remaining contract balance, (3) Data export. All 4 customers agreed to refund; 2 are evaluating enterprise competitors (Samsara, Descartes). No customer expressed frustration; most stated 'nice tool but not critical for our ops'."
  },
  "post_mortem_document": "doc_logify_postmortem_20260323",
  "killed_by": "Leadership (Human Confirmation - Sarah Chen, Portfolio Lead)"
}
```

---

## Human Confirmation Process

### Escalation
- **Kill Decision Confidence**: 92%
- **Status**: Requires human confirmation per policy
- **Escalated to**: Sarah Chen (Portfolio Lead) + CEO
- **Decision Date**: March 23, 2026

### Review Notes
**Sarah Chen (Portfolio Lead)**:
> "Kill decision is well-supported. 4/5 criteria met, 10 months of data, clear negative trajectory. Founder's own assessment supports this. Recommend approval. Alex should be offered opportunity to explore adjacent hypothesis (freight brokers) with modest runway extension if interested."

**CEO**:
> "Approve kill. Well-executed venture with capable founder. We learned that this market segment requires different distribution than expected. Alex is talented—support pivot exploration. Clean shutdown: offer 3-month customer extension + refund + data export. Recommend hiring Alex for next venture or ops role."

### Decision: APPROVED
- **Approved by**: Sarah Chen, Portfolio Lead + CEO
- **Approved at**: 2026-03-23 14:00 UTC
- **Status**: Kill decision officially confirmed

---

## Post-Kill Actions

### Immediate (March 23-25)
1. **Customer Notification**: Email to 4 customers with options (refund, extension, migration support)
2. **Team Notification**: Founder + engineer informed of decision; offboarding scheduled
3. **Learning Record Creation**: Initial learning records entered into bruce-memory
4. **Financial Closeout**: Process refunds, close AWS/infrastructure accounts

### Short-term (March 25-April 7)
1. **Post-Mortem Document**: Detailed analysis of what went wrong + lessons learned (shared with team)
2. **Founder Opportunity Discussion**:
   - Offer: 2-month runway extension to explore freight broker pivot OR
   - Offer: Transition Alex to operations/portfolio role at Bruce
3. **Asset Archival**: All code, data, customer records archived for 2-year retention
4. **Learning Synthesis**: Patterns from Logify kill fed into bruce-memory + intelligence synthesis for opportunity module (avoid similar hypotheses)

### Documentation
1. **Kill Record**: Stored in portfolio.state for historical reference
2. **Learning Records**: 3-4 learning records created + tagged for pattern extraction
3. **Post-Mortem**: 10-15 page detailed analysis shared with leadership
4. **Lessons**: Key learnings incorporated into opportunity module's market analysis criteria

---

## Lessons Learned (for Portfolio + Bruce)

### For Future Investment Decisions
1. **Market Entry Validation**: Require evidence of switching cost or vs. incumbent analysis earlier (week 4-6)
2. **Distribution Assumptions**: B2B SMB requires channel partners; direct sales may not work
3. **Trial-to-Paid Funnel**: <8% trial-to-paid is a clear red flag for insufficient product-market fit; escalate at week 6

### For Logify's Space (Logistics Tech)
1. **Market is Competitive**: Samsara, Descartes expanding downmarket; direct SMB play difficult
2. **Hypothesis Variants to Explore**: Freight brokers (higher CAC tolerance?), Enterprise API layer, Vertical SaaS (construction logistics, etc.)
3. **Distribution Path**: Consider integrations with freight marketplaces or TMS platforms rather than direct GTM

### For Portfolio Module
1. **6-month Review Trigger**: Had we reviewed at week 24 instead of waiting for standard bi-weekly, kill could have happened earlier, preserving ~$45k in burn
2. **Traction Inflection Metric**: If startup doesn't show inflection by month 3, set shorter review cadence or pause budget growth

---

## Allocation & Reallocation

### Freed Resources
- **Budget**: $9,000/month reallocated to portfolio pool
- **Headcount**: 2 FTE freed
  - Founder Alex: Offered transition to Bruce operations (accepted)
  - Engineer: Returned to hiring pool; subsequently hired by ZenNote venture
- **Tools Budget**: $200/month recovered

### Reallocation Plan (Approved)
| Destination | Amount | Reason |
|---|---|---|
| **Contingency Pool** | $5,000 | Operational buffer |
| **TaskFlow (pivot support)** | $2,000 | Critical pivot experiments |
| **Portfolio Overhead** | $2,000 | Post-mortem + learning synthesis |

---

## Founder Transition

### Alex Patel (Founder)
- **Status**: Offered 2-month runway extension to explore freight broker pivot
- **Decision**: Accepted runway extension; will explore new hypothesis with 1 FTE (reduced from 2)
- **New Venture Status**: TBD (will decide in 4 weeks if new venture or rejoin Bruce ops)
- **Timeline**: New venture decision by May 23, 2026

---

## Conclusion

This kill decision represents a healthy outcome for the portfolio:
1. **Clear Data**: 10 months of evidence, 4/5 kill criteria met
2. **Founder Capability Preserved**: Alex demonstrated strong execution; venture failure was market/hypothesis, not execution
3. **Speed of Decision**: Took 3 weeks from decision recommendation to final kill (within SLA)
4. **Learning Captured**: Clear patterns and learnings recorded for future ventures
5. **Graceful Closure**: Customers handled professionally; team transitioned constructively

**Venture Status**: KILLED ✓
**Resources Reallocated**: $9,000/month
**Founder Transition**: Accepted 2-month pivot exploration
**Learning Records**: 3 records created for bruce-memory
