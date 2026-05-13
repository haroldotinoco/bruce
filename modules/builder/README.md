# Builder Module

## Overview

The Builder module is a comprehensive MVP development pipeline orchestrator that takes validated functional specifications and produces production-ready applications through an automated 9-stage build process.

### Purpose
Transform product concepts into deployed, tested, secure MVPs in minimal time with maximum quality assurance and risk mitigation.

### Core Value Proposition
- **Speed**: Automated build pipeline from spec to production-ready code in 4-5 hours
- **Quality**: 8 specialized agents ensure code quality, testing, and security gates
- **Reliability**: Sequential pipeline with gate-based progression prevents deployment of problematic builds
- **Learning**: Rework loops and failure analysis drive continuous improvement

## Module Architecture

### 8 Specialized Agents

1. **product-validator** (Stage 1: Pre-Build)
   - Validates functional requirements are complete and buildable
   - Produces: Functional specification
   - Gate: validation_approved = true

2. **ux-bdd-agent** (Stage 2)
   - Creates BDD scenarios (Gherkin format) and wireframes
   - Produces: BDD specification, wireframes, user flows
   - Gate: 20-50 scenarios, wireframes provided

3. **solution-architect** (Stage 3)
   - Designs system architecture, services, data models, APIs
   - Produces: Architecture specification, service definitions
   - Gate: 3-12 services defined, data models complete

4. **backend-agent** (Stage 4)
   - Generates production-ready NestJS/Node.js backend code
   - Produces: Complete backend repository, tests, API implementations
   - Gate: build_status = success, test_coverage >= 80%

5. **frontend-agent** (Stage 5)
   - Generates production-ready React/Next.js frontend code
   - Produces: Complete frontend repository with components, pages, styling
   - Gate: build_status = success, lighthouse_score >= 90

6. **qa-agent** (Stage 6)
   - Executes comprehensive end-to-end tests via Playwright
   - Produces: QA report with test results and evidence
   - Gate: pass_rate >= 90% (triggers rework if not met)

7. **security-agent** (Stage 7)
   - Performs security audit: OWASP Top 10, dependency scan, code review
   - Produces: Security report with vulnerability assessment
   - Gate: critical_count = 0 (blocks launch if violated)

8. **governance-agent** (Stage 8)
   - Final quality gate and launch approval authority
   - Produces: Governance report with launch readiness assessment
   - Gate: launch_approved = true

### 9-Stage Sequential Pipeline

```
[1] Functional Validation
        ↓
[2] UX/BDD Specification
        ↓
[3] Solution Architecture
        ↓
[4] Backend Development
        ↓
[5] Frontend Development
        ↓
[6] QA Testing ──→ [Rework Loop if failures] ──→ Back to Stage 4/5
        ↓
[7] Security Audit
        ↓
[8] Governance Review
        ↓
[9] Launch-Ready Handoff (to GTM module)
```

## Key Features

### Automated Rework Loop
When QA identifies failures:
1. Failures are automatically analyzed and categorized
2. Appropriate agent (frontend or backend) is triggered for rework
3. Fixed code is retested automatically
4. Maximum 3 rework cycles per stage (escalates to human after)

### Multi-Level Quality Gates

| Stage | Gate Condition | Failure Action |
|-------|---|---|
| Validation | validation_approved = true | Block |
| BDD | 20 ≤ scenarios ≤ 50 | Block |
| Architecture | 3 ≤ services ≤ 12 | Block |
| Backend | build_status = success & coverage ≥ 80% | Block |
| Frontend | build_status = success & lighthouse ≥ 90 | Block |
| QA | pass_rate ≥ 90% | Rework Loop |
| Security | critical_vulnerabilities = 0 | Escalate |
| Governance | launch_approved = true | Block |

### Security-First Approach
- Automated security scanning at pipeline exit
- OWASP Top 10 comprehensive assessment
- Dependency vulnerability checking
- Zero-tolerance policy for critical vulnerabilities
- Executive escalation for security blocks

### Observability & Tracing
- Full event emission across all stages
- Correlation IDs for complete build tracing
- Comprehensive metrics collection
- Real-time status dashboards
- Historical build analytics

## Module Files & Structure

