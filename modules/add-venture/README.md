# Add-Venture Module

## Overview

The **add-venture** module transforms a scored opportunity from the opportunity module into a complete, structured venture hypothesis dossier. This is a critical module in BruceAI that produces the foundational document for brand strategy (brand-aid module) and execution planning (builder module).

### Purpose

- **Input**: Scored opportunity (75+ score) + opportunity briefing
- **Process**: 8-volume structured analysis with quality critique and iteration
- **Output**: Approved venture dossier or escalation to portfolio leadership
- **Workflow**: Sequential analysis → parallel volume synthesis → quality review → final composition

### Key Characteristics

- **Agents**: 11 specialized agents (2 existing + 9 new)
- **Volumes**: 8-volume structured dossier
- **Critique Loop**: Automated quality review with conditional iteration
- **Timing**: ~8 hours per venture (no iterations)
- **Cost**: $1,800-2,100 per venture
- **Quality**: Target 72-75 overall score on first pass

## Architecture

### Module Structure

```
add-venture/
├── agents/
│   ├── briefing-interpreter/          (Vol 0: Intake specialist)
│   ├── opportunity-analyst-vol1/       (Vol 1: Market & problem analysis)
│   ├── customer-market-architect/      (Vol 2: Customer segmentation)
│   ├── value-proposition-designer/     (Vol 3: Positioning & differentiation)
│   ├── business-model-modeler/         (Vol 4: Unit economics & scenarios)
│   ├── gtm-planner/                    (Vol 5: Go-to-market strategy)
│   ├── narrative-strategist/           (Vol 6: Brand narrative & messaging)
│   ├── risk-validation-analyst/        (Vol 7: Risk map & validation roadmap)
│   ├── execution-roadmap-planner/      (Vol 8: 90-day execution plan)
│   ├── venture-critic/                 (Quality review & scoring)
│   └── dossier-composer/               (Final assembly)
├── contracts/                          (Data schemas)
│   ├── venture-hypothesis.schema.json
│   ├── volume-output.schema.json
│   ├── critique-result.schema.json
│   └── quality-rubric.schema.json
├── state/                              (State management schemas)
│   ├── module-state.schema.json
│   └── execution-state.schema.json
├── policies/                           (Operational policies)
│   ├── structuring-policy.md
│   └── quality-policy.md
├── workflows/                          (Orchestration definitions)
│   ├── venture-structuring-pipeline.workflow.json
│   ├── volume-iteration.workflow.json
│   └── dossier-composition.workflow.json
├── evaluations/                        (Test scenarios & fixtures)
│   ├── happy-path.md
│   ├── critique-iteration.md
│   ├── max-iterations-exceeded.md
│   └── fixtures/
│       ├── opportunity-briefing-input.json
│       └── expected-dossier-output.json
├── observability/                      (Monitoring & tracing)
│   ├── events.md
│   ├── metrics.md
│   └── correlation-ids.md
└── README.md                           (This file)
```

## 8-Volume Pipeline

Each venture is analyzed through 8 sequential or parallel volumes, plus critique and composition:

### Volume 1: Opportunity Diagnosis
**Agent**: opportunity-analyst-vol1
**Input**: Briefing from briefing-interpreter
**Output**: Deep problem/market thesis analysis
**Content**: Problem anatomy, market readiness, TAM/SAM/SOM, macro context, opportunity thesis
**Confidence Target**: 70-80
**Words**: 2,500-3,000

### Volume 2: Customer & Market Architecture
**Agent**: customer-market-architect
**Input**: Vol 1 + Briefing
**Output**: Segmentation model with decision-maker mapping
**Content**: Primary/secondary segments, JTBD framework, decision-maker map, market sizing, market architecture
**Confidence Target**: 65-75
**Words**: 2,000-2,500

### Volume 3: Value Proposition Design
**Agent**: value-proposition-designer
**Input**: Vol 1-2
**Output**: Clear positioning & differentiation
**Content**: Core value proposition, differentiation strategy, value proposition canvas, positioning statement, feature/benefit mapping
**Confidence Target**: 70+
**Words**: 1,500-2,000

### Volume 4: Business Model
**Agent**: business-model-modeler (o1 complex reasoning)
**Input**: Vol 1-3
**Output**: 3 scenario financial model with unit economics
**Content**: Revenue model, unit economics (CAC/LTV/payback), 3 scenarios (conservative/base/aggressive), break-even analysis, recommendation
**Confidence Target**: 65-75
**Words**: 2,000-2,500

### Volume 5: Go-to-Market Strategy
**Agent**: gtm-planner
**Input**: Vol 1-4
**Output**: Actionable GTM plan with 90-day playbook
**Content**: ICP definition, channel priorities, launch sequence (phases), 90-day playbook, budget allocation, acquisition funnel
**Confidence Target**: 65+
**Words**: 1,500-2,000

