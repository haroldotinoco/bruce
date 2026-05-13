# Evaluation: Monthly Intelligence Synthesis

## Scenario
Month-end synthesis runs. Portfolio has 12 active ventures spanning 4 months of learning data. Pattern store contains 17 patterns.

## Input Data

### Pattern Store Snapshot
- Total patterns: 17 (all active status)
- Patterns with confidence >= 0.7: 12
- Patterns with 3+ ventures: 14
- Patterns created last 60 days: 8 (emerging signals candidates)
- Patterns contradicted by recent evidence: 1 (pat-009)

### Portfolio Context
```
period_start: 2026-03-01
period_end: 2026-03-31
total_ventures: 12
active_ventures: 11
killed_ventures: 1 (Logify)
ventures_by_stage:
  structured: 2
  built: 1
  launched: 2
  operating: 3
  iterating: 2
  scaling: 1
  killed: 1
learnings_ingested_march: 47
```

## Synthesis Process

### Step 1: Retrieve Qualified Patterns
Agent queries pattern store for patterns with confidence >= 0.7:
- pat-001 (confidence 0.87, evidence 8 ventures) ✓
- pat-002 (confidence 0.72, evidence 5 ventures) ✓
- pat-003 (confidence 0.81, evidence 6 ventures) ✓
- pat-004 (confidence 0.81, evidence 5 ventures) ✓
- pat-005 (confidence 0.74, evidence 4 ventures) ✓
- pat-006 (confidence 0.76, evidence 3 ventures) ✓
- pat-007 (confidence 0.71, evidence 3 ventures) ✓
- pat-008 (confidence 0.68, evidence 3 ventures) ✗ (below 0.7)

Total: 7 patterns meet threshold

### Step 2: Rank by Confidence × Recency
```
ranking = confidence × recency_weight

pat-001: 0.87 × 1.0 (recent) = 0.87
pat-004: 0.81 × 1.0 (recent) = 0.81
pat-003: 0.81 × 0.8 (older) = 0.65
pat-006: 0.76 × 1.0 (recent) = 0.76
pat-002: 0.72 × 0.9 (moderately aged) = 0.65
pat-005: 0.74 × 0.8 (older) = 0.59
pat-007: 0.71 × 1.0 (recent) = 0.71

Ranked: pat-001 (0.87) > pat-004 (0.81) > pat-006 (0.76) > pat-007 (0.71) > pat-003 (0.65) > pat-002 (0.65) > pat-005 (0.59)
```

### Step 3: Select Top N (max 10)
Max patterns: 10, but only 7 qualify. Include all 7 in key_patterns.

### Step 4: Identify Emerging Signals
Patterns created in last 60 days with confidence 0.5-0.7:
- pat-010 (confidence 0.62, created 35 days ago, "Developer-first GTM efficiency")
- pat-011 (confidence 0.58, created 28 days ago, "Founder prior exit experience correlation")

Include both in emerging_signals with watch_criteria.

### Step 5: Identify Contradicted Patterns
Patterns contradicted by recent evidence:
- pat-009 (confidence was 0.75, now contradicted): "Land-and-expand pricing shows better CAC/LTV than per-license"
  - Contradiction evidence: Recent ventures (CloudSync Pro, MediLink) using per-license/per-usage achieving better ratios (0.05-0.1) than land-and-expand (0.25-0.35)

### Step 6: Generate Strategic Implications
From top 5 patterns, extract implications:
1. pat-001 (CAC/LTV efficiency): "Unit economics validation should be completed by week 8 post-launch. Ventures failing threshold should undergo GTM audit."
2. pat-004 (Developer-first GTM): "For developer-facing ventures, shift early marketing allocation from enterprise sales hiring to developer community building (15-20% of budget)."
3. pat-006 (Domain expertise requirement): "Regulated verticals (healthcare, supply chain) require 3-6 month additional runway and domain expert validation before GTM launch."
4. pat-007 (Go-to-market timing): "Ventures launching in Q3 2025 showed extended sales cycles. Market timing patterns suggest Q4 better for enterprise GTM launch."
5. pat-003 (Supply chain domain expertise): "Supply chain ventures require founding team domain expertise. Require customer advisory board or founder background from logistics before structuring."

### Step 7: Generate Thesis Updates
Implications distilled into thesis updates:
- "Unit economics validation gate: Week 8 post-launch (updated from week 12)"
- "Developer-first GTM now primary strategy for SaaS tools and infrastructure (shift from enterprise sales-first)"
- "Regulated verticals require 40-60% additional runway and domain expert (new finding)"
- "Founder background (prior exits) correlates with faster execution (new signal, confidence 0.62)"

## Expected Output

