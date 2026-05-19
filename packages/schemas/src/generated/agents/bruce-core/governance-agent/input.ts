/* eslint-disable */
// auto-generated from modules/bruce-core/agents/governance-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GovernanceAgentInputSchema = z.object({
  "venture_id": z.string(),
  "decision_request_type": z.enum(["periodic_review", "gate_failure_response", "manual_request"]).nullish(),
  "portfolio_health_report": z.object({
  "venture_id": z.string().nullish(),
  "current_stage": z.string().nullish(),
  "health_score": z.number().min(0).max(1).nullish(),
  "growth_metrics": z.object({
  "wow_growth_pct": z.number().nullish(),
  "mom_growth_pct": z.number().nullish()
}).nullish(),
  "unit_economics": z.object({
  "cac": z.number().nullish(),
  "ltv": z.number().nullish(),
  "cac_ltv_ratio": z.number().nullish(),
  "gross_margin_pct": z.number().nullish(),
  "cac_payback_months": z.number().nullish()
}).nullish(),
  "product_market_fit": z.object({
  "month_1_retention": z.number().min(0).max(1).nullish(),
  "month_2_retention": z.number().min(0).max(1).nullish(),
  "nps": z.number().min(-100).max(100).nullish()
}).nullish(),
  "operational_health": z.object({
  "burn_rate_monthly": z.number().nullish(),
  "runway_months": z.number().nullish(),
  "team_size": z.number().nullish(),
  "key_open_roles": z.array(z.string()).nullish()
}).nullish(),
  "identified_risks": z.array(z.object({
  "risk": z.string().nullish(),
  "severity": z.enum(["critical", "high", "medium", "low"]).nullish(),
  "identified_at": z.string().nullish()
})).nullish()
}),
  "venture_context": z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "founder_info": z.object({}).nullish(),
  "stage": z.string().nullish(),
  "launched_date": z.string().nullish()
}).nullish(),
  "portfolio_context": z.object({
  "total_active_ventures": z.number().nullish(),
  "ventures_by_stage": z.object({}).nullish(),
  "total_monthly_burn": z.number().nullish(),
  "total_runway_months": z.number().nullish(),
  "resource_constraints": z.array(z.string()).nullish()
}).nullish(),
  "prior_decisions": z.array(z.object({
  "decision": z.string().nullish(),
  "decided_at": z.string().nullish(),
  "confidence_score": z.number().nullish()
})).nullish(),
  "correlation_id": z.string().nullish()
});
export type GovernanceAgentInput = z.infer<typeof GovernanceAgentInputSchema>;
