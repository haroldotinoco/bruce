# Bruce AI — Technical Documentation

## 1. System Architecture

Bruce AI is designed as a **meta-orchestration platform** that coordinates an ecosystem of specialized SaaS modules, agentized decision systems, and shared infrastructure. The Bruce Core acts as a persistent state machine and workflow orchestrator, while the module ecosystem handles domain-specific execution (branding, product building, marketing, operations analysis).

```
┌────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                              │
│            Dashboard · Operator Workflows · APIs               │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   BRUCE CORE                                  │
│ Cycle orchestration · State management · Decisioning · Gates  │
│ Venture registry · Governance · Event routing                 │
└─────────────────────────┬────────────────────────────────────┘
          │               │               │               │
          ▼               ▼               ▼               ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
   │Opportunity │ │AddVenture  │ │  BrandAid  │ │   Builder  │
   │   SaaS     │ │  (Venture) │ │   SaaS     │ │    SaaS    │
   │            │ │   SaaS     │ │            │ │            │
   └────────────┘ └────────────┘ └────────────┘ └────────────┘
          │               │               │               │
          └───────────────┼───────────────┼───────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │   GTM      │ │ Startup    │ │  Portfolio │
   │   SaaS     │ │   Ops      │ │ Governance │
   │            │ │   SaaS     │ │   Layer    │
   └────────────┘ └────────────┘ └────────────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌──────────┐   ┌──────────┐   ┌──────────────┐
   │ Shared   │   │ Memory & │   │ Persistent   │
   │ Services │   │Intelligence│  │ Storage &    │
   │(Auth)    │   │  Layer    │   │  Message Q   │
   │          │   │           │   │              │
   └──────────┘   └──────────┘   └──────────────┘
```

## 2. Core Architectural Concepts

### 2.1 Bruce Core: Responsibilities

The **Bruce Core** is the central orchestration engine. It owns:

| Responsibility | Description |
|---|---|
| **Cycle orchestration** | Initiates discovery, structuring, build, and launch cycles |
| **Module invocation** | Sequences calls to SaaS modules with validated input payloads |
| **State management** | Maintains authoritative venture state, stage progression, and decision history |
| **Venture registry** | Searchable database of all ventures (generated, qualified, structured, built, launched, etc.) |
| **Stage gating** | Enforces state machine rules; prevents invalid transitions |
| **Scoring & ranking** | Applies multi-factor scoring to opportunities and ventures |
| **Decision recommendations** | Evaluates ventures against portfolio criteria; recommends scale/iterate/pause/kill |
| **Portfolio management** | Tracks all ventures; manages resource allocation and prioritization |
| **Memory coordination** | Routes learnings to Shared Memory Layer; retrieves prior context for decisions |
| **Event logging** | Audit trail of all state changes, decisions, and overrides |
| **API surface** | REST endpoints for operator dashboards and external integrations |

### 2.2 SaaS Module Ecosystem

Each module is a **standalone service** that can be used independently by external clients or as part of the Bruce pipeline.

#### Module 1: Opportunity SaaS
| Property | Value |
|----------|-------|
| **Input** | Market segment definition, problem space, filters |
| **Output** | Ranked list of opportunities with research, problem validation, TAM estimates |
| **Key methods** | Discovery (trend scanning, signal detection); Screening (scoring, filtering); Enrichment (research, competitive context) |
| **Integration point** | Bruce Core → Opportunity discovery cycle |

#### Module 2: Venture SaaS (AddVenture)
| Property | Value |
|----------|-------|
| **Input** | Opportunity brief, portfolio constraints |
| **Output** | Structured venture hypothesis: problem, solution, target segment, value prop, business model, assumptions, metrics |
| **Key methods** | Hypothesis generation; Assumption identification; Metrics definition; Competitive positioning |
| **Integration point** | Bruce Core → Venture structuring cycle |

