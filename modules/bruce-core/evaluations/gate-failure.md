# Gate Failure Evaluation

## Scenario: Gate Failure Recovery - Multiple Attempts

### Overview

This evaluation covers a venture that fails a gate, takes corrective action, and successfully passes on a re-evaluation. Demonstrates gate failure handling and ITERATE pattern.

### Venture Details

- **Venture**: GridSync
- **Founder**: Bob Chen (First-time founder, startup advisor)
- **Problem**: Grid infrastructure monitoring for renewable energy
- **Market**: Utility/renewable energy operators
- **Status**: Stuck in STRUCTURED stage after post-structuring gate failures

### Timeline

- **T=0 (Jan 15)**: Venture enters STRUCTURED stage
- **T+4w (Feb 12)**: Gate evaluation #1 - Post-Structuring
- **T+4w evening**: Gate FAILED (64/75 score)
- **T+4w to T+8w**: Governance decision ITERATE
- **T+8w (Mar 12)**: Gate evaluation #2 - Post-Structuring (re-eval)
- **T+8w evening**: Gate FAILED again (68/75 score) - BORDERLINE
- **T+8w onwards**: Escalation to human for decision

### Evaluation #1: First Gate Evaluation

**Trigger**: All STRUCTURED stage modules (Brand, Builder, Market, Operator) completed

**Gate Evaluation Process**:

```
Criterion: Business Model Clarity
├─ Current: Unclear unit economics
├─ Issue: Utility operators use capital-intensive budgeting cycles
├─ Problem: Pricing model ($10K/year) not aligned with utility purchasing
├─ Score: 55/100
├─ Feedback: Model needs quarterly/annual licensing, not monthly

Criterion: Go-to-Market Plan
├─ Current: 3 channels identified
├─ Issue: All 3 channels require 12+ month sales cycles
├─ Problem: GTM assumes 6-month sales cycle
├─ Score: 58/100
├─ Feedback: Underestimated buyer complexity; need executive relationships

Criterion: Competitive Position
├─ Current: Differentiated on AI forecasting
├─ Issue: Competitors have similar ML capabilities
├─ Problem: Competitive moat not defensible
├─ Score: 62/100
├─ Feedback: Need deeper IP or customer lock-in strategy

Criterion: Financial Projections
├─ Current: Projected 50% YoY growth
├─ Issue: Growth assumes 6-month sales cycle (see GTM issue)
├─ Problem: Projections optimistic
├─ Score: 62/100
├─ Feedback: Revise projections based on actual sales cycle (18+ months)

Criterion: Resource Plan
├─ Current: 5-person team, CEO/CTO identified, Sales TBD
├─ Issue: No head of sales identified; critical gap
├─ Problem: Execution risk on revenue generation
├─ Score: 70/100
├─ Feedback: Need experienced sales leader before ramping
```

**Final Score**: (55*0.2 + 58*0.2 + 62*0.2 + 62*0.2 + 70*0.2) = 61.4 → **64/75**

**Status**: **FAILED** (64 < 70 threshold)

**Gate Decision**:
```
Decision: FAILED
Score: 64/75
Confidence: 0.78 (medium)
Rationale: Business model misaligned with utility operator purchasing realities.
Sales cycle and customer acquisition underestimated. Competitive position not sufficiently
defensible. Execution risk on revenue with open sales leadership role. Recommend 6-8 week
iteration on unit economics, GTM, and team before re-evaluation.
```

### Recovery: Iterate Phase (4 weeks)

**Governance Decision**: ITERATE

**Actions Taken**:

1. **Unit Economics Rework** (2 weeks)
   - Revised pricing to $60K-120K annually (quarterly billing)
   - Modeled based on utility operator budget cycles
   - Landed on $80K average, $200K LTV (3-year customer)

2. **GTM Refinement** (2 weeks)
   - Interviewed 10 utility operator procurement teams
   - Discovered key blockers: regulatory approval (3-4 months), budget cycles (Jan/Apr/Oct)
   - Revised sales cycle from 6 months to 12-18 months
   - Identified channel strategy: direct sales to utilities vs. partnerships with integrators

3. **Competitive Position** (1.5 weeks)
   - Researched competitive landscape deeper
   - Discovered most competitors focus on solar/wind plants; GridSync has hydro/grid focus
   - Developed defensibility story around hydro forecasting accuracy

4. **Team** (1.5 weeks)
   - Identified experienced sales leader (VP Sales from Schneider Electric)
   - Committed to start in 4 weeks
   - Retained for advisory board to unblock early GTM decisions

5. **Financial Projections** (1.5 weeks)
   - Revised growth model based on 18-month sales cycle
   - Year 1: 2 customers ($160K ARR)
   - Year 2: 8 customers ($320K MRR incremental)
   - Year 3: Expand to 20 customers ($400K MRR incremental)

### Evaluation #2: Re-evaluation (4 weeks later)

**Trigger**: Founder requested re-evaluation after addressing feedback

**Gate Evaluation Process**:

