/* eslint-disable */
// auto-generated from modules/brand-aid/agents/logo-designer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const LogoDesignerInputSchema = z.object({
  "creative_direction": z.object({
  "brand_promise": z.string().nullish(),
  "key_visual_metaphors": z.array(z.string()).nullish(),
  "visual_language_criteria": z.array(z.string()).nullish(),
  "mood_board_description": z.string().nullish()
}),
  "brand_name": z.string(),
  "brand_archetype": z.string().nullish(),
  "visual_system": z.object({
  "primary_colors": z.array(z.unknown()).nullish(),
  "typography_system": z.object({}).nullish()
}),
  "logo_requirements": z.object({
  "include_wordmark": z.boolean().nullish(),
  "icon_only_needed": z.boolean().nullish(),
  "primary_use_case": z.enum(["web", "print", "merchandise", "multi-channel"]).nullish()
}).nullish(),
  "logo_studies": z.array(z.object({
  "id": z.string().nullish(),
  "label": z.string().nullish(),
  "url": z.string().nullish(),
  "storage_key": z.string().nullish(),
  "source_url": z.string().nullish(),
  "metadata": z.object({}).nullish()
})).nullish()
});
export type LogoDesignerInput = z.infer<typeof LogoDesignerInputSchema>;
