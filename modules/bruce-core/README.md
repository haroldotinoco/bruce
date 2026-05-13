# Bruce Core Module

**Bruce Core is the TOP-LEVEL ORCHESTRATOR for the BruceAI multi-agent autonomous venture creation platform.**

## Overview

Bruce Core manages the complete venture lifecycle, dispatches work to 8 specialist modules, enforces stage gates, and makes portfolio-level governance decisions. It is not a regular module—it is the command center that coordinates all others.

### Key Responsibilities

1. **Venture Lifecycle Management**: Transitions ventures through 8 discrete stages (generated → qualified → structured → built → launched → operating → iterating/scaling/paused/killed)
2. **Stage Gate Enforcement**: Evaluates ventures against minimum thresholds before stage advancement
3. **Module Coordination**: Routes work to Brand, Builder, Market, Operator, Portfolio, and other specialist modules
4. **Portfolio Governance**: Makes strategic decisions (scale, iterate, pause, kill) based on health data
5. **State Persistence**: Maintains authoritative venture state across all lifecycle stages
6. **Escalation & Override**: Routes exceptional cases to humans with clear SLAs and default actions
7. **Observability**: Emits structured events, metrics, and correlation IDs for auditability

## Architecture

### Four Core Agents

1. **Venture Lifecycle Manager** (`agents/venture-lifecycle-manager/`)
   - Manages the state machine for individual ventures
   - Determines when to advance, hold, or escalate
   - Provider: Claude Opus 4.6

2. **Gate Enforcer** (`agents/gate-enforcer/`)
   - Evaluates gate criteria with binary pass/fail + rationale
   - Score-based evaluation with minimum thresholds
   - Provider: Claude Sonnet 4.6

3. **Module Dispatcher** (`agents/module-dispatcher/`)
   - Routes work to specialist modules
   - Handles parallel and sequential dependencies
   - Monitors execution and timeouts
   - Provider: Non-LLM routing agent

4. **Governance Agent** (`agents/governance-agent/`)
   - Makes portfolio-level decisions (scale/iterate/pause/kill)
   - Provides confidence scores and detailed rationale
   - Provider: Claude Opus 4.6

### Workflows

- `venture-onboarding.workflow.json`: End-to-end onboarding from opportunity to active venture
- `module-dispatch.workflow.json`: Routing logic for sending work to specialist modules
- `gate-evaluation.workflow.json`: Standardized gate evaluation process
- `portfolio-review-trigger.workflow.json`: Portfolio-level governance cycle

### State Management

- `state/module-state.schema.json`: Persistent state of active ventures, module statuses
- `state/execution-state.schema.json`: Ephemeral state during workflow execution

### Policies & Constraints

- `policies/gate-policy.md`: Gate thresholds, auto-pass/fail criteria, escalation triggers
- `policies/autonomy-policy.md`: When agents can decide vs. when humans must approve
- `policies/escalation-policy.md`: Escalation channels, SLAs, default actions
- `policies/retry-policy.md`: Retry logic, backoff strategies, circuit breakers

### Contracts (Inter-module communication)

- `contracts/gate-decision.schema.json`: Gate pass/fail + rationale
- `contracts/module-dispatch-request.schema.json`: Work request to specialist modules
- `contracts/venture-status-transition.schema.json`: Venture state transitions

## Key Concepts

### Venture Lifecycle Stages

```
generated → qualified → structured → built → launched → operating → {iterating|scaling|paused|killed}
```

- **generated**: Opportunity identified but not yet qualified
- **qualified**: Meets initial screening criteria (revenue potential, problem fit, feasibility)
- **structured**: Business model, market fit, competitive position documented
- **built**: MVP or initial product completed
- **launched**: Product live with initial customers
- **operating**: Stable customer acquisition and retention
- **iterating**: Refining product/market fit (operational stage)
- **scaling**: Accelerating customer acquisition (operational stage)
- **paused**: Temporarily suspended pending market conditions or internal work
- **killed**: Venture terminated by governance decision

### Stage Gates

| Gate | Triggered After | Evaluator | Criteria | Min Score |
|------|-----------------|-----------|----------|-----------|
| Post-Screening | Opportunity Screening | Gate Enforcer | Problem fit, TAM, founder capability | 70 |
| Post-Structuring | Business Modeling | Gate Enforcer | Business model, market sizing, GTM | 75 |
| Post-Build | Product Development | Gate Enforcer | MVP completion, technical feasibility | 70 |
| Post-Launch | Go-to-Market | Gate Enforcer | User acquisition, retention, feedback | 75 |
| Post-Traction | Market Validation | Gate Enforcer | Cohort retention, unit economics, growth | 80 |

