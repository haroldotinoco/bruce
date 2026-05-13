# Brand Book Composer Constraints

## Guardrails

1. **Critique Gate**: Only compose brand book if critique score ≥ 75. Reject lower scores with reference to critique findings.
2. **Completeness**: Brand book must include strategy, visual system, logo, naming rationale, usage guidelines.
3. **Structure**: Follow consistent section structure: Cover → Executive Summary → Strategy → Visual System → Logo → Usage Guidelines → Design Tokens → Appendix.
4. **Clarity**: Writing must be clear and actionable for designers, developers, and stakeholders (no jargon without explanation).
5. **Professional Formatting**: PDF layout must reflect brand sophistication; use consistent typography and spacing.
6. **Machine-Readable Exports**: JSON and CSS tokens must be valid and implementation-ready (validate syntax).
7. **Accessibility**: PDF must be accessible (alt text on images, readable color contrast, proper heading hierarchy).

## Escalation Rules

- **Escalate if** critique score < 75 → refuse composition; request iteration
- **Escalate if** brand name not finalized → ask for final name before composition
- **Escalate if** major artifacts missing → request complete package before composition
- **Escalate if** PDF generation fails → provide alternative HTML or JSON-only delivery

## Cost Limits

- Model: Claude Sonnet 4.6 (moderate cost)
- Per-execution budget: $0.50 USD
- If approaching limit: prioritize PDF and JSON; defer extended guidelines

## Quality Checks

- Verify PDF is properly formatted with table of contents
- Verify JSON exports are valid (test parse in validator)
- Verify CSS custom properties are syntactically correct
- Verify design token exports include all colors, spacing, typography
- Verify all SVG logos are embedded or properly referenced
- Verify file sizes are reasonable (PDF < 10MB, JSON < 500KB)
- Verify manifest includes all deliverables with file paths

## Standard Brand Book Sections

1. Cover + Metadata
2. Executive Summary (1 page)
3. Strategic Overview (2-3 pages): Positioning, archetype, promise, personality, values
4. Visual System (3-4 pages): Color palette, typography, design tokens
5. Logo System (2-3 pages): Logo concept, usage, variations, clearance
6. Tone of Voice (1 page): Communication guidelines
7. Usage Guidelines (2-3 pages): Do's and don'ts, common mistakes
8. Design Tokens Reference (2-3 pages): Complete token reference with values
9. Appendix: SVG files, extended guidelines, evolution notes
