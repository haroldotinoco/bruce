/* eslint-disable */
// auto-generated from modules/brand-aid/agents/brand-critic/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BrandCriticOutputSchema = z.object({
  "scores": z.object({
  "strategic_alignment": z.number().int().min(0).max(100).nullish(),
  "distinctiveness": z.number().int().min(0).max(100).nullish(),
  "visual_coherence": z.number().int().min(0).max(100).nullish(),
  "naming_quality": z.number().int().min(0).max(100).nullish(),
  "moodboard_fit": z.number().int().min(0).max(100).nullish(),
  "logo_study_quality": z.number().int().min(0).max(100).nullish(),
  "overall": z.number().int().min(0).max(100).nullish()
}),
  "dimension_analysis": z.object({
  "strategic_alignment": z.object({
  "score": z.number().int().nullish(),
  "rationale": z.string().nullish(),
  "evidence": z.array(z.string()).nullish()
}).nullish(),
  "distinctiveness": z.object({
  "score": z.number().int().nullish(),
  "rationale": z.string().nullish(),
  "vs_competitors": z.string().nullish()
}).nullish(),
  "visual_coherence": z.object({
  "score": z.number().int().nullish(),
  "rationale": z.string().nullish(),
  "consistency_checks": z.array(z.string()).nullish()
}).nullish(),
  "naming_quality": z.object({
  "score": z.number().int().nullish(),
  "rationale": z.string().nullish(),
  "name_alignment": z.string().nullish()
}).nullish()
}),
  "strengths": z.array(z.string()).nullish(),
  "improvement_areas": z.array(z.string()).nullish(),
  "iteration_recommendations": z.string().nullish(),
  "pass_fail": z.boolean(),
  "confidence": z.number().min(0).max(1).nullish()
});
export type BrandCriticOutput = z.infer<typeof BrandCriticOutputSchema>;
