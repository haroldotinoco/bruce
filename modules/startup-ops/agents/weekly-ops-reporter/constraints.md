# Weekly Ops Reporter Constraints

## Hard Constraints

### 1. Report Completeness

All sections must be populated with relevant data:
- executive_summary: 3-5 sentences (required)
- highlights: 2-4 items (required)
- concerns: 0-4 items (required, may be empty)
- metric_table: minimum 10 KPIs (required)
- anomalies_summary: narrative if anomalies exist (required if anomalies present)
- recommendations_summary: condensed recommendations (required if recommendations exist)
- next_week_focus: 1-3 priorities (required)

Missing sections result in incomplete report and execution failure.

### 2. Executive Summary Quality

Executive summary must:
- Be 3-5 sentences (200-1000 characters)
- Start with health status assessment (healthy/at-risk/critical)
- Include most significant change from prior week
- Identify primary concern or opportunity
- Be written in clear, non-technical language suitable for board audience
- End with action indicator or recommendation

No technical jargon; assume audience has high-level business context only.

### 3. Health Score Delta Calculation

If previous report available:
- Calculate delta = current_score - previous_score
- Interpretation rules:
  - Delta >= 5: "health improved X points" (positive framing)
  - -5 <= delta < 5: "health stable" (neutral)
  - Delta < -5: "health declined X points" (concerning framing)

If previous report unavailable:
- Set delta to null
- Note "first report" context in summary

Delta calculation must be mathematically accurate (± 0.5 points tolerance).

### 4. Highlights and Concerns Balance

Highlights: 2-4 positive items
- Positive anomalies (e.g., "MRR grew 13% above baseline")
- Dimension improvements (e.g., "Activation rate improved to 71%")
- Achieved targets (e.g., "Reached 8k MAU milestone")
- Customer wins (e.g., "Signed 2 enterprise customers")

Concerns: 0-4 items (may be empty if all healthy)
- Critical/at-risk dimensions
- Concerning trends (3+ week declines)
- Missed targets
- Anomalies requiring investigation

Balance tone: Honest assessment without doom-saying. Even healthy ventures should have 1-2 items for continuous improvement focus.

### 5. Metric Table Requirements

Minimum 10 KPIs; recommended 15:

**Always Include**:
- DAU, WAU, MAU
- activation_rate, d7_retention, d30_retention
- MRR, ARR, churn_rate
- burn_rate, runway_months

**If Available**:
- new_signups, new_customers, CAC, LTV, NPS
- new_mrr, churned_mrr, mrr_growth_rate
- gross_margin, ltv_cac_ratio

Format: Object with metric_name as key and {value, previous_value, change_percent, status} as value.

All numeric values must match source (metrics, health report, anomalies) exactly.

### 6. Anomalies Summary Narrative

If anomalies detected:
- Provide 1-2 sentence narrative per anomaly group
- Note severity and implications
- Suggest investigation direction or action
- Format: "MRR grew 13% above baseline (positive) - investigate channels driving growth and consider scaling successful acquisition sources"

If no anomalies:
- State "Normal week with no significant metric anomalies detected"

Narrative must be actionable, not just descriptive.

### 7. Recommendations Summary

Condense each recommendation to:
- Title (original title, not paraphrased)
- Urgency (immediate|this_week|next_cycle)
- One-line action (distilled to most essential action item)

Example:
```json
{
  "title": "Capitalize on positive MRR momentum with targeted expansion",
  "urgency": "this_week",
  "action": "Analyze new customer cohorts to identify high-performing acquisition channels; consider scaling by 2-3x"
}
```

Include only 2-4 most important recommendations. If more than 4, prioritize by urgency then expected impact.

### 8. Next Week Focus

Must include 1-3 specific priorities for coming week:
- Action-oriented language
- Realistic scope for one-week execution
- Aligned with recommendations if applicable
- Clear owner/responsibility implied

Example: "Focus on retention: conduct 5 churn interviews and identify top 3 drop-off points in user journey"

Not: "Improve retention" (too vague) or "Build new product feature" (unrealistic scope).

### 9. Schema Compliance

Output must conform exactly to `weekly-reporter-output.schema.json`:
- report_id must be unique per execution
- venture_id matches input
- period start/end are Mondays and Sundays
- All timestamps in ISO 8601 UTC format
- metric_table values match source exactly
- All string fields trimmed of whitespace
- No null required fields

### 10. Execution Timeout

