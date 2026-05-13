# GTM Module Correlation IDs

## ID Structure

### venture_id
**Format:** `venture-YYYY-MM-SEQUENCE` (inherited from AddVenture module)
**Scope:** Unique venture identifier, persistent across all GTM activities
**Usage:** Links all campaigns, experiments, reports to source venture

### campaign_id
**Format:** `campaign-VENTURE-CHANNEL-DATE-SEQUENCE`
**Example:** `campaign-venture-2024-001-paid-social-2024-04-01-001`
**Scope:** Unique campaign identifier within venture
**Lifetime:** Persistent from creation through completion/kill

### experiment_id
**Format:** `experiment-VENTURE-DATE-SEQUENCE`
**Example:** `experiment-venture-2024-001-2024-04-01-001`
**Scope:** Unique experiment identifier for A/B tests or channel pilots
**Lifetime:** From test start to completion decision

### report_cycle_id
**Format:** `gtm-report-YYYY-MM-DD` (week ending date)
**Example:** `gtm-report-2024-04-05`
**Scope:** Weekly performance review cycle
**Lifetime:** One week (Monday-Sunday)

## Propagation Rules

**Rule 1:** venture_id propagates to all campaigns, experiments, reports

**Rule 2:** campaign_id included in all events related to that campaign

**Rule 3:** experiment_id included in all experiment-related events

**Rule 4:** report_cycle_id included in weekly review events

**Rule 5:** All downstream modules (Startup Ops, Portfolio) receive venture_id for traceability

## Querying by ID

**By venture_id:** Understand all GTM activities for a specific venture
**By campaign_id:** Analyze specific campaign performance
**By experiment_id:** Review specific test results
**By report_cycle_id:** Access weekly governance reports and decisions
