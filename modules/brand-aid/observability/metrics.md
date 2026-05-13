# Brand Aid Metrics

## Key Metrics

### Pipeline Performance
- **avg_pipeline_duration**: Average time from venture hypothesis to brand book delivery
  - Target: 45-60 minutes per pipeline run
  - Measured: Wall-clock time, excludes human review delays

- **avg_stage_duration**: Average time per pipeline stage
  - brand-strategist: 8-12 minutes
  - market-analyst: 12-15 minutes
  - creative-director: 10-12 minutes
  - naming-agent: 8-10 minutes
  - visual-system-designer: 12-15 minutes
  - logo-designer: 15-20 minutes
  - brand-critic: 5-8 minutes
  - brand-book-composer: 8-10 minutes

### Quality Metrics
- **critique_pass_rate**: Percentage of brand identities that pass critique on first run (≥75)
  - Target: > 75% first-pass rate
  - Measured: pass_runs / total_runs

- **avg_critique_score**: Average overall critique score across all pipelines
  - Target: ≥ 80
  - Dimension averages tracked separately (strategic_alignment, distinctiveness, visual_coherence, naming_quality)

- **iteration_rate**: Percentage of pipelines requiring iteration (critique < 75)
  - Target: < 25% (1 in 4 require iteration)
  - Measured: iteration_runs / total_runs

- **avg_iterations_per_pipeline**: Average number of iteration cycles before passing
  - Target: ≤ 1.5 (most pipelines pass first run, some require 1-2 iterations)
  - Maximum: 3 iterations per pipeline

### Cost Metrics
- **avg_cost_per_brand_identity**: Total API costs for complete brand identity
  - Target: < $15 USD per identity
  - Breakdown by agent/provider tracked

- **api_calls_per_pipeline**: Total API calls required for complete pipeline
  - Target: 15-20 calls (8 agents × 2-3 calls each)

### Quality Gate Metrics
- **critique_dimension_performance**: Average score per dimension
  - strategic_alignment: Target ≥ 80
  - distinctiveness: Target ≥ 78
  - visual_coherence: Target ≥ 82
  - naming_quality: Target ≥ 80

- **artifact_quality**: Percentage of artifacts requiring rework
  - Logo issues (unreadable at scale): < 5%
  - Domain conflicts: < 10%
  - Accessibility violations: < 2%
  - Trademark conflicts: < 3%

### Delivery Metrics
- **brand_book_delivery_rate**: Percentage of pipelines producing complete brand book
  - Target: > 95% (only failures are escalations)

- **avg_brand_book_size_kb**: Average PDF size
  - Target: 2-4 MB (depending on complexity)

### Iteration Analysis
- **iteration_triggers**: What causes iterations (tracked by category)
  - Low strategic alignment: X%
  - Low distinctiveness: Y%
  - Low visual coherence: Z%
  - Low naming quality: W%

- **avg_score_improvement_per_iteration**: How much score improves on retry
  - Target: +8-12 points per iteration

## Monitoring and Alerting

### Alert Thresholds
- Alert if first-pass rate drops below 50%
- Alert if average pipeline duration exceeds 90 minutes
- Alert if any agent failure rate exceeds 5%
- Alert if average cost per brand exceeds $25

### Reporting
- Daily: Pipeline health, costs, quality gates
- Weekly: Iteration analysis, trend analysis
- Monthly: Performance review vs. targets, recommendations for improvement
