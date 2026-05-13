# Module Dispatcher Constraints

## Routing Constraints

### 1. Deterministic Dispatch Rules
- **Constraint**: Dispatch logic must be deterministic and rule-based, not discretionary
- **Implementation**: Use dispatch_rules from capabilities.json as authoritative source
- **Example**:
  - QUALIFIED → STRUCTURED: ALWAYS dispatch [brand, builder, market, operator]
  - Never skip a module
  - Never dispatch a module not in the rule
- **Violation**: Dispatcher cannot decide "we'll skip operator dispatch this time"
- **Enforcement**: Hard-code dispatch rules in configuration

### 2. No Decision Authority
- **Constraint**: Dispatcher cannot make autonomous decisions about venture progression
- **What dispatcher CANNOT do**:
  - Decide to skip module dispatch
  - Decide to advance venture without gate check
  - Decide to hold venture based on module failure (only escalates)
  - Decide to reorder module execution
- **What dispatcher CAN do**:
  - Invoke modules in correct order
  - Retry failed modules per policy
  - Escalate timeouts/failures
  - Emit events
- **Enforcement**: Configuration-driven, no conditional logic beyond retry/timeout handling

### 3. Strict Sequence Enforcement
- **Constraint**: Module dependencies must be strictly enforced
- **Sequential dependencies (no parallelization)**:
  - Opportunity Screening → All subsequent dispatches
  - Brand/Builder → Market/Operator
  - Module output must be available before dependent module invokes
- **Violation check**:
  - Cannot invoke Market before Brand/Builder complete
  - Cannot invoke Operator before getting Brand output
- **Enforcement**: Dependency graph resolution at dispatch time

## Execution Constraints

### 4. Timeout Strictness
- **Constraint**: 600-second (10-minute) timeout per module is absolute
- **Timeout policy**:
  - Module execution starts at T=0
  - At T=300s: Emit warning event (optional retry prep)
  - At T=600s: Timeout detected
  - After timeout: Retry 1x (if retries remaining), then escalate
- **No extensions**: Cannot extend timeout even if requested by module or operator
- **Enforcement**: Hard-coded timer, emit alert on breach
- **Special case**: Portfolio module has 15-minute timeout (one exception)

### 5. Atomic Batch Execution
- **Constraint**: Modules in a batch succeed or fail together
- **Implementation**:
  - All modules in batch_id must reach terminal state (COMPLETED, FAILED, TIMEOUT)
  - Partial success allowed (some succeeded, some failed)
  - But transitions happen only after all reach terminal state
- **Example**: If Brand succeeds but Builder times out:
  - Batch status = PARTIAL_FAILURE
  - Cannot trigger gate evaluation
  - Must retry Builder or escalate
- **Enforcement**: Do not report batch COMPLETED until all modules terminal

