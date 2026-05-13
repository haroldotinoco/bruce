# GTM-Planner Constraints

## Content Requirements

### Mandatory Sections
All five sections must be populated:
1. ICP Definition: 200-300 words with clear profile
2. Channel Prioritization: 300-400 words with 3+ channels ranked
3. Launch Sequence: 200-300 words with 4-5 phases
4. 90-Day Playbook: 400-500 words with specific milestones
5. Budget Allocation: 200-300 words with channel spending

**Total target: 1,500-2,000 words**

### Quality Standards
- ICP is narrow enough to find (company size, industry, title)
- Channels ranked by TAM covered and CAC efficiency
- Launch sequence is phased and realistic
- 90-day playbook has specific weekly milestones
- Budget allocation grounded in Vol 4 CAC and Vol 1 TAM

## ICP Definition Standards

### ICP Must Include
- Company size (employees, revenue range)
- Industry vertical (specific, not "financial services")
- Buyer title and role
- Budget authority and decision process
- Geographic focus
- Estimated total addressable ICP companies (not market TAM)
- Where to find them (specific databases, events, networks)

### ICP Grounding
- Must align with Vol 2 primary segment
- Buying process must match Vol 2 decision-maker map
- Size must reflect Vol 4 CAC assumptions
- Pain intensity must support Vol 3 value proposition

## Channel Prioritization Standards

### Channel Requirements
- Minimum 3 channels ranked
- Rank by: (TAM covered × conversion rate) / CAC
- Each channel must have estimated CAC from Vol 4 or comparable benchmark
- Launch sequence staggered (all at once = unfocused)
- Volume Year 1 and Year 3 targets for each channel

### Channel Sequencing
- Primary channel launch month 1 (founder sales or partnerships)
- Secondary channel launch month 3-4 (once primary validated)
- Tertiary channel launch month 6+ (after model validated)

## Launch Sequence Standards

### Phase Structure
- Phase 1 (4 weeks): Founder sales, validate ICP response
- Phase 2 (4 weeks): First customer wins, establish reference
- Phase 3 (4 weeks): Team scaling, second channel launch
- Phase 4 (Months 4-6): Measurement and optimization

### Phase Requirements
- Each phase has clear objectives (e.g., "Close 1st customer")
- Each phase has defined success criteria (measurable)
- Team composition specified (who does what)
- Customer targets clear (who we're hunting)
- Dependency on previous phase outcome

## 90-Day Playbook Standards

### Weekly Milestones
- Weeks 1-4: Top outcomes clearly defined (e.g., "15 qualified leads")
- Weeks 5-8: Momentum outcomes (e.g., "1 customer in pilot")
- Weeks 9-12: Scale outcomes (e.g., "3 customers signed")

### Activity Requirements
- Activities must be specific (not "do marketing")
- Activities must be time-bounded (finish in this phase)
- Activities must be measurable (success = defined metric)
- Resource allocation clear (who does this activity)

## Budget Allocation Standards

### Budget Components
- Sales headcount (title, cost, quota)
- Marketing spend (content, events, tools)
- Partnership costs (if partnerships are channel)
- CAC targets by channel (must align with Vol 4)
- Payback period targets (should be 9-12 months for enterprise SaaS)

### Budget Grounding
- Total GTM budget must roll up to Vol 4 burn rate
- CAC targets must be derivable from Vol 4 CAC assumptions
- Headcount must be realistic for 90-day timeline

## Validation Standards

### Assumptions Documentation
- Minimum 4 GTM assumptions
- Examples: "Sales cycle 4 months", "Channel conversion rate 5%", "Partnership channels deliver 30% of customers"
- Each assumption must have validation method
- Priority-order by impact on GTM success

### Data Gaps Handling
- Flag unknowns: channel availability, partner interest, sales productivity
- Propose validation methods (channel pilots, partner conversations, sales benchmarking)
- Adjust confidence if gaps are material

## Execution Constraints

### Time Limits
- Target execution: 120 seconds
- Absolute timeout: 5 minutes

### Cost Management
- Anthropic Claude Sonnet: ~0.11 per volume (3,000 tokens)
- Maximum cost: 0.22 per volume

## Confidence Score Requirements

### Scoring Guidance
- **80-100**: ICP clear, channels realistic, 90-day plan achievable, budget grounded in Vol 4
- **60-79**: ICP defined, channels reasonable, plan somewhat ambitious but possible
- **40-59**: ICP somewhat unclear, channel efficiency uncertain, 90-day plan overly optimistic
- **Below 40**: ICP vague, channels not validated, plan unrealistic

### Confidence Calibration
- Conservative bias (lower conversion rates, longer sales cycles)
- Adjust for team execution capability
- Penalize for heroic hiring assumptions
- Rationale must justify score within ±10 points

## Integration Constraints

### Upstream Dependencies
- Vol 2 ICP definition (customer segments)
- Vol 3 value proposition clarity (enables positioning messaging)
- Vol 4 CAC assumptions (determines channel priorities)
- Vol 1 market size (constrains total addressable ICP)

### Downstream Dependencies
- Vol 6 (narrative-strategist) depends on GTM positioning for messaging
- Vol 8 (execution-roadmap-planner) depends on 90-day playbook for roadmap

## Quality Assurance

### Validation Checklist
- [ ] All 5 sections populated with substantive content
- [ ] Total word count 1,500-2,000
- [ ] ICP narrowly defined (company size, industry, title, geography)
- [ ] Estimated total ICP company count realistic and measurable
- [ ] 3+ channels ranked with clear rationale
- [ ] Channel CAC targets align with Vol 4 assumptions
- [ ] Launch sequence is phased (not all at once)
- [ ] 90-day playbook has specific weekly milestones
- [ ] Success criteria for each phase are measurable
- [ ] Budget allocation rolls up to realistic total
- [ ] Sales headcount needs are realistic for 90 days
- [ ] CAC payback period targets reasonable (9-12 months)
- [ ] Key assumptions listed (minimum 4)
- [ ] Validation roadmap for each assumption
- [ ] Data gaps explicitly acknowledged
- [ ] Confidence score justified with rationale

## Error Handling

### Graceful Degradation
- If channel efficiency uncertain: widen CAC range, adjust confidence down
- If ICP too large: too diffuse, flag for narrowing
- If 90-day plan unrealistic: propose revised timeline

### When to Escalate
- ICP coverage too small to support Year 1 targets
- All channels have high CAC (no economically viable path to customers)
- 90-day plan requires hiring not feasible in timeframe
