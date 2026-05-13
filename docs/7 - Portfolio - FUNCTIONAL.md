# Portfolio — Functional Documentation

## 1. Overview

Portfolio is an AI-driven governance system that operates the Bruce ecosystem as a disciplined, continually evaluated portfolio of ventures. Rather than treating each venture in isolation, Portfolio compares all ventures against each other and explicit criteria, produces health scores, detects problems, and makes binding resource allocation decisions.

---

## 2. Objective

The objective of Portfolio is:

> **to ensure optimal allocation of computational capital across the Bruce venture portfolio by continuously evaluating performance, applying governance criteria, detecting problems, and making decisive allocation and kill decisions.**

Success is measured by:

- The percentage of killed ventures that were genuinely non-viable (avoiding false kills).
- The growth rate of accelerated ventures (indicating good selection).
- The speed of kill decisions (early termination = capital preservation).
- The reduction in average venture runtime for dead ventures (indicating good filtering).
- Overall portfolio health and coherence.

---

## 3. Expected Results

Portfolio produces three primary classes of results:

### 3.1 PortfolioReport

A comprehensive snapshot of the entire portfolio, produced weekly, bi-weekly, or monthly:

| Element                  | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| **Venture roster**       | All active ventures with current health scores and traction metrics   |
| **Comparative analysis** | Ranking of ventures by multiple dimensions (traction, efficiency, CAC, LTV) |
| **Risk summary**         | Which ventures are closest to kill thresholds or need immediate attention |
| **Opportunity summary**  | Which ventures have highest potential and deserve acceleration        |
| **Portfolio thesis**     | Is the overall portfolio coherent? Are we still pursuing the right categories? |
| **Reallocation plan**    | Resources that have been freed by kills and where they should go      |

### 3.2 AllocationDecision

A binding decision about a specific venture's future:

| Field                    | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| **Venture ID**           | Which venture this decision applies to                                |
| **Decision**             | Accelerate / Continue / Pause / Pivot / Kill                          |
| **Rationale**            | Specific data and criteria that led to this decision                  |
| **Resource changes**     | New computational allocation (if applicable)                          |
| **Next milestones**      | What must be true before the next review period                       |
| **Execution date**       | When this decision becomes effective                                  |
| **Review date**          | When the decision will be re-evaluated                                |
| **Dependencies**         | What other ventures or conditions affect this decision                |

### 3.3 VentureScore

A quantified health snapshot for a single venture:

| Dimension                | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| **Portfolio rank**       | Percentile ranking vs. all other active ventures (1–100)      |
| **Traction percentile**  | How this venture's growth metrics compare to others            |
| **Efficiency percentile**| Capital deployed vs. results achieved                          |
| **Risk percentile**      | Likelihood of failure in next evaluation period               |
| **Upside percentile**    | Potential revenue/impact if execution goes well               |
| **Health trend**         | Improving, stable, or declining                              |
| **Decision confidence**  | How confident Portfolio is in its recommendation              |

---

## 4. Main Flow

The Portfolio operational cycle repeats continuously:

```
Monitor ──► Analyze ──► Score ──► Detect ──► Decide ──► Communicate ──► Execute ──► [repeat]
```

### 4.1 Monitor (continuous)

**Input**: Live data streams from all venture modules.

**Agents**: Market Monitor, Metrics Ingester

**Process**:
- Continuously ingest metrics from StartupOps (CAC, retention, engagement, unit economics)
- Continuously ingest health signals from Builder (deployment, errors, performance)
- Continuously ingest traction signals from GTM (leads, signups, content engagement)
- Continuously ingest quality signals from BrandAid (brand perception, clarity, consistency)
- Store all signals in time-series database with timestamps

**Output**: Real-time metric streams, ingested into Portfolio's analytics layer.

### 4.2 Analyze (periodic: weekly or bi-weekly)

**Input**: Collected metric streams for all ventures

**Agents**: Comparative Analyst, Trend Analyst

