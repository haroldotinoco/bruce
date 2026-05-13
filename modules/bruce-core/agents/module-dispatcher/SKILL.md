# Module Dispatcher

## Overview

The Module Dispatcher is the **routing & coordination orchestrator** that translates lifecycle state transitions into module invocations. It determines which specialist modules to invoke, handles parallel and sequential dependencies, monitors execution, and manages timeouts.

**Type**: Non-LLM routing agent (deterministic logic, no LLM inference)
**Scope**: Dispatch orchestration and execution monitoring
**Decision Authority**: Cannot make autonomous decisions; follows rules deterministically

## Role & Responsibility

The Module Dispatcher:

1. **Route Dispatch Requests**: Translate stage transitions into module invocations
2. **Dependency Management**: Execute modules in correct order (parallel where possible, sequential where required)
3. **Execution Monitoring**: Track completion status and timeout
4. **Failure Handling**: Retry failed dispatches with exponential backoff
5. **State Synchronization**: Wait for outputs before unblocking dependent modules
6. **Event Emission**: Broadcast dispatch progress events

## Module Registry

### Specialist Modules

| Module | Invocation Trigger | Input | Output | Duration | Parallelizable |
|--------|-------------------|-------|--------|----------|-----------------|
| **Opportunity Screening** | venture created (GENERATED) | Opportunity pitch | Market analysis, founder assessment, feasibility study | 5m | No |
| **Brand** | QUALIFIED stage entry | Venture record | Brand positioning, messaging, visual identity | 10m | Yes (with Builder) |
| **Builder** | QUALIFIED stage entry | Venture record | MVP plan, technical architecture, resource needs | 10m | Yes (with Brand) |
| **Market** | STRUCTURED stage entry | Brand + Builder outputs | Go-to-market strategy, pricing, customer acquisition plan | 10m | No (depends on Brand/Builder) |
| **Operator** | STRUCTURED stage entry | Brand + Builder outputs | Operational plan, KPI framework, resource plan | 10m | No (depends on Brand/Builder) |
| **Portfolio** | Portfolio review cycle (every 7 days) | All active ventures | Health scores, risk flags, growth forecasts | 15m | N/A |

### External Services

| Service | Purpose | Invocation |
|---------|---------|------------|
| **State Store** | Venture record persistence | Read/write on every dispatch |
| **Event Bus** | Async communication | Emit dispatch events |
| **Notification Service** | Human alerts | When escalation or timeout |

## Dispatch Logic by Stage

### GENERATED → QUALIFIED

**Dispatched Modules**: Opportunity Screening

**Sequence**:
```
1. Receive venture (opportunity pitch)
2. Create venture record (GENERATED state)
3. Invoke Opportunity Screening
   - Input: Opportunity pitch, founder info, market context
   - Timeout: 5 minutes
   - On success: Gate Enforcer evaluates post-screening gate
   - On failure: Emit alert, retry up to 3x, escalate after 3 failures
4. Emit event: modules.dispatched (opportunity_screening)
```

### QUALIFIED → STRUCTURED

**Dispatched Modules**: Brand + Builder (parallel), then Market + Operator (sequential after Brand/Builder complete)

**Dependency Graph**:
```
STAGE ENTRY (QUALIFIED)
    ↓
    ├─→ Brand (timeout: 10m)
    │       ↓
    │    (wait for completion)
    │
    └─→ Builder (timeout: 10m)
            ↓
         (wait for completion)
            ↓
        ├─→ Market (timeout: 10m, depends on Brand+Builder)
        │       ↓
        │    (wait for completion)
        │
        └─→ Operator (timeout: 10m, depends on Brand+Builder)
                ↓
             (wait for completion)
                ↓
         Gate Enforcer: post-structuring gate evaluation
```

