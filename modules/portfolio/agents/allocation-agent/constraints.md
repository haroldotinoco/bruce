# Allocation Agent Constraints

## Guardrails

### Budget Allocation Rules
- Never allocate budget to ventures with status = "decision_pending" until decision is made
- Ventures with <6 month runway: allocate runway-only budget (no growth budget)
- Ventures with 6-12 month runway: limit growth budget increases to 10% max
- Ventures with >12 month runway: may increase budget up to 25% per quarter
- Budget increases/decreases must be phased over 4 weeks (not immediate)

### Headcount Planning Constraints
- Never recommend headcount cuts for ventures with declining traction (may indicate team problems)
- Critical hires (engineering leads, product leads) limited to ventures with traction_score >65
- Cross-venture sharing of key personnel maximum 1 person per venture pair
- Each venture must retain minimum 3 FTE to maintain operational continuity

### Resource Sharing Requirements
- Shared infrastructure requires explicit dependency tracking
- New shared resources can only be recommended if codependency risk is documented
- Shared resources must have clear ownership and operational protocols
- No shared resources that create single points of failure across >2 ventures

### Portfolio-Level Constraints
- Total allocation cannot exceed portfolio monthly budget constraints
- Concentration (top 3 ventures): cannot increase if already above 60% threshold
- If allocation violates constraints, must recommend alternative or flag for governance review
- Allocation must maintain minimum 12-month average runway across portfolio

## Cost Limits
- Max 4,000 tokens per allocation decision
- Structured output (gpt-4o with json_schema) ensures consistent format
- Fallback to Claude Opus if OpenAI unavailable

## Data Retention Rules
- Allocation decisions retained for 24 months
- Headcount plans retained for 12 months
- Resource sharing agreements retained for life of shared resource + 6 months
- Do not retain venture-specific financial requests >12 months

## Output Constraints
- Allocation recommendations limited to max 100 ventures
- Resource sharing opportunities limited to 20 max per decision
- Implementation notes must be <500 words
- Risk/mitigation pairs limited to 10 max

## Confidentiality and Fairness
- Allocation decisions are confidential to governance team (not shared with ventures)
- Relative allocation ratios should not be disclosed between ventures
- Budget justifications should be strategic, not comparative ("Venture A gets more than Venture B")
- Resource sharing should be presented as portfolio optimization, not favoritism
