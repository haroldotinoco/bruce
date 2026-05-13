# Portfolio — Technical Documentation

## 1. System Architecture

Portfolio is designed as a **multi-agent analytics and decision system** that continuously monitors venture metrics, applies scoring rubrics, detects red flags, and produces binding allocation decisions. The architecture separates data ingestion, analysis, and decision-making into distinct layers.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│         Portfolio Dashboard · Report UI · API            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 ORCHESTRATION LAYER                      │
│        NestJS Backend · Job Queue · State Manager        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 ANALYTICS PIPELINE                       │
│    Metric Ingestion → Analysis → Scoring → Detection    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  DECISION LAYER                          │
│        AI Governance Agent · Rule Engine · Approvals     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               EXECUTION & INTEGRATION                    │
│    Bruce Core API · Module APIs · Storage · Memory      │
└─────────────────────────────────────────────────────────┘
```

## 2. Architectural Layers

### Layer A — Metric Ingestion (Real-time)

**Purpose**: Continuously collect and normalize venture metrics from all modules.

**Engines**: Stream processors (Kafka, RabbitMQ, or Redis Streams)

**Input**: Real-time metric events from:
- StartupOps (CAC, retention, engagement, revenue, churn)
- Builder (deployments, errors, uptime, code quality)
- GTM (traffic, leads, campaign ROI, content engagement)
- BrandAid (brand perception, messaging clarity)

**Normalization**: All incoming metrics are normalized to a standard schema:

```json
{
  "venture_id": "uuid",
  "metric_type": "string",
  "metric_name": "string",
  "value": "number",
  "unit": "string",
  "timestamp": "ISO8601",
  "source_module": "string",
  "confidence": "0.0–1.0",
  "tags": ["string"]
}
```

**Storage**: Time-series database (InfluxDB, TimescaleDB, or similar) for efficient querying and aggregation.

**Key constraint**: All metrics must have ≤7-day freshness. Metrics older than 7 days are flagged as stale.

### Layer B — Comparative Analysis (Periodic)

**Purpose**: Analyze venture metrics in context of peer ventures and benchmarks.

**Frequency**: Weekly or bi-weekly analysis cycles

**Agents**: Portfolio Analyst (LLM-powered reasoning engine)

**Process**:
1. For each active venture, retrieve:
   - All metrics from the past analysis period
   - Historical trajectory for the past 8 weeks
   - Peer ventures' metrics (same category or stage)
   - Explicit benchmarks (industry standards, Bruce targets)

2. Compute derived metrics:
   - **Trend velocity**: Is metric accelerating, stable, or declining?
   - **Peer percentile**: How does this venture rank among peers?
   - **Benchmark gap**: How far from target benchmarks?
   - **Runway estimate**: Based on burn rate, how many weeks of runway remain?
   - **Trajectory projection**: If current trend continues for 4 more weeks, what will metrics be?

3. Generate analysis document with narrative and visualizations.

**Output Schema**:

```json
{
  "venture_id": "uuid",
  "analysis_period": "ISO8601-ISO8601",
  "metrics": {
    "[metric_name]": {
      "current_value": "number",
      "previous_period": "number",
      "trend": "accelerating|stable|declining",
      "peer_percentile": "0–100",
      "benchmark_status": "exceeds|meets|below",
      "projection_4weeks": "number"
    }
  },
  "narrative": "string",
  "key_changes": ["string"],
  "anomalies": ["string"],
  "overall_health_trend": "improving|stable|declining"
}
```

### Layer C — Health Scoring (Periodic)

**Purpose**: Synthesize multi-dimensional venture health into standardized scores.

**Frequency**: Weekly or bi-weekly, following analysis cycles

**Agents**: Risk Monitor (LLM-powered reasoning + rule engine)

**Scoring Rubric** (stage-dependent):

#### Stage 1 — Hypothesis Validation
- Opportunity thesis still credible? (0–25 points)
- Learning velocity high? (0–25 points)
- Team intact and motivated? (0–25 points)
- Runway adequate? (0–25 points)
- **Total**: 0–100

#### Stage 2 — Product Development
- Product coherence strong? (0–20 points)
- Technical execution on track? (0–20 points)
- Differentiation clear? (0–20 points)
- Timeline achievable? (0–20 points)
- Team stability? (0–20 points)
- **Total**: 0–100

#### Stage 3 — Product-Market Fit
- User engagement high? (0–25 points)
- Retention rates healthy? (0–25 points)
- Unit economics viable? (0–25 points)
- Market signal positive? (0–25 points)
- **Total**: 0–100

#### Stage 4 — Growth
- CAC acceptable? (0–20 points)
- LTV:CAC ratio healthy? (0–20 points)
- Acquisition model scalable? (0–20 points)
- Retention stable? (0–20 points)
- Viral or network effects? (0–20 points)
- **Total**: 0–100

#### Stage 5 — Scale
- Revenue growing >20% month-over-month? (0–20 points)
- Unit economics improving? (0–20 points)
- Margins expanding? (0–20 points)
- Market share growing? (0–20 points)
- Operations scalable? (0–20 points)
- **Total**: 0–100

**Output Schema**:

```json
{
  "venture_id": "uuid",
  "stage": "1|2|3|4|5",
  "overall_health_score": "0–100",
  "dimension_scores": {
    "traction_score": "0–100",
    "efficiency_score": "0–100",
    "execution_score": "0–100",
    "risk_score": "0–100",
    "upside_score": "0–100"
  },
  "percentiles": {
    "traction_percentile": "0–100",
    "efficiency_percentile": "0–100",
    "risk_percentile": "0–100",
    "upside_percentile": "0–100"
  },
  "health_trend": "improving|stable|declining",
  "decision_confidence": "0–100"
}
```

### Layer D — Red Flag Detection (Continuous)

**Purpose**: Identify ventures approaching kill, pause, pivot, or acceleration thresholds.

**Frequency**: Continuous monitoring; alerts triggered when thresholds crossed.

**Agents**: Anomaly Detector (rule engine + pattern matcher)

**Rules** (all thresholds configurable):

#### Kill Flags
- `no_traction_8weeks`: Last 8 weeks of metrics flat or declining
- `unit_economics_broken`: CAC > 2 × LTV with no improvement trajectory
- `founder_attrition`: Key agents unresponsive for >10 days
- `thesis_disproven`: Core hypothesis tested and failed
- `technical_blocker`: Architectural debt exceeds payoff
- `market_closed`: Target market inaccessible

#### Pause Flags
- `ambiguous_signals`: Metrics conflicting or unclear; uncertainty >50%
- `pending_external`: Awaiting partnership, customer decision, regulatory
- `resource_constraint`: System at capacity
- `founder_request`: Explicit pause request from venture leads

#### Acceleration Flags
- `high_traction`: Growth in top quartile
- `strong_unit_economics`: CAC < 0.5 × LTV and improving
- `team_executing`: Milestones met on time, high quality
- `market_receptive`: Market signals larger than estimated

#### Pivot Flags
- `thesis_shift_opportunity`: Market signals suggest different thesis
- `execution_sound_market_wrong`: Team excellent but PMF not forming
- `adjacent_opportunity`: Related market more viable

#### Cannibalization Flags
- `market_overlap`: Venture A and B serve same customer segment
- `feature_duplication`: Venture A's core feature exists in Venture B

**Output Schema**:

```json
{
  "venture_id": "uuid",
  "flags": [
    {
      "flag_type": "kill|pause|accelerate|pivot|cannibalization",
      "severity": "critical|high|medium|low",
      "triggered_at": "ISO8601",
      "rule_id": "string",
      "metric_context": { "[metric_name]": "value" },
      "explanation": "string"
    }
  ],
  "action_recommended": "kill|pause|accelerate|pivot|continue|investigate",
  "urgency": "immediate|1week|2weeks|routine"
}
```

### Layer E — Decision Engine (Periodic)

**Purpose**: Convert detected flags into binding allocation decisions.

**Frequency**: Every 2–4 weeks (configurable)

**Agents**: Governance Agent (LLM reasoning + decision authority)

**Process**:
1. For each flagged venture, retrieve:
   - All flags and their details
   - Historical precedents (has this pattern occurred before?)
   - Bruce Memory insights (what happened to similar ventures?)
   - Strategic context (does this fit portfolio thesis?)

2. Apply decision criteria (rules defined in section 6.2 of Functional doc)

3. Generate AllocationDecision document with:
   - Decision (kill/pause/accelerate/pivot/continue)
   - Rationale (specific criteria and data)
   - Resource changes
   - Next milestones
   - Review date

4. Format for execution and communication

**Output Schema**:

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "decision": "kill|pause|accelerate|pivot|continue",
  "rationale": "string",
  "criteria_met": ["string"],
  "resource_changes": {
    "agent_allocation": "number",
    "computational_budget": "number",
    "priority_rank": "number"
  },
  "next_milestones": ["string"],
  "review_date": "ISO8601",
  "confidence": "0–100",
  "signature": "string",
  "created_at": "ISO8601",
  "effective_date": "ISO8601"
}
```

