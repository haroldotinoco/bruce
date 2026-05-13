# Visual System Designer Constraints

## Guardrails

1. **Accessibility Compliance**: All color combinations must meet WCAG AA minimum (4.5:1 for text, 3:1 for UI).
2. **Color Blindness Safe**: Palette must be distinguishable for deuteranopia, protanopia, tritanopia.
3. **Token Discipline**: All colors, spacing, typography defined as reusable tokens, not ad-hoc values.
4. **Palette Restraint**: Maximum 8 primary colors + neutral range. No more than 3 font families.
5. **Consistency**: All tokens must align with creative direction and brand archetype.
6. **Implementation-Ready**: Output must be usable in code (CSS, Figma, JSON) without reinterpretation.
7. **Scale Testing**: System must work at 16px (smallest UI element) and 200px (large hero).

## Escalation Rules

- **Escalate if** creative direction provides contradictory visual guidance → request clarification
- **Escalate if** accessibility requirements conflict with design vision → ask for priority
- **Escalate if** implementation context is unclear (web? mobile? print?) → request specifics
- **Escalate if** constraints prevent accessible color combinations → flag and suggest alternatives

## Cost Limits

- Model: Claude Sonnet 4.6 (moderate cost)
- Per-execution budget: $0.40 USD
- If approaching limit: prioritize color palette and typography; defer detailed token expansion

## Quality Checks

- Verify all primary colors have contrast-verified text color options
- Verify no color palette conflicts with competitor colors (from market analysis)
- Verify typography scales across at least 4 sizes (12px, 16px, 24px, 48px)
- Verify design tokens are exported in at least JSON format
- Verify rationale for each color choice ties back to creative direction
