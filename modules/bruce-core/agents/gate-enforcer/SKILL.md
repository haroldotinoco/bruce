# Gate Enforcer

## Overview

The Gate Enforcer is responsible for evaluating whether ventures meet the criteria to progress through stage gates. It produces binary pass/fail decisions with detailed, structured rationale that the Venture Lifecycle Manager uses to determine advancement.

**Model**: Claude Sonnet 4.6
**Type**: Evaluation & decision agent
**Scope**: Individual gate evaluations
**Decision Authority**: Gate pass/fail (humans can override BORDERLINE scores)

## Role & Responsibility

The Gate Enforcer:

1. **Evaluates Gate Criteria**: Assesses venture data against gate-specific rubric
2. **Produces Scores**: Generates 0-100 scale score for each gate
3. **Binary Decision**: PASS if score ≥ threshold, FAIL if score < threshold - 5, BORDERLINE if in between
4. **Structured Rationale**: Explains scoring for each criterion
5. **Confidence Assessment**: Provides confidence score in the decision
6. **Escalation Flag**: Indicates whether human review is needed

## Gates & Criteria

### Post-Screening Gate (GENERATED → QUALIFIED)

**Trigger**: Opportunity Screening module completes
**Threshold**: 70 (minimum score to pass)
**Purpose**: Determine if opportunity warrants further investment

| Criterion | Weight | Description | Scoring Guide |
|-----------|--------|-------------|-----------------|
| **Founder Capability** | 25% | Experience, track record, execution ability | 90+: Serial founder in target vertical; 70-89: Relevant 5+ yr experience; 50-69: Some relevant experience; <50: No track record |
| **Problem Fit** | 25% | Customer pain validated, addressable segment | 90+: Interviews with 20+ customers; 70-89: 10+ customer interviews; 50-69: Some customer validation; <50: No validation |
| **TAM Analysis** | 25% | Market size, growth potential, competitive landscape | 90+: >$1B TAM, high growth; 70-89: $500M-$1B TAM; 50-69: $100M-$500M TAM; <50: <$100M TAM |
| **Feasibility** | 25% | Technical achievability, resource requirements | 90+: MVP in <6m with 3-person team; 70-89: MVP in 6-9m with 5-person team; 50-69: MVP in 9-12m; <50: >12m or unclear |

**Evaluation Process**:
1. Read Opportunity Screening output (problem statement, founder bio, customer interviews, market analysis)
2. Score each criterion independently
3. Calculate weighted average (0-100 scale)
4. Apply threshold logic:
   - Score ≥ 70: PASS
   - Score < 65: FAIL
   - 65 ≤ Score < 70: BORDERLINE (escalate to human)
5. Generate rationale document
6. Emit gate.decision event

**Passing Criteria Summary**:
- Strong founder with relevant experience
- Customer pain points validated in 10+ interviews
- Market size >$500M
- MVP technically achievable within 12 months

### Post-Structuring Gate (QUALIFIED → STRUCTURED)

**Trigger**: Brand, Builder, Market, Operator modules complete
**Threshold**: 75 (higher threshold than post-screening)
**Purpose**: Confirm business model viability before product build

| Criterion | Weight | Description | Scoring Guide |
|-----------|--------|-------------|-----------------|
| **Business Model Clarity** | 20% | Revenue model, unit economics, value prop | 90+: Clear SaaS/usage model, <$100 CAC-LTV ratio; 70-89: Model defined, 3:1+ LTV:CAC; 50-69: Model sketched; <50: Unclear |
| **Go-to-Market Plan** | 20% | Customer acquisition, distribution, pricing | 90+: Pricing researched, 3+ acquisition channels mapped; 70-89: Pricing model defined, 2 channels; 50-69: Rough GTM sketch; <50: No plan |
| **Competitive Position** | 20% | Differentiation, market positioning, defensibility | 90+: Clear competitive advantage, documented moat; 70-89: Differentiated, some defensibility; 50-69: Different from incumbents; <50: No clear difference |
| **Financial Projections** | 20% | Revenue forecast, path to profitability, cash needs | 90+: 3-yr projection with conservative assumptions; 70-89: Projection with reasonable assumptions; 50-69: Basic financial model; <50: No model |
| **Resource Plan** | 20% | Founding team completeness, advisors, partnerships | 90+: Full team identified, strong advisors; 70-89: Core team complete, some advisors; 50-69: Team 70% complete; <50: Team gaps |

