/* eslint-disable */
// auto-generated from modules/gtm/agents/analytics-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const AnalyticsAgentInputSchema = z.object({
  "campaign_id": z.string(),
  "campaign_context": z.object({
  "name": z.string().nullish(),
  "channel": z.string().nullish(),
  "target_value": z.number().nullish(),
  "budget": z.number().nullish(),
  "launch_date": z.string().nullish(),
  "data_collection_date": z.string().nullish()
}).nullish(),
  "success_metric": z.object({
  "name": z.string(),
  "target": z.number(),
  "unit": z.string().nullish()
}),
  "performance_data": z.object({
  "overall": z.object({
  "impressions": z.number().int().nullish(),
  "clicks": z.number().int().nullish(),
  "conversions": z.number().int().nullish(),
  "spend_usd": z.number().nullish(),
  "ctr_percent": z.number().nullish(),
  "conversion_rate_percent": z.number().nullish(),
  "cost_per_conversion": z.number().nullish(),
  "roas": z.number().nullish()
}),
  "by_variant": z.object({}).catchall(z.object({
  "impressions": z.number().int().nullish(),
  "clicks": z.number().int().nullish(),
  "conversions": z.number().int().nullish(),
  "spend_usd": z.number().nullish()
})).nullish(),
  "by_audience_segment": z.object({}).catchall(z.object({
  "impressions": z.number().int().nullish(),
  "clicks": z.number().int().nullish(),
  "conversions": z.number().int().nullish()
})).nullish(),
  "time_series": z.array(z.object({
  "date": z.string().nullish(),
  "impressions": z.number().int().nullish(),
  "clicks": z.number().int().nullish(),
  "conversions": z.number().int().nullish(),
  "spend_usd": z.number().nullish()
})).nullish()
}),
  "historical_benchmarks": z.object({
  "previous_campaign_ctr": z.number().nullish(),
  "previous_campaign_conversion_rate": z.number().nullish(),
  "previous_campaign_cpc": z.number().nullish(),
  "platform_average_ctr": z.number().nullish(),
  "industry_average_cpc": z.number().nullish()
}).nullish(),
  "external_context": z.object({
  "platform_updates": z.array(z.string()).nullish(),
  "market_events": z.array(z.string()).nullish(),
  "technical_issues": z.array(z.string()).nullish()
}).nullish()
});
export type AnalyticsAgentInput = z.infer<typeof AnalyticsAgentInputSchema>;