### 6. No Module Skipping
- **Constraint**: Cannot skip or defer a module that is in the dispatch rule
- **Why**: Modules produce context needed for downstream decisions
- **Violation example**: "Builder is busy, skip and come back to it"
- **Enforcement**: If module unavailable, escalate (don't skip)

## Retry Constraints

### 7. Retry Policy Adherence
- **Constraint**: Follow retry policy exactly per failure type
- **Retry logic**:
  - Transient error: Retry up to 3x with backoff (1s, 2s, 4s)
  - Network error: Retry up to 3x
  - Module error: Retry up to 2x
  - Timeout: Retry 1x only
  - Unavailable: No retry, escalate immediately
- **Backoff calculation**:
  - Attempt 1: Fail → Wait 1s, retry
  - Attempt 2: Fail → Wait 2s, retry
  - Attempt 3: Fail → Wait 4s, retry
  - Attempt 4: Fail → No more retries, escalate
- **Enforcement**: Hard-code per failure classification

### 8. Max Retry Limits
- **Constraint**: Cannot exceed max retries per failure type
- **Why**: Prevent infinite loops on systemic failures
- **Examples of violations**:
  - Module repeatedly fails with same error, but dispatcher keeps retrying >3x
  - Timeout happens, but dispatcher retries >1x
- **Enforcement**: Counter-check before each retry; escalate if limit exceeded

## Parallelization Constraints

### 9. Parallel Dependencies
- **Constraint**: Cannot parallelize modules with dependencies
- **Valid parallelization**:
  - Brand + Builder (no dependencies on each other)
  - Market + Operator (only if both depend on same inputs)
- **Invalid parallelization**:
  - Brand + Market (Market depends on Brand)
  - Opportunity Screening + Brand (Brand depends on Screening)
- **Enforcement**: Check dependency graph before spawning parallel tasks

### 10. Parallelization Atomicity
- **Constraint**: If parallelizing, must wait for ALL to complete before unblocking dependent modules
- **Example**: Cannot invoke Market until both Brand AND Builder are complete
- **Enforcement**: Use wait_all() that requires all tasks in set to complete

## Timeout and Monitoring Constraints

### 11. Continuous Monitoring
- **Constraint**: Must actively monitor module execution, not fire-and-brucet
- **Monitoring loop**:
  - Poll every 10 seconds
  - Check status at each interval
  - Emit warnings at T=300s
  - Detect timeout at T=600s
- **Enforcement**: Implement monitoring loop per module

### 12. Warning Threshold
- **Constraint**: Must emit timeout warning at 300 seconds (5 minutes)
- **Purpose**: Alert humans that timeout may be imminent, allow proactive action
- **Enforcement**: Track elapsed time, emit warning event when elapsed > 300s AND not yet warned

## State Management Constraints

### 13. Execution State Atomicity
- **Constraint**: Execution state updates must be atomic
- **Implementation**: Update state in single transaction
- **What must be atomic**: Module status change + timestamp + output/error
- **Constraint violation**: Updating status but not timestamp (inconsistent state)

### 14. Batch State Integrity
- **Constraint**: Batch cannot transition to COMPLETED unless all modules are terminal
- **Terminal states**: COMPLETED, FAILED, TIMEOUT
- **Enforcement**: Validate all modules terminal before publishing COMPLETED status

### 15. No Partial Publication
- **Constraint**: Cannot publish dispatch.complete event unless entire batch complete
- **Why**: Downstream systems (gate evaluation) expect all module outputs available
- **Enforcement**: Check completion_status.completion_percentage == 100 before emit

## Escalation Constraints

### 16. Escalation Triggers
- **Constraint**: Must escalate in specific conditions
- **Must escalate**:
  - Module timeout (>600s) after retry attempt
  - Module repeatedly fails (>max_retries)
  - Dependency resolution impossible (blocking module failed)
  - Module unavailable (not_available error)
- **Escalation content**:
  - Venture ID
  - Module name
  - Failure reason
  - Retry count
  - Recommended action (RETRY, ESCALATE, SKIP, ABORT)
- **Enforcement**: Check conditions before proceeding

### 17. No Escalation Suppression
- **Constraint**: Cannot suppress or silence escalation if condition met
- **Violation example**: "Module timed out but venture is important, don't escalate"
- **Enforcement**: Escalate deterministically per rules

## Error Classification Constraints

### 18. Accurate Error Classification
- **Constraint**: Must classify module failures accurately
- **Error types**:
  - TIMEOUT: Execution exceeded timeout
  - ERROR: Module returned error status
  - NOT_AVAILABLE: Module service unavailable
  - RESOURCE_EXHAUSTED: System resource limit reached
- **Why it matters**: Affects retry strategy (timeout → 1 retry; error → 2 retries)
- **Enforcement**: Implement error classification logic with clear conditions

## Configuration Constraints

### 19. No Runtime Configuration Changes
- **Constraint**: Cannot change dispatch rules, timeouts, or retry policy at runtime
- **Exception**: Human can request override via escalation, but dispatch does not apply without approval
- **Implementation**: Read configuration at dispatch start, do not refresh during execution

### 20. Audit Trail
- **Constraint**: Every dispatch action must be recorded
- **Required fields**:
  - Batch ID
  - Venture ID
  - Module name
  - Action (invoke, timeout, retry, complete, fail)
  - Timestamp
  - Status
  - Details (error, output, etc.)
- **Enforcement**: Log before/after each state transition

## Examples of Constraint Violations

### Violation 1: Skipping Module
```
VIOLATED: Dispatcher skips Builder because it's "too busy"
CORRECT: Dispatcher must invoke Builder per dispatch rule
```

### Violation 2: Exceeding Retry Limit
```
VIOLATED: Module fails 5 times with transient error, dispatcher retries 6th time
CORRECT: Dispatcher retries max 3x for transient error, escalates after 3rd failure
```

### Violation 3: Extending Timeout
```
VIOLATED: Module approaches 600s timeout, dispatcher grants 10-minute extension
CORRECT: Dispatcher enforces 600s hard timeout, escalates when exceeded
```

### Violation 4: Parallelizing Dependencies
```
VIOLATED: Dispatcher invokes Market before Builder completes
CORRECT: Dispatcher waits for Builder completion, then invokes Market
```

### Violation 5: Partial Batch Completion
```
VIOLATED: Brand completes, dispatcher publishes dispatch.complete event (Builder still running)
CORRECT: Dispatcher waits for all modules terminal before publishing dispatch.complete
```
