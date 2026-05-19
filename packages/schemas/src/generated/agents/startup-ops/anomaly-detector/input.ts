/* eslint-disable */
// auto-generated from modules/startup-ops/agents/anomaly-detector/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const AnomalyDetectorInputSchema = z.object({
  "current_snapshot": z.object({
  "snapshot_id": z.string(),
  "venture_id": z.string().nullish(),
  "collected_at": z.string().nullish(),
  "metrics": z.object({})
}),
  "last_4_snapshots": z.array(z.object({
  "snapshot_id": z.string().nullish(),
  "collected_at": z.string().nullish(),
  "metrics": z.object({}).nullish()
})),
  "health_scores": z.object({
  "composite_score": z.number().min(0).max(100).nullish(),
  "dimension_scores": z.object({}).nullish()
}),
  "venture_context": z.object({
  "stage": z.enum(["seed", "early", "growth"]).nullish(),
  "known_events": z.array(z.string()).nullish()
}).nullish()
});
export type AnomalyDetectorInput = z.infer<typeof AnomalyDetectorInputSchema>;
