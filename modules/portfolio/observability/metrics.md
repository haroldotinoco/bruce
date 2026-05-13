# Portfolio Module Observability Metrics

## Metric Categories

---

## Portfolio Health Metrics

### Overall Portfolio Health Score
- **Definition**: Weighted average of all active venture health scores
- **Formula**: `SUM(venture_health_score_i * weight_i) / SUM(weight_i)`
- **Weight Factors**: By-stage weighting (growth ventures weighted higher than ideation)
- **Unit**: 0-100
- **Threshold**: Score < 50 triggers escalation review
- **Cadence**: Updated daily; reported weekly
- **Target**: >= 65 (healthy portfolio)

### Venture Health Distribution
- **Excellent**: Count of ventures with health > 80
- **Good**: Count with health 60-80
- **Fair**: Count with health 40-60
- **At-Risk**: Count with health < 40
- **Cadence**: Weekly snapshot
- **Target Distribution**: 25% excellent, 40% good, 25% fair, 10% at-risk

### Portfolio Concentration Risk
- **Max Single Venture %**: Percentage of total burn in largest venture
- **Top 3 Ventures %**: Percentage of total burn in 3 largest ventures
- **Threshold Alert**: Single venture > 40% triggers warning; > 50% critical
- **Cadence**: Daily check; weekly report
- **Target**: No single venture > 40%, top 3 < 70%

---

## Growth & Traction Metrics

### Portfolio MRR Trend
- **Definition**: Total monthly recurring revenue across all ventures
- **Unit**: USD
- **Cadence**: Daily tracking; weekly trend report
- **Calculation**: SUM(venture_mrr_i) for all active ventures
- **Target**: Month-over-month growth >= 15%
- **Anomaly**: Drops > 30% trigger emergency review

### Revenue Concentration
- **Definition**: Percentage of total MRR from top venture
- **Unit**: Percentage
- **Cadence**: Weekly
- **Target**: No single venture > 60% of portfolio MRR
- **Alert**: > 70% triggers diversification recommendation

### New Ventures Launched
- **Definition**: Count of ventures launched in period
- **Unit**: Count per month
- **Cadence**: Monthly
- **Target**: 1-2 new ventures per month (optimal pace)

### Venture Graduation Rate
- **Definition**: % of ventures graduating to next stage per period
- **Unit**: Percentage
- **Cadence**: Monthly
- **Calculation**: Ventures advancing stage / total ventures
- **Target**: 20-30% quarter-over-quarter (healthy progression)

---

## Decision & Governance Metrics

### Scale Decision Rate
- **Definition**: Percentage of review cycles with ≥1 SCALE decision
- **Unit**: Percentage
- **Cadence**: Per review cycle; reported monthly
- **Calculation**: Cycles with scale decisions / total cycles
- **Target**: 15-25% of cycles (balance growth and risk)
- **Alert**: < 10% suggests under-investment; > 35% suggests over-aggressive

### Kill Decision Rate
- **Definition**: Percentage of portfolio ventures killed per period
- **Unit**: Percentage
- **Cadence**: Monthly
- **Calculation**: Ventures killed / average portfolio size
- **Target**: 5-15% annually (healthy churn)
- **Alert**: > 20% suggests poor initial selection; < 3% suggests insufficient culling

### Iterate Decision Rate
- **Definition**: Percentage of ventures in ITERATE status
- **Unit**: Percentage
- **Cadence**: Per review cycle
- **Calculation**: Ventures in ITERATE / total ventures
- **Target**: 30-40% of portfolio (healthy experimentation)

### Continue Decision Rate
- **Definition**: Percentage of ventures with CONTINUE decision
- **Unit**: Percentage
- **Cadence**: Per review cycle
- **Target**: 40-50% of portfolio (steady state)

### Human Confirmation Rate
- **Definition**: Percentage of decisions requiring human confirmation that received it
- **Unit**: Percentage
- **Cadence**: Per cycle
- **Calculation**: Confirmations received / confirmations requested
- **Target**: 100% within SLA
- **Alert**: Any confirmation expired without decision = escalation

### Decision Cycle Time
- **Definition**: Time from cycle start to all decisions made & executed
- **Unit**: Hours
- **Cadence**: Per cycle
- **Calculation**: End timestamp - start timestamp
- **Target**: < 168 hours (7 days)
- **SLA**: 100% of cycles complete within 7 days

---

