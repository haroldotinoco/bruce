# GTM SaaS — Technical Documentation

## 1. System Architecture

The GTM SaaS is designed as a **layered, event-driven, multi-agent pipeline** where each layer handles a distinct phase of the GTM cycle. The system maintains state across iteration cycles and communicates via structured JSON payloads.

```
┌─────────────────────────────────────────────────┐
│              CLIENT LAYER                        │
│    Dashboard · Campaign Mgmt · Traction View    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         ORCHESTRATION LAYER                      │
│    NestJS Backend · Job Queue · State Machine    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│             AGENT PIPELINE                       │
│  Strategy → Channels → Content → Campaigns      │
│  → Measurement → Analytics → Governance         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│          EXECUTION ENGINES                       │
│   OpenAI · Analytics · Campaign Tools · Webhooks│
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      DATA LAYER & INTEGRATIONS                   │
│  MongoDB · Redis · Analytics Pipelines · APIs    │
└─────────────────────────────────────────────────┘
```

---

## 2. Core Entities

All state is managed via MongoDB documents with the following primary entities:

### GTMProject

```json
{
  "_id": "ObjectId",
  "ventureId": "string",
  "buildPackageId": "string",
  "status": "strategy|channels|content|campaigns|tracking|optimizing|paused|completed",
  "currentStage": "integer",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "metadata": {
    "industry": "string",
    "audience": "string",
    "productDescription": "string",
    "constraints": {
      "budget": "number",
      "runway_months": "number",
      "team_size": "integer"
    }
  },
  "history": ["StateTransitionEvent"]
}
```

### Channel

```json
{
  "_id": "ObjectId",
  "gtmProjectId": "ObjectId",
  "name": "string",
  "type": "organic|content|paid|partnerships|viral|referral",
  "priority": "integer",
  "testingSequence": "integer",
  "status": "candidate|testing|active|paused|archived",
  "audience": "string",
  "audienceSize": "number",
  "successCriteria": {
    "target_conversion_rate": "number",
    "target_cac": "number",
    "entry_threshold": "number"
  },
  "performance": {
    "impressions": "integer",
    "clicks": "integer",
    "conversions": "integer",
    "spend": "number",
    "cac": "number",
    "conversion_rate": "number"
  },
  "playbook": "string",
  "createdAt": "ISO8601",
  "archivedAt": "ISO8601 | null"
}
```

### Campaign

```json
{
  "_id": "ObjectId",
  "gtmProjectId": "ObjectId",
  "channels": ["ObjectId"],
  "name": "string",
  "phase": "integer",
  "status": "planning|scheduled|live|completed|paused",
  "launchDate": "ISO8601",
  "endDate": "ISO8601 | null",
  "creativeBrief": "string",
  "copy": {
    "headline": "string",
    "body": "string",
    "cta": "string",
    "tone": "string"
  },
  "targeting": {
    "audience_segment": "string",
    "geographic": "string[]",
    "interests": "string[]"
  },
  "budget": {
    "total": "number",
    "allocation_per_channel": {"channelId": "number"}
  },
  "metrics": {
    "target_conversions": "number",
    "target_cac": "number",
    "target_roi": "number"
  },
  "results": {
    "impressions": "integer",
    "clicks": "integer",
    "conversions": "integer",
    "spend": "number",
    "actual_cac": "number",
    "actual_roi": "number"
  },
  "createdAt": "ISO8601"
}
```

### ContentPiece

```json
{
  "_id": "ObjectId",
  "gtmProjectId": "ObjectId",
  "channels": ["ObjectId"],
  "type": "landing_page|blog|social|email|webinar|video|guide",
  "title": "string",
  "purpose": "awareness|consideration|conversion|retention",
  "audienceSegment": "string",
  "specification": "string",
  "status": "planned|created|scheduled|published|archived",
  "schedule": {
    "createdDate": "ISO8601",
    "publishDate": "ISO8601",
    "frequency": "one-time|weekly|monthly"
  },
  "performance": {
    "views": "integer",
    "clicks": "integer",
    "conversions": "integer",
    "engagement_rate": "number"
  },
  "createdAt": "ISO8601"
}
```

### TractionReport

```json
{
  "_id": "ObjectId",
  "gtmProjectId": "ObjectId",
  "reportDate": "ISO8601",
  "reportPeriod": "weekly|monthly",
  "channelScores": [
    {
      "channelId": "ObjectId",
      "conversions": "integer",
      "spend": "number",
      "cac": "number",
      "roi": "number",
      "signal_strength": "number",
      "trend": "up|flat|down"
    }
  ],
  "campaignResults": [
    {
      "campaignId": "ObjectId",
      "conversions": "integer",
      "cac": "number",
      "performance_vs_target": "number"
    }
  ],
  "aggregateMetrics": {
    "total_conversions": "integer",
    "total_spend": "number",
    "blended_cac": "number",
    "projected_customers_90d": "number",
    "runway_impact": "number"
  },
  "signals": [
    {
      "type": "string",
      "severity": "critical|warning|info",
      "message": "string",
      "recommendation": "string"
    }
  ],
  "createdAt": "ISO8601"
}
```

