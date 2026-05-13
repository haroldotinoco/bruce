# Builder Module Events

## Event Taxonomy

All events follow the format: `{module}.{entity}.{action}`

### Build Lifecycle Events

#### build.started
- **Fired**: When a new build begins
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "venture_id": "venture-xyz",
    "initiated_at": "2026-04-06T14:00:00Z"
  }
  ```
- **Severity**: INFO
- **Handlers**: Update module state, notify stakeholders

#### build.stage.started
- **Fired**: When a pipeline stage begins execution
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "stage": "backend-development",
    "stage_number": 4,
    "started_at": "2026-04-06T14:15:00Z"
  }
  ```
- **Severity**: INFO
- **Handlers**: Logging, monitoring, notifications

#### build.stage.passed
- **Fired**: When a stage passes its gate conditions
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "stage": "backend-development",
    "duration_seconds": 1800,
    "output_ref": "artifact-backend-repo-001",
    "quality_metrics": {
      "test_coverage": 85,
      "code_quality_score": 92
    }
  }
  ```
- **Severity**: INFO
- **Handlers**: Proceed to next stage, update dashboard

#### build.stage.failed
- **Fired**: When a stage fails without rework opportunity
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "stage": "solution-architecture",
    "failure_reason": "services_count > 12",
    "error_message": "Too many services (15) exceeds maximum of 12",
    "failed_at": "2026-04-06T14:20:00Z"
  }
  ```
- **Severity**: CRITICAL
- **Handlers**: Block pipeline, alert team, update status

#### build.approved
- **Fired**: When governance approves launch
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "venture_id": "venture-xyz",
    "approval_timestamp": "2026-04-06T15:30:00Z",
    "approval_score": 95,
    "approved_by": "governance-agent"
  }
  ```
- **Severity**: INFO
- **Handlers**: Emit to GTM pipeline, prepare deployment

#### build.blocked
- **Fired**: When a critical issue blocks launch
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "blocked_by": "security-audit",
    "critical_vulnerabilities": 3,
    "blocking_reason": "critical_count > 0",
    "blocked_at": "2026-04-06T15:25:00Z"
  }
  ```
- **Severity**: CRITICAL
- **Handlers**: Alert security team, notify stakeholders, escalate

### QA Testing Events

#### build.qa.report-generated
- **Fired**: When QA produces a test report
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "report_id": "qa-report-001",
    "scenarios_total": 35,
    "scenarios_passed": 34,
    "pass_rate": 97.1,
    "execution_time_seconds": 1200
  }
  ```
- **Severity**: INFO
- **Handlers**: Store report, evaluate gate, notify team

#### build.qa.rework-triggered
- **Fired**: When QA failures trigger rework
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "failure_count": 3,
    "failure_scenarios": ["BDD-LOGIN-002", "BDD-DOCGEN-001", "BDD-POLICY-003"],
    "failure_types": ["frontend_failure", "backend_failure"],
    "rework_cycle": 1
  }
  ```
- **Severity**: WARNING
- **Handlers**: Route to appropriate agent, track rework cycle

### Security Audit Events

#### build.security.vulnerability-found
- **Fired**: When security audit identifies vulnerabilities
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "vulnerability_id": "SEC-001",
    "severity": "critical",
    "title": "SQL Injection in user endpoint",
    "affected_component": "UserController.getProfile",
    "cwe_id": "CWE-89"
  }
  ```
- **Severity**: CRITICAL (if severity=critical)
- **Handlers**: Block if critical, notify security team, escalate

#### build.security.scan-complete
- **Fired**: When security audit completes
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "audit_id": "sec-audit-001",
    "security_score": 82,
    "vulnerabilities_count": {
      "critical": 0,
      "high": 0,
      "medium": 1,
      "low": 2
    },
    "owasp_coverage": "10/10"
  }
  ```
- **Severity**: INFO
- **Handlers**: Proceed to governance, update metrics

### Rework Cycle Events

#### rework.failures-analyzed
- **Fired**: When rework failure analysis completes
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "frontend_failures": 2,
    "backend_failures": 1,
    "data_failures": 0,
    "categorization_complete": true
  }
  ```
- **Severity**: INFO
- **Handlers**: Route to appropriate agents

#### rework.frontend-started
- **Fired**: When frontend rework begins
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "rework_cycle": 1,
    "failed_scenarios": ["BDD-LOGIN-002", "BDD-DASHBOARD-001"],
    "failure_type": "frontend_failure"
  }
  ```
- **Severity**: INFO
- **Handlers**: Logging, monitoring

#### rework.backend-started
- **Fired**: When backend rework begins
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "rework_cycle": 1,
    "failed_scenarios": ["BDD-DOCGEN-001"],
    "failure_type": "backend_failure"
  }
  ```
- **Severity**: INFO
- **Handlers**: Logging, monitoring

#### rework.cycle-limit-reached
- **Fired**: When rework cycle reaches maximum (3)
- **Payload**:
  ```json
  {
    "build_id": "build-abc12345",
    "max_cycles": 3,
    "current_cycle": 3,
    "action": "escalate_to_human"
  }
  ```
- **Severity**: CRITICAL
- **Handlers**: Human escalation, send to tech lead

### Module State Events

#### module.state-updated
- **Fired**: When module state changes
- **Payload**:
  ```json
  {
    "module": "builder",
    "metric": "avg_pipeline_duration_hours",
    "previous_value": 3.2,
    "new_value": 3.5,
    "updated_at": "2026-04-06T16:00:00Z"
  }
  ```
- **Severity**: INFO
- **Handlers**: Dashboards, metrics collection

## Event Severity Levels

- **INFO**: Normal operation, informational
- **WARNING**: Unusual but non-blocking condition
- **ERROR**: Error condition, may require attention
- **CRITICAL**: Critical failure, blocking, immediate action required

## Event Routing

### Default Handlers by Severity

- **INFO**: Log to event stream, update dashboard
- **WARNING**: Log to event stream, update dashboard, Slack notification
- **ERROR**: Log to event stream, email notification, Slack alert
- **CRITICAL**: Log to event stream, SMS/call to on-call, email, Slack, incident creation

## Event Retention

- All events logged for minimum 90 days
- Critical events retained for 1 year
- Event archives stored in S3 for compliance

## Event Schema

```json
{
  "event_id": "evt-uuid",
  "event_type": "build.stage.passed",
  "timestamp": "2026-04-06T14:15:00Z",
  "source": "builder-module",
  "correlation_id": "build-abc12345",
  "severity": "INFO",
  "payload": {},
  "metadata": {
    "version": "1.0",
    "environment": "production"
  }
}
```
