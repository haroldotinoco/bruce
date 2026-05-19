/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/cross-venture-analyst/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CrossVentureAnalystInputSchema = z.object({
  "ventures_data": z.array(z.object({
  "venture_id": z.string(),
  "venture_name": z.string().nullish(),
  "stage": z.enum(["structured", "built", "launched", "operating", "iterating", "scaling", "paused", "killed"]),
  "market_segment": z.string().nullish(),
  "business_model": z.string().nullish(),
  "outcome": z.enum(["success", "failure", "ongoing"]),
  "weeks_live": z.number().int().nullish(),
  "key_metrics": z.object({}),
  "learning_records": z.array(z.object({}))
})),
  "analysis_type": z.enum(["success_factors", "failure_patterns", "timing_analysis", "segment_comparison", "gtm_effectiveness", "unit_economics_comparison"]),
  "time_range": z.object({
  "start": z.string().nullish(),
  "end": z.string().nullish()
}).nullish(),
  "min_ventures_in_pattern": z.number().int().min(2).nullish(),
  "focus_segments": z.array(z.string()).nullish()
});
export type CrossVentureAnalystInput = z.infer<typeof CrossVentureAnalystInputSchema>;
