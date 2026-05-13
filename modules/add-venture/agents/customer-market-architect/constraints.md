# Customer-Market-Architect Constraints

## Content Requirements

### Mandatory Sections
All five sections must be populated with substantive content:
1. Primary Segment Deep-Dive: 400-500 words
2. Jobs-to-be-Done Framework: 300-400 words
3. Secondary & Tertiary Segments: 200-300 words
4. Decision-Maker vs. User Mapping: 300-400 words
5. Market Architecture: 200-300 words

**Total target: 2,000-2,500 words**

### Quality Standards
- All claims grounded in briefing and Vol 1 data (no new research)
- Segments must be behaviorally distinct, not just demographic
- JTBD must reflect actual customer needs (not product features)
- Decision-maker mapping must account for buying committee complexity
- Market sizing must be realistic (not optimistic)

## Segmentation Standards

### Primary Segment Definition
- Must be narrowly defined enough to be actionable
- Must have clear willingness-to-pay signal
- Must be large enough to support venture (realistic SAM)
- Must be reachable through identifiable channels

### Jobs-to-be-Done Requirements
- Functional jobs must be specific tasks (not "improve efficiency")
- Emotional jobs must reflect actual customer mindset
- Social jobs must be relevant to B2B context if applicable
- Job hierarchy must explain why we prioritize primary segment
- Alternative solutions must reflect true current workarounds

### Market Sizing Standards
- Use briefing TAM as anchor point
- Segment TAM must roll up to briefing TAM
- Customer count must be grounded in available data
- Willingness-to-pay must be based on comparable solutions

## Validation Standards

### Assumptions Documentation
- Minimum 5 critical assumptions
- Each assumption must reference what we're uncertain about
- Include proposed validation method for each assumption
- Priority-order assumptions by importance to go-to-market

### Data Gaps Handling
- Flag all unknowns from briefing analysis
- Propose how secondary research could reduce gaps
- Adjust confidence score if gaps are material
- Don't speculate to fill gaps (flag as assumption instead)

## Execution Constraints

### Time Limits
- Target execution: 120 seconds per volume
- Absolute timeout: 5 minutes per volume
- Must complete within time limit (fail if exceeded)

### Cost Management
- Anthropic Claude API: ~0.12 per volume (3,500 tokens)
- Maximum cost: 0.25 per volume (hard cap)
- If approaching limit: reduce depth or use simpler model

## Confidence Score Requirements

### Scoring Guidance
- **80-100**: High conviction in segmentation, clear primary segment, JTBD well-defined, decision-maker map clear
- **60-79**: Moderate conviction, segmentation logical, some willingness-to-pay questions, decision flow understandable
- **40-59**: Uncertain, multiple possible segments, unclear JTBD, weak willingness-to-pay data
- **Below 40**: Low confidence, segmentation speculative, major unknowns about customer needs

### Confidence Calibration
- Conservative bias (undersegment rather than oversegment)
- Adjust for number of critical segmentation assumptions
- Penalize for material data gaps on willingness-to-pay
- Rationale must justify score within ±10 points

## Integration Constraints

### Upstream Dependencies
- Requires complete briefing with customer_context section
- Requires Vol 1 analysis on opportunity thesis and market readiness
- Assumes briefing customer data is accurate (work from briefing, don't re-research)

### Downstream Dependencies
- Volume 3 agent (value-proposition-designer) depends on Vol 2 customer clarity
- Volume 5 agent (gtm-planner) depends on Vol 2 decision-maker mapping and segment prioritization
- All volumes reference Vol 2 primary segment for consistency

## Quality Assurance

### Validation Checklist
- [ ] All 5 content sections populated with substantive content
- [ ] Total word count 2,000-2,500
- [ ] All claims grounded in briefing and Vol 1 data
- [ ] Primary segment definition is narrow and actionable
- [ ] Secondary/tertiary segments logically sequenced
- [ ] JTBD distinguishes functional/emotional/social jobs
- [ ] Decision-maker map identifies all buying committee members
- [ ] Market sizing methodology documented
- [ ] Willingness-to-pay analysis grounded in data
- [ ] Key assumptions listed (minimum 5)
- [ ] Validation roadmap for each assumption
- [ ] Data gaps explicitly acknowledged
- [ ] Confidence score justified with rationale
- [ ] No speculation or new research

## Error Handling

### Graceful Degradation
- If willingness-to-pay data limited: flag in analysis, adjust confidence down
- If segment concentration high: acknowledge concentration risk
- If secondary segment unclear: flag, don't force definition

### When to Escalate
- Customer context from briefing is internally contradictory
- Segments cannot be defined with available data
- Willingness-to-pay signals absent or contradictory
