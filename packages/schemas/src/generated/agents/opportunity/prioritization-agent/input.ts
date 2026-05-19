/* eslint-disable */
// auto-generated from modules/opportunity/agents/prioritization-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PrioritizationAgentInputSchema = z.object({
  "scored_opportunities": z.array(z.object({
  "opportunity_id": z.string().nullish(),
  "title": z.string().nullish(),
  "total_score": z.number().int().nullish(),
  "recommendation": z.string().nullish(),
  "discovery_date": z.string().nullish(),
  "tags": z.array(z.unknown()).nullish()
})),
  "prioritization_context": z.object({
  "portfolio_focus_areas": z.array(z.string()).nullish(),
  "max_ventures_per_cycle": z.number().int().nullish(),
  "diversity_constraint": z.boolean().nullish(),
  "minimum_advancement_score": z.number().int().nullish()
}).nullish()
});
export type PrioritizationAgentInput = z.infer<typeof PrioritizationAgentInputSchema>;
