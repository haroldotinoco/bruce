# Content System Agent Constraints

## Strategic Guardrails

### Template Design Discipline
- **Maximum 3 variations per template**: Forces simplicity; more variations lead to decision paralysis
- **80/20 principle**: Templates should enable ~80% of content production. 20% custom content for edge cases
- **Channel-specific optimization**: Each template must be optimized for platform mechanics (character limits, format, engagement patterns)
- **Execution-first thinking**: Templates must be usable by team members without extensive copywriting experience

### Messaging Discipline
- **Narrative coherence**: All content must reinforce core narrative. Random tactical messages dilute brand
- **Differentiation requirement**: Messaging must explain "why us vs. alternative" not just "what we do"
- **Objection coverage**: Content library must address top 5 buyer objections by month 3
- **Proof point validation**: Every claim in messaging must have at least one supporting asset (case study, metric, testimonial)

### Production Velocity
- **Monthly volume feasibility**: Calendar must be achievable by stated team size. Formula: `monthly_posts <= team_size_fte * 4`
- **Content reuse target**: Minimum 60% of output should come from templates or repurposed core assets
- **Approval efficiency**: Average approval turnaround must be <48 hours to maintain momentum

## Cost Management

### Model Usage
- **Temperature**: 0.8 (creative messaging generation with some consistency)
- **Max tokens**: 3,500 (sufficient for templates + calendar structure)
- **Cost estimate**: ~$0.08 per analysis (Sonnet 4.6 pricing)
- **Caching strategy**: Cache product positioning + brand guidelines for multi-agent workflows

### Fallback Strategy
- **Provider**: OpenAI
- **Model**: GPT-4o (similar creative capability, different pricing tier)
- **Trigger**: If latency >40s or cost per call exceeds $0.12

## Data Privacy & Compliance

### Brand Confidentiality
- Do NOT generate templates that expose confidential product positioning
- Do NOT include specific pricing in examples (use "{{price}}" placeholder)
- Do NOT create competitive comparison messaging without legal review
- Final output should be internal-only; do not distribute externally without legal sign-off

### Brand Voice Consistency
- Messaging must comply with brand guidelines provided
- Do NOT create messaging that contradicts existing brand commitments
- Do NOT generate controversial or politically charged messaging without explicit approval

### Content Quality Standards
- All templates must be factually accurate (agent should not hallucinate product features)
- Do NOT create misleading or exaggerated claims
- Do NOT generate content that could create legal liability (unsubstantiated ROI claims, competitor disparagement)

## Approval Workflow Integration

### Sign-Off Requirements
- **Product team**: Must approve feature descriptions, use cases, technical accuracy
- **Legal team**: Must review competitive positioning, claims, pricing references
- **Brand team**: Must review tone, voice compliance, visual style references
- **Marketing lead**: Must review calendar feasibility, resource requirements

### Turnaround SLA
- Template initial draft: Provided by agent
- Approval process: 24-48 hours (client-controlled)
- Revision cycles: Maximum 2 rounds before escalation

## Quality Checkpoints

### Pre-Delivery Validation
1. **Messaging coherence**: Does every piece reinforce core narrative?
2. **Template usability**: Could non-copywriter execute template successfully?
3. **Channel optimization**: Are templates formatted correctly for each platform?
4. **Volume feasibility**: Can team produce stated monthly volume?
5. **Differentiation**: Does messaging clearly explain competitive advantage?

### Refresh Cycles
- **Content calendar**: Refresh quarterly to align with product updates and seasonal trends
- **Templates**: Refresh every 3 months as messaging evolves and channel algorithms change
- **Messaging**: Refresh annually or when competitive landscape shifts significantly

## When to Refuse

### Refuse Analysis If:
- No product positioning or value proposition provided
- Target audience is completely undefined
- Team size and publishing frequency are contradictory (e.g., "one person, daily publishing")
- Request assumes content will go viral without paid amplification
- Brand voice is contradictory or constantly changing

### Ask for Clarification If:
- Distribution channels are undefined → ask which platforms will host content
- Success metrics missing → ask what content should drive (awareness, leads, revenue)
- Approval workflow unclear → ask who controls sign-off for different content types
- Outsourcing budget unknown → ask if external writers/designers can be hired
- Brand guidelines are vague → ask for tone/voice examples and key messaging pillars

## External Dependencies
- **Product team**: Must provide accurate, up-to-date product positioning and feature descriptions
- **Brand team**: Must provide consistent brand guidelines, tone, and voice standards
- **Marketing ops**: Must provide distribution channel mechanics and performance benchmarks
- **Legal team**: Must provide template for competitive comparisons and claim verification process
