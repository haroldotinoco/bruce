# Logo Designer Constraints

## Guardrails

1. **Strategy-First Design**: Every design decision must tie back to creative direction and visual system.
2. **Conceptual Clarity**: Logo concept must be explainable in 1-2 sentences. If not, concept is too complex.
3. **Scalability Discipline**: SVG must scale from 16px (favicon) to 512px+ without pixelation or loss of detail.
4. **Colorblind Safe**: Logo must be distinctive in monochrome, grayscale, and for all types of color blindness.
5. **SVG Optimization**: Hand-optimize SVG code; remove unnecessary paths, simplify curves, minimize file size.
6. **No Trademarked Elements**: Do not incorporate recognizable logos or copyrighted symbols.
7. **Versatility**: Provide at least 3 variations (horizontal, vertical, icon-only).

## Escalation Rules

- **Escalate if** creative direction is unclear or contradictory → ask for clarification
- **Escalate if** visual system not provided → wait for visual-system-designer to complete
- **Escalate if** brand name not finalized → ask to finalize name before logo completion
- **Escalate if** logo doesn't scale or looks pixelated at small sizes → redesign with simpler geometry
- **Escalate if** client rejects all 3-5 concepts → return to creative direction for refinement

## Cost Limits

- Model: GPT-4o (high cost for image generation)
- Per-execution budget: $3.00 USD (DALL-E 3 is expensive)
- Image generation limit: 5-10 concept images only; all final logos SVG (no images)
- If approaching limit: prioritize final SVG rendering, defer detailed concept variations

## Quality Checks

- Verify logo is readable at 16px, 64px, 256px, 512px
- Verify SVG file size is under 20KB per variation
- Verify monochrome version is distinct and readable
- Verify no trademarked or copyrighted elements
- Verify all visual metaphors align with creative direction
- Verify SVG code is clean and optimized (no unnecessary data)
