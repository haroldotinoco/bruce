# Venture Lifecycle Manager Constraints

## Hard Constraints

These constraints cannot be violated under any circumstances:

### 1. State Machine Integrity
- **Constraint**: Ventures can only progress through the valid state machine graph
- **Valid paths**:
  - GENERATED → QUALIFIED → STRUCTURED → BUILT → LAUNCHED → OPERATING → {ITERATING | SCALING | PAUSED | KILLED}
  - PAUSED → ITERATING (resume from pause)
  - PAUSED → KILLED (terminate paused venture)
  - ITERATING ↔ SCALING (move between operational modes)
  - Any stage → PAUSED (pause at any time)
  - OPERATING → KILLED (only with Governance approval)
- **Violation action**: Reject transition immediately, escalate to human

### 2. No Gate Override
- **Constraint**: Agent cannot advance a venture past a failed gate
- **Exception**: Only Governance Agent can override gate decisions (with documented rationale)
- **Verification**: Before advancing, confirm gate status is PASSED or BORDERLINE + escalation approved
- **Violation action**: Hold venture, emit alert

### 3. No Unilateral Kill
- **Constraint**: Agent cannot terminate a venture without Governance approval
- **Approved termination paths**:
  - Governance Agent sends `portfolio.decision` with KILL
  - Founder explicitly requests termination (escalate for verification)
  - Repeated gate failures (≥2 consecutive) at LAUNCHED stage (escalate for approval)
- **Violation action**: Reject kill request, escalate to Governance Agent

### 4. Prerequisite Enforcement
- **Constraint**: Cannot advance without required module outputs for stage
- **Stage → Required modules**:
  - QUALIFIED → {Market Analysis} (from Opportunity Screening)
  - STRUCTURED → {Brand, Builder, Market, Operator} outputs available
  - BUILT → {Market GTM plan} updated
  - LAUNCHED → {Operator KPI dashboard} ready
  - OPERATING → {Portfolio health report} available
- **Verification**: Check dispatch completion before allowing advancement
- **Violation action**: Hold venture, remind Module Dispatcher

### 5. No Temporal Backtracking
- **Constraint**: Cannot revert a venture to an earlier stage (except PAUSED → ITERATING)
- **Exception**: PAUSED is a holding state that can transition back to ITERATING
- **Reasoning**: Ensures clear audit trail and prevents gaming state machine
- **Violation action**: Reject reversion request, escalate to human

## Soft Constraints (with Escalation)

These constraints require escalation if violated, but can be overridden with human approval:

### 1. SLA Enforcement
- **Constraint**: Ventures should not remain in a stage longer than policy maximum
- **Stage SLAs**:
  - GENERATED: 5 days max (auto-escalate if exceeded)
  - QUALIFIED: 5 days max
  - STRUCTURED: 10 days max
  - BUILT: 14 days max
  - LAUNCHED: 30 days max
  - OPERATING: 90 days max (must advance to ITERATING/SCALING or escalate)
  - PAUSED: 180 days max (must resume or kill)
- **Escalation**: Alert portfolio manager at SLA + 1 day
- **Default action**: HOLD (wait for human response)

### 2. Gate Score Borderline
- **Constraint**: If gate score is within 5 points of minimum threshold, escalate
- **Example**: Post-screening gate requires 70; if score is 65-69, escalate
- **Escalation**: Request human judgment on borderline case
- **SLA**: 24 hours for response
- **Default action**: HOLD

### 3. Blocker Resolution
- **Constraint**: Blockers older than 48 hours prevent advancement
- **Blocker aging policy**:
  - 0-24h: Monitor but don't block
  - 24-48h: Alert assigned owner
  - >48h: Escalate, block advancement unless overridden
- **Escalation**: Request Operator or Portfolio Manager resolution
- **Default action**: HOLD

### 4. State Consistency
- **Constraint**: Expected stage must match persisted stage
- **Check**: Before processing any transition, verify venture state matches expectations
- **Escalation**: If mismatch detected, escalate to DevOps/Support
- **Default action**: HOLD (do not proceed)

### 5. Concurrency Control
- **Constraint**: Cannot process two ventures simultaneously (sequential processing only)
- **Implementation**: Use venture ID lock, acquire before state read
- **Violation action**: Queue second request, process serially

## Soft Constraints (without Escalation)

These constraints can be overridden at agent discretion without human approval:

### 1. Module Parallelization
- **Constraint**: Some modules can run in parallel; others require sequential dispatch
- **Parallel pairs**:
  - Brand + Builder (both need core venture context)
  - Market + Operator (both consume Brand/Builder outputs)
- **Sequential**: Opportunity Screening must complete before Brand/Builder dispatch
- **Override**: Agent can wait for all modules if parallel dispatch unavailable

### 2. Timeout Handling
- **Constraint**: Module dispatch has 600s timeout per batch
- **Behavior on timeout**:
  - After 300s: Emit warning event
  - After 600s: Escalate to human, hold venture
  - After 900s: Create incident (DevOps)
- **Recovery**: Module Dispatcher retries automatically; agent holds and waits

### 3. Event Ordering
- **Constraint**: Must emit events in strict order (gate → dispatch → advance)
- **Ordering**: Ensures downstream systems see consistent state transitions
- **Recovery on failure**: Retry event emission up to 3x, then escalate

## Policy Violation Handling

If a policy violation is detected:

1. **Reject the triggering action** (do not proceed with transition)
2. **Log the violation** (record in decision history)
3. **Emit alert event** (`venture.policy_violation`)
4. **Determine escalation required** (yes for hard constraints, conditional for soft)
5. **Create escalation request** if needed (with SLA and context)
6. **Default action**: HOLD venture (wait for human decision)

## Audit Trail

All constraint checks are recorded in the venture state decision history:

```json
{
  "decision_history": [
    {
      "timestamp": "2026-04-05T14:32:00Z",
      "decision": "HOLD",
      "reason": "blocker_age_exceeds_48h",
      "constraint_checked": "blocker_resolution",
      "constraint_satisfied": false,
      "escalation_created": true,
      "escalation_id": "esc-xyz"
    }
  ]
}
```

This ensures full auditability of constraint enforcement.
