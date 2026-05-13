# Escalation Policy

## Core Principle

Escalations are human decision requests that require response within strict SLA. If escalation times out, default action applies automatically (no indefinite holds).

## Escalation Types

### 1. Gate Evaluation Escalation (BORDERLINE)

**Trigger**: Gate score within 5 points of threshold

**Details**:
- Gate name, score, threshold, confidence
- Scoring breakdown with rationale
- Key strengths and weaknesses
- Recommendation (Approve/Reject)

**Approver**: Portfolio Manager

**SLA**: 24 hours

**Default Action**: HOLD (do not advance; keep in current stage)

**Resolution Options**:
- APPROVE: Gate treated as PASS, venture advances
- REJECT: Gate treated as FAIL, venture holds
- REQUEST_REEVALUATION: Ask Gate Enforcer to re-evaluate with new data

### 2. SLA Breach Escalation

**Trigger**: Venture exceeds stage SLA (e.g., >90 days in OPERATING)

**Details**:
- Stage, entry timestamp, days elapsed
- Gate status (if required gate exists)
- Recent events (module dispatch, gate decisions)
- Current blockers if any

**Approver**: Portfolio Manager

**SLA**: 24 hours

**Default Action**: HOLD (do not auto-advance; wait for decision)

**Resolution Options**:
- EXTEND: Approve extending SLA (new deadline provided)
- FORCE_ADVANCE: Override SLA, advance venture
- GOVERNANCE_ESCALATE: Send to Governance Agent for strategic decision (SCALE/ITERATE/PAUSE/KILL)

### 3. Module Timeout Escalation

**Trigger**: Module execution exceeds 600 seconds after retry attempt

**Details**:
- Module name, dispatch batch, attempts
- Module outputs if partial
- Impact on venture progression
- Recommended action (retry, skip, escalate)

**Approver**: Operator (responsible for module services)

**SLA**: 4 hours

**Default Action**: HOLD (do not advance until resolved)

**Resolution Options**:
- RETRY: Dispatcher attempts module again
- MANUAL_OVERRIDE: Operator provides module output manually
- ESCALATE_TO_GOVERNANCE: If module timeout critical, escalate venture decision

### 4. State Consistency Escalation

**Trigger**: Expected venture stage ≠ persisted stage

**Details**:
- Expected stage, actual stage
- Last update timestamp
- Recent transitions
- Potential causes (database corruption, race condition, etc.)

**Approver**: DevOps (infrastructure) + Portfolio Manager

**SLA**: 2 hours (critical)

**Default Action**: HOLD (do not proceed until state corrected)

**Resolution Options**:
- FIX_STATE: Operator corrects state in database
- ROLLBACK: Revert to last known good state
- INVESTIGATE: Request deep investigation of root cause

### 5. Governance Escalation - PAUSE

**Trigger**: Governance Agent recommends PAUSE

**Details**:
- Blocker description and severity
- Impact on venture
- Expected resolution timeline
- Resume conditions
- Alternative if cannot resolve (escalate to KILL)

**Approvers**: Portfolio Manager + Founder (if reachable)

**SLA**: 24 hours

**Default Action**: HOLD (venture remains in current stage, acquire no new customers, minimal team)

**Resolution Options**:
- APPROVE: Proceed with PAUSE, reduce operations
- REJECT: Reject PAUSE, continue current strategy (escalate to Governance for re-eval)
- NEGOTIATE: Propose alternative to PAUSE (e.g., focus shift instead)

### 6. Governance Escalation - KILL

**Trigger**: Governance Agent recommends KILL (confidence ≥0.85)

**Details**:
- Failure indicators (multiple metric failures)
- Why venture is unrecoverable
- Impact (team, resources, runway)
- Founder transition support
- Postmortem plan

**Approvers**: CEO + Portfolio Manager (both required)

**Founder Notification**: Attempt contact with founder for input

**SLA**: 48 hours

**Default Action**: HOLD (do not execute KILL; wait for approval)

**Resolution Options**:
- APPROVE: Execute KILL, wind down venture
- REJECT: Reject KILL, request Governance re-evaluation with new data
- NEGOTIATE: Counter-proposal (e.g., PAUSE instead of KILL)

### 7. Policy Violation Escalation

**Trigger**: Agent detects violation of documented policy

**Details**:
- Policy violated (e.g., "no backtracking to earlier stage")
- Attempted action
- Why violation triggered
- Recommendation

**Approver**: Portfolio Manager + DevOps/Architecture

**SLA**: 24 hours

**Default Action**: HOLD (do not execute; wait for decision)

**Resolution Options**:
- REJECT: Deny the action, keep venture in current state
- APPROVE_EXCEPTION: Exception approved, allow action with documentation
- MODIFY_POLICY: Policy is wrong; update policy and proceed

## Escalation Notification

### Channels

**Primary**:
- Email to required approver(s)
- Dashboard escalation queue
- Slack notification (if configured)

**Backup**:
- SMS for critical escalations (SLA <4h)
- Phone call for CEO/Founder escalations

### Escalation Content

Every escalation must include:

1. **Summary** (1-2 sentences)
2. **Details** (context and metrics)
3. **Approver options** (what they can decide)
4. **Deadline** (explicit timestamp of SLA expiry)
5. **Action link** (one-click approval/rejection)
6. **Context** (supporting data, prior decisions)

