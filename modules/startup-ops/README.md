# StartupOps Module

The StartupOps module provides continuous operational health monitoring for launched ventures within the BruceAI multi-agent system. It ingests product analytics, financial data, and go-to-market metrics to produce health scores, detect anomalies, and trigger escalations to portfolio leadership.

## Overview

StartupOps operates as a comprehensive operational intelligence system that:

- **Monitors** venture health across 6 dimensions (activation, retention, revenue, product quality, financial sustainability, market fit)
- **Detects** statistically significant anomalies and concerning trends in real-time
- **Scores** operational health with stage-appropriate rubrics
- **Recommends** prioritized actions to portfolio leadership
- **Reports** weekly operational narratives for governance reviews

## Architecture

StartupOps consists of five specialized agents orchestrated through four primary workflows:

### Agents

1. **metrics-ingestion-agent**: Collects and normalizes metrics from multiple data sources (Mixpanel/Amplitude for product analytics, Stripe for revenue, GTM module for channel data). Maintains metric history and flags significant deviations.

2. **health-scoring-agent**: Computes health scores across 6 dimensions with stage-appropriate rubrics. Produces composite health score and flags at-risk/critical dimensions.

3. **anomaly-detector**: Detects statistically significant anomalies using 2-sigma threshold against 4-week rolling average. Identifies sudden drops, concerning trends, positive breakouts, and sustained declines.

4. **ops-advisor**: Translates health scores and anomalies into 3-5 prioritized, actionable recommendations ordered by urgency and expected impact.

5. **weekly-ops-reporter**: Composes comprehensive weekly operational health reports for portfolio governance review with executive summary, highlights, concerns, and metric tables.

### Workflows

1. **real-time-monitoring** (every 6 hours): Continuous metric collection and anomaly detection with critical anomaly escalation
2. **weekly-health-check** (every Monday 08:00): Full health scoring, trend analysis, recommendations, and reporting
3. **anomaly-escalation** (triggered): Immediate ops advice and portfolio notification for critical anomalies
4. **metric-snapshot** (on-demand): Standalone metric collection for ad-hoc analysis

## Data Contracts

All agents communicate through standardized JSON schemas:

- `metric-snapshot.schema.json`: Normalized metric snapshots with completeness tracking
- `health-report.schema.json`: Dimensional health scores with trend indicators
- `anomaly.schema.json`: Detected anomalies with severity and recommendation
- `ops-recommendation.schema.json`: Actionable recommendations with urgency and expected impact

## Scheduling

- **Real-time monitoring**: Every 6 hours for active ventures, daily for paused ventures
- **Weekly health check**: Every Monday at 08:00 UTC
- **Anomaly escalation**: On-demand triggered by critical anomalies
- **Metric snapshot**: On-demand

## Configuration

### Required Environment Variables

- `MIXPANEL_API_URL`: Mixpanel API endpoint
- `MIXPANEL_SECRET`: Mixpanel authentication
- `STRIPE_API_URL`: Stripe API endpoint
- `STRIPE_SECRET_KEY`: Stripe authentication
- `AMPLITUDE_API_URL`: Amplitude API endpoint
- `AMPLITUDE_API_KEY`: Amplitude authentication

### Fallback Behavior

When data sources are unavailable:
- Mark metric dimensions as partial (do not fail entire ingestion)
- Continue health scoring if >= 2 sources available
- Flag revenue dimension as "insufficient data" if Stripe unavailable
- Log all unavailability events for observability

## Policies

- **monitoring-policy.md**: Ingestion frequency, required metrics, freshness SLA, source unavailability handling
- **health-scoring-policy.md**: Scoring rubrics per dimension, stage-dependent weights, alert thresholds
- **escalation-policy.md**: Auto-escalation criteria, human response SLA, notification channels

## Evaluations

Three scenario-based evaluations validate module behavior:

1. **happy-path**: Normal operations with no critical anomalies
2. **critical-anomaly-escalation**: High-severity event detection and escalation
3. **data-source-unavailable**: Graceful degradation when data sources fail

