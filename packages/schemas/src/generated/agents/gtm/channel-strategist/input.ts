/* eslint-disable */
// auto-generated from modules/gtm/agents/channel-strategist/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ChannelStrategistInputSchema = z.object({
  "product": z.object({
  "name": z.string(),
  "category": z.enum(["b2b-saas", "b2c-consumer", "marketplace", "developer-tool", "ai-agent", "fintech", "healthtech", "edtech", "other"]),
  "value_proposition": z.string(),
  "competitive_positioning": z.string().nullish(),
  "price_point_usd": z.number().nullish()
}),
  "target_audience": z.object({
  "primary_persona": z.string(),
  "secondary_personas": z.array(z.string()).nullish(),
  "geography": z.array(z.string()).nullish(),
  "company_size": z.object({
  "min_headcount": z.number().int().nullish(),
  "max_headcount": z.number().int().nullish()
}).nullish(),
  "media_consumption": z.array(z.string()).nullish(),
  "psychographics": z.string().nullish()
}),
  "resources": z.object({
  "monthly_budget_usd": z.number(),
  "team_size": z.number().int(),
  "existing_capabilities": z.array(z.string()).nullish(),
  "founder_network": z.enum(["weak", "moderate", "strong"]).nullish()
}),
  "market_context": z.object({
  "competitors": z.array(z.object({
  "name": z.string().nullish(),
  "estimated_active_channels": z.array(z.string()).nullish()
})),
  "market_trends": z.array(z.string()).nullish(),
  "time_to_revenue_days": z.number().int().nullish()
}),
  "goals": z.object({
  "target_mqls_per_month": z.number().int().nullish(),
  "target_signups_per_month": z.number().int().nullish(),
  "timeline_weeks": z.number().int().nullish()
}).nullish()
});
export type ChannelStrategistInput = z.infer<typeof ChannelStrategistInputSchema>;