#### Module 3: Brand SaaS (BrandAid)
| Property | Value |
|----------|-------|
| **Input** | Venture hypothesis and positioning |
| **Output** | Complete brand identity: name, positioning, tone of voice, color system, typography, logo, brand book |
| **Key methods** | Strategic briefing; Creative exploration; Visual system design; Logo generation; Brand book assembly |
| **Integration point** | Bruce Core → Brand & identity development cycle |

#### Module 4: Builder SaaS
| Property | Value |
|----------|-------|
| **Input** | Venture hypothesis, feature priorities, brand assets |
| **Output** | Deployed MVP: functional product, quality validation, deployment readiness |
| **Key methods** | Feature definition; Architecture; Code generation / scaffolding; Testing & QA; Deployment |
| **Integration point** | Bruce Core → Product build cycle |

#### Module 5: GTM SaaS
| Property | Value |
|----------|-------|
| **Input** | Product, brand, target audience, launch timeline |
| **Output** | Go-to-market plan: channels, messaging, content calendar, acquisition strategy, launch sequence |
| **Key methods** | Channel selection; Messaging strategy; Content planning; Audience targeting; Campaign setup |
| **Integration point** | Bruce Core → Launch preparation and execution |

#### Module 6: Startup Ops SaaS
| Property | Value |
|----------|-------|
| **Input** | Product analytics, user data, event logs, revenue data |
| **Output** | Performance reports, health scoring, anomaly detection, recommendations |
| **Key methods** | Metrics synthesis; Trend detection; Cohort analysis; Churn prediction; Issue escalation |
| **Integration point** | Bruce Core → Continuous monitoring and decision reviews |

#### Module 7: Portfolio / Governance Layer
| Property | Value |
|----------|-------|
| **Input** | Venture registry, performance metrics, portfolio constraints |
| **Output** | Decision recommendations (scale/iterate/pause/kill), resource allocation guidance |
| **Key methods** | Multi-factor scoring; Comparative ranking; Opportunity cost analysis; Constraint validation |
| **Integration point** | Bruce Core → Decision reviews and capital allocation |

#### Module 8: Shared Memory & Intelligence Layer
| Property | Value |
|----------|-------|
| **Input** | All venture data, decisions, post-mortems, learnings |
| **Output** | Cross-venture patterns, improved hypotheses, process refinements |
| **Key methods** | Pattern extraction; Knowledge indexing; Recommendation generation; Similarity matching |
| **Integration point** | Bruce Core → Pre-decision context enrichment; post-action learning |

## 3. Inter-Module Communication Contracts

All modules communicate through **strict JSON schemas** enforced via OpenAI Structured Outputs where LLMs are involved.

### 3.1 Opportunity → Venture Handoff

```json
{
  "opportunity_id": "uuid",
  "problem_statement": "string",
  "market_segment": "string",
  "tam_estimate": "number (USD millions)",
  "research_summary": {
    "validation_score": "0–100",
    "key_evidence": ["string"],
    "risks": ["string"]
  },
  "recommended_positioning": "string",
  "target_customer_profile": {
    "segment": "string",
    "pain_point": "string",
    "current_solution": "string"
  }
}
```

### 3.2 Venture → Brand Handoff

```json
{
  "venture_id": "uuid",
  "value_proposition": "string",
  "target_audience": {
    "primary": "string",
    "secondary": ["string"],
    "psychographics": ["string"]
  },
  "brand_positioning": "string",
  "tone_of_voice_requirements": ["string"],
  "visual_mood": "string",
  "competitive_context": "string",
  "naming_constraints": {
    "avoid": ["string"],
    "domains": "TLD list"
  }
}
```

### 3.3 Brand → Builder Handoff

```json
{
  "brand_assets": {
    "logo_svg": "string (SVG)",
    "color_palette": {
      "primary": "hex",
      "secondary": ["hex"],
      "accent": "hex"
    },
    "typography": {
      "display": "string (font name)",
      "body": "string (font name)"
    }
  },
  "brand_guidelines": {
    "tone_of_voice": ["string"],
    "messaging_pillars": ["string"],
    "visual_principles": ["string"]
  },
  "design_tokens": "JSON"
}
```

