# Happy Path Evaluation: Learning Ingestion to Query Synthesis

## Scenario
Learning from a kill postmortem is ingested, extracted into a pattern, synthesized into intelligence, and then queried by another module.

## Step-by-Step Flow

### Step 1: Kill Postmortem Learning Ingestion
**What happens**: Governance module submits kill postmortem for "Logify" (B2B logistics SaaS that failed at week 10)

**Input**:
```
venture_id: v-003
venture_name: "Logify"
source_module: "portfolio"
learning_type: "kill_postmortem"
outcome: "failure"
narrative: "Logistics software failed due to lack of domain expertise in founding team. Direct-to-shipper sales model (CAC $2,800) proved unsustainable against industry benchmark (8-12% conversion vs our 3% conversion achieved). Team attempted to build without understanding logistics buyer psychology or switching cost dynamics. LTV calculations showed $3,600 lifetime value vs $2,800 CAC resulted in 0.78 CAC/LTV ratio—too high for growth. Market entrenchment and competitive pressure higher than initial assessment."
quantitative_data:
  cac: 2800
  ltv: 3600
  cac_ltv_ratio: 0.78
  conversion_rate: 0.03
  weeks_active: 10
confidence: 89
timestamp: 2026-04-05
```

**Expected Output**: Learning record created with ID "learn-20260405-001", quality score 92, stored in vector DB with embedding.

**Events**: bruce-memory.learning.ingested

### Step 2: Pattern Extraction (Weekly Batch)
**What happens**: Weekly pattern extraction runs on Sunday 3 AM. Recent learnings (including Logify) are clustered with other learnings. A pattern is extracted.

**Clustering**: Logify learning clustered with similar learnings from TruckRoute Pro and other supply chain ventures → 3 ventures total show domain expertise gaps

**Pattern Extracted**:
```
pattern_id: pat-003
statement: "Supply chain software ventures with <5% CAC/LTV ratio and insufficient domain expertise show low conversion (<5%) and high failure risk"
evidence_ventures: [v-003, v-005, v-007]
evidence_count: 6
confidence: 0.81
applicability_scope:
  sectors: ["Supply Chain", "Logistics"]
  stages: ["early"]
status: "active"
action_implication: "Require domain expertise validation (customer advisory board, founder background) before structuring supply chain ventures."
```

**Events**: bruce-memory.pattern.extracted

### Step 3: Monthly Intelligence Synthesis
**What happens**: First of month, intelligence synthesizer runs. Pattern pat-003 is included in key_patterns (confidence >= 0.7).

**Intelligence Output**:
```
snapshot_id: snap-20260501-april
key_patterns: [pat-001, pat-002, pat-003, ...]
strategic_implications: [
  "Supply chain ventures require deep founder domain expertise. Recommend adding domain expert to founding team or advisory board before venture launch.",
  ...
]
```

**Events**: bruce-memory.intelligence.synthesized

### Step 4: On-Demand Query from Opportunity Module
**What happens**: Opportunity module is evaluating a new supply chain venture and queries memory.

**Query Input**:
```
query_id: q-20260406-001
question: "What patterns do we know about supply chain software ventures? Any red flags we should watch?"
requested_by_module: "opportunity"
```

**Query Processing**:
1. Query agent performs semantic search on "supply chain software ventures"
2. Pattern pat-003 returned (confidence 0.81, evidence_count 6, relevance_score 0.92)
3. Pattern statement is anonymized: ventures identified as v-003, v-005, v-007 (not Logify)

**Expected Response**:
```
query_id: q-20260406-001
relevant_patterns: [
  {
    pattern_id: "pat-003",
    statement: "Supply chain software ventures with <0.2 CAC/LTV ratio and insufficient domain expertise show low conversion (<5%) and high failure risk",
    confidence: 0.81,
    evidence_count: 6,
    relevance_score: 0.92,
    action_implication: "Require domain expertise validation (customer advisory board, founder background) before structuring supply chain ventures."
  }
]
synthesis: "Memory shows supply chain software ventures require strong founding team domain expertise. Ventures without logistics background show <5% conversion rates and CAC/LTV ratios too high to sustain. Recommend building advisory board from logistics industry before GTM launch."
confidence_overall: 0.81
no_results: false
latency_ms: 245
```

**Events**: bruce-memory.query.served

## Validation Criteria

### All Steps Succeed If:
- [x] Learning ingestion accepts kill postmortem, quality score >= 80
- [x] Pattern extraction finds 3+ supporting ventures and publishes pattern
- [x] Intelligence synthesis includes pattern in key_patterns (confidence >= 0.7)
- [x] Query agent returns pattern with confidence >= 0.8
- [x] Pattern statement is anonymized (ventures by ID only, no "Logify" name)
- [x] Action implication is included in query response
- [x] Query latency < 1 second
- [x] All events emitted at correct stages

### Failure Modes to Catch:
- Learning rejected due to low confidence → Pattern never extracted
- Pattern confidence too low (0.6) → Not included in synthesis
- Query returns pattern with venture name exposed → Privacy violation
- Query latency > 30 seconds → SLA breach