## Financial Metrics

### Total Portfolio Burn (Monthly)
- **Definition**: Total monthly burn across all active ventures
- **Unit**: USD
- **Cadence**: Weekly tracking; monthly report
- **Calculation**: SUM(venture_burn_rate_i)
- **Target**: Aligned with budget; no > 10% variance from plan
- **Alert**: > 20% overage triggers review

### Burn Rate Efficiency (MRR / Burn)
- **Definition**: Ratio of total portfolio MRR to total monthly burn
- **Unit**: Ratio
- **Cadence**: Monthly
- **Calculation**: Total MRR / Total Burn
- **Target**: >= 0.5 (for growth-stage portfolio)
- **Alert**: < 0.3 suggests portfolio is burning too fast

### Average Venture Runway
- **Definition**: Average months of runway across all active ventures
- **Unit**: Months
- **Cadence**: Monthly
- **Calculation**: AVG(runway_months_i) for all ventures
- **Target**: >= 6 months (sufficient time for results)
- **Alert**: < 4 months triggers escalation; < 2 months critical

### Venture Runway Distribution
- **Count < 2 months**: Ventures in critical runway
- **Count 2-4 months**: Ventures at risk
- **Count 4-6 months**: Ventures adequate
- **Count > 6 months**: Ventures healthy
- **Cadence**: Weekly
- **Target**: < 10% in critical, < 25% at risk

### Allocation Budget Variance
- **Definition**: Planned vs. actual spend variance
- **Unit**: Percentage
- **Cadence**: Monthly
- **Calculation**: (Actual - Planned) / Planned
- **Target**: ±10% variance acceptable
- **Alert**: > ±20% triggers investigation

---

## Unit Economics Metrics

### Portfolio LTV/CAC Distribution
- **Excellent**: Count of ventures with LTV/CAC > 3x
- **Healthy**: Count with 2-3x
- **At-Risk**: Count with 1-2x
- **Broken**: Count with < 1x
- **Cadence**: Monthly
- **Target**: > 50% in excellent/healthy categories

### Average CAC Trend
- **Definition**: Weighted average CAC across ventures (excluding pre-launch)
- **Unit**: USD
- **Cadence**: Monthly
- **Trend**: Should be stable or declining (efficiency improving)
- **Alert**: > 20% increase month-over-month

### Average LTV Trend
- **Definition**: Weighted average LTV across ventures
- **Unit**: USD
- **Cadence**: Monthly
- **Trend**: Should be stable or improving
- **Target**: Increasing or stable

### Gross Margin Distribution
- **Definition**: Average gross margin across ventures
- **Unit**: Percentage
- **Cadence**: Monthly
- **Target**: >= 70% (healthy for SaaS)
- **Alert**: < 50% suggests pricing/cost structure issues

---

## Retention & Churn Metrics

### Portfolio Churn Rate
- **Definition**: Weighted average monthly churn rate across all ventures
- **Unit**: Percentage (monthly)
- **Cadence**: Monthly
- **Weight**: By revenue contribution
- **Target**: < 10% monthly (implies < 40% annual)
- **Alert**: > 15% monthly triggers investigation

### Retention D30 Distribution
- **Excellent**: % of ventures with D30 > 50%
- **Good**: % with 40-50%
- **Fair**: % with 30-40%
- **Poor**: % with < 30%
- **Cadence**: Monthly
- **Target**: > 50% in excellent/good categories

### Customer Lifecycle
- **Avg Customer Lifetime**: Weighted average months per customer
- **Unit**: Months
- **Cadence**: Monthly
- **Calculation**: 1 / (monthly_churn_rate)
- **Target**: >= 10 months (healthy for B2B SaaS)

---

## Risk Metrics

### Portfolio Risk Score
- **Definition**: Aggregate risk metric combining concentration, runway, health
- **Formula**: `0.4 * concentration_risk + 0.3 * runway_risk + 0.3 * health_risk`
- **Unit**: 0-10 scale
- **Cadence**: Weekly
- **Target**: <= 5 (moderate risk acceptable)
- **Alert**: >= 7 critical

### Concentration Risk Score
- **Component**: (Max venture % / 40%) + (Top 3 % / 70%)
- **Unit**: 0-10
- **Target**: <= 3

### Runway Risk Score
- **Component**: Count ventures < 2 months runway / total ventures * 10
- **Unit**: 0-10
- **Target**: <= 2

