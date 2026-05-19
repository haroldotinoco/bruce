/* eslint-disable */
// auto-generated from modules/opportunity/agents/prioritization-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PrioritizationAgentOutputSchema = z.object({
  "prioritization_id": z.string().nullish(),
  "ranked_opportunities": z.array(z.unknown()).nullish(),
  "summary": z.object({}).passthrough().nullish()
}).passthrough();
export type PrioritizationAgentOutput = z.infer<typeof PrioritizationAgentOutputSchema>;
