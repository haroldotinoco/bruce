# Builder SaaS — Stage Gates

## 1. Purpose of this document

This document defines the **stage gates** of Builder SaaS.

Its purpose is to establish:
- the formal control points of the workflow;
- the minimum criteria for advancement;
- the blockers that prevent promotion;
- rework conditions;
- criteria for accepting residual risk;
- the scoring logic per stage.

The central objective is to prevent a build from advancing just because “something is working.”
Stage promotion must depend on **business adherence, functional consistency, technical quality, security, and real evidence of functionality**.

---

## 2. Principles of stage gates

The stage gates of Builder SaaS follow the following principles:

### 2.1. Nothing advances by inertia
All progression requires explicit validation.

### 2.2. Score helps, but doesn't decide alone
The score guides the decision, but does not replace qualitative blockers.

### 2.3. Critical failures block the flow
No high score compensates for an open critical problem.

### 2.4. Rework is a natural part of the system
Going back a step does not mean process failure; it means discipline.

### 2.5. Residual debt is only acceptable if conscious
Residual problems must be catalogued, classified, and accepted by governance.

---

## 3. Overview of gates

The Builder SaaS flow should be controlled by the following gates:

1. Intake Readiness Gate
2. Business Alignment Gate
3. Behavior Clarity Gate
4. Design Fidelity Gate
5. Functional Revalidation Gate
6. Architecture Completeness Gate
7. Backend Validity Gate
8. Backend Security Gate
9. Frontend Functional Fidelity Gate
10. End-to-End Behavioral Validation Gate
11. Cross-Layer Consolidation Gate
12. Final Governance Approval Gate

Each gate evaluates a different dimension of the build and prevents the process from continuing with serious inconsistencies.

```
Gate 1          Gate 2           Gate 3           Gate 4           Gate 5
Intake    ────► Business   ────► Behavior   ────► Design     ────► Functional
Readiness       Alignment        Clarity          Fidelity         Revalidation
                                                                       │
    ┌──────────────────────────────────────────────────────────────────┘
    ▼
Gate 6          Gate 7           Gate 8           Gate 9           Gate 10
Architecture ─► Backend    ────► Backend    ────► Frontend   ────► End-to-End
Completeness    Validity         Security         Fidelity         Validation
                                                                       │
    ┌──────────────────────────────────────────────────────────────────┘
    ▼
Gate 11         Gate 12
Cross-Layer ──► Final Governance ──► PROMOTE TO GTM
Consolidation   Approval

At each gate:  95+ → advance  |  85-94 → advance w/ caveats  |  70-84 → rework  |  <70 → blocked
               Critical issue at any score → BLOCKED
```

---

## 4. General score logic

Each gate should assign a local score, preferably on a scale of 0 to 100.

### Suggested operational ranges
- **95 to 100** → ready for advancement
- **85 to 94** → advancement allowed with controlled pending items
- **70 to 84** → mandatory rework
- **below 70** → blocked

### Important rule
Even with a score above 95, the build can be blocked if there is:
- critical failure;
- serious divergence from the venture's proposal;
- severe security violation;
- main flow broken;
- structural inconsistency between artifacts.

---

## 5. Gate 1 — Intake Readiness

## 5.1. Objective
Ensure that the build has received sufficient inputs to begin work.

## 5.2. What this gate validates
- minimum clarity of the venture;
- availability of branding inputs;
- defined build objective;
- defined technology stack or direction;
- established quality target;
- intelligible initial scope.

## 5.3. Evaluated artifacts
- Build Intake Summary
- Venture Package
- Brand Package
- Build Scope Draft

## 5.4. Minimum criteria for advancement
- the venture's proposal is understandable;
- there is an explicit main hypothesis;
- there is a clear goal of what needs to be built;
- branding and context are available;
- there is no impeditive ambiguity about macro scope.

## 5.5. Blockers
- poorly defined venture;
- absence of main hypothesis;
- absence of minimum brand inputs;
- contradictory or incomplete build objective;
- scope impossible to interpret.

## 5.6. Possible outputs
- `approved`
- `approved_with_notes`
- `rework_required`
- `blocked`

