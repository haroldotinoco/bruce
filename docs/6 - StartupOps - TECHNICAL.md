# StartupOps — Technical Documentation

## 1. Technical Objective

StartupOps must ingest heterogeneous operational data, normalize it into a unified schema, apply continuous analytical reasoning, detect anomalies, score venture health, and generate structured recommendations. The system must operate in near-real-time (ingestion within hours, analysis within 24 hours), support audit trails for all calculations, and integrate cleanly with upstream data sources and downstream governance systems.

## 2. Architectural Role

StartupOps occupies the **operational intelligence layer** of the Bruce ecosystem. It sits:

- **Downstream** of GTM (receives a live, customer-acquiring venture)
- **Upstream** of Portfolio/Governance (informs decisions about venture continuation)
- **Parallel** to the venture itself (observes performance independently)

It must be:
- **Continuous** — monitoring 24/7, not episodic
- **Integrated** — pulling data from multiple sources transparently
- **Interpreted** — applying consistent analytical logic
- **Auditable** — every conclusion is traceable to data and formula
- **Actionable** — outputs drive specific decisions

## 3. Main Entities

### 3.1 VentureOperation

```json
{
  "venture_id": "string (UUID)",
  "venture_name": "string",
  "status": "active" | "paused" | "ended",
  "launch_date": "ISO 8601",
  "target_market": "string",
  "business_model": "string",
  "team_size": number,
  "current_runway_weeks": number,
  "operational_context": {
    "original_thesis": "string",
    "key_hypotheses": ["string"],
    "target_metrics": {
      "activation_target": number,
      "retention_day_7": number,
      "mrr_target_month_6": number,
      "burn_rate_limit": number
    },
    "milestones": [
      {
        "milestone_name": "string",
        "target_date": "ISO 8601",
        "success_criteria": ["string"],
        "status": "pending" | "achieved" | "missed"
      }
    ]
  },
  "data_sources": {
    "product_analytics": "string (API endpoint or SDK config)",
    "gtm_system": "string",
    "finance_system": "string",
    "custom_metrics": ["string"]
  },
  "health_score_settings": {
    "component_weights": "object",
    "alert_thresholds": "object",
    "escalation_rules": "object"
  },
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

### 3.2 MetricSnapshot

Represents a single point-in-time measurement of operational metrics.

```json
{
  "snapshot_id": "string (UUID)",
  "venture_id": "string",
  "snapshot_date": "ISO 8601",
  "period": "daily" | "weekly" | "monthly",
  "metrics": {
    "activation": {
      "new_signups": number,
      "activation_rate": number,
      "day_1_return": number,
      "source_attribution": {
        "organic": number,
        "paid_search": number,
        "paid_social": number,
        "referral": number,
        "other": number
      }
    },
    "retention": {
      "dau": number,
      "wau": number,
      "mau": number,
      "day_1_retention": number,
      "day_7_retention": number,
      "day_30_retention": number,
      "day_90_retention": number,
      "monthly_churn_rate": number,
      "cohort_analyses": [
        {
          "cohort_id": "string",
          "acquisition_date": "ISO 8601",
          "acquisition_channel": "string",
          "user_count": number,
          "retention_by_day": {"1": number, "7": number, "30": number, "90": number},
          "churn_rate": number
        }
      ]
    },
    "revenue": {
      "mrr": number,
      "arr": number,
      "total_revenue": number,
      "arpu": number,
      "paying_users": number,
      "conversion_rate": number,
      "ltv": number,
      "ltv_cac_ratio": number,
      "payback_period_months": number,
      "revenue_by_segment": {
        "segment_name": number
      },
      "cac_by_channel": {
        "organic": number,
        "paid_search": number,
        "paid_social": number,
        "referral": number
      }
    },
    "product_health": {
      "error_rate": number,
      "crash_rate": number,
      "avg_load_time_ms": number,
      "p95_latency_ms": number,
      "uptime_percent": number,
      "feature_adoption": {
        "feature_name": number
      },
      "nps_proxy": number,
      "user_satisfaction_score": number
    },
    "financial": {
      "cash_balance": number,
      "monthly_burn_rate": number,
      "runway_weeks": number,
      "operating_expenses": {
        "salaries": number,
        "infrastructure": number,
        "marketing": number,
        "other": number
      },
      "capital_raised": number,
      "funded_months_remaining": number
    },
    "gtm_performance": {
      "campaign_roas": number,
      "ad_spend_week": number,
      "cpc": number,
      "ctr": number,
      "conversion_funnel": {
        "stage_name": {"visitors": number, "conversions": number}
      }
    }
  },
  "data_quality": {
    "gaps_detected": ["string"],
    "anomalies_detected": ["string"],
    "data_freshness": "hours_old",
    "validation_status": "valid" | "partial" | "invalid"
  },
  "created_at": "ISO 8601"
}
```

### 3.3 HealthReport

A comprehensive health assessment combining all signals into component and overall scores.

```json
{
  "report_id": "string (UUID)",
  "venture_id": "string",
  "report_date": "ISO 8601",
  "period": "week_of_YYYY_MM_DD",
  "overall_health_score": number (0-100),
  "health_status": "critical" | "at_risk" | "healthy" | "excellent",
  "health_trend": "improving" | "stable" | "declining",
  "component_scores": {
    "activation_health": {
      "score": number (0-100),
      "trend": "improving" | "stable" | "declining",
      "key_metric": "new_signups",
      "week_over_week_change": number,
      "vs_target": number
    },
    "retention_health": {
      "score": number (0-100),
      "trend": "improving" | "stable" | "declining",
      "key_metric": "day_7_retention",
      "month_over_month_churn": number,
      "vs_target": number
    },
    "revenue_health": {
      "score": number (0-100),
      "trend": "improving" | "stable" | "declining",
      "key_metric": "mrr",
      "ltv_cac_ratio": number,
      "vs_target": number
    },
    "product_quality_health": {
      "score": number (0-100),
      "trend": "improving" | "stable" | "declining",
      "key_metric": "error_rate",
      "vs_baseline": number
    },
    "financial_sustainability_health": {
      "score": number (0-100),
      "trend": "improving" | "stable" | "declining",
      "key_metric": "runway_weeks",
      "weeks_until_critical": number,
      "vs_plan": "ahead" | "on_track" | "behind"
    },
    "market_fit_health": {
      "score": number (0-100),
      "trend": "improving" | "stable" | "declining",
      "key_indicators": ["organic_growth_rate", "nps_proxy", "retention_cohort_age"]
    }
  },
  "component_weights": {
    "activation": number (0-1),
    "retention": number (0-1),
    "revenue": number (0-1),
    "product_quality": number (0-1),
    "financial_sustainability": number (0-1),
    "market_fit": number (0-1)
  },
  "formulas": {
    "overall_score_formula": "weighted_sum(components, weights)",
    "activation_score_formula": "min(100, (new_signups / target_signups) * 100)",
    "retention_score_formula": "min(100, (day_7_retention_current / day_7_retention_target) * 100)"
  },
  "risk_factors": [
    {
      "risk_name": "string",
      "severity": "critical" | "high" | "medium" | "low",
      "description": "string",
      "remediation": "string"
    }
  ],
  "opportunity_factors": [
    {
      "opportunity_name": "string",
      "potential_impact": "string",
      "effort_required": "low" | "medium" | "high"
    }
  ],
  "milestone_tracking": [
    {
      "milestone_name": "string",
      "target_date": "ISO 8601",
      "progress_percent": number,
      "status": "on_track" | "at_risk" | "off_track"
    }
  ],
  "escalation_required": boolean,
  "escalation_reason": "string" (if escalation required),
  "generated_at": "ISO 8601"
}
```

### 3.4 Alert

Real-time notifications when metrics breach thresholds.

```json
{
  "alert_id": "string (UUID)",
  "venture_id": "string",
  "metric": "string",
  "threshold_type": "critical" | "warning",
  "current_value": number,
  "threshold_value": number,
  "deviation_percent": number,
  "alert_level": "info" | "warning" | "critical",
  "interpretation": "string",
  "action_required": boolean,
  "suggested_actions": ["string"],
  "triggered_at": "ISO 8601",
  "acknowledged": boolean,
  "acknowledged_by": "string (user_id)" (if acknowledged),
  "acknowledged_at": "ISO 8601" (if acknowledged)
}
```

### 3.5 ProposedAdjustment

Specific recommendations for improving venture performance.

```json
{
  "adjustment_id": "string (UUID)",
  "venture_id": "string",
  "generated_date": "ISO 8601",
  "adjustment_category": "activation" | "retention" | "revenue" | "product" | "burn" | "positioning",
  "adjustment_name": "string",
  "description": "string",
  "rationale": "string",
  "root_cause": "string",
  "metrics_targeted": ["string"],
  "estimated_impact": {
    "primary_metric": "string",
    "primary_metric_current": number,
    "primary_metric_projected": number,
    "impact_value": number,
    "impact_percent": number,
    "impact_confidence": "low" | "medium" | "high",
    "secondary_impacts": [
      {
        "metric": "string",
        "projected_change": number
      }
    ],
    "timeline_to_impact_weeks": number
  },
  "implementation": {
    "required_effort": "low_days" | "medium_weeks" | "high_months",
    "required_skills": ["string"],
    "dependencies": ["string"],
    "implementation_steps": ["string"],
    "success_criteria": ["string"],
    "monitoring_plan": "string"
  },
  "risk_assessment": {
    "risk_level": "low" | "medium" | "high",
    "primary_risks": ["string"],
    "mitigation_strategies": ["string"],
    "potential_side_effects": ["string"]
  },
  "priority": {
    "priority_rank": number,
    "priority_justification": "string",
    "urgency": "immediate" | "high" | "medium" | "low"
  },
  "financial_impact": {
    "cost_to_implement": number,
    "expected_revenue_impact": number,
    "expected_cost_impact": number,
    "roi": number
  },
  "decision_status": "proposed" | "approved" | "in_progress" | "completed" | "rejected",
  "decision_made_by": "string (user_id)" (if decided),
  "decision_made_at": "ISO 8601" (if decided),
  "actual_impact_measured": boolean,
  "actual_impact": "object" (if measured)
}
```

## 4. Status Flows

### 4.1 VentureOperation Status Flow

```
active ──→ paused ──→ active
  │
  └──────→ ended
