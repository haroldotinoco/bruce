/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/intelligence-synthesizer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const IntelligenceSynthesizerOutputSchema = z.object({
  "snapshot_id": z.string(),
  "period_start": z.string(),
  "period_end": z.string(),
  "key_patterns": z.array(z.object({
  "pattern_id": z.string(),
  "statement": z.string(),
  "confidence": z.number(),
  "evidence_count": z.number().int(),
  "action_implication": z.string().nullish()
})),
  "strategic_implications": z.array(z.string()),
  "emerging_signals": z.array(z.object({
  "signal": z.string().nullish(),
  "first_observed": z.string().nullish(),
  "confidence": z.number().nullish(),
  "watch_criteria": z.string().nullish()
})).nullish(),
  "contradicted_patterns": z.array(z.object({
  "pattern_id": z.string().nullish(),
  "pattern_statement": z.string().nullish(),
  "contradiction_evidence": z.string().nullish()
})).nullish(),
  "thesis_updates": z.array(z.string()).nullish(),
  "patterns_total_in_store": z.number().int().nullish(),
  "learnings_ingested_this_period": z.number().int().nullish(),
  "created_at": z.string().nullish()
});
export type IntelligenceSynthesizerOutput = z.infer<typeof IntelligenceSynthesizerOutputSchema>;
