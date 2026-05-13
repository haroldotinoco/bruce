# Autonomy Policy

## Core Principle

Bruce Core agents are **decision-recommending**, not decision-making. Humans approve all strategic decisions. Agents handle tactical coordination and state management autonomously.

## Autonomy by Agent

### Venture Lifecycle Manager

**Autonomous Decisions** (no human approval needed):
- Advance venture to next stage (if gate PASSED and all prerequisites met)
- Hold venture in current stage (if prerequisites not met or gate not yet passed)
- Dispatch modules to specialist services (call dispatch requests)
- Emit lifecycle events
- Record state transitions
- Retry module dispatch (per retry policy)

**Escalation Required** (human approval needed):
- Gate score BORDERLINE (67-69 for 70-threshold gate)
- SLA exceeded (venture >90 days in OPERATING without advancement)
- State consistency issues (expected stage ≠ persisted stage)
- Multiple blockers (3+ critical blockers unresolved >48 hours)
- Policy violation (attempted invalid transition)

**Cannot Do** (prohibited):
- Kill a venture (only Governance Agent + human can do)
- Override a failed gate (only human can appeal)
- Extend stage SLAs (must escalate when exceeded)
- Change lifecycle rules (must escalate policy questions)

### Gate Enforcer

**Autonomous Decisions** (no human approval):
- Score a venture on 0-100 scale
- Apply threshold logic (PASS/FAIL/BORDERLINE)
- Generate rationale with supporting data
- Flag confidence level
- Emit gate decision event
- Recommend improvement areas if FAILED

**Escalation Required**:
- BORDERLINE score (within 5 points of threshold)
- Confidence <0.70 even if score suggests PASS/FAIL
- Contradictory data (cannot reconcile module outputs)
- Incomplete data (critical metrics missing)

**Cannot Do**:
- Override own gate decisions (humans must appeal)
- Change gate thresholds (policy-driven)
- Force a venture to advance despite FAIL (only human can override)

### Module Dispatcher

**Autonomous Decisions** (no human approval):
- Invoke modules per dispatch rule
- Execute modules sequentially or in parallel (per dependency graph)
- Retry failed modules (per retry policy)
- Apply backoff timing between retries
- Monitor timeouts and emit warnings
- Track execution state
- Emit dispatch events

**Escalation Required**:
- Module timeout after max retries (escalate to operator)
- Repeated failures (>max retries) from module (escalate)
- Module not available (escalate to DevOps)
- Resource exhaustion (escalate to operator)

**Cannot Do**:
- Skip module dispatch (must invoke all modules per rule)
- Change module sequence (cannot reorder unless state allows)
- Extend timeouts (strict 600s limit)
- Make autonomous retry decisions beyond policy

### Governance Agent

**Autonomous Decisions** (no human approval):
- Analyze portfolio health
- Recommend SCALE, ITERATE, PAUSE, or KILL decisions
- Assess confidence in recommendations
- Flag portfolio risks
- Recommend actions
- Emit governance recommendations

**Escalation Required** (human approval needed):
- KILL recommendations (always requires human approval)
- PAUSE recommendations (requires founder/portfolio manager approval)
- Major portfolio reallocation (multiple ventures affected)
- Conflicting metrics (data quality issues)

**Cannot Do**:
- Unilaterally kill ventures (only recommends; humans decide)
- Override founder preferences (must flag conflicts for human)
- Reallocate resources without approval (recommends; humans approve)

## Escalation SLAs

When escalation needed:

| Escalation Type | Required Approver | SLA | Default Action |
|-----------------|------------------|-----|-----------------|
| Gate BORDERLINE | Portfolio Manager | 24h | HOLD (wait) |
| SLA Breach | Portfolio Manager | 24h | HOLD (wait) |
| Module Timeout | Operator | 4h | HOLD (wait) |
| PAUSE Governance | Founder + PM | 24h | HOLD (wait) |
| KILL Governance | CEO + PM | 48h | HOLD (wait) |
| Policy Violation | DevOps + PM | 24h | ESCALATE (notify) |

## Autonomy Limits

### Concurrency Limits

- Lifecycle Manager: Can only process one venture at a time (sequential)
- Gate Enforcer: Can evaluate multiple gates in parallel (no limit)
- Module Dispatcher: Can orchestrate 5+ dispatch batches concurrently
- Governance Agent: Can analyze full portfolio in single run

### Resource Limits

- No autonomous spend decisions (capital allocation requires human approval)
- No autonomous team hiring (resource allocation requires approval)
- No autonomous customer commitments (only operators/sales can commit)

### Timeout Limits

- Lifecycle Manager decision: 5 seconds max latency
- Gate evaluation: 5 minutes max duration
- Module dispatch: 10 minutes per module + monitoring
- Governance analysis: 30 minutes max for full portfolio

## Human Approval Workflows

### For Escalations