### Layer F — Execution & Integration

**Purpose**: Execute decisions and maintain state across Bruce.

**Frequency**: Immediate to 1 week after decision approval.

**Agents**: Allocation Agent (state manager + integrator)

**Actions**:

#### Accelerate Execution
- Call Bruce Core API to update venture priority rank
- Call StartupOps API to increase budget cap
- Call Builder API to allocate more agent capacity
- Call GTM API to expand campaigns
- Send notification to venture leads

#### Pause Execution
- Call Bruce Core API to mark venture as paused
- Call all module APIs to freeze non-critical work
- Archive current state in Portfolio database

#### Kill Execution
- Call Bruce Core API to mark venture as terminated
- Call all modules to execute shutdown workflow:
  - StartupOps: finalize metrics, create summary
  - Builder: archive code, document architecture
  - GTM: shutdown channels, collect final metrics
  - BrandAid: finalize brand assets
- Feed kill decision + learnings to Bruce Memory
- Archive all venture assets

#### Pivot Execution
- Call relevant modules with pivot directive
- Coordinate with Builder on architectural changes
- Monitor execution on new trajectory

## 3. Core Data Schema

### 3.1 PortfolioEntry

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "created_at": "ISO8601",
  "stage": "1|2|3|4|5",
  "status": "active|paused|pivoting|killed|graduated",
  "founder_agent_id": "uuid",
  "metrics_last_updated": "ISO8601",
  "overall_health_score": "0–100",
  "health_trend": "improving|stable|declining",
  "traction_percentile": "0–100",
  "efficiency_percentile": "0–100",
  "upside_percentile": "0–100",
  "current_flags": ["string"],
  "last_allocation_decision_id": "uuid",
  "last_allocation_decision_at": "ISO8601",
  "next_review_date": "ISO8601",
  "computational_budget": "number",
  "portfolio_rank": "number"
}
```

### 3.2 VentureScore

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "created_at": "ISO8601",
  "stage": "1|2|3|4|5",
  "overall_health_score": "0–100",
  "dimension_scores": {
    "traction": "0–100",
    "efficiency": "0–100",
    "execution": "0–100",
    "risk": "0–100",
    "upside": "0–100"
  },
  "percentiles": {
    "traction_percentile": "0–100",
    "efficiency_percentile": "0–100",
    "risk_percentile": "0–100",
    "upside_percentile": "0–100"
  },
  "health_trend": "improving|stable|declining",
  "confidence": "0–100",
  "notes": "string"
}
```