---

## 6. Gate 2 — Business Alignment

## 6.1. Objective
Ensure that the proposed solution is aligned with the thesis defined in Venture SaaS.

## 6.2. What this gate validates
- adherence to the main problem;
- adherence to target audience;
- adherence to value proposition;
- coherence with business logic;
- absence of relevant functional deviation.

## 6.3. Evaluated artifacts
- Business Fit Review
- Functional Alignment Notes

## 6.4. Minimum criteria for advancement
- the solution clearly responds to the central problem;
- the main flow makes sense for the target audience;
- the value proposition is represented intelligibly;
- there is no serious incoherence between venture and proposed solution.

## 6.5. Blockers
- solution solves a different problem than defined;
- product proposal disconnected from business;
- target audience poorly represented;
- functional assumptions incompatible with venture.

## 6.6. Possible outputs
- `approved`
- `rework_required`
- `blocked`

---

## 7. Gate 3 — Behavior Clarity

## 7.1. Objective
Ensure that the expected product behavior is documented in a testable way.

## 7.2. What this gate validates
- clarity of main flows;
- definition of scenarios;
- definition of behavior rules;
- definition of alternative flows;
- definition of error flows;
- ability to derive tests from the documentation.

## 7.3. Evaluated artifacts
- Behavior Specification
- BDD Scenarios
- Flow Map

## 7.4. Minimum criteria for advancement
- main scenarios are documented;
- there is clarity about success and error;
- flows are understandable and verifiable;
- expected behavior can guide design, backend, frontend, and tests.

## 7.5. Blockers
- vague or contradictory flows;
- absence of critical scenarios;
- insufficient documentation to guide implementation;
- inability to derive tests from the material.

## 7.6. Possible outputs
- `approved`
- `approved_with_notes`
- `rework_required`
- `blocked`

---

## 8. Gate 4 — Design Fidelity

## 8.1. Objective
Ensure that wireframes and layout correctly represent the expected behaviors and respect the brand direction.

## 8.2. What this gate validates
- coherence between design and BDD;
- coherence between layout and branding;
- clarity of navigation;
- representativeness of critical flows;
- minimum visual consistency.

## 8.3. Evaluated artifacts
- Wireframe Package
- UX Layout Proposal
- Screen Map

## 8.4. Minimum criteria for advancement
- main flows are represented in screens;
- design respects the defined identity;
- navigation is understandable;
- important states are contemplated;
- visual structure is sufficient to guide implementation.

## 8.5. Blockers
- design does not represent expected behavior;
- absence of critical screens or states;
- serious inconsistency with BrandAid;
- pretty wireframe, but functionally incomplete.

## 8.6. Possible outputs
- `approved`
- `approved_with_notes`
- `rework_required`
- `blocked`

---

## 9. Gate 5 — Functional Revalidation

## 9.1. Objective
Ensure that the combination of behavior + design remains faithful to the venture before moving into architecture and implementation.

## 9.2. What this gate validates
- alignment between business, BDD, and wireframe;
- consistency of main flow;
- absence of deviation introduced in UX and design stages.

## 9.3. Evaluated artifacts
- Functional Revalidation Report
- Behavior Specification
- Wireframe Package

## 9.4. Minimum criteria for advancement
- the final proposed solution remains adherent to the venture's objective;
- visible flows make sense as a representation of the thesis;
- no relevant functional losses between intention and proposal.

## 9.5. Blockers
- design changed the solution character;
- documented behavior and interface diverge seriously;
- visual proposal induces wrong or incomplete use.

## 9.6. Possible outputs
- `approved`
- `rework_required`
- `blocked`

---

## 10. Gate 6 — Architecture Completeness

## 10.1. Objective
Ensure that the technical solution covers everything the product needs to do, including what does not appear in the wireframe.

## 10.2. What this gate validates
- coverage of visible flows;
- coverage of invisible flows;
- modeling of entities and business rules;
- necessary integrations;
- authentication and authorization;
- webhooks, jobs, events, and automations;
- minimum observability;
- error handling;
- overall architectural risk.

