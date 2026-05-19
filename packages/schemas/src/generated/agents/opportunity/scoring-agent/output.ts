/* eslint-disable */
// auto-generated from modules/opportunity/agents/scoring-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ScoringAgentOutputSchema = z.object({
  "opportunity_id": z.string().nullish(),
  "total_score": z.number().nullish(),
  "scored_opportunities": z.array(z.unknown()).nullish(),
  "dimensions": z.object({}).passthrough().nullish()
}).passthrough();
export type ScoringAgentOutput = z.infer<typeof ScoringAgentOutputSchema>;
