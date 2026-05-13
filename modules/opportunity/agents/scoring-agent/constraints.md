# Scoring Agent Constraints

## Scoring Rules (Non-Negotiable)

### Dimension Score Ranges
- Each dimension (market_size, urgency, competition, strategic_fit) must be 0-25
- No fractional scores (only integers 0-25)
- No out-of-range adjustments

### Total Score Calculation
- Total = market_size + urgency + competition + strategic_fit
- Total must equal sum of all dimensions (no discretionary adjustments)
- Total score range: 0-100

### Recommendation Logic (Policy-Enforced)
- **75-100**: ADVANCE (automatic)
- **60-74**: RECONSIDER (automatic)
- **Below 60**: REJECT (automatic)
- **No exceptions to these thresholds** — policy overrides subjective judgment

## Volume Constraints

### Processing Limits
- Maximum 25 opportunities scored per cycle
- Minimum 5 opportunities per cycle (efficiency check)
- Average execution: 45 seconds per opportunity
- Absolute timeout: 2 minutes per opportunity

### Output Completeness
- 100% of required fields must be populated
- All dimension rationales must be documented
- Scoring notes must explain any penalties/bonuses applied

## Data Quality Guardrails

### Input Validation
- Reject scoring if opportunity analysis is incomplete
- Reject scoring if core fields are missing (market_size, competition_landscape)
- Require confidence_level from analysis phase

### Scoring Constraints
- Scores must be justified by factors in input opportunity
- No speculation or new analysis beyond what analyst provided
- Conservative scoring (underestimate quality rather than overestimate)
- Explicit acknowledgment of data gaps and their impact

## Policy Enforcement

### Market Size Scoring Rules
- TAM < $50M: maximum 5 points (regardless of other factors)
- TAM $50M-500M: 5-10 points
- TAM $500M-3B: 10-15 points
- TAM $3-10B: 15-20 points
- TAM > $10B: 20+ points (up to 25 with large addressable SAM)
- **Override rule**: If TAM confidence < 0.5, deduct 5 points

### Urgency Scoring Rules
- Nascent market (< 1 year from emergence): maximum 10 points
- Emerging market (1-3 years, some signals): 10-15 points
- Established market with high demand signals: 15-25 points
- **Override rule**: If no customer demand signals (hiring, funding, etc.), maximum 10 points

### Competition Scoring Rules
- 0 direct competitors: 20-25 points (with high barriers to entry check)
- 1-2 competitors: 15-20 points
- 3-5 competitors: 10-15 points
- 5-10 competitors: 5-10 points
- 10+ competitors: 0-5 points
- **Override rule**: Dominant incumbent: maximum 5 points

### Strategic Fit Scoring Rules
- **Unspecified strategy context**: If both `portfolio_focus_areas` and `strategic_priorities` are empty, score **10–15** only. Empty context is **not** evidence of misalignment; do not default to “tangential (5)” for that reason alone.
- **When context is non-empty** (declared focus supplied):
  - Perfect alignment with declared focus: 20-25 points
  - Strong alignment with declared priorities: 15-20 points
  - Good fit but some execution risk: 10-15 points
  - Tangential vs. declared focus: 5-10 points
  - Misaligned with declared focus: 0-5 points
- **Data gaps penalty**: Apply -3 points if significant analysis gaps exist

## Bonus/Penalty System

### When to Apply Bonuses (+2-3 points total)
- Multiple independent market signals confirming demand
- Unique defensible differentiation identified
- Clear regulatory tailwind (vs. headwind)
- **Bonus limit**: Maximum +3 points per opportunity

### When to Apply Penalties (-3-5 points total)
- Significant regulatory ambiguity (-3 points)
- Major execution dependencies (-3 points)
- Data gaps in analysis (-2 to -3 points)
- Team capability concerns for this market (-2 points)
- **Penalty limit**: Maximum -5 points per opportunity

### Bonus/Penalty Precedent
- Bonuses and penalties must be documented explicitly
- Reasons must reference specific factors from opportunity analysis
- Net adjustment (bonus + penalty) cannot exceed ±5 points

## Error Handling

### When to Refuse Scoring
- Opportunity is missing required analysis fields
- No market sizing information available
- Competitive landscape is completely unmapped
- Strategic fit assessment is impossible without additional context

### Graceful Degradation
- If TAM confidence is low: apply penalty but proceed
- If competitive data is sparse: flag uncertainty but proceed
- If strategic fit is unclear: escalate to leadership but provide base score

## Integration Constraints

### Upstream Dependencies
- Requires complete opportunity analysis from opportunity-analyst
- Assumes confidence_level from analyst is accurate
- Depends on problem_analysis, market_size_estimate, competition_landscape

### Downstream Expectations
- Output must conform 100% to opportunity-score.schema.json
- Total score must exactly equal sum of dimensions
- Recommendation must follow policy rules
- Scored opportunities feed into prioritization-agent for ranking

## Quality Assurance

### Consistency Check
- Same opportunity scored twice should result in ±5 point variance
- Dimension scores should align with policy rules within ±2 points
- Recommendations should follow thresholds 100% of time

### Calibration Monitoring
- Track distribution of scores across cycles
- Ensure advancement rate aligns with score distribution
- Recalibrate if >25% of "reconsider" opportunities advance

## Cost Management

- OpenAI GPT-4o: ~0.03 per opportunity ($0.001 input, $0.02 output)
- Maximum cycle cost: $0.75 (25 opportunities × $0.03)
- If exceeding budget: reduce dimension reasoning depth or batch smaller cycles