```

### 4.2 HealthReport Status Flow

```
generated ──→ reviewed ──→ shared_with_governance
```

### 4.3 ProposedAdjustment Status Flow

```
proposed ──→ approved ──→ in_progress ──→ completed
             │
             └──────────→ rejected
```

### 4.4 Alert Status Flow

```
triggered ──→ acknowledged ──→ resolved
```

## 5. Input/Output Contracts

### 5.1 Weekly Report Input

StartupOps accepts weekly metric data from all configured sources.

```json
{
  "venture_id": "string",
  "metric_data_week_of": "ISO 8601",
  "activation_metrics": {
    "new_signups": number,
    "activation_rate": number,
    "source_breakdown": "object"
  },
  "retention_metrics": {
    "mau": number,
    "day_1_retention": number,
    "day_7_retention": number,
    "day_30_retention": number,
    "churn_rate": number,
    "cohort_data": "array"
  },
  "revenue_metrics": {
    "mrr": number,
    "arpu": number,
    "ltv": number,
    "cac": number,
    "conversion_rate": number
  },
  "product_metrics": {
    "error_rate": number,
    "crash_rate": number,
    "load_time_ms": number,
    "uptime_percent": number
  },
  "financial_metrics": {
    "cash_balance": number,
    "burn_rate": number,
    "runway_weeks": number,
    "operating_expenses": "object"
  }
}
```

### 5.2 OpsReport Output

JSON-serialized operational report.

```json
{
  "venture_id": "string",
  "report_date": "ISO 8601",
  "period": "week_of_YYYY_MM_DD",
  "overall_health_score": number,
  "vital_signals": "object",
  "anomalies": "array",
  "proposed_adjustments": "array",
  "escalations": "array",
  "next_week_focus": ["string"],
  "generated_at": "ISO 8601"
}
```

## 6. Suggested API Endpoints

### Projects / Ventures

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/ventures`                   | POST   | Register a venture for StartupOps monitoring |
| `/ventures/:venture_id`       | GET    | Retrieve venture configuration        |
| `/ventures/:venture_id`       | PUT    | Update venture context or thresholds  |

