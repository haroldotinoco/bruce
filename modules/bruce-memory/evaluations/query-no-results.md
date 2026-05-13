# Evaluation: Query with No Results

## Scenario
Opportunity module queries memory about a niche topic with no matching patterns.

## Query Input
```
query_id: q-20260410-001
question: "What do we know about quantum computing SaaS GTM strategies? Any patterns from similar ventures?"
requested_by_module: "opportunity"
context:
  market_segment: "Quantum Computing"
filters:
  min_confidence: 0.5
```

## Query Processing

### Search Stage
Query agent performs semantic search on vector store for patterns about:
- "quantum computing"
- "quantum software"
- "quantum SaaS"
- "quantum GTM"

### Results
Vector DB returns: No patterns match (pattern store has 0 quantum computing ventures)

### Confidence Lowering (Fallback)
Agent lowers confidence threshold to 0.3: Still no results (no patterns exist at any confidence level)

## Expected Response

```json
{
  "query_id": "q-20260410-001",
  "question": "What do we know about quantum computing SaaS GTM strategies? Any patterns from similar ventures?",
  "relevant_patterns": [],
  "synthesis": "Memory does not contain patterns about quantum computing SaaS ventures. No BruceAI ventures in this space have been analyzed yet.",
  "confidence_overall": 0,
  "no_results": true,
  "suggested_related_queries": [
    "What do we know about emerging technology SaaS GTM strategies?",
    "What patterns exist for B2B SaaS ventures targeting scientific users?",
    "What GTM approaches work for highly specialized/niche software?"
  ],
  "served_at": "2026-04-10T14:30:22Z",
  "latency_ms": 185
}
```

## Behavioral Details

### Suggested Related Queries Generation
Since primary query returned no results, agent generates 3 suggested alternatives by:
1. Broadening specificity: "quantum computing SaaS" → "emerging technology SaaS"
2. Targeting similar customer types: "scientific/specialized users"
3. Generalizing to adjacent domains: "niche B2B SaaS"

### Latency
- Vector search time: ~100ms (searched vector DB, found nothing)
- Synthesis generation: ~50ms (generate no_results response)
- Total: ~185ms (still well under 30-second SLA)

### Logging
Query logged as:
```
query_log: {
  query_id: "q-20260410-001",
  question: "What do we know about quantum computing SaaS GTM strategies?",
  requesting_module: "opportunity",
  result_type: "no_results",
  patterns_returned: 0,
  latency_ms: 185,
  timestamp: "2026-04-10T14:30:22Z"
}
```

This log entry used for analytics to identify gaps in pattern coverage.

## What Happens Next

### Option 1: Opportunity Module Structures Quantum Venture
If Bruce decides to structure a quantum computing SaaS venture:
1. Learnings from quantum venture ingested to memory
2. After 2-3 additional quantum ventures, patterns begin to emerge
3. Next query about quantum SaaS returns results

### Option 2: Analogue Patterns May Still Help
Opportunity module could use suggested queries:
- Query about "scientific SaaS GTM" → May return patterns from biotech, academic software
- Query about "emerging tech GTM" → May return patterns from AI/ML or blockchain ventures
- These analogue patterns may inform decision even if not directly applicable

## Validation Criteria

### All Steps Succeed If:
- [x] no_results: true is returned (not empty array with false flag)
- [x] relevant_patterns array is empty
- [x] synthesis explains absence ("Memory does not contain patterns...")
- [x] confidence_overall is 0 (no patterns to be confident about)
- [x] suggested_related_queries generated (3 alternatives)
- [x] Latency recorded < 30 seconds
- [x] Query logged for gap analysis

### Failure Modes to Catch:
- no_results: false with empty patterns array → Misleading response
- No suggested_related_queries (leaves caller stuck) → Poor UX
- Confidence_overall > 0 with no patterns → Logical inconsistency
- Latency > 30 seconds (timeout) → SLA breach, should return early results instead