### 3.4 Venture → Builder Handoff

```json
{
  "venture_id": "uuid",
  "mvp_scope": {
    "core_feature": "string (the one thing to test)",
    "supporting_features": ["string"],
    "out_of_scope": ["string"]
  },
  "technical_requirements": {
    "platforms": ["web", "mobile", "other"],
    "integrations": ["string"],
    "data_requirements": "string"
  },
  "success_metrics_definition": {
    "metric_name": "string",
    "measurement_method": "string",
    "target_value": "number or range"
  }
}
```

### 3.5 Product → GTM Handoff

```json
{
  "product_summary": "string",
  "feature_highlights": ["string"],
  "live_url": "string",
  "demo_credentials": { "redacted": true },
  "acquisition_hooks": ["string (key value drivers)"],
  "user_onboarding_flow": "string (description)"
}
```

### 3.6 Product & GTM → Startup Ops Handoff

```json
{
  "venture_id": "uuid",
  "analytics_source": "string (Segment, Amplitude, etc.)",
  "event_mapping": {
    "signup": "string (event name)",
    "activation": "string (event name)",
    "retention": "string (event name)",
    "revenue": "string (event name or integration)"
  },
  "critical_metrics": [
    {
      "name": "string",
      "alert_threshold": "number or condition",
      "escalation_policy": "string"
    }
  ],
  "hypothesis_to_track": ["string (from venture brief)"]
}
```

### 3.7 Startup Ops → Portfolio/Governance Handoff

```json
{
  "venture_id": "uuid",
  "evaluation_date": "ISO-8601",
  "performance_summary": {
    "acquisition": { "signups": "number", "cac": "USD", "conversion_rate": "percent" },
    "activation": { "onboarded_users": "number", "rate": "percent" },
    "engagement": { "dau": "number", "session_frequency": "number" },
    "retention": { "day7_cohort": "percent", "day30_cohort": "percent" },
    "revenue": { "mrr": "USD", "arpu": "USD" },
    "sentiment": { "nps": "number", "churn_reasons": ["string"] }
  },
  "hypothesis_validation": {
    "hypothesis": "string (from venture brief)",
    "status": "VALIDATED | UNRESOLVED | INVALIDATED",
    "evidence": ["string"]
  },
  "health_score": "0–100",
  "risks_detected": ["string"],
  "escalations": ["string"]
}
```

### 3.8 Portfolio Layer → Bruce Core Handoff

```json
{
  "venture_id": "uuid",
  "decision_recommendation": "SCALE | ITERATE | PAUSE | KILL",
  "decision_rationale": "string",
  "supporting_evidence": {
    "validated_hypotheses": ["string"],
    "invalidated_hypotheses": ["string"],
    "key_metrics": { "metric_name": "number", ... }
  },
  "if_scale": {
    "budget_increase": "USD",
    "timeline": "string",
    "focus_areas": ["string"]
  },
  "if_iterate": {
    "suggested_changes": ["string"],
    "relaunch_timeline": "string"
  },
  "if_pause": {
    "reason": "string",
    "revisit_condition": "string"
  },
  "if_kill": {
    "reason": "string",
    "learnings": ["string"]
  },
  "confidence": "0–100"
}
```

## 4. Core Data Entities

### 4.1 Venture

The **Venture** is the central entity throughout the Bruce lifecycle.