## 10.3. Evaluated artifacts
- Solution Architecture Document
- Integration Map
- Invisible Flows Inventory
- Delivery Plan

## 10.4. Minimum criteria for advancement
- architecture covers end-to-end solution;
- invisible flows are mapped;
- critical integrations are contemplated;
- business rules are reflected;
- no serious structural gaps exist.

## 10.5. Blockers
- absence of invisible flows coverage;
- incomplete architecture;
- critical integrations ignored;
- business rules not modeled;
- severe structural risks not addressed.

## 10.6. Possible outputs
- `approved`
- `approved_with_notes`
- `rework_required`
- `blocked`

---

## 11. Gate 7 — Backend Validity

## 11.1. Objective
Ensure that the backend works in a real way, not just theoretically.

## 11.2. What this gate validates
- real availability of endpoints;
- functioning of critical flows;
- coherence between contract and execution;
- correct error behavior;
- basic functioning of integrations;
- integrity of business rules;
- real usability by interface and tests.

## 11.3. Evaluated artifacts
- Backend Codebase
- Endpoint Inventory
- API Contract
- API Execution Report
- Endpoint Validation Report

## 11.4. Minimum criteria for advancement
- main endpoints respond correctly;
- main business flow works through real calls;
- relevant errors are handled;
- API is usable for frontend and tests.

## 11.5. Blockers
- critical endpoint unavailable;
- central business rule broken;
- serious divergence between contract and implementation;
- structural error in authentication or persistence;
- central flow impossible to execute.

## 11.6. Possible outputs
- `approved`
- `approved_with_residual_issues`
- `rework_required`
- `blocked`

---

## 12. Gate 8 — Backend Security

## 12.1. Objective
Ensure that the backend base does not carry critical risk before continuing build promotion.

## 12.2. What this gate validates
- authentication;
- authorization;
- data exposure;
- input validation;
- secrets handling;
- attack surface;
- known vulnerabilities;
- critical weaknesses;
- assisted pentest findings or equivalent.

## 12.3. Evaluated artifacts
- Security Audit Report
- Risk Register
- Security Issues List

## 12.4. Minimum criteria for advancement
- no open critical findings;
- basic protection mechanisms are implemented;
- residual risk exposure is understood;
- medium/low failures are catalogued.

## 12.5. Blockers
- critical vulnerability;
- broken authentication;
- insufficient authorization on sensitive resources;
- improper data exposure;
- unsafe secrets handling;
- severe risk without mitigation.

## 12.6. Possible outputs
- `approved`
- `approved_with_residual_issues`
- `rework_required`
- `blocked`

---

## 13. Gate 9 — Frontend Functional Fidelity

## 13.1. Objective
Ensure that the interface correctly implements what was defined in design, branding, and expected behavior.

## 13.2. What this gate validates
- adherence to wireframe;
- visual consistency with brand;
- fidelity of main flows;
- navigation behavior;
- relevant states;
- messages;
- error handling;
- functional integration with backend.

## 13.3. Evaluated artifacts
- Frontend Codebase
- UI Implementation Report
- Frontend Mapping Notes

## 13.4. Minimum criteria for advancement
- main flows are implemented;
- interface is coherent with visual proposal;
- navigation works;
- critical states are present;
- frontend can operate with backend.

## 13.5. Blockers
- main flow not implemented;
- serious divergence with design or BDD;
- interface unusable;
- main integration broken;
- visual/functional behavior incompatible with venture.

## 13.6. Possible outputs
- `approved`
- `approved_with_residual_issues`
- `rework_required`
- `blocked`

---

## 14. Gate 10 — End-to-End Behavioral Validation

## 14.1. Objective
Ensure that the product works end-to-end according to the scenarios defined in behavior.

## 14.2. What this gate validates
- real execution of critical flows;
- adherence to BDD;
- expected success behavior;
- expected error behavior;
- consistency between backend, frontend, and experience;
- navigability;
- minimum robustness in real/simulated use.

## 14.3. Evaluated artifacts
- Frontend Test Report
- Beta Findings Report
- UX Divergence Report
- Test Execution Logs

