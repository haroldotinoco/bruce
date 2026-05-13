# GTM Module Events

## Event Catalog

All events follow naming: `gtm.[scope].[action]`

### Strategy Phase Events

**gtm.strategy.completed** - Strategy definition finalized
- When: After channel selection and content system creation complete
- Payload: strategy_id, selected_channels, budget_allocation, success_metrics

**gtm.channels.selected** - Channels selected for primary use
- When: Channel-strategist completes selection
- Payload: selected_channels (max 4), ranking, budget per channel

**gtm.content.system.created** - Content system defined
- When: Content-system-agent completes messaging matrix and calendar
- Payload: content_themes, messaging_variants, content_calendar

### Campaign Phase Events

**gtm.campaign.launched** - Campaign goes live on platform
- When: Campaign manager activates campaign
- Payload: campaign_id, channel, creative_id, budget, targeting, start_date

**gtm.campaign.paused** - Campaign paused (not killed)
- When: Manual pause decision or performance threshold triggered
- Payload: campaign_id, reason, pause_duration_expected

**gtm.campaign.monitoring.active** - Analytics tracking configured
- When: Campaign launched with tracking enabled
- Payload: campaign_id, kpis, tracking_ids

### Performance & Analytics Events

**gtm.analytics.ingested** - Weekly analytics data fetched
- When: Weekly review workflow ingests data from all channels
- Payload: report_period, channels_updated, data_freshness

**gtm.analysis.interpreted** - Performance analysis completed
- When: Analytics-agent analyzes trends
- Payload: top_channel, worst_channel, cac_trends, volume_trends

### Budget & Rebalancing Events

**gtm.budget.reallocated** - Budget moved between channels
- When: Rebalancing triggered by CAC threshold or manual review
- Payload: reallocations (channel, old_budget, new_budget), rationale

**gtm.channel.cac_threshold_exceeded** - CAC violates target
- When: Channel CAC > 1.5x target
- Payload: channel, current_cac, target_cac, days_sustained

**gtm.channel.killed** - Channel paused/killed due to performance
- When: Kill threshold met (CAC > 2x for 4+ weeks)
- Payload: channel, cac, volume, rationale, budget_reallocation

### Governance & Reporting Events

**gtm.governance.decision.made** - Weekly governance decision rendered
- When: Weekly-governance-agent completes decision
- Payload: decisions (by channel: continue/scale/pause/kill), budget_changes

**gtm.weekly-report.generated** - Weekly performance report ready
- When: Report generation complete
- Payload: report_id, period, summary_metrics, key_findings

**gtm.report.forwarded** - Report sent to Startup Ops
- When: Handoff to Startup Ops module
- Payload: report_id, recommendations, implementation_timeline

### Experiment Events

**gtm.experiment.started** - New channel or test experiment launched
- When: New channel test phase begins
- Payload: experiment_id, channel, budget, success_criteria, end_date

**gtm.experiment.completed** - Test phase ends with decision
- When: Experiment reaches decision date
- Payload: experiment_id, channel, results (cac, volume, roi), decision (promote/maintain/kill)

---

## Event Severity

- **INFO:** Standard operational event
- **WARN:** Threshold approached or underperforming channel flagged
- **ERROR:** System issue or failed operation
- **CRITICAL:** CAC crisis or major system failure

---

## Correlation IDs

- **venture_id:** Identifies which venture GTM applies to
- **campaign_id:** Unique campaign identifier
- **experiment_id:** Unique experiment identifier
- **report_cycle_id:** Weekly review cycle identifier (e.g., "gtm-report-2024-04-01")
