# Module Timeout Evaluation

## Scenario: AddVenture Module Timeout During Venture Structuring

### Overview

A qualified venture (v-platform-7f2e1a3c-20260410) is dispatched to the AddVenture module for structuring. The module fails to respond within the 2-hour timeout window. Bruce-Core detects the timeout, escalates to human operator, and sets venture to "pending-manual-review" status. This evaluation documents the timeout detection, human escalation process, and recovery workflow.

### Context

**Venture**: DataFlow Platform
- **Venture ID**: v-platform-7f2e1a3c-20260410
- **Venture Name**: DataFlow
- **Founder**: Marcus Chen (ex-Google, ML infrastructure)
- **Problem**: Real-time data pipeline orchestration is fragmented across 7 different tools
- **Market**: Data engineering teams at mid-market tech companies
- **TAM**: $1.4B in data infrastructure market

**Dispatch Details**:
- **Dispatch ID**: disp-89a1b2c3-d4e5f6g7
- **Correlation ID**: 72a7b810-9dad-11d1-80b4-00c04fd430c8
- **Target Module**: AddVenture (structuring phase)
- **Dispatch Time**: April 10, 2026, 2:00 PM UTC
- **Expected Completion**: April 10, 2026, 4:00 PM UTC (120 minutes)
- **Actual Timeout**: April 10, 2026, 4:00 PM UTC
- **Elapsed Time**: 120 minutes

---

## Timeline of Timeout Event

### T=0 (2:00 PM): Dispatch Sent

```
bruce-core.module.dispatched event emitted
├─ Event ID: evt-disp-89a1b2c3
├─ Target: AddVenture module
├─ Venture: v-platform-7f2e1a3c-20260410
├─ Correlation: 72a7b810-9dad-11d1-80b4-00c04fd430c8
├─ Timeout setting: 7200 seconds (2 hours)
├─ Dispatch context:
│  ├─ venture_id: v-platform-7f2e1a3c-20260410
│  ├─ venture_name: DataFlow
│  ├─ current_stage: QUALIFIED
│  ├─ post_screening_score: 79
│  ├─ gate_history: [post-screening: PASSED (79)]
│  └─ next_action: Structure venture with Brand, Builder, Market, Operator modules
│
└─ Dispatch acknowledged: YES (AddVenture received dispatch at 2:01 PM)
   └─ Module ACK payload:
      ├─ dispatch_id: disp-89a1b2c3-d4e5f6g7
      ├─ status: ACKNOWLEDGED
      └─ estimated_completion: 2026-04-10T16:00:00Z
```

**Log lines**:
```
2026-04-10T14:00:12Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Dispatching venture to AddVenture module
2026-04-10T14:00:18Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Dispatch event sent: dispatch_id=disp-89a1b2c3-d4e5f6g7
2026-04-10T14:01:03Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Module acknowledged dispatch (latency=51s)
```

### T=30 minutes (2:30 PM): Heartbeat Check

Bruce-Core periodically checks dispatch status. At 30-minute mark, AddVenture module is still processing.

```
dispatch_status_check
├─ Dispatch ID: disp-89a1b2c3-d4e5f6g7
├─ Current status: IN_PROGRESS
├─ Time elapsed: 30 minutes
├─ Time remaining: 90 minutes
└─ Module status: HEALTHY (responsive to health check)
```

**Log lines**:
```
2026-04-10T14:30:05Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Heartbeat check: AddVenture module is processing (elapsed=30m)
```

### T=60 minutes (3:00 PM): Mid-Point Status

At 1-hour mark, AddVenture module is still processing. No errors reported, but no completion either.

```
dispatch_status_check
├─ Dispatch ID: disp-89a1b2c3-d4e5f6g7
├─ Current status: IN_PROGRESS
├─ Time elapsed: 60 minutes
├─ Time remaining: 60 minutes
├─ Module status: RESPONDING (but slow)
└─ Note: Module took longer than expected for this stage, but still within timeout
```

