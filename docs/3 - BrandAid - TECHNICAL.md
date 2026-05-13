# Brand-Aid — Technical Documentation

## 1. System Architecture

Brand-Aid is designed as a **layered, multi-agent pipeline** where each layer has a clear responsibility and communicates via structured JSON payloads. The architecture separates strategic reasoning from visual production and finishing.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│           Briefing Wizard · Review UI · Export           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 ORCHESTRATION LAYER                      │
│          NestJS Backend · Job Queue · Storage            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  AGENT PIPELINE                          │
│  Briefing → Strategy → Research → Creative Direction    │
│  → Visual System → Logo Design → Critique → Book        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               PRODUCTION ENGINES                        │
│  OpenAI · SVG Engine · Optional Raster · Figma (opt.)   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                RENDERING & EXPORT                        │
│      SVG Parametric · PDF Gen · Token Export · Figma     │
└─────────────────────────────────────────────────────────┘
```

## 2. Architectural Layers

### Layer A — Strategy (LLM Reasoning)

**Purpose**: Transform the raw briefing into a consistent strategic foundation.

**Engine**: OpenAI (latest reasoning model, e.g., gpt-5.4) with Structured Outputs.

**Input**: Raw briefing from the user (text, optional images/references).

**Output**: Rigid JSON schema containing:

```json
{
  "brand_essence": "string",
  "audience_segments": ["string"],
  "market_tensions": ["string"],
  "desired_perception": "string",
  "taboo_list": ["string"],
  "brand_voice": {
    "traits": ["string"],
    "do": ["string"],
    "dont": ["string"]
  },
  "color_psychology_targets": ["string"],
  "typography_constraints": ["string"],
  "logo_semantic_routes": ["string"]
}
```

**Key constraint**: All outputs use OpenAI Structured Outputs to enforce JSON Schema adherence and prevent unstructured responses.

### Layer B — Research & Grounding

**Purpose**: Gather competitive intelligence and category context before any creative work.

**Methods**:

- Web search (category, competitors, trends)
- Controlled scraping (competitor brand assets)
- Embeddings + ranking (relevance scoring of references)
- Visual analysis of competitor logos (multimodal input)

**Output**: Structured report identifying:

- Repeated patterns and clichés in the category
- Saturated visual codes to avoid
- White spaces and differentiation opportunities
- Premium benchmarks to reference

### Layer C — Creative Direction

**Purpose**: Generate divergent creative territories for the user to choose from.

**Engine**: OpenAI LLM for conceptual generation.

**Output**: 3–5 creative routes, each as a structured object:

```json
{
  "name": "string",
  "thesis": "string",
  "visual_metaphors": ["string"],
  "verbal_direction": "string",
  "color_direction": ["string"],
  "typography_direction": ["string"],
  "logo_principles": ["string"],
  "risks": ["string"]
}
```

### Layer D — Visual Production

**Purpose**: Produce visual assets using specialized engines per asset type.

**Two-mode visual pipeline:**

| Mode                     | Engine                                                                                        | Use Case                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **SVG-First (Primary)**  | Custom SVG engine (`@svgdotjs/svg.js`, `svgo`, `opentype.js`)                                 | Logo construction, icon generation, color swatches, typography specimens — all vector-native, no raster dependency |
| **Raster (Secondary)**   | OpenAI GPT Image (default) + optional providers (Replicate, fal.ai, Together AI, self-hosted) | Concept exploration, mood boards, photography direction — ideation only, never final output                        |
| **Design System Export** | Figma API (optional)                                                                          | System assembly, prototyping, components, presentation boards, handoff                                             |

Raster providers are pluggable via an adapter interface (`RasterProvider`). The system auto-detects configured providers and falls back to OpenAI if none are set.

### Layer E — Vectorization & Finishing

**Purpose**: Transform AI proposals into production-ready assets.

**Pipeline**:

1. Convert approved direction into **parametric SVG**.
2. Refine curves, proportions, grid alignment, clear space, contrast.
3. Generate systematic variations: horizontal, vertical, symbol-only, monochrome, negative, favicon, app icon.
4. Apply minimum-size and legibility checks.

**Rule**: The AI proposes; the vector engine consolidates. No raster image is ever delivered as a final logo.

## 3. Agent Pipeline

The system uses 8 specialized agents, each with a defined input/output contract.

### Agent 1 — Briefing Interpreter

| Property   | Value                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| **Input**  | Raw user briefing (text + optional media)                                                                          |
| **Output** | Structured brief: segment, audience, thesis, differentiators, constraints, desired perception, perception to avoid |
| **Model**  | OpenAI reasoning model with Structured Outputs                                                                     |

### Agent 2 — Brand Strategist

| Property   | Value                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| **Input**  | Structured brief from Agent 1                                                                               |
| **Output** | Positioning, value proposition, statement, brand pillars, archetype blend, tone of voice, semantic universe |
| **Model**  | OpenAI reasoning model with Structured Outputs                                                              |

### Agent 3 — Market / Competitor Analyst

| Property   | Value                                                                            |
| ---------- | -------------------------------------------------------------------------------- |
| **Input**  | Structured brief + strategy from Agents 1–2                                      |
| **Output** | Repeated patterns, disruption opportunities, dominant visual codes, white spaces |
| **Tools**  | Web search, scraping, embeddings, multimodal analysis                            |

### Agent 4 — Creative Director

| Property   | Value                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| **Input**  | Strategy + research from Agents 2–3                                                                    |
| **Output** | 3–5 creative routes: name, central metaphor, visual language, verbal identity, risks and opportunities |
| **Model**  | OpenAI reasoning model with Structured Outputs                                                         |

### Agent 5 — Visual System Designer

| Property    | Value                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Input**   | Selected creative route from Agent 4                                                                                      |
| **Output**  | Primary/secondary palette, tonal scales, display/body typography, grid, icon style, motion principles, UI/brand system    |
| **Engines** | OpenAI (reasoning + Structured Outputs), SVG engine (color/type generation), optional raster providers (exploration only) |

### Agent 6 — Logo Designer

| Property     | Value                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Input**    | Visual system + creative route from Agents 4–5                                                                    |
| **Output**   | Symbol concept, geometric construction, alternatives, usage rules, variations                                     |
| **Pipeline** | LLM concept → vector instructions → SVG engine → heuristic refinement → optional AI exploration → final selection |

### Agent 7 — Brand Critic

| Property   | Value                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Input**  | Complete proposal from Agents 2–6                                                                                                 |
| **Output** | Scored evaluation: cliché detection, typographic coherence, palette originality, metaphor depth, strategic alignment, scalability |
| **Action** | If score below threshold → feedback loop to relevant agents for iteration                                                         |

### Agent 8 — Brand Book Composer

| Property   | Value                                                 |
| ---------- | ----------------------------------------------------- |
| **Input**  | Approved brand system from Agents 2–7                 |
| **Output** | Multi-volume brand book (PDF/Figma) + exported assets |

## 4. Core Data Schema

All inter-agent communication uses a unified JSON structure enforced via Structured Outputs:

```json
{
  "brand_strategy": {
    "essence": "string",
    "positioning": "string",
    "audience": ["string"],
    "brand_pillars": ["string"],
    "archetypes": ["string"],
    "tone_of_voice": {
      "traits": ["string"],
      "do": ["string"],
      "dont": ["string"]
    }
  },
  "creative_routes": [
    {
      "name": "string",
      "thesis": "string",
      "visual_metaphors": ["string"],
      "verbal_direction": "string",
      "color_direction": ["string"],
      "typography_direction": ["string"],
      "logo_principles": ["string"],
      "risks": ["string"]
    }
  ],
  "visual_system": {
    "palette": ["object"],
    "type_system": ["object"],
    "layout_principles": ["string"],
    "iconography": ["string"],
    "image_direction": ["string"]
  },
  "logo_system": {
    "concept": "string",
    "construction_notes": ["string"],
    "variations": ["string"],
    "dos_donts": ["string"]
  },
  "deliverables": {
    "brandbook_sections": ["string"],
    "figma_frames": ["string"],
    "export_assets": ["string"]
  }
}
```

## 5. Technology Stack

### Orchestration

| Component               | Technology                                             |
| ----------------------- | ------------------------------------------------------ |
| **Backend**             | Node.js / NestJS                                       |
| **Primary database**    | MongoDB (Mongoose, `MONGODB_URI`) for projects, pipeline jobs, users, assets metadata |
| **Job Queue**           | Bull / BullMQ (Redis-backed) for heavy async jobs      |
| **Storage**             | S3-compatible object storage for assets                |
| **Proposal Versioning** | MongoDB-backed documents per project and pipeline stage |

### AI Services

| Service                            | Role                                                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **OpenAI API (Responses API)**     | Reasoning, structuring, multimodal input, creative direction, critique, image generation/editing                       |
| **OpenAI Structured Outputs**      | JSON Schema enforcement on all LLM responses                                                                           |
| **OpenAI GPT Image (gpt-image-1)** | Conceptual image exploration and composition iteration (default raster provider)                                       |
| **Optional Raster Providers**      | Replicate, fal.ai, Together AI, or self-hosted ComfyUI/A1111 — pluggable via `RasterProvider` adapter interface        |
| **SVG Engine**                     | `@svgdotjs/svg.js` + `svgo` + `opentype.js` + `sharp` + `chroma-js` — vector-native logo/icon/swatch/specimen pipeline |
| **Figma API + Dev Mode MCP**       | Design system composition, prototyping, component library, handoff (optional)                                          |

### Rendering & Export

| Component            | Technology                                                           |
| -------------------- | -------------------------------------------------------------------- |
| **SVG Engine**       | Programmatic SVG generation (e.g., svg.js, custom parametric engine) |
| **PDF Generation**   | Puppeteer / Playwright for HTML→PDF, or dedicated PDF library        |
| **Design Tokens**    | JSON + CSS custom properties export                                  |
| **Brand Book Pages** | Templated HTML/React pages rendered to PDF                           |

## 6. API Design (High-Level)

### Projects

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/projects`                            | POST   | Create a new brand project                     |
| `/projects/:id`                        | GET    | Retrieve project state and all outputs         |
| `/projects/:id/briefing`               | POST   | Submit or update the briefing                  |
| `/projects/:id/strategy`               | GET    | Retrieve generated strategy                    |
| `/projects/:id/research`               | GET    | Retrieve market research results               |
| `/projects/:id/routes`                 | GET    | Retrieve creative territory options            |
| `/projects/:id/routes/:routeId/select` | POST   | Select a creative route to develop             |
| `/projects/:id/visual-system`          | GET    | Retrieve the visual system                     |
| `/projects/:id/logo`                   | GET    | Retrieve logo concepts and variations          |
| `/projects/:id/critique`               | GET    | Retrieve critic evaluation and scores          |
| `/projects/:id/brandbook`              | GET    | Retrieve or download the brand book            |
| `/projects/:id/export`                 | POST   | Trigger asset export (PDF, SVG, Figma, tokens) |