### Module Dispatch Rules

| Module | Input | Output | Parallelizable | Timeout |
|--------|-------|--------|-----------------|---------|
| Opportunity Screening | Opportunity pitch | Qualified/Rejected + analysis | No | 5m |
| Brand | Venture record | Brand deck, positioning | Yes (with Builder) | 10m |
| Builder | Venture record | MVP plan, tech architecture | Yes (with Brand) | 10m |
| Market | Venture record | Market analysis, GTM | No | 10m |
| Operator | Venture record | Operational plan, KPI framework | No | 10m |
| Portfolio | Active ventures | Health scores, risk flags | No | 15m |

## Execution Flow

### Venture Onboarding (Happy Path)

```
1. Receive opportunity (validation)
2. Create venture record (state init)
3. Dispatch to Opportunity Screening
4. Gate: Post-Screening (score ≥ 70)
   - PASS → proceed
   - FAIL → mark as rejected, emit event
   - BORDERLINE (65-69) → human review → approve/reject
5. Dispatch to Brand & Builder (parallel)
6. Dispatch to Market & Operator (sequential after 5)
7. Gate: Post-Structuring (score ≥ 75)
8. Advance to "structured" stage
9. Emit events: venture.onboarded, modules.dispatched, gate.passed
```

### Gate Evaluation (Any Gate)

```
1. Gather evaluation criteria (module outputs, venture data)
2. Score against rubric (0-100 scale)
3. Apply minimum threshold (70-80 depending on gate)
4. If score ≥ threshold → PASS
5. If score < threshold - 5 → FAIL
6. If threshold - 5 ≤ score < threshold → BORDERLINE → escalate to human
7. Human approves/rejects within 24h SLA
8. Emit gate decision + rationale
```

## Integration Points

### Inbound

- **Opportunity API**: Receives opportunity pitches
- **Specialist Modules**: Listen for dispatch requests (via pub/sub or API)
- **Human Actors**: Portfolio managers, operators, investors

### Outbound

- **Specialist Modules**: Dispatch work requests via API/messaging
- **State Store**: Persist venture state in authoritative DB
- **Event Bus**: Emit structured events (venture.*, gate.*, module.*, portfolio.*)
- **Notifications**: Alert humans when escalation required

## Deployment & Operations

### Prerequisites

- Event bus (pub/sub for async dispatch)
- Persistent state store (venture records, execution logs)
- Human approval workflow (email, Slack integration, dashboard)
- Observability stack (logging, metrics, tracing)

### Environment Variables

```
BRUCE_LLM_PROVIDER=anthropic
BRUCE_OPUS_MODEL=claude-opus-4-6
BRUCE_SONNET_MODEL=claude-sonnet-4-6
BRUCE_STATE_DB_URL=<venture state database>
BRUCE_EVENT_BUS_URL=<pub/sub connection>
BRUCE_ESCALATION_CHANNEL=slack://#bruce-escalations
BRUCE_MAX_CONCURRENT_WORKFLOWS=10
BRUCE_GATE_EVALUATION_TIMEOUT_SECONDS=300
BRUCE_MODULE_DISPATCH_TIMEOUT_SECONDS=600
```

### Monitoring & Alerts

Key metrics:
- `bruce_ventures_by_stage`: Gauge of active ventures per stage
- `bruce_gate_pass_rate`: Pass rate per gate over time
- `bruce_module_dispatch_latency_ms`: P50, P95, P99
- `bruce_human_escalation_count`: Count of decisions escalated
- `bruce_gate_failure_reasons`: Distribution of gate failure causes

Key alerts:
- Gate escalation pending >4h (SLA breach)
- Module dispatch timeout (>600s)
- State persistence failure
- Event bus connectivity loss

## Files & Locations

See directory structure at top of README.

## Development

To add a new gate:
1. Define criteria in `policies/gate-policy.md`
2. Add to gate list in `agents/gate-enforcer/capabilities.json`
3. Update venture lifecycle state machine in `agents/venture-lifecycle-manager/SKILL.md`
4. Add test fixtures in `evaluations/fixtures/`
5. Add workflow step in relevant workflow JSON

To add a new module:
1. Register in `agents/module-dispatcher/capabilities.json`
2. Define dispatch request/response contract
3. Add to module dependency graph in dispatcher
4. Add timeout and retry policy in `policies/retry-policy.md`

## Support & Escalation

- **Architecture Questions**: See `SKILL.md` files for agent responsibilities
- **Policy Questions**: See `policies/` directory
- **Integration Questions**: See contracts in `contracts/` directory
- **Workflow Questions**: See `workflows/` directory
