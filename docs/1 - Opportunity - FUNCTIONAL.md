# Opportunity SaaS — Functional

## 1. Functional objective

The **Opportunity SaaS** aims to identify, structure, score, and prioritize opportunities with the potential to become viable ventures.

It should function as the first stage of Bruce's venture creation pipeline, delivering opportunities mature enough to be explored further by the next module.

---

## 2. Expected result

At the end of its execution, the module should be able to produce one or more **Opportunity Briefs** containing:

- main problem;
- affected audience;
- solution hypothesis;
- strategic rationale;
- relevance signals;
- opportunity score;
- recommendation to advance or discard.

---

## 3. Main responsibilities

The module should be able to:

1. **Explore opportunities**
   - generate opportunities from themes, sectors, pain points, signals, or objectives.

2. **Structure opportunities**
   - transform vague intuitions into readable and comparable opportunities.

3. **Enrich opportunities**
   - add context, motivation, possible value angles, and market understanding.

4. **Score opportunities**
   - assign a potential evaluation.

5. **Prioritize opportunities**
   - rank which ones deserve to advance.

6. **Discard weak opportunities**
   - prevent the pipeline from proceeding with weak hypotheses.

---

## 4. Possible inputs

Opportunity SaaS should accept different starting points.

### 4.1. Open input
When the system wants to discover opportunities freely.

Example:
- “find promising opportunities for Bruce to explore”

### 4.2. Thematic input
When a specific domain or sector exists.

Example:
- fintech
- edtech
- health
- creator economy
- B2B SaaS
- operational automation

### 4.3. Pain-based input
When a known friction already exists.

Example:
- “people struggle to…”
- “SMBs lose money with…”

### 4.4. Audience-based input
When the focus is on a specific segment.

Example:
- first-time mothers
- dental clinics
- micro-retail
- outbound sales teams

### 4.5. Signal-based input
When the system starts from trends, patterns, or emerging behaviors.

---

## 5. Primary output

The primary output of the module is the **Opportunity Brief**.

### Minimum structure of the Opportunity Brief
Each brief should contain:

- opportunity title
- brief description
- central problem
- primary target audience
- context / why now
- value hypothesis
- possible solution angles
- relevance signals
- initial risks
- score
- priority
- final recommendation

---

## 6. Primary functional flow

```
┌───────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────────┐    ┌───────────────┐
│ Discovery │───►│ Formulation  │───►│Qualification │───►│Prioritization │───►│  Promotion     │
│           │    │              │    │              │    │               │    │  to Venture    │
│ generate  │    │ structure    │    │ score &      │    │ rank by       │    │  SaaS          │
│ opps from │    │ problem,     │    │ evaluate     │    │ priority      │    │               │
│ context   │    │ audience,    │    │ criteria     │    │ (high/med/    │    │ mark as fit   │
│           │    │ rationale    │    │              │    │  low/discard) │    │ to advance    │
└───────────┘    └──────────────┘    └──────────────┘    └───────────────┘    └───────────────┘
```

## 6.1. Discovery
The system receives a context or objective and generates one or more initial opportunities.

### Example objective
- find promising opportunities for new ventures

---

## 6.2. Formulation
Each opportunity is transformed into a readable structure.

At this stage, the module organizes:
- the problem;
- the audience;
- the motivation;
- the rationale;
- the market context.

---

## 6.3. Qualification
Each opportunity is evaluated based on quality criteria.

Examples:
- clarity of the pain point
- apparent size of the pain point
- recurrence
- monetization potential
- urgency
- distribution capability
- simplicity of testing

---

## 6.4. Prioritization
Opportunities are ranked by priority.

Possible outputs:
- high priority
- medium priority
- low priority
- discarded

---

## 6.5. Promotion to Venture
Opportunities with sufficient quality are marked as fit to proceed to **Venture SaaS**.

---

## 7. Modes of use

## 7.1. Bruce mode
When used by Bruce, the module should operate as part of a larger pipeline.

In this mode, it should:
- generate opportunities for the portfolio;
- compare them with each other;
- return outputs ready for automatic consumption by other modules.

## 7.2. Standalone mode
When used as an independent SaaS, it should serve an external user.

In this mode, it should:
- receive a briefing;
- generate organized opportunities;
- return reports usable by humans.

---

## 8. Important functional rules

### 8.1. Not every execution needs to generate multiple opportunities
The module can return:
- a single very strong opportunity;
- or several comparable opportunities.

### 8.2. Opportunity is not branding
This module should not create:
- brand name;
- slogan;
- visual identity.

### 8.3. Opportunity is not final venture
This module should not detail:
- complete business model;
- complete GTM strategy;
- product architecture.

### 8.4. Opportunities must be comparable
All output must follow a consistent structure to allow ranking and selection.

---

## 9. Module quality criteria

Opportunity SaaS will be considered functionally good when:

- it generates clear and understandable opportunities;
- it avoids vague or generic ideas;
- it organizes the problem and audience well;
- it can distinguish strong opportunities from weak ones;
- it produces useful outputs for Venture SaaS;
- it helps Bruce avoid wasting energy on weak hypotheses.

---

## 10. Expected integrations

### Input
Can receive context from:
- Bruce Core
- human inputs
- research signals
- strategic themes
- portfolio theses

### Output
Should feed primarily:
- Venture SaaS

Optionally can also feed:
- Portfolio / Governance
- Bruce's shared memory

---

## 11. Module success criterion

Opportunity SaaS fulfills its function when it improves the quality of the system's first decision:

> **what deserves to be investigated and what does not.**