### Pipeline Control

| Endpoint                         | Method | Description                                 |
| -------------------------------- | ------ | ------------------------------------------- |
| `/projects/:id/pipeline/status`  | GET    | Current pipeline stage and progress         |
| `/projects/:id/pipeline/advance` | POST   | Advance to next stage (after user approval) |
| `/projects/:id/pipeline/iterate` | POST   | Request iteration on current stage          |

## 7. Pipeline Flow

```
User Input (Briefing)
       │
       ▼
┌──────────────┐
│ Agent 1:     │
│ Briefing     │──► Structured Brief (JSON)
│ Interpreter  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Agent 2:     │
│ Brand        │──► Strategy Package (JSON)
│ Strategist   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Agent 3:     │
│ Market       │──► Research Report (JSON)
│ Analyst      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Agent 4:     │
│ Creative     │──► 3–5 Creative Routes (JSON)
│ Director     │
└──────┬───────┘
       │
       ▼
  [User selects route]
       │
       ▼
┌──────────────┐
│ Agent 5:     │
│ Visual System│──► Complete Visual System (JSON + Assets)
│ Designer     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Agent 6:     │
│ Logo         │──► Logo System (SVG + JSON)
│ Designer     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Agent 7:     │──► Score ≥ threshold? ──► YES ──►┐
│ Brand Critic │                                   │
└──────┬───────┘                                   │
       │ NO                                        │
       ▼                                           │
  [Iterate on failing agents]                      │
                                                   ▼
                                          ┌──────────────┐
                                          │ Agent 8:     │
                                          │ Brand Book   │──► PDF + Figma + Assets
                                          │ Composer     │
                                          └──────────────┘
```

