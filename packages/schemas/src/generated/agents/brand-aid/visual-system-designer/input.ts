/* eslint-disable */
// auto-generated from modules/brand-aid/agents/visual-system-designer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const VisualSystemDesignerInputSchema = z.object({
  "creative_direction": z.object({
  "mood_board_description": z.string().nullish(),
  "visual_language_criteria": z.array(z.string()).nullish(),
  "design_token_guidance": z.object({}).nullish()
}),
  "brand_archetype": z.string(),
  "implementation_context": z.object({
  "primary_medium": z.enum(["web", "mobile", "print", "multi-channel"]).nullish(),
  "color_model_preference": z.enum(["RGB", "HSL", "HEX"]).nullish(),
  "design_tool": z.enum(["Figma", "Sketch", "XD", "agnostic"]).nullish()
}).nullish(),
  "accessibility_requirements": z.object({
  "wcag_level": z.enum(["A", "AA", "AAA"]).nullish(),
  "color_blindness_safe": z.boolean().nullish()
}).nullish(),
  "constraint_colors": z.array(z.string()).nullish()
});
export type VisualSystemDesignerInput = z.infer<typeof VisualSystemDesignerInputSchema>;