### Metrics & Data

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/ventures/:venture_id/metrics/ingest` | POST   | Ingest raw operational metrics |
| `/ventures/:venture_id/metrics/latest` | GET    | Get latest metric snapshot     |
| `/ventures/:venture_id/metrics/history` | GET    | Get metric history (time range) |

### Health Scoring

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/ventures/:venture_id/health` | GET    | Get current venture health score |
| `/ventures/:venture_id/health/history` | GET    | Get health score trends        |

### Reports & Analysis

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/ventures/:venture_id/ops-report` | GET    | Get latest weekly ops report  |
| `/ventures/:venture_id/ops-report/archive` | GET    | Get historical ops reports    |
| `/ventures/:venture_id/anomalies` | GET    | Get detected anomalies         |
| `/ventures/:venture_id/anomalies/:anomaly_id/acknowledge` | POST   | Acknowledge an anomaly |

### Recommendations

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/ventures/:venture_id/adjustments` | GET    | Get proposed adjustments       |
| `/ventures/:venture_id/adjustments/:adjustment_id/approve` | POST   | Approve adjustment   |
| `/ventures/:venture_id/adjustments/:adjustment_id/complete` | POST   | Mark adjustment complete |
| `/ventures/:venture_id/adjustments/:adjustment_id/measure-impact` | POST   | Record actual impact |

