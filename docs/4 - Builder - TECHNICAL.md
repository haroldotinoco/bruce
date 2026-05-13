# Builder SaaS — Technical

## 1. Technical objective

The **Builder SaaS** must be implemented as an independent and multi-agent service, responsible for transforming approved ventures into **executable, testable, auditable, and iterable digital products**.

It must be consumable both as:
- an internal module of the Bruce ecosystem;
- as a standalone product.

Its implementation must allow successive cycles of:
- specification;
- validation;
- construction;
- testing;
- correction;
- promotion.

---

## 2. Architectural role

Within the ecosystem, Builder SaaS is a **digital delivery orchestrator**.

It should not be modeled merely as a simple artifact generation service, but as a pipeline composed of specialized roles and quality gates.

Its main technical responsibility is to transform structured inputs into a **promotable Build Package**.

---

## 3. Logical structure of the module

The Builder SaaS must contain, conceptually, the following layers:

### 3.1. Understanding and functional validation layer
Responsible for:
- interpreting the venture;
- validating business adherence;
- consolidating scope.

### 3.2. Documentation and design layer
Responsible for:
- documenting expected behavior;
- generating BDD;
- generating wireframes and layouts;
- validating visual and functional adherence.

### 3.3. Architecture and engineering layer
Responsible for:
- modeling the solution;
- defining components;
- identifying visible and invisible flows;
- planning implementation.

### 3.4. Implementation layer
Responsible for:
- generating backend;
- generating frontend;
- structuring project;
- integrating components.

### 3.5. Validation and security layer
Responsible for:
- executing real tests;
- validating API;
- validating frontend;
- auditing security;
- consolidating failures.

### 3.6. Governance layer
Responsible for:
- calculating score;
- deciding promotion;
- blocking problematic builds;
- generating residual backlog.

---

## 4. Main entities

## 4.1. BuildProject
Main entity of the construction process.

### Suggested fields
- `_id`
- `ventureId`
- `name`
- `summary`
- `mainHypothesis`
- `buildGoal`
- `status`
- `score`
- `readinessStatus`
- `createdAt`
- `updatedAt`

---

## 4.2. BuildArtifact
Represents an artifact produced by any layer of the flow.

### Suggested fields
- `_id`
- `buildProjectId`
- `type`
- `label`
- `version`
- `status`
- `sourceAgent`
- `payload`
- `createdAt`

Examples of `type`:
- `functional_spec`
- `bdd_spec`
- `wireframe`
- `solution_architecture`
- `backend_project`
- `frontend_project`
- `test_report`
- `security_report`
- `issue_list`

---

## 4.3. BuildIssue
Represents failures, gaps, or non-conformities detected in the process.

### Suggested fields
- `_id`
- `buildProjectId`
- `title`
- `description`
- `severity`
- `sourceStage`
- `sourceAgent`
- `status`
- `recommendedAction`
- `createdAt`
- `updatedAt`

---

## 4.4. BuildDecision
Represents a formal governance decision.

### Suggested fields
- `_id`
- `buildProjectId`
- `decision`
- `score`
- `reasoningSummary`
- `blockingIssues`
- `recommendedNextStep`
- `createdAt`

---

## 5. Possible statuses

## 5.1. BuildProject
- `received`
- `under_functional_validation`
- `under_behavior_definition`
- `under_design_definition`
- `under_architecture`
- `backend_in_progress`
- `backend_under_validation`
- `frontend_in_progress`
- `frontend_under_validation`
- `under_security_review`
- `under_governance_review`
- `approved`
- `approved_with_residual_issues`
- `rework_required`
- `blocked`
- `failed`

## 5.2. BuildIssue
- `open`
- `in_progress`
- `resolved`
- `accepted_risk`
- `wont_fix`

---

## 6. Expected technical agents

The service should be designed to support agents or roles such as:

- `product_validation_agent`
- `ux_behavior_agent`
- `design_agent`
- `solution_architect_agent`
- `software_engineering_agent`
- `backend_agent`
- `frontend_agent`
- `qa_agent`
- `beta_tester_agent`
- `cyber_security_agent`
- `build_governance_agent`

