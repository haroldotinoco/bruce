# Retry Policy

## Core Principle

Automated retries should recover from transient failures quickly, but fail fast on systemic issues. Max retries per error type enforced to prevent infinite loops.

## Failure Classification

### Transient Failures

These are temporary, retriable issues that often resolve on retry:

- **Network timeout**: Connection timeout, read timeout
- **Service temporary unavailable**: 503, 429 rate limit (after wait)
- **Downstream service busy**: Module service momentarily overloaded
- **Race condition**: State conflict that will resolve

**Retry Policy**: Up to 3 retries with exponential backoff

### Module Internal Errors

These are non-transient, application-level errors:

- **Business logic error**: Invalid input, constraint violation
- **Missing data**: Required field not found in venue record
- **Configuration error**: Module misconfigured

**Retry Policy**: Up to 2 retries (first retry in case of race condition), then escalate

### Permanent Failures

These are unrecoverable, no-retry situations:

- **Module not found**: Service not available or removed
- **Authentication error**: Invalid credentials
- **Access denied**: Permission denied
- **Invalid request**: Request malformed (will always fail on retry)

**Retry Policy**: No retry, immediate escalation

### Timeout

Module execution exceeded maximum allowed duration:

- **Module timeout**: Execution >600s

**Retry Policy**: 1 retry only (assumes timeout was transient), then escalate

## Retry Backoff Strategy

### Exponential Backoff with Jitter

```
Attempt 1: Fail → Wait (backoff[1] + jitter) → Retry
Attempt 2: Fail → Wait (backoff[2] + jitter) → Retry
Attempt 3: Fail → Wait (backoff[3] + jitter) → Retry
Attempt 4+: Do not retry → Escalate
```

### Backoff Timing

| Failure Type | Attempt 1 | Attempt 2 | Attempt 3 | Max Wait |
|--------------|-----------|-----------|-----------|----------|
| Transient | 1s + 0-500ms | 2s + 0-1s | 4s + 0-2s | 7s |
| Network | 1s + 0-500ms | 2s + 0-1s | 4s + 0-2s | 7s |
| Service busy | 2s + 0-1s | 4s + 0-2s | 8s + 0-4s | 15s |
| Module error | 500ms | 1s | N/A | 1.5s |
| Timeout | 2s | N/A | N/A | 2s |

### Jitter Calculation

Jitter is random delay added to prevent thundering herd (all retries at same time):

```
jitter = random(0, jitter_max)
wait_time = backoff[attempt] + jitter
```

## Retry Triggers by Module

### Opportunity Screening

| Failure | Type | Max Retries | Backoff |
|---------|------|-------------|---------|
| Timeout | Timeout | 1 | 2s |
| Service unavailable | Transient | 3 | 1s, 2s, 4s |
| Module error | Module error | 2 | 500ms, 1s |
| Missing data | Module error | 2 | 500ms, 1s |

**SLA**: 5 minutes (300s) per attempt

### Brand

| Failure | Type | Max Retries | Backoff |
|---------|------|-------------|---------|
| Timeout | Timeout | 1 | 2s |
| Network error | Transient | 3 | 1s, 2s, 4s |
| Invalid venture data | Module error | 0 | Escalate |

**SLA**: 10 minutes (600s) per attempt

### Builder

| Failure | Type | Max Retries | Backoff |
|---------|------|-------------|---------|
| Timeout | Timeout | 1 | 2s |
| Network error | Transient | 3 | 1s, 2s, 4s |
| Resource constraint (memory, compute) | Transient | 2 | 2s, 4s |

**SLA**: 10 minutes (600s) per attempt

### Market

| Failure | Type | Max Retries | Backoff |
|---------|------|-------------|---------|
| Timeout | Timeout | 1 | 2s |
| Network error | Transient | 3 | 1s, 2s, 4s |
| Data unavailable | Module error | 2 | 1s, 2s |

**SLA**: 10 minutes (600s) per attempt

### Operator

| Failure | Type | Max Retries | Backoff |
|---------|------|-------------|---------|
| Timeout | Timeout | 1 | 2s |
| Network error | Transient | 3 | 1s, 2s, 4s |
| KPI data not ready | Transient | 3 | 2s, 4s, 8s |

**SLA**: 10 minutes (600s) per attempt

### Portfolio

| Failure | Type | Max Retries | Backoff |
|---------|------|-------------|---------|
| Timeout | Timeout | 1 | 2s |
| Metrics not aggregated | Transient | 3 | 2s, 4s, 8s |

**SLA**: 15 minutes (900s) per attempt

## Lifecycle Manager Retries