**Process**:
- Compare each venture's metrics against:
  - Its own historical trends (is it accelerating or slowing?)
  - Peer ventures in the same category (is it outperforming or underperforming?)
  - Explicit benchmarks (CAC should be <$20, payback period <12 months, etc.)
- Identify anomalies (sudden drops, unexpected spikes)
- Project forward: if current trajectory continues, will this venture succeed?
- Assess effort-to-reward ratio: how much computational capital is this venture burning relative to its upside?

**Output**: Comparative analysis document, trend projections, anomaly flags.

### 4.3 Score (periodic: weekly or bi-weekly)

**Input**: Analysis results

**Agents**: Portfolio Analyst, Risk Monitor

**Process**:
- Apply stage-appropriate scoring rubric to each venture:
  - **Stage 1 (hypothesis)**: Does the opportunity thesis still look real? Are we learning fast?
  - **Stage 2 (product)**: Is the product coherent and differentiated? Is it buildable within timeline?
  - **Stage 3 (market fit)**: Do early users show retention and engagement? Unit economics look viable?
  - **Stage 4 (growth)**: Does the acquisition model work? Is retention stable? Is there virality or networkness?
  - **Stage 5 (scale)**: Can the business scale without proportional cost increases? Are margins improving?
- Aggregate scores into:
  - Overall health score (0–100)
  - Traction percentile (where this venture ranks among peers)
  - Efficiency percentile (resources burned vs. results)
  - Risk percentile (probability of failure)
  - Upside percentile (potential return if everything goes right)

**Output**: Scored venture profiles, percentile rankings, health trends.

### 4.4 Detect (periodic: weekly or bi-weekly)

**Input**: Scored ventures, historical decisions, Bruce Memory

**Agents**: Risk Monitor, Anomaly Detector, Pattern Matcher

**Process**:
- Watch for red flags:
  - **Kill signals**: Did the venture hit a kill threshold? (e.g., CAC > payback period, zero retention, founder attrition)
  - **Pause signals**: Is there ambiguity? Is the venture waiting on critical data? (e.g., A/B test results, partnership decision)
  - **Pivot signals**: Is the execution sound but the market wrong? Should the thesis be adjusted?
  - **Cannibalization signals**: Does this venture directly compete with another Bruce venture?
  - **Opportunity signals**: Has new data made an underperforming venture suddenly interesting? (e.g., niche expansion opportunity)
- Cross-reference with Bruce Memory:
  - Have we seen similar ventures before? What happened to them?
  - Are we repeating known patterns?
  - Are we missing known success factors?

**Output**: Exception reports, problem flagging, recommended actions.

### 4.5 Decide (periodic: every 2–4 weeks)

**Input**: Detected problems, historical decisions, explicit governance criteria

**Agents**: Portfolio Analyst, Governance Agent, Decision Authority

**Process**:
- For each flagged venture, apply decision criteria:
  - If kill signal triggered: **recommend kill**. Verify against explicit kill criteria (is this truly non-viable?). Document reasoning.
  - If pause signal triggered: **recommend pause**. Define what data is needed to move forward. Set review date.
  - If traction signal strong: **recommend accelerate**. Define new resource allocation.
  - If stable and viable: **recommend continue**. Set next review date.
  - If cannibalizing: **recommend merge** or **pivot** one of the ventures.
- Format as formal AllocationDecision documents
- For all kill decisions, coordinate with StartupOps and Builder on clean shutdown

**Output**: AllocationDecision documents for each exception, signed off by Portfolio governance authority.

### 4.6 Communicate (periodic: every 2–4 weeks)

**Input**: AllocationDecision documents, PortfolioReport, VentureScores

**Agents**: Communications Agent

**Process**:
- Package allocation decisions into clear communication:
  - Email to each venture's lead agent (within BrandAid, Builder, GTM, StartupOps)
  - Update to Bruce Core about new allocations
  - Public PortfolioReport to all stakeholders
- Provide rationale in each communication (why was this decision made?)
- Include next milestones and success criteria

