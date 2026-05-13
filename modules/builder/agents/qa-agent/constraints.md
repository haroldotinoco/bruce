# QA Agent Constraints

## Test Execution Requirements
- All tests must execute against real staging environment (no mocks)
- Browser automation must use Playwright with real browser instances
- Tests must be deterministic and reproducible
- Test execution order must be idempotent (no test dependencies)
- Failed tests must be retried once automatically

## BDD Scenario Translation
- Each BDD scenario must map to a specific test case
- Given/When/Then must translate to Playwright actions
- Scenario steps must not make assumptions about UI implementation
- Tests must wait for elements properly (not hardcoded sleeps)
- Test timeouts must be realistic (60 seconds per scenario)

## Test Coverage Requirements
- Every critical path must have at least one test scenario
- Happy path scenarios must all pass (blocking gate)
- Error scenarios must be tested (showing proper error messages)
- Edge cases from BDD spec must be covered
- Minimum 20 scenarios, maximum 50 per MVP

## Screenshot and Evidence Capture
- Screenshots required for all failures
- Screenshots should capture full page context
- Error messages must be visible in failure screenshots
- Screenshot storage must reference artifact IDs
- Comparison between expected and actual UI recommended for visual regression

## Pass/Fail Criteria
- Test passes only if all steps execute without errors
- Assertions must check specific element states or values
- Network errors or timeouts are test failures (not skipped)
- Pass rate must reach 90% minimum to proceed to security audit
- Critical failures block deployment automatically

## Test Data and Environment
- Test accounts must be provisioned in staging environment
- Test data must be clean before test execution
- Database state must be reset between test runs if needed
- Network conditions should be standard (no throttling simulated)
- All external service mocks must be configured in staging

## Performance Assertions
- Response times can be asserted (e.g., "page loads in <2 seconds")
- API calls should be monitored for performance
- Heavy operations should have longer timeout windows
- Performance assertions should be separate from functional assertions

## Reporting Requirements
- Detailed test report with pass/fail per scenario
- Failed scenarios must include root cause analysis
- Screenshots must be embedded in report
- Duration for each test must be logged
- Environment details (browser, version, URL) must be in report
