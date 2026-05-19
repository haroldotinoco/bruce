/* eslint-disable */
// auto-generated from modules/opportunity/agents/opportunity-analyst/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const OpportunityAnalystOutputSchema = z.object({
  "opportunity_id": z.string(),
  "title": z.string(),
  "problem_statement": z.string().nullish(),
  "market_size_estimate": z.object({
  "tam": z.number().min(0),
  "sam": z.number().min(0),
  "som": z.number().min(0),
  "currency": z.string(),
  "confidence": z.number().min(0).max(1).nullish(),
  "tam_methodology": z.string().nullish(),
  "sam_methodology": z.string().nullish(),
  "som_methodology": z.string().nullish()
}).passthrough(),
  "deep_analysis": z.object({}).passthrough().nullish()
}).passthrough();
export type OpportunityAnalystOutput = z.infer<typeof OpportunityAnalystOutputSchema>;
