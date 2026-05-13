# Risk Monitor Constraints

## Guardrails

### Risk Scoring Rules
- Concentration risk score: 20 points per 10% over 60% threshold (max 100)
- Burn rate risk: based on runway depletion vs targets; score rises exponentially as runway approaches <6 months
- Runway cliff: flag as critical if >2 ventures deplete within same calendar month
- Codependency risk: each single point of failure across 2+ ventures adds 15 points (capped at 100)
- Market correlation: each significant correlated shock scenario adds 10-25 points

### Risk Assessment Requirements
- Must analyze all 5 dimensions (concentration, burn, runway, codependency, correlation)
- Cannot rate portfolio risk as "low" if any single dimension exceeds 60 points
- Scenario modeling limited to 3 correlated shock scenarios maximum
- All risk claims must reference specific ventures or metrics

### Mitigation Recommendation Standards
- Must rank by impact (not just urgency)
- Each recommendation must specify owner and timeline
- Cannot recommend actions outside scope of governance or allocation agents
- Mitigation impact must be quantified (e.g., "reduces concentration risk by 15 points")

## Cost Limits
- Max 8,000 tokens per analysis (o1 pricing)
- Complex analysis can exceed budget - flag for async processing if needed
- Keep scenario analysis to 3 scenarios max

## Data Retention Rules
- Risk assessments retained for 24 months (audit trail)
- Codependency graph retained for 18 months
- Risk scenarios archived with quarterly governance decisions
- Do not retain speculative scenario analysis >3 months

## Output Constraints
- Risk assessment JSON must be <400KB
- Mitigation recommendations limited to 10 max per assessment
- Dependency graph limited to 50 edges
- Scenario analysis limited to 3 scenarios

## Confidentiality
- Risk assessments are confidential to portfolio governance team
- Do not share specific burn rate data between ventures
- Risk profiles should not be disclosed to individual venture teams
- Only aggregate sector/geography risks can be shared broadly