## 14.4. Minimum criteria for advancement
- main BDD scenarios pass;
- central flow can be executed end-to-end;
- relevant divergences are recorded;
- residual failures do not prevent use for controlled testing.

## 14.5. Blockers
- critical flow fails end-to-end;
- central behavior diverges from BDD;
- serious regressions;
- experience broken in real navigation;
- product impossible to use for validation.

## 14.6. Possible outputs
- `approved`
- `approved_with_residual_issues`
- `rework_required`
- `blocked`

---

## 15. Gate 11 — Cross-Layer Consolidation

## 15.1. Objective
Ensure that all problems and evidence have been consolidated in a structured way before the final decision.

## 15.2. What this gate validates
- consolidation of issues by severity;
- traceability between problem and origin;
- distinction between blockers and residual debt;
- existence of rework plan when necessary;
- clarity about the real state of the build.

## 15.3. Evaluated artifacts
- Unified Issue Backlog
- Severity Matrix
- Rework Plan

## 15.4. Minimum criteria for advancement
- all relevant issues are recorded;
- severities are assigned;
- blockers are explicit;
- residual risks are understood;
- there is clear vision of what still needs to be done.

## 15.5. Blockers
- critical issues without tracking;
- inconsistent backlog;
- absence of problem consolidation;
- final score based on incomplete information.

## 15.6. Possible outputs
- `approved`
- `rework_required`
- `blocked`

---

## 16. Gate 12 — Final Governance Approval

## 16.1. Objective
Make the final decision about the build.

## 16.2. What this gate validates
- consolidated score;
- presence or absence of blockers;
- residual risk;
- adherence to round objective;
- readiness for promotion to GTM;
- cost-benefit of continuing iteration now versus promoting.

## 16.3. Evaluated artifacts
- Final Score Report
- Build Governance Decision
- Promotion Recommendation
- Unified Issue Backlog
- Risk Register

## 16.4. Minimum criteria for promotion
- overall score within the required minimum range;
- absence of critical blockers;
- central flow working end-to-end;
- backend and frontend validated;
- residual risk known and acceptable;
- build usable for next stage.

## 16.5. Possible decisions
- `approved`
- `approved_with_residual_issues`
- `rework_required`
- `blocked`

## 16.6. Blockers
- any open critical issue;
- score below required minimum;
- serious inconsistency between artifacts;
- build not usable for stated objective;
- unacceptable operational or security risk.

---

## 17. Rework logic

## 17.1. When rework is mandatory
Rework should be required when:
- score falls below acceptable minimum range;
- there is a `critical` issue;
- there is excessive concentration of `high` issues;
- a central flow is broken;
- business adherence is compromised.

## 17.2. Partial rework
Whenever possible, rework should be localized.

Examples:
- go back to architecture;
- go back to backend;
- go back to frontend;
- go back to behavior;
- go back to design.

## 17.3. Total rework
Should only occur when there is broad structural failure or systemic inconsistency between multiple layers.

---

## 18. Acceptance of residual risk

Not every problem needs to block promotion.

Residual problems can be accepted when:
- they don't affect the main flow;
- they don't represent critical risk;
- they are documented;
- they have a resolution plan;
- they are compatible with the round's objective.

### Typical examples of acceptable residual risk
- minor visual inconsistencies;
- small non-critical bugs in secondary flows;
- controlled technical debt;
- non-essential UX adjustments.

### Examples of unacceptable residual risk
- authentication failures;
- data corruption;
- main flow broken;
- information leakage;
- critical error in central integrations.

---

## 19. Minimum criteria for GTM promotion

A build can only be promoted to GTM when:

- the venture's proposal is correctly represented;
- main BDD scenarios have been validated;
- central endpoints work in real calls;
- interface works in real navigation;
- critical security risks have been addressed;
- residual backlog is explicit;
- governance considers the product ready for external testing.

---

## 20. Operational summary of gates

### Gate 1
**Name:** Intake Readiness
**Central question:** Do we have sufficient inputs to begin?
**Advances when:** venture, branding, objective, and initial scope are clear.
**Blocks when:** essential inputs are missing or build is not intelligible.

