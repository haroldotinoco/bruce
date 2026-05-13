# AddVenture Structuring Policy

## Overview

The structuring pipeline transforms a scored opportunity into a complete 8-volume venture hypothesis dossier. This policy defines volume scope, quality standards, iteration limits, and completion criteria.

## Structuring Pipeline

### Sequential Volumes

| Volume | Agent | Role | Dependencies | Output |
|--------|-------|------|--------------|--------|
| 0 | Briefing Interpreter | Transform opportunity → briefing | Analyzed opportunity | Standardized briefing |
| 1 | Opportunity Analyst | Deep problem/market diagnosis | Briefing | Vol 1: Opportunity Diagnosis |
| 2 | Customer-Market Architect | Customer segmentation, JTBD | Vol 1 | Vol 2: Customer & Market Architecture |
| 3 | Value Proposition Designer | Value prop, differentiation | Vol 1, Vol 2 | Vol 3: Value Proposition Design |
| 4 | Business Model Modeler | Business model, unit economics | Vol 1, Vol 3 | Vol 4: Business Model |
| 5 | GTM Planner | Go-to-market, channel, launch | Vol 1-4 | Vol 5: Go-to-Market Strategy |
| 6 | Narrative Strategist | Positioning, messaging, brand | Vol 1-5 | Vol 6: Narrative Strategy |
| 7 | Risk Validation Analyst | Risks, validation roadmap, kill criteria | Vol 1-6 | Vol 7: Risk & Validation |
| 8 | Execution Roadmap Planner | 90-day roadmap, milestones, team | Vol 1-7 | Vol 8: Execution Roadmap |
| 9 (Meta) | Venture Critic | Reviews complete dossier, scores | All volumes | Critique result, score |
| 10 (Meta) | Dossier Composer | Assembles final structured dossier | All volumes | Final venture hypothesis |

## Volume Quality Standards

### Content Requirements by Volume

#### Vol 1: Opportunity Diagnosis
- **Word count**: 2,500-3,000
- **Sections**: Problem anatomy, market readiness, addressable market, macro context, opportunity thesis
- **Key output**: Clear thesis statement with supporting rationale
- **Confidence target**: 70-80+

#### Vol 2: Customer & Market Architecture
- **Word count**: 2,000-2,500
- **Sections**: Primary segment deep-dive, Jobs-to-be-Done, secondary segments, market architecture, willingness-to-pay analysis
- **Key output**: Customer segmentation model with prioritized go-to-market sequence
- **Confidence target**: 65-75+

#### Vol 3: Value Proposition Design
- **Word count**: 1,500-2,000
- **Sections**: Core value proposition, differentiation strategy, competitive positioning, feature/benefit mapping, positioning statement
- **Key output**: Clear value prop that differentiates vs. competitors
- **Confidence target**: 70+

#### Vol 4: Business Model
- **Word count**: 2,000-2,500
- **Sections**: Revenue model, unit economics, customer acquisition model, pricing strategy, financial scenarios
- **Key output**: Business model canvas with validated unit economics
- **Confidence target**: 65-75+

#### Vol 5: Go-to-Market Strategy
- **Word count**: 1,500-2,000
- **Sections**: Market entry strategy, channel selection, launch sequencing, customer validation plan
- **Key output**: Phased go-to-market roadmap
- **Confidence target**: 65+

#### Vol 6: Narrative Strategy
- **Word count**: 1,000-1,500
- **Sections**: Brand narrative, messaging framework, positioning statement, stakeholder narratives
- **Key output**: Clear brand story and messaging
- **Confidence target**: 70+

#### Vol 7: Risk & Validation
- **Word count**: 2,000-2,500
- **Sections**: Risk map (technical, market, execution, financial), validation roadmap, kill criteria, risk mitigation
- **Key output**: Prioritized validation plan with explicit kill criteria
- **Confidence target**: 60-70+

#### Vol 8: Execution Roadmap
- **Word count**: 1,500-2,000
- **Sections**: 90-day roadmap, milestones, resource requirements, team structure, funding requirements
- **Key output**: Specific 90-day plan with clear deliverables
- **Confidence target**: 60-70+

**Total dossier target: 15,000-19,000 words**

## Iteration Rules

### Critique Loop

After all 8 volumes completed, Venture Critic reviews:
1. **Overall coherence**: Do volumes tell coherent story?
2. **Internal consistency**: Do volumes contradict each other?
3. **Quality**: Is each volume substantive and well-reasoned?
4. **Assumption validation**: Are key assumptions validated across volumes?

### Scoring Rubric

Critic scores based on:
- **Vol 1-8**: Each scored 0-100
- **Overall dossier**: Composite of all volumes, 0-100

**Recommendation Logic:**
- **Score 70-100**: PASS → Move to final composition
- **Score 60-69**: ITERATE → Identify weak volumes, re-run those volumes, recriticize
- **Score < 60**: FAIL → Escalate or reject venture

### Iteration Limits

