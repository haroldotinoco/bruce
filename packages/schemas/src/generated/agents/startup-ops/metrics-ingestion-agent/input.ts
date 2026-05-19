/* eslint-disable */
// auto-generated from modules/startup-ops/agents/metrics-ingestion-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const MetricsIngestionAgentInputSchema = z.object({
  "venture_id": z.string().min(1).max(255),
  "ingestion_config": z.object({
  "sources": z.array(z.enum(["mixpanel", "stripe", "amplitude", "gtm"])),
  "time_range": z.enum(["6h", "24h", "7d", "30d"]),
  "include_historical_comparison": z.boolean().nullish(),
  "force_refresh": z.boolean().nullish()
}),
  "last_snapshot_ref": z.string().nullable().nullish(),
  "stage": z.enum(["seed", "early", "growth"]).nullish()
});
export type MetricsIngestionAgentInput = z.infer<typeof MetricsIngestionAgentInputSchema>;