**Output**: Decision notifications, portfolio reports, milestone definitions.

### 4.7 Execute (continuous: immediately after decisions)

**Input**: AllocationDecision, execution orders

**Agents**: Allocation Agent, Resource Manager

**Process**:
- For **Accelerate** decisions: Increase agent availability, increase budget cap, trigger GTM expansion, notify stakeholders
- For **Continue** decisions: No action; maintain current course
- For **Pause** decisions: Halt progress on non-critical workstreams; preserve what's done; set re-entry criteria
- For **Pivot** decisions: Notify venture's lead agents; coordinate with Builder for architectural changes
- For **Kill** decisions:
  - Trigger clean shutdown workflow: save learnings, archive code, preserve analytics
  - Feed learnings into Bruce Memory
  - Reallocate freed computational resources
  - Notify stakeholders

**Output**: Updated resource allocations, Bruce Core updates, Begin shutdown workflows.

---

## 5. Agent Roles

Portfolio operates through four specialized agents, each with distinct responsibilities:

### 5.1 Portfolio Analyst

| Property       | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| **Role**       | Continuous monitoring and scoring of venture health                      |
| **Input**      | Real-time metrics from all modules; historical venture data             |
| **Output**     | Comparative analysis, VentureScores, trend projections                  |
| **Authority**  | None; provides analysis to Risk Monitor and Governance Agent             |
| **Key tasks**  | Metric ingestion, trend analysis, percentile calculation, benchmarking   |

### 5.2 Risk Monitor

| Property       | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| **Role**       | Detecting red flags, anomalies, and problem ventures                     |
| **Input**      | VentureScores, comparative analysis, anomaly alerts, Bruce Memory       |
| **Output**     | Exception reports, red flag alerts, recommended actions                  |
| **Authority**  | Can trigger escalation to Governance Agent when thresholds are crossed   |
| **Key tasks**  | Kill signal detection, pause signal detection, cannibalization detection |

### 5.3 Allocation Agent

| Property       | Description                                                              |
| -------------- | -------------------------------------------------------------- |
| **Role**       | Executing allocation decisions and managing resource flow      |
| **Input**      | AllocationDecision documents, execution orders                 |
| **Output**     | Updated resource allocations, API calls to module orchestrators |
| **Authority**  | Can reallocate computational resources and trigger workflows    |
| **Key tasks**  | Resource budgeting, agent allocation, pipeline triggering      |

### 5.4 Governance Agent

| Property       | Description                                                              |
| -------------- | --------------------------------------------------------------------------- |
| **Role**       | Making final allocation and kill decisions based on criteria              |
| **Input**      | Exception reports, analysis, decision criteria, historical precedents    |
| **Output**     | Formal AllocationDecision documents with signatures                      |
| **Authority**  | **Binding** — these decisions are final and cannot be overridden at module level |
| **Key tasks**  | Decision making, criteria application, documentation, kill authorization  |

---

## 6. Rules

### 6.1 Kill Criteria

A venture **must be killed** if:

- **No traction for 8+ weeks**: Zero growth, zero engagement, zero revenue for more than 2 evaluation cycles.
- **Unit economics unsalvageable**: CAC exceeds lifetime value by >2x with no path to improvement.
- **Founder/agent attrition**: Lead agents have left or are unresponsive.
- **Core thesis disproven**: The foundational hypothesis has been tested and failed.
- **Architectural blocker**: The product has a fundamental technical flaw that cannot be solved.
- **Market closed**: The target market has become inaccessible or disappeared.

A venture **may be killed** if:

- **Opportunity cost**: Computational resources would generate more value elsewhere.
- **Portfolio coherence**: The venture contradicts the overall portfolio thesis or duplicates another venture's market.
- **Runway expired**: The venture has reached its allotted timeline without hitting critical milestones.

### 6.2 Acceleration Criteria

A venture **should be accelerated** if:

- **Traction signals strong**: Engagement, retention, revenue, or user growth in top quartile.
- **Unit economics positive**: CAC < 0.5 × LTV or equivalent payback period < 6 months.
- **Founder/team executing well**: Agents are responsive, executing on time, meeting milestones.
- **Market receptive**: Early signals suggest larger addressable market than initially estimated.
- **Strategic fit**: Venture aligns with overall portfolio thesis and doesn't cannibalize others.

### 6.3 Pause Criteria

A venture **should be paused** if:

- **Ambiguous signals**: Metrics are unclear or conflicting; more data needed.
- **Pending external decision**: Awaiting partnership, customer decision, regulatory clarity, etc.
- **Temporary resource constraint**: System is at capacity; venture can wait without risk.
- **Founder request**: Venture lead asks for pause to regroup or test new direction.

### 6.4 Pivot Criteria

A venture **should be pivoted** if:

- **Thesis shift needed**: Market signals suggest different thesis would be stronger.
- **Execution sound but market wrong**: The team is excellent but product-market fit isn't forming on current path.
- **Opportunity adjacent**: A related opportunity became visible and is more viable.

### 6.5 Continue Criteria

A venture **should continue** unchanged if:

- **Stage-appropriate progress**: Achieving expected milestones for its stage.
- **No red flags**: No kill, pause, pivot, or acceleration criteria triggered.
- **Resource stable**: Current allocation is appropriate for stage and trajectory.

### 6.6 Decision Timeline

- **Monitoring**: Continuous (real-time metric ingestion)
- **Analysis cycles**: Weekly or bi-weekly
- **Scoring cycles**: Weekly or bi-weekly
- **Decision cycles**: Every 2–4 weeks (typically)
- **Kill decisions**: Execute within 24–48 hours of approval
- **Acceleration decisions**: Execute within 1 week of approval
- **Pause/continue decisions**: Communicate same week; execute following week

### 6.7 Data Freshness

- **All metrics must be ≤7 days old** before being used in analysis.
- **Missing metric data**: Treated as red flag; escalate to responsible module.
- **Outlier metrics**: Require secondary confirmation before being used in decisions.

### 6.8 Decision Reversibility

- **Pause decisions**: Reversible; can be resumed without loss of history.
- **Continue/accelerate decisions**: Reversible; can be downgraded if conditions change.
- **Pivot decisions**: Partially reversible; original thesis is archived but execution is irreversible.
- **Kill decisions**: Irreversible; venture is terminated and assets archived.

---

## 7. Integrations

Portfolio integrates deeply with all other Bruce modules:

### 7.1 Integration with StartupOps

| Flow                | Direction     | Content                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| **In**              | StartupOps → Portfolio | Operational metrics: CAC, retention, engagement, revenue, churn, unit economics |
| **Out**             | Portfolio → StartupOps | Allocation decisions; pause/kill execution orders; milestone updates |
| **Query capability**| Real-time    | Portfolio can query StartupOps for deep-dive metrics on any venture |

### 7.2 Integration with Builder

| Flow                | Direction     | Content                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| **In**              | Builder → Portfolio | Health signals: deployment frequency, error rates, uptime, code quality, architectural debt |
| **Out**             | Portfolio → Builder | Acceleration orders (increase capacity), pause orders (freeze changes), kill orders (shutdown workflow) |

### 7.3 Integration with GTM

| Flow                | Direction     | Content                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| **In**              | GTM → Portfolio | Traction signals: traffic, leads, campaign ROI, content engagement, viral coefficient |
| **Out**             | Portfolio → GTM | Accelerate (expand campaigns), pause (freeze spend), kill (shutdown channels) |

### 7.4 Integration with BrandAid

| Flow                | Direction     | Content                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| **In**              | BrandAid → Portfolio | Brand health signals: brand perception surveys, messaging clarity, visual consistency feedback |
| **Out**             | Portfolio → BrandAid | Accelerate (expand brand work), pause, kill (finalize brand assets) |

### 7.5 Integration with Opportunity SaaS