### 3.3 AllocationDecision

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "decision": "kill|pause|accelerate|pivot|continue",
  "rationale": "string",
  "criteria_met": ["string"],
  "criteria_not_met": ["string"],
  "resource_delta": {
    "agent_allocation_change": "number",
    "budget_change": "number",
    "priority_change": "number"
  },
  "next_milestones": ["string"],
  "review_date": "ISO8601",
  "dependencies": ["venture_id"],
  "confidence": "0–100",
  "authorized_by": "governance-agent",
  "created_at": "ISO8601",
  "effective_date": "ISO8601",
  "status": "pending|active|executed|superseded",
  "notes": "string"
}
```

### 3.4 KillRecommendation

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "kill_criteria": ["string"],
  "failure_analysis": "string",
  "learnings": {
    "what_worked": ["string"],
    "what_failed": ["string"],
    "hypotheses_invalidated": ["string"],
    "success_signals_absent": ["string"]
  },
  "assets_to_preserve": ["string"],
  "shutdown_timeline": "ISO8601",
  "shutdown_checklist": ["string"],
  "opportunity_cost_recovery": "string",
  "recommendations_for_next": ["string"],
  "created_at": "ISO8601"
}
```

### 3.5 PortfolioReport

```json
{
  "id": "uuid",
  "period_start": "ISO8601",
  "period_end": "ISO8601",
  "generated_at": "ISO8601",
  "venture_summaries": [
    {
      "venture_id": "uuid",
      "rank": "number",
      "health_score": "0–100",
      "key_metrics": { "[metric]": "value" },
      "status": "string",
      "decision_pending": "boolean"
    }
  ],
  "decisions_made": ["AllocationDecision"],
  "risk_summary": {
    "high_risk_ventures": ["venture_id"],
    "imminent_kills": ["venture_id"],
    "needs_attention": ["venture_id"]
  },
  "opportunity_summary": {
    "high_upside_ventures": ["venture_id"],
    "ready_for_acceleration": ["venture_id"]
  },
  "portfolio_health_trend": "improving|stable|declining",
  "overall_coherence_score": "0–100",
  "category_performance": {
    "[category]": {
      "active_ventures": "number",
      "avg_health": "0–100",
      "performance": "strong|mixed|weak"
    }
  },
  "strategic_recommendations": ["string"],
  "next_analysis_date": "ISO8601"
}
```