```json
{
  "id": "uuid",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "status": "generated | qualified | structured | built | launched | operating | iterating | scaling | paused | killed",

  "opportunity_context": {
    "opportunity_id": "uuid",
    "problem_statement": "string",
    "market_segment": "string",
    "tam_estimate_usd": "number"
  },

  "hypothesis": {
    "value_proposition": "string",
    "target_customer_segment": "string",
    "assumed_willingness_to_pay": "USD",
    "critical_assumptions": [
      {
        "assumption": "string",
        "how_to_test": "string",
        "signal_of_validation": "string",
        "signal_of_invalidation": "string"
      }
    ],
    "success_metrics": [
      {
        "name": "string",
        "baseline": "number",
        "target": "number",
        "measurement_method": "string"
      }
    ]
  },

  "brand_context": {
    "name": "string",
    "positioning": "string",
    "logo_asset_id": "uuid",
    "color_palette": { "primary": "hex", ... },
    "tone_of_voice": ["string"]
  },

  "product_context": {
    "live_url": "string",
    "tech_stack": ["string"],
    "deployment_status": "draft | deployed | live",
    "build_artifact_id": "uuid"
  },

  "launch_context": {
    "gtm_plan_id": "uuid",
    "channels": ["string"],
    "launch_date": "ISO-8601",
    "initial_messaging": "string"
  },

  "performance": {
    "current_health_score": "0–100",
    "last_metrics_update": "ISO-8601",
    "metrics_snapshot": { "metric_name": "number", ... },
    "hypothesis_validations": [
      { "assumption": "string", "status": "VALIDATED | UNRESOLVED | INVALIDATED" }
    ]
  },

  "governance": {
    "stage_approved_by": "operator_id",
    "stage_approved_at": "ISO-8601",
    "decision_history": [
      {
        "date": "ISO-8601",
        "decision": "SCALE | ITERATE | PAUSE | KILL",
        "rationale": "string",
        "decided_by": "operator_id | system"
      }
    ],
    "next_review_date": "ISO-8601",
    "resource_allocation_usd": "number"
  }
}
```

### 4.2 Opportunity

```json
{
  "id": "uuid",
  "created_at": "ISO-8601",
  "status": "generated | qualified | structured | rejected | inactive",

  "problem_context": {
    "problem_statement": "string",
    "market_segment": "string",
    "estimated_tam_usd": "number",
    "customer_pain_points": ["string"]
  },

  "research": {
    "validation_score": "0–100",
    "evidence": ["string"],
    "competing_solutions": ["string"],
    "market_trends": ["string"]
  },

  "screening": {
    "alignment_with_filters": "0–100",
    "overall_score": "0–100",
    "recommendation": "ADVANCE | HOLD | REJECT"
  },

  "journey": {
    "generated_at": "ISO-8601",
    "qualified_at": "ISO-8601 | null",
    "venture_created_from": "venture_id | null"
  }
}
```

### 4.3 Build

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "created_at": "ISO-8601",

  "scope": {
    "core_feature": "string",
    "supporting_features": ["string"],
    "tech_stack": ["string"]
  },

  "artifacts": {
    "repository_url": "string",
    "live_deployment_url": "string",
    "deployment_environment": "staging | production",
    "last_deployment_at": "ISO-8601"
  },

  "quality": {
    "test_coverage": "percent",
    "critical_issues": ["string"],
    "accessibility_score": "0–100"
  }
}
```

### 4.4 Campaign (GTM)

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "created_at": "ISO-8601",

  "strategy": {
    "primary_channels": ["string"],
    "target_audience": "string",
    "core_messaging": "string",
    "acquisition_hypothesis": "string"
  },

  "execution": {
    "launch_date": "ISO-8601",
    "content_calendar": ["string (content topics)"],
    "ads_or_campaigns": ["string"],
    "estimated_reach": "number",
    "estimated_cac": "USD"
  },

  "performance": {
    "impressions": "number",
    "clicks": "number",
    "signups": "number",
    "conversion_rate": "percent",
    "actual_cac": "USD"
  }
}
```

