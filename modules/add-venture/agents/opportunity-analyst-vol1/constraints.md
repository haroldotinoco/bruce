# Opportunity Analyst Vol 1 Constraints

## Content Requirements

### Mandatory Sections
All five sections must be populated with substantive content:
1. Problem Anatomy: 300-400 words minimum
2. Market Readiness: 300-400 words minimum
3. Addressable Market: 250-300 words minimum
4. Macro Context: 250-300 words minimum
5. Opportunity Thesis: 100-150 words (concise statement)

**Total target: 2,500-3,000 words**

### Quality Standards
- All claims grounded in briefing data (no new research)
- Frameworks applied consistently (e.g., TAM analysis methodology documented)
- Problem anatomy must identify root causes, not just symptoms
- Market readiness assessment must be testable (specific signals)

## Analysis Standards

### Problem Anatomy
- Must distinguish root problem from symptoms
- Must identify all stakeholder groups affected (not just primary customer)
- Current workarounds must reflect actual customer behavior
- Acceptance criteria must be measurable

### Market Readiness
- Maturity stage must align with TAM stage (nascent/emerging/established)
- Demand signals must be observable (not speculative)
- Competitive activation must reference actual incumbent behavior
- Timeline must consider how quickly market window closes

### Addressable Market
- TAM analysis must validate briefing estimates (or flag discrepancy)
- SAM definition must account for addressable portion (geographic, segment)
- SOM must be realistic for new entrant (not optimistic)
- Growth rate must be grounded in market trends

### Macro Context
- Industry trends must support opportunity thesis
- Regulatory shifts must be material to market timing
- Technology enablers must explain "why now" timing
- Economic context must assess recession-resistance or counter-cyclicality

## Validation Standards

### Assumptions Documentation
- All key assumptions must be explicit (minimum 5)
- Each assumption must have proposed validation method
- Success criteria must be measurable
- Priority-order assumptions by importance to thesis

### Data Gaps Handling
- Flag all known gaps from briefing explicitly
- Propose how gaps will be filled (future validation)
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
- **80-100**: High conviction in thesis, market assessment grounded in strong signals
- **60-79**: Moderate conviction, some data gaps but fundamentals sound
- **40-59**: Uncertain, significant assumptions or conflicting signals
- **Below 40**: Low confidence, major unknowns, thesis needs reworking

### Confidence Calibration
- Conservative bias (understate rather than overstate)
- Adjust for number of critical assumptions
- Penalize for material data gaps
- Rationale must justify score within ±10 points

## Integration Constraints

### Upstream Dependencies
- Requires complete briefing with all 6 sections
- Assumes briefing accuracy (work from briefing, don't re-research)
- Uses briefing data, assumptions, and gaps

### Downstream Dependencies
- Volume 2 agent (customer-market-architect) depends on Vol 1 customer context clarity
- Volume 5 agent (gtm-planner) depends on Vol 1 market readiness assessment
- All volumes reference Vol 1 thesis for consistency

## Quality Assurance

### Validation Checklist
- [ ] All 5 content sections populated with substantive content
- [ ] Total word count 2,500-3,000
- [ ] All claims grounded in briefing data
- [ ] Problem anatomy identifies root cause, not symptoms
- [ ] Market readiness signals are observable/verifiable
- [ ] TAM analysis methodology documented
- [ ] Opportunity thesis is clear and compelling
- [ ] Key assumptions listed (minimum 5)
- [ ] Validation roadmap provided for each assumption
- [ ] Data gaps explicitly acknowledged
- [ ] Confidence score justified with rationale
- [ ] No speculation or new research

## Error Handling

### Graceful Degradation
- If market data limited: flag in analysis, adjust confidence down
- If customer data sparse: acknowledge and propose validation
- If assumptions material: flag explicitly, don't hide

### When to Escalate
- Thesis cannot be supported by briefing data
- Material contradictions in briefing data
- Regulatory uncertainty too high to assess market