### GTMDecision

```json
{
  "_id": "ObjectId",
  "gtmProjectId": "ObjectId",
  "decisionDate": "ISO8601",
  "type": "scale|iterate|pivot|kill|pause|new_channel",
  "targetChannelId": "ObjectId | null",
  "rationale": "string",
  "dataSupport": {
    "metric": "string",
    "threshold": "number",
    "actual_value": "number",
    "confidence": "number"
  },
  "action": "string",
  "budgetImpact": "number",
  "status": "recommended|approved|executed|reversed",
  "createdAt": "ISO8601",
  "executedAt": "ISO8601 | null"
}
```

---

## 3. Status Flows

### GTMProject Status Flow

```
strategy
   │
   ▼
channels
   │
   ▼
content
   │
   ▼
campaigns ◄──────┐
   │             │
   ▼             │
tracking         │
   │             │
   ▼             │
optimizing ──────┘
   │
   ├─→ paused (or resumed to campaigns)
   │
   ▼
completed (when venture proves traction)
```

### Channel Status Flow

```
candidate
   │
   ▼
testing
   │
   ├─→ paused
   │
   ▼
active
   │
   ├─→ paused
   │
   ▼
archived
```

### Campaign Status Flow

```
planning
   │
   ▼
scheduled
   │
   ▼
live ◄────┐
   │      │
   ├─→ paused ──→ live (resume)
   │
   ▼
completed
```

---

## 4. Input/Output Contracts

### Input Contract (from Builder SaaS / Venture SaaS)

```json
{
  "buildPackageId": "string",
  "ventureId": "string",
  "productDescription": "string",
  "targetAudience": {
    "primary_segment": "string",
    "demographics": {"key": "value"},
    "psychographics": {"key": "value"},
    "painPoints": ["string"]
  },
  "positioning": "string",
  "valueProposition": "string",
  "competitiveContext": {
    "directCompetitors": ["string"],
    "indirectCompetitors": ["string"],
    "marketSize": "number"
  },
  "constraints": {
    "budget": "number",
    "runway_months": "number",
    "team_capacity": "integer"
  },
  "brandVoice": {
    "tone": "string",
    "personality": ["string"],
    "messaging_pillars": ["string"]
  }
}
```

### Output Contract (GTM Package)

```json
{
  "gtmProjectId": "string",
  "status": "string",
  "channelStrategy": {
    "recommendedChannels": [
      {
        "name": "string",
        "type": "string",
        "priority": "integer",
        "confidence": "number",
        "rationale": "string",
        "audienceMatch": "number",
        "testingDuration_weeks": "integer",
        "successCriteria": {"cac": "number", "conversion_rate": "number"},
        "playbook": "string"
      }
    ],
    "testingSequence": "string",
    "audienceMapping": {"channelId": "audienceSegment"}
  },
  "contentStrategy": {
    "contentTypes": ["landing_page", "blog", "social", "email"],
    "creationSchedule": [
      {
        "type": "string",
        "frequency": "string",
        "channel": "string",
        "purpose": "string"
      }
    ],
    "audienceSegmentContent": {
      "segmentName": ["contentType"]
    }
  },
  "campaigns": [
    {
      "name": "string",
      "phase": "integer",
      "channels": ["string"],
      "launchDate": "ISO8601",
      "creativeBrief": "string",
      "targetAudience": "string",
      "successMetrics": {"conversions": "integer", "cac": "number"}
    }
  ],
  "measurementFramework": {
    "metrics": ["conversions", "cac", "roi", "retention"],
    "tracking_instrumentation": "string",
    "reportingCadence": "weekly"
  },
  "iterationProtocol": {
    "scalingThreshold": "number",
    "killThreshold": "number",
    "decisionCadence": "weekly"
  },
  "forecastModel": {
    "projectedCustomers_90d": "number",
    "projectedCAC": "number",
    "projectedRunway_impact": "number"
  },
  "executionPlan": {
    "week1_8": "string",
    "week9_12": "string",
    "scalingPath": "string"
  }
}
```

---

## 5. Suggested API Endpoints

### Projects