## 4. Technology Stack

### Orchestration

| Component               | Technology                                             |
| ----------------------- | ------------------------------------------------------ |
| **Backend**             | Node.js / NestJS                                       |
| **Primary database**    | MongoDB (Mongoose) for portfolio entries, decisions, reports |
| **Time-series database**| InfluxDB or TimescaleDB for metric ingestion and queries |
| **Job Queue**           | Bull / BullMQ (Redis-backed) for analysis and decision cycles |
| **Stream Processing**   | Kafka, RabbitMQ, or Redis Streams for metric ingestion |
| **State Management**    | Redis for real-time portfolio state and flags          |
| **Storage**             | S3-compatible for historical reports and decision archives |

### AI Services

| Service                            | Role                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| **OpenAI API (Responses API)**     | Comparative analysis, scoring rubric application, decision making, anomaly interpretation                       |
| **OpenAI Structured Outputs**      | JSON Schema enforcement on all LLM responses (VentureScore, AllocationDecision, PortfolioReport)                 |

### Analytics & Querying

| Component            | Technology                                                           |
| -------------------- | -------------------------------------------------------------------- |
| **Analytics**        | InfluxDB Query Language or SQL (for TimescaleDB) for metric analysis |
| **Visualization**    | Grafana or similar for portfolio dashboards                          |
| **Reporting**        | React + D3.js or similar for interactive reports                     |

## 5. API Design (High-Level)

### Portfolio Management

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/portfolio`                           | GET    | Retrieve current portfolio report              |
| `/portfolio/ventures`                  | GET    | List all active ventures with scores           |
| `/portfolio/venture/:ventureId/score`  | GET    | Retrieve latest VentureScore                   |
| `/portfolio/venture/:ventureId/flags`  | GET    | Retrieve current flags for venture             |
| `/portfolio/venture/:ventureId/history`| GET    | Retrieve decision history for venture          |

### Analysis & Reporting

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/portfolio/analyze`                   | POST   | Trigger analysis cycle (admin)                 |
| `/portfolio/score`                     | POST   | Trigger scoring cycle (admin)                  |
| `/portfolio/detect`                    | POST   | Trigger flag detection (admin)                 |
| `/portfolio/report`                    | GET    | Retrieve latest portfolio report               |
| `/portfolio/report/:reportId`          | GET    | Retrieve historical report                     |

