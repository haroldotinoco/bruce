# Visual System Policy

## Color Requirements

### Accessibility Standards
- **WCAG AA Compliance**: All text/UI color combinations must have contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (UI components)
- **WCAG AAA Compliance**: Recommended for primary brand colors (7:1 contrast)
- **Colorblind Safe**: Palette must be distinguishable for:
  - Deuteranopia (red-green color blindness, ~6% of men)
  - Protanopia (red-green, ~0.6% of men)
  - Tritanopia (blue-yellow, rare)
- **No Color-Only Meaning**: Never use color alone to communicate information; always pair with text or pattern

### Color Model Requirements
- Primary delivery format: **HEX** (web standard)
- Secondary formats: **RGB** (implementation), **HSL** (design)
- **CMYK export**: Required for print applications
- Color values must be precise to 6-digit hex

### Palette Constraints
- **Primary colors**: Maximum 3-4 (one dominant, 1-2 supporting)
- **Secondary colors**: Maximum 2-3
- **Neutral range**: Minimum 5 grays (black to white with 3 midtones)
- **Functional colors**: Success (green), Error (red), Warning (yellow/orange), Info (blue)
- **Total palette**: 10-15 colors maximum (including neutrals)

## Typography Requirements

### Font Selection
1. **Headline font**: One serif or distinctive sans-serif (establishes character)
2. **Body font**: One clear, readable sans-serif (minimum 9pt @ 96dpi = 12px on screen)
3. **Monospace font** (optional): For code, technical content only
4. **No more than 3 font families total**

### Readability Standards
- **Body text minimum size**: 14px on web, 10pt in print
- **Line height**: Minimum 1.4 for body text (1.6 recommended)
- **Line length**: Optimal 45-75 characters; maximum 100 characters
- **Font weight range**: Use 2-3 weights max (e.g., Regular 400, Semi-Bold 600, Bold 700)

### Type Scale Requirements
Provide scales for:
- Headline sizes: h1 (large), h2 (medium), h3 (small)
- Body sizes: Regular, Small, Caption (minimum 3 scales)
- All sizes must be tested for readability at display sizes and small sizes

## SVG Logo Requirements

### Format Standards
- **Delivery format**: SVG (scalable vector)
- **Fallback**: PNG raster (512x512px minimum, for email/legacy)
- **File size**: SVG < 20KB per variation
- **SVG optimization**: Hand-optimized (no unnecessary paths, simplified curves)

### Scalability Requirements
Logo must be tested and verified at:
- **16px** (favicon, small UI icon) - still readable
- **64px** (app icon, navigation)
- **256px** (hero, social profile picture)
- **512px** (print, large format)

### Color Variations
Provide at least:
1. **Full color** (all colors from palette)
2. **Monochrome** (single color version for restricted backgrounds)
3. **White version** (for dark backgrounds)
4. **Black version** (for light backgrounds)

### Logo Clearance & Spacing
- Define minimum clear space around logo (typically 1/4 of logo height)
- Define minimum size below which logo should not be used
- Provide placement guidelines (center, corner, alignment)

## Design Token Standards

### Token Organization
Tokens must be organized hierarchically:
```
colors/
  primary/
  secondary/
  functional/ (success, error, warning, info)
  neutral/
typography/
  headline/
  body/
spacing/
sizing/
shadows/
border-radius/
```

### Token Naming Convention
- Use kebab-case: `color-primary`, `spacing-md`, `font-size-h1`
- Semantic names preferred: `color-success` not `color-green`
- Avoid ambiguity: `spacing-md` means medium, not "medium large"

### Export Formats
Minimum required exports:
1. **JSON**: Programmatic access, design tools
2. **CSS**: Custom properties (`:root { --color-primary: #... }`)
3. **Figma**: Variables library for design file integration
4. Optional: SCSS/LESS maps, JavaScript objects

### Token Validation
Before delivery:
- Validate JSON syntax
- Validate CSS custom property names and values
- Ensure all colors are WCAG AA compliant
- Ensure all spacing values are consistent with scale
- Ensure typography tokens reference available fonts

## Design System Completeness

Required deliverables:
- [ ] Color palette with all primary, secondary, functional, neutral colors
- [ ] Typography system with headline, body, monospace specifications
- [ ] Type scale (minimum 6 sizes)
- [ ] Complete design tokens (colors, spacing, sizing, typography, shadows, radius)
- [ ] Logo variations (horizontal, vertical, icon-only, all color variants)
- [ ] Accessibility verification (contrast ratios, colorblind safety)
- [ ] SVG optimization validation
- [ ] Token export in JSON, CSS, and design tool format
