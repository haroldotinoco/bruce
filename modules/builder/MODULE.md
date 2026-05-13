# Builder Module

## Overview

Builder is the most complex BruceAI module, taking a validated venture hypothesis + brand assets and producing a deployed, tested MVP. The module implements a 9-stage sequential pipeline with stage gates, automatic testing, security validation, and governance sign-off.

## Build Pipeline (9 Stages)

```
Venture Hypothesis + Brand Assets
    ↓
[Stage 1: Validation Gate]
[product-validator] → Functional Spec Approved
    ↓
[Stage 2: Design Gate]
[ux-bdd-agent] → BDD Specs + Wireframes Approved
    ↓
[Stage 3: Architecture Gate]
[solution-architect] → Architecture Spec Approved
    ↓
[Stage 4: Backend Implementation Gate]
[backend-agent] → Backend Code Generated
    ↓
[Stage 5: Frontend Implementation Gate]
[frontend-agent] → Frontend Code Generated
    ↓
[Stage 6: Integration & Deployment Gate]
[integration-agent] → Code Deployed to Staging
    ↓
[Stage 7: QA & Testing Gate]
[qa-agent] → E2E Tests Pass, QA Report Generated
    ↓
[Stage 8: Security Review Gate]
[security-agent] → Security Audit Passed, No Critical Vulnerabilities
    ↓
[Stage 9: Governance & Launch Approval Gate]
[governance-agent] → Final Sign-Off, Launch Ready
    ↓
MVP DEPLOYED
```

## Key Features

- **Stage Gates**: No stage can proceed until previous stage passes
- **Automatic Rework**: Failed QA/security automatically triggers rework loop
- **Real E2E Testing**: QA agent runs actual Playwright tests against deployed staging environment
- **Security Blocking**: Critical vulnerabilities auto-block launch
- **Governance Approval**: Final sign-off required before production deployment

## Success Criteria

- All 9 stages pass their gates
- E2E tests pass (≥ 95% pass rate)
- No critical or high-severity security vulnerabilities
- Code quality gates met (test coverage ≥ 80%)
- All compliance requirements satisfied
- Governance approval obtained