## Integration Points

- **GTM Module**: Receives channel-level acquisition metrics
- **Portfolio Module**: Sends health reports, anomalies, recommendations via event bus
- **Analytics APIs**: Mixpanel, Amplitude for product metrics
- **Payment APIs**: Stripe for revenue metrics

## Health Scoring Dimensions

- **Activation (0-100)**: Based on activation rate and onboarding completion
- **Retention (0-100)**: Based on D7/D30 retention and churn rate
- **Revenue (0-100)**: Based on MRR growth, ARR trajectory, new vs churned MRR ratio
- **Product Quality (0-100)**: Based on bug reports, NPS, feature adoption
- **Financial Sustainability (0-100)**: Based on runway, burn rate trend, unit economics
- **Market Fit (0-100)**: Based on NPS, organic growth rate, activation trend

## Composite Score Formula

Weighted average of all 6 dimensions with stage-dependent weights:
- Early/Seed stage: Activation (25%), Retention (25%), Product Quality (20%), Financial (20%), Market Fit (10%)
- Growth stage: Revenue (25%), Retention (20%), Financial Sustainability (20%), Market Fit (20%), Activation (10%), Product Quality (5%)

## Alert Thresholds

- **Composite score < 30**: Critical alert
- **Composite score < 50**: Warning alert
- **Any dimension < 20**: Critical dimension alert
- **Any dimension < 40**: At-risk dimension alert
- **Anomaly deviation > 2 standard deviations**: Anomaly detected
- **3 consecutive weeks of decline**: Trend alert
- **Week-over-week growth > 40%**: Positive breakout alert

## Escalation Triggers

Auto-escalate to portfolio if:
- Any critical anomaly (severity: critical)
- Composite health score drops > 20 points in one week
- Runway < 3 months
- MRR drops > 30% week-over-week

## SLAs

- Metric freshness: Data must be < 12 hours old for health scoring
- Human response to escalation: 24 hours
- Real-time monitoring latency: < 5 minutes from data availability to anomaly detection

## Directory Structure

```
startup-ops/
├── README.md
├── agents/
│   ├── metrics-ingestion-agent/
│   │   ├── SKILL.md
│   │   ├── input.schema.json
│   │   ├── output.schema.json
│   │   ├── capabilities.json
│   │   ├── tools.json
│   │   ├── constraints.md
│   │   └── examples/
│   │       ├── valid-input.json
│   │       └── expected-output.json
│   ├── health-scoring-agent/
│   ├── anomaly-detector/
│   ├── ops-advisor/
│   └── weekly-ops-reporter/
├── workflows/
│   ├── real-time-monitoring.workflow.json
│   ├── weekly-health-check.workflow.json
│   ├── anomaly-escalation.workflow.json
│   └── metric-snapshot.workflow.json
├── contracts/
│   ├── metric-snapshot.schema.json
│   ├── health-report.schema.json
│   ├── anomaly.schema.json
│   └── ops-recommendation.schema.json
├── state/
│   ├── module-state.schema.json
│   └── execution-state.schema.json
├── policies/
│   ├── monitoring-policy.md
│   ├── health-scoring-policy.md
│   └── escalation-policy.md
├── evaluations/
│   ├── happy-path.md
│   ├── critical-anomaly-escalation.md
│   ├── data-source-unavailable.md
│   └── fixtures/
│       ├── metric-snapshot-input.json
│       └── expected-health-report.json
└── observability/
    ├── events.md
    ├── metrics.md
    └── correlation-ids.md
```

## Getting Started

1. Configure environment variables for data source credentials
2. Deploy agents to compute environment (supports OpenAI GPT-4o, Anthropic Claude models)
3. Enable workflows via orchestration layer
4. Monitor events on portfolio event bus for anomalies and recommendations

## Support

For issues or questions about StartupOps module operation, refer to the specific agent SKILLs and policy documents. All data contracts are defined in `contracts/` directory.
