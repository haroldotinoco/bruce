/* eslint-disable */
// auto-generated from modules/brand-aid/agents/brand-critic/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BrandCriticInputSchema = z.object({
  "brand_strategy": z.object({}),
  "visual_system": z.object({}),
  "logo_concepts": z.object({}),
  "naming_candidates": z.object({}),
  "market_analysis": z.object({}).nullish(),
  "moodboard": z.object({}).nullish(),
  "logo_studies": z.array(z.object({})).nullish(),
  "evaluation_criteria": z.object({
  "strategic_alignment_weight": z.number().nullish(),
  "distinctiveness_weight": z.number().nullish(),
  "visual_coherence_weight": z.number().nullish(),
  "naming_quality_weight": z.number().nullish()
}).nullish()
});
export type BrandCriticInput = z.infer<typeof BrandCriticInputSchema>;
