# Bruce-Core Metrics

Key performance indicators and metrics tracked by bruce-core to monitor venture pipeline health, workflow efficiency, and system reliability.

## Venture Lifecycle Metrics

### Ventures by Lifecycle Stage

**Metric**: `bruce_core_ventures_by_stage`
**Type**: Gauge (count)
**Dimensions**:
- `stage`: GENERATED, QUALIFIED, STRUCTURED, BUILT, LAUNCHED, SCALED, PAUSED, ARCHIVED, KILLED
- `tier`: early-stage (GENERATED-QUALIFIED), growth (STRUCTURED-LAUNCHED), scaling (SCALED), inactive (PAUSED-KILLED-ARCHIVED)

**Description**: Count of active ventures in each lifecycle stage. Used to identify bottlenecks and stage capacity.

**Query examples**:
```
SELECT stage, COUNT(*) FROM ventures WHERE status NOT IN ('ARCHIVED', 'KILLED') GROUP BY stage
```

**Alerts**:
- If GENERATED stage has >50 ventures and average dwell time >30 days, investigate screening bottleneck
- If QUALIFIED stage has >30 ventures and average dwell time >14 days, investigate AddVenture module health

**Targets**:
| Stage | Min | Healthy Range | Max |
|-------|-----|---------------|-----|
| GENERATED | 5 | 10-25 | 50 |
| QUALIFIED | 3 | 8-15 | 35 |
| STRUCTURED | 2 | 5-12 | 25 |
| BUILT | 1 | 3-8 | 15 |
| LAUNCHED | 1 | 2-6 | 12 |
| SCALED | 0 | 1-3 | 8 |

---

### Gate Pass Rates by Gate Type

**Metric**: `bruce_core_gate_pass_rate` and `bruce_core_gate_fail_rate`
**Type**: Ratio (0-1)
**Dimensions**:
- `gate_id`: post-screening, post-structuring, post-build, post-launch
- `decision_type`: auto_pass, auto_fail, human_approved, human_rejected

**Description**: Percentage of ventures passing/failing each gate. Tracks decision distribution and human review frequency.

**Query examples**:
```
SELECT gate_id,
  COUNTIF(decision='PASSED') / COUNT(*) AS pass_rate,
  COUNTIF(decision='FAILED') / COUNT(*) AS fail_rate,
  COUNTIF(decision='HUMAN_REVIEW') / COUNT(*) AS human_review_rate
FROM gate_evaluations
GROUP BY gate_id
```

**Healthy benchmarks by gate**:
| Gate | Auto-Pass | Human Review | Auto-Fail |
|------|-----------|--------------|-----------|
| post-screening | 40-60% | 20-40% | 10-20% |
| post-structuring | 50-70% | 15-30% | 5-15% |
| post-build | 60-80% | 10-20% | 5-10% |
| post-launch | 70-90% | 5-15% | 2-8% |

**Alerts**:
- If post-screening auto_fail rate > 25%, investigate opportunity quality or gate threshold calibration
- If human review rate < 5%, gate thresholds may be too loose
- If human review rate > 40%, gate thresholds may be too tight or criteria unclear

---

### Average Time Per Lifecycle Stage

**Metric**: `bruce_core_stage_dwell_time_days`
**Type**: Histogram (latency)
**Dimensions**:
- `stage`: Each lifecycle stage
- `percentile`: p50, p75, p90, p95, p99

**Description**: How long ventures spend in each stage (stage entry to stage exit or current time if still in stage).

**Query examples**:
```
SELECT stage,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_in_stage) AS p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY days_in_stage) AS p75,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY days_in_stage) AS p90,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY days_in_stage) AS p95
FROM ventures
GROUP BY stage
```

**Healthy benchmarks**:
| Stage | p50 (median) | p75 | p90 | Target Max |
|-------|-------------|-----|-----|-----------|
| GENERATED | 3 days | 5 days | 10 days | 14 days |
| QUALIFIED | 7 days | 14 days | 28 days | 42 days |
| STRUCTURED | 14 days | 30 days | 60 days | 90 days |
| BUILT | 21 days | 45 days | 90 days | 120 days |
| LAUNCHED | Ongoing | Ongoing | Ongoing | N/A |

**Alerts**:
- If p90 dwell time in GENERATED > 14 days, screen opportunity validation process
- If p75 dwell time in QUALIFIED > 21 days, check AddVenture module health and capacity
- If p90 dwell time in STRUCTURED > 90 days, escalate for resource constraints or blockers

---

## Module Dispatch Metrics

### Module Dispatch Success Rate

**Metric**: `bruce_core_module_dispatch_success_rate`
**Type**: Ratio (0-1)
**Dimensions**:
- `target_module`: opportunity, add-venture, brand, builder, market, operator, portfolio, etc.
- `dispatch_result`: success, timeout, failure

**Description**: Percentage of dispatches that complete successfully vs. timeout vs. explicit failure.

