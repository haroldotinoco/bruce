# StartupOps Tenant Isolation Strategy

## Overview

StartupOps provides continuous operational health monitoring across 6 dimensions (activation, retention, revenue, product quality, financial sustainability, market fit). Tenant isolation ensures complete data segregation and operational independence across accounts while sharing infrastructure.

## Database Isolation

### Health Score Records

All health score records maintain account-level isolation through explicit account_id partitioning:

```
startup_ops.health_scores
  - account_id (partition key)
  - venture_id
  - timestamp
  - score (0-100)
  - dimensions {activation, retention, revenue, product_quality, financial_sustainability, market_fit}
  - calculation_metadata
```

Row-level security (RLS) enforces queries are filtered by `account_id` at the database level. No cross-account queries are possible.

### Anomaly Events

Anomaly detection events are stored with account_id isolation:

```
startup_ops.anomaly_events
  - account_id (partition key)
  - venture_id
  - timestamp
  - dimension
  - severity (warning | critical)
  - detected_value
  - baseline_value
  - sigma_deviation
  - triggering_metrics
```

Anomaly thresholds are per-account configurable, preventing one account's sensitivity settings from affecting another.

### Operational Reports

Weekly/custom health reports include account-level isolation:

```
startup_ops.health_reports
  - account_id (partition key)
  - report_id
  - venture_ids (subset of monitored ventures)
  - generated_at
  - report_period {start_date, end_date}
  - summary_scores
  - anomalies_detected
  - recommendations
  - recipients
```

Report generation jobs are triggered per-account, with no shared report templates exposing cross-account data.

## Temporal Workflow Isolation

Recurring health monitoring is orchestrated via Temporal with per-account isolation:

```
Workflow ID: health-monitoring-{account_id}
  - Periodic timer: monitoring_frequency_hours (6h for pro, 15min for enterprise)
  - For each monitored_venture:
    - Fetch latest metrics from account-specific data source credentials
    - Run health dimension calculations
    - Compare against account-specific anomaly thresholds
    - Store results with account_id
    - Trigger escalation webhooks if configured
```

Each account has its own Temporal workflow execution namespace isolation, ensuring one account's workflow failures or retries don't impact another. Workflow history is partitioned by account_id.

## Redis Caching Isolation

Metric caches use namespaced keys preventing cross-account collision:

```
Cache Key Pattern: startup-ops:{account_id}:{venture_id}:{metric_type}:{timestamp_bucket}
  Example: startup-ops:acct-123:vent-456:activation:2026-04-06-1800

Cache Contents:
  - Last 24 hours of raw metric points
  - Calculated dimension scores
  - Baseline/σ values for anomaly detection
  - TTL: 7 days or monitoring_frequency_hours based on metric type
```

Account-level Redis namespace isolation prevents key collisions. Cache eviction is per-account, not global.

## Cross-Module Integration

### Receives Data From GTM Module

StartupOps subscribes to GTM metrics events with account filtering:

```
Event Filter: gtm.metrics.published
  - Validates event.account_id matches current subscription
  - Only processes if venture_id is in monitored_ventures list
  - Ingests: MRR, ARR, customer acquisition cost, cohort retention
  - Stores with source attribution (gtm) and account_id
```

No venture data flows across accounts via GTM subscriptions.

### Sends Data To Portfolio Module

Health aggregate reporting sends only authorized data:

```
Event: portfolio.health.aggregated
  - account_id (determines which portfolio sees this)
  - aggregate_health_score (weighted average across ventures)
  - dimension_summaries
  - anomaly_count_by_severity
  - top_recommendations
```

Portfolio module receives filtered data by account_id; cross-venture rollups only include ventures under the same account.

### Alerts and Escalations

Escalation webhooks are per-account and never contain cross-account data:

```
POST {escalation_webhook_url}
  {
    "account_id": "acct-123",
    "venture_id": "vent-456",
    "timestamp": "2026-04-06T14:30:00Z",
    "dimension": "revenue",
    "severity": "critical",
    "current_value": 45,
    "baseline_value": 68,
    "sigma_deviation": 2.8,
    "recommendation": "..."
  }
```

Webhooks are called only for the configured account; webhook URL whitelist is per-account.

## Data Source Credentials Isolation

Data source credentials are encrypted and stored with account_id:

```
startup_ops.data_source_credentials
  - account_id (partition key)
  - venture_id
  - credential_id
  - provider (mixpanel | amplitude | segment | stripe | salesforce | hubspot)
  - encrypted_api_key (encrypted with account-specific key)
  - encrypted_workspace_id
  - metadata {created_at, last_validated_at, next_rotation}
```

Credential decryption keys are account-scoped. A compromised credential in one account cannot decrypt another account's credentials. Each account's integration with Mixpanel, Amplitude, Stripe, etc., uses dedicated API tokens managed per account.

### Credential Rotation Policy

- Credentials are rotated quarterly per account
- Rotation events trigger new baseline calculation for anomaly thresholds
- Credential expiry is monitored per-account with escalation alerts
- Failed credential validation blocks monitoring for that venture only; other ventures continue uninterrupted

## API Authentication and Authorization

All StartupOps API endpoints enforce account isolation via Bearer token:

```
Authorization: Bearer {account_jwt_token}

Token Contents:
  - account_id
  - tier (free | pro | enterprise)
  - monitored_ventures (list)
  - permissions (scope)

API Middleware:
  - Decodes token
  - Extracts account_id
  - Validates venture_id in request path belongs to account_id
  - Rejects if account_id mismatch or venture not in monitored_ventures
```

All API responses are filtered by account_id; venture IDs outside the account scope return 403 Forbidden.

## Monitoring and Audit

Isolation compliance is monitored continuously:

```
startup_ops.audit_log
  - account_id
  - action (credential_accessed | report_generated | webhook_sent | threshold_changed)
  - user_id
  - venture_ids_affected
  - timestamp
  - result (success | failure)
```

Audit logs are immutable and queried only for the owning account. Cross-account audit queries are impossible.

## Summary

- **Database**: account_id partitioning with RLS on all tables
- **Workflows**: Temporal per-account execution with isolated namespaces
- **Cache**: Namespaced Redis keys by account_id and venture_id
- **Credentials**: Encrypted per-account with account-scoped decryption keys
- **Cross-module**: Event filtering by account_id before processing
- **API**: Bearer token validation enforcing account boundaries on all endpoints
- **Audit**: Immutable logs per account with no cross-account visibility
