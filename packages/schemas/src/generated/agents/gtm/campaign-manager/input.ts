/* eslint-disable */
// auto-generated from modules/gtm/agents/campaign-manager/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CampaignManagerInputSchema = z.object({
  "campaign_objective": z.object({
  "name": z.string(),
  "channel": z.enum(["paid-linkedin", "paid-google-ads", "paid-social", "email", "organic-social", "content", "partnerships", "events", "plg"]),
  "goal": z.string(),
  "timeline_days": z.number().int().min(7).max(90).nullish()
}),
  "target_audience": z.object({
  "persona": z.string(),
  "segment_size": z.number().int(),
  "geographic_focus": z.array(z.string()).nullish(),
  "exclusions": z.array(z.string()).nullish()
}),
  "budget": z.object({
  "total_usd": z.number().min(2000),
  "currency": z.string(),
  "allocation_strategy": z.enum(["equal-split", "performance-based", "sequential", "fixed-allocation"]).nullish()
}),
  "success_metric": z.object({
  "metric_type": z.enum(["impressions", "clicks", "ctr", "conversions", "cost-per-lead", "cost-per-signup", "conversion-rate", "roas"]),
  "target_value": z.number(),
  "secondary_metrics": z.array(z.string()).nullish()
}),
  "ab_test_config": z.object({
  "variable_to_test": z.enum(["audience", "messaging", "creative", "offer", "channel-variant", "landing-page"]).nullish(),
  "control_version": z.string().nullish(),
  "test_variant": z.string().nullish(),
  "confidence_level": z.union([z.literal(0.9), z.literal(0.95), z.literal(0.99)]).nullish()
}).nullish(),
  "constraints": z.object({
  "kill_threshold_cac_multiplier": z.number().nullish(),
  "minimum_days_before_decision": z.number().int().nullish(),
  "daily_spend_cap": z.number().nullish()
}).nullish()
});
export type CampaignManagerInput = z.infer<typeof CampaignManagerInputSchema>;