## 8. Color System — Technical Requirements

The color system must go beyond a simple palette. Each color entry must include:

| Property                     | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| **Hex / RGB / HSL**          | Color values in multiple formats                     |
| **Semantic role**            | What the color means (primary, accent, danger, etc.) |
| **Competitive position**     | How it differentiates from category norms            |
| **Operational use**          | Where it appears (backgrounds, CTAs, text, etc.)     |
| **Accessibility**            | WCAG contrast ratios against common backgrounds      |
| **Dark/Light variants**      | Adapted versions for both modes                      |
| **UI vs. Branding**          | Separate tokens for interface and marketing use      |
| **Gradient & Surface logic** | Rules for blending, layering, and material treatment |

## 9. Typography System — Technical Requirements

| Property              | Description                                      |
| --------------------- | ------------------------------------------------ |
| **Display typeface**  | For headlines, hero sections, brand statements   |
| **Body typeface**     | For running text, UI, documentation              |
| **Personality**       | Character attributes of the chosen typefaces     |
| **Curve analysis**    | Humanist vs. geometric characteristics           |
| **Width & x-height**  | Proportion metrics                               |
| **Mobile legibility** | Minimum sizes and spacing for small screens      |
| **Pairing rationale** | Why display and body fonts complement each other |
| **Category contrast** | How the type choices differ from competitors     |