```
Criterion: Business Model Clarity
├─ Previous: 55 (unclear pricing, monthly model)
├─ Now: 78 (clear pricing, $80K annual, $200K LTV)
├─ Change: Annual pricing aligned with utility budgets, LTV-CAC 3:1
├─ Score: 78/100
├─ Feedback: Strong improvement; model now viable

Criterion: Go-to-Market Plan
├─ Previous: 58 (optimistic 6-month cycle)
├─ Now: 72 (realistic 18-month cycle, 2 channels researched)
├─ Change: Customer discovery revealed actual sales dynamics
├─ Issue: Still lacks partnership channel validation
├─ Score: 72/100
├─ Feedback: Direct sales channel solid; partnership channel needs testing

Criterion: Competitive Position
├─ Previous: 62 (weak differentiation)
├─ Now: 75 (hydro/grid focus differentiator, ML accuracy edge)
├─ Change: Deeper competitive research found market gap
├─ Score: 75/100
├─ Feedback: Defensible position in hydro market; watch for competitive response

Criterion: Financial Projections
├─ Previous: 62 (optimistic growth assumptions)
├─ Now: 70 (realistic based on 18-month sales cycle)
├─ Change: Conservatively modeled based on sales cycle
├─ Score: 70/100
├─ Feedback: Projections now credible; monitor for compression of sales cycle

Criterion: Resource Plan
├─ Previous: 70 (no head of sales)
├─ Now: 76 (VP Sales committed, strong hiring plan)
├─ Change: Recruited VP Sales from Schneider Electric; starts in 4 weeks
├─ Score: 76/100
├─ Feedback: Team now complete; execution risk significantly reduced
```

**Final Score**: (78*0.2 + 72*0.2 + 75*0.2 + 70*0.2 + 76*0.2) = 74.2 → **74/75**

**Status**: **BORDERLINE** (74 is between 70 and 75 threshold)

**Gate Decision**:
```
Decision: BORDERLINE
Score: 74/75
Confidence: 0.72 (medium - one area still uncertain)
Rationale: GridSync has made significant progress on business model and team.
Unit economics now sound ($200K LTV vs. $80K CAC = 2.5:1, path to 3:1). Sales cycle
realism addressed. Competitive position defensible. Minor uncertainty: Partnership
channel validation not yet proven, and new sales leader will take 4-6 weeks to ramp.
Recommend human review given score within 1 point of threshold.

Escalation required: YES
```

### Escalation Handling

**Escalation Details**:
- **Type**: Gate BORDERLINE
- **Venture**: GridSync (b-xyz789)
- **Score**: 74/75 (within 1 point of threshold)
- **Approver**: Portfolio Manager
- **SLA**: 24 hours
- **Context**: Venture made strong improvements on all criteria; only minor risk (new sales leader ramp)

**Human Review Decision**:

Portfolio Manager assessment:
```
GridSync demonstrates strong iteration. Previous issues (unit economics, team) are resolved.
New issues are execution risks, not fundamental model risks. New VP Sales from Schneider
is experienced; ramp risk is manageable. Score of 74 reflects realistic caution, not failure.

Recommend: APPROVE (treat as PASS)

Reasoning: The one-point gap is captured by sales leader ramp risk, which is
addressable through advisory board support. Venture is sufficiently improved to
warrant advancement to BUILT stage.
```

### Outcomes

**Venture State After Escalation Resolution**:
- Gate decision: APPROVED (override BORDERLINE to PASS)
- Current stage: STRUCTURED
- Next stage: BUILT
- Lifecycle action: Advance to BUILT
- Modules to dispatch: Market (GTM update), Operator (build tracking)

**Metrics**:

| Metric | Evaluation #1 | Evaluation #2 | Change |
|--------|---------------|---------------|--------|
| Business model clarity | 55 | 78 | +23 |
| GTM plan | 58 | 72 | +14 |
| Competitive position | 62 | 75 | +13 |
| Financial projections | 62 | 70 | +8 |
| Resource plan | 70 | 76 | +6 |
| **Overall score** | **64** | **74** | **+10** |

**Lessons Learned**

1. **Gate failures are recovery opportunities**: GridSync's failure drove important corrections (pricing model, sales cycle realism)

2. **Customer discovery validates**: Talking to 10 utility operators revealed true purchase process; invaluable for GTM refinement

3. **Experienced hires matter**: VP Sales hire increased confidence from 78 to 72+ on GTM criterion

4. **Borderline scores provide optionality**: Score of 74 (just below 75) gave Portfolio Manager flexibility to approve based on human judgment

5. **Timeline considerations**: 4-week iteration period was sufficient for major corrections; shows gate SLA allows meaningful improvement

### Risk Monitoring Post-Advancement

**Conditions for BUILT stage success**:
- VP Sales hire starts on schedule (4 weeks)
- Partnership channel identified and tested by end of Q2
- First customer pipeline established by end of BUILT stage
- Contingency: If sales cycle compresses below 12 months, can scale faster than projected

**Next gate** (Post-Build): Will validate MVP + GTM readiness before LAUNCHED

**Timeline**: Expect 12-14 week BUILT stage (longer than typical due to market complexity), targeting LAUNCHED in June 2026
