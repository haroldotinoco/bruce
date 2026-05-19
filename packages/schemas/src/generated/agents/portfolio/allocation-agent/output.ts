/* eslint-disable */
// auto-generated from modules/portfolio/agents/allocation-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const AllocationAgentOutputSchema = z.object({
  "allocation_decision": z.object({
  "decision_timestamp": z.string(),
  "allocation_recommendations": z.array(z.object({
  "venture_id": z.string(),
  "name": z.string(),
  "current_monthly_budget": z.number().nullish(),
  "recommended_monthly_budget": z.number(),
  "budget_delta": z.number().nullish(),
  "budget_change_percent": z.number().nullish(),
  "budget_rationale": z.string(),
  "current_headcount": z.number().int().nullish(),
  "recommended_headcount": z.number().int().nullish(),
  "headcount_delta": z.number().int().nullish(),
  "headcount_rationale": z.string().nullish(),
  "hiring_priorities": z.array(z.string()).nullish(),
  "resource_sharing_targets": z.array(z.object({
  "venture_id": z.string().nullish(),
  "resource_type": z.enum(["infrastructure", "expertise", "tools"]).nullish(),
  "description": z.string().nullish(),
  "estimated_savings": z.number().nullish()
})).nullish(),
  "confidence_score": z.number().min(0).max(100).nullish(),
  "implementation_timeline": z.enum(["immediate", "this_month", "next_month", "next_quarter"]).nullish()
})),
  "resource_sharing_opportunities": z.array(z.object({
  "opportunity_id": z.string().nullish(),
  "ventures_involved": z.array(z.string()).nullish(),
  "resource_type": z.enum(["infrastructure", "expertise", "tools"]).nullish(),
  "description": z.string().nullish(),
  "estimated_monthly_savings": z.number().nullish(),
  "implementation_complexity": z.enum(["low", "medium", "high"]).nullish(),
  "implementation_cost": z.number().nullish(),
  "payback_period_months": z.number().nullish(),
  "dependency_risk": z.enum(["low", "medium", "high"]).nullish()
})).nullish(),
  "portfolio_impact_summary": z.object({
  "previous_total_allocation": z.number().nullish(),
  "new_total_allocation": z.number().nullish(),
  "allocation_delta": z.number().nullish(),
  "allocation_delta_percent": z.number().nullish(),
  "ventures_increasing_budget": z.number().int().nullish(),
  "ventures_decreasing_budget": z.number().int().nullish(),
  "ventures_frozen": z.number().int().nullish(),
  "projected_avg_runway_months": z.number().nullish(),
  "projected_concentration_percent": z.number().nullish(),
  "concentration_trend": z.enum(["improving", "stable", "worsening"]).nullish(),
  "expected_portfolio_impact": z.string().nullish(),
  "portfolio_constraints_met": z.object({
  "max_concentration_met": z.boolean().nullish(),
  "min_runway_met": z.boolean().nullish(),
  "max_burn_met": z.boolean().nullish()
}).nullish()
}),
  "implementation_notes": z.string().nullish(),
  "risks_and_mitigations": z.array(z.object({
  "risk": z.string().nullish(),
  "mitigation": z.string().nullish()
})).nullish()
})
});
export type AllocationAgentOutput = z.infer<typeof AllocationAgentOutputSchema>;