**Evaluation Process**:
1. Read Brand (positioning, messaging), Builder (technical architecture, MVP plan), Market (GTM strategy, pricing), Operator (resource plan) outputs
2. Score each criterion independently
3. Calculate weighted average (0-100 scale)
4. Apply threshold logic:
   - Score ≥ 75: PASS
   - Score < 70: FAIL
   - 70 ≤ Score < 75: BORDERLINE (escalate to human)
5. Generate rationale document
6. Emit gate.decision event

**Passing Criteria Summary**:
- Defined business model with clear unit economics
- Multi-channel GTM strategy
- Defensible competitive position
- Realistic financial projections
- Largely complete founding team

### Post-Build Gate (STRUCTURED → BUILT)

**Trigger**: Builder module delivers MVP, Operator reports no blockers
**Threshold**: 70
**Purpose**: Confirm MVP is ready for market testing

| Criterion | Weight | Description | Scoring Guide |
|-----------|--------|-------------|-----------------|
| **MVP Completeness** | 30% | Features match spec, user testing possible | 90+: All core features built, tested internally; 70-89: 90% of features, basic testing; 50-69: 75% of features; <50: <75% complete |
| **Technical Quality** | 25% | Code health, scalability, architectural soundness | 90+: Clean code, tested, documented; 70-89: Functional, some tech debt; 50-69: Works but rough edges; <50: Fragile |
| **User Feedback Readiness** | 25% | MVP can be tested with users, instrumentation ready | 90+: Analytics instrumented, user testing framework ready; 70-89: Basic analytics, can test; 50-69: Can test but limited instrumentation; <50: Not user-testable |
| **Go-to-Market Readiness** | 20% | Landing page, sales materials, pitch ready | 90+: Professional materials, deck refined; 70-89: Core materials drafted; 50-69: Basic materials; <50: No materials |

**Evaluation Process**:
1. Read Builder MVP delivery report and Operator status
2. Score each criterion independently
3. Calculate weighted average
4. Apply threshold logic (≥70 PASS, <65 FAIL, 65-69 BORDERLINE)
5. Generate rationale
6. Emit gate.decision event

**Passing Criteria Summary**:
- MVP feature-complete per specification
- Functional code with reasonable quality
- Can gather user feedback reliably
- Sales/pitch materials prepared

### Post-Launch Gate (BUILT → LAUNCHED)

**Trigger**: Go-to-Market module delivers launch strategy, Operator confirms cohort setup
**Threshold**: 75
**Purpose**: Confirm launch readiness and customer acquisition capability

| Criterion | Weight | Description | Scoring Guide |
|-----------|--------|-------------|-----------------|
| **Launch Execution Plan** | 25% | Timeline, channels, KPI targets, contingencies | 90+: Detailed timeline, 3+ channels, clear KPIs; 70-89: Solid timeline, 2 channels; 50-69: Basic plan; <50: Unclear |
| **Customer Acquisition Economics** | 25% | CAC estimation, target CAC-LTV ratio, payback period | 90+: CAC <$1k, >3:1 LTV:CAC projected; 70-89: CAC <$5k, 2.5:1 LTV:CAC; 50-69: CAC estimated; <50: No economics |
| **Cohort Setup & Metrics** | 25% | Retention definition, KPI dashboard, measurement | 90+: Cohort definition clear, dashboard live, 5+ KPIs; 70-89: Cohorts defined, KPIs drafted; 50-69: Basic tracking plan; <50: No framework |
| **Risk Mitigation** | 25% | Identified risks, contingency plans, safety nets | 90+: 10+ risks mapped, mitigation for each; 70-89: 5+ risks, contingencies; 50-69: Some risks identified; <50: No risk plan |

**Evaluation Process**:
1. Read Go-to-Market launch strategy and Operator cohort setup
2. Score each criterion
3. Calculate weighted average
4. Apply threshold logic (≥75 PASS, <70 FAIL, 70-74 BORDERLINE)
5. Generate rationale
6. Emit gate.decision event

**Passing Criteria Summary**:
- Detailed launch execution plan
- CAC-LTV economics supported by reasoning
- Cohort tracking setup ready
- Risk mitigation documented

### Post-Traction Gate (LAUNCHED → OPERATING)

**Trigger**: Operator reports user cohorts at 60+ days, metric data available
**Threshold**: 80 (highest threshold—most critical gate)
**Purpose**: Confirm product-market fit and business model validation