### 4.5 PortfolioEntry

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "portfolio_id": "uuid",

  "allocation": {
    "budget_usd": "number",
    "priority_score": "0–100",
    "focus_area": "string",
    "next_review_date": "ISO-8601"
  },

  "governance": {
    "stage": "generated | qualified | structured | built | launched | operating | iterating | scaling | paused | killed",
    "health_score": "0–100",
    "escalations": ["string"],
    "decision_override": { "reason": "string", "decided_by": "operator_id" }
  }
}
```

### 4.6 BruceMemory

```json
{
  "id": "uuid",
  "venture_id": "uuid | null (null = cross-venture)",
  "created_at": "ISO-8601",

  "learning_type": "hypothesis_validation | feature_impact | channel_performance | cohort_pattern | failure_root_cause",

  "content": {
    "learning": "string (the insight)",
    "evidence": ["string"],
    "confidence": "0–100",
    "applicability": "this_venture | similar_ventures | all_ventures"
  },

  "usage": {
    "applied_to_ventures": ["venture_id"],
    "improvement_observed": ["string"],
    "refinement_suggestions": ["string"]
  }
}
```

## 5. Venture Lifecycle States & Transitions

```
START
  │
  ▼
┌─────────────┐
│ GENERATED   │  (opportunity identified, basic info captured)
└──────┬──────┘
       │ [Opportunity SaaS screens; score > threshold]
       ▼
┌─────────────┐
│ QUALIFIED   │  (meets portfolio filters; ready for structuring)
└──────┬──────┘
       │ [Operator approves; Venture SaaS structures hypothesis]
       ▼
┌─────────────┐
│ STRUCTURED  │  (hypothesis defined, assumptions clear, metrics set)
└──────┬──────┘
       │ [Operator approves; Brand SaaS & Builder SaaS begin work]
       ▼
┌─────────────┐
│ BUILT       │  (brand identity finalized, MVP deployed, GTM ready)
└──────┬──────┘
       │ [Operator approves launch; campaign goes live]
       ▼
┌─────────────┐
│ LAUNCHED    │  (product public, data collection underway)
└──────┬──────┘
       │ [Transition on first performance data]
       ▼
┌──────────────────┐
│ OPERATING        │  (live in market, hypothesis validation underway)
│ (decision gate)  │
└──────┬───────────┘
       │
       ├──► ITERATING ──► (re-enter LAUNCHED with updated hypothesis)
       │
       ├──► SCALING   (increased budget/headcount; growth phase)
       │
       ├──► PAUSED    (on hold; may revisit when conditions change)
       │
       └──► KILLED    (hypothesis invalidated; archived with learnings)

Terminal / long-hold states: KILLED, PAUSED, SCALED (graduated)
```

## 6. Technology Stack

### Orchestration & Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Backend** | Node.js / NestJS | REST API for operator dashboards, SaaS module calls, event webhooks |
| **Primary Database** | MongoDB (with Mongoose) | Venture registry, opportunity backlog, decision history, performance snapshots |
| **Job Queue** | BullMQ (Redis-backed) | Async task orchestration (discovery cycles, build jobs, analytics ingestion) |
| **Real-time Messaging** | Redis Pub/Sub | Event broadcasting (venture state changes, metric updates, escalations) |
| **Object Storage** | S3-compatible (AWS S3, MinIO) | Brand assets, build artifacts, export files |
| **Operator Dashboard** | React / Next.js | Venture management UI, decision interface, analytics visualization |

### AI Services

| Service | Role |
|---------|------|
| **OpenAI API (o1, gpt-4)** | Reasoning, hypothesis generation, decision analysis, content writing |
| **OpenAI Structured Outputs** | JSON Schema enforcement on all LLM outputs |
| **Multimodal Analysis** | Logo concept visualization, brand mood boards (GPT Vision) |
| **Web Search** | Market research, competitor intelligence, trend signals |

### SaaS Module Integration

| Module | Interface | Protocol |
|--------|-----------|----------|
| **Opportunity SaaS** | HTTP REST / gRPC | Structured discovery requests/responses |
| **Venture SaaS** | HTTP REST / gRPC | Hypothesis generation payload |
| **Brand SaaS** | HTTP REST | Brand brief intake; receives brand package |
| **Builder SaaS** | HTTP REST + Webhooks | Build definition; deployment status updates |
| **GTM SaaS** | HTTP REST | Campaign execution; performance streaming |
| **Startup Ops SaaS** | HTTP REST + Events | Metrics ingestion; real-time scoring |
| **Portfolio Layer** | Synchronous REST | Venture evaluation; decision recommendations |

### Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **OpenTelemetry / Datadog** | Distributed tracing across modules |
| **Prometheus** | Metrics collection (API latency, job queue depth, model token usage) |
| **CloudWatch / Stackdriver** | Log aggregation and alerting |

## 7. API Design (High-Level)

### Ventures

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ventures` | GET | List all ventures (with filters: stage, status, portfolio) |
| `/ventures` | POST | Create venture from opportunity |
| `/ventures/:id` | GET | Retrieve full venture state |
| `/ventures/:id` | PATCH | Update venture (e.g., manual hypothesis edit) |
| `/ventures/:id/stage` | POST | Trigger stage advancement (with operator approval) |
| `/ventures/:id/decision` | POST | Record operator decision (scale/iterate/pause/kill) |
| `/ventures/:id/metrics` | GET | Real-time performance metrics |
| `/ventures/:id/history` | GET | Decision and state change history |