### Alerts

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/ventures/:venture_id/alerts` | GET    | Get active alerts               |
| `/ventures/:venture_id/alerts/:alert_id/acknowledge` | POST   | Acknowledge alert     |

### Governance Integration

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/governance/health-summary` | GET    | Get health summary for all ventures |
| `/governance/escalations` | GET    | Get ventures requiring governance decision |

## 7. Technology Stack

### Orchestration & Persistence

| Component               | Technology                                        |
| ----------------------- | ------------------------------------------------- |
| **Backend**             | Node.js / NestJS                                  |
| **Primary Database**    | MongoDB (Mongoose) for ventures, snapshots, reports |
| **Time-Series Database** | InfluxDB or TimescaleDB for metric history and trending |
| **Cache Layer**         | Redis for real-time alerts and temporary state   |
| **Job Queue**           | Bull / BullMQ (Redis-backed) for async analysis jobs |
| **Storage**             | S3-compatible object storage for reports and exports |

### AI Services

| Service                        | Role                                              |
| ------------------------------ | ------------------------------------------------- |
| **OpenAI API (Reasoning)**     | Anomaly interpretation, adjustment generation, escalation logic |
| **OpenAI Structured Outputs**  | Enforce JSON schemas on all LLM outputs          |

### Analytics & Monitoring

| Service                        | Role                                              |
| ------------------------------ | ------------------------------------------------- |
| **Data Integration Layer**     | Connectors to product analytics (Segment, Amplitude, Mixpanel), finance (Stripe, custom), GTM systems |
| **Statistical Analysis**       | Libraries for cohort analysis, regression, trend detection, anomaly scoring |
| **Alerting**                   | Real-time threshold monitoring and notifications |
| **Audit & Compliance**         | Immutable logs of all analyses and recommendations |

## 8. Non-Functional Requirements

