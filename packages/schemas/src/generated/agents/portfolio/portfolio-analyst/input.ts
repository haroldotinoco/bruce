/* eslint-disable */
// auto-generated from modules/portfolio/agents/portfolio-analyst/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PortfolioAnalystInputSchema = z.object({
  "review_cycle_id": z.string(),
  "review_timestamp": z.string().nullish(),
  "ventures": z.array(z.object({
  "venture_id": z.string(),
  "name": z.string(),
  "status": z.enum(["active", "paused", "in_review"]),
  "weeks_since_launch": z.number().int().min(0).nullish(),
  "health_report": z.object({
  "report_date": z.string(),
  "metrics": z.object({
  "traction": z.object({
  "mrr": z.number().nullish(),
  "arr": z.number().nullish(),
  "monthly_growth_rate": z.number().nullish(),
  "active_users": z.number().int().nullish(),
  "user_growth_rate": z.number().nullish(),
  "conversion_rate": z.number().nullish(),
  "nps": z.number().min(-100).max(100).nullish()
}).nullish(),
  "financial": z.object({
  "runway_months": z.number().nullish(),
  "monthly_burn_rate": z.number().nullish(),
  "cash_position": z.number().nullish(),
  "cac": z.number().nullish(),
  "ltv": z.number().nullish(),
  "cac_ltv_ratio": z.number().nullish()
}).nullish(),
  "team": z.object({
  "headcount": z.number().int().nullish(),
  "headcount_planned": z.number().int().nullish(),
  "key_hires_filled": z.number().int().nullish(),
  "key_hires_open": z.number().int().nullish(),
  "team_velocity": z.enum(["accelerating", "steady", "decelerating"]).nullish()
}).nullish(),
  "market": z.object({
  "total_addressable_market": z.number().nullish(),
  "market_share_percent": z.number().nullish(),
  "competitor_count": z.number().int().nullish(),
  "customer_feedback": z.string().nullish()
}).nullish()
})
}),
  "context": z.object({
  "sector": z.string().nullish(),
  "stage": z.enum(["pre-launch", "early", "growth", "mature"]).nullish(),
  "previous_health_score": z.number().nullish(),
  "flags": z.array(z.string()).nullish()
}).nullish()
})),
  "analysis_scope": z.object({
  "focus_areas": z.array(z.string()).nullish(),
  "exclude_ventures": z.array(z.string()).nullish(),
  "include_pattern_analysis": z.boolean().nullish()
}).nullish()
});
export type PortfolioAnalystInput = z.infer<typeof PortfolioAnalystInputSchema>;