| Endpoint                           | Method | Description                            |
| ---------------------------------- | ------ | -------------------------------------- |
| `/gtm/projects`                    | POST   | Create a new GTM project               |
| `/gtm/projects/:id`                | GET    | Retrieve project state                 |
| `/gtm/projects/:id`                | PATCH  | Update project metadata                |
| `/gtm/projects/:id/stage/advance`  | POST   | Move to next stage                     |
| `/gtm/projects/:id/package`        | GET    | Retrieve complete GTM Package          |

### Channels

| Endpoint                                   | Method | Description                      |
| ------------------------------------------ | ------ | -------------------------------- |
| `/gtm/projects/:id/channels`               | GET    | List all channels for project    |
| `/gtm/projects/:id/channels`               | POST   | Create a new channel             |
| `/gtm/projects/:id/channels/:channelId`    | GET    | Get channel details & performance |
| `/gtm/projects/:id/channels/:channelId`    | PATCH  | Update channel status/budget     |
| `/gtm/projects/:id/channels/:channelId/pause` | POST | Pause a channel                  |
| `/gtm/projects/:id/channels/:channelId/kill` | POST  | Kill a channel                   |

### Campaigns

| Endpoint                                  | Method | Description                      |
| ----------------------------------------- | ------ | -------------------------------- |
| `/gtm/projects/:id/campaigns`             | GET    | List all campaigns               |
| `/gtm/projects/:id/campaigns`             | POST   | Create a new campaign            |
| `/gtm/projects/:id/campaigns/:campaignId` | GET    | Get campaign details & results   |
| `/gtm/projects/:id/campaigns/:campaignId/launch` | POST | Launch campaign            |
| `/gtm/projects/:id/campaigns/:campaignId/pause` | POST | Pause campaign             |

### Content

| Endpoint                            | Method | Description                  |
| ----------------------------------- | ------ | ---------------------------- |
| `/gtm/projects/:id/content`         | GET    | List all content pieces      |
| `/gtm/projects/:id/content`         | POST   | Add new content piece        |
| `/gtm/projects/:id/content/:contentId` | GET | Get content details & performance |

### Traction & Analytics

| Endpoint                                  | Method | Description                     |
| ----------------------------------------- | ------ | ------------------------------- |
| `/gtm/projects/:id/traction/latest`       | GET    | Latest traction report          |
| `/gtm/projects/:id/traction/history`      | GET    | Historical traction reports     |
| `/gtm/projects/:id/dashboard`             | GET    | Aggregated dashboard snapshot   |
| `/gtm/projects/:id/forecast`              | GET    | 90-day forecast model           |

### Decisions & Governance

| Endpoint                               | Method | Description                       |
| -------------------------------------- | ------ | --------------------------------- |
| `/gtm/projects/:id/decisions`          | GET    | List all GTM decisions            |
| `/gtm/projects/:id/decisions`          | POST   | Create a new decision (from agent) |
| `/gtm/projects/:id/decisions/:decisionId/approve` | POST | Approve a decision        |
| `/gtm/projects/:id/decisions/:decisionId/execute` | POST | Execute an approved decision |

---

## 6. Technology Stack

### Orchestration

| Component           | Technology                                               |
| ------------------- | -------------------------------------------------------- |
| **Backend**         | Node.js / NestJS                                         |
| **Primary Database** | MongoDB (Mongoose) for projects, channels, campaigns, content, traction, decisions |
| **Cache**           | Redis for session state, real-time metrics               |
| **Job Queue**       | BullMQ (Redis-backed) for async agent execution, report generation, measurement ingestion |
| **Storage**         | S3-compatible for campaign assets, exported reports      |
| **State Machine**   | Custom NestJS state machine for GTM project lifecycle    |

### AI Services

| Service                       | Role                                                            |
| ----------------------------- | --------------------------------------------------------------- |
| **OpenAI API**                | Agent reasoning, strategy generation, content specs, copy writing |
| **OpenAI Structured Outputs** | Enforce JSON schemas on all agent outputs                       |
| **Web Search / Research API** | Market research, competitor analysis (optional integration)      |

### Analytics & Measurement

| Service             | Role                                                                |
| ------------------- | ------------------------------------------------------------------- |
| **Google Analytics 4** | Web/app traffic tracking, conversion measurement (via GTM script) |
| **Segment / Custom** | Analytics events ingestion, channel performance aggregation        |
| **Webhook Receivers** | Campaign platforms (ad networks, email, etc.) post conversion data |
| **Query Engine**    | Aggregation of channel metrics for reporting                       |

### Campaign Execution (Integrations)

| Platform            | Role                                            |
| ------------------- | ----------------------------------------------- |
| **Ad Networks**     | Google Ads, Facebook Ads APIs for campaign execution |
| **Email Provider**  | SendGrid, Mailchimp, or proprietary for email campaigns |
| **Content Hosting** | Vercel, Netlify for landing pages, blogs        |
| **Webhooks**        | Real-time event ingestion from campaign platforms |

