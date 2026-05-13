# Governance Agent Constraints

## Launch Approval Criteria
- All 7 prior stages must be completed
- No stage can have blocking failures
- QA pass rate must be >= 90%
- Security must have 0 critical vulnerabilities
- Code quality score must be >= 80
- Test coverage must be >= 80%

## Stage Validation Requirements
1. Product Validation: functional_spec approved
2. UX-BDD: bdd_spec created and acceptance criteria defined
3. Architecture: architecture_spec with service decomposition
4. Backend: build_status = success, test_coverage >= 80%
5. Frontend: build_status = success, lighthouse_score >= 90
6. QA: pass_rate_percent >= 90%, no critical failures
7. Security: launch_blocked = false, critical_count = 0

## Blocking Conditions (Auto-Block)
- Any critical security vulnerability
- QA pass rate below 85%
- Backend or frontend build failure
- Incomplete architecture specification
- Missing accessibility compliance for critical flows
- Outstanding high-severity vulnerabilities without mitigation

## Remediation Tracking
- All blocking issues must have documented remediation
- Mitigations must be approved before launch
- Timeline for fixing deferred issues must be specified
- Executive sign-off required for deferred critical issues

## Post-Launch Monitoring Requirements
- Health check endpoints monitored
- Error rate alerting (>0.5% is critical)
- Database query performance monitoring
- API response time monitoring (p99 target)
- Security event logging and monitoring
- Crash/exception tracking enabled
- User session monitoring

## Rollback Procedures
- Must be documented and tested
- Rollback decision criteria must be clear
- Timeline to rollback decision: 1 hour post-launch
- Database migration rollback strategy required
- Feature flag rollout strategy if applicable
- Communication plan for rollback notification

## Launch Sign-Off
- Governance approval must be signed by governance agent
- Timestamp of approval required
- Conditions attached to approval
- Post-launch responsibilities defined
- Escalation contacts identified

## Deferred Issues Tracking
- All deferred items must have explicit due dates
- Deferred issues must be tracked in issue management system
- No indefinite deferrals allowed
- Critical deferred items require executive approval
- Monthly review of deferred items required

## Handoff to Operations
- Operations team must be notified of launch
- Monitoring dashboards must be prepared
- Runbooks for common issues must be available
- On-call escalation procedures established
- Status page updates configured
- Customer communication templates prepared
