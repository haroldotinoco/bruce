/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/pattern-extractor/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PatternExtractorOutputSchema = z.object({
  "pattern_extraction_result": z.object({
  "extraction_timestamp": z.string().nullish(),
  "learnings_analyzed": z.number().int().nullish(),
  "extracted_patterns": z.array(z.object({
  "pattern_id": z.string().nullish(),
  "statement": z.string().nullish(),
  "pattern_type": z.enum(["success_factor", "blocker", "correlation", "timing", "market_insight"]).nullish(),
  "evidence_ventures": z.array(z.string()).nullish(),
  "evidence_count": z.number().int().nullish(),
  "confidence": z.number().min(0).max(1).nullish(),
  "effect_size": z.enum(["small", "medium", "large"]).nullish(),
  "applicability_scope": z.object({
  "sectors": z.array(z.string()).nullish(),
  "stages": z.array(z.string()).nullish(),
  "geographies": z.array(z.string()).nullish()
}).nullish(),
  "caveats": z.array(z.string()).nullish(),
  "supporting_evidence": z.string().nullish(),
  "counter_examples": z.array(z.string()).nullish()
})).nullish(),
  "pattern_retirement_candidates": z.array(z.object({
  "pattern_id": z.string().nullish(),
  "reason": z.string().nullish()
})).nullish(),
  "emerging_patterns": z.array(z.object({
  "pattern_statement": z.string().nullish(),
  "evidence_count": z.number().int().nullish(),
  "confidence": z.number().nullish(),
  "reason_not_published": z.string().nullish()
})).nullish()
})
});
export type PatternExtractorOutput = z.infer<typeof PatternExtractorOutputSchema>;
