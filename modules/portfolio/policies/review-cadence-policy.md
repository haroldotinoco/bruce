# Portfolio Review Cadence Policy

## Overview

This policy defines the timing and triggers for portfolio review cycles, ensuring ventures are evaluated at appropriate intervals, emergency reviews are triggered when needed, and decisions are made with sufficient SLA to allow execution.

---

## Standard Review Cadence

### Primary: Bi-Weekly Full Review Cycle
- **Frequency**: Every 2 weeks (14 days)
- **Schedule**: Every other Sunday at 00:00 UTC (timezone-agnostic trigger)
- **Scope**: All active ventures in portfolio
- **Workflows Triggered**:
  1. portfolio-snapshot-collection
  2. portfolio-analysis
  3. risk-assessment
  4. resource-allocation-planning
  5. governance-decisions
  6. human-review-gate (if needed)
  7. portfolio-report
  8. emit-decisions-to-bruce-core

### Secondary: Ad-Hoc Venture Review (On-Demand)
- **Trigger**: Requested by venture founder or portfolio lead
- **Scope**: Single venture focused
- **Workflow**: venture-decision pipeline
- **Turnaround**: Decision within 48 hours of request
- **Use Case**: Unplanned situation requiring immediate governance input

---

## Emergency Review Triggers

An **emergency review cycle** is triggered automatically when:

### 1. Critical Anomaly from startup-ops Module
- **Trigger**: Any health metric drops > 50% in one week
  - MRR drops > 50% (e.g., $10k → $5k)
  - DAU drops > 50% (e.g., 1000 → 500)
  - Runway drops to < 1 month remaining (unplanned)
  - Burn rate spikes > 30% (unplanned)

- **Detection**: Automatic via startup-ops alerts
- **Response**: Portfolio module receives alert event; emergency review triggered within 2 hours
- **SLA**: Decision within 24 hours (human confirmation if kill-level)
- **Scope**: Just the affected venture (focus analysis)

### 2. Venture Requests Immediate Review
- **Trigger**: Founder submits "urgent review request" via portfolio module
- **Criteria**: Founder certifies one of:
  - Unexpected funding opportunity or constraint
  - Key team departure or addition
  - Critical product discovery requiring strategy change
  - Regulatory/market shift impacting viability

- **Response**: Review triggered within 4 hours
- **SLA**: Initial assessment within 24 hours; full decision within 48 hours
- **Scope**: Single venture

### 3. Portfolio Concentration Risk
- **Trigger**: Any single venture exceeds 40% of total portfolio budget
- **Detection**: Automatic during budget reconciliation (weekly check)
- **Response**: Concentration risk review triggered within 1 week
- **SLA**: Reallocation decision within 2 weeks
- **Scope**: Budget reallocation focus; may prompt SCALE/PAUSE decisions

### 4. Portfolio Burn Rate Anomaly
- **Trigger**: Total portfolio monthly burn increases > 20% from planned budget (unplanned)
- **Detection**: Automatic via finance integration
- **Response**: Budget review triggered within 3 days
- **SLA**: Root cause analysis + mitigation decision within 1 week
- **Scope**: Portfolio-wide; may trigger individual venture reviews

### 5. External Market/Regulatory Event
- **Trigger**: Major market-wide or regulatory event affecting multiple ventures
  - Key market collapses (e.g., crypto crash)
  - Regulatory change blocking ventures' operations
  - Competitive acquisition shutting down market
  - Industry-wide supply chain disruption

- **Detection**: Manual escalation by portfolio lead or external news monitoring
- **Response**: Portfolio strategy review triggered within 24 hours
- **SLA**: Impact assessment within 1 week; decisions on individual ventures within 2 weeks
- **Scope**: Multiple ventures; may include mass pause/kill decisions

### 6. Human Confirmation Deadline Approaching
- **Trigger**: Any pending human confirmation approaching deadline (kill decisions > 72 hours pending)
- **Detection**: Automatic scheduler
- **Response**: Escalation to leadership; reminder notifications
- **SLA**: Decision must be made or decision revoked within 72 hours
- **Scope**: Specific venture with pending decision

---

## Review SLA & Timeline

### Standard Bi-Weekly Cycle

| Phase | Duration | SLA | Responsible |
|-------|----------|-----|---|
| **Data Collection** | Up to 24h | Snapshot ready by start of day 2 | startup-ops |
| **Analysis** | 24-36h | Analysis complete by morning day 3 | portfolio-analyst |
| **Risk Assessment** | 12h | Risk report complete by afternoon day 3 | risk-monitor |
| **Allocation Planning** | 24h | Allocation recommendations by morning day 4 | allocation-agent |
| **Governance Decisions** | 24h | Decisions ready by afternoon day 4 | governance-decision-agent |
| **Human Review Gate** | 24-48h | Confirmations required by morning day 6 | Leadership |
| **Report Generation** | 12h | Final report complete by afternoon day 6 | portfolio-reporter |
| **Execution** | 24h | Decisions emitted to bruce-core by day 7 | bruce-core |

**Total Cycle**: 6-7 days (allowing 7 days between bi-weekly triggers)

### Emergency Review Cycle (Compressed)