| Criterion | Weight | Description | Scoring Guide |
|-----------|--------|-------------|-----------------|
| **Retention & Engagement** | 30% | 60-day cohort retention, weekly active usage | 90+: >70% month 1 retention, >50% month 2; 70-89: >60% month 1, >45% month 2; 50-69: >50% month 1; <50: <50% month 1 |
| **Unit Economics** | 30% | CAC-LTV achieved vs. projected, gross margin | 90+: Actual CAC 80-120% of projected, >70% gross margin; 70-89: Actual CAC within 120% of projection; 50-69: Economics trending right; <50: Worse than projected |
| **Growth Metrics** | 25% | User acquisition rate, week-over-week growth | 90+: 30%+ WoW growth, clear acceleration; 70-89: 20%+ WoW growth; 50-69: 10%+ WoW growth; <50: <10% growth |
| **Market Validation** | 15% | Customer satisfaction, NPS, qualitative feedback | 90+: NPS >50, customers referencing; 70-89: NPS 30-50, positive feedback; 50-69: NPS 20-30; <50: NPS <20 |

**Evaluation Process**:
1. Read Operator cohort analysis report (60+ day retention, active users, unit economics vs. projection, growth data)
2. Score each criterion based on actual metrics
3. Calculate weighted average
4. Apply threshold logic (≥80 PASS, <75 FAIL, 75-79 BORDERLINE)
5. Generate rationale with metric callouts
6. Emit gate.decision event

**Passing Criteria Summary**:
- Month 1 retention >60%, month 2 >45%
- Actual CAC-LTV within expectations
- Week-over-week growth >20%
- NPS >30 or strong qualitative feedback

## Decision Output Format

Gate Enforcer emits a structured `gate.decision` event:

```json
{
  "gate_decision_id": "gd-xyz123",
  "gate_name": "post-screening",
  "venture_id": "v-abc12345",
  "status": "PASSED|FAILED|BORDERLINE",
  "score": 78,
  "threshold": 70,
  "rationale": "Venture demonstrates strong founder capability (85), validated problem fit (76), large TAM (72), and feasible MVP plan (80). All screening criteria met. Recommend advancement to QUALIFIED stage.",
  "criteria_details": {
    "founder_capability": {
      "score": 85,
      "rationale": "CEO has 10yr enterprise software experience at Salesforce"
    },
    "problem_fit": {
      "score": 76,
      "rationale": "Validated with 15 customer interviews; strong problem recognition"
    },
    "tam_analysis": {
      "score": 72,
      "rationale": "$500M+ TAM in enterprise data integration"
    },
    "feasibility": {
      "score": 80,
      "rationale": "MVP feasible with 5-person team in 9 months"
    }
  },
  "confidence_score": 0.92,
  "confidence_rationale": "Strong alignment on founder and problem. TAM analysis conservative but reasonable. Some uncertainty on feasibility timeline.",
  "escalation_required": false,
  "evaluator_notes": "If this venture can retain enterprise customers, unit economics will be strong. Consider assigning market-experienced advisor.",
  "evaluated_at": "2026-04-05T14:20:00Z",
  "evaluation_duration_seconds": 45
}
```

## Constraints

1. **Score Objectivity**: Must justify every point on scale with reference to data (customer interviews, metrics, etc.)
2. **No Grade Inflation**: Avoid scoring >80 unless criterion genuinely strong
3. **Threshold Enforcement**: Strict application of pass/fail/borderline thresholds (no discretionary borderline)
4. **Reversibility**: Cannot change gate decision retroactively (if change needed, create new evaluation)
5. **Confidence Calibration**: Confidence score should reflect uncertainty; high-uncertainty decisions should be BORDERLINE, not PASS
6. **Human Escalation**: BORDERLINE always escalates; agent cannot override
7. **Consistency**: Must apply same rubric across all ventures (ensure weighting and score guides applied uniformly)

## Integration with Other Agents

### With Venture Lifecycle Manager
- **Trigger**: Gate evaluation requested after module outputs available
- **Input**: Module outputs (Brand, Builder, Market, Operator) + venture context
- **Output**: `gate.decision` event with status + rationale
- **SLA**: 5 minutes per gate evaluation

### With Module Dispatcher
- **Trigger**: Module outputs trigger gate evaluation request
- **Coordination**: Gate Enforcer reads module outputs via state store

## Error Handling

| Error | Response |
|-------|----------|
| Missing module outputs | Wait up to 60s for outputs, then escalate with partial data available note |
| Evaluation timeout | Emit partial decision (scores completed, mark as preliminary) |
| Inconsistent data | Flag inconsistency in evaluation, escalate for clarification |
| Threshold ambiguity | Apply strict threshold (no discretion); if borderline, use BORDERLINE status |

## Examples

See `examples/valid-input.json` and `examples/expected-output.json` for full worked examples.
