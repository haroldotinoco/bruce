/* eslint-disable */
// auto-generated from modules/gtm/agents/channel-strategist/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ChannelStrategistOutputSchema = z.object({
  "recommended_channels": z.array(z.object({
  "rank": z.number().int().min(1),
  "channel": z.string(),
  "rationale": z.string(),
  "audience_fit_score": z.number().int().min(0).max(100),
  "implementation_ease": z.number().int().min(0).max(100),
  "time_to_traction_days": z.number().int().min(1).max(180).nullish(),
  "estimated_budget_range_usd": z.object({
  "min": z.number(),
  "max": z.number()
}).nullish(),
  "required_team_size": z.number().min(0).max(10).nullish(),
  "risk_factors": z.array(z.string()).nullish(),
  "success_metrics": z.array(z.string()).nullish()
})),
  "channels_to_avoid": z.array(z.object({
  "channel": z.string(),
  "reason": z.string()
})).nullish(),
  "competitive_analysis": z.object({
  "competitor_channels": z.object({}).catchall(z.array(z.string())),
  "market_gaps": z.array(z.string()).nullish(),
  "trends_analysis": z.string().nullish()
}).nullish(),
  "resource_requirements": z.object({
  "total_monthly_budget_usd": z.number(),
  "budget_allocation": z.object({}).catchall(z.number()).nullish(),
  "team_headcount": z.number(),
  "team_composition": z.array(z.string()).nullish(),
  "required_tools": z.array(z.string()).nullish(),
  "timeline_to_first_result_days": z.number().int()
}),
  "next_steps": z.array(z.string()),
  "confidence_score": z.number().int().min(0).max(100).nullish()
});
export type ChannelStrategistOutput = z.infer<typeof ChannelStrategistOutputSchema>;
