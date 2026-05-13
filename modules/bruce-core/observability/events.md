# Bruce-Core Events

Complete documentation of all events emitted by the bruce-core module. These events drive downstream workflows, trigger gates, and enable observability across the BruceAI platform.

## Event Categories

### Opportunity Events

#### bruce-core.opportunity.validation-started
**When emitted**: When venture-lifecycle-manager begins validating an incoming opportunity
**Payload fields**:
- `opportunity_id` (string): Unique opportunity identifier
- `validation_id` (string): UUID for this validation run
- `opportunity_context` (object): Full opportunity details
- `timestamp` (ISO 8601): Event emission time

**Severity**: info
**Consumed by**: Observability, Logging

#### bruce-core.opportunity.validated
**When emitted**: After opportunity passes validation and meets minimum requirements
**Payload fields**:
- `opportunity_id` (string): Unique opportunity identifier
- `validation_result` (object): Validation output with pass/fail status
- `validation_score` (number 0-100): Score assigned to opportunity
- `timestamp` (ISO 8601): Event emission time

**Severity**: info
**Consumed by**: venture-onboarding workflow, Analytics

#### bruce-core.opportunity.rejected
**When emitted**: When opportunity fails validation and cannot proceed to venture creation
**Payload fields**:
- `opportunity_id` (string): Unique opportunity identifier
- `rejection_reason` (string): Human-readable reason for rejection
- `rejection_details` (object): Detailed failure information
- `timestamp` (ISO 8601): Event emission time

**Severity**: warning
**Consumed by**: Opportunity module, Logging

---

### Venture Lifecycle Events

#### bruce-core.venture.created
**When emitted**: When venture-lifecycle-manager creates a new venture record in GENERATED state
**Payload fields**:
- `venture_id` (string): Newly created venture ID
- `opportunity_id` (string): Source opportunity ID
- `initial_stage` (string): "GENERATED"
- `correlation_id` (string UUID): Workflow correlation ID
- `founder_name` (string): Primary founder name
- `venture_name` (string): Venture name
- `problem_statement` (string): Problem being solved
- `created_at` (ISO 8601): Venture creation timestamp

**Severity**: info
**Consumed by**: Opportunity Screening module, Observability, Portfolio module

#### bruce-core.venture.status-updated
**When emitted**: When venture-lifecycle-manager updates any venture status field
**Payload fields**:
- `venture_id` (string): Venture being updated
- `previous_status` (string): Previous status value
- `new_status` (string): New status value
- `update_reason` (string): Reason for status change
- `timestamp` (ISO 8601): Update timestamp
- `updated_by` (string): Agent or human who triggered update

**Severity**: info
**Consumed by**: Workflows, Analytics, Portfolio module

#### bruce-core.venture.qualified
**When emitted**: When venture transitions from GENERATED to QUALIFIED after gate pass
**Payload fields**:
- `venture_id` (string): Venture being qualified
- `gate_result` (object): Gate evaluation result
- `gate_score` (number): Score from post-screening gate
- `current_stage` (string): "QUALIFIED"
- `next_dispatch_targets` (array): Modules next in line (AddVenture, etc.)
- `timestamp` (ISO 8601): Transition timestamp

**Severity**: info
**Consumed by**: AddVenture module, module-dispatcher, Portfolio module

#### bruce-core.venture.structured
**When emitted**: When venture transitions to STRUCTURED stage after structuring module completion
**Payload fields**:
- `venture_id` (string): Venture being structured
- `structured_elements` (object): Branding, architecture, GTM, operations outputs
- `current_stage` (string): "STRUCTURED"
- `timestamp` (ISO 8601): Transition timestamp

**Severity**: info
**Consumed by**: Builder module, Analytics

#### bruce-core.venture.built
**When emitted**: When venture transitions to BUILT stage after MVP completion
**Payload fields**:
- `venture_id` (string): Venture with completed MVP
- `mvp_deliverables` (object): Product, documentation, test results
- `current_stage` (string): "BUILT"
- `timestamp` (ISO 8601): Transition timestamp

**Severity**: info
**Consumed by**: Launch module, Analytics

#### bruce-core.venture.launched
**When emitted**: When venture transitions to LAUNCHED stage after product launch
**Payload fields**:
- `venture_id` (string): Launched venture
- `launch_details` (object): Go-live status, initial metrics, customer count
- `current_stage` (string): "LAUNCHED"
- `timestamp` (ISO 8601): Launch timestamp

**Severity**: info
**Consumed by**: Operator module, Portfolio module, Analytics

#### bruce-core.venture.killed
**When emitted**: When venture is terminated before launch
**Payload fields**:
- `venture_id` (string): Terminated venture
- `termination_reason` (string): Why venture was killed
- `termination_stage` (string): Stage at termination
- `timestamp` (ISO 8601): Termination timestamp

**Severity**: warning
**Consumed by**: Portfolio module, Logging, Analytics

