/* eslint-disable */
// auto-generated from modules/gtm/agents/weekly-governance-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const WeeklyGovernanceAgentInputSchema = z.object({
  "week_context": z.object({
  "week_ending_date": z.string(),
  "reporting_period": z.enum(["weekly", "monthly-week-4", "quarter-end"]).nullish(),
  "audience": z.enum(["executive-team", "board", "gtm-team"]).nullish()
}),
  "performance_data": z.object({
  "campaigns": z.array(z.object({
  "campaign_id": z.string().nullish(),
  "channel": z.string().nullish(),
  "weekly_spend": z.number().nullish(),
  "weekly_leads": z.number().int().nullish(),
  "cac": z.number().nullish(),
  "status": z.enum(["active", "paused", "scaling", "winding-down"]).nullish()
})).nullish(),
  "channel_performance": z.object({}).catchall(z.object({
  "weekly_spend": z.number().nullish(),
  "weekly_leads": z.number().int().nullish(),
  "conversion_rate": z.number().nullish(),
  "cac": z.number().nullish(),
  "trend": z.enum(["improving", "stable", "declining"]).nullish()
})).nullish(),
  "anomalies": z.array(z.object({
  "issue": z.string().nullish(),
  "severity": z.enum(["info", "warning", "critical"]).nullish(),
  "impact": z.string().nullish()
})).nullish()
}),
  "gtm_targets": z.object({
  "monthly_revenue_target_usd": z.number().nullish(),
  "monthly_lead_target": z.number().int(),
  "target_cac_usd": z.number().nullish(),
  "target_conversion_rate_percent": z.number().nullish(),
  "monthly_budget": z.number().nullish()
}),
  "budget_status": z.object({
  "monthly_budget": z.number().nullish(),
  "week_1_actual_spend": z.number().nullish(),
  "week_2_actual_spend": z.number().nullish(),
  "week_3_actual_spend": z.number().nullish(),
  "week_4_actual_spend": z.number().nullish(),
  "ytd_actual_spend": z.number().nullish()
}).nullish(),
  "pending_decisions": z.array(z.object({
  "decision_type": z.enum(["campaign-scale", "campaign-pause", "budget-reallocation", "channel-kill"]).nullish(),
  "campaign_or_channel": z.string().nullish(),
  "context": z.string().nullish()
})).nullish()
});
export type WeeklyGovernanceAgentInput = z.infer<typeof WeeklyGovernanceAgentInputSchema>;
