/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/learning-ingestion-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const LearningIngestionAgentOutputSchema = z.object({
  "ingestion_result": z.object({
  "success": z.boolean(),
  "learning_id": z.string(),
  "normalized_record": z.object({
  "learning_id": z.string().nullish(),
  "venture_id": z.string().nullish(),
  "venture_name": z.string().nullish(),
  "source_module": z.string().nullish(),
  "learning_type": z.string().nullish(),
  "outcome": z.string().nullish(),
  "narrative": z.string().nullish(),
  "confidence": z.number().nullish(),
  "quality_score": z.number().min(0).max(100).nullish(),
  "tags": z.array(z.string()).nullish(),
  "sector": z.string().nullish(),
  "stage": z.string().nullish(),
  "stored_timestamp": z.string().nullish(),
  "observed_timestamp": z.string().nullish()
}).nullish(),
  "quality_score": z.number().min(0).max(100).nullish(),
  "normalization_notes": z.string().nullish(),
  "duplicates_detected": z.array(z.object({
  "existing_learning_id": z.string().nullish(),
  "similarity_score": z.number().min(0).max(1).nullish(),
  "difference": z.string().nullish()
})).nullish(),
  "requires_manual_review": z.boolean().nullish(),
  "review_reason": z.string().nullish(),
  "vector_embedding_status": z.enum(["queued", "processing", "completed", "failed"]).nullish()
})
});
export type LearningIngestionAgentOutput = z.infer<typeof LearningIngestionAgentOutputSchema>;