#### bruce-core.venture.scaled
**When emitted**: When launched venture achieves scale milestone
**Payload fields**:
- `venture_id` (string): Scaled venture
- `scale_metrics` (object): ARR, customer count, growth rate, market share
- `current_stage` (string): "SCALED"
- `timestamp` (ISO 8601): Scale event timestamp

**Severity**: info
**Consumed by**: Operator module, Portfolio module, Analytics

#### bruce-core.venture.paused
**When emitted**: When venture is paused mid-lifecycle due to market conditions or resource constraints
**Payload fields**:
- `venture_id` (string): Paused venture
- `pause_reason` (string): Reason for pause
- `previous_stage` (string): Stage before pause
- `expected_resume_date` (ISO 8601 or null): Anticipated resume date if known
- `timestamp` (ISO 8601): Pause timestamp

**Severity**: warning
**Consumed by**: Portfolio module, Logging

#### bruce-core.venture.archived
**When emitted**: When venture is permanently archived (rejected pre-qualified)
**Payload fields**:
- `venture_id` (string): Archived venture
- `archive_reason` (string): Reason for archival
- `archived_at` (ISO 8601): Archival timestamp
- `venture_summary` (object): Final snapshot of venture before archival

**Severity**: info
**Consumed by**: Analytics, Logging

---

### Gate Events

#### bruce-core.gate.evaluated
**When emitted**: After gate-enforcer completes evaluation of a gate
**Payload fields**:
- `gate_id` (string): Which gate was evaluated (e.g., "post-screening", "post-structuring")
- `venture_id` (string): Venture being gated
- `score` (number 0-100): Final gate score
- `threshold` (number): Minimum required score
- `evaluation_details` (object): Criterion scores and reasoning
- `confidence` (number 0-1): Confidence in decision
- `timestamp` (ISO 8601): Evaluation timestamp

**Severity**: info
**Consumed by**: Workflows, Analytics, Observability

#### bruce-core.gate.passed
**When emitted**: When gate decision is PASSED (score >= threshold)
**Payload fields**:
- `gate_id` (string): Which gate passed
- `venture_id` (string): Venture that passed
- `score` (number): Gate score
- `threshold` (number): Required threshold
- `passed_at` (ISO 8601): Pass timestamp

**Severity**: info
**Consumed by**: venture-onboarding workflow, Lifecycle transitions, Analytics

#### bruce-core.gate.failed
**When emitted**: When gate decision is FAILED (score < threshold)
**Payload fields**:
- `gate_id` (string): Which gate failed
- `venture_id` (string): Venture that failed
- `score` (number): Gate score
- `threshold` (number): Required threshold
- `failure_reason` (string): Summary of why gate failed
- `failed_at` (ISO 8601): Failure timestamp

**Severity**: warning
**Consumed by**: venture-onboarding workflow, Archival process, Analytics

---

### Module Dispatch Events

#### bruce-core.module.dispatched
**When emitted**: When module-dispatcher sends a venture to a downstream module
**Payload fields**:
- `dispatch_id` (string UUID): Unique dispatch identifier
- `venture_id` (string): Venture being dispatched
- `target_module` (string): Destination module (e.g., "opportunity", "add-venture", "portfolio")
- `dispatch_context` (object): Data being sent to target module
- `correlation_id` (string UUID): Correlation ID for tracing
- `dispatched_at` (ISO 8601): Dispatch timestamp
- `timeout_seconds` (number): Timeout for module to respond

**Severity**: info
**Consumed by**: Target modules, Observability, Timeout tracking

#### bruce-core.module.completed
**When emitted**: When module-dispatcher receives completion event from target module
**Payload fields**:
- `dispatch_id` (string UUID): Original dispatch ID
- `venture_id` (string): Venture that was processed
- `target_module` (string): Module that completed
- `module_output` (object): Results from module
- `execution_time_ms` (number): How long module took
- `status` (string): "completed"
- `completed_at` (ISO 8601): Completion timestamp

**Severity**: info
**Consumed by**: Workflows, Analytics, Observability

#### bruce-core.module.failed
**When emitted**: When module reports failure in processing
**Payload fields**:
- `dispatch_id` (string UUID): Original dispatch ID
- `venture_id` (string): Venture being processed
- `target_module` (string): Module that failed
- `error_message` (string): Failure reason
- `error_details` (object): Full error information
- `status` (string): "failed"
- `failed_at` (ISO 8601): Failure timestamp

**Severity**: error
**Consumed by**: Error handling, Escalation, Logging

#### bruce-core.module.timeout
**When emitted**: When module-dispatcher detects timeout (no response within deadline)
**Payload fields**:
- `dispatch_id` (string UUID): Original dispatch ID
- `venture_id` (string): Venture being processed
- `target_module` (string): Module that timed out
- `timeout_seconds` (number): Timeout threshold that was exceeded
- `elapsed_seconds` (number): How long the module took before timeout
- `status` (string): "timeout"
- `detected_at` (ISO 8601): Timeout detection timestamp