**Sequence**:
```
1. Advance to STRUCTURED
2. Dispatch Brand & Builder in parallel
   - Set batch_id (e.g., batch-disp-289)
   - Create execution records for both
   - Set start time + timeout (10m each)
3. Monitor for completion (polling every 10s)
   - If either times out (>10m): Emit alert, trigger retry
   - If either fails: Emit alert, trigger retry
   - If both complete: Proceed to step 4
4. Dispatch Market & Operator (waiting for Brand/Builder outputs)
   - Input: Brand positioning, Builder architecture, venture record
   - Create execution records
   - Set start time + timeout (10m each)
5. Monitor for completion
   - If either times out: Emit alert, trigger retry
   - If both complete: Emit dispatch.complete event
6. Trigger Gate Enforcer: post-structuring gate evaluation
```

### STRUCTURED → BUILT

**Dispatched Modules**: Market (GTM update), Operator (build tracking)

**Sequence**:
```
1. Advance to BUILT
2. Dispatch Market & Operator (sequential after Builder delivery)
   - Input: MVP ready signal, user feedback
3. Monitor for completion (timeout 10m each)
4. Trigger Gate Enforcer: post-build gate evaluation
```

### BUILT → LAUNCHED

**Dispatched Modules**: Operator (cohort setup), Market (launch strategy execution)

**Sequence**:
```
1. Advance to LAUNCHED
2. Dispatch Operator & Market
   - Input: MVP live, launch date, acquisition targets
3. Monitor for completion (timeout 10m each)
4. Trigger Gate Enforcer: post-launch gate evaluation
```

### LAUNCHED → OPERATING

**Dispatched Modules**: Operator (metric reporting), Portfolio (health assessment)

**Sequence**:
```
1. Advance to OPERATING (triggered after 60+ day cohort data available)
2. Dispatch Operator (metric report)
   - Input: Cohort data, user engagement
   - Timeout: 10m
3. Monitor completion
4. Dispatch Portfolio (health assessment for venture + portfolio-level decision)
   - Input: Operator metrics, all active ventures
   - Timeout: 15m
5. Trigger Gate Enforcer: post-traction gate evaluation
```

## Retry Policy

### Retry Rules

| Failure Type | Retry Limit | Backoff | Max Wait |
|--------------|-------------|---------|----------|
| Transient error (e.g., service timeout) | 3 | Exponential (1s, 2s, 4s) | 7s |
| Network error | 3 | Exponential | 7s |
| Module internal error | 2 | Exponential | 3s |
| Module not available | 1 | None | Fail |
| Timeout (execution >10m) | 1 | None | Fail → Escalate |

### Retry Logic

```
for attempt in [1, 2, 3]:
  try:
    invoke_module(module, input)
    wait_for_completion(timeout=module_timeout)
    return success
  catch failure:
    if failure is_transient and attempt < max_retries:
      wait exponential_backoff(attempt)
      continue
    else:
      emit_alert(module, failure, attempt)
      escalate_if_repeated_failure(module)
      return failure
```

## Timeout Handling

### Timeout Detection

```
start_time = now()
module_timeout = 600 seconds (per module)
warning_threshold = 300 seconds (emit warning at 5m)

monitor_loop:
  elapsed = now() - start_time

  if elapsed > warning_threshold and warning_not_sent:
    emit_event(modules.timeout_warning, module, elapsed)
    warning_not_sent = false

  if elapsed > module_timeout:
    emit_event(modules.timeout, module, elapsed)
    trigger_retry_or_escalation()
    break

  if module.status == COMPLETE:
    break

  sleep(10s)
```

### Escalation on Timeout

```
if module timeout after max_retries:
  create_escalation(
    type="module_timeout",
    module_name=module,
    venture_id=venture_id,
    elapsed_seconds=elapsed,
    required_approval="operator",
    sla_hours=4,
    context="Module {{module}} timed out after {{elapsed}}s. Retry {{attempts}} times. Manual intervention required."
  )
  hold_lifecycle_transition()
```

## Parallel Execution Rules

### When Modules Can Parallelize

**Allowed parallelization**:
- Brand + Builder (both need core venture context only)
- Market + Operator (both can consume Brand/Builder outputs in parallel)

**NOT parallelizable**:
- Opportunity Screening (must complete before any other dispatch)
- Brand/Builder vs. Market/Operator (Market/Operator depend on Brand/Builder completion)

### Parallel Execution Pattern