---

## 7. Input contract

The service must accept a structured payload containing venture, branding, constraints, and build target.

### Conceptual input example

```json
{
  "venture": {
    "id": "venture_123",
    "name": "FlowPilot",
    "summary": "Cashflow visibility for small retailers",
    "mainHypothesis": "Retailers will adopt a simple forecasting workflow if setup is easy",
    "businessRequirements": [
      "dashboard",
      "cashflow forecast",
      "transactions input"
    ]
  },
  "brand": {
    "name": "FlowPilot",
    "tone": "clear and trustworthy",
    "visualDirection": {
      "primaryColor": "#0F766E",
      "secondaryColor": "#0EA5E9"
    }
  },
  "buildConstraints": {
    "targetStack": "web",
    "qualityTargetScore": 99,
    "goal": "deliver MVP for first validation round"
  }
}
```

---

## 8. System architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                       │
│       Build Dashboard · Artifact Browser · Reports   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                 ORCHESTRATION LAYER                    │
│       NestJS Backend · Job Queue · State Machine     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  AGENT PIPELINE                       │
│  Product Val. → UX/BDD → Design → Architecture      │
│  → Backend → Frontend → QA → Security → Governance   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               EXECUTION ENGINES                       │
│  OpenAI · Code Gen · Test Runners · Security Scanners│
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                DATA & STORAGE                         │
│  MongoDB · Redis · S3 · Build Artifact Repository    │
└─────────────────────────────────────────────────────┘
```

---

## 9. Technology stack

### Orchestration

| Component | Technology |
| ---------- | ---------- |
| **Backend** | Node.js / NestJS |
| **Database** | MongoDB (Mongoose) for build projects, artifacts, issues, decisions |
| **Job Queue** | BullMQ (Redis-backed) for async agent execution and build jobs |
| **Storage** | S3-compatible for build artifacts, test reports, exported packages |
| **State Machine** | Custom NestJS state machine for build lifecycle |

### AI Services

| Service | Role |
| ------- | ----- |
| **OpenAI API** | Agent reasoning, code generation, architecture design, security analysis |
| **OpenAI Structured Outputs** | JSON Schema enforcement on all agent outputs |

### Build & Test Infrastructure

| Service | Role |
| ------- | ----- |
| **Code Generation** | LLM-assisted scaffolding for backend (NestJS) and frontend (Next.js) |
| **Test Execution** | Real API calls, browser-based frontend testing |
| **Security Scanning** | Automated vulnerability scanning, OWASP checks |

---

## 10. Suggested API endpoints

### Build Projects

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/builds` | POST | Create a new build project from venture + brand inputs |
| `/builds/:id` | GET | Retrieve build project state and all artifacts |
| `/builds/:id/status` | GET | Current build pipeline status |

### Artifacts

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/builds/:id/artifacts` | GET | List all artifacts for build |
| `/builds/:id/artifacts/:artifactId` | GET | Retrieve specific artifact |

### Issues & Governance

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/builds/:id/issues` | GET | List all detected issues |
| `/builds/:id/issues/:issueId` | PATCH | Update issue status |
| `/builds/:id/decision` | GET | Retrieve governance decision |
| `/builds/:id/score` | GET | Current build readiness score |

### Pipeline Control

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/builds/:id/pipeline/start` | POST | Start build pipeline |
| `/builds/:id/pipeline/advance` | POST | Advance past human gate |
| `/builds/:id/pipeline/iterate` | POST | Trigger correction loop on specific stage |
| `/builds/:id/pipeline/status` | GET | Pipeline progress and stage |

---

## 11. Non-functional requirements

| Requirement | Specification |
| ----------- | ------------- |
| **Build time** | Target < 48 hours for initial build; < 24 hours for correction loops |
| **Artifact storage** | All artifacts versioned and immutable; full history preserved |
| **Auditability** | Every agent decision logged with rationale and evidence |
| **Idempotency** | Any stage can be re-executed without side effects |
| **Cost efficiency** | Token budgets per agent; model selection based on task complexity |
| **Security** | Build artifacts isolated per venture; secrets managed via vault |