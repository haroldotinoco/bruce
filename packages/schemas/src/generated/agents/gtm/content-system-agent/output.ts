/* eslint-disable */
// auto-generated from modules/gtm/agents/content-system-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ContentSystemAgentOutputSchema = z.object({
  "messaging_system": z.object({
  "core_narrative": z.string(),
  "narrative_supporting_pillars": z.array(z.object({
  "pillar": z.string(),
  "proof_points": z.array(z.string())
})),
  "competitive_positioning": z.object({}).catchall(z.string()).nullish(),
  "objection_handlers": z.array(z.object({
  "objection": z.string(),
  "response": z.string()
})).nullish()
}),
  "content_calendar_structure": z.object({
  "monthly_volume": z.number().int(),
  "channel_breakdown": z.object({}).catchall(z.number().int()),
  "content_mix": z.object({
  "awareness": z.number().int(),
  "consideration": z.number().int(),
  "decision": z.number().int()
}).nullish(),
  "themes_by_month": z.object({}).catchall(z.array(z.string())).nullish()
}),
  "copywriting_templates": z.array(z.object({
  "template_id": z.string(),
  "channel": z.string(),
  "type": z.enum(["case-study", "thought-leadership", "objection-handler", "feature-spotlight", "customer-testimonial", "stat-callout", "how-to", "comparison", "announcement"]),
  "template": z.string(),
  "character_limit": z.number().int().nullish(),
  "usage_examples": z.array(z.string()).nullish(),
  "approval_requirements": z.array(z.string()).nullish()
})),
  "content_library_plan": z.object({
  "core_assets": z.array(z.object({
  "asset_name": z.string(),
  "description": z.string(),
  "owner": z.string(),
  "target_publish_date": z.string().nullish()
})),
  "supporting_assets": z.array(z.string()).nullish(),
  "production_timeline": z.string()
}).nullish(),
  "approval_workflow": z.object({
  "process": z.string(),
  "turnaround_time_hours": z.number().int().nullish(),
  "escalation_criteria": z.array(z.string()).nullish()
}).nullish(),
  "distribution_strategy": z.object({
  "repurposing_plan": z.string().nullish(),
  "amplification_plan": z.string().nullish()
}).nullish()
});
export type ContentSystemAgentOutput = z.infer<typeof ContentSystemAgentOutputSchema>;
