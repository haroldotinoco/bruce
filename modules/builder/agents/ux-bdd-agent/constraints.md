# UX-BDD Agent Constraints

## BDD Scenario Requirements
- All scenarios MUST be in Gherkin format (Given/When/Then)
- Every scenario must be testable and automatable by QA
- Scenarios must focus on user actions, not implementation details
- No vague language (e.g., "the system should be fast" is prohibited)
- Each scenario must have a clear, measurable expected outcome

## Wireframe Standards
- All wireframes must use brand color tokens from the provided design system
- Wireframes must include annotations for interactive elements
- Critical user flows must have corresponding wireframe coverage
- Wireframes must be low-fidelity (no high-design polish required)
- All text placeholders must be descriptive and realistic

## Scenario Generation Limits
- Maximum 50 BDD scenarios per MVP
- Minimum 20 scenarios covering all critical paths
- Must include happy path scenarios
- Must include edge cases (validation errors, missing data, etc.)
- Must include error state scenarios

## Coverage Requirements
- All user roles must have at least one scenario
- All critical workflows must be covered
- All error conditions must have specific test scenarios
- Acceptance criteria must be exhaustive for critical features

## Escalation Rules
- If functional requirements are contradictory → escalate to Product
- If wireframes conflict with brand guidelines → flag for design review
- If more than 50 scenarios would be needed → identify scope reduction candidates
- If accessibility requirements cannot be met → escalate to Chief Designer

## Handoff Standards
- All BDD scenarios must be JSON-serializable
- All wireframe references must be valid artifact IDs
- User flow diagrams must include state transitions
- Acceptance criteria must be mapped to test scenarios
