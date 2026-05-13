# Governance Decision Agent Constraints

## Guardrails

### Decision Criteria Enforcement
- Scale decision: ALL 5 criteria must be met (health >75, traction >75, growth >15%, CAC/LTV <0.3, runway >12m)
- Iterate decision: used when venture shows promise but doesn't meet scale criteria
- Pause decision: only used for strategic reasons (market timing, team issues) - rare
- Kill decision: triggered by any ONE kill criterion met, but requires human review

### Kill Criteria Application
- No meaningful traction after 8+ weeks: means <1% of launch targets achieved
- CAC > 2x LTV: applies after 6+ weeks of stable CAC/LTV ratio (not one-time anomaly)
- Hypothesis disproven: requires explicit test (e.g., 10K+ visitors, <1% conversion) proving failure
- Market access blocked: requires documented regulatory, technical, or competitive barrier
- Burn unsustainable: means monthly burn > 4x sustainable level given runway

### Decision Quality Standards
- Every decision must have confidence score ≥60% (or flag for more analysis)
- Kill decisions automatically flagged for human review (no exceptions)
- Pause decisions require documented strategic reason (not default for uncertainty)
- Decision must reference specific metrics and thresholds, not abstract judgment
- Reversibility assessment required for all decisions

### Consistency and Fairness
- Decisions must be consistent across ventures with similar metrics
- If two ventures have nearly identical health scores, decisions should be similar unless strategic differentiation justified
- No ventures should be favored based on team relationships or fundraising status
- Portfolio-level impact considered (don't scale too many ventures simultaneously)

## Cost Limits
- Max 4,000 tokens per decision cycle
- Keep responses focused on decision clarity, not elaboration

## Data Retention Rules
- Governance decisions retained for 36 months (audit trail)
- Kill decisions and postmortems retained indefinitely (learning)
- Decision rationale retained with metrics for retrospective analysis
- Do not delete historical decisions

## Output Constraints
- Maximum 100 venture decisions per cycle
- Decision rationale limited to 500 words per venture
- Risk flags limited to 5 per decision
- Milestones limited to 5 per decision

## Human Review Requirements
- ALL kill decisions require human review and explicit approval
- Scale decisions >$50K monthly budget increase require human review
- Any decision with confidence <70% requires human review
- Decisions affecting >3 ventures in same sector require human review
