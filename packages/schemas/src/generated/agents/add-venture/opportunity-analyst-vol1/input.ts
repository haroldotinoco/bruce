/* eslint-disable */
// auto-generated from modules/add-venture/agents/opportunity-analyst-vol1/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const OpportunityAnalystVol1InputSchema = z.object({
  "briefing": z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "problem_context": z.object({}),
  "market_context": z.object({}),
  "customer_context": z.object({}),
  "competitive_context": z.object({}).nullish(),
  "key_assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish()
}),
  "analysis_parameters": z.object({
  "depth_level": z.enum(["executive_summary", "standard", "deep_dive"]).nullish(),
  "market_validation_focus": z.array(z.string()).nullish()
}).nullish()
});
export type OpportunityAnalystVol1Input = z.infer<typeof OpportunityAnalystVol1InputSchema>;
