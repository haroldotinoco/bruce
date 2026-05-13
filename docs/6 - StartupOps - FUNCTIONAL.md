# StartupOps — Functional Documentation

## 1. Functional Objective

StartupOps must provide continuous, disciplined operational intelligence about each running venture. It transforms raw operational data into interpreted, prioritized, actionable recommendations that inform both immediate tactical adjustments and governance-level continuation decisions.

## 2. Expected Result

After StartupOps is engaged:

- The venture has a **weekly operational summary** with clear signal interpretation.
- **Anomalies are detected early** — a 2% churn shift is noticed before it becomes 10%.
- **Health is quantified** — the venture has a composite health score derived from explicit formulas.
- **Adjustments are proposed** — prioritized by impact and feasibility.
- **Governance is informed** — the Portfolio/Governance layer receives real signal about venture viability.
- **Accountability exists** — thresholds are explicit, status is clear, recommendations are traceable.

## 3. Main Responsibilities

StartupOps owns the following responsibilities:

### 3.1 Continuous Monitoring
- Ingest operational data from all sources (product, marketing, finance, product analytics).
- Normalize metrics across different definitions and sources.
- Establish a single source of truth for venture operational state.

### 3.2 Signal Interpretation
- Apply consistent logic to interpret what metrics mean.
- Distinguish between signal (meaningful trend) and noise (random fluctuation).
- Cohort-based analysis (segment users by acquisition date, channel, geography, etc.).
- Trend detection (is the venture accelerating, plateauing, or declining?).

### 3.3 Anomaly Detection
- Identify when actual performance diverges from expected trajectory.
- Establish decision thresholds (both green and red zone boundaries).
- Alert when thresholds are breached.
- Escalate severe anomalies immediately.

### 3.4 Health Scoring
- Combine vital signals into a composite venture health assessment.
- Derive health score from explicit formulas (not subjective judgment).
- Score subcomponents: activation health, retention health, revenue health, product quality, burn rate.
- Update health score weekly.

### 3.5 Recommendation Generation
- Propose structured adjustments to improve metrics.
- Quantify impact of proposed adjustments.
- Prioritize recommendations by impact and feasibility.
- Link recommendations to specific metrics they're designed to improve.

### 3.6 Governance Reporting
- Provide Portfolio/Governance layer with clear signal about venture health.
- Escalate ventures that breach kill thresholds or opportunity thresholds.
- Track progress against milestones.
- Provide context for governance decisions (continue, pause, pivot, kill).

## 4. Inputs Expected

StartupOps requires inputs from multiple sources:

### 4.1 From GTM Module
- Customer acquisition cost (CAC) by channel and cohort
- Acquisition volume and trend
- Campaign performance metrics
- Channel effectiveness

### 4.2 From Product / Analytics
- Daily, weekly, monthly active users (DAU, WAU, MAU)
- Activation funnel (sign-up → first value → weekly return)
- Retention by cohort (Day 1, 7, 30, 90)
- Churn rate (monthly and cohort-specific)
- Feature usage by user segment
- Session frequency and duration
- Performance metrics (load time, errors, crashes)
- NPS or satisfaction proxy

### 4.3 From Revenue / Finance
- Monthly recurring revenue (MRR)
- Total revenue by segment or customer tier
- Customer lifetime value (LTV)
- Paid user count and pricing
- Operating expenses by category
- Current cash balance
- Burn rate (monthly cash outflow)
- Runway (months of cash remaining)

### 4.4 From Venture Context
- Original venture thesis and hypotheses
- Launch date and GTM phase
- Target market and competitive landscape
- Key milestones and success criteria
- Known constraints (budget, team, timeline)

### 4.5 From Human Oversight
- Known issues or problems the team is aware of
- Recent changes (product, pricing, team, strategy)
- Planned initiatives for next period
- External market events affecting the venture

## 5. Main Output Structure

StartupOps produces three main output artifacts:

### 5.1 Weekly OpsReport