### 8.1 Real-Time Monitoring

- **Metric ingestion latency**: Data should be ingested within 2–4 hours of generation.
- **Alert latency**: Critical threshold breaches should trigger alerts within 30 minutes.
- **Analysis frequency**: Weekly OpsReport generated every Monday at 9:00 AM UTC.
- **Health score update**: Health scores updated daily, with weekly rollup.

### 8.2 Time-Series Data

- **Metric retention**: Store minimum 2 years of daily snapshots; 5 years of weekly aggregates.
- **Cohort retention**: Maintain cohort-level data indefinitely for LTV/churn analysis.
- **Trend analysis**: Support moving averages (7-day, 30-day), exponential smoothing, linear regression.
- **Seasonality detection**: Identify and normalize for day-of-week, week-of-month patterns.

### 8.3 Alerting & Escalation

- **Multi-level thresholds**: Support green (normal), yellow (warning), red (critical) zones.
- **Smart escalation**: Avoid alert fatigue; consolidate related alerts.
- **Context in alerts**: Include historical context, trend direction, and suggested remediation.
- **Acknowledgment tracking**: Track which alerts have been reviewed by whom.

### 8.4 Data Quality

- **Gap handling**: Explicitly flag missing data; do not attempt imputation without warning.
- **Anomaly handling**: Detect obvious data errors (negative values, impossible jumps) and flag.
- **Reconciliation**: Support manual override for corrected data (e.g., "actual churn was X, not Y").

### 8.5 Audit & Transparency

- **Traceable calculations**: Every health score and recommendation must be traceable to inputs and formula.
- **Version history**: Store all versions of metrics, reports, recommendations; support comparison.
- **Change tracking**: Record who approved which adjustment, when, and why.
- **Explainability**: All analytical decisions must be explainable in human-readable terms.

## 9. Integration Points

### Upstream Integration

| Source                  | Data Expected                                                     | Integration Method |
| ----------------------- | ----------------------------------------------------------------- | ------------------- |
| **Product Analytics**   | DAU, MAU, activation funnel, retention, feature usage, errors     | Segment/Amplitude API, native SDK, webhook |
| **GTM System**          | CAC by channel, conversion funnel, campaign performance           | API integration or data feed |
| **Finance System**      | MRR, revenue, expenses, cash balance, burn rate                   | Stripe/Zuora API or file import |
| **Venture Context**     | Thesis, hypotheses, milestones, constraints                       | Manual input at launch + API updates |

### Downstream Integration

| Consumer                | Data Delivered                                                    | Integration Method |
| ----------------------- | ----------------------------------------------------------------- | ------------------- |
| **Portfolio/Governance** | Health scores, escalations, recommendations, milestone tracking   | API, weekly report delivery |
| **Product Squad**       | Product quality alerts, adjustment recommendations                | Slack/email, dashboard, API |
| **GTM Squad**           | Channel performance, CAC analysis, adjustment recommendations     | API, dashboard, weekly report |

## 10. Success Criterion

StartupOps is technically successful when:

1. **Data ingestion is automated** — metrics flow from sources to analysis without manual intervention.

2. **Analysis is deterministic** — given the same inputs, health scores and recommendations are consistent and auditable.

3. **Latency is acceptable** — analysis completes within 24 hours of metric availability.

4. **Accuracy is validated** — recommendations that are implemented and measured show statistically significant impact improvement.

5. **Transparency is complete** — every calculation can be explained; every recommendation is traceable to data and reasoning.

6. **Integration is seamless** — data from multiple sources is normalized and reconciled without manual work.

7. **Scalability is sufficient** — system can handle 50+ concurrent ventures with sub-second query latency.

8. **Reliability is high** — 99.9% uptime; no lost data; graceful degradation if sources are temporarily unavailable.

9. **Security is maintained** — venture data is isolated; API access is authenticated and scoped; audit logs are immutable.

10. **Cost is efficient** — operational cost per venture per month is acceptable for standalone SaaS economics.