### Gate 2
**Name:** Business Alignment
**Central question:** Does the solution remain faithful to the business?
**Advances when:** the proposal clearly addresses the problem, audience, and value of the venture.
**Blocks when:** there is relevant deviation between solution and business thesis.

### Gate 3
**Name:** Behavior Clarity
**Central question:** Is expected behavior described in a testable way?
**Advances when:** scenarios, flows, errors, and rules are clear enough to guide design, engineering, and testing.
**Blocks when:** it is not possible to derive implementation and validation from the documentation.

### Gate 4
**Name:** Design Fidelity
**Central question:** Does design correctly represent behavior and brand?
**Advances when:** wireframes, navigation, and visual structure reflect expected flows and BrandAid.
**Blocks when:** there are critical UX gaps, inconsistency with branding, or functional deviation.

### Gate 5
**Name:** Functional Revalidation
**Central question:** Is the proposed solution still faithful to the venture after UX and design?
**Advances when:** behavior, interface, and business remain coherent with each other.
**Blocks when:** design and behavior change the solution character.

### Gate 6
**Name:** Architecture Completeness
**Central question:** Does architecture cover everything the solution needs to do?
**Advances when:** technical design contemplates visible and invisible flows, integrations, basic security, and business rules.
**Blocks when:** there are serious structural gaps.

### Gate 7
**Name:** Backend Validity
**Central question:** Does backend actually work?
**Advances when:** endpoints and central flows work in real calls.
**Blocks when:** API does not support real solution functionality.

### Gate 8
**Name:** Backend Security
**Central question:** Does backend present critical risk?
**Advances when:** there are no open critical vulnerabilities and residual risk is controlled.
**Blocks when:** there is serious fragility in authentication, authorization, data, or secrets.

### Gate 9
**Name:** Frontend Functional Fidelity
**Central question:** Does interface correctly implement what was defined?
**Advances when:** main experience is functional, coherent with design, branding, and backend.
**Blocks when:** frontend is broken, incomplete, or misaligned.

### Gate 10
**Name:** End-to-End Behavioral Validation
**Central question:** Does product work end-to-end as promised?
**Advances when:** main BDD scenarios pass in real tests.
**Blocks when:** critical flow fails in real use.

### Gate 11
**Name:** Cross-Layer Consolidation
**Central question:** Do we know exactly what's ready, what's wrong, and what's still missing?
**Advances when:** issues, severities, risks, and residual backlog are consolidated and traceable.
**Blocks when:** build is being evaluated with incomplete or inconsistent information.

### Gate 12
**Name:** Final Governance Approval
**Central question:** Does this build deserve to be promoted?
**Advances when:** score, risk, functionality, and overall adherence indicate sufficient readiness for GTM.
**Blocks when:** there are critical blockers, insufficient score, or unacceptable risk.

---

## 21. Summarized decision table per gate

| Gate | Ideal score | Minimum score with caveats | Mandatory rework | Absolute blocker |
|------|-------------|-----------------------------|--------------------|------------------|
| Intake Readiness | 95+ | 85+ | 70–84 | <70 or critical input missing |
| Business Alignment | 95+ | 85+ | 70–84 | serious business deviation |
| Behavior Clarity | 95+ | 85+ | 70–84 | impossible to derive tests |
| Design Fidelity | 95+ | 85+ | 70–84 | design doesn't represent solution |
| Functional Revalidation | 95+ | 85+ | 70–84 | serious incoherence between business, behavior, and design |
| Architecture Completeness | 95+ | 85+ | 70–84 | critical invisible flows absent |
| Backend Validity | 95+ | 85+ | 70–84 | critical endpoint or flow broken |
| Backend Security | 95+ | 85+ | 70–84 | open critical vulnerability |
| Frontend Functional Fidelity | 95+ | 85+ | 70–84 | main flow not implemented |
| End-to-End Behavioral Validation | 95+ | 85+ | 70–84 | critical scenario failing |
| Cross-Layer Consolidation | 95+ | 85+ | 70–84 | absence of reliable build vision |
| Final Governance Approval | 95+ | 85+ | 70–84 | critical blocker or unacceptable risk |