### Volume 6: Narrative Strategy
**Agent**: narrative-strategist
**Input**: Vol 1-5
**Output**: Brand narrative & positioning
**Content**: Brand narrative (hero's journey), positioning statement, elevator pitches, messaging pillars, tone of voice, investor hook, stakeholder narratives
**Confidence Target**: 70+
**Words**: 1,000-1,500

### Volume 7: Risk & Validation
**Agent**: risk-validation-analyst (o1 complex reasoning)
**Input**: Vol 1-6
**Output**: Risk map & validation roadmap
**Content**: 10+ critical assumptions, risk matrix (likelihood × impact), 3-5 kill criteria (measurable), validation roadmap (ordered experiments), minimum viable validation (30-day plan)
**Confidence Target**: 60-70+
**Words**: 2,000-2,500

### Volume 8: Execution Roadmap
**Agent**: execution-roadmap-planner
**Input**: Vol 1-7
**Output**: 90-day execution plan
**Content**: Phases (3+ with milestones), critical path, resource requirements, success metrics & gates, first 30 days detail
**Confidence Target**: 60-70+
**Words**: 1,500-2,000

### Critique Review (Meta)
**Agent**: venture-critic
**Input**: All 8 volumes
**Output**: Quality score + feedback
**Dimensions**: Market Clarity, Customer Evidence, Model Soundness, GTM Realism, Risk Awareness, Narrative Quality
**Scoring**: 0-100 overall; 0-100 per dimension; per-volume scores
**Decision**: Pass (70+) / Iterate (60-69, < 3 iterations) / Reject (<60 or max iterations)

### Dossier Composition (Final)
**Agent**: dossier-composer
**Input**: All 8 volumes + critique result
**Output**: Final venture dossier artifact
**Format**: Structured JSON with all volumes embedded, executive summary, key metrics table, status, artifact references

## Pipeline Execution

### Sequential Flow
```
Briefing Interpretation
    ↓
Volume 1 (Opportunity)
    ↓
[Parallel: Volumes 2-8]
    ├── Volume 2 (Customer)
    ├── Volume 3 (Value Prop)
    ├── Volume 4 (Business Model)
    ├── Volume 5 (GTM)
    ├── Volume 6 (Narrative)
    ├── Volume 7 (Risk)
    └── Volume 8 (Execution)
    ↓
Critique Review
    ↓
    ├─ Score ≥ 70 → Dossier Composition → Approved
    ├─ 60-69 & iterations < 3 → Volume Iteration → Re-critique
    └─ Score < 60 or iterations ≥ 3 → Escalate to Leadership
```

### Timing
- **Briefing**: 1 minute
- **Volume 1**: 2 minutes
- **Volumes 2-8 parallel**: 2 minutes (max)
- **Critique**: 2-3 minutes
- **Dossier Composition**: 1 minute
- **Total (no iterations)**: ~8 minutes
- **Total with 1 iteration**: ~20 minutes
- **Total with 2 iterations**: ~30 minutes

### Cost Structure
- **Per Volume**: $0.10-0.35 (Anthropic Sonnet, Opus, or OpenAI o1)
- **Total per venture**: $1,800-2,100
- **Iteration cost**: +$300-500 per iteration

## Iteration & Quality Control

### Critique Loop
1. All 8 volumes completed → Venture-critic scores dossier
2. If score ≥ 70: Proceed to composition
3. If 60-69 (and iterations < 3): Weak volumes identified → Re-run only weak volumes → Re-critique
4. If < 60 (or iterations = 3): Escalate to portfolio leadership

### Policy Limits
- **Max iterations**: 3 per venture (if score < 70 after 3 attempts, reject)
- **Weak volume threshold**: Score < 65 (flagged for re-run)
- **Per-iteration time limit**: 5 hours (hard cap)
- **Volume timeout**: 5 minutes per execution (absolute hard limit)

### Quality Gates
- **Pre-structuring**: Opportunity score ≥ 75 (policy enforced)
- **Post-briefing**: Briefing quality > 75 (sends back if lower)
- **Post-each-volume**: Confidence > 50 (minimum bar; lower triggers re-run)
- **Pre-critique**: All 8 volumes completed, no null fields, word count 15-19K
- **Post-critique**: If < 60 after 3 iterations, reject

## Integration Points

### Upstream: Opportunity Module
- **Input**: Scored opportunity (75+) with complete analysis
- **Contract**: opportunity-briefing.schema.json
- **Expectation**: Briefing quality ≥ 75

### Downstream: Brand-Aid Module
- **Output**: Vol 6 (Narrative Strategy) + positioning metadata
- **Contract**: venture-narrative.schema.json
- **Timing**: After dossier approval

### Downstream: Builder Module
- **Output**: Vol 5 (GTM) + Vol 8 (Execution Roadmap) + resource requirements
- **Contract**: venture-execution.schema.json
- **Timing**: After dossier approval

### Portfolio Archive
- **Output**: Complete dossier archived by venture_id
- **Path**: `/portfolio/ventures/{venture_id}/`
- **Contents**: All 8 volumes, critique result, final dossier, iteration history

## Key Policies

### Structuring Policy
- Define volume scope and quality standards
- Iteration rules and limits
- Timing and cost management
- Failure handling and escalation
- See: `/policies/structuring-policy.md`

### Quality Policy
- Quality dimensions and scoring rubric
- Approval thresholds (70+ pass)
- Iteration process and limits (max 3)
- Weak volume identification (<65 threshold)
- Rejection and escalation conditions
- See: `/policies/quality-policy.md`

## Observability

### Events
Event stream published for all major steps (venture.started, volume.completed, critique.scored, critique.iteration.triggered, dossier.completed, etc.)
- See: `/observability/events.md`

### Metrics
Real-time monitoring of pipeline health, quality, cost, and agent performance:
- Completion rate (target >80%)
- Approval rate (target >70%)
- Iteration rate (target <30%)
- Average critique score (target 72-75)
- Cost per venture (target $1,800-2,100)
- Agent execution times and error rates
- See: `/observability/metrics.md`

### Correlation IDs
Full traceability across pipeline execution and downstream modules:
- venture_id (primary identifier)
- structuring_run_id (execution instance)
- volume_run_id (iteration tracking)
- iteration_count (loop depth)
- See: `/observability/correlation-ids.md`

## Example Scenarios

### Scenario 1: Happy Path (First-Pass Approval)
- Venture enters with strong briefing (78/100)
- All 8 volumes execute in 8 minutes
- Critique scores 76/100 on first attempt
- Dossier approved and sent downstream
- See: `/evaluations/happy-path.md`

### Scenario 2: Critique Iteration (2 Cycles)
- First critique: 68/100 (weak volumes flagged)
- Iterate Vol 4 and Vol 7
- Second critique: 74/100 (passes)
- Dossier approved after iteration
- See: `/evaluations/critique-iteration.md`

### Scenario 3: Max Iterations Exceeded (Rejection)
- First critique: 64/100
- Second critique: 67/100
- Third critique: 61/100 (customer validation revealed gaps)
- Score remains < 70 after max iterations
- Venture rejected and escalated to portfolio leadership
- See: `/evaluations/max-iterations-exceeded.md`

## Running the Module

### Trigger
Venture advances from opportunity module with score ≥ 75 and complete briefing.

### Workflow Execution
```
POST /bruce/modules/add-venture/workflows/venture-structuring-pipeline
{
  "venture_id": "v-0023-ai-compliance-saas",
  "opportunity_id": "opp-0089-fintech-compliance",
  "briefing": { ... }
}
```

### Expected Output
```
{
  "venture_id": "v-0023-ai-compliance-saas",
  "status": "approved" | "escalated" | "rejected",
  "overall_score": 76,
  "dossier_location": "s3://ventures/v-0023/final-dossier.json",
  "volumes": { vol_1, vol_2, ..., vol_8 },
  "critique_result": { ... },
  "next_steps": ["brand-aid", "builder"]
}
```

## Troubleshooting

### Agent Timeout
If agent exceeds 5-minute timeout:
1. Check agent logs for performance issues
2. Review input complexity (oversized briefing?)
3. Check LLM API rate limits
4. Escalate to engineering if pattern emerges

### Low Critique Score (<70 first attempt)
1. Identify weak volumes (< 65 score)
2. Understand criticism (specific feedback)
3. Determine if re-run likely to improve (< 3 iterations attempted)
4. If improvement unlikely, escalate to portfolio for go/no-go

### Iteration Loop (Not Converging)
1. Check iteration count (must be < 3)
2. Analyze score trajectory (improving or declining?)
3. If declining: Market assumptions likely invalid; escalate for deeper analysis
4. If flat: Weak volumes may have structural issues; consider rejection

## Maintenance

### Agent Updates
- SKILL.md: Update role and decision rules
- constraints.md: Update content requirements
- capabilities.json: Update model/provider if changing
- examples/: Update valid-input and expected-output fixtures

### Policy Updates
- structuring-policy.md: Update quality standards, iteration limits
- quality-policy.md: Update scoring rubric, thresholds, gates

### Workflow Updates
- venture-structuring-pipeline.workflow.json: Update step sequencing
- Maintain JSON syntax validity; validate against schema

## Support

For questions or issues:
- Check `/policies/` for operational guidelines
- Check `/evaluations/` for example scenarios
- Check `/observability/` for monitoring and debugging
- Check agent SKILL.md files for role clarification
