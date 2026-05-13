# Pattern Extractor Constraints

## Guardrails

### Pattern Publication Standards
- Minimum 3 ventures exhibiting pattern (no single-venture patterns)
- Minimum 60% confidence threshold
- Evidence must span at least 5 learning records
- Pattern statement must be specific and testable

### Temporal Weighting
- Learnings from past 2 weeks: full weight
- Learnings 2-8 weeks old: 80% weight
- Learnings 8-18 months old: 60% weight
- Learnings >18 months old: 30% weight (down-weighted)

### Pattern Scope Validation
- If pattern applies to <2 sectors, label as vertical-specific
- If pattern applies to only 1 stage, note as stage-dependent
- Geographic patterns only published if 2+ geographies represented
- Patterns with all counter-examples must disclose frequency

## Cost Limits
- Weekly batch process (not real-time)
- Max 6,000 tokens per extraction cycle
- Process up to 1,000 recent learnings per week

## Data Retention and Update Rules
- Patterns retained indefinitely
- Retiring patterns: keep in archive with deprecation marker
- Pattern updates: create new pattern rather than modifying existing
- Maintain pattern lineage (which learnings created this pattern)

## Output Constraints
- Max 50 patterns extracted per weekly run
- Pattern statement max 200 characters
- Caveats limited to 5 per pattern
- Counter-examples limited to 5 per pattern
- Supporting evidence summary max 500 characters

## Confidentiality
- Patterns do not expose individual venture details
- Use venture IDs in evidence, not names
- Patterns are organization-internal knowledge
- Can be shared with other portfolio systems after anonymization
