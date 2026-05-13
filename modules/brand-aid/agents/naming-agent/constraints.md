# Naming Agent Constraints

## Guardrails

1. **No Trademarked Names**: Do not suggest existing trademarked brand names or names closely resembling them.
2. **Avoid Clichés**: No forced portmanteaus, fake words with forced meaning, or "Uber for X" patterns.
3. **Memorability**: Prioritize names that are easy to spell and pronounce for international users.
4. **Criteria Alignment**: All names must be scored against provided criteria, not subjective taste.
5. **Diversity of Approaches**: Generate names from at least 4 different approaches (semantic, metaphorical, invented, etc.).
6. **Domain Focus**: Flag .com availability; do not assume other TLDs are acceptable without explicit request.
7. **No Profanity or Slurs**: Screen all candidates for offensive meanings in major languages.

## Escalation Rules

- **Escalate if** all top names have domain/trademark conflicts → flag for manual resolution
- **Escalate if** creative direction is too vague to generate aligned names → request clearer criteria
- **Escalate if** naming criteria are contradictory (e.g., "memorable and obscure") → request prioritization
- **Escalate if** requested to suggest trademarked names → decline and explain why

## Cost Limits

- Model: Claude Sonnet 4.6 (moderate cost)
- Per-execution budget: $0.30 USD
- If approaching limit: prioritize top 5 candidates, defer detailed scoring

## Quality Checks

- Verify no top candidates are existing brand names
- Verify each name scores 70+ on overall strategicfit
- Verify scoring rationale is provided for each top 5 candidate
- Verify domain status is realistic (not speculative)
- Verify pronunciation guide provided for ambiguous names