**Severity**: error
**Consumed by**: Escalation handler, Human queue, Logging, SLA tracking

---

### Human Review Events

#### bruce-core.human-review.requested
**When emitted**: When workflow routes decision to human operator (borderline gate score)
**Payload fields**:
- `review_id` (string UUID): Unique review task ID
- `venture_id` (string): Venture under review
- `review_type` (string): Type of review (e.g., "gate-borderline", "escalation")
- `gate_details` (object): Gate info if gate-related
- `score` (number): Score that triggered review
- `min_threshold` (number): Minimum threshold
- `auto_pass_threshold` (number): Auto-pass threshold
- `requested_at` (ISO 8601): Request timestamp
- `escalation_deadline` (ISO 8601): When escalation should trigger if not resolved

**Severity**: warning
**Consumed by**: Operator queue, SLA tracking, Escalation

#### bruce-core.human-review.completed
**When emitted**: When human operator completes review and submits decision
**Payload fields**:
- `review_id` (string UUID): Original review task ID
- `venture_id` (string): Venture reviewed
- `decision` (string): "approved" or "rejected"
- `decision_reason` (string): Human's reasoning
- `reviewed_by` (string): Operator email/ID
- `review_duration_minutes` (number): How long review took
- `completed_at` (ISO 8601): Completion timestamp

**Severity**: info
**Consumed by**: Workflows, Analytics, Audit log

---

### Workflow Events

#### bruce-core.venture-onboarding.completed
**When emitted**: When venture-onboarding workflow finishes (venture dispatched to AddVenture)
**Payload fields**:
- `venture_id` (string): Venture that completed onboarding
- `correlation_id` (string UUID): Workflow correlation ID
- `onboarding_duration_minutes` (number): How long onboarding took
- `gates_passed` (array): Gate IDs that passed
- `human_reviews_required` (number): Count of human reviews
- `completed_at` (ISO 8601): Completion timestamp

**Severity**: info
**Consumed by**: Analytics, Portfolio module

### Portfolio Events

#### bruce-core.portfolio.review-cycle-started
**When emitted**: When portfolio-review-trigger initiates a review cycle
**Payload fields**:
- `review_cycle_id` (string UUID): Unique cycle identifier
- `trigger_type` (string): "scheduled" or "anomaly"
- `anomaly_details` (object or null): Details if anomaly-triggered
- `venture_count` (number): How many ventures in review
- `started_at` (ISO 8601): Review start timestamp

**Severity**: info
**Consumed by**: Portfolio module, Analytics

#### bruce-core.portfolio.review-cycle-completed
**When emitted**: When portfolio review cycle finishes and decisions are applied
**Payload fields**:
- `review_cycle_id` (string UUID): Cycle being completed
- `ventures_reviewed` (number): Count of ventures reviewed
- `decisions_applied` (object): Counts of each decision type
- `completed_at` (ISO 8601): Completion timestamp

**Severity**: info
**Consumed by**: Analytics, Reporting

#### bruce-core.portfolio.decisions-applied
**When emitted**: After all portfolio decisions are applied to venture states
**Payload fields**:
- `review_cycle_id` (string UUID): Cycle decisions came from
- `flagged_for_review` (array): Venture IDs flagged
- `resource_reductions` (array): Ventures with reduced allocation
- `increased_investments` (array): Ventures getting more investment
- `risk_escalations` (array): Ventures escalated for risk
- `applied_at` (ISO 8601): Application timestamp

**Severity**: info
**Consumed by**: Workflows, Portfolio module, Analytics

---

## Event Propagation Rules

1. **Correlation ID**: All events within a workflow run carry the same `correlation_id` for tracing
2. **Venture ID**: All events related to a venture include `venture_id` for filtering
3. **Timestamp**: All events include ISO 8601 timestamp in `timestamp` or `*_at` fields
4. **Severity**: Events tagged with severity (info, warning, error, critical) for alerting
5. **Consumption**: Each event lists modules that subscribe to enable dependency injection

---

## Event Subscribers (By Module)

| Module | Subscribed Events |
|--------|------------------|
| Opportunity Screening | bruce-core.opportunity.validated, bruce-core.venture.created |
| AddVenture | bruce-core.venture.qualified |
| Brand | bruce-core.venture.qualified |
| Builder | bruce-core.venture.qualified, bruce-core.venture.structured |
| Market | bruce-core.venture.qualified |
| Operator | bruce-core.venture.launched, bruce-core.venture.scaled |
| Portfolio | bruce-core.venture.* (all venture events), bruce-core.portfolio.* |
| Observability | All events |
| Analytics | bruce-core.gate.*, bruce-core.venture.*, bruce-core.module.* |
| Logging | All events with severity >= warning |
