/* eslint-disable */
// auto-generated from modules/gtm/agents/weekly-governance-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const WeeklyGovernanceAgentOutputSchema = z.object({
  "week_ending_date": z.string(),
  "report_title": z.string().nullish(),
  "executive_summary": z.string(),
  "gtm_health_score": z.object({
  "overall_score": z.number().int().min(0).max(100),
  "trend": z.enum(["improving", "stable", "declining"]),
  "vs_target": z.enum(["on-track", "at-risk", "off-track"]).nullish()
}).nullish(),
  "performance_vs_targets": z.array(z.object({
  "metric": z.string(),
  "weekly_value": z.number(),
  "target": z.number(),
  "actual_month_to_date": z.number().nullish(),
  "status": z.enum(["on-track", "at-risk", "off-track"]),
  "trend": z.enum(["improving", "stable", "declining"]).nullish(),
  "commentary": z.string().nullish()
})),
  "channel_performance_summary": z.array(z.object({
  "channel": z.string(),
  "weekly_leads": z.number().int().nullish(),
  "cac": z.number().nullish(),
  "trend": z.enum(["improving", "stable", "declining"]).nullish(),
  "status": z.enum(["healthy", "at-risk", "needs-action"]),
  "commentary": z.string().nullish()
})).nullish(),
  "key_decisions_needed": z.array(z.object({
  "decision": z.string(),
  "options": z.array(z.string()).nullish(),
  "recommendation": z.string(),
  "impact_if_approved": z.string().nullish(),
  "timeframe": z.enum(["immediately", "by-eow", "by-end-of-week", "can-wait"])
})).nullish(),
  "risk_flags": z.array(z.object({
  "risk": z.string(),
  "severity": z.enum(["low", "medium", "high", "critical"]),
  "action": z.string()
})).nullish(),
  "budget_status": z.object({
  "monthly_budget": z.number(),
  "mtd_spend": z.number(),
  "mtd_spend_percent": z.number().nullish(),
  "weekly_burn_rate": z.number().nullish(),
  "remaining_budget": z.number(),
  "on_track": z.boolean().nullish(),
  "commentary": z.string().nullish()
}).nullish(),
  "next_week_priorities": z.array(z.object({
  "priority": z.string(),
  "owner": z.string(),
  "due_date": z.string().nullish()
})).nullish(),
  "metrics_snapshot": z.object({
  "monthly_revenue_pace": z.number().nullish(),
  "monthly_lead_pace": z.number().nullish(),
  "blended_cac": z.number().nullish(),
  "marketing_roas": z.number().nullish(),
  "pipeline_coverage_ratio": z.number().nullish()
}).nullish()
});
export type WeeklyGovernanceAgentOutput = z.infer<typeof WeeklyGovernanceAgentOutputSchema>;
