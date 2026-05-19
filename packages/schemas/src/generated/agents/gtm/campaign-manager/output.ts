/* eslint-disable */
// auto-generated from modules/gtm/agents/campaign-manager/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CampaignManagerOutputSchema = z.object({
  "campaign_brief": z.object({
  "campaign_id": z.string(),
  "objective": z.string(),
  "target_audience": z.string(),
  "success_metric": z.string(),
  "target_kpi": z.number(),
  "budget_usd": z.number().nullish(),
  "timeline_days": z.number().int().nullish(),
  "launch_date": z.string().nullish(),
  "decision_date": z.string().nullish()
}),
  "ab_test_plan": z.object({
  "variable_tested": z.string().nullish(),
  "control_description": z.string().nullish(),
  "variant_description": z.string().nullish(),
  "split_percentage": z.object({
  "control": z.number().nullish(),
  "variant": z.number().nullish()
}).nullish(),
  "sample_size_needed": z.number().int().nullish(),
  "confidence_level": z.number().nullish(),
  "expected_days_to_significance": z.number().int().nullish()
}).nullish(),
  "budget_allocation": z.object({
  "total_budget": z.number(),
  "allocation_breakdown": z.object({}).catchall(z.object({
  "budget_usd": z.number().nullish(),
  "percentage": z.number().nullish(),
  "daily_budget": z.number().nullish(),
  "purpose": z.string().nullish()
})),
  "contingency_reserve": z.number().nullish()
}),
  "launch_checklist": z.array(z.object({
  "item": z.string(),
  "owner": z.string(),
  "deadline": z.string(),
  "status": z.enum(["pending", "in-progress", "completed"]).nullish()
})).nullish(),
  "daily_monitoring_plan": z.object({
  "metrics_to_monitor": z.array(z.string()),
  "check_frequency": z.enum(["hourly", "daily", "daily-eod", "twice-daily"]),
  "alert_thresholds": z.array(z.object({
  "metric": z.string(),
  "threshold_value": z.number(),
  "action": z.string(),
  "severity": z.enum(["info", "warning", "critical"]).nullish()
})),
  "pause_criteria": z.string().nullish(),
  "escalation_process": z.string().nullish()
}),
  "success_thresholds": z.object({
  "kill_threshold": z.number().nullish(),
  "pause_threshold": z.number().nullish(),
  "scale_threshold": z.number().nullish()
}).nullish(),
  "reporting_cadence": z.object({
  "daily_snapshot": z.string().nullish(),
  "weekly_review": z.string().nullish(),
  "final_report_date": z.string().nullish()
}).nullish()
});
export type CampaignManagerOutput = z.infer<typeof CampaignManagerOutputSchema>;
