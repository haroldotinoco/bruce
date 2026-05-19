/* eslint-disable */
// auto-generated from modules/startup-ops/agents/metrics-ingestion-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const MetricsIngestionAgentOutputSchema = z.object({
  "snapshot_id": z.string(),
  "venture_id": z.string(),
  "collected_at": z.string(),
  "time_range": z.object({
  "start": z.string(),
  "end": z.string()
}).nullish(),
  "completeness_percent": z.number().min(0).max(100),
  "sources_status": z.object({}).catchall(z.object({
  "status": z.enum(["success", "partial", "failed"]),
  "metric_count": z.number().int().min(0),
  "error": z.string().nullable().nullish(),
  "last_updated": z.string().nullish()
})),
  "metrics": z.object({
  "product": z.object({
  "dau": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "wau": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "mau": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "new_signups": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "activation_rate": z.object({
  "value": z.number().min(0).max(100).nullable().nullish(),
  "previous_value": z.number().min(0).max(100).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "d7_retention": z.object({
  "value": z.number().min(0).max(100).nullable().nullish(),
  "previous_value": z.number().min(0).max(100).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "d30_retention": z.object({
  "value": z.number().min(0).max(100).nullable().nullish(),
  "previous_value": z.number().min(0).max(100).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "onboarding_completion_rate": z.object({
  "value": z.number().min(0).max(100).nullable().nullish(),
  "previous_value": z.number().min(0).max(100).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish()
}).nullish(),
  "revenue": z.object({
  "mrr": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "arr": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "new_mrr": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "churned_mrr": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "mrr_growth_rate": z.object({
  "value": z.number().nullable().nullish(),
  "previous_value": z.number().nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "customer_count": z.object({
  "value": z.number().int().min(0).nullable().nullish(),
  "previous_value": z.number().int().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "new_customers": z.object({
  "value": z.number().int().min(0).nullable().nullish(),
  "previous_value": z.number().int().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "churned_customers": z.object({
  "value": z.number().int().min(0).nullable().nullish(),
  "previous_value": z.number().int().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish()
}).nullish(),
  "acquisition": z.object({
  "cac": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "cac_by_channel": z.object({}).catchall(z.number().min(0)).nullish(),
  "ltv": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "ltv_cac_ratio": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish()
}).nullish(),
  "financial": z.object({
  "burn_rate": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "runway_months": z.object({
  "value": z.number().min(0).nullable().nullish(),
  "previous_value": z.number().min(0).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish(),
  "gross_margin": z.object({
  "value": z.number().min(0).max(100).nullable().nullish(),
  "previous_value": z.number().min(0).max(100).nullable().nullish(),
  "deviation_percent": z.number().nullable().nullish(),
  "deviation_flag": z.boolean().nullish(),
  "source": z.string().nullish()
}).nullish()
}).nullish()
})
});
export type MetricsIngestionAgentOutput = z.infer<typeof MetricsIngestionAgentOutputSchema>;
