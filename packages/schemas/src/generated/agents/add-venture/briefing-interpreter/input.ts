/* eslint-disable */
// auto-generated from modules/add-venture/agents/briefing-interpreter/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BriefingInterpreterInputSchema = z.object({
  "opportunity": z.object({
  "opportunity_id": z.string(),
  "title": z.string(),
  "problem_statement": z.string(),
  "target_segment": z.string(),
  "market_size_estimate": z.object({
  "tam": z.number().nullish(),
  "sam": z.number().nullish(),
  "som": z.number().nullish(),
  "confidence": z.number().nullish()
}).nullish(),
  "competition_landscape": z.object({}).nullish(),
  "problem_analysis": z.object({}).nullish(),
  "analysis_quality": z.object({
  "confidence_level": z.number().nullish(),
  "data_gaps": z.array(z.string()).nullish()
}).nullish()
}),
  "portfolio_context": z.object({
  "focus_areas": z.array(z.string()).nullish(),
  "strategic_priorities": z.array(z.string()).nullish(),
  "capital_allocation": z.object({}).nullish()
}).nullish()
});
export type BriefingInterpreterInput = z.infer<typeof BriefingInterpreterInputSchema>;