**Log lines**:
```
2026-04-10T15:00:08Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Mid-point status check: AddVenture still processing (elapsed=60m, remaining=60m)
2026-04-10T15:00:09Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] WARN Module execution slower than median (p95=45m, current=60m)
```

### T=110 minutes (3:50 PM): Pre-Timeout Warning

At 110 minutes, Bruce-Core emits warning that timeout is imminent.

```
timeout_imminent_warning
├─ Dispatch ID: disp-89a1b2c3-d4e5f6g7
├─ Time elapsed: 110 minutes
├─ Time remaining: 10 minutes
├─ Action: Prepare fallback handling and alert operator
└─ Module status: Still IN_PROGRESS
```

**Log lines**:
```
2026-04-10T15:50:15Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] WARN Approaching timeout threshold (elapsed=110m/120m)
2026-04-10T15:50:16Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] WARN Preparing timeout handling procedures
```

### T=120 minutes (4:00 PM): TIMEOUT DETECTED

At exactly 120 minutes (2 hours), the timeout fires. Bruce-Core:
1. Cancels the pending dispatch
2. Marks dispatch status as TIMEOUT
3. Emits timeout event
4. Escalates to human operator
5. Updates venture status to "pending-manual-review"

```
TIMEOUT TRIGGERED
├─ Dispatch ID: disp-89a1b2c3-d4e5f6g7
├─ Venture ID: v-platform-7f2e1a3c-20260410
├─ Module: AddVenture
├─ Timeout threshold: 120 minutes
├─ Actual duration: 120 minutes (exact timeout)
│
├─ Immediate actions:
│  ├─ Cancel pending dispatch
│  ├─ Emit timeout event
│  │  └─ bruce-core.module.timeout
│  │     ├─ dispatch_id: disp-89a1b2c3-d4e5f6g7
│  │     ├─ venture_id: v-platform-7f2e1a3c-20260410
│  │     ├─ target_module: add-venture
│  │     ├─ timeout_seconds: 7200
│  │     ├─ elapsed_seconds: 7200
│  │     └─ detected_at: 2026-04-10T16:00:00Z
│  │
│  ├─ Update venture state
│  │  ├─ Previous stage: QUALIFIED
│  │  ├─ New stage: QUALIFIED (no change)
│  │  ├─ Status: pending-manual-review
│  │  └─ Blockers: [module_timeout_add_venture]
│  │
│  ├─ Create escalation task
│  │  ├─ Escalation ID: esc-timeout-89a1b2c3
│  │  ├─ Operator queue: HIGH priority
│  │  ├─ Assigned to: On-call operator
│  │  ├─ Deadline: 4 hours (SLA: same-day resolution)
│  │  ├─ Context: Venture v-platform-7f2e1a3c, AddVenture module timeout
│  │  └─ Available actions:
│  │     ├─ Retry dispatch to AddVenture
│  │     ├─ Dispatch to alternative module
│  │     ├─ Manually structure venture
│  │     ├─ Pause venture and investigate
│  │     └─ Archive venture and move on
│  │
│  └─ Emit escalation event
│     └─ bruce-core.escalation.initiated
│        ├─ escalation_id: esc-timeout-89a1b2c3
│        ├─ venture_id: v-platform-7f2e1a3c-20260410
│        ├─ reason: module_timeout
│        ├─ module: add-venture
│        └─ created_at: 2026-04-10T16:00:00Z
```

**Log lines**:
```
2026-04-10T16:00:00Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] ERROR TIMEOUT: AddVenture module failed to respond within 7200 seconds
2026-04-10T16:00:01Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Cancelling dispatch disp-89a1b2c3-d4e5f6g7
2026-04-10T16:00:02Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] CRITICAL Escalating to human operator (escalation_id=esc-timeout-89a1b2c3)
2026-04-10T16:00:03Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Venture status updated: pending-manual-review
2026-04-10T16:00:04Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Blocker added: module_timeout_add_venture
```

---

## Root Cause Analysis

### Potential Causes

After timeout detection, governance-agent investigates why AddVenture module failed to respond:

1. **Module Overload** (Most likely - 60% probability)
   - AddVenture module has 15 pending structuring jobs
   - Brand sub-module is slow (avg 45 minutes, this one took 90+ minutes before timeout)
   - Module has no queue management or prioritization
   - **Action**: Scale AddVenture module, add queue management

2. **Network Issue** (25% probability)
   - Temporary network partition between bruce-core and AddVenture
   - Module unable to reach downstream services (Brand module API)
   - Retry mechanism didn't trigger
   - **Action**: Check network logs, improve fault tolerance

3. **Module Crash** (10% probability)
   - AddVenture module crashed after accepting dispatch
   - No cleanup mechanism to report failure
   - Module restart queue picked it up but too late
   - **Action**: Implement health checks and graceful degradation

4. **Slow Processing** (5% probability)
   - Brand module stuck on complex positioning task
   - No timeout on sub-module calls
   - Module taking maximum time allowed
   - **Action**: Add sub-module timeouts, improve observability

---

## Escalation Process

### T+1 minute (4:01 PM): Operator Assigned

The escalation task appears in on-call operator's queue.

```
Escalation Task
├─ ID: esc-timeout-89a1b2c3
├─ Status: ASSIGNED
├─ Assigned to: Sarah Martinez (on-call operator)
├─ Priority: HIGH
├─ Created: 2026-04-10T16:00:00Z
├─ Deadline: 2026-04-10T20:00:00Z (4 hours)
│
├─ Context:
│  ├─ Venture: DataFlow (v-platform-7f2e1a3c-20260410)
│  ├─ Founder: Marcus Chen
│  ├─ Stage: QUALIFIED
│  ├─ Current status: pending-manual-review
│  ├─ Incident: AddVenture module timeout after 2 hours
│  └─ Last known state: QUALIFIED, awaiting structuring
│
└─ Available Actions:
   1. Retry AddVenture dispatch (with increased timeout: 4 hours)
   2. Skip AddVenture and dispatch to individual modules (Brand, Builder, Market, Operator)
   3. Pause venture and investigate module health
   4. Manually structure venture using internal tools
   5. Archive venture (if non-critical)
   6. Hold for AddVenture team investigation
```

**Notification**:
```
Escalation Alert: Module Timeout
  Venture: DataFlow (v-platform-7f2e1a3c-20260410)
  Module: AddVenture
  Reason: Failed to complete within 2-hour timeout
  Status: pending-manual-review
  Action Required: Review and take action from escalation queue
```

### T+5 minutes (4:05 PM): Operator Reviews Incident

Sarah reviews the escalation and associated data.

**Review steps**:
1. Check venture health: All good, gate-passed 24 hours ago, no issues
2. Check AddVenture module status: Module is HEALTHY, no alerts
3. Check correlation_id logs: Full trace available, no errors logged by AddVenture
4. Check other ventures: Other dispatches to AddVenture are completing normally
5. Check network: No network issues detected in that time window

**Hypothesis**: AddVenture module processed the venture but response got lost or delayed.

### T+15 minutes (4:15 PM): Resolution Decision

Sarah decides to **retry the dispatch** with increased timeout.

```
Resolution Action: RETRY DISPATCH
├─ Decision: Retry AddVenture dispatch with 4-hour timeout
├─ Reasoning:
│  ├─ Module is healthy
│  ├─ No errors in logs
│  ├─ Response may have been lost in transit
│  ├─ Venture quality is high (gate score 79)
│  └─ Worth retrying with increased buffer
│
├─ Action taken:
│  ├─ New dispatch created with new dispatch_id
│  ├─ Timeout increased to 14400 seconds (4 hours)
│  ├─ Same venture context and correlation_id reused
│  ├─ Venture status: QUALIFIED (unchanged)
│  └─ Blocker cleared: module_timeout_add_venture removed
│
└─ New dispatch:
   ├─ Dispatch ID: disp-retry-1-89a1b2c3
   ├─ Retry count: 1
   ├─ Timeout: 4 hours
   ├─ Sent at: 2026-04-10T16:15:00Z
   └─ Expected completion: 2026-04-10T20:15:00Z
```

