/* eslint-disable */
// auto-generated from modules/brand-aid/agents/brand-book-composer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BrandBookComposerInputSchema = z.object({
  "brand_identity": z.object({
  "strategy": z.object({}).nullish(),
  "visual_system": z.object({}).nullish(),
  "logo_concepts": z.object({}).nullish(),
  "naming_candidates": z.object({}).nullish(),
  "moodboard": z.object({}).nullish(),
  "logo_studies": z.array(z.object({})).nullish(),
  "approved_logo": z.object({}).nullish(),
  "brand_imagery": z.array(z.object({})).nullish(),
  "asset_manifest": z.array(z.object({})).nullish()
}),
  "brand_critique": z.object({
  "overall": z.number().int().nullish(),
  "pass_fail": z.boolean().nullish()
}),
  "export_formats": z.enum(["pdf", "json", "css", "figma", "all"]),
  "brand_name": z.string().nullish(),
  "composition_options": z.object({
  "include_extended_guidelines": z.boolean().nullish(),
  "include_marketing_brief": z.boolean().nullish(),
  "audience": z.enum(["internal", "partners", "all"]).nullish()
}).nullish()
});
export type BrandBookComposerInput = z.infer<typeof BrandBookComposerInputSchema>;
