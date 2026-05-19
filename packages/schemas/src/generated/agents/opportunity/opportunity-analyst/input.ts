/* eslint-disable */
// auto-generated from modules/opportunity/agents/opportunity-analyst/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const OpportunityAnalystInputSchema = z.object({
  "raw_opportunity": z.object({
  "opportunity_title": z.string(),
  "problem_statement": z.string(),
  "target_segment": z.string(),
  "pain_points": z.array(z.string()).nullish(),
  "sources": z.array(z.object({
  "url": z.string().nullish(),
  "source_title": z.string().nullish(),
  "source_type": z.string().nullish()
})).nullish(),
  "discovery_confidence": z.number().min(0).max(1).nullish()
}),
  "analysis_focus": z.object({
  "depth_level": z.enum(["quick_screen", "standard", "deep_dive"]).nullish(),
  "priority_areas": z.array(z.string()).nullish()
}).nullish(),
  "quality_retry": z.object({
  "attempt": z.number().int().min(1).nullish(),
  "previous_score": z.number().nullish(),
  "feedback_to_address": z.string().nullish(),
  "prior_scoring_summary": z.string().nullish()
}).nullish()
});
export type OpportunityAnalystInput = z.infer<typeof OpportunityAnalystInputSchema>;
