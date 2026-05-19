/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/query-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const QueryAgentOutputSchema = z.object({
  "query_id": z.string(),
  "question": z.string(),
  "relevant_patterns": z.array(z.object({
  "pattern_id": z.string().nullish(),
  "statement": z.string().nullish(),
  "confidence": z.number().nullish(),
  "evidence_count": z.number().int().nullish(),
  "relevance_score": z.number().min(0).max(1).nullish(),
  "action_implication": z.string().nullish()
})).nullish(),
  "synthesis": z.string().nullish(),
  "confidence_overall": z.number().min(0).max(1).nullish(),
  "no_results": z.boolean().nullish(),
  "suggested_related_queries": z.array(z.string()).nullish(),
  "served_at": z.string().nullish(),
  "latency_ms": z.number().int().nullish()
});
export type QueryAgentOutput = z.infer<typeof QueryAgentOutputSchema>;