| Flow                | Direction     | Content                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| **In**              | Opportunity → Portfolio | Opportunity hypothesis updates; new market data on active ventures |
| **Out**             | Portfolio → Opportunity | Strategic Brief: which categories are proving viable; recommendations for next gen opportunities |

### 7.6 Integration with Bruce Memory

| Flow                | Direction     | Content                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| **In**              | Bruce Memory → Portfolio | Historical patterns: what ventures succeeded/failed; early kill signals; success correlations |
| **Out**             | Portfolio → Bruce Memory | Kill decisions with justification; acceleration decisions with rationale; traction patterns; failure modes |

### 7.7 Integration with Bruce Core

| Flow                | Direction     | Content                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| **In**              | Bruce Core → Portfolio | New venture registrations; status of all ventures; requests for prioritization |
| **Out**             | Portfolio → Bruce Core | Portfolio reports; allocation decisions; resource budgets; kill authorizations |

---

## 8. Success Criteria

Portfolio's effectiveness is measured by:

### 8.1 Quantitative Metrics

| Metric                         | Target                         | Meaning                                               |
| ------------------------------ | ------------------------------ | ----------------------------------------------------- |
| **Kill accuracy**              | >75% of killed ventures were genuinely non-viable | Avoid false kills (killing good ventures) |
| **Accelerate accuracy**         | >70% of accelerated ventures reach next stage     | Good selection of winners                             |
| **Time-to-kill**               | 4–8 weeks from red flag to termination           | Early identification; capital preservation            |
| **Portfolio health trend**      | Improving month-over-month     | Overall health increasing                             |
| **Average venture lifespan**    | ↓ for failures; ↑ for winners | Faster filtering + deeper investment in viable ones   |
| **Portfolio coherence score**   | >80% of ventures align with thesis               | Focused portfolio, not diffuse                        |

### 8.2 Qualitative Metrics

| Criterion                                           | Success State                                          |
| --------------------------------------------------- | ------------------------------------------------------ |
| **Kill decisions are auditable**                   | Every kill can be traced to specific, documented criteria |
| **Allocation decisions are respected**             | Modules follow Portfolio guidance without complaint |
| **Early warning system works**                     | Red flags are detected ≥2 weeks before crisis         |
| **Learning accumulates**                           | Kill patterns inform future Opportunity generation    |
| **Portfolio coherence**                            | Ventures don't contradict each other or waste capital |

---

## 9. Key Workflow Rules

1. **No venture is killed without explicit criteria being met.** Kill decisions must be documented with specific failing criteria.

2. **All metrics must be ≥1 evaluation cycle old before triggering decisions.** Avoid reactive decision-making on single data points.

3. **Portfolio decisions are binding on modules.** Once a kill order or acceleration order is issued, modules comply.

4. **Every decision includes a next-review date.** No decision is eternal; all are time-bounded and re-evaluated.

5. **Kill decisions are coordinated shutdowns.** The venture is not simply terminated; assets are preserved, learnings captured, and Bruce Memory is fed.

6. **Acceleration decisions are resource-bounded.** A venture cannot exceed its risk/potential rating in allocated resources.

7. **Portfolio reports are public within Bruce.** All stakeholders have visibility into the reasoning behind decisions.

8. **All data used in decisions is traceable and auditable.** Portfolio cannot make decisions based on intuition alone.

---

## 10. Human-in-the-Loop Gates (Optional)

Portfolio operates autonomously but may include human checkpoints:

| Gate                | Trigger                                            | Human Review                          |
| ------------------- | -------------------------------------------------- | ------------------------------------- |
| **Kill review**     | Portfolio recommends killing a venture with revenue | Human verifies kill criteria are met |
| **Large allocation**| Accelerating venture requiring >30% resource reallocation | Human approves resource reallocation  |
| **Portfolio pivot** | Portfolio recommends changing overall portfolio thesis | Human strategy review                 |

These gates can be toggled based on Bruce maturity and trust level.
