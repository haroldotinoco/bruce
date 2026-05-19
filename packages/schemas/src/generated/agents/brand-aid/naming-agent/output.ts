/* eslint-disable */
// auto-generated from modules/brand-aid/agents/naming-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const NamingAgentOutputSchema = z.object({
  "top_candidates": z.array(z.object({
  "rank": z.number().int().nullish(),
  "name": z.string(),
  "approach": z.string().nullish(),
  "rationale": z.string(),
  "overall_score": z.number().min(0).max(100),
  "scores_by_criteria": z.object({}).catchall(z.number().min(0).max(100)).nullish(),
  "domain_status": z.string().nullish(),
  "trademark_risk": z.string().nullish(),
  "pronunciation": z.string().nullish()
})),
  "all_candidates": z.array(z.object({
  "name": z.string().nullish(),
  "approach": z.string().nullish(),
  "rationale": z.string().nullish(),
  "domain_status": z.string().nullish()
})),
  "scoring_methodology": z.string(),
  "domain_availability_summary": z.string().nullish(),
  "trademark_flags": z.array(z.string()).nullish(),
  "recommendation": z.string().nullish()
});
export type NamingAgentOutput = z.infer<typeof NamingAgentOutputSchema>;
