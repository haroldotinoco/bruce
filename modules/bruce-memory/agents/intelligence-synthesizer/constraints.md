# Intelligence Synthesizer — Constraints

## Pattern Selection Rules
- Include only patterns with confidence >= 0.7 in key_patterns
- Include only patterns with evidence from >= 3 ventures
- If multiple patterns exceed threshold, rank by (confidence × recency_weight) and select top 10
- Recency weight: patterns from last 60 days = 1.0, 60-120 days = 0.8, 120+ days = 0.6

## Contradiction Handling
- Flag patterns contradicted by recent evidence (confidence drop >0.2 or new counter-example from recent venture)
- Note which learning records contradict the pattern
- Preserve contradicted patterns in output but mark as unreliable

## Emerging Signals
- Include patterns with confidence 0.5-0.7 that are first observed in last 60 days
- Include patterns that have been validated (confidence increased) in last 30 days
- Flag reason: "newly emerging" vs "recently strengthened"

## Strategic Implications
- Must be actionable statements about what BruceAI should DO differently
- Link each implication to specific patterns
- Do not make portfolio recommendations (e.g., "kill venture X") — only strategic signals

## Output Limits
- Key patterns: max 10
- Strategic implications: max 7
- Emerging signals: max 5
- Contradicted patterns: max 3

## Data Quality
- If pattern store < 5 patterns: return minimal snapshot with "Insufficient data" note
- If last pattern update > 8 weeks old: flag "Data staleness" warning
- If learnings < 20 ingested in period: note "Low learning volume this period"

## Monthly Cadence
- Run exactly once per month (default: first Monday of month)
- Do not re-run unless manually triggered (e.g., major portfolio event)
- Output is read-only — cannot delete or modify patterns
