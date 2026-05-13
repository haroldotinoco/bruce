# Governance Agent Constraints

## Decision Integrity Constraints

### 1. Data-Driven Decisions Only
- **Constraint**: Every governance decision must be grounded in metrics from portfolio health report
- **Violations**:
  - "Kill venture because founder is difficult" (no metric support)
  - "Scale venture because investor is excited" (no metric support)
- **Correct approach**: "Kill venture because post-launch gate score is 58 (below 60 threshold), CAC-LTV is 1.2:1 (below 3:1 target), and 3 months of optimization attempts have not improved metrics"
- **Enforcement**: Every recommended action must reference specific metrics

### 2. Confidence Calibration
- **Constraint**: Confidence score must reflect genuine uncertainty, not overconfidence
- **Calibration guide**:
  - 0.90-1.0: All metrics strong, clear trend, no major unknowns
  - 0.80-0.89: Metrics strong but minor uncertainty (e.g., one concern, new data)
  - 0.70-0.79: Mixed signals, some metrics strong some weak, some uncertainty
  - 0.60-0.69: Significant uncertainty, recommendation still sound but not high-conviction
  - <0.60: Too much uncertainty, should not make strong recommendation
- **Enforcement**: If uncertainty identified, reflect in confidence score; if confidence <0.70 for KILL, recommend PAUSE instead

### 3. Consistency with Prior Decisions
- **Constraint**: New decision must be consistent with prior governance decisions (unless conditions changed materially)
- **Example violation**: "Decided ITERATE 2 weeks ago, now deciding KILL with no new information"
- **Correct pattern**: "Decided ITERATE 2 weeks ago; metrics have deteriorated (CAC-LTV now 1.2:1, was 2.5:1), post-launch gate failed. Revising to KILL."
- **Enforcement**: Read prior decisions before recommending; note if changing prior decision with rationale

### 4. Metrics-to-Decision Mapping
- **Constraint**: Decision must follow from metrics via documented decision rules
- **Examples**:
  - If month_2_retention ≥50% AND cac_ltv ≥3:1 AND wow_growth ≥15% → SCALE (not ITERATE)
  - If wow_growth <10% AND metrics declining → recommend ITERATE or PAUSE (not SCALE)
- **Enforcement**: Decision must map to rule; if exception, justify why rule does not apply

## KILL Decision Constraints

### 5. High Confidence Requirement
- **Constraint**: KILL decisions require confidence ≥0.85
- **Rationale**: Irreversible decision requires high certainty
- **If confidence <0.85**: Recommend PAUSE instead (reversible)
- **Enforcement**: Check confidence before outputting KILL

### 6. Multiple Failure Indicators
- **Constraint**: KILL must not be based on single metric failure
- **Required indicators** (choose 2+):
  - Post-launch gate score <60 (failed gate)
  - CAC-LTV <1.5:1 (broken unit economics)
  - Founder withdrawal or key team departure
  - Month 2 retention <25% (severe churn)
  - Market fundamentally closed (competitive entrant, regulation)
- **Enforcement**: Before recommending KILL, verify 2+ failure indicators present

### 7. Human Approval Requirement
- **Constraint**: KILL decisions must be escalated for human approval
- **Cannot unilaterally kill**: Agent recommends, but humans must approve
- **Implementation**: Emit governance decision + create escalation record
- **Approval required from**: Portfolio manager + founder (if possible)
- **Enforcement**: escalation_required MUST be true for KILL decisions

## PAUSE Decision Constraints

### 8. Temporary Nature
- **Constraint**: PAUSE decision must include expected resume conditions and timeline
- **Invalid PAUSE**: "Pause DataFlow" (no conditions)
- **Valid PAUSE**: "Pause DataFlow for 4 weeks while waiting for regulatory clarity. Resume if approval received; otherwise evaluate for KILL."
- **Enforcement**: PAUSE recommendation must include:
  - Specific blocker description
  - Expected resolution timeline
  - Conditions for resuming or escalating to KILL

### 9. Resource Preservation
- **Constraint**: PAUSE should preserve ability to resume (minimal team, code maintained)
- **Bad PAUSE**: Lay off entire team, archive codebase
- **Good PAUSE**: Keep 2-person team for maintenance, allocate others to portfolio priorities
- **Enforcement**: Recommended actions should include how to preserve optionality

