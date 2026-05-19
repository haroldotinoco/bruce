/* eslint-disable */
// auto-generated from modules/gtm/agents/analytics-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const AnalyticsAgentOutputSchema = z.object({
  "performance_summary": z.object({
  "success_metric": z.string(),
  "target_value": z.number(),
  "achieved_value": z.number(),
  "variance_percent": z.number().nullish(),
  "status": z.enum(["exceeding-target", "on-track", "at-risk", "failed"]),
  "confidence_level": z.number().min(0).max(1).nullish(),
  "data_completeness_percent": z.number().nullish()
}),
  "segment_breakdown": z.array(z.object({
  "segment_name": z.string(),
  "metric_value": z.number(),
  "target": z.number().nullish(),
  "vs_target": z.enum(["above-target", "on-target", "below-target"]),
  "sample_size": z.number().int().nullish(),
  "trend": z.enum(["improving", "stable", "declining"]).nullish(),
  "statistical_significance": z.boolean().nullish()
})).nullish(),
  "winning_patterns": z.array(z.object({
  "pattern": z.string(),
  "segments": z.array(z.string()),
  "performance_lift": z.number()
})).nullish(),
  "losing_patterns": z.array(z.object({
  "pattern": z.string(),
  "segments": z.array(z.string()),
  "performance_loss": z.number()
})).nullish(),
  "surprising_findings": z.array(z.string()).nullish(),
  "root_cause_analysis": z.object({
  "what_worked": z.string().nullish(),
  "what_didnt_work": z.string().nullish(),
  "external_factors_impact": z.array(z.object({
  "factor": z.string().nullish(),
  "estimated_impact": z.number().nullish()
})).nullish()
}).nullish(),
  "interpretation": z.string(),
  "recommendation": z.object({
  "action": z.enum(["scale-campaign", "pause-campaign", "pivot-messaging", "continue-monitoring", "kill-campaign"]),
  "rationale": z.string(),
  "next_steps": z.array(z.string()).nullish(),
  "next_data_to_collect": z.array(z.string()).nullish()
}),
  "comparison_to_benchmarks": z.object({
  "vs_historical": z.string().nullish(),
  "vs_platform_average": z.string().nullish(),
  "vs_industry": z.string().nullish()
}).nullish()
});
export type AnalyticsAgentOutput = z.infer<typeof AnalyticsAgentOutputSchema>;
