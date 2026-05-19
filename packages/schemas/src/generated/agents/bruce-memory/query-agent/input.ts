/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/query-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const QueryAgentInputSchema = z.object({
  "query_id": z.string(),
  "question": z.string().min(10),
  "context": z.object({
  "venture_id": z.string().nullish(),
  "current_stage": z.string().nullish(),
  "market_segment": z.string().nullish()
}).nullish(),
  "filters": z.object({
  "min_confidence": z.number().nullish(),
  "market_segments": z.array(z.string()).nullish(),
  "stages": z.array(z.string()).nullish(),
  "source_modules": z.array(z.string()).nullish()
}).nullish(),
  "requested_by_module": z.string(),
  "requested_at": z.string().nullish()
});
export type QueryAgentInput = z.infer<typeof QueryAgentInputSchema>;
