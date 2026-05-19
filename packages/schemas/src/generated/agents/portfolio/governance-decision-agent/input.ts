/* eslint-disable */
// auto-generated from modules/portfolio/agents/governance-decision-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GovernanceDecisionAgentInputSchema = z.object({
  "ventures": z.array(z.object({
  "venture_id": z.string(),
  "name": z.string(),
  "weeks_since_launch": z.number().int().nullish(),
  "health_score": z.number().min(0).max(100),
  "health_trend": z.enum(["improving", "stable", "declining"]).nullish(),
  "traction_score": z.number().min(0).max(100),
  "monthly_growth_rate": z.number().nullish(),
  "monthly_revenue": z.number().nullish(),
  "monthly_burn_rate": z.number().nullish(),
  "runway_months": z.number().nullish(),
  "cac": z.number().nullish(),
  "ltv": z.number().nullish(),
  "cac_ltv_ratio": z.number().nullish(),
  "conversion_rate": z.number().nullish(),
  "nps": z.number().nullish(),
  "team_health": z.enum(["strong", "adequate", "declining", "at_risk"]).nullish(),
  "key_risk_factors": z.array(z.string()).nullish(),
  "previous_decision": z.enum(["scale", "iterate", "pause", "kill"]).nullish(),
  "previous_decision_date": z.string().nullish(),
  "decision_context": z.object({
  "is_outlier": z.boolean().nullish(),
  "outlier_reason": z.string().nullish(),
  "portfolio_importance": z.enum(["strategic", "high", "medium", "low"]).nullish()
}).nullish()
})),
  "decision_policy": z.object({
  "scale_criteria": z.object({
  "min_health_score": z.number().nullish(),
  "min_traction_score": z.number().nullish(),
  "min_monthly_growth_rate": z.number().nullish(),
  "max_cac_ltv_ratio": z.number().nullish(),
  "min_runway_months": z.number().nullish()
}).nullish(),
  "kill_criteria": z.array(z.object({
  "criterion": z.string().nullish(),
  "threshold": z.string().nullish()
})).nullish(),
  "human_review_required_for": z.array(z.string()).nullish()
}),
  "analyst_insights": z.object({
  "patterns": z.array(z.string()).nullish(),
  "outliers": z.array(z.string()).nullish()
}).nullish(),
  "risk_assessment": z.object({
  "portfolio_risk_score": z.number().nullish(),
  "venture_specific_risks": z.object({}).nullish()
}).nullish(),
  "allocation_recommendations": z.array(z.object({
  "venture_id": z.string().nullish(),
  "recommended_budget_delta": z.number().nullish()
})).nullish()
});
export type GovernanceDecisionAgentInput = z.infer<typeof GovernanceDecisionAgentInputSchema>;
