# Correlation IDs and Tracing

## ID Scheme

### venture_id
- **Format**: `v-{NNNN}-{venture-slug}` (e.g., `v-0023-ai-compliance-saas`)
- **Generated**: By opportunity module when opportunity advances to add-venture
- **Scope**: Unique across all ventures in portfolio
- **Lifetime**: Permanent; used for archival and portfolio tracking
- **Propagation**: Included in all events, agent inputs, and outputs

### opportunity_id
- **Format**: `opp-{NNNN}-{market-slug}` (e.g., `opp-0089-fintech-compliance`)
- **Generated**: By market module when opportunity is identified
- **Scope**: Unique per opportunity
- **Lifetime**: References source opportunity; archived with venture dossier
- **Propagation**: Included in all volume inputs; serves as traceability to source

### structuring_run_id
- **Format**: `run-{YYYY-MM-DD}-{random-suffix}` (e.g., `run-2026-04-06-a7x2k`)
- **Generated**: When venture enters add-venture module (start of pipeline)
- **Scope**: Unique per execution of structuring pipeline
- **Lifetime**: Until completion (approved/rejected/escalated)
- **Use**: Distinguish retries and re-runs (if same venture re-enters module)
- **Propagation**: Included in all step events; stored in execution metadata

### volume_run_id
- **Format**: `vol-{volume_number}-{run_id}-{iteration_number}` (e.g., `vol-4-run-2026-04-06-a7x2k-2`)
- **Generated**: When agent begins work on volume (for each agent execution)
- **Scope**: Unique per volume execution (including iterations)
- **Lifetime**: Duration of agent work
- **Use**: Distinguish between first pass and iteration re-runs of same volume
- **Propagation**: Included in volume output; tracks iteration history

### iteration_count
- **Format**: Integer (0, 1, 2, 3)
- **Generated**: Incremented each time iteration workflow triggered
- **Scope**: Per venture, scoped by structuring_run_id
- **Lifetime**: Persistent across iterations
- **Use**: Determine if max iterations (3) reached
- **Propagation**: Included in critique events; triggers branching logic

### step_execution_id
- **Format**: `step-{step_id}-{random-suffix}` (e.g., `step-volume-4-xyz8m`)
- **Generated**: When each step begins execution
- **Scope**: Unique per step execution
- **Lifetime**: Duration of step
- **Use**: Correlate agent logs with workflow events
- **Propagation**: Included in agent input context; returned in agent output

## Event Propagation

### Event Header (All Events)
```json
{
  "event_id": "evt-{timestamp}-{random}",
  "venture_id": "{venture_id}",
  "opportunity_id": "{opportunity_id}",
  "structuring_run_id": "{structuring_run_id}",
  "volume_run_id": "{volume_run_id if applicable}",
  "iteration_count": {iteration_count},
  "step_id": "{step_id}",
  "timestamp": "2026-04-06T10:30:00Z"
}
```

### Example Event Chain for Critique Iteration

1. **venture.structuring.started**
   - venture_id: v-0023-ai-compliance-saas
   - structuring_run_id: run-2026-04-06-a7x2k
   - iteration_count: 0

2. **volume.4.completed** (first pass)
   - volume_run_id: vol-4-run-2026-04-06-a7x2k-0
   - iteration_count: 0

3. **critique.scored** (first critique)
   - structuring_run_id: run-2026-04-06-a7x2k
   - iteration_count: 0
   - overall_score: 68

4. **critique.iteration.triggered**
   - iteration_count: 1 (incremented)
   - weak_volumes: [4]
   - next_run_id: run-2026-04-06-a7x2k-iter1

5. **volume.4.completed** (second pass)
   - volume_run_id: vol-4-run-2026-04-06-a7x2k-1 (iteration 1)
   - iteration_count: 1

6. **critique.scored** (second critique)
   - iteration_count: 1
   - overall_score: 74

7. **critique.passed** → **dossier.composed**
   - Final structuring_run_id preserved for archival

## Tracing Through Modules

### Add-Venture → Brand-Aid Handoff
- venture_id preserved
- structuring_run_id included for audit trail
- brand_aid module receives Vol 6 with all correlation IDs intact

### Add-Venture → Builder Handoff
- venture_id preserved
- structuring_run_id included for audit trail
- builder module receives Vol 5 + Vol 8 with all correlation IDs intact

### Archival & Portfolio Tracking
- venture_id used as primary key for portfolio archival
- structuring_run_id included for execution history
- Allows tracing from source opportunity → structuring → downstream modules → outcomes

## Logging Integration

### Log Format
All logs from agents and system components include:
```
[{timestamp}] [{venture_id}] [{step_id}] [{volume_run_id}] {message}
```

### Example Agent Log Entry
```
[2026-04-06T10:35:00Z] [v-0023-ai-compliance-saas] [volume-4] [vol-4-run-2026-04-06-a7x2k-1]
Starting business-model-modeler for iteration 1
```

### Log Aggregation
Central log aggregation indexed by:
- venture_id (primary)
- structuring_run_id (execution tracking)
- volume_run_id (specific volume history)
- Allows drilling down: venture → all executions → specific volume iterations

## Debugging & Troubleshooting

### Retrieve Full Execution History
```
Query: logs WHERE venture_id = "v-0023-ai-compliance-saas"
Returns: All events and logs for this venture across all iterations and hand-offs
```

### Identify Iteration Impact
```
Query: logs WHERE structuring_run_id = "run-2026-04-06-a7x2k" AND iteration_count > 0
Returns: All logs from iteration cycles only
```

### Trace Volume-Specific Issues
```
Query: logs WHERE volume_run_id LIKE "vol-4-run-2026-04-06-a7x2k%"
Returns: All executions of Vol 4 (first pass + iterations)
```

## Data Retention

### Online (Hot) Logs
- 30 days: Full event stream with correlation IDs
- Indexed for real-time dashboard and alerts

### Archive (Warm) Logs
- 1 year: Compressed archival in S3 by venture_id
- Used for post-hoc analysis and learning

### Portfolio Database
- Permanent: venture_id and structuring_run_id linked to final dossier in portfolio database
- Historical tracing: Can reconstruct execution path from any venture
