/* eslint-disable */
// auto-generated from modules/gtm/agents/growth-experimenter/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GrowthExperimenterInputSchema = z.object({
  "venture_context": z.object({
  "name": z.string(),
  "stage": z.enum(["pre-launch", "early-traction", "growth", "scale"]),
  "target_audience": z.string(),
  "product_market_fit_signal": z.enum(["unclear", "weak", "moderate", "strong"]).nullish(),
  "competitive_context": z.string().nullish()
}),
  "current_traction": z.object({
  "monthly_active_users": z.number().int(),
  "monthly_recurring_revenue_usd": z.number().nullish(),
  "monthly_signup_rate": z.number().int().nullish(),
  "monthly_churn_rate_percent": z.number().nullish(),
  "nps_score": z.number().nullish(),
  "unit_economics": z.object({
  "cac_usd": z.number().nullish(),
  "ltv_usd": z.number().nullish(),
  "payback_period_months": z.number().nullish()
}).nullish()
}),
  "gtm_performance": z.object({
  "active_channels": z.array(z.object({
  "channel": z.string().nullish(),
  "monthly_spend": z.number().nullish(),
  "monthly_leads": z.number().int().nullish(),
  "conversion_rate": z.number().nullish(),
  "cac": z.number().nullish()
})),
  "monthly_marketing_budget": z.number().nullish(),
  "marketing_team_size": z.number().nullish(),
  "highest_performing_channel": z.string().nullish(),
  "most_expensive_channel": z.string().nullish()
}),
  "resources": z.object({
  "available_budget_for_experiments": z.number().nullish(),
  "team_capacity_fte": z.number().nullish(),
  "existing_capabilities": z.array(z.string()).nullish()
}).nullish(),
  "goals": z.object({
  "growth_target_percent": z.number().nullish(),
  "timeframe_months": z.number().int().nullish(),
  "priority": z.enum(["user-growth", "revenue-growth", "profitability", "market-share"]).nullish()
}).nullish(),
  "constraints": z.object({
  "cannot_change": z.array(z.string()).nullish(),
  "recent_experiments": z.array(z.string()).nullish()
}).nullish()
});
export type GrowthExperimenterInput = z.infer<typeof GrowthExperimenterInputSchema>;