---

## 7. Non-Functional Requirements

| Requirement                | Specification                                          |
| -------------------------- | ------------------------------------------------------ |
| **Availability**           | 99.5% uptime; async jobs degrade gracefully            |
| **Latency**                | Dashboard loads < 2s; API responses < 500ms           |
| **Data Consistency**        | Eventual consistency OK for analytics; strong for GTM state |
| **Scalability**            | Support 100+ simultaneous GTM projects                 |
| **Cost Efficiency**        | Minimize LLM API costs; use structured outputs, caching |
| **Auditability**           | All decisions logged with rationale and supporting data |
| **Integration Resilience** | Retry failing integrations; queue messages on failure  |

---

## 8. Integration Points

### With Builder SaaS

- **Input**: Build Package, product metrics, user behavior signals.
- **Trigger**: When Build Package reaches "approved for GTM" status.
- **Contract**: Structured Build Package JSON.

### With Startup Ops SaaS

- **Output**: Weekly traction reports, customer acquisition signals, retention baseline.
- **Input**: Long-term metrics, cohort analysis, retention curves.
- **Handoff**: When venture proves traction (100+ validated customers, repeatable channel).

### With Bruce Core

- **Report**: Weekly GTM status, traction signals, iteration recommendations.
- **Input**: Venture portfolio context, priority rankings.
- **Decision Gate**: Bruce Core decides portfolio allocation; GTM executes.

### With Shared Memory

- **Contribute**: Which channels work for which venture types, CAC benchmarks by category, content patterns that convert.
- **Consume**: Cross-venture learnings to accelerate strategy and channel selection.

---

## 9. Pipeline Flow

```
GTM Project Created
        │
        ▼
┌────────────────────────┐
│ Agent 1: GTM Strategist│
│ · Analyze positioning  │──► Channel Strategy (JSON)
│ · Generate candidates  │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Agent 2: Channel Spec. │
│ · Translate to tactics │──► Ranked Channels (JSON)
│ · Playbooks per channel│
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Agent 3: Content Agent │
│ · Map to channels      │──► Content System (JSON)
│ · Create specifications│
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Agent 4: Campaign Mgr  │
│ · Design campaigns     │──► Campaign Blueprints (JSON)
│ · Specify creative     │
└────────┬───────────────┘
         │
         ▼
  [Campaign Execution]
         │
         ▼
┌────────────────────────┐
│ Agent 5: Analytics     │
│ · Ingest traction data │──► Weekly Traction Report
│ · Calculate metrics    │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Agent 6: GTM Governance│
│ · Score channels       │──► Iteration Decision
│ · Recommend actions    │
└────────┬───────────────┘
         │
         └──────────────────┐
              [Repeat weekly] │
                            │
         ┌──────────────────┘
         ▼
  [Continue or Handoff]
```

---

## 10. Measurement Framework

### Core Metrics Per Channel

```json
{
  "channelId": "ObjectId",
  "period": "ISO8601",
  "impressions": "integer",
  "clicks": "integer",
  "conversions": "integer",
  "spend": "number",
  "cac": "number",
  "conversion_rate": "number",
  "roi": "number",
  "signal_strength": "number",
  "trend": "up|flat|down"
}
```

### Signal Interpretation Rules

| Signal               | Interpretation                                       |
| -------------------- | ---------------------------------------------------- |
| **Conversion > 0.5%** | Channel shows early promise; continue testing       |
| **CAC < projection** | Channel outperforming; increase budget allocation   |
| **CAC > 2x target**  | Channel underperforming; deprioritize or kill       |
| **Declining trend**  | Channel losing efficiency; recommend pivot or kill  |
| **Audience shift**   | Unexpected segment outperforming; reposition budget |

---

## 11. Success Criterion

The GTM SaaS architecture succeeds when:

| Criterion                       | Measure                                                |
| ------------------------------- | ------------------------------------------------------ |
| **Systematic execution**        | 0→100 customers in 8–12 weeks with clear channel attribution |
| **Channel clarity**             | 1–2 primary channels proven; kill decisions made on schedule |
| **Measurement discipline**      | 100% of campaigns tracked; weekly reports generated   |
| **Data-driven iteration**       | All rebalancing decisions backed by 2+ weeks of data  |
| **Cost efficiency**             | Blended CAC trending toward < 6 month payback        |
| **Portfolio coherence**         | All channels and campaigns reinforce same positioning |
| **Handoff readiness**           | When traction proven, cleanly hand off to Startup Ops |
