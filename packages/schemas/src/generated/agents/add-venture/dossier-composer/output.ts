/* eslint-disable */
// auto-generated from modules/add-venture/agents/dossier-composer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const DossierComposerOutputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "venture_name": z.string(),
  "created_date": z.string(),
  "created_by": z.string().nullish(),
  "volumes": z.object({
  "vol_1": z.object({}).nullish(),
  "vol_2": z.object({}).nullish(),
  "vol_3": z.object({}).nullish(),
  "vol_4": z.object({}).nullish(),
  "vol_5": z.object({}).nullish(),
  "vol_6": z.object({}).nullish(),
  "vol_7": z.object({}).nullish(),
  "vol_8": z.object({}).nullish()
}),
  "critique_result": z.object({}),
  "executive_summary": z.object({
  "narrative_summary": z.string().nullish(),
  "opportunity_snapshot": z.string().nullish(),
  "customer_snapshot": z.string().nullish(),
  "business_model_snapshot": z.string().nullish()
}),
  "key_metrics": z.object({
  "market_tam_usd": z.number().nullish(),
  "primary_segment_size": z.number().int().nullish(),
  "primary_segment_willingness_to_pay_median": z.number().nullish(),
  "year_1_revenue_target": z.number().nullish(),
  "year_1_customer_target": z.number().int().nullish(),
  "year_1_mrr_target": z.number().nullish(),
  "cac": z.number().nullish(),
  "ltv": z.number().nullish(),
  "payback_period_months": z.number().nullish(),
  "breakeven_month": z.number().int().nullish(),
  "year_1_headcount": z.number().int().nullish(),
  "funding_required_12_months": z.number().nullish(),
  "critique_overall_score": z.number().nullish()
}),
  "status": z.enum(["approved", "needs_iteration", "rejected"]),
  "artifact_refs": z.object({
  "pdf_url": z.string().nullish(),
  "json_url": z.string().nullish(),
  "archival_path": z.string().nullish()
}).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type DossierComposerOutput = z.infer<typeof DossierComposerOutputSchema>;