**Log lines**:
```
2026-04-10T16:15:02Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Operator action: Retry dispatch (retry_count=1)
2026-04-10T16:15:03Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO New dispatch created: disp-retry-1-89a1b2c3 (timeout=14400s)
2026-04-10T16:15:04Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Blocker cleared: module_timeout_add_venture
2026-04-10T16:15:05Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Escalation resolved: esc-timeout-89a1b2c3 (action=RETRY)
```

---

## Recovery Workflow

### T+30 minutes (4:30 PM): Retry in Progress

New dispatch to AddVenture module is processing.

```
Retry Dispatch Status
├─ Dispatch ID: disp-retry-1-89a1b2c3
├─ Status: IN_PROGRESS
├─ Time elapsed: 15 minutes
├─ Time remaining: 3 hours 45 minutes
├─ Module: RESPONDING
└─ Sub-modules:
   ├─ Brand: IN_PROGRESS (started at 4:18 PM)
   ├─ Builder: QUEUED (will start after Brand)
   ├─ Market: QUEUED
   └─ Operator: QUEUED
```

**Log lines**:
```
2026-04-10T16:30:10Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Retry in progress: dispatch disp-retry-1-89a1b2c3 (elapsed=15m)
```

### T+180 minutes (6:30 PM): Retry Completes Successfully

After 2.5 hours of processing (within new 4-hour timeout), AddVenture module completes structuring.

```
Dispatch Completion
├─ Dispatch ID: disp-retry-1-89a1b2c3
├─ Status: COMPLETED
├─ Total time: 135 minutes (well within 4-hour timeout)
├─ Sub-module results:
│  ├─ Brand: ✓ Positioning doc, messaging framework
│  ├─ Builder: ✓ MVP plan, architecture, timeline (12 months)
│  ├─ Market: ✓ GTM strategy (2 channels), pricing ($8-15K/mo)
│  └─ Operator: ✓ Operational plan, 6-engineer team, $2.1M/year budget
│
├─ Module output received:
│  ├─ venture_id: v-platform-7f2e1a3c-20260410
│  ├─ dispatch_id: disp-retry-1-89a1b2c3
│  ├─ status: COMPLETED
│  ├─ execution_time_ms: 8100000 (135 minutes)
│  ├─ structured_elements: {...}
│  └─ correlation_id: 72a7b810-9dad-11d1-80b4-00c04fd430c8
│
└─ Venture transitions:
   ├─ Previous status: pending-manual-review
   ├─ New status: QUALIFIED (unchanged)
   ├─ Next action: Post-structuring gate evaluation
   └─ Blockers: [] (all cleared)
```

**Log lines**:
```
2026-04-10T18:30:15Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO AddVenture module completed (execution_time=135m)
2026-04-10T18:30:16Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Venture status updated: qualified (from pending-manual-review)
2026-04-10T18:30:17Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Next action: Post-structuring gate evaluation
```

### T+185 minutes (6:35 PM): Gate Evaluation

Post-structuring gate evaluation begins with high-quality module outputs.

```
Gate Evaluation: Post-Structuring
├─ Gate ID: post-structuring
├─ Venture: v-platform-7f2e1a3c-20260410
├─ Threshold: 75
├─ Evaluation:
│  ├─ Business model clarity: 79 (strong positioning and pricing model)
│  ├─ Go-to-market plan: 77 (2 channels identified, clear positioning)
│  ├─ Competitive position: 76 (differentiated from existing tools)
│  ├─ Financial projections: 78 (realistic timeline, team budget calculated)
│  └─ Resource plan: 75 (6-engineer team, clear roles identified)
│
├─ Weighted score: 77.0
├─ Decision: PASSED (77 ≥ 75)
└─ Next: Venture can advance to STRUCTURED stage
```

**Log lines**:
```
2026-04-10T18:35:20Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Gate evaluation complete: post-structuring PASSED (score=77)
2026-04-10T18:35:21Z [venture_id=v-platform-7f2e1a3c] [correlation_id=72a7b810] INFO Venture advancing to STRUCTURED stage
```