```
TRIGGER: Escalation condition met (e.g., gate BORDERLINE)

ESCALATION REQUEST:
- Create escalation record with context
- Notify required approver (email, Slack, dashboard)
- Set SLA timer (e.g., 24h for gate BORDERLINE)

AWAITING APPROVAL:
- Agent holds venture in current state
- Do not proceed without decision
- If SLA expires without response: Apply default action

APPROVAL RECEIVED:
- Record decision and approver
- Execute decision (e.g., advance venture, hold venture)
- Emit decision event

ESCALATION TIMEOUT:
- If no response by SLA: Apply default action
- Log timeout for audit trail
- Notify escalation chain if critical
```

### For Governance Decisions

**KILL Decision Approval Flow**:
```
1. Governance Agent recommends KILL (with 0.85+ confidence)
2. Create escalation with full supporting data
3. Notify CEO + Portfolio Manager
4. Require both approvals before execution
5. Founder notification + opportunity for response
6. If approved: Lifecycle Manager transitions to KILLED
7. If rejected: Governance Agent recommends PAUSE or ITERATE
```

**PAUSE Decision Approval Flow**:
```
1. Governance Agent recommends PAUSE
2. Create escalation with blocker description + timeline
3. Notify Portfolio Manager + Founder
4. Founder can request continuation instead of pause
5. If approved: Reduce team, hold acquisition spend
6. If rejected: Governance Agent re-evaluates (may recommend SCALE or ITERATE)
```

## Escalation Resolution Paths

### Gate BORDERLINE Resolution

**Option 1: APPROVE** (treat as PASS)
- Portfolio manager confirms: Score 67-69 is acceptable
- Lifecycle Manager advances venture
- Venture proceeds to next stage
- Recorded as human override of borderline score

**Option 2: REJECT** (treat as FAIL)
- Portfolio manager confirms: Score too low to pass
- Lifecycle Manager holds venture
- Venture stays in current stage
- Gate Enforcer recommends improvements for next attempt

### SLA Breach Resolution

**Option 1: EXTEND**
- Portfolio manager approves extending SLA (e.g., 120 days in OPERATING → 150 days)
- Must document reason (e.g., waiting for market clarity)
- Venture continues in stage
- New escalation created for new deadline

**Option 2: FORCE ADVANCE**
- Portfolio manager forces transition despite SLA breach
- Lifecycle Manager advances despite holding duration
- Venture proceeds (with risk acknowledged)
- Recorded with override flag

**Option 3: ESCALATE TO GOVERNANCE**
- Portfolio manager escalates SLA breach to Governance Agent
- Governance Agent evaluates SCALE/ITERATE/PAUSE/KILL
- Decision binding on next actions

## Decision Authority Matrix

| Decision | Autonomy | Escalation | Override |
|----------|----------|-----------|----------|
| Advance venture (gate PASSED) | LCM | None | No |
| Hold venture (gate not passed) | LCM | None | No |
| Borderline gate decision | Gate Enforcer | Human (PM) | Yes |
| SLA breach hold | LCM | Human (PM) | Yes |
| Module dispatch | Dispatcher | None | No |
| Module timeout escalation | Dispatcher | Human (Operator) | Yes |
| SCALE recommendation | Governance | None | No |
| ITERATE recommendation | Governance | None | No |
| PAUSE recommendation | Governance | Human (Founder + PM) | Yes |
| KILL recommendation | Governance | Human (CEO + PM) | Yes |

## Policy Enforcement

### What Prevents Autonomous Decisions

1. **Explicit Policy**: If policy says human must approve, agent cannot proceed autonomously
2. **Borderline Conditions**: If decision is in borderline range, agent escalates
3. **Confidence Threshold**: If agent confidence <70%, escalates (even if score suggests clear decision)
4. **Data Quality**: If data quality insufficient, escalates (does not assume)

### What Enables Autonomous Decisions

1. **Clear Policy**: Policy explicitly permits autonomous decision
2. **Objective Criteria**: Decision follows deterministic rule
3. **High Confidence**: Agent has high confidence in decision (>0.85)
4. **Complete Data**: All required data available and recent

## Audit & Accountability

All decisions (autonomous and escalated) must be auditable:

- **Timestamp**: When decision made
- **Decision maker**: Which agent or human
- **Reasoning**: Why this decision
- **Supporting data**: Metrics or context
- **Approval chain**: Who approved if escalated
- **Outcome**: What happened next

## Annual Review

Autonomy levels should be reviewed annually:

1. **Calibration review**: Are agents making good autonomous decisions? (success rate, false positives/negatives)
2. **Escalation review**: Are humans getting the right escalations? (too many/few)
3. **Policy updates**: Do autonomy policies need adjustment based on learnings?
4. **Trust assessment**: Can autonomy levels be increased as system matures?

Last reviewed: 2026-04-05
Next review: 2027-04-05
