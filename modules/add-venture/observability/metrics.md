# Add-Venture Module Metrics

## Pipeline Metrics

### Throughput
- **ventures_per_day**: Average ventures started per day
  - Target: 5-10 per day
  - Tracked: Daily, weekly, monthly averages

- **completion_rate**: % of advanced opportunities that complete dossier
  - Target: >80% (approved + escalated) within 14 days
  - Tracked: Monthly cohort analysis

### Duration
- **avg_pipeline_duration_minutes**: Average time from start to approved/rejected
  - Target: 480 minutes (8 hours) without iterations
  - Tracked: Percentiles (median, p75, p95)

- **total_time_to_completion_including_iterations**: Total time including iteration cycles
  - Target: <600 minutes (10 hours) including up to 2 iterations
  - Tracked: By final status (approved vs. rejected)

## Quality Metrics

### Critique Scores
- **avg_overall_score_first_attempt**: Average overall score on initial critique
  - Target: 72-75
  - Tracked: Monthly trending

- **avg_overall_score_post_iteration**: Average score after iteration(s)
  - Target: 75-80
  - Tracked: Per iteration cycle

- **dimension_score_trends**: Track each dimension separately
  - Market Clarity, Customer Evidence, Model Soundness, GTM Realism, Risk Awareness, Narrative Quality
  - Target: All dimensions >70 on average
  - Tracked: Monthly average per dimension

- **score_distribution**: Histogram of overall scores
  - Track: % scoring <60, 60-69, 70-79, 80-100
  - Healthy: <10% <60, <20% 60-69, >70% >70

### Volume Quality
- **volume_level_avg_scores**: Average confidence score for each volume
  - Vol 1-8 tracked separately
  - Target: All volumes >70 average confidence
  - Tracked: Monthly

- **weak_volume_rate**: % of volumes scoring <65 on first pass
  - Target: <20% weak volumes per dossier
  - Tracked: Per dossier and monthly aggregate

### Iteration Metrics
- **iteration_rate_1_plus**: % of dossiers requiring 1+ iterations
  - Target: <30%
  - Tracked: Monthly cohort analysis

- **iteration_rate_2_plus**: % of dossiers requiring 2+ iterations
  - Target: <10%
  - Tracked: Monthly cohort analysis

- **avg_iterations_per_venture**: Average iterations when iterations occur
  - Target: <1.5 (if iterating, usually 1 iteration sufficient)
  - Tracked: Monthly for iterating dossiers only

- **max_iterations_exceeded_rate**: % of ventures hitting iteration limit (3)
  - Target: <2%
  - Tracked: Monthly (should be rare)

## Approval Metrics

### Approval Outcomes
- **approval_rate**: % of dossiers approved (70+)
  - Target: >70%
  - Tracked: Monthly and cumulative

- **escalation_rate**: % escalated to portfolio leadership (60-69 after max iterations or policy trigger)
  - Target: <5%
  - Tracked: Monthly

- **rejection_rate**: % rejected (<60 or policy violation)
  - Target: <25%
  - Tracked: Monthly and by reason (market clarity, customer evidence, etc.)

### Approval by Status
- **approved_on_first_pass**: % approved without iteration
  - Target: >50%
  - Tracked: Monthly

- **approved_post_iteration**: % approved after 1-3 iterations
  - Target: 20-40%
  - Tracked: Monthly

## Agent Performance Metrics

### Execution Times
- **agent_execution_time_median**: Median execution time per agent
  - Tracked: Per agent per month
  - Alerting: If median > 2x baseline

- **agent_timeout_rate**: % of executions timing out
  - Target: <1%
  - Tracked: Per agent, monthly

### Agent Error Rates
- **agent_error_rate**: % of executions returning errors
  - Target: <0.5%
  - Tracked: Per agent, monthly
  - Alerting: >2% triggers review

### Agent Restart Rate
- **agent_restart_rate**: % of executions requiring restart
  - Target: <5%
  - Tracked: Per agent, monthly

## Cost Metrics

### Cost per Venture
- **avg_cost_per_venture**: Total API costs (Anthropic + OpenAI) per dossier
  - Target: $1,800-2,100
  - Tracked: Monthly average

- **cost_per_venture_by_outcome**:
  - Approved: Target $1,800
  - Escalated: Target $2,400 (iterations)
  - Rejected: Target $2,100 (iterations before rejection)
  - Tracked: Monthly by outcome

- **cost_per_week_of_execution**: Total module costs per week
  - Target: <$50K/week (for 25 ventures/week)
  - Tracked: Weekly

### Cost Efficiency
- **cost_per_approved_venture**: Total cost divided by approvals
  - Target: <$2,500 per approved
  - Tracked: Monthly

## Downstream Metrics

### Hand-off Quality
- **dossier_received_by_brand_aid**: % of approved dossiers successfully sent
  - Target: 100%
  - Tracked: Monthly

- **dossier_received_by_builder**: % of approved dossiers successfully sent
  - Target: 100%
  - Tracked: Monthly

### Brand-Aid Module Feedback
- **brand_aid_rework_rate**: % of narratives requiring rework by brand-aid module
  - Target: <10%
  - Tracked: Monthly (indicates Vol 6 quality)

### Builder Module Feedback
- **builder_rework_rate**: % of execution roadmaps requiring rework by builder
  - Target: <10%
  - Tracked: Monthly (indicates Vol 8 quality)

## Process Metrics

### Volume Quality Distribution
- **high_quality_volumes**: % of volumes scoring >75
  - Target: >60%
  - Tracked: Monthly aggregate

- **low_quality_volumes**: % of volumes scoring <65
  - Target: <15%
  - Tracked: Monthly aggregate

### Assumption Tracking
- **avg_assumptions_per_dossier**: Average number of critical assumptions documented
  - Target: 30-40 (10+ per Vol 1-7)
  - Tracked: Monthly

- **avg_kill_criteria_per_dossier**: Average number of kill criteria documented
  - Target: 4-5 per dossier
  - Tracked: Monthly

## Dashboards

### Daily Operations Dashboard
- Pipeline throughput (ventures in progress)
- Current step distribution (% in each step)
- Recent completions (approved/rejected count)
- Alert summary (timeouts, errors)

### Weekly Portfolio Dashboard
- Completion rate (% approved this week)
- Avg scores by dimension
- Iteration rate (% requiring re-work)
- Cost trends

### Monthly Executive Dashboard
- Monthly completion rate vs. target
- Average critique score vs. target (72-75)
- Approval/rejection/escalation breakdown
- Agent performance summary
- Cost per venture trending
- Downstream module feedback (rework rates)

## Alerts & Escalation

### Critical Alerts
- **Agent timeout** (> 5 minutes): Alert engineering immediately
- **Agent error rate** (> 2%): Alert engineering within 1 hour
- **Zero dossiers approved** (weekly): Alert portfolio leadership

### Warning Alerts
- **Iteration rate > 40%** (monthly): Review opportunity funnel quality
- **Avg score < 70** (monthly): Review agent performance or opportunity quality
- **Cost per venture > $2,500**: Flag for cost optimization
- **Rejection rate > 30%** (monthly): Review gating criteria; may be too strict

### SLA Targets
- **P95 completion time**: <600 minutes (10 hours)
- **Agent availability**: >99% uptime
- **Quality (avg score)**: >72 on first pass
- **Approval rate**: >70%
