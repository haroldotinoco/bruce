# Add-Venture Module Events

## Event Catalog

### Venture Lifecycle Events

#### venture.structuring.started
- **Trigger**: Venture enters add-venture module (first briefing interpretation step)
- **Payload**:
  - venture_id
  - opportunity_id
  - venture_name
  - started_timestamp
- **Severity**: INFO
- **Usage**: Kick off pipeline monitoring

#### venture.structuring.completed
- **Trigger**: Venture exits pipeline (either approved or rejected)
- **Payload**:
  - venture_id
  - final_status (approved/rejected/escalated)
  - overall_score
  - iteration_count
  - completed_timestamp
- **Severity**: INFO
- **Usage**: Track completion metrics

### Volume Events

#### volume.N.started
- **Trigger**: Agent begins work on volume N
- **Payload**:
  - venture_id
  - volume_number
  - agent_id
  - started_timestamp
- **Severity**: DEBUG
- **Usage**: Monitor agent execution timing

#### volume.N.completed
- **Trigger**: Agent completes volume N output
- **Payload**:
  - venture_id
  - volume_number
  - agent_id
  - confidence_score
  - completed_timestamp
- **Severity**: INFO
- **Usage**: Track volume quality metrics

### Critique Events

#### critique.scored
- **Trigger**: Venture-critic finishes dossier review
- **Payload**:
  - venture_id
  - overall_score
  - dimension_scores (market_clarity, customer_evidence, model_soundness, etc.)
  - volume_scores
  - iteration_number
  - scored_timestamp
- **Severity**: INFO
- **Usage**: Critical event for go/no-go decisions

#### critique.passed
- **Trigger**: Overall score >= 70
- **Payload**:
  - venture_id
  - overall_score
  - next_step: "dossier-composition"
- **Severity**: INFO
- **Usage**: Trigger final assembly

#### critique.iteration.triggered
- **Trigger**: Overall score 60-69 and iteration_count < 3
- **Payload**:
  - venture_id
  - overall_score
  - weak_volumes (array of volume numbers)
  - iteration_count
  - recommended_iteration_timestamp
- **Severity**: WARN
- **Usage**: Flag for iteration workflow

#### critique.rejection.triggered
- **Trigger**: Overall score < 60 OR iteration_count >= 3
- **Payload**:
  - venture_id
  - overall_score
  - iteration_count
  - failure_reason
  - escalation_required (boolean)
- **Severity**: ERROR
- **Usage**: Flag for human review or archival

### Dossier Events

#### dossier.composed
- **Trigger**: Dossier-composer finishes final assembly
- **Payload**:
  - venture_id
  - status (approved)
  - executive_summary_length (word count)
  - composed_timestamp
- **Severity**: INFO
- **Usage**: Confirm final artifact ready

#### dossier.completed
- **Trigger**: Dossier sent to downstream modules
- **Payload**:
  - venture_id
  - status
  - artifacts_sent_to (brand-aid, builder, archive)
  - sent_timestamp
- **Severity**: INFO
- **Usage**: Confirm downstream hand-off

#### dossier.escalated
- **Trigger**: Human escalation triggered (low score, max iterations, or policy)
- **Payload**:
  - venture_id
  - escalation_reason
  - escalated_to (portfolio_leadership)
  - escalated_timestamp
- **Severity**: WARN
- **Usage**: Alert portfolio leadership

### Error Events

#### agent.timeout
- **Trigger**: Agent execution exceeds timeout
- **Payload**:
  - venture_id
  - volume_number (if applicable)
  - agent_id
  - timeout_seconds
  - error_timestamp
- **Severity**: ERROR
- **Usage**: Alert on execution delays

#### agent.failure
- **Trigger**: Agent returns error or invalid output
- **Payload**:
  - venture_id
  - agent_id
  - error_message
  - failure_timestamp
- **Severity**: ERROR
- **Usage**: Trigger retry or escalation

#### validation.failed
- **Trigger**: Output fails schema validation
- **Payload**:
  - venture_id
  - step_id
  - validation_error
  - failed_timestamp
- **Severity**: ERROR
- **Usage**: Quality assurance check

### Quality Events

#### briefing.quality_gated
- **Trigger**: Briefing quality score assessed
- **Payload**:
  - venture_id
  - briefing_quality_score
  - passed (boolean, >= 75)
- **Severity**: INFO
- **Usage**: Quality gate enforcement

#### volume.confidence_low
- **Trigger**: Volume completes with confidence < 50 (minimum threshold)
- **Payload**:
  - venture_id
  - volume_number
  - confidence_score
  - flagged_for_rerun (boolean)
- **Severity**: WARN
- **Usage**: Flag low-confidence volumes

## Event Integration

### Streaming Sink
All events published to `/bruce/events` stream (Kafka or similar) with venture_id as partition key.

### Monitoring Dashboard
Real-time dashboard tracks:
- Pipeline throughput (ventures/day)
- Iteration rate (% requiring 2+ iterations)
- Average critique score
- Agent execution times
- Error rates by agent

### Alerting Rules
- Agent timeout: Alert engineering (possible performance issue)
- Agent failure: Retry, then alert if 2+ consecutive failures
- Low critique score (<70 first attempt): Flag for portfolio review
- Max iterations reached: Alert portfolio leadership
