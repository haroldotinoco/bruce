# Opportunity Module Evaluation: Low-Score Rejection

## Scenario Summary
A market opportunity for "Blockchain-based supply chain tracking for SMB retailers" is discovered and submitted for evaluation. The opportunity scores 34/100 due to market saturation, unclear customer demand, and high competitive barriers. It is automatically rejected per scoring policy.

## Detailed Walk-Through

### Step 1: Opportunity Submission

**Source:** External submission via opportunity-screening workflow

**Submitted Opportunity Data:**
```json
{
  "title": "Blockchain-based supply chain tracking for SMB retailers",
  "problem_statement": "Small retailers want to track product origin and authenticity to combat counterfeit goods",
  "segment": "SMB retail (100-500 employees) in fashion, electronics, pharmaceuticals",
  "discovery_source": "Industry conference speaker pitch",
  "discovery_confidence": 0.55,
  "pain_points": [
    "Counterfeit goods reduce margins 2-5%",
    "Customer trust issues with unknown origins",
    "Manual tracking processes are error-prone"
  ],
  "market_signals": [
    "Blockchain industry enthusiasm (though declining)",
    "Some retailer interest in supply chain transparency",
    "Regulatory interest in counterfeit prevention (weak signal)"
  ]
}
```

### Step 2: Validation & Analysis

**Input:** Submitted opportunity data

**Agent Action: opportunity-analyst**

Analyst research findings:

**Market Size Assessment:**
- TAM estimation: $15B total supply chain transparency market
- SAM: $2.8B (applicable to SMB retail)
- SOM: $120M (achievable market for blockchain-specific solution)
- **Critical finding:** TAM confidence only 0.45 (highly speculative, many estimates vary 5x)

**Competitive Landscape:**
- 47+ blockchain supply chain startups in operation
- Established solutions: Walmart Food Trust, Everledger, VeChain, Ambrosus
- Low barrier to entry; many pivoting to different use cases
- No network effects locking in incumbents
- **Critical finding:** Extremely competitive; difficult to differentiate

**Customer Validation Status:**
- No evidence of willingness-to-pay among SMB retailers
- Interview attempts with retailers show low priority (not willing to pay > $50K/year)
- Blockchain cost-benefit not clear vs. simpler RFID or barcode tracking
- **Critical finding:** Value proposition unproven; customer acquisition cost likely prohibitive

**Market Stage Assessment:**
- Blockchain supply chain: Moving from hype cycle into "trough of disillusionment"
- Customer demand signals: Weakening (Gartner hype cycle analysis)
- Regulatory clarity: Absent (no clear compliance path)
- **Critical finding:** Market timing uncertain; may be 5+ years before viability

**Analysis Output:**
```json
{
  "opportunity_id": "opp-2024-04-reject-001",
  "analyzed_opportunity": {
    "title": "Blockchain-based supply chain tracking for SMB retailers",
    "market_size": {
      "tam": 15000000000,
      "sam": 2800000000,
      "som": 120000000,
      "confidence": 0.45,
      "confidence_note": "Highly speculative; TAM estimates vary widely depending on inclusion of adjacent markets"
    },
    "competition": {
      "direct_competitors": ["Walmart Food Trust", "Everledger", "VeChain", "Ambrosus", "TradeLens"],
      "indirect_competitors": 47,
      "competitive_intensity": "very_high",
      "differentiation_opportunities": [
        "Vertical specialization (but many startups already attempting)",
        "Cost reduction (but blockchain inherently expensive)"
      ]
    },
    "customer_validation": {
      "interviews_conducted": 8,
      "interviews_positive": 0,
      "average_willingness_to_pay": 25000,
      "customer_acquisition_cost_estimate": 150000,
      "ltv_cac_ratio": 0.17,
      "verdict": "Below viability threshold (ratio < 3)"
    },
    "market_stage": {
      "gartner_position": "Trough of Disillusionment",
      "maturity": "Post-peak hype, declining interest",
      "regulatory_clarity": "Absent; blockchain regulation unsettled"
    },
    "analysis_quality_score": 0.82,
    "key_risks": [
      "Customer willingness-to-pay far below required unit economics",
      "Blockchain cost structure makes competitive solutions cheaper",
      "Market timing uncertainty; viability 5+ years out",
      "47+ direct competitors reduce differentiation opportunity",
      "Regulatory path for blockchain in supply chain unclear"
    ]
  }
}
```

### Step 3: Scoring Phase

**Input:** Analyzed opportunity with critical warnings

**Agent Action: scoring-agent**

Scoring dimensions with rationale:

**Market Size (5 points)**
- TAM $15B, SAM $2.8B, SOM $120M → Base: 15 points
- **Confidence penalty:** 0.45 confidence × 15 = 6.75 → 7 points
- **Reduced further:** TAM heavily dependent on speculative blockchain adoption = additional penalty
- **Final: 5 points** (multiple dimensions at risk)