- **Maximum 3 iterations per venture** (if score hasn't reached 70 after 3 attempts, reject venture)
- **Per-iteration time limit**: 5 hours total for all volume re-runs
- **Volume timeout**: 5 minutes per volume execution (absolute hard limit)

**If iteration limit exceeded:**
- Status = "rejected"
- Archive venture without further processing
- Log failure reason for learning

## Quality Gates

### Pre-Structuring Gate
- Opportunity score must be 75+ to advance (policy enforced)
- Briefing completeness must be 90%+ (all sections populated)
- Analysis confidence > 0.65

### Post-Briefing Gate
- Briefing quality score > 75 required to proceed to volume 1
- If < 75: Briefing sent back for improvement

### Post-Each-Volume Gate
- Volume confidence score must be > 50 to proceed (minimum bar)
- Volume confidence < 50: Volume agent must re-run with additional context

### Pre-Critique Gate
- All 8 volumes completed with confidence > 50
- No volume has null/empty required fields
- Total word count 15,000-19,000 (check completeness)

### Post-Critique Gate
- If score < 60 after 3 iterations: Reject and archive
- If score 60-69: Escalate to portfolio leadership for go/no-go decision
- If score 70+: Proceed to composition

## Assumptions & Validation

### Critical Assumptions Documentation
Each volume must identify 3-5 critical assumptions driving that volume's analysis.

Examples:
- Vol 1: "Regulatory enforcement will remain high for 3+ years"
- Vol 4: "Customer acquisition cost will be < $150K based on SaaS benchmarks"
- Vol 5: "Sales cycle will be 6-9 months for enterprise customers"

### Validation Roadmap
Volumes 7-8 must include validation plan for critical assumptions:
- **What needs validation** (specific assumption)
- **How to validate** (method: customer interview, data analysis, pilot, etc.)
- **Success criteria** (what result would validate/invalidate)
- **Timeline** (when can we validate - during fundraising, after funding, etc.)

### Kill Criteria
Volume 7 must define explicit kill criteria:
"If validation reveals X, we will abandon this venture."

Examples:
- "If willing-to-pay survey shows <50% would pay >$1M annually, kill"
- "If regulatory path becomes impossible without FDA approval, kill"
- "If customer acquisition cost > $250K, kill"

## Iteration Workflow

### Iteration Trigger
After critique score < 70, weak volumes identified (score < 65 in individual volume):

1. **Identify weak volumes**: Critic flags volumes scoring < 65
2. **Create re-run briefing**: Remove constraints and weak assumptions from weak volumes
3. **Re-run weak volumes**: Only those with < 65 score
4. **Re-critique**: Critic reviews updated dossier
5. **Loop until score 70+ or max iterations reached**

### Re-Run Briefing
If volume is weak (Vol 3 value prop scores 55):
- Critic provides specific feedback: "Value prop does not clearly differentiate vs. Ambient. Re-focus on rural-specific workflow optimization."
- Volume agent receives updated context: "Previous value prop attempt was too generic. Use briefing's differentiation_opportunities to anchor re-run."
- Volume re-executed with new instructions

## Staffing & Timing

### Execution Model
- **Parallel volumes 2-8**: After Vol 1 complete, run volumes 2-8 in parallel (not sequential)
- **Sequential phases**: Briefing → Vol 1 → (Vol 2-8 parallel) → Critique → (Iteration if needed) → Composition
- **Estimated total time**:
  - Briefing: 1 min
  - Vol 1: 2 min
  - Vols 2-8 parallel: 2 min max
  - Critique: 2 min
  - Composition: 1 min
  - **Total: ~8 minutes per venture** (no iterations)

### Cost Management
- Target cost per venture: $1.50-2.00 (all 8 volumes + critique)
- Maximum cost per venture: $3.50 (if iterations required)
- If approaching max: Escalate to portfolio leadership for manual review vs. continued iteration

## Failure Handling

### When to Reject Venture

**Auto-reject conditions:**
1. After 3 iterations, score remains < 60
2. Volume execution times out (> 5 min per volume, twice)
3. Execution error: volumes contradicting each other fundamentally
4. New information reveals opportunity no longer viable

**Rejection process:**
- Status = "rejected"
- Archive dossier with failure reason
- Log for portfolio learning
- Do not reconsider without major new information

## Escalation Rules

### When to Escalate to Portfolio Leadership

1. **Score 60-69 after 3 iterations**: Leadership manual review for go/no-go
2. **Score 70+ but weak foundation assumption revealed**: Escalate for validation strategy review
3. **Venture requires founding team not yet identified**: Escalate for team sourcing decision
4. **Capital requirement exceeds portfolio allocation**: Escalate for board approval

## Dossier Completion & Archive

### Completion Criteria
Dossier complete when:
- All 8 volumes scored > 50 confidence
- Critic overall score > 70
- Final composition assembled
- Status = "structured" (vs. "rejected")

### Archive Structure
- Structured ventures filed in portfolio system: `/portfolio/ventures/{venture_id}/`
- Each venture contains: briefing.json, vol_1.json through vol_8.json, critique_result.json, final_dossier.json
- Versioning: Each iteration saved with timestamp

### Performance Tracking
- Track dossier completion rate: % of advancing opportunities that complete structured dossier
- Track iteration rate: % requiring 2+ iterations
- Track average dossier score: Should trend 75-85 over time
- Track time-to-completion: Target 8 minutes, track monthly trend