### Opportunities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/opportunities` | GET | List opportunities (with ranking, status) |
| `/opportunities` | POST | Submit new opportunity manually |
| `/opportunities/:id` | GET | Retrieve opportunity with screening results |
| `/opportunities/:id/advance` | POST | Operator approves advancement to venture structuring |

### Cycle Control

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cycles/discovery/start` | POST | Initiate a new discovery cycle (manual trigger) |
| `/cycles/discovery/status` | GET | Current discovery cycle status and results |
| `/cycles/decision-reviews` | GET | Upcoming and recent decision reviews |
| `/cycles/decision-reviews/:id` | POST | Record operator decision on decision review |

### Portfolio Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/portfolio` | GET | Portfolio overview: all ventures, allocation, health scores |
| `/portfolio/allocate` | POST | Rebalance resource allocation across ventures |
| `/portfolio/recommendations` | GET | Cross-venture insights and optimization suggestions |

### Integrations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/integrations/analytics` | POST | Webhook receiver for metrics from Segment/Amplitude |
| `/integrations/builder/:venture_id` | POST | Webhook from Builder SaaS (deployment status) |
| `/integrations/gtm/:venture_id` | POST | Webhook from GTM SaaS (campaign performance) |

## 8. Decision Scoring Engine

The **Portfolio Layer** uses a multi-factor scoring model to recommend scale/iterate/pause/kill:

```
venture_score =
  (hypothesis_validation_rate * 0.35) +
  (engagement_metrics * 0.25) +
  (retention_cohort * 0.20) +
  (unit_economics_trend * 0.15) +
  (market_size_score * 0.05)

where:
  hypothesis_validation_rate = count(validated) / count(critical_assumptions)
  engagement_metrics = normalized(dau, session_freq, etc.)
  retention_cohort = d30_retention_rate
  unit_economics_trend = (current_cac / initial_cac) + (current_arpu / initial_arpu)
  market_size_score = clamp(tam_estimate / min_viable_market, 0, 1)

if venture_score >= 75:
  recommendation = SCALE
elif venture_score >= 50:
  recommendation = ITERATE
elif venture_score >= 25:
  recommendation = PAUSE
else:
  recommendation = KILL
```

## 9. Shared Memory & Learning System

The **Shared Memory Layer** maintains cross-venture intelligence:

### 9.1 Learning Capture

After every decision review or venture exit, the system extracts learnings:

```json
{
  "learning_type": "hypothesis_validation | feature_impact | channel_performance",
  "content": "string (the specific insight)",
  "ventures_involved": ["venture_id"],
  "confidence": "0–100",
  "applicability": "all_ventures | similar_category | this_only"
}
```

