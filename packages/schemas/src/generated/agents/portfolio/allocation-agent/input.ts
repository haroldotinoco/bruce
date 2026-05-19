/* eslint-disable */
// auto-generated from modules/portfolio/agents/allocation-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const AllocationAgentInputSchema = z.object({
  "ventures": z.array(z.object({
  "venture_id": z.string(),
  "name": z.string(),
  "sector": z.string().nullish(),
  "stage": z.enum(["pre-launch", "early", "growth", "mature"]).nullish(),
  "health_score": z.number().min(0).max(100),
  "traction_score": z.number().min(0).max(100).nullish(),
  "runway_months": z.number(),
  "monthly_revenue": z.number().nullish(),
  "monthly_burn_rate": z.number(),
  "current_allocation": z.object({
  "monthly_budget_usd": z.number().nullish(),
  "headcount": z.number().int().nullish(),
  "allocated_infrastructure_costs": z.number().nullish()
}).nullish(),
  "resource_requirements": z.object({
  "hiring_plan": z.object({
  "open_roles": z.number().int().nullish(),
  "critical_hires": z.number().int().nullish(),
  "cost_per_hire": z.number().nullish()
}).nullish(),
  "budget_increase_request": z.number().nullish(),
  "infrastructure_needs": z.string().nullish(),
  "shared_resource_candidates": z.array(z.string()).nullish()
}).nullish(),
  "status": z.enum(["active", "decision_pending", "paused"]).nullish()
})),
  "portfolio_state": z.object({
  "total_available_budget_monthly": z.number(),
  "current_allocation_summary": z.object({
  "total_monthly_allocation": z.number().nullish(),
  "total_headcount": z.number().int().nullish(),
  "allocation_by_stage": z.object({}).nullish()
}),
  "portfolio_constraints": z.object({
  "max_concentration_percent": z.number().nullish(),
  "min_avg_runway_months": z.number().nullish(),
  "max_portfolio_burn_monthly": z.number().nullish()
}).nullish(),
  "risk_assessment": z.object({
  "concentration_risk_score": z.number().nullish(),
  "codependency_risks": z.array(z.string()).nullish(),
  "ventures_at_risk": z.array(z.string()).nullish()
}).nullish()
}),
  "allocation_strategy": z.object({
  "strategy_type": z.enum(["growth_focused", "risk_mitigation", "balanced"]).nullish(),
  "priority_ventures": z.array(z.string()).nullish(),
  "ventures_to_wind_down": z.array(z.string()).nullish(),
  "resource_efficiency_target": z.number().nullish()
}).nullish()
});
export type AllocationAgentInput = z.infer<typeof AllocationAgentInputSchema>;
