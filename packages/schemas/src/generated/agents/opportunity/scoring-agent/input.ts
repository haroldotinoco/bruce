/* eslint-disable */
// auto-generated from modules/opportunity/agents/scoring-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ScoringAgentInputSchema = z.object({
  "opportunity": z.object({
  "opportunity_id": z.string().nullish(),
  "title": z.string().nullish(),
  "market_size_estimate": z.object({
  "tam": z.number().nullish(),
  "sam": z.number().nullish(),
  "som": z.number().nullish(),
  "confidence": z.number().nullish()
}).nullish(),
  "problem_analysis": z.object({
  "pain_severity": z.string().nullish(),
  "market_readiness": z.string().nullish()
}).nullish(),
  "competition_landscape": z.object({
  "direct_competitors": z.array(z.unknown()).nullish(),
  "competitive_intensity": z.string().nullish()
}).nullish(),
  "analysis_quality": z.object({
  "confidence_level": z.number().nullish(),
  "data_gaps": z.array(z.unknown()).nullish()
}).nullish()
}),
  "scoring_context": z.object({
  "portfolio_focus_areas": z.array(z.string()).nullish(),
  "strategic_priorities": z.array(z.string()).nullish(),
  "apply_market_signals": z.boolean().nullish()
}).nullish()
});
export type ScoringAgentInput = z.infer<typeof ScoringAgentInputSchema>;
