/* eslint-disable */
// auto-generated from modules/portfolio/agents/risk-monitor/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const RiskMonitorInputSchema = z.object({
  "portfolio_composition": z.array(z.object({
  "venture_id": z.string(),
  "name": z.string(),
  "sector": z.string(),
  "monthly_revenue": z.number(),
  "monthly_burn_rate": z.number(),
  "runway_months": z.number(),
  "traction_score": z.number().nullish(),
  "shared_infrastructure": z.array(z.string()).nullish(),
  "shared_customers": z.array(z.string()).nullish(),
  "shared_team_members": z.array(z.string()).nullish(),
  "customer_concentration": z.object({
  "top_customer_percent": z.number().min(0).max(100).nullish(),
  "top_3_customer_percent": z.number().min(0).max(100).nullish()
}).nullish(),
  "market_factors": z.object({
  "geographic_concentration": z.array(z.string()).nullish(),
  "regulatory_risk": z.boolean().nullish(),
  "economic_sensitivity": z.enum(["low", "medium", "high"]).nullish()
}).nullish()
})),
  "timeframe": z.object({
  "analysis_date": z.string().nullish(),
  "projection_months": z.number().int().min(1).max(24).nullish()
}),
  "portfolio_constraints": z.object({
  "max_concentration_percent": z.number().nullish(),
  "min_portfolio_runway_months": z.number().nullish(),
  "max_burn_rate_monthly": z.number().nullish()
}).nullish(),
  "analysis_focus": z.array(z.string()).nullish()
});
export type RiskMonitorInput = z.infer<typeof RiskMonitorInputSchema>;
