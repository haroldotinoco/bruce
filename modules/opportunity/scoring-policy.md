# Scoring Policy

## Scoring Framework

### Dimension Definitions & Rubrics

#### 1. Market Size (0-25 points)

| Score | TAM | SAM | SOM | Rationale |
|-------|-----|-----|-----|-----------|
| 25 | >$10B | >$2B | >$250M | Massive market; new entrant can build $1B+ company |
| 20 | $3-10B | $500M-2B | $50-250M | Large market; substantial opportunity for new player |
| 15 | $500M-3B | $100-500M | $10-50M | Medium market; viable company but requires strong positioning |
| 10 | $50-500M | $10-100M | $1-10M | Niche market; requires tight focus and efficiency |
| 5 | <$50M | <$10M | <$1M | Too small to support venture company |
| 0 | TAM unestimable | Impossible to estimate | Market doesn't exist | Cannot evaluate market size |

**Scoring Rules:**
- Use MINIMUM of three dimensions (TAM, SAM, SOM) — score reflects the constraint
- TAM < $50M → automatic 5 points max (too small)
- Apply confidence penalty: multiply by (analysis_confidence_level) — e.g., 0.65 confidence × 20 base points = 13 points
- Round to nearest integer

#### 2. Urgency (0-25 points)

| Score | Market Stage | Demand Signals | Competitive Activation | Customer Motivation |
|-------|--------------|-----------------|----------------------|-------------------|
| 25 | Established, booming | RFP activity, funding surge | Multiple new entrants | Buy now or lose competitively |
| 20 | Established, growing | Hiring surge, acquisition activity | Incumbent + 1-2 new players | Buy within 12 months |
| 15 | Emerging, recognized | Some hiring, media coverage | Emerging entrants | Buy within 18 months |
| 10 | Emerging, niche | Problem acknowledged but quiet | Mostly incumbents responding | Buying plans exist |
| 5 | Nascent, speculative | Academic papers, early signals | No activation | Hypothetical need |
| 0 | Not yet realized | No signals | No one competing | Customer indifferent |

**Scoring Rules:**
- Market readiness must align with TAM stage (established market with nascent TAM is red flag)
- Look for multiple independent signals (hiring + funding + enforcement = stronger signal than hiring alone)
- Regulatory enforcement actions count as high-urgency signal
- Penalty if customer willingness-to-pay is speculative: -3 points

#### 3. Competition (0-25 points)

| Score | Direct Competitors | Intensity | Differentiation | Barriers | Entry Path |
|-------|-------------------|-----------|-----------------|----------|-----------|
| 25 | 0 competitors | None | N/A | Extremely high | Clear, defensible niche |
| 20 | 1-2 competitors | Low | High opportunity | Very high | Direct, differentiation possible |
| 15 | 3-5 competitors | Medium | Medium opportunity | High | Indirect path, feature differentiation |
| 10 | 5-10 competitors | Medium-High | Low opportunity | Medium | Consolidation or niche |
| 5 | 10-15 competitors | High | Minimal | Low | Feature/price competition |
| 0 | 15+ competitors or dominant incumbent | Very High | None | None | Cannot compete |

**Scoring Rules:**
- Count actual competitors (companies selling into same customer segment with similar value prop)
- Distinguish direct (same solution) from indirect (different approach to same problem)
- Assess whether barriers are defensible (switching costs, network effects, brand, IP)
- "Market leader with 60%+ share" → automatic 5 points max (barrier too high for new entrant)
- Bonus for clear differentiation/defensibility: up to +3 points if articulated

#### 4. Strategic Fit (0-25 points)

| Score | Portfolio Alignment | Capital Efficiency | Team Skill Match | Operational Complexity | Exit Potential |
|-------|-------------------|-------------------|-----------------|----------------------|----------------|
| 25 | Perfect fit | Highly efficient | Excellent match | Low; quick scaling | Large exit ($500M+) |
| 20 | Strong fit | Efficient | Very good match | Medium; standard ops | Solid exit ($100-500M) |
| 15 | Good fit | Moderate efficiency | Good match | Medium; some complexity | Viable exit ($50-100M) |
| 10 | Tangential fit | Less efficient | Acceptable match | High; requires new ops | Smaller exit ($10-50M) |
| 5 | Weak fit | Inefficient | Poor match | Very high; new domain | Unclear exit |
| 0 | Misaligned | Completely inefficient | No match | Impossible ops | No exit path |

