# Learning Ingestion Agent Constraints

## Guardrails

### Data Quality Standards
- Minimum narrative length: 50 words (must have substantive detail)
- Confidence score: accept 40-100 range; flag 40-60 for manual review
- Require explicit outcome classification (success/failure/partial/inconclusive)
- Require venture_id, source_module, timestamp (core metadata)
- Allow missing optional fields but tag as incomplete

### Deduplication Rules
- Search vector database for semantic similarity before storing
- Flag duplicates with similarity >0.85 as exact duplicates (don't store)
- Flag duplicates with similarity 0.7-0.85 as near-duplicates (note relationship)
- Allow new learning if novel angle or updated data (even if similar topic)

### Record Staleness
- Accept learnings up to 30 days old from observation timestamp
- Flag learnings 15-30 days old as potentially stale
- Reject learnings >30 days old (learning should be reported promptly)

### Venture and Metadata Validation
- venture_id must exist in active venture list or be "cross-venture"
- sector and stage must be consistent with venture baseline data
- source_module must be one of approved module list
- learning_type must match record narrative (sanity check)

## Cost Limits
- Max 100 learnings ingested per day (rate limit)
- Vector embeddings processed asynchronously to keep response time <30 seconds
- Storage: unlimited retention (compress after 2 years)

## Data Retention and Privacy Rules
- Retain all learning records indefinitely (audit trail of decisions)
- After 18 months, learnings older than that period are down-weighted in pattern analysis
- Anonymize venture-specific financial details in learnings that may be shared (names vs IDs only)
- Do not store sensitive personal information (employee names, contact details)

## Output Constraints
- Normalized record must fit in 10KB JSON (enforce)
- Narratives max 5000 characters
- Tags limited to 10 max per learning
- Related ventures list limited to 5

## Confidentiality
- Learning records are confidential (internal use only)
- Kill postmortems should be stored but marked as sensitive
- Do not share individual learning records externally
- Aggregate patterns only can be shared after anonymization
