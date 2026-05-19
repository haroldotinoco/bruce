/* eslint-disable */
// auto-generated from modules/bruce-core/agents/gate-enforcer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GateEnforcerInputSchema = z.object({
  "venture_id": z.string(),
  "gate_name": z.enum(["post-screening", "post-structuring", "post-build", "post-launch", "post-traction"]),
  "current_stage": z.string().nullish(),
  "evaluation_trigger": z.enum(["module_completed", "manual_request", "sla_triggered"]).nullish(),
  "venture_data": z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "founder_info": z.object({}).nullish(),
  "problem_statement": z.string().nullish(),
  "target_market": z.object({}).nullish(),
  "created_at": z.string().nullish()
}).nullish(),
  "module_outputs": z.object({
  "opportunity_screening": z.object({
  "founder_assessment": z.string().nullish(),
  "problem_validation": z.object({}).nullish(),
  "market_analysis": z.object({}).nullish(),
  "feasibility_assessment": z.string().nullish()
}).nullish(),
  "brand": z.object({
  "positioning": z.string().nullish(),
  "messaging_framework": z.object({}).nullish(),
  "competitive_positioning": z.string().nullish()
}).nullish(),
  "builder": z.object({
  "mvp_plan": z.object({}).nullish(),
  "technical_architecture": z.string().nullish(),
  "resource_requirements": z.object({}).nullish()
}).nullish(),
  "market": z.object({
  "gotomarket_strategy": z.object({}).nullish(),
  "pricing_model": z.object({}).nullish(),
  "customer_acquisition_plan": z.object({}).nullish()
}).nullish(),
  "operator": z.object({
  "operational_plan": z.string().nullish(),
  "kpi_framework": z.object({}).nullish(),
  "resource_plan": z.object({}).nullish(),
  "cohort_setup": z.object({}).nullish()
}).nullish()
}).nullish(),
  "metric_data": z.object({
  "cohort_age_days": z.number().nullish(),
  "month_1_retention": z.number().nullish(),
  "month_2_retention": z.number().nullish(),
  "week_over_week_growth_pct": z.number().nullish(),
  "actual_cac": z.number().nullish(),
  "projected_cac": z.number().nullish(),
  "gross_margin_pct": z.number().nullish(),
  "nps": z.number().nullish(),
  "weekly_active_users": z.number().nullish(),
  "customer_satisfaction": z.string().nullish()
}).nullish(),
  "previous_evaluations": z.array(z.object({
  "gate_name": z.string().nullish(),
  "status": z.string().nullish(),
  "score": z.number().nullish(),
  "evaluated_at": z.string().nullish()
})).nullish(),
  "correlation_id": z.string().nullish()
});
export type GateEnforcerInput = z.infer<typeof GateEnforcerInputSchema>;