## 10. Logo Pipeline — Technical Detail

| Step                         | Engine                                | Output                                                   |
| ---------------------------- | ------------------------------------- | -------------------------------------------------------- |
| 1. Concept                   | LLM (OpenAI)                          | Semantic meaning, metaphor, strategic intent             |
| 2. Vector instructions       | LLM (OpenAI)                          | Geometric directives: shapes, proportions, relationships |
| 3. Base assembly             | SVG engine                            | Raw parametric SVG with construction lines               |
| 4. Proportion refinement     | Heuristic algorithms                  | Grid-aligned, optically balanced SVG                     |
| 5. AI exploration (optional) | GPT Image / optional raster providers | Raster explorations for ideation only                    |
| 6. Final selection           | Critic agent + user                   | Scored and approved direction                            |
| 7. Variation generation      | SVG engine                            | All required versions (horizontal, vertical, mono, etc.) |

## 11. Deployment Considerations

| Concern               | Approach                                                                     |
| --------------------- | ---------------------------------------------------------------------------- |
| **Long-running jobs** | Async pipeline with job queue; webhook/polling for status                    |
| **Cost management**   | Token budgets per agent; model selection per task complexity                 |
| **Caching**           | Cache research results and intermediate outputs for iteration                |
| **Idempotency**       | Each pipeline stage is rerunnable without side effects                       |
| **Versioning**        | Every proposal version is stored; users can compare and revert               |
| **Rate limits**       | Respect OpenAI and optional provider API rate limits with backoff strategies |
| **Security**          | API key management via secrets; user data isolation per project              |