```
dispatch_batch:
  batch_id = generate_id()

  # Create execution tracking for each module
  for module in parallel_modules:
    create_execution_record(
      batch_id=batch_id,
      module=module,
      venture_id=venture_id,
      start_time=now(),
      status=PENDING
    )

  # Invoke all modules concurrently
  tasks = []
  for module in parallel_modules:
    task = invoke_module_async(module, input)
    tasks.append(task)

  # Wait for all to complete
  results = wait_all(tasks, timeout=10m)

  # Handle completion
  if all successful:
    return success
  elif any failed:
    return failure (with partial results)
```

## State Tracking

### Execution Record

```json
{
  "dispatch_batch_id": "batch-disp-289",
  "venture_id": "v-abc12345",
  "stage": "STRUCTURED",
  "dispatched_at": "2026-04-05T14:32:00Z",
  "modules": [
    {
      "module_name": "brand",
      "status": "PENDING|IN_PROGRESS|COMPLETED|FAILED|TIMEOUT",
      "start_time": "2026-04-05T14:32:00Z",
      "end_time": "2026-04-05T14:42:00Z",
      "duration_seconds": 600,
      "output": { ... },
      "error": null,
      "retry_count": 0
    },
    {
      "module_name": "builder",
      "status": "PENDING",
      "start_time": "2026-04-05T14:32:00Z",
      "retry_count": 0
    }
  ]
}
```

## Event Emission

Module Dispatcher emits:

1. `modules.dispatched` (after dispatch initiated)
2. `modules.in_progress` (after module starts)
3. `modules.timeout_warning` (at 5m mark)
4. `modules.completed` (successful completion)
5. `modules.failed` (module returned error)
6. `modules.timeout` (exceeded 10m)
7. `dispatch.complete` (entire batch complete)

## Error Scenarios

### Scenario 1: Module Timeout

```
1. Brand module times out after 10m
2. Emit modules.timeout event
3. Retry 1x (backoff 2s)
4. Retry timeout again
5. Emit escalation request to operator
6. Hold STRUCTURED → BUILT transition
7. Operator investigates, restarts module or clears blocker
```

### Scenario 2: Sequential Dependency Failure

```
1. Dispatch Brand + Builder (parallel)
2. Brand succeeds; Builder fails
3. Emit modules.failed event (builder)
4. Retry Builder 2x
5. If still fails: Hold transition, escalate to operator
   - Market and Operator cannot dispatch without Builder output
```

### Scenario 3: Partial Failure in Batch

```
1. Dispatch Market + Operator
2. Market succeeds; Operator times out
3. Emit partial success event
4. Retry Operator
5. If Operator succeeds: Dispatch.complete
6. If Operator fails: Escalate
```

## Integration Points

### Inbound Triggers

- **Lifecycle Manager**: `dispatch.request` event with venture_id, stage, modules list
- **Escalation Resolution**: Resume dispatch after human decision

### Outbound Calls

- **Specialist Modules**: Invoke via API/messaging with venture context
- **State Store**: Read/write execution records
- **Event Bus**: Publish progress events
- **Notification Service**: Alert on timeouts/failures
- **Gate Enforcer**: Trigger gate evaluation after dispatch.complete

## Constraints

1. **No Decision Authority**: Cannot decide to advance venture; only dispatches work
2. **Deterministic Routing**: Apply dispatch rules mechanically; no conditional logic
3. **No Overrides**: Cannot skip module dispatch or change sequence
4. **Timeout Strict**: Always respect 10m timeout per module; no extensions
5. **Sequence Enforcement**: Cannot parallelize sequential dependencies
6. **Atomic Batches**: All modules in batch succeed or fail together (no partial advancement)

## Monitoring & Observability

Key metrics:
- `dispatch_latency_seconds`: P50, P95, P99 per module
- `module_success_rate`: % successful dispatch per module
- `timeout_count`: # of timeouts per module per day
- `retry_count`: Average retries before success

Key alerts:
- Module timeout (>10m)
- Module success rate <95%
- Dispatch batch hanging (stuck in PENDING)

## Examples

See `examples/valid-input.json` and `examples/expected-output.json` for full dispatch workflow examples.
