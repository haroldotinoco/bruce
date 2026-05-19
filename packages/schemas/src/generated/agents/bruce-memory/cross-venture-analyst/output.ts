/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/cross-venture-analyst/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CrossVentureAnalystOutputSchema = z.object({
  "analysis_id": z.string(),
  "analysis_type": z.string(),
  "ventures_analyzed": z.number().int().nullish(),
  "time_range": z.object({}).nullish(),
  "findings": z.array(z.object({
  "finding": z.string(),
  "supporting_ventures": z.array(z.string()),
  "confidence": z.number().min(0).max(1),
  "statistical_note": z.string().nullish(),
  "actionable_implication": z.string().nullish()
})),
  "correlations": z.array(z.object({
  "variable_a": z.string().nullish(),
  "variable_b": z.string().nullish(),
  "direction": z.enum(["positive", "negative", "none"]).nullish(),
  "strength": z.enum(["weak", "moderate", "strong"]).nullish(),
  "caveat": z.string().nullish()
})).nullish(),
  "counter_intuitive_findings": z.array(z.object({
  "finding": z.string().nullish(),
  "why_surprising": z.string().nullish(),
  "confidence": z.number().nullish()
})).nullish(),
  "insufficient_data_note": z.string().nullish()
});
export type CrossVentureAnalystOutput = z.infer<typeof CrossVentureAnalystOutputSchema>;
