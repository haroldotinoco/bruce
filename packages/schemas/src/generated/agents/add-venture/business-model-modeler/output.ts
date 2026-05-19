/* eslint-disable */
// auto-generated from modules/add-venture/agents/business-model-modeler/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BusinessModelModelerOutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(4),
  "volume_title": z.string(),
  "revenue_model": z.object({
  "model_type": z.string().nullish(),
  "revenue_streams": z.array(z.string()).nullish(),
  "pricing_strategy": z.string().nullish(),
  "customer_segments": z.array(z.object({
  "segment": z.string().nullish(),
  "annual_arpu": z.number().nullish()
})).nullish()
}),
  "unit_economics": z.object({
  "cac_by_segment": z.object({}).catchall(z.number()).nullish(),
  "ltv_by_segment": z.object({}).catchall(z.number()).nullish(),
  "cac_payback_months_by_segment": z.object({}).catchall(z.number()).nullish(),
  "gross_margin_percent": z.number().nullish(),
  "ltv_cac_ratio": z.number().nullish(),
  "industry_benchmark_ltv_cac": z.number().nullish()
}),
  "business_model_scenarios": z.array(z.object({
  "scenario_name": z.enum(["conservative", "base", "aggressive"]).nullish(),
  "year_1_target_mrr": z.number().nullish(),
  "year_1_customer_count": z.number().int().nullish(),
  "year_1_revenue": z.number().nullish(),
  "avg_cac": z.number().nullish(),
  "avg_ltv": z.number().nullish(),
  "avg_payback_months": z.number().nullish(),
  "gross_margin_percent": z.number().nullish(),
  "monthly_burn": z.number().nullish(),
  "break_even_month": z.number().int().nullish(),
  "year_3_mrr_target": z.number().nullish(),
  "year_3_customer_count": z.number().int().nullish(),
  "required_runway_months": z.number().nullish()
})),
  "break_even_analysis": z.object({
  "fixed_costs_monthly": z.number().nullish(),
  "variable_cost_per_customer": z.number().nullish(),
  "conservative_breakeven_month": z.number().int().nullish(),
  "base_breakeven_month": z.number().int().nullish(),
  "aggressive_breakeven_month": z.number().int().nullish()
}),
  "recommended_scenario": z.object({
  "scenario": z.string().nullish(),
  "rationale": z.string().nullish(),
  "critical_success_factors": z.array(z.string()).nullish(),
  "key_metrics_to_monitor": z.array(z.string()).nullish(),
  "total_capital_required_12_months": z.number().nullish()
}),
  "assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "key_sections": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type BusinessModelModelerOutput = z.infer<typeof BusinessModelModelerOutputSchema>;
