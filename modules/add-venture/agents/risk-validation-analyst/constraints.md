# Risk-Validation-Analyst Constraints

## Content Requirements

### Mandatory Sections
1. Critical Assumptions: Array of 10+ assumptions with risk level, validation method, timeline
2. Risk Matrix: 2x2 categorization of all identified risks
3. Kill Criteria: 3-5 specific, measurable kill conditions
4. Validation Roadmap: Ordered experiments to test assumptions
5. Risk Mitigation Strategy: De-risking approach and timeline

**Total target: 2,000-2,500 words**

### Quality Standards
- Assumptions are specific (not generic)
- Kill criteria are binary and measurable (clear go/no-go)
- Validation methods are realistic and executable
- Risk matrix is comprehensive (not just obvious risks)
- Assumptions grounded in Vols 1-6, not speculation

## Assumptions Standards

### Assumption Documentation
- Minimum 10 critical assumptions (market, customer, product, business model, execution)
- Each assumption must state: what we believe, why it matters, how we'll know if wrong
- Risk level must be justified (high = material to viability, low = nice-to-have)
- Validation method must be realistic (achievable in 30 days for first tier)
- Success criteria must be measurable (not subjective)

### Assumption Grounding
- Must reference specific claim from Vols 1-6 (where does this come from?)
- Examples:
  - "Vol 1: Regulatory pressure will increase for 3+ years" → Assumption: Regulatory enforcement frequency remains high
  - "Vol 4: CAC is $120K" → Assumption: Sales productivity (close rate, sales cycle) will match benchmarks

## Kill Criteria Standards

### Kill Criteria Requirements
- 3-5 total (enough to be meaningful, not so many as to be paralyzing)
- Each must be binary (pass/fail, not spectrum)
- Each must be measurable (what number triggers kill?)
- Each must have clear timeline (when do we know?)
- Must cover different risk categories (market, customer, product, financial)

### Kill Criteria Examples
- "If willing-to-pay survey shows <50% would pay >$250K annually, kill" (market risk)
- "If implementation time exceeds 8 weeks for first customer, kill" (product/execution risk)
- "If monthly churn exceeds 5%, kill in month 6" (business model risk)

## Validation Roadmap Standards

### Experiment Definition
- Experiment name (clear identifier)
- Which assumptions tested (link to critical assumptions)
- Method (customer interviews, pricing research, pilot, etc.)
- Duration (days to complete)
- Success metric (what result validates?)
- Go/no-go decision criteria (what do we learn?)

### Experiment Sequencing
- First tier (30 days): Quick, high-learning validation experiments
- Second tier (60-90 days): Deeper validation
- Third tier (Months 4-6): Pilot/scale validation

### Minimum Viable Validation
- What must we validate in first 30 days?
- What learning is non-negotiable before proceeding?
- What resource is required (team, budget, partners)?

## Risk Categories

### Risk Types
- Market risk: market timing, TAM, adoption rate
- Customer risk: ICP clarity, willingness-to-pay, buying process
- Product risk: buildability, technical feasibility, performance
- Competitive risk: competitor response, differentiation sustainability
- Business model risk: unit economics, CAC/LTV, churn
- Execution risk: team capability, hiring, fundraising
- Financial risk: capital requirements, cash runway, burn rate

## Execution Constraints

### Time Limits
- Target execution: 180 seconds (o1 needs time for complex reasoning)
- Absolute timeout: 10 minutes

### Cost Management
- OpenAI o1: ~0.35 per volume
- Maximum cost: 0.75 per volume

## Confidence Score Requirements

### Scoring Guidance
- **80-100**: Comprehensive risk map, kill criteria are clear and measurable, validation roadmap is realistic, mitigation strategy is sound
- **60-79**: Good risk identification, kill criteria somewhat clear, validation approach reasonable
- **40-59**: Risk identification incomplete, kill criteria vague, validation approach uncertain
- **Below 40**: Risk map superficial, kill criteria not measurable, validation approach unrealistic

## Integration Constraints

### Upstream Dependencies
- All 6 previous volumes (must assess risks in context of all volumes)
- Volumes 1-6 identify assumptions that feed into this volume

### Downstream Dependencies
- Volume 8 (execution-roadmap-planner) depends on validation roadmap for 90-day plan
- Venture-critic depends on kill criteria being clear

## Quality Assurance

### Validation Checklist
- [ ] All 5 sections populated with substantive content
- [ ] Total word count 2,000-2,500
- [ ] Minimum 10 critical assumptions identified
- [ ] Each assumption has risk level, validation method, success criteria
- [ ] Risk matrix covers all major risk categories
- [ ] 3-5 kill criteria that are binary and measurable
- [ ] Each kill criterion has measurement method and timeline
- [ ] Validation roadmap has 5+ experiments ordered by priority
- [ ] First 30 days of validation are realistic and achievable
- [ ] Resource requirements for validation are specified
- [ ] Top 5 risks have explicit mitigation actions
- [ ] De-risking timeline clearly stated
- [ ] Assumptions grounded in Vols 1-6 (not speculation)
- [ ] Data gaps explicitly acknowledged
- [ ] Confidence score justified with rationale

## Error Handling

### Graceful Degradation
- If assumptions unclear: require clarification from previous volumes
- If kill criteria not measurable: redefine with specific metrics
- If validation unrealistic: propose phased approach over longer timeline

### When to Escalate
- Risk map reveals show-stopper risk that contradicts Vol 1 thesis
- Kill criteria would be hit in normal business course (unfair threshold)
- Validation roadmap requires resources not available