**Scoring Rules:**
- Strategic fit assessed against portfolio focus areas (healthcare, fintech, sustainability, etc.)
- Capital efficiency: compare to portfolio companies' capital intensity (SaaS efficient; hardware less so)
- Team skill match: Does portfolio have foundational skills or need to build entirely new expertise?
- Operational complexity: Can portfolio leverage existing operations or start from scratch?
- Exit potential: Can company realistically exit via acquisition or IPO in target timeframe?

### Bonus/Penalty Adjustments

#### When to Apply Bonuses

| Bonus | Points | Criteria |
|-------|--------|----------|
| Multiple market signals | +2 | 3+ independent signals (hiring + funding + enforcement) |
| Unique defensibility | +2 | Clear differentiation with sustainable moat |
| Regulatory tailwind | +1 | Regulatory change actively driving market (not speculative) |
| Founder-submitted opportunity | +1 | Portfolio founder identifies opportunity directly |

**Maximum bonus: +3 points total per opportunity**

#### When to Apply Penalties

| Penalty | Points | Criteria |
|---------|--------|----------|
| High regulatory ambiguity | -3 | Compliance path unclear or controversial (>50% regulatory uncertainty) |
| Major execution dependencies | -3 | Requires breakthrough in non-core area (complex hardware, new regulatory approval, etc.) |
| High customer acquisition cost | -2 | Estimated CAC > $150K with LTV/CAC ratio < 3 |
| Analysis confidence gaps | -2 to -3 | Material data gaps (TAM confidence < 0.6, willingness-to-pay untested) |
| Portfolio concentration | -2 | Similar opportunity already in portfolio within last 12 months |

**Maximum penalty: -5 points total per opportunity**

## Recommendation Logic

### Automatic Rules (No Exceptions)

- **Score 75-100**: ADVANCE (automatic) → Send to AddVenture module
- **Score 60-74**: RECONSIDER (automatic) → Hold for portfolio review or require additional analysis
- **Score < 60**: REJECT (automatic) → Archive, do not advance

### When Scoring Is Tied or Very Close

If two opportunities score within 3 points (e.g., 72 and 75):
1. Use discovery date as tiebreaker (older discovered opportunities prioritize)
2. Apply discovery confidence as secondary tiebreaker (higher confidence wins)
3. Escalate to portfolio leadership if > $1B TAM (large opportunity worth manual review)

## Policy Exceptions & Overrides

### When Policy Can Be Overridden
- Portfolio leadership explicitly directs override with written justification
- New market signal emerges (regulatory change, acquisition) that shifts scoring materially
- Founder/operator directly requests reconsideration

### Override Documentation
Any override requires:
1. Written explanation of which policy rule was overridden and why
2. Approval from portfolio leadership
3. New score with rationale documented
4. Entry in cycle notes for precedent tracking

## Quality Assurance & Calibration

### Monthly Scoring Review
- Track distribution of scores (are we clustering or spreading appropriately?)
- Monitor advancement rate (are 75%+ of "advance" scores actually advancing to structuring?)
- Review rejection justifications (are rejections defensible in hindsight?)

### Quarterly Recalibration
- If advancement rate < 70% or > 90%, revisit scoring rubrics
- If certain dimensions are inflating scores consistently, recalibrate that dimension
- If data gaps are material to scoring, request briefer analysis improvements

### Annual Scoring Audit
- Compare scored opportunities to actual venture performance
- Identify which scoring dimensions predicted success vs. failed
- Refine rubric based on real outcomes

## Dimension Independence

### Critical Rule: Dimensions Are Independent
- **Do not** use overall portfolio strategy as input to multiple dimensions
- Example: An opportunity strong on market size but weak on strategic fit should score:
  - Market size: 20 points (based on TAM/SAM/SOM alone)
  - Strategic fit: 8 points (based on alignment alone)
  - Total: 28 points (not inflated because other dimensions are weak)

### Integrity Check
Each dimension should be defensible on its own, not circular with other dimensions.

## Data Requirements for Scoring

### Minimum Data Required to Score
All of the following must be present to proceed with scoring:
1. Market size estimate (TAM/SAM/SOM with methodology documented)
2. Competition landscape (minimum 2 competitors or explanation if zero)
3. Problem statement (specific, not vague)
4. Target segment definition (identifiable customer group)
5. Analysis quality score indicating analyst confidence

### If Minimum Data Missing
- **Cannot score**: Return opportunity to analysis phase or reject
- **Low confidence**: Score but apply -3 confidence penalty to reflect data gaps

## Scoring Velocity Targets

- Target: 45 seconds per opportunity
- Maximum: 2 minutes per opportunity (hard timeout)
- Batch scoring: 20-25 opportunities per cycle
- If exceeding time budget: reduce detail or split into multiple scoring runs
