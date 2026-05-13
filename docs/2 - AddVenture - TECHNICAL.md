# Addventure — Technical documentation

## 1. System architecture

Addventure is a **multi-agent layered pipeline**: each layer has clear responsibility and exchanges **structured JSON payloads**. The architecture separates **strategic reasoning and synthesis** from **document assembly, queues, and persistence**.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│     Briefing · Review by volume · Export              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 ORCHESTRATION                            │
│          NestJS Backend · Job queue · Storage            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  AGENT PIPELINE                          │
│  Briefing → Opportunity → Market/Customer → Value       │
│  → Business model → GTM → Positioning → Risks           │
│  → Roadmap → Critique → Dossier composer                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               SUPPORT SERVICES                           │
│  OpenAI · Search (web) · PDF/HTML rendering (opt.)      │
└─────────────────────────────────────────────────────────┘
```

## 2. Logical layers

### Layer A — Briefing interpretation (LLM)

**Goal**: Transform raw briefing into a consistent and normalized brief.

**Engine**: reasoning model via API (e.g.: OpenAI) with **Structured Outputs**.

**Input**: user text (and optional metadata).

**Output**: JSON with fields like segment, thesis, constraints, stage, session objectives.

**Constraint**: rigid schema to avoid loose responses and facilitate following stages.

### Layer B — Research and anchoring

**Goal**: Inform decisions with market context before consolidating model and GTM.

**Typical methods**:

- Web search (category, competitors, trends)
- Structured synthesis into report (patterns, gaps, hypotheses to test)

**Output**: structured report — not “list of links”, but **actionable insights** and evidence gaps.

### Layer C — Volume generation (strategy)

**Goal**: Produce each volume (1–8) with explicit dependencies: volume *n* consumes outputs of *n−1* and the brief.

**Engine**: LLM with Structured Outputs per stage (or domain-specialized agents).

**Output pattern**: JSON objects per volume (diagnosis, ICP, value proposition, business canvas, GTM, narrative, risks, roadmap).

### Layer D — Routes / business scenarios (divergent exploration)

**Goal**: Where it makes sense, generate **multiple routes** (e.g.: two revenue models or two GTM wedges) for the user to **select** before deepening.

**Output**: structured list of scenarios with name, thesis, pros, cons, and risks.

### Layer E — Critique and iteration

**Goal**: Evaluate global coherence and prioritize failures.

**Input**: accumulated project state (relevant volumes).

**Output**: scores or severities, issue list, suggestion of which stages to reprocess.

**Action**: if below configurable threshold → return to orchestrator for new iteration in indicated agents.

### Layer F — Dossier composition and export

**Goal**: Assemble the final deliverable (HTML/PDF/Markdown/aggregated JSON) from structured parts.

**Engine**: templates + rendering (e.g.: HTML → PDF via headless browser or dedicated library).

## 3. Agent pipeline (implementation)

Central registry in `apps/api/src/agents/agents.module.ts` (handlers `agentName` ↔ `AgentProcessorService`). Orchestration: `POST /projects/:id/pipeline/start`, advances in `POST /projects/:id/pipeline/advance` when `requiresUserApproval` is true (`packages/shared/src/types/pipeline.ts`).

| Volume / stage | `agentName` | Agent file | HTTP read (payload) |
| -------------- | ----------- | ------------------- | ---------------------- |
| Briefing | `briefing-interpreter` | `briefing-interpreter.agent.ts` | `GET /projects/:id/briefing` |
| 1 — Opportunity | `opportunity-analyst` | `opportunity-analyst.agent.ts` | `GET /projects/:id/opportunity` |
| 2 — Customer / market | `customer-market-architect` | `customer-market-architect.agent.ts` | `GET /projects/:id/customer-market` |
| 3 — Value proposition | `value-proposition-designer` | `value-proposition-designer.agent.ts` | `GET /projects/:id/value-proposition` |
| 4 — Business model | `business-model-modeler` | `business-model-modeler.agent.ts` | `GET /projects/:id/business-model` |
| Scenarios (Vol. 4) | — | `ScenariosService` | `GET /projects/:projectId/scenarios`, `POST /projects/:projectId/scenarios/:scenarioId/select` |
| 5 — GTM | `gtm-planner` | `gtm-planner.agent.ts` | `GET /projects/:id/go-to-market` |
| 6 — Positioning | `narrative-strategist` | `narrative-strategist.agent.ts` | `GET /projects/:id/positioning` |
| 7 — Risks | `risk-validation-analyst` | `risk-validation-analyst.agent.ts` | `GET /projects/:id/risks` |
| 8 — Roadmap | `execution-roadmap-planner` | `execution-roadmap-planner.agent.ts` | `GET /projects/:id/execution` |
| Research (anchor) | — | `ResearchService` | `GET /projects/:id/research` |
| Critique | `venture-critic` | `venture-critic.agent.ts` | `GET /projects/:projectId/critique` |
| Dossier / export | `dossier-composer` | `dossier-composer.agent.ts` | `GET /projects/:id/dossier`, `POST /projects/:id/export`, `GET /projects/:id/export/jobs`, `GET /projects/:id/export/:exportId` |

Aggregated shortcut: `GET /projects/:id/venture-state` (pipeline state + volumes). Alternative by segment: `GET /projects/:id/volumes/:segment` (`segment` = `opportunity` \| `customer-market` \| … \| `execution`). Legacy routes `GET /projects/:id/strategy` / `strategy/full` and `GET /projects/:id/brandbook` are marked as deprecated in Swagger (prefer volumes and `dossier`).

## 4. Central data schema (illustrative)

Communication between stages via unified JSON, with sections per volume:

```json
{
  “project_id”: “string”,
  “brief”: { },
  “opportunity_diagnosis”: { },
  “customer_market_architecture”: { },
  “value_proposition_system”: { },
  “business_model”: {
    “scenarios”: [ ],
    “selected_scenario_id”: “string”
  },
  “go_to_market”: { },
  “positioning_narrative”: { },
  “validation_risk_map”: { },
  “execution_roadmap”: { },
  “critique”: {
    “scores”: { },
    “issues”: [ ],
    “suggested_iterations”: [ ]
  },
  “exports”: {
    “dossier_sections”: [ ],
    “formats”: [ “pdf”, “json” ]
  }
}
```

The internal fields of each volume must be defined by **versioned JSON Schema** and validated in LLM responses (Structured Outputs).

**MongoDB persistence (decision):** single collection `venture_documents` with `{ projectId, volumeKey, data, version, semanticVersion?, migratedFrom? }` and unique index `{ projectId: 1, volumeKey: 1 }` (Option A of the migration plan); `version` increments with each rewrite of the same volume; `semanticVersion` optional for user semantic iterations. Legacy `strategies` collection maps to `VolumeKey.OPPORTUNITY_DIAGNOSIS` via migration script; `creative_routes` stores business model scenarios (Volume 4); `visual_systems` / `logo_systems` remain only for historical branding data and do not enter venture orchestration.

## 5. Technology stack (implementation)

### Orchestration

| Component | Technology |
| ---------- | ---------- |
| **Runtime / monorepo** | Node.js **20+**, **pnpm**, Turbo |
| **Backend** | **NestJS** (`apps/api`) |
| **Database** | **MongoDB** (Mongoose) — projects, `venture_documents`, briefings, queues, etc. |
| **Job queue** | **BullMQ** on **Redis** |
| **Frontend** | **Next.js** (`apps/web`) |
| **Object storage** | S3-compatible (local MinIO or cloud) for PDF/JSON export |

**Not** part of the venture product core: **Figma**, **parametric SVG**, **logo** or **visual brand book** engines. Code or feature flags tied to visual identity are treated as **legacy** (see `ENABLE_LEGACY_BRANDING`, `docs/OPERATIONS.md`, ADR in `docs/adr/`).

### AI and data services

| Service | Role |
| ------- | ----- |
| **OpenAI API** | LLM agents, Structured Outputs |
| **Serper / SERP** (optional) | Web search in research module |

### Rendering and export

| Component | Technology |
| ---------- | ---------- |
| **Dossier / PDF** | HTML composition + export pipeline in API (no Figma dependency in main flow) |
| **API** | REST JSON; interactive documentation in **`/api/docs`** (Swagger) in Nest service |

## 6. API (REST)

Typical base URL: `http://localhost:3001` (configurable). **Authentication:** JWT Bearer (`Authorization: Bearer <token>`) on almost all resources below; exceptions: `GET /`, `GET /health`, `POST /auth/register`, `POST /auth/login`.

