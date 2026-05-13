# Evaluation: Low-Confidence Pattern (Below Minimum Evidence)

## Scenario
During weekly pattern extraction, an emerging pattern is detected but does not meet publication threshold (only 2 ventures, <3 minimum).

## Setup
Three learnings submitted to memory:
1. Learning from v-008 (fintech startup): "Freemium model with immediate API access showed 40% faster time-to-value vs trial-based approach"
2. Learning from v-009 (developer tools SaaS): "Freemium self-serve onboarding (no trial signup form) drove 50% higher conversion than gated trial"
3. Learning attempted from v-010 (infrastructure): "Freemium + community-driven adoption shows better LTV retention patterns"

## Pattern Extraction Run

### Candidate Pattern Identified
```
Statement: "Freemium model with self-serve onboarding shows 40-50% faster time-to-value and higher conversion than trial-based gating"
Evidence ventures: [v-008, v-009]
Evidence count: 2
Confidence: 0.65
```

### Validation Against Constraints
- Evidence ventures: 2 (BELOW minimum of 3) ✗
- Confidence: 0.65 (MEETS 0.6 threshold) ✓
- Supporting learning records: 3 (MEETS minimum of 5? Need to check) ✓
- Pattern specificity: OK ✓

### Decision
**Pattern is NOT published** because evidence ventures < 3

## Expected Behavior

### Pattern Storage
Pattern stored in "pending_evidence" status:
```
pattern_id: "pat-emerging-001"
statement: "Freemium model with self-serve onboarding shows faster time-to-value and higher conversion than trial-based gating"
evidence_ventures: [v-008, v-009]
evidence_count: 2
confidence: 0.65
status: "pending_evidence"
reason_pending: "Only 2 ventures exhibit this pattern; minimum 3 required for publication. Will publish upon confirmation from additional venture."
```

### Output in Extraction Result
```
pattern_extraction_result: {
  extracted_patterns: [],  // Published patterns (empty this week)
  emerging_patterns: [
    {
      pattern_statement: "Freemium model with self-serve onboarding shows faster time-to-value and higher conversion than trial-based gating",
      evidence_count: 2,
      confidence: 0.65,
      reason_not_published: "Only 2 ventures show this pattern; minimum threshold is 3. Will revisit next week as more onboarding data arrives."
    }
  ]
}
```

### Query Behavior
If opportunity module queries about "freemium SaaS onboarding patterns" before the pattern is published:
- Query returns confidence >= 0.5? NO (pending patterns excluded from query results)
- Response: `no_results: true`
- Suggested related queries: ["B2B SaaS freemium models", "time-to-value optimization"]

### What Happens Next Week
- If v-010 learning is processed and v-010 also confirms the pattern: 3 ventures now support it
- Pattern "pat-emerging-001" status changed from "pending_evidence" to "active"
- Pattern confidence may increase to 0.72
- Next query about freemium models WILL return this pattern

### What Happens If Never Reaches 3 Ventures
- Pattern remains "pending_evidence" for up to 60 days
- After 60 days of no new supporting evidence: marked as "stale"
- Stale pending patterns excluded from synthesis and queries
- Analyst can manually review and promote or retire

## Validation Criteria

### All Steps Succeed If:
- [x] Pattern NOT published to active store (status = "pending_evidence")
- [x] Pattern included in emerging_patterns array in extraction output
- [x] Reason for non-publication clearly stated
- [x] Query-agent excludes pending patterns from results
- [x] Query returns no_results: true when querying about freemium models before threshold met
- [x] Pattern automatically publishes when 3rd venture provides evidence

### Failure Modes to Catch:
- Pattern published despite only 2 ventures → Threshold enforcement failure
- Pattern included in query results with confidence < 3-venture threshold → Query filtering failure
- Pattern never reaches 3 ventures but continues being stored indefinitely → Memory bloat
- No update to pattern status when 3rd venture confirms → Stale pending detection failure