---

## Outcomes and Lessons

### Venture Status After Recovery

```
DataFlow (v-platform-7f2e1a3c-20260410)

Timeline:
├─ April 6: Opportunity validated
├─ April 6-8: GENERATED stage, screening completed
├─ April 8: QUALIFIED stage entry (post-screening gate passed)
├─ April 10, 2:00 PM: Dispatch to AddVenture
├─ April 10, 4:00 PM: TIMEOUT (first dispatch failed)
├─ April 10, 4:15 PM: Retry decision made
├─ April 10, 4:30 PM: Retry dispatch sent
├─ April 10, 6:30 PM: Retry completed (135 minutes)
├─ April 10, 6:35 PM: Post-structuring gate passed
└─ April 10, 6:36 PM: STRUCTURED stage entry

Current State:
├─ Stage: STRUCTURED
├─ Days from GENERATED: 4 days (on track)
├─ Days in QUALIFIED: 2 days
├─ Days in STRUCTURED: <1 day
├─ Status: ACTIVE
├─ Next milestone: BUILT stage (Builder module execution)
└─ Blockers: None
```

### Key Metrics

| Metric | Value | Impact |
|--------|-------|--------|
| First timeout | 120 minutes | Lost time, escalation required |
| Retry duration | 135 minutes | Slightly longer than ideal, but acceptable |
| Escalation to resolution | 15 minutes | Fast operator response |
| Total impact | ~2.5 hours | Venture delayed by ~2.5 hours in QUALIFIED |
| Recovery success | YES | Venture progressed normally after retry |

### Root Cause (Post-Analysis)

After the module team investigated, they confirmed:

**Cause**: AddVenture module had a bug in response serialization
- When Brand module returned results, AddVenture correctly processed them
- But when serializing response to send back to bruce-core, JSON encoding failed for large positioning document
- Module logged the error but never sent the failure response
- Module assumed bruce-core would timeout and handle it
- Retry succeeded because positioning document was slightly shorter (formatting changes)

**Fix applied**:
- AddVenture module improved error handling
- Added fallback serialization for large documents
- Added timeout on sub-module calls to prevent waiting forever
- Deployed fix to production

---

## Prevention for Future Timeouts

### Module Team Actions

1. **Improve Module Health Checks**
   - Implement periodic heartbeats during long-running operations
   - Report progress at 25%, 50%, 75% completion
   - Allow bruce-core to cancel stuck operations

2. **Add Sub-Module Timeouts**
   - Brand, Builder, Market, Operator sub-modules need timeouts
   - Prevent one slow module from blocking entire dispatch
   - Implement parallelization where possible

3. **Improve Error Reporting**
   - All errors must be propagated to caller
   - No "assume timeout and give up" behavior
   - Log all errors with full context

### Bruce-Core Improvements

1. **Smarter Timeout Handling**
   - Heartbeat checks during dispatch
   - Early detection of stuck modules
   - Automatic escalation before hard timeout

2. **Better Escalation Context**
   - Provide operator with module health data
   - Suggest retry with increased timeout based on module history
   - Offer alternative pathways (skip module if non-critical)

3. **Automatic Retry with Backoff**
   - For transient failures, retry with exponential backoff
   - Only escalate to human for persistent failures
   - Log all retry attempts for audit trail

---

## Checklist: Handling Module Timeouts

When you encounter a module timeout:

- [ ] Check if module is healthy (health endpoint responding)
- [ ] Review correlation_id logs for module behavior
- [ ] Check if other ventures' dispatches to same module are completing
- [ ] Decide: Retry, Skip, or Manual handling
- [ ] If retry: Increase timeout, reset blocker, send new dispatch
- [ ] If skip: Dispatch to alternative workflow or modules
- [ ] If manual: Archive venture and notify founder
- [ ] Follow up: Get module team to investigate and fix root cause
- [ ] Update module timeout thresholds if needed based on new data
