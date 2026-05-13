# Business-Model-Modeler Constraints

## Content Requirements

### Mandatory Sections
All five sections must be populated with detailed financial modeling:
1. Revenue Model Design: 300-400 words with pricing strategy clear
2. Unit Economics Framework: 300-400 words with CAC/LTV methodology transparent
3. Three Business Model Scenarios: Conservative, Base, Aggressive (each detailed)
4. Break-Even Analysis: 200-300 words with timeline for each scenario
5. Scenario Recommendation: 200-300 words with clear rationale and capital requirements

**Total target: 2,000-2,500 words**

### Quality Standards
- All financial modeling grounded in Vol 2 willingness-to-pay and customer counts
- Unit economics methodology transparent (how CAC/LTV calculated)
- Three scenarios use consistent assumptions (differ only in customer acquisition pace)
- All monetary figures have clear methodology
- Conservative estimates (higher CAC, lower LTV, higher churn)

## Financial Modeling Standards

### Revenue Model Requirements
- Pricing strategy justified (value-based, market-based, cost-plus)
- Annual contract value (ACV) or ARPU clearly stated
- Revenue mix by segment (if multiple segments)
- Pricing assumptions documented
- Willingness-to-pay from Vol 2 must anchor pricing

### Unit Economics Requirements
- CAC calculation methodology explicit (customer acquisition cost formula)
- LTV calculation methodology explicit (LTV = ARPU × Gross Margin × (1 / Monthly Churn))
- CAC Payback Period explicit (months to recover acquisition cost)
- Gross Margin definition clear (product delivery cost, support, payment processing)
- LTV:CAC ratio benchmarked against SaaS industry (target 3:1 or higher)

### Scenario Modeling Standards
- Conservative scenario: 20-30% customer acquisition pace of base
- Base scenario: Realistic acquisition pace grounded in Vol 5 GTM plan
- Aggressive scenario: 150-200% acquisition pace of base
- All three scenarios use identical pricing, unit economics, cost structure
- Differences only in customer acquisition and timeline
- Each scenario models 3 years forward

### Break-Even Analysis Requirements
- Fixed costs include: core team (CEO, CTO, CFO, 1 engineer, 1 customer success)
- Variable costs include: payment processing, cloud infrastructure, customer support labor
- Break-even month identified for each scenario
- Runway requirement calculated (months of burn before break-even)
- Capital requirements explicit for each scenario

## Validation Standards

### Assumptions Documentation
- Minimum 6 critical financial assumptions
- Each assumption must explain key model input (e.g., "Monthly churn 5% based on SaaS benchmarks")
- Include proposed validation method for each
- Priority-order assumptions by impact on break-even

### Data Gaps Handling
- Flag all unknowns (CAC acquisition channel TBD, LTV churn TBD, etc.)
- Propose validation methods (pricing research, customer interviews, benchmarking)
- Adjust confidence if gaps are material (e.g., willingness-to-pay unknown)
- Document sensitivity analysis (if CAC 2x higher, how does break-even change?)

## Execution Constraints

### Time Limits
- Target execution: 180 seconds per volume (o1 needs more time for complex reasoning)
- Absolute timeout: 10 minutes per volume (o1 limit)
- Must complete within time limit

### Cost Management
- OpenAI o1 API: ~0.35 per volume (complex reasoning)
- Maximum cost: 0.75 per volume (hard cap)
- If approaching limit: use base case only, not all three scenarios

## Confidence Score Requirements

### Scoring Guidance
- **80-100**: Unit economics grounded in strong Vol 2 data, pricing justified, break-even realistic, scenarios well-differentiated
- **60-79**: Unit economics reasonable but some assumptions untested, pricing somewhat speculative, scenarios make sense
- **40-59**: Unit economics uncertain, significant pricing unknowns, scenarios differ but not clearly defensible
- **Below 40**: Unit economics highly speculative, pricing unvalidated, viability questionable

### Confidence Calibration
- Conservative bias (higher CAC estimates, lower LTV, higher churn)
- Adjust for willingness-to-pay confidence from Vol 2
- Penalize for unvalidated churn assumptions
- Penalize for optimistic acquisition pace assumptions
- Rationale must justify score within ±10 points

## Integration Constraints

### Upstream Dependencies
- Requires Vol 2 customer willingness-to-pay by segment
- Requires Vol 2 customer count estimates
- Requires Vol 3 value proposition clarity (informs pricing)
- Requires understanding of addressable market from Vol 1

### Downstream Dependencies
- Volume 5 agent (gtm-planner) depends on capital requirements to set budget
- Volume 7 agent (risk-validation-analyst) depends on unit economics for financial risk assessment
- Volume 8 agent (execution-roadmap-planner) depends on capital requirement for 90-day roadmap

## Quality Assurance

### Validation Checklist
- [ ] All 5 content sections populated with detailed financial analysis
- [ ] Total word count 2,000-2,500
- [ ] Revenue model clearly defined with pricing strategy
- [ ] CAC calculation methodology documented and justified
- [ ] LTV calculation methodology documented and justified
- [ ] CAC Payback Period calculated for each segment
- [ ] Gross margin grounded in product delivery reality
- [ ] LTV:CAC ratio calculated and benchmarked
- [ ] Three scenarios (conservative/base/aggressive) all detailed
- [ ] Scenarios differ in customer acquisition pace (not other assumptions)
- [ ] Break-even month identified for each scenario
- [ ] Runway requirement calculated for recommended scenario
- [ ] Total capital requirement stated and justified
- [ ] Key assumptions listed (minimum 6)
- [ ] Validation roadmap for each assumption
- [ ] Sensitivity analysis provided (if CAC 2x, when is break-even?)
- [ ] Data gaps explicitly acknowledged
- [ ] Confidence score justified with rationale
- [ ] No unrealistic scaling assumptions; tie to Vol 5 GTM plan

## Error Handling

### Graceful Degradation
- If willingness-to-pay uncertain: widen pricing range, adjust confidence down
- If unit economics don't work: flag for business model restructuring (different segment, pricing, etc.)
- If break-even > 3 years: flag as high capital requirement, escalate for funding implications

### When to Escalate
- Unit economics fundamentally don't work (LTV < CAC at any reasonable scenario)
- Pricing appears non-viable (below production cost)
- Required capital exceeds reasonable funding expectations
