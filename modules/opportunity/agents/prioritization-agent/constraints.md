# Prioritization Agent Constraints

## Algorithmic Rules (Deterministic, No Exceptions)

### Primary Ranking Rule
- Sort by total_score in descending order (highest score first)
- Break ties with discovery_date ascending (oldest discovered first)
- This order is immutable — no subjective reordering allowed

### Status Assignment Rules (Applied in Sequence)

#### Rule 1: Score-Based Assignment
- **Score 75+** AND recommendation='advance': Status = ADVANCE
- **Score < 60** OR recommendation='reject': Status = REJECT
- **Score 60-74** AND recommendation='reconsider': Apply Rule 2

#### Rule 2: Portfolio Alignment Filter (for RECONSIDER)
- If opportunity aligns with portfolio focus areas: Check Rule 3
- If weak alignment: Status = HOLD

#### Rule 3: Advancement Capacity Filter
- Count existing ADVANCE opportunities
- If count < max_ventures_per_cycle: Status = ADVANCE
- If count ≥ max_ventures_per_cycle: Status = HOLD

#### Rule 4: Portfolio Diversity Check (applied to ADVANCE list only)
- For each vertical, count ADVANCE opportunities
- If count > 2 per vertical: Drop lowest-scored duplicate vertical opportunity
- Final status for dropped opportunity: HOLD

### Advancement Reasoning (Deterministic Documentation)
- Each opportunity must have advancement_reason field
- Reason must reference which filter rule determined status
- Examples:
  - "Score 81 exceeds threshold of 75 (Automatic advancement)"
  - "Score 62 in reconsider range; portfolio alignment check → HOLD pending capacity review"
  - "Score 88 with advance recommendation; declining due to portfolio capacity (max 3 ventures, already 3 advancing)"

## Processing Constraints

### Volume Limits
- Maximum 50 opportunities per batch (algorithm handles all at once)
- Minimum 1 opportunity required
- If > 50: Batch into smaller cycles or reject input

### Processing Time
- Execution must complete in < 5 seconds
- Algorithm must be O(n log n) or better (sorting-based)
- No iterative computations or approximations

## Data Quality Guardrails

### Required Input Fields
- Each opportunity must have: opportunity_id, title, total_score, recommendation
- discovery_date must be valid ISO 8601 format
- tags/vertical must be present for diversity check

### Output Validation
- All opportunities must appear in output (none dropped)
- Every opportunity must have status field (ADVANCE, HOLD, REJECT)
- Rank field must be sequential integers starting at 1
- Summary counts must match actual output

## Business Logic Constraints

### Portfolio Capacity
- Default max_ventures_per_cycle = 3 (configurable, must be > 0)
- If fewer eligible opportunities than capacity: advance all, underutilize capacity
- If more than capacity: apply ranking, advance only top-N

### Diversity Constraint
- Default enabled: maximum 2 opportunities per vertical in ADVANCE list
- If disabled: no diversity constraint applied
- If diversity constraint forces HOLD: document in advancement_reason

### Score Threshold
- Default minimum advancement score = 75
- Cannot be changed without policy update
- Any override requires explicit policy documentation

## Escalation Rules

### When to Escalate (Non-Processing Issues)
1. **Portfolio capacity unclear**: Cannot determine max_ventures_per_cycle
2. **New strategic priorities**: Unclear if opportunities align with portfolio
3. **Conflicting recommendations**: Scoring produced inconsistent results (flag for re-scoring)
4. **Score distribution anomalies**: All scores clustered in narrow range (data quality issue)

### Processing Failures (Return Error)
- Fewer than 1 opportunity provided
- Missing required fields (opportunity_id, total_score)
- Invalid ISO 8601 dates
- Score values outside 0-100 range

## Output Guarantees

### Format Compliance
- Output must conform 100% to output.schema.json
- No null values in required fields
- All arrays properly formatted

### Determinism Guarantee
- Identical input → Identical ranking and status assignment (every time)
- No randomization, approximation, or subjective judgment
- Same opportunities processed twice produce identical order

### Completeness Guarantee
- Every input opportunity appears in output
- No opportunities silently dropped or excluded
- Summary counts match actual ranked_opportunities array

## Cost Management

- Zero API costs (no LLM calls, pure algorithm)
- Execution cost negligible (<0.0001 USD)
- Suitable for unlimited runs

## Integration Constraints

### Upstream Dependencies
- Requires scored opportunities from scoring-agent
- Assumes all scoring is complete (no partial/incomplete opportunities)
- Depends on accurate total_score values from scoring phase

### Downstream Expectations
- Output ranked list feeds to AddVenture module
- ADVANCE opportunities trigger venture structuring
- HOLD opportunities queued for next cycle
- REJECT opportunities archived, not reconsidered unless policy changes