```
{
  "venture_id": "string",
  "report_date": "ISO 8601",
  "period": "week_of_YYYY_MM_DD",
  "overall_health_score": number (0-100),
  "health_trend": "improving" | "stable" | "declining",
  "critical_alerts": [
    {
      "metric": "string",
      "status": "critical" | "warning",
      "current_value": number,
      "threshold": number,
      "deviation": number,
      "interpretation": "string"
    }
  ],
  "vital_signals": {
    "activation": {
      "sign_ups_week": number,
      "activation_rate": number,
      "trend_vs_last_week": number (percent change)
    },
    "retention": {
      "mau": number,
      "day_1_retention": number,
      "day_7_retention": number,
      "day_30_churn_rate": number,
      "trend_vs_last_week": number
    },
    "revenue": {
      "mrr": number,
      "arpu": number,
      "ltv": number,
      "ltv_cac_ratio": number,
      "trend_vs_last_week": number
    },
    "financial": {
      "burn_rate": number,
      "runway_weeks": number,
      "vs_plan": "on_track" | "ahead" | "behind"
    }
  },
  "anomalies_detected": [
    {
      "metric": "string",
      "detection": "string",
      "severity": "info" | "warning" | "critical",
      "action_required": boolean
    }
  ],
  "proposed_adjustments": [
    {
      "adjustment": "string",
      "rationale": "string",
      "estimated_impact": "string",
      "priority": "immediate" | "high" | "medium" | "low",
      "effort": "low" | "medium" | "high"
    }
  ],
  "escalations": [
    {
      "issue": "string",
      "governance_decision_required": "continue" | "pause" | "pivot" | "kill"
    }
  ],
  "next_week_focus": ["string"]
}
```

### 5.2 VentureHealthScore

```
{
  "venture_id": "string",
  "score_date": "ISO 8601",
  "overall_health_score": number (0-100),
  "health_classification": "critical" | "at_risk" | "healthy" | "excellent",
  "component_scores": {
    "activation_health": number (0-100),
    "retention_health": number (0-100),
    "revenue_health": number (0-100),
    "product_quality_health": number (0-100),
    "financial_sustainability_health": number (0-100),
    "market_fit_health": number (0-100)
  },
  "trend_direction": "improving" | "stable" | "declining",
  "weeks_until_critical": number (if declining),
  "key_risk_factors": ["string"],
  "key_opportunity_factors": ["string"],
  "formulas_used": "object"
}
```

### 5.3 ProposedAdjustment Package

```
{
  "venture_id": "string",
  "generated_date": "ISO 8601",
  "adjustments": [
    {
      "id": "string",
      "adjustment_name": "string",
      "category": "activation" | "retention" | "revenue" | "product" | "burn" | "positioning",
      "description": "string",
      "rationale": "string",
      "metrics_targeted": ["string"],
      "estimated_impact_metric": "string",
      "estimated_impact_value": number,
      "estimated_impact_confidence": "low" | "medium" | "high",
      "required_effort": "low_days" | "medium_weeks" | "high_months",
      "implementation_steps": ["string"],
      "priority_rank": number,
      "risk_of_adjustment": "string"
    }
  ],
  "prioritization_logic": "string"
}
```

## 6. Functional Flow

StartupOps operates on a continuous weekly cycle:

```
data_collection → metric_normalization → signal_interpretation →
anomaly_detection → health_scoring → recommendation_generation →
governance_reporting → (human decision) → (venture adjusts) → repeat
```

### 6.1 Data Collection (Daily)
- Ingest operational data from product, marketing, finance systems.
- Normalize data into unified schema.
- Validate data quality (flag gaps, anomalies, inconsistencies).

### 6.2 Metric Interpretation (Ongoing)
- Apply cohort-based analysis (segment users by acquisition date, channel, geography).
- Calculate key metrics (churn, LTV, CAC, burn rate, health scores).
- Compare actual vs. expected performance.

### 6.3 Anomaly Detection (Daily)
- Monitor metrics against established thresholds.
- Identify divergence from trend.
- Flag metrics that cross warning or critical thresholds.
- Escalate immediately if critical thresholds are breached.

### 6.4 Health Scoring (Weekly)
- Combine vital signals into component scores (activation, retention, revenue, product, financial, market fit).
- Calculate overall venture health score.
- Determine health trend (improving, stable, declining).
- Estimate time to critical if declining.

### 6.5 Recommendation Generation (Weekly)
- Analyze what metrics are weak and why.
- Propose structured adjustments (not panic, not inaction).
- Estimate impact of each adjustment.
- Prioritize by impact and feasibility.
- Link recommendations to specific metrics.

### 6.6 Governance Reporting (Weekly)
- Summarize venture health and performance for Portfolio/Governance layer.
- Escalate ventures at critical risk.
- Provide context and recommendations.
- Track progress against milestones.
- Inform continuation/pivot/kill decisions.

## 7. Agent Roles

StartupOps uses 6 specialized agents, each with defined responsibility:

### Agent 1 — Metrics Analyst

| Property   | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| **Input**  | Raw operational data from multiple sources                         |
| **Output** | Normalized, cleaned metrics in unified schema                      |
| **Scope**  | Data quality, validation, cohort analysis, trend calculation       |
| **Tools**  | Data validation, cohort analysis, trend regression, outlier detection |

### Agent 2 — Retention Analyst

