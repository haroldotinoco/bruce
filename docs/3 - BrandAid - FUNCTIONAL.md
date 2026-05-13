# Brand-Aid — Functional Documentation

## 1. Overview

Brand-Aid is an AI-powered branding system that guides users through a complete, agency-grade brand creation process. Rather than generating a single logo from a prompt, the system orchestrates a multi-stage pipeline that produces a full brand decision package — from strategic diagnosis to exportable assets.

## 2. User Journey

### 2.1 Briefing Intake

The user begins by filling out an interactive briefing wizard. The system collects:

| Input                   | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| **Business segment**    | Industry, sub-category, niche                         |
| **Target audience**     | Demographics, psychographics, behavioral traits       |
| **Core thesis**         | What the brand stands for, its reason for existing    |
| **Differentiators**     | What sets it apart from competitors                   |
| **Constraints**         | Budget, timeline, existing assets, legal restrictions |
| **Desired perception**  | How the brand wants to be seen                        |
| **Perception to avoid** | What the brand must never be associated with          |

The system interprets the raw briefing into a structured, machine-readable format before proceeding.

### 2.2 Strategic Foundation

Based on the interpreted briefing, the system generates:

- **Brand positioning** — the strategic space the brand occupies.
- **Value proposition** — the promise to the audience.
- **Brand pillars** — 3–5 foundational attributes.
- **Archetype blend** — Jungian archetype mix that defines personality.
- **Tone of voice** — traits, dos, and don'ts for verbal communication.
- **Semantic universe** — the conceptual territory of words and associations.

The user reviews and can iterate on the strategy before moving to creative exploration.

### 2.3 Market & Competitor Research

The system automatically researches:

- **Competitors** — direct and indirect players in the category.
- **Saturated visual codes** — colors, shapes, styles already overused.
- **Category trends** — what is emerging, what is declining.
- **Out-of-category references** — fresh inspiration from adjacent or distant fields.
- **Premium benchmarks** — best-in-class brands to aspire to.

The purpose is to discover what is cliché, what is saturated, and what would be distinctive.

### 2.4 Creative Territories

The system proposes **3 to 5 creative routes**, each containing:

| Element                      | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| **Strategic thesis**         | The conceptual foundation for this route        |
| **Visual metaphors**         | The imagery and symbolism driving the direction |
| **Suggested geometries**     | Shapes and construction logic                   |
| **Mood / atmosphere**        | The emotional quality of the territory          |
| **Cliché risks**             | Known pitfalls for this direction               |
| **Probable palette**         | Color direction with rationale                  |
| **Compatible type families** | Typography that fits the territory              |
| **Composition examples**     | Layout and spatial logic                        |

The user selects one route (or a hybrid) to advance into production.

### 2.5 Visual System Design

For the selected route, the system produces a complete visual system:

- **Color system** — primary, secondary, tonal scales, semantic colors, competitive positioning, accessibility compliance, dark/light variants, UI vs. branding versions, gradient and surface logic.
- **Typography system** — display and body typefaces with justification (personality, contrast, humanist vs. geometric curve, width, x-height, mobile legibility, pairing rationale).
- **Layout principles** — grid, spacing, compositional rules.
- **Iconography** — style, weight, construction logic.
- **Photography / Illustration direction** — mood, framing, treatment.
- **Motion principles** — animation language and behavior.

### 2.6 Logo / Symbol Design

The logo design follows a structured pipeline:

1. **Concept definition** — the LLM articulates the symbol's meaning and strategy.
2. **Vector instructions** — the LLM generates construction directives.
3. **Base shape assembly** — an SVG engine builds geometric foundations.
4. **Proportion refinement** — heuristics adjust grid, clear space, contrast.
5. **AI visual exploration** (optional) — image generation for ideation, not final output.
6. **Selection and finalization** — the best direction is chosen and polished.

Logo deliverables include:

- Horizontal, vertical, and symbol-only versions.
- Monochrome and negative versions.
- Favicon and app icon versions.
- Construction grid and clear space rules.
- Misuse examples (what not to do).

### 2.7 Brand Critique

Before finalization, a dedicated critic evaluates the entire proposal:

- Distinctiveness score
- Cliché detection
- Typographic coherence check
- Palette originality assessment
- Metaphor depth analysis
- Strategic alignment verification
- Scalability and applicability review

The critique generates a scored report. If thresholds are not met, the system iterates.

### 2.8 Brand Book Assembly

The final deliverable is a multi-volume brand book:

| Volume                       | Contents                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| **Vol. 1 — Strategy**        | Interpreted brief, competitive context, positioning, pillars, perceptive persona, narrative        |
| **Vol. 2 — Verbal Identity** | Manifesto, slogan directions, tone of voice, copy examples, language guidelines                    |
| **Vol. 3 — Visual Identity** | Visual concept, colors, typography, grid, iconography, photography/illustration, motion principles |
| **Vol. 4 — Logo System**     | Construction, clear space, minimum size, versions, misuse rules, applications                      |
| **Vol. 5 — Assets**          | SVG, PNG, PDF, Figma file, design tokens for web/app                                               |

### 2.9 Export & Delivery

Final outputs are exported in professional formats:

- **PDF** — print-ready brand book.
- **Figma** — editable design system with components, styles, and frames.
- **SVG** — parametric, scalable vector assets.
- **PNG** — raster exports at multiple resolutions.
- **Design tokens** — JSON/CSS tokens for web and app integration.

## 3. Feature Summary

### 3.1 MVP (Minimum Viable Product)

| Feature                        | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| Briefing wizard                | Guided intake to structured brief                |
| 3 strategic routes             | AI-generated creative territories with rationale |
| Justified palette & typography | Color and type choices with strategic reasoning  |
| Logo concept board             | Symbol concepts with construction notes          |
| Automated brand book           | 1 complete brand book in PDF                     |
| Base export                    | PDF + SVG assets                                 |

### 3.2 Elite Product

| Feature                       | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| Automatic category research   | Web search and competitor analysis              |
| Visual competition analysis   | Image-based competitor logo/brand study         |
| Creative territory generation | Full divergent exploration with 3–5 routes      |
| Multi-agent refinement        | Iterative improvement across specialized agents |
| Distinctiveness scoring       | Quantified originality metrics                  |
| Parametric SVG                | Programmatic, adjustable vector logos           |
| Figma file generation         | Auto-generated design system in Figma           |
| Brand tokens                  | Web/app design tokens (JSON, CSS)               |
| Landing page & social kit     | Auto-generated marketing assets                 |

## 4. User Roles & Interactions

| Role                      | Interaction                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| **Brand owner / Founder** | Fills briefing, reviews strategy, selects route, approves deliverables    |
| **Designer (optional)**   | Reviews and refines AI proposals, especially logo and visual system       |
| **System (AI pipeline)**  | Orchestrates the full process, generates structured outputs at each stage |

## 5. Key Workflow Rules

1. **Modular progression** — The system works in discrete modules (strategy → territory → identity → symbol → book), never as a single monolithic generation.
2. **Mandatory justification** — Every design decision includes a "why" and a "where it fails" assessment.
3. **Critique before delivery** — No brand book is assembled until the critic agent has evaluated and scored the proposal.
4. **Structured data throughout** — All intermediate outputs are JSON-structured via Structured Outputs, enabling downstream pipelines and auditability.
5. **Human-in-the-loop at key gates** — The user reviews and approves at briefing, strategy, route selection, and final delivery checkpoints.