| Severity | SLA | Process |
|----------|-----|---------|
| **Critical** (kill-level) | 24h total | Direct to governance-decision-agent; human confirmation parallel |
| **High** (scale/pause decision) | 48h total | Skip full analysis; use latest data; decision within 24h, execution by 48h |
| **Medium** (allocation/iterate) | 72h total | Normal analysis; decision by 48h, execution by 72h |

---

## Avoiding Review Cycle Conflicts

### Concurrent Review Limits
- **Maximum concurrent reviews**: 1 portfolio-wide + up to 5 ad-hoc single-venture reviews
- **Rationale**: Prevents analysis paralysis; allocates agent resources efficiently

### Staggering
- If emergency review overlaps with scheduled bi-weekly:
  - Emergency takes priority (pauses scheduled review)
  - Scheduled review resumes after emergency decision (24-48h later)
  - Ventures unaffected by emergency are held until next scheduled cycle (< 1 week delay)

### Backlog Management
- Ad-hoc reviews requested but not yet started are queued with priority:
  1. Founder-initiated (certified urgent)
  2. Concentration risk
  3. Funding opportunity requests
  4. Other
- FIFO within each priority tier

---

## Preventing Review Fatigue

### Policy Constraints
- Single venture cannot have more than 1 review per 2-week period (except emergency)
- Emergency re-triggers of same venture only if new critical anomaly detected
- If founder requests 2nd review in same 2-week window: Escalate to portfolio lead; only grant if material new evidence

### Communication
- Founders notified 48 hours before scheduled review starts
- Expected outcomes shared: "This review will evaluate: traction, burn, unit economics, runway. Decisions will be made by [date]."
- Emergency reviews: Notification within 2 hours of trigger; decision timeline shared

---

## Review Trigger Events (Detailed)

### Startup-ops Critical Anomaly Thresholds

| Metric | Normal Range | Anomaly Threshold | Action |
|--------|--------------|------------------|--------|
| **MRR Month-over-Month** | -5% to +50% | Drop > 50% or plateau for 4+ weeks | Emergency review |
| **DAU Change** | -10% to +30% | Drop > 50% | Emergency review |
| **Burn Rate Variance** | ±10% | Increase > 30% unplanned | Budget review |
| **Runway Reduction** | Linear decline | Drop to < 1 month unplanned | Funding review |
| **Retention D30** | 20-60% | Drop > 30% points | Strategy review |
| **Team Attrition** | 0-10% | Founder departure or > 30% team turnover | Kill evaluation |

### Metrics Freshness Requirements
- Bi-weekly reviews: Data must be < 3 days old
- Emergency reviews: Can use data up to 7 days old if urgent
- No review scheduled if data > 7 days old (delay until fresh data available, max 1 week delay)

---

## Review Outcome Documentation

### Required for Every Review Cycle
1. **Review cycle ID**: Unique identifier (cycle_YYYYMMDD_HH)
2. **Ventures analyzed**: List with health scores
3. **Decisions made**: venture_id, decision, confidence, rationale
4. **Human confirmations**: venture_id, decision_type, confirmed_at, confirmed_by
5. **Pending actions**: List with owners and deadlines
6. **Metrics snapshot**: Key portfolio metrics at time of review
7. **Next review date**: Scheduled time for follow-up

### Retention
- Store all review cycles in portfolio state
- Retain for 24 months minimum (archive after)
- Searchable by venture_id, decision_type, date range

---

## Escalation & Override Policy

### Escalation Triggers
1. **Kill decision pending > 72 hours**: Escalate to leadership
2. **Kill decision with < 50% confidence**: Optional leadership review
3. **Scale decision > 2x budget increase**: Leadership approval required
4. **Conflicting decisions in same cycle**: Portfolio lead resolves

### Override Authority
- **Portfolio lead**: Can override any governance-decision-agent recommendation
  - Requires documented business rationale
  - Requires founder notification (for impactful changes)
  - Override logged in execution state

- **CEO/Leadership**: Can override portfolio lead decision
  - Requires strategic business justification
  - Requires founder notification within 24 hours
  - Override logged with escalation rationale

### Appeals Process
- Founders may appeal decisions within 48 hours
- Appeal heard by portfolio lead + 1 other senior leader
- Decision: Uphold, modify, or reverse
- Timeline: 48 hours from appeal submission

---

## Preventing Decision Cascade (Founder Fatigue)

### Policy
- If a venture receives a PAUSE or KILL decision, no second review can be triggered for 14 days (unless emergency anomaly)
- Rationale: Allow time for founder to execute on decision or closure plan

### Exception
- Emergency anomaly (new data contradicting decision): Can trigger review within 7 days

---

## Review Calendar & Communication

### Scheduled Review Announcement
- Sent to all founders 1 week in advance
- Lists: Review date, timeline, expected outcomes
- Asks: Any ad-hoc review requests? Submit by [date]

### Post-Cycle Summary
- Sent to founders within 24 hours of cycle completion
- Includes: Your venture's decision, rationale, next milestones
- Next review: [date]

### Portfolio Dashboard
- Real-time: Current review cycle status
- Historical: Last 12 review cycles with outcomes
- Search: Filter by venture, decision type, date

---

## Revision History
- **2026-04-06**: Initial version