```json
{
  "snapshot_id": "snap-20260401-march",
  "period_start": "2026-03-01",
  "period_end": "2026-03-31",
  "key_patterns": [
    {
      "pattern_id": "pat-001",
      "statement": "B2B SaaS ventures with CAC/LTV ratio <0.2 show 2-3x faster growth trajectory than those with ratio >0.5",
      "confidence": 0.87,
      "evidence_count": 8,
      "action_implication": "Prioritize unit economics validation by week 8 post-launch. Ventures achieving <0.2 ratios should receive growth capital; those >0.5 require fundamental GTM rethinking."
    },
    {
      "pattern_id": "pat-004",
      "statement": "Developer-first GTM (community, open source, documentation) shows 3-4x better CAC efficiency than direct enterprise sales for infrastructure and SaaS tools",
      "confidence": 0.81,
      "evidence_count": 5,
      "action_implication": "For developer-facing ventures, recommend developer community building in first 3 months before enterprise sales hiring. Budget 15-20% of early marketing spend to community and documentation."
    },
    {
      "pattern_id": "pat-006",
      "statement": "Healthcare and regulated software ventures require 3-6 months longer sales cycle than average B2B SaaS, increasing cash burn 40-60%",
      "confidence": 0.76,
      "evidence_count": 4,
      "action_implication": "For regulated ventures, model 6-month sales cycles minimum. Add 40% contingency to runway calculations and prioritize early regulatory consulting."
    },
    {
      "pattern_id": "pat-007",
      "statement": "Ventures launched in Q3-Q4 show longer enterprise sales cycles; Q1-Q2 launches correlate with faster GTM validation",
      "confidence": 0.71,
      "evidence_count": 3,
      "action_implication": "For enterprise-targeted ventures, schedule GTM launch for Q1 or Q2 to avoid extended sales cycles that extend into holiday quarters."
    },
    {
      "pattern_id": "pat-003",
      "statement": "Supply chain software ventures with insufficient domain expertise show <5% conversion rates and unsustainable CAC/LTV ratios (>0.7)",
      "confidence": 0.81,
      "evidence_count": 6,
      "action_implication": "Require domain expertise validation (customer advisory board, founder background) before structuring supply chain ventures."
    },
    {
      "pattern_id": "pat-002",
      "statement": "Healthcare and regulated verticals show 40-60% higher customer acquisition costs than non-regulated SaaS",
      "confidence": 0.72,
      "evidence_count": 5,
      "action_implication": "Healthcare ventures require 40-60% higher CAC budget and longer runway. Incorporate regulatory consulting costs into early-stage structuring."
    },
    {
      "pattern_id": "pat-005",
      "statement": "Freemium model with self-serve onboarding (no trial signup form) shows 40-50% higher paid conversion than gated trial approach",
      "confidence": 0.74,
      "evidence_count": 4,
      "action_implication": "For B2B SaaS ventures targeting technical users, implement freemium model with immediate hands-on access. Avoid lengthy trial signup flows."
    }
  ],
  "strategic_implications": [
    "Current portfolio is heavily weighted toward B2B SaaS (6/12 ventures). Unit economics validation should be a venture approval gate; ventures failing to achieve <0.3 CAC/LTV by week 12 should be paused for GTM overhaul.",
    "Healthcare and regulated verticals require 40-60% more runway than standard SaaS. Future healthcare venture proposals should include regulatory timeline and procurement cycle analysis.",
    "Developer-first GTM is proving more efficient than enterprise sales for developer tools and infrastructure. Recommend shifting allocation of early marketing spend away from enterprise sales hiring.",
    "Pattern data from March confirms 2025 hypothesis around domain expertise in supply chain software (kill postmortem validates). Continue to require customer advisory board validation before structuring verticals with high switching costs."
  ],
  "emerging_signals": [
    {
      "signal": "Founding teams with prior exit experience showing 20% faster time-to-product launch",
      "first_observed": "2026-02-28",
      "confidence": 0.62,
      "watch_criteria": "Monitor next 3 new venture launches; if pattern holds, prioritize founder background assessment in opportunity evaluation"
    },
    {
      "signal": "Climate tech ventures showing longer runway to revenue than projected (12-18 months vs 9 months expectation)",
      "first_observed": "2026-03-15",
      "confidence": 0.58,
      "watch_criteria": "Monitor next 2 climate tech launches; if pattern holds, increase runway assumptions by 3-6 months for climate ventures"
    }
  ],
  "contradicted_patterns": [
    {
      "pattern_id": "pat-009",
      "pattern_statement": "Land-and-expand pricing model shows better CAC/LTV ratios than per-seat or per-usage pricing",
      "contradiction_evidence": "Recent ventures (CloudSync Pro, MediLink) using per-usage and per-license models achieved CAC/LTV ratios 0.05-0.1, superior to historical land-and-expand ventures (0.25-0.35)"
    }
  ],
  "thesis_updates": [
    "Unit economics validation gate moved from week 12 to week 8 post-launch. Ventures achieving CAC/LTV <0.2 approved for scaling; >0.5 required to pause and iterate.",
    "Developer-first GTM elevated to primary go-to-market strategy for SaaS tools and infrastructure. Recommend increasing community and documentation budget allocation from 5-10% to 15-20% of early marketing spend.",
    "Regulated verticals (healthcare, finance, supply chain) require 40-60% additional runway above standard SaaS models. Add regulatory consulting and domain expert hiring to structured venture playbook.",
    "Founder prior exit experience correlated with 20% faster execution. Consider founder background assessment as part of opportunity evaluation (emerging signal, confidence 0.62).",
    "Land-and-expand pricing no longer preferred model; per-usage and per-license pricing showing superior unit economics in recent ventures."
  ],
  "patterns_total_in_store": 17,
  "learnings_ingested_this_period": 47,
  "created_at": "2026-04-01T06:00:00Z"
}
```

## Validation Criteria

### All Steps Succeed If:
- [x] Snapshot ID generated uniquely
- [x] Key patterns max 10 (ranked by confidence × recency)
- [x] All key patterns have confidence >= 0.7
- [x] All key patterns have evidence >= 3 ventures
- [x] Emerging signals identified (confidence 0.5-0.7, created last 60 days)
- [x] Contradicted patterns flagged with evidence
- [x] Strategic implications are actionable (what Bruce should DO)
- [x] Thesis updates specific and measurable
- [x] Pattern totals and learning counts included
- [x] Created timestamp is synthesis run time (not pattern creation time)

### Failure Modes to Catch:
- Pattern with confidence 0.68 included in key_patterns → Threshold enforcement
- Pattern with only 2 ventures included → Evidence requirement enforcement
- Strategic implication is "B2B SaaS is important" → Too vague, not actionable
- No emerging signals identified when 8 patterns created in last 60 days → Signal detection failure
- Contradicted pattern still marked "active" status → Contradiction handling failure
