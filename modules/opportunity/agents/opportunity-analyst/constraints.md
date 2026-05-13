# Opportunity Analyst Constraints

## Processing Limits

### Volume & Throughput
- **Maximum 15 opportunities analyzed per cycle** (quality guardrail)
- **Minimum 5 opportunities per cycle** (efficiency threshold)
- **Average execution: 60 seconds per opportunity**
- **Absolute timeout: 3 minutes per opportunity** (hard cap)

### Analysis Scope
- Do not conduct primary research (interviews, surveys, data collection)
- Do not build financial models (unit economics, revenue projections)
- Do not make go/no-go recommendations
- Do not rank or score opportunities (pure analytical role)

## Data Quality Guardrails

### Required Inputs
- Raw opportunity must have all mandatory fields from market-scanner output
- Problem statement must be specific and measurable (reject vague problems)
- Target segment must be identifiable and bounded (reject "everyone")

### TAM Estimation Standards
- **Must use 2+ methodological approaches** (top-down, bottom-up, value-based, or comparable)
- **Result must fall within 1 order of magnitude** across approaches
- **Confidence must be justified**:
  - 0.8+: TAM estimated via 3+ data sources with convergence
  - 0.6-0.8: TAM estimated via 2 approaches with some deviation
  - <0.6: TAM cannot be reliably estimated, flag for human review
- **TAM range must be documented** (not point estimate) — e.g., "$5B-8B, best estimate $6.5B"

### Competitive Landscape Standards
- **Minimum 3 competitors identified** (if fewer, explain why market is underserved)
- **Each competitor must have documented positioning** (not generic)
- **Direct vs. indirect classification must be clear**
- **Barriers to entry must be specific**, not generic ("hard to build")

### Output Completeness
- All required fields must be populated (no null values in arrays/objects)
- All claims must have supporting rationale
- Assumptions explicitly flagged and documented
- Data gaps acknowledged

## Quality Standards

### Accuracy Requirements
- Market sizing methodologies must be theoretically sound
- Competitor analysis must reflect actual positioning (not assumptions)
- JTBD analysis must be grounded in market research, not speculation
- No hallucinated data (competitors, market facts, statistics)

### Confidence Calibration
- Conservative bias: underestimate market size rather than overestimate
- Flag high-uncertainty areas explicitly
- Distinguish between "known unknowns" and "unknown unknowns"

## Escalation Rules

### Automatic Escalation to Human Review
1. **TAM cannot be estimated** with reasonable methodology (confidence < 0.5)
2. **Problem statement is too vague** after analysis attempt
3. **Market is pre-competitive** (literally no competitors exist and hard to extrapolate)
4. **Regulatory ambiguity** where legal status is unclear
5. **Conflicting data sources** with >50% variance in TAM estimates

### When to Decline Processing
- Opportunity lacks core problem statement
- Target segment is undefined
- Raw opportunity has confidence < 0.4 from market-scanner
- Sufficient data sources not available to ground analysis

## Output Constraints

### Analysis Completeness
- Problem analysis section must be 100% populated
- Segment analysis must include JTBD dimensions
- Competition landscape must cover direct, indirect, substitutes
- Differentiation opportunities must be minimum 3-5 strategies

### Field Validation
- All URLs must be valid (if cited)
- All competitor names must exist as real companies
- All market size numbers (`market_size_estimate.tam`/`sam`/`som`) MUST be
  plain JSON numbers in the declared `currency` — never strings like
  `"$100 billion"` or `"100B"`. Methodology goes in the sibling
  `*_methodology` fields. Always emit `currency` (ISO 4217, default `USD`).
- All dates in ISO 8601 format

## Execution Constraints

### Time Limits
- 60 seconds target per opportunity
- 3-minute absolute timeout per opportunity (fail if exceeded)
- Total cycle time: 15 opportunities × 60 sec = 15 minutes target

### Cost Management
- Anthropic Claude API: ~0.08 per opportunity ($0.003 input, $0.05 output)
- Maximum cycle cost: $1.50 (15 opportunities × $0.10 with variance)
- If cost exceeds budget: reduce analysis depth or batch smaller cycles

## Error Handling

### Graceful Degradation
- If TAM cannot be estimated: flag as "insufficient data" and move to scoring with confidence penalty
- If competitive landscape is sparse: flag but proceed with notation that market may be pre-competitive
- If market readiness unclear: default to "emerging" classification

### When to Fail Processing
- Core problem statement is genuinely incomprehensible
- Data sources are inaccessible or invalid
- No methodology exists to estimate TAM (e.g., entirely novel category)

## Integration Constraints

### Upstream Dependencies
- Requires valid raw opportunity from market-scanner
- Depends on market-scanner confidence > 0.6
- Assumes sources cited are accessible/valid

### Downstream Expectations
- Output must conform 100% to opportunity.schema.json
- Status must be set to "analyzing" (next phase is scoring)
- All fields required for scoring-agent must be populated
- Assumptions and data gaps must be clear for scoring-agent to apply penalties