### Auth and user

| Path | Method | Description |
| ---- | ------ | --------- |
| `/auth/register` | POST | Register |
| `/auth/login` | POST | Login (token) |
| `/auth/me` | GET | Authenticated user |
| `/users/me` | GET | Profile |
| `/users/me` | PATCH | Update profile |

### Projects

| Path | Method | Description |
| ---- | ------ | --------- |
| `/projects` | GET, POST | List (pagination) / create project |
| `/projects/:id` | GET, PATCH, DELETE | Detail / update / delete |

### Briefing, volumes and state

| Path | Method | Description |
| ---- | ------ | --------- |
| `/projects/:id/briefing` | GET, POST | Read / submit briefing |
| `/projects/:id/venture-state` | GET | Aggregated snapshot (pipeline + volumes) |
| `/projects/:id/opportunity` | GET | Volume 1 |
| `/projects/:id/customer-market` | GET | Volume 2 |
| `/projects/:id/value-proposition` | GET | Volume 3 |
| `/projects/:id/business-model` | GET | Volume 4 |
| `/projects/:id/go-to-market` | GET | Volume 5 |
| `/projects/:id/positioning` | GET | Volume 6 |
| `/projects/:id/risks` | GET | Volume 7 |
| `/projects/:id/execution` | GET | Volume 8 |
| `/projects/:id/volumes/:segment` | GET | Same volumes by `segment` (see Swagger) |
| `/projects/:id/research` | GET | Research report |