### Agents (`agents/`)
- **product-validator/**: Requirement validation agent
- **ux-bdd-agent/**: UX specification agent
- **solution-architect/**: Architecture design agent
- **backend-agent/**: Backend code generation agent
- **frontend-agent/**: Frontend code generation agent
- **qa-agent/**: QA testing agent
- **security-agent/**: Security audit agent
- **governance-agent/**: Launch approval agent

Each agent includes:
- `SKILL.md`: Role, objective, decision rules, limits
- `input.schema.json`: Input contract
- `output.schema.json`: Output contract
- `capabilities.json`: Agent configuration (model, temperature, tokens)
- `tools.json`: External tools used (MCPs)
- `constraints.md`: Quality and operational constraints
- `examples/valid-input.json`: Sample input
- `examples/expected-output.json`: Sample output

### Workflows (`workflows/`)
- **build-pipeline.workflow.json**: 9-stage main pipeline with all stages, gates, and branching
- **stage-gate-evaluation.workflow.json**: Generic gate evaluation logic for any stage
- **rework-loop.workflow.json**: Rework logic, failure categorization, rework routing, cycle limits

### Contracts (`contracts/`)
- **build-project.schema.json**: BuildProject entity (build_id, venture_id, status, artifacts)
- **functional-spec.schema.json**: Functional specification contract
- **bdd-spec.schema.json**: BDD specification (scenarios, user flows, acceptance criteria)
- **architecture-spec.schema.json**: Architecture specification (services, data models, infrastructure)
- **qa-report.schema.json**: QA test results and reports
- **security-report.schema.json**: Security audit findings and assessment

### State (`state/`)
- **module-state.schema.json**: Module-level metrics (active builds, success rates, avg duration)
- **execution-state.schema.json**: Per-build execution state (current stage, rework counts, artifacts)

### Policies (`policies/`)
- **build-policy.md**: Technology stack standards, code quality gates, deployment standards
- **security-policy.md**: OWASP compliance checklist, vulnerability SLAs, incident response
- **rework-policy.md**: Rework triggers, routing logic, cycle limits, escalation criteria

### Observability (`observability/`)
- **events.md**: Event taxonomy, payload schemas, routing, retention
- **metrics.md**: KPIs, stage-specific metrics, alerting thresholds, dashboard specs
- **correlation-ids.md**: ID formats, propagation rules, tracing examples, log aggregation queries

### Evaluations (`evaluations/`)
- **happy-path.md**: Full pipeline success without failures (3h 45m execution)
- **qa-failures-trigger-rework.md**: QA failures trigger rework that succeeds on retry
- **security-block.md**: Critical vulnerability blocks launch, requires remediation
- **fixtures/build-input.json**: Sample valid build input
- **fixtures/qa-report-sample.json**: Sample QA report with mixed pass/fail

## Workflow Execution

### Typical Happy Path (3-5 hours)

```
09:00 - Build initiated with functional spec
09:10 - Functional validation completes
09:40 - UX/BDD specification with wireframes
10:25 - Solution architecture designed
11:25 - Backend code generated (NestJS)
12:20 - Frontend code generated (React/Next.js)
12:50 - QA testing all scenarios
13:20 - Security audit (OWASP, dependencies)
14:00 - Governance review & approval
14:05 - Launch-ready event emitted
```

### With Rework (4-6 hours)

If QA pass rate < 90%:
1. Failures analyzed and categorized
2. Appropriate agent triggered (frontend or backend)
3. Code fixed and rebuilt
4. QA retested
5. If still <90%: Loop back (max 3 cycles)
6. If >90%: Proceed to security

### Security Escalation

If critical vulnerabilities found:
1. Pipeline blocked automatically
2. Security team notified immediately
3. Developer fixes vulnerability
4. Security audit re-run
5. If clear: Proceed to governance
6. If still critical: Escalate to executive

## External Integrations

### MCPs (Model Context Protocol)
- **figma-mcp**: Wireframe creation and design system integration (used by ux-bdd-agent)
- **playwright-mcp**: End-to-end browser automation testing (used by qa-agent)

### External Services
- **OpenAI API**: Document generation, AI analysis (used by agents)
- **AWS CloudFormation/Terraform**: Infrastructure provisioning
- **SonarQube**: Code quality analysis
- **OWASP Dependency Check**: Vulnerability scanning
- **GitHub/GitLab**: Source code repositories

## Quality Standards & Gates

### Code Quality
- **Test Coverage**: Backend >80%, Frontend >70%
- **Code Quality Score**: >80/100
- **Cyclomatic Complexity**: <10 average
- **Security Scan**: Zero critical vulnerabilities

### Performance
- **API Response Time**: P99 <500ms (target)
- **Frontend Lighthouse**: >90
- **Bundle Size**: <150KB gzipped

### Testing
- **QA Pass Rate**: >90% scenarios passing
- **BDD Coverage**: All critical paths tested
- **Security**: OWASP Top 10 assessed

### Security
- **Vulnerabilities**: 0 critical, 0 high
- **Encryption**: TLS 1.3, AES-256 at rest
- **Authentication**: JWT with 1-hour expiration
- **Audit Logging**: All access logged

## Handoff to GTM Module

When governance approves launch:
1. **Event**: `builder.launch-ready` emitted
2. **Artifacts**: All code repos, documentation, runbooks
3. **Go-To-Market**: GTM module receives launch-ready signal
4. **Monitoring**: Post-launch conditions attached
5. **Deployment**: GTM coordinates production deployment

### Launch Conditions (Example)
- Monitor error rate (alert >0.5%)
- Monitor API response time (target <500ms)
- Daily security log review (7 days)
- On-call team standing by

## Monitoring & Observability

### Dashboards
- Executive: Build success rate, pipeline duration, active builds
- Operations: Stage progress, failure rates, rework activity
- Quality: Code quality trends, test coverage, security score
- Security: Vulnerabilities by severity, OWASP assessment

### Metrics (Real-time)
- Build success rate: >95% target
- Avg pipeline duration: <4 hours
- Stage pass rates: >90% per stage
- Security score: >80/100

### Alerting
- WARNING: Build success <90%, pipeline >5h
- CRITICAL: Build failure, security block, unresolved blocking issues

## Process Improvements

### Learning Loop
1. Failure analysis documents root causes
2. Process improvements identified quarterly
3. Prevention measures added to pipeline
4. Team training on common issues

### Metrics Tracking
- Monthly reports on pipeline efficiency
- Rework rate trends
- Security vulnerability trends
- Code quality improvements

## Getting Started

1. **Initiate Build**: Start with validated venture spec and functional requirements
2. **Monitor Progress**: Track via real-time dashboard with build_id
3. **Handle Failures**: Rework loops trigger automatically; monitor escalations
4. **Review Launch**: Governance agent produces approval/blocking report
5. **Deploy**: GTM module coordinates production deployment

## Key Success Factors

- **Complete Specs**: Functional and BDD specs must be thorough
- **Team Readiness**: Code agents need accurate tech stack preferences
- **Staging Environment**: QA requires deployed staging
- **Security Awareness**: Team must understand vulnerability findings
- **Monitoring**: Post-launch monitoring critical for success

---

**Module Version**: 1.0
**Last Updated**: 2026-04-06
**Status**: Production-Ready