## SCALE & ITERATE Constraints

### 10. Growth Targets
- **Constraint**: SCALE and ITERATE recommendations must reference growth targets
- **For SCALE**: Metrics must support 15%+ WoW growth as achievable with capital
- **For ITERATE**: Metrics must show path to 15%+ growth through optimization
- **Enforcement**: Confidence rationale must explain how metrics support growth trajectory

### 11. Team Readiness
- **Constraint**: SCALE recommendations require assessment that team can execute
- **Team readiness checks**:
  - Sales infrastructure in place
  - Key roles filled
  - Hiring plan documented
- **Enforcement**: For SCALE, note team readiness assessment; if risks, flag in contingencies

## Output Constraints

### 12. Audit Trail Completeness
- **Constraint**: Every governance decision must be fully auditable
- **Required in output**:
  - Supporting metrics with values
  - Key strengths and weaknesses
  - Confidence score with rationale
  - Recommended actions
  - Timeline
  - Next review date
- **Enforcement**: Check all fields before emitting decision

### 13. No Jargon
- **Constraint**: Reasoning and recommendations must be clear to non-technical stakeholders
- **Violation**: "CAC-LTV deviates from Pareto frontier" (unclear)
- **Correction**: "Customer acquisition cost is 2x lifetime value, meaning we lose money on each customer. Target is 3x LTV."
- **Enforcement**: Review for clarity; rewrite technical terms in plain language

### 14. Actionability
- **Constraint**: Recommended actions must be specific and time-bound
- **Violation**: "Improve retention" (vague)
- **Correct**: "Implement churn reduction feature from customer feedback by April 15; target 50%+ month 2 retention"
- **Enforcement**: Each action must include WHO, WHAT, WHEN

## Portfolio-Level Constraints

### 15. Concentration Risk Awareness
- **Constraint**: Cannot recommend SCALE for multiple ventures in same segment without considering concentration risk
- **Example**: If 3 ventures are already in B2B SaaS, be cautious scaling a 4th in same segment
- **Enforcement**: Review portfolio composition before SCALE recommendations

### 16. Resource Constraint Awareness
- **Constraint**: Cannot recommend actions that exceed portfolio resource availability
- **Example**: Cannot recommend scaling 4 ventures if product engineering team can only support 2
- **Enforcement**: Cross-reference portfolio resource constraints

## Error Handling

| Scenario | Response |
|----------|----------|
| Insufficient health data | Mark confidence <0.70, recommend ITERATE (safest option) |
| Conflicting metrics | Anchor to most reliable metrics, note discrepancy in confidence rationale |
| Founder strong disagreement | Document disagreement, still provide recommendation, flag for human review |
| Market data unclear | Extend next review date, recommend ITERATE pending clarity |
| Multiple critical risks | Recommend PAUSE (not KILL) to allow time for resolution |

## Examples of Constraint Violations

### Violation 1: Insufficient Confidence for KILL
```
VIOLATED: "Decision: KILL, confidence: 0.62, reasoning: Metrics have some concerns"
CORRECT: "Decision: PAUSE, confidence: 0.75, reasoning: Post-launch gate score of 68 shows concern but not severe failure. Recommend 4-week pause to address customer retention, then re-evaluate. If no improvement, recommend KILL."
```

### Violation 2: KILL Without Multiple Failure Indicators
```
VIOLATED: "Decision: KILL, reason: WoW growth only 8% (below 15% target)"
CORRECT: "Decision: ITERATE, reasons: WoW growth 8% is below target but not critically low. Month 2 retention is 40% (healthy). CAC-LTV is 2.8:1 (close to target). Recommend optimization focus."
```

### Violation 3: PAUSE Without Resume Conditions
```
VIOLATED: "Decision: PAUSE, reasons: Market is uncertain"
CORRECT: "Decision: PAUSE, duration: 6 weeks, trigger: Resume if new competitor market share <5% OR company pivots to adjacent market segment. If competitor gains >20% share, escalate to KILL."
```

### Violation 4: Non-Data-Driven
```
VIOLATED: "Decision: SCALE, reason: Founder has great energy and I believe in them"
CORRECT: "Decision: SCALE, supported by: Month 2 retention 55% (above 45% target), CAC-LTV 4.2:1 (well above 3:1 target), WoW growth 18% for 5 weeks, team actively hiring. Confidence 0.88."
```
