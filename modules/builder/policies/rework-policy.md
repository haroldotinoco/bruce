# Builder Module Rework Policy

## Rework Trigger Conditions

### QA Testing Rework Triggers
- Pass rate falls below 90% (gate threshold)
- Any critical test failure identified
- Multiple scenarios failing in same feature
- Data integrity issues detected
- Performance regression identified

### When NOT to Trigger Rework
- Single low-priority scenario failure (<5% of tests)
- Timeout or infrastructure issues (not code issues)
- Test environment problems (database, network)
- Test data issues (reset test data instead)

## Rework Cycle Limits

### Maximum Rework Cycles per Stage
- Backend development: Maximum 3 rework cycles
- Frontend development: Maximum 3 rework cycles
- QA testing: Maximum 3 rework cycles
- Total per build: 9 rework cycles maximum

### Escalation After Maximum Cycles
- If 3 rework cycles exceeded: automatic escalation to human review
- Human review determines: fix or abandon feature
- Executive decision required to proceed with failing feature
- Alternative: scope reduction (remove problematic feature)

### Rework Cycle Counter Reset
- Counter resets only on full pipeline restart
- Switching between frontend and backend rework: counter continues
- Each failed rework cycle counts toward total

## Rework Request Criteria

### Blockng Issues (Automatic Rework)
- Critical security vulnerabilities
- Authentication/authorization failures
- Data loss or corruption
- API contract violations
- Performance regression >50%

### Rework-Worthy Issues (Requires Review)
- UI rendering bugs affecting critical flows
- Business logic errors in core features
- Accessibility compliance failures
- Documentation/comment errors
- Minor performance degradation (10-50%)

### Non-Rework Issues (Fix Elsewhere)
- Documentation in README
- Refactoring code quality improvements
- Non-critical feature requests
- Test utility improvements
- Logging/monitoring enhancements

## Rework Routing Logic

### Failure Analysis by Pattern

#### Frontend Failures
Patterns indicating frontend rework needed:
- UI element not found / selector mismatch
- CSS rendering issues
- Form validation display errors
- Navigation flow broken
- Component rendering glitches
- Accessibility violations (keyboard, screen reader)

Route to: **frontend-agent**

#### Backend Failures
Patterns indicating backend rework needed:
- API response errors (4xx, 5xx)
- Business logic error in calculation/validation
- Database query failure
- Authentication/authorization rejection
- Data validation rejection
- External service integration failure
- Performance timeout (>3s response)

Route to: **backend-agent**

#### Data Failures
Patterns indicating data/backend rework:
- Missing expected data in response
- Corrupted or malformed data
- Database constraint violation
- Data relationship integrity issue
- Migration failure
- Data type mismatch

Route to: **backend-agent**

#### Infrastructure/Environment Failures
Patterns NOT to rework code for:
- Staging environment timeout
- Network connectivity issue
- Database connection pool exhaustion
- Test environment not ready
- External service (API, payment provider) down

Action: Fix environment, rerun tests without rework

## Failure Impact Assessment

### Critical Impact (Immediate Rework)
- Affects core user workflows
- Prevents feature from functioning
- Blocks other tests
- Causes data loss
- Security vulnerability

### High Impact (Priority Rework)
- Affects important feature subset
- Causes degraded experience
- Multiple scenarios affected
- Performance significantly degraded

### Medium Impact (Schedule Rework)
- Affects edge cases
- Non-critical path impacted
- Single or few scenarios affected
- Workaround available

### Low Impact (Document & Continue)
- Cosmetic/minor issues
- Non-functional paths affected
- Single scenario, low priority
- Can be fixed post-launch

## Rework Communication

### Notification Requirements
- QA agent initiates rework → slack notification to engineering
- Failure summary emailed to team (scenario_id, failure_type, impact)
- Slack alert: "Rework triggered: {{cycle_number}}/3 for {{failure_type}}"
- Code rework agent acknowledges receipt

### Status Updates
- Start of rework: "Rework cycle {{cycle_number}} started at {{time}}"
- Build completion: "Rework code built successfully" or "Build failed"
- Testing re-initiated: "Re-testing reworked code for {{scenario_count}} scenarios"
- Result: "Rework successful - pass_rate {{rate}}%" or "Still failing - escalating"

### Escalation Notification
- If rework cycle 3 fails: escalate to tech lead + product manager
- Message includes: failure analysis, root cause, recommended action
- Decision point: fix or abandon feature
- Executive sign-off required if removing scope

## Rework Efficiency Standards

### Time Expectations

| Rework Type | Expected Duration | Benchmark |
|-------------|-------------------|-----------|
| Frontend fix | 30-60 minutes | Page render, form validation |
| Backend fix | 45-90 minutes | API logic, query optimization |
| Data fix | 60-120 minutes | Schema change, migration |
| QA retest | 15-30 minutes | Per 20 scenarios |

### Quality Expectations
- No new failures introduced during rework
- Test coverage maintained or improved
- Code quality maintained or improved
- Documentation updated with fix

## Rework Prevention

### Common Failure Causes & Prevention

**Frontend Rendering Issues**
- Prevention: Component snapshot tests
- Prevention: Visual regression testing
- Prevention: Responsive design testing pre-QA

**Backend Logic Errors**
- Prevention: Unit tests for all business logic
- Prevention: Integration tests for happy path
- Prevention: Code review before rework

**Data Issues**
- Prevention: Database constraint testing
- Prevention: Migration testing in staging
- Prevention: Data validation unit tests

**Performance Regressions**
- Prevention: Performance benchmarking in CI
- Prevention: Load testing before QA
- Prevention: Monitoring in staging

## Documentation & Learning

### Rework Post-Mortem
For all rework cycles:
- Root cause analysis documented
- Preventing measure identified
- Team learning item added to wiki
- Process improvement recommended

### Common Issues Tracker
Maintain list of common rework causes:
- Selector brittleness in UI tests
- Query N+1 problems in backend
- State management bugs in frontend
- Migration issues
- Data seeding problems

### Continuous Improvement
- Quarterly review of rework patterns
- Process improvements implemented
- Training for team on common issues
- Automation of manual rework triggers