**Query examples**:
```
SELECT target_module,
  COUNTIF(status='COMPLETED') / COUNT(*) AS success_rate,
  COUNTIF(status='TIMEOUT') / COUNT(*) AS timeout_rate,
  COUNTIF(status='FAILED') / COUNT(*) AS failure_rate
FROM module_dispatches
GROUP BY target_module
```

**Healthy benchmarks by module**:
| Module | Success | Timeout | Failure |
|--------|---------|---------|---------|
| opportunity | >95% | <2% | <3% |
| add-venture | >92% | <3% | <5% |
| brand | >90% | <4% | <6% |
| builder | >90% | <4% | <6% |
| market | >93% | <3% | <4% |
| operator | >91% | <4% | <5% |
| portfolio | >85% | <5% | <10% |

**Alerts**:
- If success rate < 90%, investigate module availability and health
- If timeout rate > 5%, check module performance and increase timeout if justified
- If failure rate increasing trend, escalate to module team

---

### Module Execution Time (Latency)

**Metric**: `bruce_core_module_execution_time_ms`
**Type**: Histogram (latency)
**Dimensions**:
- `target_module`: Each downstream module
- `percentile`: p50, p75, p90, p95, p99

**Description**: How long each module takes to process dispatches.

**Query examples**:
```
SELECT target_module,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY execution_time_ms) AS p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) AS p95
FROM module_dispatches
WHERE status='COMPLETED'
GROUP BY target_module
```

**Healthy benchmarks**:
| Module | p50 | p95 | p99 | Timeout |
|--------|-----|-----|-----|---------|
| opportunity | 120s | 240s | 300s | 600s |
| add-venture | 150s | 300s | 420s | 900s |
| brand | 180s | 360s | 480s | 900s |
| builder | 240s | 480s | 600s | 1200s |
| market | 120s | 240s | 300s | 600s |
| operator | 180s | 300s | 420s | 900s |
| portfolio | 300s | 600s | 900s | 3600s |

**Alerts**:
- If p95 execution time increasing trend, module may have resource constraints or increasing complexity
- If p99 exceeds timeout by >20%, consider increasing timeout

---

## Gate Evaluation Metrics

### Gate Evaluation Time

**Metric**: `bruce_core_gate_evaluation_time_ms`
**Type**: Histogram (latency)
**Dimensions**:
- `gate_id`: Each gate type
- `percentile`: p50, p75, p90, p95

**Description**: How long gate-enforcer takes to evaluate each gate.

**Query examples**:
```
SELECT gate_id,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY evaluation_time_ms) AS p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY evaluation_time_ms) AS p95
FROM gate_evaluations
GROUP BY gate_id
```

**Healthy benchmarks**:
| Gate | p50 | p95 | Target |
|------|-----|-----|--------|
| post-screening | 30s | 90s | <120s |
| post-structuring | 45s | 120s | <180s |
| post-build | 60s | 150s | <180s |
| post-launch | 45s | 120s | <180s |

**Alerts**:
- If evaluation time exceeds timeout, gate-enforcer may have resource issues

---

### Gate Score Distribution

**Metric**: `bruce_core_gate_score_distribution`
**Type**: Histogram (values)
**Dimensions**:
- `gate_id`: Each gate
- `bucket`: 0-20, 20-40, 40-60, 60-80, 80-100

**Description**: Distribution of scores across gate buckets. Used to detect threshold calibration issues.

**Healthy patterns**:
- Should see bimodal distribution: cluster of high scores (auto-pass) and cluster of low scores (auto-fail)
- Human review range (40-65) should be 20-35% of decisions
- Avoid uniform distribution (suggests gate criteria unclear)

**Alerts**:
- If all scores cluster in human review range (40-65), thresholds need recalibration
- If all scores above threshold, gate may be too easy or criteria too loose

---

## Human Review Metrics

### Human Review Rate

**Metric**: `bruce_core_human_review_rate`
**Type**: Ratio (0-1)
**Dimensions**:
- `review_type`: gate-borderline, escalation, manual-override
- `review_outcome`: approved, rejected, escalated

**Description**: Percentage of decisions requiring human review and outcomes of those reviews.

**Query examples**:
```
SELECT review_type,
  COUNTIF(outcome='APPROVED') / COUNT(*) AS approval_rate,
  COUNTIF(outcome='REJECTED') / COUNT(*) AS rejection_rate
FROM human_reviews
GROUP BY review_type
```

**Healthy benchmarks**:
- Gate-borderline review rate: 15-35% of all gate decisions
- Approval rate on borderline: 50-70% (ventures close to threshold have ~50/50 chance)
- Escalation rate: <5% of all decisions
- Escalation approval rate: 30-50% (escalations are riskier)

**Alerts**:
- If approval rate on borderline < 40% or > 80%, thresholds may be misaligned
- If escalation rate > 8%, investigate what's driving escalations

---

### Human Review Response Time (SLA)

**Metric**: `bruce_core_human_review_sla_time_minutes`
**Type**: Histogram (latency)
**Dimensions**:
- `review_type`: Each review type
- `percentile`: p50, p75, p90
- `sla_status`: met, missed