### Health Risk Score
- **Component**: Count ventures with health < 50 / total ventures * 10
- **Unit**: 0-10
- **Target**: <= 3

---

## Operational Metrics

### Review Cycle Completion Rate
- **Definition**: % of scheduled review cycles completed on time
- **Unit**: Percentage
- **Cadence**: Monthly
- **Target**: 100%
- **Alert**: Any missed cycle triggers escalation

### Emergency Review Frequency
- **Definition**: Count of out-of-cycle emergency reviews
- **Unit**: Count per month
- **Cadence**: Monthly
- **Baseline**: 1-2 per month (expected anomalies)
- **Alert**: > 5 per month suggests underlying issues

### Decision Confidence Average
- **Definition**: Average confidence score across all decisions in period
- **Unit**: 0-100
- **Cadence**: Per cycle
- **Calculation**: AVG(confidence_score_i) for all decisions
- **Target**: >= 75% (high confidence decisions)
- **Alert**: < 65% suggests insufficient data or analysis

### Human Review Escalation Rate
- **Definition**: % of decisions requiring human confirmation
- **Unit**: Percentage
- **Cadence**: Per cycle
- **Calculation**: Decisions requiring confirmation / total decisions
- **Target**: < 20% (most decisions should be autonomous)
- **Alert**: > 40% suggests either overly conservative policy or high-variance situations

### Founder Satisfaction (Surveys)
- **Definition**: Net satisfaction of venture founders with portfolio governance
- **Unit**: -100 to +100 (NPS-style)
- **Cadence**: Quarterly
- **Target**: >= +30 (satisfactory)
- **Components**: Decision timeliness, communication, resource fairness

---

## Outcome Metrics

### Venture Success Rate
- **Definition**: Percentage of ventures reaching scale stage per cohort
- **Unit**: Percentage
- **Cadence**: Quarterly (measured per launch cohort)
- **Cohort**: All ventures launched in given quarter
- **Target**: 15-25% reach scale within 12 months
- **Baseline**: Typical early-stage success rate ~20%

### Time to Scale
- **Definition**: Average time from launch to SCALE decision
- **Unit**: Weeks
- **Cadence**: Quarterly average
- **Target**: 12-24 weeks (3-6 months)
- **Range**: 8-40 weeks acceptable (some fast, some slow)

### Exit Rate
- **Definition**: % of ventures with successful outcome (acquisition, profitability, or fundraising at scale)
- **Unit**: Percentage per year
- **Cadence**: Annual
- **Target**: >= 10% (comparable to venture benchmarks)

### Post-Kill Learning Utilization
- **Definition**: % of learnings from killed ventures applied to new ventures
- **Unit**: Percentage
- **Cadence**: Quarterly
- **Measurement**: Survey founders of new ventures on learnings absorbed
- **Target**: >= 70%

---

## Dashboard View Templates

### Executive Dashboard (Weekly)
- Portfolio health score (trend)
- Total MRR (trend)
- Total burn (trend)
- Key decisions made this week
- Top risks
- Runway distribution

### Portfolio Lead Dashboard (Daily)
- Concentration risk current state
- Ventures with anomalies (from alerts)
- Upcoming decisions/confirmations needed
- Budget variance
- Next review cycle status

### Founder Dashboard (Per Venture)
- Your venture health score
- Current allocation
- Next milestone targets
- Status (SCALE/ITERATE/CONTINUE/PAUSE/KILL)
- Next review date

---

## Alerting Thresholds

| Metric | Alert Threshold | Severity |
|--------|---|---|
| Portfolio health < 50 | < 50 | HIGH |
| Single venture concentration | > 45% | MEDIUM |
| Venture runway | < 2 months | HIGH |
| Portfolio MRR drop | > 30% MoM | CRITICAL |
| Churn rate spike | > 20% MoM | HIGH |
| Decision cycle delay | > 8 days | MEDIUM |
| Confirmation pending | > 72 hours | HIGH |
| Emergency review frequency | > 5/month | MEDIUM |

---

## Metric Retention & Archive

- **Real-time**: Metrics updated continuously; 7-day rolling window
- **Daily Snapshots**: One snapshot per day retained for 1 year
- **Monthly Aggregates**: One per month retained indefinitely
- **Anomalies**: Flagged incidents retained indefinitely for root cause analysis
- **Query**: All metrics queryable by date range, venture, cycle_id, metric type
