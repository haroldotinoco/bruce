# Portfolio Module: Tenant Isolation Strategy

## Overview

The Portfolio module implements multi-tenant isolation across database, cache, messaging, and audit systems to ensure governance decisions, allocation records, and risk assessments remain strictly segregated by account.

---

## Database Isolation

### Portfolio Reviews Table
- **Partitioning**: Partitioned by `account_id`
- **Scope**: All portfolio review records, including venture health snapshots, agent analysis outputs, and recommendations
- **Indexes**: `(account_id, review_id)`, `(account_id, created_at)`
- **Access Pattern**: All queries filter by `WHERE account_id = ?` at application level

### Allocation Records Table
- **Partitioning**: Partitioned by `account_id`
- **Scope**: Resource allocation plans, rebalancing history, fund distribution records
- **Constraints**: Ensures allocations sum to 100% within account scope only
- **Audit Fields**: `allocated_by_agent`, `allocation_timestamp`, `rebalance_reason`

### Governance Decisions Table
- **Partitioning**: Partitioned by `account_id`
- **Scope**: Scale/iterate/pause/kill decisions per venture, decision rationale, approval status
- **Immutability**: Once recorded, decisions cannot be deleted (soft-delete only with `decision_superseded_by` foreign key)
- **Required Fields**: `account_id`, `decision_id`, `venture_id`, `decision_type`, `decision_reason`, `confidence_score`, `agent_id`, `timestamp`

### Venture Health Snapshots Table
- **Partitioning**: Partitioned by `account_id`
- **Scope**: Point-in-time health metrics for each venture at review time
- **Retention**: Snapshots retained for 2 years for trend analysis
- **Foreign Key**: Links to ventures via `(account_id, venture_id)` composite key

---

## Temporal Isolation

### Review Cycle Workflows
- **Trigger**: Each account has independent scheduler entry based on `review_cycle_weeks` in tenant config
- **Cycle Duration**: 2-4 weeks for pro tier, 1-4 weeks configurable for enterprise
- **Workflow ID Format**: `portfolio-review-{account_id}-{cycle_start_date}`
- **State Machine**: Each review progresses through states (scheduled → venture-analysis → risk-assessment → allocation-planning → governance-decision → reporting) within account scope

### Agent Isolation
- **Agent ID Format**: `{account_id}-{agent_type}-{review_id}`
- **State Isolation**: Each agent instance maintains state specific to one account's review cycle
- **No Cross-Account State**: Agents never share execution context or memory across accounts

### Scheduled Task Isolation
- **Cron Entries**: Separate cron job per account for review scheduling
- **Task Metadata**: Task includes `account_id` in context, passed to all downstream handlers
- **Concurrency**: Reviews for different accounts can run in parallel; reviews for same account are serialized

---

## Redis Cache Isolation

### Cache Key Namespacing
All Redis keys follow pattern: `portfolio:{account_id}:{resource_type}:{resource_id}`

Examples:
- `portfolio:acc_123:venture-health:ven_456` — Current health score for venture
- `portfolio:acc_123:allocation:latest` — Most recent allocation plan
- `portfolio:acc_123:review-state:rev_789` — Review workflow state
- `portfolio:acc_123:risk-factors:ven_456` — Cached risk metrics

### Cache Invalidation
- On governance decision: invalidate `portfolio:{account_id}:allocation:*`
- On venture update from StartupOps: invalidate `portfolio:{account_id}:venture-health:{venture_id}`
- On review completion: invalidate `portfolio:{account_id}:review-state:*`

### TTL Policies
- Health snapshots: 24 hours
- Allocation plans: 1 hour (stale within review cycle)
- Review state: cleared on review completion
- Risk factors: 4 hours

---

## Cross-Module Integration

### Inbound Data (from StartupOps, GTM modules)
- **Source**: Aggregate APIs from startup-ops (venture metrics) and gtm (market traction)
- **Isolation**: Portfolio fetches data filtered by `account_id`
- **Query Pattern**:
  ```
  GET /startup-ops/ventures?account_id={account_id}
  GET /gtm/market-metrics?account_id={account_id}
  ```
- **Caching**: Results cached under account namespace in Redis

### Outbound Data (governance decisions back to modules)
- **Sink**: Publish governance decisions to event bus
- **Event Isolation**: Event includes `account_id`, consumed by downstream subscribers
- **Message Format**: All events routed through message queue with account partition key
- **Subscribers**: StartupOps, GTM modules filter events by matching `account_id`

### No Data Leakage
- Portfolio module never publishes aggregate metrics across accounts
- Health trends, allocation ratios remain account-specific
- Report generation queries always include `WHERE account_id = ?`

---

## Audit Trail & Compliance

### Immutable Decision Log
- **Table**: `portfolio_decision_audit` (partitioned by `account_id`)
- **Immutability**: Insert-only; no updates or deletes
- **Fields**: `audit_id`, `account_id`, `decision_id`, `venture_id`, `decision_type`, `previous_decision`, `new_decision`, `rationale`, `agent_id`, `confidence_score`, `timestamp`
- **Retention**: Minimum 7 years (regulatory requirement for investment governance)

### Governance Events Audit
- **Table**: `portfolio_governance_events` (partitioned by `account_id`)
- **Scope**: Review started, venture analyzed, allocation computed, decision recorded, report generated
- **Legal Requirement**: Audit trail proves due diligence in kill/scale decisions
- **Query Access**: Only accessible by account owner and compliance officers for that account

### Compliance Hooks
- Decision audit logged before commit (transactional guarantee)
- Kill decisions require confidence score >= 70% (recorded in audit)
- Resource allocation changes logged with reason field
- Report generation timestamps and recipients tracked

### Example Audit Entry
```json
{
  "audit_id": "audit_1234567",
  "account_id": "acc_123",
  "decision_id": "dec_789",
  "venture_id": "ven_456",
  "decision_type": "kill",
  "previous_decision": "iterate",
  "new_decision": "kill",
  "rationale": "Health score declined below threshold (45 < 50); market validation failed",
  "agent_id": "acc_123-governance-decision-agent-rev_999",
  "confidence_score": 0.78,
  "timestamp": "2026-04-06T10:15:30Z"
}
```

---

## Summary Matrix

| Layer | Isolation Method | Account Segregation | Enforcement |
|-------|------------------|---------------------|-------------|
| Database | Row-level partitioning by `account_id` | Partition key in all tables | Query filters + constraints |
| Temporal | Separate review cycles per account | Scheduler entries per account | Workflow ID includes `account_id` |
| Cache | Key namespace `portfolio:{account_id}:*` | Redis key prefix | Application code enforces |
| Messages | Account partition key in events | Event includes `account_id` | Event bus routing rules |
| Audit | Immutable log partitioned by `account_id` | Append-only, 7-year retention | DB constraints + legal hold |

---

## Testing Isolation

Each deployment must verify:
1. **Data Segregation**: Queries for account A never return account B data
2. **Cache Isolation**: No Redis key collision across accounts
3. **Event Routing**: Governance events route only to correct account's subscribers
4. **Audit Completeness**: Every decision decision is logged before commit
5. **Cross-Module Safety**: Integration calls include account filter in requests/responses