Lifecycle Manager retries dispatch requests if module dispatch fails:

| Failure | Type | Max Retries | Condition |
|---------|------|-------------|-----------|
| Module dispatch failed | Transient | 2 | Retry dispatch after module resolves |
| Gate evaluation missing | Transient | 1 | Wait 30s then retry, max 3 times over 90s |
| Prerequisite check failed | Transient | 1 | Retry once, then escalate if still missing |

## Gate Enforcer Retries

Gate Enforcer does not retry internally, but requesting agent (Lifecycle Manager) may re-request gate evaluation:

- **Re-evaluation trigger**: Venture returns to same stage or advances and reverts
- **Max re-evaluations**: Up to 2 per venture per stage gate
- **Interval**: Wait 2+ weeks between re-evaluations to allow improvement

## Retry Loop Prevention

### Circuit Breaker Pattern

If a module fails repeatedly without recovery:

1. **Threshold**: 5 failures in 1 hour
2. **Action**: Mark module as degraded, stop retrying
3. **Recovery**: Manual intervention required (operator restarts service)
4. **Notification**: Alert operator immediately

### Backoff Ceiling

Backoff timing has a ceiling to prevent excessive delays:

- **Max total wait per dispatch**: 10 minutes before giving up
- **Per-retry max**: 8 seconds

### Retry Budget

Each dispatch batch has a retry budget:

- **Transient failures**: 3 retries total
- **Module errors**: 2 retries total
- **Timeout**: 1 retry total

Once budget exhausted, escalate (no more retries).

## Retry Logging

Every retry must be logged:

```json
{
  "module": "brand",
  "dispatch_batch_id": "batch-disp-289",
  "attempt": 1,
  "failure_reason": "network_timeout",
  "failure_type": "transient",
  "error_message": "Connection timeout after 30s",
  "retry_after_seconds": 1.25,
  "retry_count_total": 3,
  "retry_limit": 3,
  "timestamp": "2026-04-05T14:32:00Z"
}
```

## Escalation Triggers

Stop retrying and escalate if:

1. **Max retries exhausted**: No more retries remaining per policy
2. **Retry budget spent**: Exhausted retry budget for batch
3. **Timeout**: Module exceeds absolute timeout (600s)
4. **Permanent error**: Non-retriable error (auth, not found, invalid request)
5. **Cascade failure**: Multiple modules in batch failing

## Retry Impact on SLAs

Retry delays extend overall execution SLA:

**Example**:
- Module dispatch SLA: 10 minutes (600s)
- Attempt 1: Fail at 100s, wait 1s
- Attempt 2: Fail at 200s (total 101s), wait 2s
- Attempt 3: Fail at 300s (total 103s), wait 4s
- Attempt 4: Success at 400s (total 107s)
- **Total dispatch time**: 107s (within 600s SLA)

If module fails all retries:
- **Total time**: ~200s (attempt 1-3 + wait times)
- **Escalation**: Module Dispatcher escalates to operator
- **Venture impact**: Lifecycle transition holds until operator resolves

## Retry Policy by Context

### During Stage Advancement

Retry if module dispatch fails:
- **Backoff**: Per module retry policy
- **Max attempts**: 3 for transient, 2 for module error
- **Escalation**: If final attempt fails, escalate to operator
- **Default action**: HOLD (do not advance)

### During Gate Re-evaluation

Do NOT retry gate evaluation automatically (gate is deterministic given same data):
- **If data changed**: Request new gate evaluation (not a retry)
- **If conflicting metrics**: Escalate for human review

### During Governance Decision

Do NOT retry governance analysis (requires re-assessment):
- **If metrics changed**: Request new analysis
- **If conflicting data**: Escalate for human review

## Monitoring & Alerting

### Key Metrics

- `module_retry_rate`: % of module invocations requiring retry
- `retry_success_rate`: % of retries that succeed (vs. fail all retries)
- `retry_budget_exhaustion`: % of dispatches that exhaust retry budget
- `escalation_from_retry`: % of escalations caused by retry exhaustion

### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Module retry rate | >20% | Investigate module health |
| Retry success rate | <50% | Investigate systematic issue |
| Retry budget exhaustion | >10% | Increase retry budget or fix module |
| Escalation from retry | >5% | Review retry policy; may be too aggressive |

## Retry Policy Review

This retry policy should be reviewed:

- **Monthly**: Check metrics above; adjust if needed
- **Quarterly**: Review failure patterns by module
- **Annually**: Complete policy review; adjust backoff timing

Last reviewed: 2026-04-05
Next review: 2026-07-05
