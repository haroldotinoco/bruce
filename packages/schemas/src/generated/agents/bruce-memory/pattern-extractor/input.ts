/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/pattern-extractor/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PatternExtractorInputSchema = z.object({
  "extraction_parameters": z.object({
  "analysis_period": z.enum(["weekly", "monthly"]).nullish(),
  "lookback_weeks": z.number().int().nullish(),
  "min_pattern_evidence": z.number().int().nullish(),
  "min_confidence": z.number().nullish(),
  "focus_sectors": z.array(z.string()).nullish(),
  "focus_learning_types": z.array(z.string()).nullish()
})
});
export type PatternExtractorInput = z.infer<typeof PatternExtractorInputSchema>;