### 9.2 Learning Retrieval

Before structuring a new venture, the system queries:

```
SELECT learnings
WHERE applicability IN ('all_ventures', ?)
  AND confidence > 70
  AND created_at > (NOW() - 1 year)
ORDER BY recency DESC
LIMIT 10
```

### 9.3 Feedback Loop

Learnings are applied to new ventures; if an applied learning produces unexpected results, the system flags it for re-evaluation:

```json
{
  "learning_id": "uuid",
  "applied_to": "venture_id",
  "expected_outcome": "string",
  "actual_outcome": "string",
  "divergence_severity": "0–100",
  "possible_reasons": ["string"]
}
```

## 10. Non-Functional Requirements

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| **API response time** | p95 < 500ms (discovery), p95 < 2s (decisions) | Operator experience; decision support must be responsive |
| **Data consistency** | Venture state is strongly consistent across all modules | Critical for governance; no race conditions on stage transitions |
| **Availability** | 99.5% uptime (SLA); degraded mode for partial outages | Ventures in-market must continue; monitoring never stops |
| **Audit trail completeness** | 100% of decisions logged immutably | Compliance, learning, post-mortem analysis |
| **Model token efficiency** | < $5 per venture structured; < $20 per venture launched | Cost management; prevent runaway LLM costs |
| **Horizontal scalability** | Support 100+ concurrent ventures without performance degradation | Growth; multi-venture orchestration |
| **Data retention** | 7-year retention for ventures + decision history; 2-year for metrics | Regulatory; long-term pattern analysis |

## 11. Security & Compliance

| Concern | Approach |
|---------|----------|
| **API Authentication** | OAuth 2.0 with operator ID; per-venture access scoping |
| **Secrets Management** | AWS Secrets Manager / HashiCorp Vault for API keys (OpenAI, S3, etc.) |
| **Data Isolation** | Multi-tenancy per customer portfolio; no cross-portfolio data leakage |
| **Audit Trail** | Immutable event log with operator ID, timestamp, action, rationale |
| **LLM Output Filtering** | Screen for PII before storage; flag sensitive inferences for operator review |

## 12. Deployment Architecture

### 12.1 Containerization

All components (Bruce Core, integrations) deployed as Docker containers:

- **Bruce Core API** → NestJS container (stateless, horizontally scalable)
- **Job workers** → BullMQ workers in separate container fleet (auto-scaling based on queue depth)
- **Dashboard** → Next.js SSR container (CDN-fronted)

### 12.2 Infrastructure

- **Compute** → ECS / EKS (container orchestration)
- **Database** → MongoDB Atlas (managed, auto-scaling)
- **Queue** → Redis (AWS ElastiCache or self-managed)
- **Storage** → S3 (brand assets, build artifacts)
- **CDN** → CloudFront (dashboard, static assets)

### 12.3 Scaling

- **Horizontal scaling** → Add Bruce Core replicas as traffic increases
- **Job queue scaling** → BullMQ auto-spawns workers based on queue depth
- **Database scaling** → MongoDB auto-sharding based on data size
- **Cost optimization** → Batch similar operations (e.g., overnight discovery cycles)

## 13. Module Communication Patterns

### 13.1 Synchronous (Request-Response)

**Used for**: Gate decisions, scoring, immediate data retrieval

```
Bruce Core → [Portfolio Layer]
              ↓ (evaluate venture)
              ↓ (return recommendation)
           → Bruce Core
```

### 13.2 Asynchronous (Fire-and-Brucet with Polling)

**Used for**: Long-running tasks (discovery, branding, build)

```
Bruce Core → [Job Queue] → [Builder SaaS worker]
              ↓
            Monitor job status
            ↓
            Poll job_id for completion
            ↓
            Retrieve results when done
```

### 13.3 Event-Driven (Pub/Sub)

**Used for**: State changes, metric updates, escalations

