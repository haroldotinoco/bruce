/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/intelligence-synthesizer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const IntelligenceSynthesizerInputSchema = z.object({
  "period_start": z.string(),
  "period_end": z.string(),
  "patterns_since": z.string().nullish(),
  "min_confidence": z.number().min(0).max(1).nullish(),
  "max_patterns": z.number().int().min(1).max(20).nullish(),
  "portfolio_summary": z.object({
  "total_ventures": z.number().int().nullish(),
  "ventures_by_stage": z.object({}).nullish(),
  "ventures_by_segment": z.object({}).nullish(),
  "active_ventures": z.number().int().nullish(),
  "killed_ventures": z.number().int().nullish()
}).nullish()
});
export type IntelligenceSynthesizerInput = z.infer<typeof IntelligenceSynthesizerInputSchema>;
