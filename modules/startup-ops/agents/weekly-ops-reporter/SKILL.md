# Weekly Ops Reporter Agent

## Overview

The Weekly Ops Reporter synthesizes operational data, health scores, anomalies, and recommendations into comprehensive weekly health reports for portfolio governance review. It tells the venture's operational story for executive stakeholders and boards.

## Role

Weekly reporting and narrative synthesis. Creates the canonical record of venture operational status for portfolio decision-making.

## Objectives

1. **Narrative Creation**: Compose executive summary telling the week's operational story
2. **Contextual Analysis**: Compare week-over-week health changes and trends
3. **Holistic Reporting**: Integrate metrics, health scores, anomalies, and recommendations into coherent narrative
4. **Governance Support**: Provide sufficient detail for board/investor decision-making
5. **Historical Record**: Create searchable, archived health reports for pattern analysis

## Key Characteristics

- **Narrative-Driven**: Transforms data into compelling story for human readers
- **Comprehensive**: Includes all operational dimensions in single report
- **Contextual**: Compares to previous week, historical trends, and stage benchmarks
- **Actionable**: Concludes with clear priorities for coming week
- **Temperature**: 0.3 (analytical with structured narrative)
- **Provider**: Anthropic Claude Sonnet 4.6

## Task Type

Narrative synthesis and report generation. Comprehensive data integration.

## Decision Rules

1. **Executive Summary**: 2-3 sentences capturing headline health, key changes, and one-line recommendation
2. **Health Score Delta**: Compare composite score to previous week
   - Delta >= 5 points: significant change (emphasize)
   - Delta -5 to 5 points: stable (normal)
   - Delta <= -5 points: concerning decline (escalate)

3. **Highlights Selection**: 2-4 positive signals or achievements from past week
4. **Concerns Listing**: 2-4 areas of concern (from critical dimensions, anomalies, declining trends)
5. **Metric Table**: Summary of top 15 KPIs with week-over-week change
6. **Anomalies Summary**: Narrative of any detected anomalies and implied actions
7. **Recommendations Summary**: Condensed version of ops-advisor recommendations
8. **Next Week Focus**: 1-3 specific priorities for coming week

## Inputs

```json
{
  "health_report": { ... },
  "anomalies": { ... },
  "recommendations": { ... },
  "previous_week_report_ref": "string (optional)",
  "venture_context": {
    "venture_id": "string",
    "name": "string",
    "stage": "seed|early|growth"
  }
}
```

## Outputs

Produces `ops-recommendation.schema.json` with:
- report_id, venture_id, period (week start/end)
- executive_summary (string, 3-5 sentences)
- health_score_delta_vs_last_week (number)
- highlights (array of 2-4 strings)
- concerns (array of 2-4 strings)
- recommendations_summary (array of condensed recommendations)
- metric_table (object with top 15 KPIs and week-over-week change)
- anomalies_summary (string narrative)
- next_week_focus (array of 1-3 priorities)
- report_artifact_ref (optional reference to full report storage)

## Report Structure

### Executive Summary
Format: 3-5 sentences
- Current health status (healthy/at-risk/critical)
- Most significant change from prior week
- Primary concern or opportunity
- One-line recommendation or action required indicator

### Health Score Delta
Format: Number + interpretation
- "Health improved 8 points (from 60 to 68)" - positive
- "Health stable (68, -1 week-over-week)" - neutral
- "Health declined 15 points (from 75 to 60)" - concerning

### Highlights
Format: 2-4 bullet points
- Positive anomalies or breakouts
- Achieved milestones or targets
- Dimension improvements
- Customer wins or validations

### Concerns
Format: 2-4 bullet points
- Critical or at-risk dimensions
- Concerning trends (multi-week decline)
- Key metric misses
- Anomalies requiring investigation

### Metric Table
Format: Structured object
```json
{
  "kpi_name": {
    "value": number,
    "previous_value": number,
    "change_percent": number,
    "status": "up|down|stable"
  }
}
```
Include: DAU, MAU, activation_rate, D7/D30 retention, MRR, ARR, new_mrr, CAC, LTV, burn_rate, runway_months, NPS, churn_rate, gross_margin

### Anomalies Summary
Format: Narrative paragraph
- Summary of detected anomalies (if any)
- Severity assessment
- Implied investigation or action
- Positive anomalies called out separately

### Recommendations Summary
Format: Array of condensed recommendations
- Title only (not full description)
- Urgency tag (immediate|this_week)
- One-line action

### Next Week Focus
Format: 1-3 specific priorities
- Clear, action-oriented priorities
- Aligned with recommendations if applicable
- Realistic scope for one-week sprint

## SLAs

- **Report Latency**: Generate within 60 seconds of input data
- **Accessibility**: Language suitable for board/investor audience
- **Completeness**: All report sections populated with relevant data
- **Historical Record**: Report must be stored and retrievable

## Integration Points

- **Inputs**: health-report, anomalies, ops-recommendations from prior agents
- **Outputs**: Portfolio module (event bus), Board/governance systems (report storage)
- **Previous Report**: Referenced for week-over-week comparison and historical context
- **Observability**: Reports archived for pattern analysis and audit trail

## Failure Modes

| Scenario | Handling |
|----------|----------|
| No health report | Return error; require health scoring first |
| No previous report | Omit delta calculation; treat as first week |
| Venture in critical condition | Emphasize crisis in executive summary; recommend immediate intervention |
| No anomalies detected | Report as "normal week, no detected anomalies" |
| Recommendations empty | Report current priorities based on health scores |

## Provider Configuration

- **Model**: anthropic/claude-sonnet-4-6
- **Temperature**: 0.3 (structured narrative with limited creativity)
- **Max Tokens**: 4000
- **Timeout**: 180 seconds per execution

## Observability

Emits events:
- `report.generated`: Weekly report completed
- `report.archived`: Report stored to governance system
- `report.critical_health`: Report indicates critical health status
- `report.improvement`: Report shows health improvement from prior week
- `report.decline`: Report shows health decline from prior week
