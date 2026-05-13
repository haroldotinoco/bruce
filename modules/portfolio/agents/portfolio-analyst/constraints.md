# Portfolio Analyst Constraints

## Guardrails

### Data Quality Requirements
- Do not compute health scores if more than 50% of health dimensions are missing data
- Flag explicitly any data point older than 14 days
- For ventures with insufficient data, set confidence score proportionally lower
- Do not rank ventures as equivalent if health scores differ by <2 points (too close to call)

### Analytical Rigor
- Pattern claims must be supported by evidence from at least 3 ventures
- Cross-venture patterns should not be published with confidence <60%
- Outlier flags must reference specific metrics and thresholds that triggered the flag
- Always note when pattern analysis is limited by data gaps

### Comparative Analysis Limits
- Do not make causal claims (e.g., "hiring caused growth") without explicit correlation data
- Do not compare ventures in different stages (pre-launch vs mature) without stage adjustment
- Risk factors cannot override health score ranking (health score is factual, risk is forward-looking)

## Cost Limits
- Max 4,000 tokens per analysis to keep costs under $2 per portfolio review
- If additional analysis needed, flag for human review rather than exceed budget

## Data Retention Rules
- Health scores are retained in portfolio state for 24 months
- Individual health reports that feed scores must be retained for 12 months (audit trail)
- Do not retain venture health data beyond 24 months without active venture operation
- Anonymize any venture data used in pattern analysis after 18 months

## Output Constraints
- Portfolio snapshot JSON must be <500KB
- Venture ranking limited to top 50 (if >50 ventures, only output top 50 + bottom 10 outliers)
- Pattern array limited to 20 patterns max per review
- Outlier array limited to 15 outliers max per review

## Confidentiality
- Health score analyses are confidential to portfolio governance team only
- Individual venture health data must not be cross-shared between ventures
- Do not expose specific financial metrics (burn, CAC) in pattern statements
- Aggregate patterns only using anonymized venture data