**Urgency (5 points)**
- Market stage: Post-hype trough = 0 base
- Demand signals: Weakening, not accelerating = 5 points
- Customer motivation: Low urgency to buy = factor down score
- **Critical:** Regulatory path unclear, blockchain market in decline
- **Final: 5 points**

**Competition (0 points)**
- 47+ direct competitors in market
- Established incumbents with network effects (Walmart Food Trust)
- Low differentiation opportunity (cost-based competition doesn't favor new entrant in blockchain)
- **Automatic rule applied:** "15+ competitors or dominant incumbent" → 0-5 point range
- **Critical finding:** Cannot compete against Walmart Food Trust network effects
- **Final: 0 points**

**Strategic Fit (8 points)**
- Portfolio focus: B2B SaaS infrastructure, not blockchain
- Capital efficiency: Blockchain is capital-intensive (expensive infrastructure)
- Team skill match: Portfolio expertise is in SaaS, not distributed systems
- Operational complexity: Blockchain requires new domain expertise and infrastructure
- Exit potential: Unclear (blockchain M&A market uncertain; strategic acquirers few)
- **Final: 8 points** (tangential fit at best)

**Penalties Applied:**

1. **High regulatory ambiguity** (-3 points): Blockchain regulation is unsettled; compliance path unclear (>50% uncertainty threshold met)

2. **Analysis confidence gaps** (-3 points): Material data gaps
   - TAM confidence 0.45 (well below 0.6 threshold)
   - Willingness-to-pay unproven through real customer commitments
   - Market timing highly uncertain

3. **High customer acquisition cost** (-2 points): Estimated CAC $150K with LTV/CAC ratio of only 0.17 (far below 3.0 threshold)

**Total Score Calculation:**
- Base dimensions: 5 + 5 + 0 + 8 = 18 points
- Bonuses: None applicable (no positive signals)
- Penalties: -3 (regulatory) + -3 (confidence gaps) + -2 (CAC) = -8 points
- **Final Score: 18 - 8 = 10 points**

**Capped at floor:** Score cannot go below 0, but 10 points is already in rejection range

**Actual Final Score: 10/100**

**Recommendation: REJECT** (score <60 falls in reject category per scoring policy)

**Scoring Output:**
```json
{
  "opportunity_id": "opp-2024-04-reject-001",
  "scoring_timestamp": "2024-04-06T08:30:00Z",
  "dimensions": {
    "market_size": {
      "score": 5,
      "rationale": "TAM highly speculative with low confidence (0.45); market size viable but dependent on uncertain blockchain adoption",
      "factors": [
        "TAM $15B but confidence penalty applied (0.45 multiplier)",
        "SOM $120M is small for venture company",
        "TAM estimates vary 5x depending on methodology"
      ]
    },
    "urgency": {
      "score": 5,
      "rationale": "Market at trough of disillusionment; demand signals weakening, not accelerating",
      "factors": [
        "Gartner positions blockchain supply chain in post-peak phase",
        "Customer interest declining",
        "Regulatory uncertainty reducing urgency",
        "No evidence of buy-now-or-lose-competitively dynamic"
      ]
    },
    "competition": {
      "score": 0,
      "rationale": "Cannot compete: 47+ direct competitors and dominant incumbent Walmart Food Trust controlling network effects",
      "factors": [
        "Walmart Food Trust has first-mover advantage and network lock-in",
        "No defensible differentiation (cost-based competition disadvantageous in blockchain)",
        "Market leader scenario: 60%+ control by established platform"
      ]
    },
    "strategic_fit": {
      "score": 8,
      "rationale": "Weak strategic fit; blockchain expertise outside portfolio core competency (B2B SaaS)",
      "factors": [
        "Requires new domain expertise (distributed systems)",
        "Capital-intensive infrastructure required",
        "Exit potential unclear (blockchain M&A market uncertain)",
        "Misaligned with portfolio infrastructure focus"
      ]
    }
  },
  "penalties": {
    "high_regulatory_ambiguity": {
      "points": -3,
      "rationale": "Blockchain regulation unsettled; compliance path for retailers unclear (>50% regulatory uncertainty)"
    },
    "analysis_confidence_gaps": {
      "points": -3,
      "rationale": "TAM confidence 0.45 (below 0.6 threshold); willingness-to-pay unproven; market timing uncertain"
    },
    "high_customer_acquisition_cost": {
      "points": -2,
      "rationale": "Estimated CAC $150K with LTV/CAC ratio 0.17 (well below 3.0 viability threshold)"
    }
  },
  "total_penalty": -8,
  "total_score": 10,
  "recommendation": "reject",
  "rejection_rationale": "Score falls below 60 rejection threshold. Multiple critical factors align against advancement: unproven customer demand (0.17 LTV/CAC ratio), dominant incumbent (Walmart), 47+ competitors, speculative TAM (0.45 confidence), and regulatory uncertainty. Market viability timeline unclear (5+ years).",
  "scored_by": "scoring-agent-v1"
}
```

### Step 4: Rejection & Archive

**Event Emitted:** `opportunity.rejected`

**Archive Record Created:**

The opportunity is archived with full context for future reference:
- Filed under: "Blockchain" tag, "Supply Chain" vertical
- Status: Rejected (automatic) on 2024-04-06
- Score: 10/100
- Rejection timestamp noted for quarterly trend analysis

**Rejection Notice Generated:**
```
Opportunity: Blockchain-based supply chain tracking for SMB retailers
Status: REJECTED (Automatic)
Date: 2024-04-06
Score: 10/100

Rejection Summary:
This opportunity was rejected automatically per opportunity module scoring policy (score <60 = reject). Multiple material factors prevented advancement:

1. CUSTOMER DEMAND UNPROVEN
   - 8 retailer interviews: 0 positive responses
   - Willingness-to-pay: $25K/year (vs. required $150K+ for venture unit economics)
   - LTV/CAC ratio: 0.17 (viability threshold: 3.0+)

2. COMPETITIVE POSITION UNTENABLE
   - 47+ direct competitors
   - Dominant incumbent: Walmart Food Trust (network effects lock-in)
   - No defensible differentiation path

3. MARKET TIMING UNCERTAIN
   - Gartner: Blockchain supply chain in "trough of disillusionment"
   - Regulatory clarity absent
   - Viability likely 5+ years away

4. FINANCIAL STRUCTURE BROKEN
   - Blockchain infrastructure cost-prohibitive for SMB target
   - CAC $150K vs. LTV ~$25K
   - Unit economics do not support venture model

Recommendation:
Do not reconsider without major market validation shift (e.g., 10+ customer LOIs at $150K+/year, regulatory clarity, Walmart Food Trust acquisition eliminating network moat). Current state insufficient for advancement.

Next Steps:
- Hold in archive for quarterly trend review
- Monitor blockchain supply chain market for regulatory shifts
- If major news emerges (e.g., new regulation favoring blockchain), flag for re-evaluation
```

### Step 5: Escalation (Optional)

**Decision:** No escalation to human review required
- Score clearly in automatic-reject range (10/100 vs. 60+ threshold)
- Rejection rationale defensible on multiple independent factors
- Not a portfolio-competitive opportunity (no internal conflicts)
- Not a large TAM opportunity requiring manual review (TAM $2.8B SAM is viable but market is oversaturated)

**Escalation would be triggered IF:**
- Score was borderline (58-62 range): Would escalate for manual review
- Founder submitted the opportunity: Would flag for leadership review
- TAM was massive ($50B+) and all other dimensions borderline: Would escalate
- None of these conditions met; rejection stands

## Key Learnings

### Why This Opportunity Failed

**Root Cause 1: Customer Demand Gap**
- Retailers don't perceive blockchain solution as worth $150K/year
- Simpler solutions (RFID, QR codes) address same problem at lower cost
- Value prop insufficient for willingness-to-pay required for venture unit economics

**Root Cause 2: Competitive Position**
- Walmart Food Trust created network effects that lock in customers
- 47+ competitors means no defensible differentiation available
- Cost-based competition favors existing players with scale

**Root Cause 3: Market Timing**
- Blockchain hype cycle past peak; market entering trough of disillusionment
- Regulatory clarity absent, creating uncertainty
- Likely 5+ year wait before market viability

**Root Cause 4: Strategic Misalignment**
- Portfolio expertise is B2B SaaS infrastructure
- Blockchain requires different infrastructure, regulatory, and go-to-market expertise
- Capital efficiency lower than portfolio average (SaaS > blockchain)

### Contrast with Happy Path (Compliance Automation)

| Dimension | Compliance Automation (82/100) | Blockchain Supply Chain (10/100) |
|-----------|-------------------------------|----------------------------------|
| Customer Demand | Proven willingness-to-pay $8-15K/year | Unproven; $25K/year actual offers |
| Market Stage | Established, accelerating | Post-hype trough |
| Competition | 8 direct competitors | 47+ direct competitors |
| Regulatory | Tailwind (enforcement surge) | Uncertainty (no clarity) |
| Strategic Fit | Core portfolio expertise (B2B SaaS) | Tangential (new domain) |
| TAM Confidence | 0.78 (strong) | 0.45 (speculative) |

This represents the "automatic reject" path — low score, multiple independent factors misaligned, clear rationale for non-advancement.

## Lessons for Future Evaluations

**Pattern Recognition:**
- High competitive count (47+) combined with unproven customer demand = automatic rejection
- TAM confidence below 0.6 combined with high CAC = red flag
- Market timing uncertainty (post-peak hype) reduces urgency scoring
- Regulatory uncertainty (-3 penalty) rarely overcome unless other dimensions exceptional

**Policy Application:**
This evaluation demonstrates correct application of:
- Confidence penalty (0.45 × base score)
- Competitive scoring (15+ competitors → 0-5 point range)
- CAC penalty (-2 points for LTV/CAC < 3.0)
- Regulatory penalty (-3 points for >50% uncertainty)
- Automatic rejection rule (score <60 triggers mandatory reject)