### Decision & Execution

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/portfolio/decisions`                 | GET    | List all allocation decisions                  |
| `/portfolio/decisions/:decisionId`     | GET    | Retrieve specific decision                     |
| `/portfolio/decisions`                 | POST   | Create new allocation decision (admin)         |
| `/portfolio/decisions/:decisionId/approve` | POST | Approve decision (governance auth required)    |
| `/portfolio/decisions/:decisionId/execute` | POST | Execute approved decision                      |
| `/portfolio/kill/:ventureId`           | POST   | Initiate kill workflow                         |

### Integration Points

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/portfolio/metrics/ingest`            | POST   | Ingest metric from upstream modules            |
| `/portfolio/venture/:ventureId/allocate` | POST | Update resource allocation (from Bruce Core)   |
| `/portfolio/memory/feed`               | POST   | Feed decision/learning to Bruce Memory         |

## 6. Operational Flows

### Metric Ingestion Flow

```
[StartupOps/Builder/GTM]
       │ (metric event)
       ▼
┌──────────────────┐
│ Stream Processor │ ──► Normalize metric schema
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Time-Series DB   │ ──► Store with timestamp
└────────┬─────────┘
         │
         ▼
[Available for queries]
```

### Analysis Cycle Flow

```
[Scheduled: weekly/bi-weekly]
         │
         ▼
┌──────────────────┐
│ Portfolio Analyst│ ──► Retrieve metrics for all ventures
└────────┬─────────┘
         │
         ▼
[Comparative Analysis]
         │
         ▼
[Store analysis results]
         │
         ▼
[Trigger scoring cycle]
```

### Decision Cycle Flow

```
[Flags detected]
       │
       ▼
┌──────────────────┐
│ Governance Agent │ ──► Apply decision criteria
└────────┬─────────┘
         │
         ▼
[Generate AllocationDecision]
         │
         ▼
[If kill: create KillRecommendation]
         │
         ▼
[Sign with governance authority]
         │
         ▼
[Queue for execution]
```

## 7. Non-Functional Requirements

| Requirement                  | Target                                         |
| ---------------------------- | ---------------------------------------------- |
| **Analysis latency**         | Analysis cycles complete within 2 hours       |
| **Decision latency**         | Decisions generated within 4 hours of trigger |
| **Metric ingestion latency** | Metrics queryable within 30 seconds of arrival |
| **API response time**        | <500ms for all portfolio queries               |
| **Availability**             | 99.5% uptime                                   |
| **Data retention**           | All metrics retained for 2+ years              |
| **Auditability**             | All decisions logged with full context         |
| **Concurrency**              | Support analysis of 50+ ventures simultaneously |
| **Scalability**              | Linear performance degradation up to 200 ventures |

## 8. Deployment Considerations

| Concern               | Approach                                                                     |
| --------------------- | ---------------------------------------------------------------------------- |
| **Long-running jobs** | Async pipeline with job queue; webhook/polling for status                    |
| **Cost management**   | Token budgets per analysis cycle; model selection by decision complexity     |
| **Caching**           | Cache analysis results for re-querying; cache Bruce Memory patterns         |
| **Idempotency**       | Each decision cycle is rerunnable without side effects                       |
| **Versioning**        | Every decision version is stored; decisions can be superseded but not deleted|
| **Rate limits**        | Respect OpenAI API rate limits with backoff strategies                       |
| **Security**          | API key management via secrets; venture data isolation per Bruce instance   |
| **Monitoring**        | Alert on metric staleness, analysis failures, decision approval backlog     |