---

## 22. Promotion rules between gates

### 22.1. Direct promotion
A build can advance directly to the next gate when:
- it reaches sufficient score;
- it has no blocker;
- it has no relevant structural incoherence;
- residual risks are low or controlled.

### 22.2. Promotion with caveats
A build can advance with controlled pending items when:
- the gate was approved with acceptable intermediate score;
- pending items do not compromise main flow;
- issues are recorded and classified;
- there is a follow-up plan.

### 22.3. Prohibited promotion
A build cannot advance when:
- there is an absolute blocker;
- score is below operational minimum;
- next artifact would depend on false premises;
- there is relevant risk of amplifying error in next stage.

---

## 23. Systemic blocking rules

Some problems should block the flow regardless of the stage.

### 23.1. Universal blockers
- absence of clear business hypothesis;
- main flow impossible to execute;
- serious divergence between venture and solution;
- authentication or authorization compromised;
- critical vulnerability with real impact;
- absence of traceability about build state;
- serious inconsistency between backend, frontend, and expected behavior.

### 23.2. Effect of universal blockers
When a universal blocker appears:
- build cannot be promoted;
- Build Governance Agent must issue formal decision;
- correction must gain maximum priority;
- final score must reflect the blocker.

---

## 24. Rules for residual backlog

Residual backlog should only exist when it does not compromise the round's objective.

### 24.1. An issue can become residual backlog when:
- it doesn't affect main flow;
- it doesn't create critical risk;
- it doesn't compromise structural security;
- it doesn't prevent the intended learning of the round;
- it is fully documented.

### 24.2. Residual backlog must contain
- clear problem description;
- severity;
- impact;
- reason for non-blocker status;
- correction recommendation;
- suggested priority for next round.

### 24.3. Residual backlog cannot contain
- critical authentication failures;
- serious data corruption or inconsistency;
- main flow broken;
- severe security risk;
- structural failure of central integration.

---

## 25. Score acceptance rules

### 25.1. High score is not automatic approval
A build with 97 can be blocked if there is an open critical issue.

### 25.2. Intermediate score can be sufficient
A build with score 88 can be promoted to controlled GTM if:
- main flows work;
- there are no blockers;
- residual risks are acceptable;
- round is exploratory and low-risk.

### 25.3. Low score always requires action
Score below 85 requires at least structured re-evaluation, and below 70 requires blocking or heavy rework.

---

## 26. Final governance rules

Builder SaaS's final decision must always be formalized in a governance memo.

### 26.1. Final memo must record
- consolidated score;
- summary of main findings;
- existing blockers or absence thereof;
- accepted residual issues;
- decision justification;
- recommended next step.

### 26.2. Valid decisions
- `approved`
- `approved_with_residual_issues`
- `rework_required`
- `blocked`

### 26.3. Decision criterion
The decision should not reflect only technical quality, but also:
- adherence to round objective;
- acceptable risk;
- real readiness for GTM or new iteration;
- cost-benefit of insisting more before promoting.

---

## 27. Relationship between gates and Bruce learning

Stage gates exist not only to control quality.
They also exist to generate structured learning for Bruce.

Each gate should record:
- failure patterns;
- recurring types of issues;
- architecture bottlenecks;
- frequent deviations between venture and build;
- common security risks;
- most recurrent types of rework.

This history allows:
- improvement of Builder over time;
- improvement of previous modules;
- increase in healthy promotion rate;
- reduction of computational capital waste.

---

## 28. Maturity criterion for gate system

The stage gate system can be considered mature when:

1. no build advances without explicit validation;
2. blockers are detected early;
3. reworks are localized and traceable;
4. score and final decision reflect the real state of build;
5. residual backlog is controlled and doesn't hide serious failures;
6. system progressively reduces premature promotion of fragile builds.

---

## 29. Final definition

The **stage gates** system of Builder SaaS is the operational discipline mechanism that ensures a venture is only promoted when the resulting digital product reaches sufficient level of coherence, functionality, testability, security, and readiness.

Its role is not to delay delivery, but to **prevent Bruce from confusing “something built” with “something ready to be put into the world”**.