# Value-Proposition-Designer Constraints

## Content Requirements

### Mandatory Sections
All five sections must be populated with substantive content:
1. Core Value Proposition: 150-200 words
2. Differentiation Strategy: 300-400 words
3. Value Proposition Canvas: 200-300 words with pains/gains mapped
4. Positioning Statement: 100-150 words
5. Feature/Benefit Mapping: 250-350 words

**Total target: 1,500-2,000 words**

### Quality Standards
- Value proposition must be clear to target persona (not marketing jargon)
- Differentiation must be grounded in Vol 1 and Vol 2 analysis
- Value proposition canvas must map directly to customer JTBD from Vol 2
- Comparison table must reference actual competitors from briefing
- No feature-led positioning (customer problem first)

## Value Proposition Standards

### Core Value Proposition
- Must articulate benefit, not feature
- Must reference target customer from Vol 2
- Must explain why now (market timing)
- Must be defensible (not generic claim)
- Must be distinct from alternatives

### Differentiation Requirements
- 3-5 differentiators maximum (focus, not breadth)
- Each differentiator must have defensibility explanation
- Must explain why hard for competitors to copy
- Must be based on capabilities we can realistically build
- Must matter to customer (grounded in Vol 2 JTBD)

### Value Proposition Canvas
- Pains must match customer pain points from Vol 2
- Gains must match customer desired gains from Vol 2
- Pain relievers must directly address each pain
- Gain creators must enable each gain
- Mapping must be explicit (not assumed)

## Competitive Positioning Standards

### Positioning Statement
- Must follow clear structure: "For [target] who [target need], [product name] is [category] that [key benefit]. Unlike [primary alternative], we [primary differentiator]."
- Must position against real competitor(s) from briefing
- Must emphasize defensible advantage
- Must be memorable and distinct

### Comparison Framework
- Must compare against 2-3 actual alternatives (not strawman)
- Must be honest about competitor strengths
- Must explain our advantage clearly
- Must avoid feature-list comparison (focus on customer outcome)

## Validation Standards

### Assumptions Documentation
- Minimum 4 critical assumptions
- Each assumption must explain positioning bet
- Include proposed validation method
- Examples: "Customers prioritize compliance over cost", "Integrated solution preferred over point solution", "Our technical approach is defensible vs. AI models"

### Data Gaps Handling
- Flag competitive intelligence gaps
- Identify customer preferences not yet validated
- Propose validation methods (customer interviews, pricing research)
- Adjust confidence if gaps are material

## Execution Constraints

### Time Limits
- Target execution: 120 seconds per volume
- Absolute timeout: 5 minutes per volume
- Must complete within time limit

### Cost Management
- Anthropic Claude API: ~0.11 per volume (3,000 tokens)
- Maximum cost: 0.22 per volume (hard cap)

## Confidence Score Requirements

### Scoring Guidance
- **80-100**: Strong differentiation, clear positioning, value prop resonates with Vol 2 customer, competitive advantage defensible
- **60-79**: Reasonable positioning, differentiation logical but not deeply tested, some competitive uncertainty
- **40-59**: Positioning unclear or generic, differentiation not obvious, competitive position uncertain
- **Below 40**: Value prop weak, differentiation not credible, major competitive threats underestimated

### Confidence Calibration
- Conservative bias (understate rather than overstate differentiators)
- Adjust for competitive validation strength
- Penalize for generic positioning or feature-led approach
- Rationale must justify score within ±10 points

## Integration Constraints

### Upstream Dependencies
- Requires clear primary segment from Vol 2
- Requires JTBD framework from Vol 2
- Requires customer pain/gain mapping from Vol 2
- Requires competitive context from briefing

### Downstream Dependencies
- Volume 4 agent (business-model-modeler) depends on Vol 3 value prop clarity for pricing
- Volume 5 agent (gtm-planner) depends on Vol 3 positioning for messaging
- Volume 6 agent (narrative-strategist) depends on Vol 3 differentiation for brand narrative

## Quality Assurance

### Validation Checklist
- [ ] All 5 content sections populated with substantive content
- [ ] Total word count 1,500-2,000
- [ ] Core value proposition is clear and customer-focused (not feature-led)
- [ ] Differentiation strategy has 3-5 clear differentiators
- [ ] Each differentiator has defensibility explanation
- [ ] Value proposition canvas maps pains/gains to pain relievers/gain creators
- [ ] Positioning statement follows clear structure
- [ ] Comparison table references actual competitors
- [ ] Our advantage clearly articulated vs. each alternative
- [ ] Key assumptions listed (minimum 4)
- [ ] Validation roadmap for each assumption
- [ ] Data gaps explicitly acknowledged
- [ ] Confidence score justified with rationale
- [ ] No feature-led positioning or jargon

## Error Handling

### Graceful Degradation
- If competitive landscape unclear: flag in analysis, adjust confidence down
- If differentiation marginal: acknowledge, propose validation
- If positioning not yet tested: flag as assumption, note need for customer validation

### When to Escalate
- Value prop cannot be articulated clearly from Vol 1 and Vol 2
- Differentiation appears non-defensible
- Major competitive threat identified that contradicts Vol 1 analysis
