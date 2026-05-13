# BrandAid Module

## Overview

BrandAid is a sequential multi-agent pipeline that transforms a venture hypothesis into a complete, coherent brand identity. It synthesizes strategy, market research, creative direction, naming, visual design, and logo generation into a deliverable brand book.

## Pipeline Architecture

```
Venture Hypothesis
    ↓
[brand-strategist] → Brand Strategy
    ↓
[market-analyst] → Competitor Analysis & White Space
    ↓
[creative-director] → Creative Direction Brief
    ↓
[naming-agent] → Shortlisted Brand Names
    ↓
[visual-system-designer] → Color Palette, Typography, Design Tokens
    ↓
[logo-designer] → SVG Logo Concepts
    ↓
[brand-critic] → Critique & Scoring (0-100)
    ├─ If score ≥ 75 → Continue
    └─ If score < 75 → [brand-iteration.workflow.json]
    ↓
[brand-book-composer] → Final Brand Book (PDF + JSON)
```

## Key Workflows

### brand-creation-pipeline.workflow.json
Full sequential pipeline from venture hypothesis to brand book. Includes automatic critique and conditional iteration.

### brand-iteration.workflow.json
Re-runs specific pipeline stages when critique score is below 75. Determines which stages need re-work based on critique feedback.

### brand-book-export.workflow.json
Exports finalized brand identity to multiple formats: PDF brand book, JSON data, SVG logos, design token files.

## Quality Gates

- **Minimum critique score**: 75/100
- **Iteration limit**: 3 cycles per pipeline run
- **All dimensions must score** ≥ 70: strategic alignment, distinctiveness, visual coherence, naming quality

## Success Criteria

- Brand identity is strategically aligned with venture hypothesis
- Brand name is memorable, available, and domain-checkable
- Visual system is cohesive and accessible (WCAG AA contrast ratios minimum)
- Logo is distinctive and works across scales and colorspaces
- All artifacts are documented in brand book