```
Venture state changes
     ↓
Redis Pub/Sub broadcasts event
     ↓
Portfolio Layer subscribes → updates health score
GTM SaaS subscribes → adjusts budget
Operator dashboard subscribes → shows notification
```

## 14. Error Handling & Resilience

| Failure Mode | Handling |
|--------------|----------|
| **Module timeout** | Retry with exponential backoff (3 attempts); escalate to operator if all fail |
| **Partial data loss** | Reconstruct from audit log; mark as incomplete; request manual rerun |
| **Metric ingestion lag** | Decision review delayed if metrics > 4 hours stale; operator notified |
| **LLM rate limit** | Queue jobs; pause discovery cycles until quota resets |
| **Operator override stalled** | Auto-escalate to portfolio manager if no decision in 7 days |

## 15. Testing & Quality Assurance

| Layer | Testing Approach |
|-------|------------------|
| **Bruce Core unit tests** | Jest / Mocha; 80%+ coverage on state machine and scoring |
| **Module integration tests** | Contract testing (Pact); verify handoff schemas match |
| **Decision simulation** | Replay past venture data through updated scoring logic; compare recommendations |
| **E2E tests** | Synthetic venture creation through full lifecycle (monthly validation) |
| **Load testing** | Simulate 100 concurrent venture states under observation; measure p95 latency |

---

## Appendix: Detailed Pipeline Flow (State Diagram)

```
┌────────────────────────────────────────────────────────────────┐
│ START: Operator configures portfolio constraints & filters     │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Discovery    │
         │ Cycle        │
         │ (Opportunity │
         │  SaaS scans) │
         └──────┬───────┘
                │
                ├─→ [Auto-screening via scoring]
                │
                ▼
         ┌──────────────────────┐
         │ Qualified Opps       │
         │ (ranked list)        │
         └──────┬───────────────┘
                │
                ├─→ Operator reviews & selects
                │
                ▼
         ┌──────────────────────┐
         │ Venture SaaS         │
         │ (structures          │
         │  hypothesis)         │
         └──────┬───────────────┘
                │
                ├─→ [Operator approves or requests revision]
                │
                ▼
         ┌──────────────────────┐
         │ BrandAid             │
         │ (develops brand)     │
         └──────┬───────────────┘
                │
                ▼
         ┌──────────────────────┐
         │ Builder SaaS         │
         │ (builds MVP)         │
         └──────┬───────────────┘
                │
                ├─→ [Both run in parallel]
                │
                ▼
         ┌──────────────────────┐
         │ GTM SaaS             │
         │ (plans launch)       │
         └──────┬───────────────┘
                │
                ├─→ [Operator approves launch readiness]
                │
                ▼
         ┌──────────────────────┐
         │ Launch Campaign      │
         │ (GTM goes live)      │
         └──────┬───────────────┘
                │
                ▼
         ┌──────────────────────┐
         │ Startup Ops SaaS     │
         │ (continuous          │
         │  monitoring)         │
         └──────┬───────────────┘
                │
        [Real-time metrics streaming from analytics]
                │
                ▼
      [4-12 weeks of observation]
                │
                ▼
         ┌──────────────────────┐
         │ Decision Review      │
         │ (Portfolio Layer     │
         │  evaluates)          │
         └──────┬───────────────┘
                │
                ├─→ Recommendation: SCALE / ITERATE / PAUSE / KILL
                │
                └─→ Operator decides (can override with rationale)
                │
        ┌───────┼────────┬──────────┬──────────┐
        │       │        │          │          │
        ▼       ▼        ▼          ▼          ▼
      SCALE  ITERATE   PAUSE      KILL      Archive
        │       │        │          │
        └───────┼────────┴──────────┴──────→ Shared Memory Layer
                │                              (extract learnings)
                │
                └─→ [Rerun from Venture SaaS with updated hypothesis]
                    [Relaunch in 2-3 weeks]
```
