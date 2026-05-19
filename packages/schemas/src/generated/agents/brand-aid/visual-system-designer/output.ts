/* eslint-disable */
// auto-generated from modules/brand-aid/agents/visual-system-designer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const VisualSystemDesignerOutputSchema = z.object({
  "color_palette": z.object({
  "primary_colors": z.array(z.object({
  "name": z.string().nullish(),
  "hex": z.string().nullish(),
  "rgb": z.string().nullish(),
  "usage": z.string().nullish()
})).nullish(),
  "secondary_colors": z.array(z.object({
  "name": z.string().nullish(),
  "hex": z.string().nullish(),
  "usage": z.string().nullish()
})).nullish(),
  "neutral_palette": z.array(z.object({
  "name": z.string().nullish(),
  "hex": z.string().nullish(),
  "lum_value": z.number().nullish()
})).nullish(),
  "palette_rationale": z.string().nullish()
}),
  "typography_system": z.object({
  "headline_font": z.object({
  "family": z.string().nullish(),
  "weight_range": z.string().nullish(),
  "use_cases": z.array(z.string()).nullish()
}).nullish(),
  "body_font": z.object({
  "family": z.string().nullish(),
  "weight_range": z.string().nullish(),
  "line_height": z.number().nullish()
}).nullish(),
  "type_scale": z.array(z.object({
  "name": z.string().nullish(),
  "size_px": z.number().int().nullish(),
  "weight": z.string().nullish()
})).nullish()
}),
  "design_tokens": z.object({
  "color_tokens": z.object({}).catchall(z.string()).nullish(),
  "spacing_tokens": z.object({}).catchall(z.string()).nullish(),
  "sizing_tokens": z.object({}).catchall(z.string()).nullish(),
  "typography_tokens": z.object({}).nullish(),
  "shadow_tokens": z.object({}).nullish(),
  "border_radius_tokens": z.object({}).nullish()
}),
  "accessibility_report": z.object({
  "wcag_level": z.string().nullish(),
  "contrast_ratios_verified": z.boolean().nullish(),
  "color_blindness_safe": z.boolean().nullish(),
  "detailed_checks": z.array(z.string()).nullish()
}),
  "token_export_formats": z.object({
  "json": z.string().nullish(),
  "css": z.string().nullish(),
  "design_file": z.string().nullish()
}).nullish()
});
export type VisualSystemDesignerOutput = z.infer<typeof VisualSystemDesignerOutputSchema>;
