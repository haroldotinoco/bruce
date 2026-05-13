# Briefing Interpreter Constraints

## Processing Rules

### Input Validation
- Opportunity must have opportunity_id, title, problem_statement, target_segment (all required)
- Opportunity must have market_size_estimate and competition_landscape (both required)
- analysis_quality.confidence_level must be > 0.5 (else reject)
- Accept opportunities missing some analysis sections, but flag in data_gaps

### Output Completeness
- All 6 briefing sections must be populated (problem, market, customer, competitive, portfolio, metadata)
- Each section must have confidence_level (0-1)
- key_assumptions array must be non-empty (minimum 3)
- data_gaps array must include all known unknowns from opportunity analysis

### Consistency Standards
- All briefings must follow identical structure
- All briefings must fit within 5KB (conciseness requirement)
- Summaries must be 2-3 paragraphs max per section
- No new analysis, only reorganization/summarization

## Content Standards

### Accuracy Requirements
- Preserve all data from source opportunity (no omissions)
- Do not modify or reinterpret opportunity data
- Confidence levels must reflect original analysis confidence
- All TAM/SAM/SOM figures must match source opportunity exactly

### Clarity Requirements
- Problem statement must be specific and measurable (not abstract)
- Target segment must be clearly definable
- Differentiation opportunities must be explicit
- Strategic fit assessment must be clear

## Volume Constraints

### Briefing Scope
- Do not structure value proposition details (volume 3 agent role)
- Do not develop business model (volume 4 agent role)
- Do not create go-to-market strategy (volume 5 agent role)
- Stay in summarization/organization layer

## Execution Constraints

### Time Limits
- Target execution: 45 seconds per briefing
- Absolute timeout: 2 minutes per briefing
- All briefings must complete before downstream volumes start

### Cost Management
- OpenAI GPT-4o: ~0.05 per briefing
- Maximum cost per briefing: 0.10 (hard cap)
- If approaching cap: reduce detail or use simpler model

## Integration Constraints

### Upstream Dependencies
- Requires complete opportunity from opportunity module
- Assumes opportunity-analyst completed full analysis
- Depends on problem_statement clarity and market_size_estimate validity

### Downstream Expectations
- All 8 volume agents depend on identical briefing
- Briefing must provide sufficient context for each volume's analysis
- Data gaps flagged in briefing inform volume agent confidence levels
- Assumptions flagged in briefing guide volume agent validation focus

## Quality Assurance

### Validation Checklist
- [ ] All 6 sections populated (no null/empty sections)
- [ ] Confidence levels documented for each section
- [ ] Key assumptions extracted (minimum 3)
- [ ] Data gaps identified and documented
- [ ] All figures match source opportunity exactly
- [ ] No new analysis, purely reorganization
- [ ] Briefing size < 5KB
- [ ] Sections coherent and actionable for downstream agents

### When to Escalate
- Opportunity analysis incomplete or missing core sections
- Data gaps too large to proceed (flag but provide best-effort briefing)
- Strategic fit unclear or ambiguous (include in briefing, note for review)

## Error Handling

### Graceful Degradation
- If section has low confidence: flag it but include in briefing
- If data gap exists: note it explicitly in data_gaps array
- If assumption is speculative: document and flag for validation

### When to Refuse Briefing Creation
- Opportunity is missing opportunity_id, title, problem_statement, or target_segment
- Opportunity analysis confidence < 0.5
- Core market data (TAM/competition) completely missing
