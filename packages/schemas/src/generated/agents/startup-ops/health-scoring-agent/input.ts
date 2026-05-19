/* eslint-disable */
// auto-generated from modules/startup-ops/agents/health-scoring-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const HealthScoringAgentInputSchema = z.object({
  "metric_snapshot": z.object({
  "snapshot_id": z.string(),
  "venture_id": z.string(),
  "collected_at": z.string().nullish(),
  "metrics": z.object({})
}),
  "stage": z.enum(["seed", "early", "growth"]),
  "nps_data": z.object({
  "score": z.number().min(0).max(100).nullish(),
  "sample_size": z.number().int().min(1).nullish(),
  "collected_at": z.string().nullish()
}).nullable().nullish(),
  "previous_health_report_ref": z.string().nullable().nullish()
});
export type HealthScoringAgentInput = z.infer<typeof HealthScoringAgentInputSchema>;
