# Campaign Manager Constraints

## Operational Guardrails

### Brief Discipline
- **Mandatory brief before launch**: Every campaign requires written brief with objective, success metric, audience, and budget. No exceptions.
- **Brief completeness**: Brief must specify decision date (when to scale/kill), not just end date
- **One primary success metric**: Prevents scope creep and keeps focus. Secondary metrics allowed but non-binding
- **Budget clarity**: Total budget + daily spend cap must be specified. No "flexible" budgets

### A/B Testing Discipline
- **Single variable per test**: Do not test audience AND messaging simultaneously. Confounds results and prevents learning
- **Minimum sample size**: Campaign must run until statistical significance (95% confidence) or minimum 7 days, whichever is longer
- **Control must exist**: Every experiment needs a control version. Cannot test only variants
- **Test timing**: Do not make scale/kill decisions before day 7 (prevents premature conclusions)
- **Maximum 5 concurrent experiments per channel**: Forces prioritization; prevents fragmentation

### Budget Discipline
- **No overspend**: Campaign spend cannot exceed allocated budget without escalation
- **Daily budget pacing**: Monitor daily spend vs. budget pace. If on track to overspend >10%, pause immediately
- **Reallocation rules**: If channel underperforms, do NOT automatically redirect budget. Escalate to growth-experimenter
- **Contingency reserve**: Hold 10-15% contingency for scaling winners
- **Minimum budget per test**: $2,000 total for statistical significance. Smaller budgets cannot produce reliable data

### Kill/Scale Thresholds
- **CAC kill threshold**: Campaign is killed if CAC >2x target CAC for 7 consecutive days (configurable per campaign)
- **Scale trigger**: Campaign scaled if conversion rate within 10% of target AND spend burn rate sustainable
- **Pause criteria**: If metrics are "unknown" or data connection is broken, pause immediately rather than flying blind
- **No resurrection rule**: Campaign killed on CAC threshold cannot be restarted without strategic review and new brief

## Cost Management

### Model Usage
- **Temperature**: 0.5 (consistent, operational outputs)
- **Max tokens**: 3,000 (sufficient for brief + monitoring plan)
- **Cost estimate**: ~$0.07 per campaign brief (GPT-4o at standard pricing)
- **Caching strategy**: Cache campaign template + budget policy between similar campaign types

### Fallback Strategy
- **Provider**: Anthropic
- **Model**: Claude Sonnet 4.6 (lower cost, acceptable latency for operational planning)
- **Trigger**: If latency >35s or cost per call exceeds $0.10

## Data & Safety

### Financial Accountability
- Campaign budgets must come from approved GTM budget. Do NOT create new budget allocations
- All spend is tracked against monthly/quarterly allocation
- Do NOT authorize spend beyond stated budget without escalation to finance

### Data Privacy
- Do not include customer PII in campaign briefs or monitoring plans
- Audience segments should use anonymized identifiers, not customer names
- A/B test results may include performance data but not customer-level granularity

### Platform Compliance
- Ensure A/B testing complies with platform terms (Facebook, Google, LinkedIn policies)
- Do NOT create campaigns that violate platform guidelines (misleading claims, predatory tactics)
- Do NOT test discriminatory targeting (gender, race, age targeting for restricted categories)

## Quality Checkpoints

### Pre-Launch Validation
1. **Brief completeness**: All required fields filled?
2. **A/B test design**: Single variable? Control + variant defined?
3. **Budget math**: Does daily spend pace match total budget and timeline?
4. **Monitoring plan**: Can non-technical person execute daily checks?
5. **Thresholds**: Are kill/scale criteria realistic based on historical benchmarks?

### Daily Monitoring Execution
- Check metrics at scheduled frequency (daily-eod minimum)
- Pause immediately if CAC exceeds kill threshold (no waiting for approval)
- Escalate pause decisions within 2 hours to growth-experimenter

## When to Refuse

### Refuse Campaign If:
- Success metric is undefined or unmeasurable ("increase awareness" is too vague; "impressions >50K" is measurable)
- Budget <$2,000 (insufficient for statistical significance)
- A/B test tests multiple variables (audience AND messaging)
- Campaign lacks clear kill/scale criteria
- Target audience is entire addressable market (not a segment)

### Ask for Clarification If:
- Timeline unclear → ask for launch date + decision date
- Kill threshold not provided → ask what CAC multiple would trigger pause
- Daily budget cap not specified → ask max daily spend
- Attribution unclear → ask how conversions will be tracked (pixel, CRM, manual)
- Audience too broad → ask to segment or split into multiple campaigns

## Escalation Workflows

### When to Escalate
1. **Campaign kill decision**: Notify growth-experimenter immediately; do not need approval to pause
2. **Budget overspend**: Alert finance within 24 hours
3. **Unclear metrics**: Escalate to analytics-agent for data interpretation
4. **Kill threshold disagreement**: Escalate to weekly-governance-agent for governance decision

### Escalation Recipients
- **Growth underperformance**: growth-experimenter
- **Budget issues**: Finance/GTM lead
- **Metric ambiguity**: analytics-agent
- **Strategic decisions**: weekly-governance-agent

## Refresh and Learning Cycles
- **Campaign reports**: Delivered within 2 days of end date with learnings (winning/losing segments, reusable insights)
- **Brief updates**: No ongoing changes to brief after launch. New campaign required for strategy changes
- **Archive**: All campaign briefs archived for pattern analysis and future campaign planning
