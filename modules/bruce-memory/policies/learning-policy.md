# Learning Ingestion Policy

## Valid Learning Criteria

### Minimum Metadata Requirements
- **venture_id**: Must reference an active venture or "cross-venture" designation
- **source_module**: Must be from approved BruceAI module list (opportunity, add-venture, brand-aid, builder, gtm, startup-ops, portfolio, bruce-core)
- **learning_narrative**: Minimum 50 words. Must be substantive (no generic statements)
- **confidence**: Submitter's confidence as percentage. Minimum 40% to store; 40-60% flagged for manual review
- **timestamp**: Learning observation date within last 30 days

### Quantitative Data Requirement
- Learning record must include at least one measurable data point
- Acceptable formats: metric comparison, numerical result, customer feedback with sample size
- Pure narrative without metrics will be flagged as low-confidence

### Learning Type and Outcome
- Learning type must match record content (sanity check): hypothesis_test, market_insight, gtm_channel, product_decision, team_insight, competitive_observation, kill_postmortem
- Venture outcome must be explicit: success, failure, partial_success, inconclusive

## Pattern Minimum Evidence Standard
- **Minimum 3 ventures**: No pattern can be published with evidence from fewer than 3 ventures
- **Minimum 5 supporting learning records**: Pattern must be grounded in at least 5 distinct learning records
- **Minimum 60% confidence**: Extracted pattern confidence must be >= 0.6 to publish

## Temporal Weighting Rules
- **Recent (0-2 weeks)**: Full weight in pattern extraction
- **Fresh (2-8 weeks)**: 80% weight
- **Aging (8 weeks - 18 months)**: 60% weight (downweighting begins)
- **Stale (>18 months)**: 30% weight (low weight in new patterns, excluded from feature recommendations)

## Conflicting Learning Handling
- If new learning contradicts existing pattern: Mark pattern as "pending_review", do NOT suppress the contradiction
- Both the pattern and contradicting evidence retained in store for analyst review
- Future synthesis will flag contradictions in intelligence output

## Deduplication Rules
- **Semantic similarity > 0.85**: Treat as exact duplicate. Log relationship but do not store second copy.
- **Semantic similarity 0.7-0.85**: Store both but link as "related learnings"
- **Semantic similarity < 0.7**: Store as independent learning

## Confidentiality and Retention
- All learning records retained indefinitely (audit trail)
- Learnings marked as "sensitive" (kill postmortems) may be excluded from shared patterns
- Venture-specific financial details anonymized when patterns are synthesized for external sharing
- Learning records are strictly internal use; individual records never shared externally

## Rate and Scale Limits
- Maximum 100 learning records ingested per day
- Vector embeddings processed asynchronously; response time kept under 30 seconds
- Normalized record must fit in 10KB JSON; narratives max 5000 characters
- Tags limited to 10 per learning