**Description**: How long human operators take to complete reviews vs. SLA targets.

**Query examples**:
```
SELECT review_type,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_minutes) AS p50,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY response_time_minutes) AS p90,
  COUNTIF(response_time_minutes <= sla_minutes) / COUNT(*) AS sla_met_rate
FROM human_reviews
GROUP BY review_type
```

**SLA targets**:
| Review Type | p50 Target | p90 Target | Escalation Threshold |
|-------------|-----------|-----------|----------------------|
| gate-borderline | 120 min | 480 min | 720 min |
| escalation | 240 min | 960 min | 1440 min |

**Alerts**:
- If p90 response time > SLA by >20%, add operator capacity
- If escalation rate > 10% of reviews, queue is overloaded
- If SLA met rate < 85%, escalate for staffing

---

## Error and Reliability Metrics

### Workflow Failure Rate

**Metric**: `bruce_core_workflow_failure_rate`
**Type**: Ratio (0-1)
**Dimensions**:
- `workflow_id`: venture-onboarding, module-dispatch, gate-evaluation, portfolio-review-trigger
- `failure_reason`: validation_error, module_timeout, module_failure, escalation_timeout, state_error

**Description**: What percentage of workflow runs fail and why.

**Query examples**:
```
SELECT workflow_id, failure_reason,
  COUNT(*) AS failure_count,
  COUNT(*) / (SELECT COUNT(*) FROM workflows WHERE id=workflow_id) AS failure_rate
FROM workflow_failures
GROUP BY workflow_id, failure_reason
```

**Healthy benchmarks**: <2% failure rate per workflow

**Alerts**:
- If failure rate > 3%, investigate failure reasons
- If specific failure reason accelerating, escalate

---

### Module Timeout Incidence

**Metric**: `bruce_core_module_timeout_count` and `bruce_core_module_timeout_rate`
**Type**: Counter and Ratio
**Dimensions**:
- `target_module`: Each module
- `timeout_seconds`: Timeout threshold that was exceeded

**Description**: How often modules fail to acknowledge or complete within timeout.

**Query examples**:
```
SELECT target_module, COUNT(*) AS timeout_count
FROM module_dispatches
WHERE status='TIMEOUT'
GROUP BY target_module
ORDER BY timeout_count DESC
```

**Healthy benchmarks**: <3 timeouts per module per day

**Alerts**:
- If timeout count for a module > 5 in a day, escalate to module team
- If module timeout rate increasing trend, may indicate degrading health

---

## Operational Health Dashboard

### System-Level KPIs

| KPI | Metric | Healthy Range | Measurement Frequency |
|-----|--------|---------------|----------------------|
| Venture onboarding throughput | ventures/day entering QUALIFIED | 2-5 | Daily |
| Average time to QUALIFIED | days from GENERATED | 3-10 | Daily |
| Gate quality | pass rate vs baseline | 50±10% | Weekly |
| Module reliability | success rate | >92% | Daily |
| Human review SLA | % reviews met SLA | >85% | Daily |
| Portfolio review cycle duration | hours to complete | <6 | Per cycle |
| System uptime | % time available | >99.5% | Daily |

### Real-Time Dashboard Queries

**Weekly venture velocity**:
```
SELECT DATE_TRUNC(created_at, WEEK) AS week,
  COUNT(CASE WHEN stage='QUALIFIED') AS ventures_qualified,
  COUNT(CASE WHEN stage='STRUCTURED') AS ventures_structured,
  COUNT(CASE WHEN stage='LAUNCHED') AS ventures_launched
FROM ventures
GROUP BY week
ORDER BY week DESC
LIMIT 13
```

**Module health summary**:
```
SELECT target_module,
  COUNT(*) AS total_dispatches,
  COUNTIF(status='COMPLETED') AS successful,
  COUNTIF(status='TIMEOUT') AS timeouts,
  COUNTIF(status='FAILED') AS failures,
  ROUND(COUNTIF(status='COMPLETED')/COUNT(*), 3) AS success_rate,
  ROUND(AVG(execution_time_ms)/1000, 1) AS avg_time_seconds
FROM module_dispatches
WHERE dispatched_at > CURRENT_TIMESTAMP() - INTERVAL 7 DAY
GROUP BY target_module
ORDER BY success_rate ASC
```

**Venture stage progression**:
```
SELECT
  DATE_TRUNC(stage_entry_time, DAY) AS day,
  FROM_STAGE,
  TO_STAGE,
  COUNT(*) AS transitions,
  ROUND(AVG(TIMESTAMP_DIFF(stage_exit_time, stage_entry_time, DAY)), 1) AS avg_days_in_stage
FROM venture_stage_transitions
WHERE stage_entry_time > CURRENT_TIMESTAMP() - INTERVAL 30 DAY
GROUP BY day, FROM_STAGE, TO_STAGE
ORDER BY day DESC, FROM_STAGE
```
