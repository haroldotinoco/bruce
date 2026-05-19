/* eslint-disable */
// auto-generated from modules/gtm/agents/content-system-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ContentSystemAgentInputSchema = z.object({
  "product": z.object({
  "name": z.string(),
  "core_value_prop": z.string(),
  "category": z.string(),
  "key_differentiators": z.array(z.string()),
  "target_use_cases": z.array(z.string()).nullish()
}),
  "target_audience": z.object({
  "personas": z.array(z.object({
  "name": z.string(),
  "role": z.string(),
  "pain_points": z.array(z.string()),
  "values": z.array(z.string())
}))
}),
  "distribution_channels": z.array(z.enum(["linkedin", "twitter", "newsletter", "blog", "tiktok", "youtube", "instagram", "industry-publication", "podcast", "webinar", "community"])),
  "brand_guidelines": z.object({
  "tone": z.enum(["formal", "conversational", "provocative", "educational", "playful"]),
  "voice_examples": z.array(z.string()),
  "messaging_pillars": z.array(z.string()).nullish(),
  "brand_colors": z.string().nullish(),
  "logo_url": z.string().nullish()
}),
  "resources": z.object({
  "content_team_size": z.number().nullish(),
  "publishing_frequency": z.enum(["daily", "3x-weekly", "2x-weekly", "weekly", "bi-weekly"]).nullish(),
  "outsourcing_available": z.boolean().nullish()
}).nullish(),
  "success_metrics": z.object({
  "monthly_engagement_target": z.number().int().nullish(),
  "monthly_lead_target": z.number().int().nullish(),
  "content_reuse_target_percent": z.number().int().nullish()
}).nullish()
});
export type ContentSystemAgentInput = z.infer<typeof ContentSystemAgentInputSchema>;
