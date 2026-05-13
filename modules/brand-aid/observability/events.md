# Brand Aid Events

## Event List

### brand.strategy.defined
- **Trigger**: brand-strategist completes brand strategy output
- **Metadata**: positioning, archetype, brand_promise
- **Severity**: INFO
- **Route**: logging, metrics

### brand.market-analysis.completed
- **Trigger**: market-analyst completes market analysis
- **Metadata**: competitors_analyzed, white_space_identified
- **Severity**: INFO

### brand.creative-direction.created
- **Trigger**: creative-director produces creative direction brief
- **Metadata**: naming_criteria_count, visual_metaphors_count
- **Severity**: INFO

### brand.naming-candidates.generated
- **Trigger**: naming-agent produces candidate list
- **Metadata**: candidates_count, top_candidate_name, top_score
- **Severity**: INFO

### brand.visual-system.created
- **Trigger**: visual-system-designer completes visual system
- **Metadata**: primary_colors_count, fonts_count, wcag_level
- **Severity**: INFO

### brand.logo.generated
- **Trigger**: logo-designer produces final logo concepts
- **Metadata**: concepts_count, recommended_concept_name, file_count
- **Severity**: INFO

### brand.critique.scored
- **Trigger**: brand-critic completes critique and scoring
- **Metadata**: overall_score, pass_fail, dimensions
- **Severity**: INFO

### brand.critique.failed
- **Trigger**: critique score < 75 (fails quality gate)
- **Metadata**: overall_score, failing_dimensions, iteration_count
- **Severity**: WARNING

### brand.iteration.started
- **Trigger**: Pipeline initiates iteration loop (critique < 75)
- **Metadata**: iteration_number, failed_dimensions, target_stage
- **Severity**: INFO

### brand.iteration.completed
- **Trigger**: Iteration loop completes; new critique run initiated
- **Metadata**: iteration_number, new_score, improved_dimensions
- **Severity**: INFO

### brand.iteration.limit-exceeded
- **Trigger**: Iteration count exceeds maximum (3 cycles)
- **Metadata**: iteration_count, final_score, recommendation
- **Severity**: ERROR

### brand.book.composed
- **Trigger**: brand-book-composer assembles final brand book
- **Metadata**: pdf_size_kb, page_count, format_count
- **Severity**: INFO

### brand.book.delivery-ready
- **Trigger**: Brand book passed all quality checks and is ready for delivery
- **Metadata**: critique_score, files_count, delivery_formats
- **Severity**: INFO

## Event Routing

All events logged to:
- **Metrics database**: For aggregation and analysis
- **Structured logs**: For operational debugging
- **Workflow state machine**: To trigger downstream actions
