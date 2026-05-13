# Addventure — Functional documentation

## 1. Overview

Addventure is an AI system that guides the user through a **complete venture / business strategy process**: from intellectual validation of opportunity to execution roadmap. Instead of a single document generated from a prompt, the product orchestrates a stage-by-stage pipeline that produces a **decision package** — diagnosis, market, value, model, GTM, narrative, risks, and plan.

## 2. User journey

### 2.1 Initial briefing

The user starts with a briefing flow (wizard or guided form). The system collects, among others:

| Input | Description |
| ------- | --------- |
| **Segment / context** | Industry, problem, stage (idea, MVP, traction) |
| **Initial thesis** | What you intend to build and for whom |
| **Founder hypotheses** | About pain, willingness to pay, competitors |
| **Constraints** | Time, budget, geography, preferred or avoided models |
| **Session objective** | E.g.: validate thesis, prepare pitch, define MVP, compare models |

The system **interprets** the raw briefing into a structured and versioned format before advancing.

### 2.2 Volume 1 — Opportunity diagnosis

Based on the interpreted briefing, the system produces (and the user reviews):

- Core problem and **real vs. assumed pain**
- Urgency, context of use, who feels the pain
- Current alternatives and why they fail
- Market signals and **clear opportunity hypothesis**

Guide questions: *Does it solve a real problem? Who would pay? Nice-to-have or must-have?*

### 2.3 Volume 2 — Customer and market architecture

- Primary and secondary ICP
- Buyer and user persona (purchasing and adoption behavior, not just demographics)
- Jobs-to-be-done, purchase triggers, objections
- Market landscape and **competitive benchmark**

Goal: go beyond “marketing persona” — reach **purchase and adoption**.

### 2.4 Volume 3 — Value proposition system

- Core value proposition and promised transformation
- Perceived differential, functional and emotional benefits
- Proof, credibility, “reason to believe”, perceived risk

Expected result: clear answer to *”why would they choose this over ignoring it or using something else?”*

### 2.5 Volume 4 — Business model design

Sophisticated equivalent to Business Model / Lean Canvas, without being “template by template”:

- Segments, channels, relationships, key activities and resources, partners
- Cost structure, revenue sources, retention, growth loops
- **Comparable scenarios** (e.g.: SaaS vs. service vs. marketplace), with explicit trade-offs

The user can **select** a base scenario (or hybrid) for the following stages.

### 2.6 Volume 5 — Go-to-market blueprint

- Entry wedge, initial priority channel, entry offering
- Acquisition, onboarding, activation, retention, expansion
- **Early traction** plan coherent with resources and model

Central question: *”how does this enter the real world without relying only on luck?”*

### 2.7 Volume 6 — Positioning and narrative

- Category, competitive frame, positioning
- Company thesis, core message, one-liner, pitch, founding narrative
- Differentiation angles

This layer **touches brand identity** and can be direct input to a branding product — without mixing brand deliverables with business ones in this pipeline.

### 2.8 Volume 7 — Validation and risk map

- Critical hypotheses and falsification order
- Adoption, pricing, operations, and competition risks
- What to validate **before** heavy investment

Generates a scored or structured report; if uncertainty level is high, the flow suggests **iteration** in earlier volumes.

### 2.9 Volume 8 — Execution roadmap

- Recommended MVP and v1 scope
- What **not** to build now
- 30 / 60 / 90-day milestones, initial metrics, strategic priorities

### 2.10 Strategic critique (cross-cutting)

Before closing the package, a **critique** stage evaluates global coherence:

- Gaps between ICP, offering, and revenue model
- Fragility of GTM against the wedge
- Thesis “too optimistic” without mitigation
- List of questions investors or customers would ask

Critique generates actionable feedback; thresholds can trigger **iteration** in specific stages.

### 2.11 Dossier assembly / export

The final deliverable is a **multi-volume package** (structure aligned to volumes 1–8), exportable in professional formats (e.g.: consolidated PDF, structured JSON for integrations, section-by-section reports).

### 2.12 Volume names (UI ↔ API)

The eight volumes use the same titles in web messages (`apps/web/messages/*.json`, key `volumes.segments.*.title`) and REST segments in `GET /projects/:id/<segment>`:

| # | HTTP Segment | Theme |
| - | ------------- | ---- |
| 1 | `opportunity` | Opportunity diagnosis |
| 2 | `customer-market` | Customer and market architecture |
| 3 | `value-proposition` | Value proposition system |
| 4 | `business-model` | Business model (+ scenarios) |
| 5 | `go-to-market` | Go-to-market blueprint |
| 6 | `positioning` | Positioning and narrative |
| 7 | `risks` | Validation and risk map |
| 8 | `execution` | Execution roadmap |

## 3. Feature summary

### 3.1 MVP

| Feature | Description |
| -------------- | --------- |
| Guided briefing | Intake → structured brief |
| 8-volume pipeline | Sequential content with review between stages |
| Business model scenarios | At least basic comparison between 2 models |
| Risk and hypothesis map | Prioritized list with next validation steps |
| Base export | PDF and/or JSON package per project |

### 3.2 Full product

| Feature | Description |
| -------------- | --------- |
| Assisted market research | Web search, competitor and trend synthesis |
| Multiple strategic routes | Multiple positioning / GTM lines for selection |
| Multi-agent refinement | Iteration driven by specialized agents |
| Scoring critique | Structured evaluation and improvement loops |
| Thesis versioning | Compare versions of the same project over time |
| Branding integration (optional) | Export Volume 6 as input for brand identity |

## 4. Roles and interactions

| Role | Interaction |
| ----- | --------- |
| **Founder / PM** | Fills in briefing, reviews each volume, selects scenarios, approves export |
| **Consultant / mentor (optional)** | Comments or adjusts hypotheses in collaborative sessions (if the product supports it) |
| **System (pipeline)** | Orchestrates stages, generates structured outputs, applies critique and quality rules |

## 5. Flow rules

1. **Modular progression** — The system works in modules (opportunity → market → value → model → GTM → narrative → risk → roadmap), not in a single monolithic generation.
2. **Mandatory justification** — Central assertions include rationale and, where applicable, “where this breaks”.
3. **Critique before closure** — The final package is consolidated only after passing through critique (or with explicit risk warning if the user forces it).
4. **Structured data** — Intermediate outputs in JSON (or equivalent) for traceability and export.
5. **Human-in-the-loop at gates** — In the current implementation there are **three** explicit approval points in the pipeline (`requiresUserApproval` in `STAGE_DEFINITIONS`): after the **interpreted briefing**, after **volume 4 (business model / scenario)**, and after the **venture critique** before the dossier composer. The user advances with `POST /projects/:id/pipeline/advance`; there is no fourth gate dedicated only to `POST /projects/:id/export` — export is unlocked when the pipeline reaches the composer stage.