Report must generate within 180 seconds:
- Data ingestion: < 20 seconds
- Previous report lookup: < 15 seconds
- Narrative composition: < 60 seconds
- Metric table assembly: < 30 seconds
- Output validation: < 20 seconds
- Serialization: < 10 seconds

If approaching timeout, return best effort with available sections.

## Soft Constraints

### 1. Narrative Tone

Maintain professional but accessible tone:
- Clear, direct language (avoid jargon)
- Honest assessment (positive and concerns)
- Forward-looking (implications and actions)
- Founder-friendly (suitable for board/investor)

Example: "Activation improved to 71%, a strong signal that our onboarding changes are working. However, we're still seeing some churn in week 2; need to investigate why users aren't returning after initial engagement."

Not: "The activation_rate increased by 2.4 percentage points versus the prior period, suggesting improved user conversion efficacy metrics."

### 2. Data Accuracy

All numeric data must match source exactly:
- Metric values from metric_snapshot
- Health scores from health_report
- Anomaly counts from anomalies output
- Recommendation count from ops-advisor output

Double-check calculations before embedding in narrative (percentages, deltas, etc.).

### 3. Contextualization

Contextualize metrics to venture stage:
- Seed: Focus on activation, retention, hypothesis validation
- Early: Balanced focus across all dimensions
- Growth: Emphasize revenue, efficiency, unit economics

Seed venture with $50k MRR isn't necessarily alarming; early stage with negative MRR growth is concerning.

### 4. Previous Report Comparison

If previous report available:
- Compare health scores for trend
- Note which dimensions improved/declined
- Call out reversal of prior week's concerns
- Validate that recommendations from last week are being acted upon

This creates accountability and narrative continuity.

### 5. Kill Criteria Evaluation

If venture approaching or triggering kill criteria:
- Flag prominently in concerns
- Note in executive summary
- Include governance-level decision recommendations
- Recommend urgent leadership review

Example: "Runway has declined to 8 months despite flat MRR growth. At current burn rate, we'll hit our 6-month kill criterion in 2 months. Urgent action required to increase revenue or reduce burn."

### 6. Celebration and Motivation

For healthy ventures or positive weeks:
- Explicitly celebrate wins and milestones
- Acknowledge team effort
- Highlight momentum and validation
- Project positive trajectory

Founder/team morale matters. "Week 6 after launch: exceeded MAU target at 12.4k, retention holding steady at 52%, and successfully closed first enterprise customer. Strong product-market validation emerging."

### 7. Recommendations Alignment

Ensure next_week_focus aligns with recommendations:
- Don't recommend actions in weekly report that weren't in ops-advisor output
- Use recommendations as foundation for next week focus
- Add tactical implementation details ("conduct 5 exit interviews" vs just "investigate churn")

This creates continuity between strategic recommendations and tactical execution.

## Quality Checks Before Output

Before returning report, verify:
- [ ] Executive summary is 3-5 sentences, board-appropriate
- [ ] Highlights include 2-4 items (positive or achieved)
- [ ] Concerns include 0-4 items (identified risks or gaps)
- [ ] Metric table includes minimum 10 KPIs with WoW change
- [ ] Health score delta accurately calculated or marked null
- [ ] Anomalies narrative addresses all detected anomalies
- [ ] Recommendations summary includes 2-4 most important items
- [ ] Next week focus includes 1-3 specific priorities
- [ ] All numeric values match source data exactly
- [ ] Language is executive-level, not technical
- [ ] Period dates are Monday-Sunday
- [ ] All timestamps in UTC ISO 8601
- [ ] report_id is unique
- [ ] No spelling or grammar errors

## Error Handling

| Scenario | Response |
|----------|----------|
| No health report | Return error; require health scoring first |
| No metrics | Include metric_table with note "insufficient data" |
| No anomalies | State in anomalies_summary "normal week, no anomalies" |
| No recommendations | Note in summary and omit recommendations_summary section |
| Previous report not found | Omit delta calculation; continue with current week |
| Venture in critical condition | Flag prominently; recommend urgent escalation |

## Observability

Emit events:
- `report.generated`: Weekly report completed
- `report.archived`: Report stored to governance system
- `report.critical_health`: Health < 30
- `report.improvement`: Delta > +5
- `report.decline`: Delta < -5
- `report.stable`: -5 <= delta <= +5
- `report.milestone`: MAU/MRR/other milestone reached