### Scenarios (business model)

| Path | Method | Description |
| ---- | ------ | --------- |
| `/projects/:projectId/scenarios` | GET | List scenarios |
| `/projects/:projectId/scenarios/:scenarioId/select` | POST | Select scenario (before GTM) |

### Critique

| Path | Method | Description |
| ---- | ------ | --------- |
| `/projects/:projectId/critique` | GET | Critique and history |
| `/projects/:projectId/critique/auto-iterate` | POST | Automatic iteration from critique |
| `/projects/:projectId/critique/override` | POST | Accept despite score |
| `/projects/:projectId/critique/iterations` | GET | Iteration count |

### Dossier and export

| Path | Method | Description |
| ---- | ------ | --------- |
| `/projects/:id/dossier` | GET | Dossier metadata |
| `/projects/:id/export` | POST | Trigger export job (PDF/JSON) |
| `/projects/:id/export/jobs` | GET | List jobs |
| `/projects/:id/export/:exportId` | GET | Job status |

### Pipeline

| Path | Method | Description |
| ---- | ------ | --------- |
| `/projects/:id/pipeline/status` | GET | Pipeline status |
| `/projects/:id/pipeline/start` | POST | Start pipeline |
| `/projects/:id/pipeline/advance` | POST | Advance (human gate) |
| `/projects/:id/pipeline/iterate` | POST | Rerun target stage or volume |
| `/projects/:id/pipeline/cancel` | POST | Cancel jobs |
| `/projects/:id/pipeline/resume` | POST | Resume after cancel/failure |
| `/projects/:id/pipeline/reset-from-stage` | POST | Reset from a stage |
| `/projects/:id/pipeline/dead-letter` | GET | Jobs in dead-letter |
| `/projects/:id/pipeline/dead-letter/:jobId/retry` | POST | Retry job |
| `/projects/:id/pipeline/events` | GET (SSE) | Pipeline event stream |

### Other

| Path | Method | Description |
| ---- | ------ | --------- |
| `/projects/:projectId/assets/:assetId/download` | GET | Download asset |
| `/health` | GET | Health check |
| `/api/docs` | GET | Swagger UI |

## 7. Pipeline flow

```
Input (Briefing)
       │
       ▼
┌──────────────┐
│ Agent 1:     │
│ Briefing     │──► Structured brief (JSON)
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Volumes 1–8  │──► │ Critique     │──► │ Score OK?    │
│ (pipeline)   │     │ (venture)    │     └──────┬───────┘
└──────────────┘     └──────────────┘            │
       │                                        │ NO → iterate indicated stages
       │                                        │
       │                                        ▼ YES
       │                                 ┌──────────────┐
       └────────────────────────────────►│ Composer     │──► PDF / JSON / dossier
                                         │ (Agent 11)   │
                                         └──────────────┘
```

## 8. Technical requirements per volume (summary)

| Volume | Main requirements |
| ------ | --------------------- |
| **1 — Opportunity** | Explicit hypotheses; separate real vs. assumed pain; falsifiable signals |
| **2 — Market / customer** | ICP and personas with purchase behavior; citations or sources when research available |
| **3 — Value** | Testable proposition; perceived risk and proof |
| **4 — Model** | Comparable scenarios; revenue–channel–cost coherence |
| **5 — GTM** | Actionable wedge; traction metrics aligned to stage |
| **6 — Narrative** | Reusable messages (pitch, one-liner); optional branding bridge |
| **7 — Risks** | Validation order; “what breaks the thesis” |
| **8 — Roadmap** | Minimal MVP; anti-scope; time milestones |

## 9. Deployment considerations

Runbook (MongoDB backup, migration, Redis/Bull, S3, rollback, deploy order): **`docs/OPERATIONS.md`**.

| Concern | Approach |
| ----------- | --------- |
| **Long jobs** | Async queue; polling or webhooks for status |
| **Costs** | Token budgets per agent; cheaper model for simple tasks |
| **Cache** | Search result cache by project/version |
| **Idempotency** | Stage rerun without unwanted side effects |
| **Versioning** | History of theses and exports |
| **Rate limits** | Backoff on external APIs |
| **Security** | Secrets in vault; data isolation by project/user |

## 10. Relationship with visual identity (another domain)

This pipeline **does not** include graphic production engines (parametric SVG, raster, Figma) as a central requirement. **Volume 6** can serve as **input** for a separate branding product. Technical documentation for visual identity, if it exists in the repository, should be treated as a separate module or later phase.