### Example Escalation Notification

```
ESCALATION: Gate BORDERLINE - CloudSync Post-Screening Gate
Venture: CloudSync (v-abc12345)
Escalation ID: esc-12345
Deadline: April 6, 2:32 PM (24h SLA)

Gate Score: 68 / 70 threshold
Confidence: 0.74

SUMMARY:
Gate score of 68 is within 5 points of 70 threshold. Venture shows strong founder
capability and large TAM, but problem validation is borderline (only 8 customer interviews,
recommend 10+). Confidence is medium due to limited sample size.

OPTIONS:
[APPROVE - Treat as PASS, advance to QUALIFIED] [REJECT - Treat as FAIL, hold in GENERATED]

Learn more: [link to full evaluation]
```

## SLA Enforcement

### Escalation Lifecycle

```
T=0: Escalation created
- Record creation timestamp
- Set deadline (creation + SLA hours)
- Emit escalation.created event
- Send notification to approver

T=SLA-4h: Reminder notification
- Send reminder email
- Escalate to manager if approver doesn't have email configured

T=SLA: Deadline reached
- Check if response received
- If YES: Record decision, execute action
- If NO: Apply default action, log timeout

T=SLA+1h: Escalation timeout recorded
- Record that escalation timed out
- Emit escalation.timeout event
- Execute default action
- Alert escalation chain (PM's manager, DevOps lead, etc.)
```

### Timeout Handling

If escalation not resolved by SLA:

1. **Default Action Applied**: Immediately execute default action (e.g., HOLD)
2. **Timeout Logged**: Record in venture history that escalation timed out
3. **Chain Notified**: Alert manager of SLA miss (for tracking accountability)
4. **Retry Option**: Escalation chain can request re-escalation if needed

### Escalation Timeout Statistics

- Collect escalation SLA compliance metrics
- Monthly review of timeout rate
- If >10% of escalations timeout: Assess if SLA too short or process too slow
- If <5% of escalations timeout: Assessment passed

## Escalation Review Patterns

### Recurring Late Approvals

If approver repeatedly approves late (>20h out of 24h SLA):

1. **First occurrence**: Send informational note
2. **Second occurrence**: Request meeting to discuss capacity
3. **Third occurrence**: Consider reassigning to different approver

### Recurring Same Decision

If same decision made >3x per month on same venture:

1. Venture may be stuck in a loop
2. Escalate to Governance Agent for strategic decision (not tactical decision)
3. Consider PAUSE or KILL if venture cannot progress

### Conflicting Approvals

If multiple approvers disagree (APPROVE vs REJECT):

1. Designate primary approver (portfolio manager)
2. Escalate to CEO if primary vs. secondary approver conflict
3. Document disagreement in venture record

## Escalation Denial Workflow

If approver rejects a recommendation (e.g., rejects KILL recommendation):

1. **Decision recorded**: Rejection documented with reasoning
2. **Request re-evaluation**: Governance Agent asked to provide updated analysis
3. **New data request**: What would change decision? (What new data needed?)
4. **Timeline**: Set review date for re-evaluation
5. **Risk acknowledgment**: Rejector acknowledges risks of overriding recommendation

## Example SLA Calculations

**Gate BORDERLINE Escalation**:
- Created: April 5, 2:32 PM
- SLA: 24 hours
- Deadline: April 6, 2:32 PM
- Reminder: April 6, 10:32 AM (14h in)
- Default action if no response: HOLD (do not advance)

**Module Timeout Escalation**:
- Created: April 5, 3:00 PM
- SLA: 4 hours
- Deadline: April 5, 7:00 PM
- Reminder: April 5, 6:00 PM (1h before)
- Default action if no response: HOLD venture (do not advance until module resolves)

**KILL Governance Escalation**:
- Created: April 5, 4:00 PM
- SLA: 48 hours
- Deadline: April 7, 4:00 PM
- Reminders: April 6 (24h), April 7 (12h before)
- Default action if no response: HOLD (do not kill; wait for decision)

## Escalation Audit Trail

Every escalation must log:

```json
{
  "escalation_id": "esc-12345",
  "escalation_type": "gate_borderline",
  "venture_id": "v-abc12345",
  "created_at": "2026-04-05T14:32:00Z",
  "created_by": "gate-enforcer",
  "required_approver": "portfolio_manager",
  "sla_hours": 24,
  "deadline": "2026-04-06T14:32:00Z",
  "status": "APPROVED|REJECTED|TIMEOUT",
  "approved_by": "pm@company.com",
  "approved_at": "2026-04-05T16:00:00Z",
  "decision": "APPROVE",
  "reasoning_from_approver": "Founder reputation strong, willing to take risk",
  "default_action_if_timeout": "HOLD",
  "outcome_executed": "venture advanced to QUALIFIED"
}
```

## Escalation Policy Review

This escalation policy should be reviewed:

- **Monthly**: Escalation volume, SLA compliance rate, timeout patterns
- **Quarterly**: SLA durations (are they realistic?)
- **Annually**: Complete policy review for changes

Last reviewed: 2026-04-05
Next review: 2026-07-05