| Property   | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| **Input**  | User activation and behavior data                                  |
| **Output** | Retention health assessment, churn detection, activation funnel analysis |
| **Scope**  | Activation funnel, Day 1/7/30/90 retention, churn by cohort, feature adoption |
| **Tools**  | Cohort analysis, funnel visualization, churn modeling              |

### Agent 3 — Revenue Analyst

| Property   | Value                                                                      |
| ---------- | -------------------------------------------------------------------------- |
| **Input**  | Customer acquisition and monetization data                                |
| **Output** | Revenue health assessment, unit economics analysis, CAC/LTV trending      |
| **Scope**  | CAC by channel, LTV by cohort, ARPU, MRR growth, payback period analysis  |
| **Tools**  | CAC/LTV modeling, cohort economics, channel attribution                   |

### Agent 4 — Operations Monitor

| Property   | Value                                                                      |
| ---------- | -------------------------------------------------------------------------- |
| **Input**  | Financial metrics, product health, performance data                        |
| **Output** | Financial sustainability assessment, product quality trends, alert system |
| **Scope**  | Burn rate, runway, product errors/crashes, performance metrics            |
| **Tools**  | Financial projections, performance monitoring, threshold alerts           |

### Agent 5 — Health Scoring Agent

| Property   | Value                                                                                 |
| ---------- | ------------------------------------------------------------------------------------- |
| **Input**  | All component health assessments from Agents 1–4                                      |
| **Output** | Composite venture health score, trend direction, risk factors, opportunity factors   |
| **Scope**  | Score calculation, component weighting, trend projection, milestone tracking         |
| **Tools**  | Health scoring formulas, trend projection, milestone comparison                      |

### Agent 6 — Advisory Agent

| Property   | Value                                                                           |
| ---------- | ------------------------------------------------------------------------------- |
| **Input**  | Health assessment and anomalies from Agents 1–5                                |
| **Output** | Proposed adjustments, prioritized recommendations, governance escalations       |
| **Scope**  | Adjustment generation, impact estimation, prioritization, escalation logic     |
| **Tools**  | Impact estimation, prioritization algorithms, governance decision criteria     |

## 8. Key Workflow Rules

1. **Data quality comes first** — no analysis proceeds with gaps or inconsistent data. Gaps are explicitly flagged and remedied.

2. **Thresholds are set before operation** — green, yellow, and red thresholds are established during venture launch planning, not changed retroactively to hide problems.

3. **Cohort analysis is mandatory** — metrics are always segmented (acquisition date, channel, geography, user type) because aggregate metrics hide patterns.

4. **Trends matter more than absolutes** — a 2% monthly churn increase is more important than 5% absolute churn if it's accelerating.

5. **Early escalation saves ventures** — a metric that crosses warning threshold triggers immediate escalation, not dismissal.

6. **Recommendations are specific** — "improve retention" is not a recommendation. "Implement onboarding step X for cohorts acquired in Jan/Feb, projected to improve Day 7 retention by 3%" is.

7. **No assumptions in scoring** — health scores are derived from explicit formulas, not subjective judgment. Every point in the formula is auditable.

8. **Venture context is critical** — metrics are always interpreted in light of the original thesis, market, and competitive landscape. Raw numbers without context are meaningless.

## 9. Integration Map

StartupOps integrates with:

### Upstream (Data Sources)
- **Product Analytics** — user activation, retention, feature usage
- **GTM Module** — customer acquisition cost, channel performance
- **Finance Systems** — revenue, expenses, cash balance, burn rate
- **Venture Context** — original thesis, milestones, constraints

### Downstream (Decision Consumers)
- **Portfolio/Governance Layer** — receives health scores, escalations, recommendations
- **Product Squad** — receives product quality alerts and adjustment recommendations
- **GTM Squad** — receives channel performance analysis and CAC optimization recommendations
- **Finance** — receives burn rate analysis and runway projections

## 10. Success Criterion

StartupOps is successful when:

1. **Anomalies are detected early** — problems are identified 4–8 weeks before they become fatal.

2. **Health is transparent** — the venture and governance layer agree on venture health based on explicit formulas.

3. **Adjustments improve outcomes** — recommended changes demonstrably improve metrics (measured by follow-up analysis).

4. **Escalations prevent disasters** — ventures at critical risk are identified and corrected before cash runs out.

5. **Learning accumulates** — the system learns which adjustments work and which don't, improving future recommendations.

6. **Decision-making is faster** — the venture can make and validate operational decisions in 2–4 weeks, not 3 months.

7. **Ventures improve their health** — ventures monitored by StartupOps show improvement in health score over 8-week periods more often than not.
