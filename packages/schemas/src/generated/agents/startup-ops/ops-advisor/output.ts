/* eslint-disable */
// auto-generated from modules/startup-ops/agents/ops-advisor/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const OpsAdvisorOutputSchema = z.object({
  "venture_id": z.string(),
  "created_at": z.string(),
  "recommendations": z.array(z.object({
  "recommendation_id": z.string(),
  "area": z.enum(["activation", "retention", "revenue", "product_quality", "financial_sustainability", "market_fit", "general"]),
  "title": z.string().min(5).max(100),
  "description": z.string().nullish(),
  "urgency": z.enum(["immediate", "this_week", "next_cycle"]),
  "expected_impact": z.string().nullish(),
  "specific_actions": z.array(z.string()),
  "metrics_to_watch": z.array(z.string()).nullish(),
  "created_from_anomaly_id": z.string().nullable().nullish()
})),
  "risk_summary": z.string(),
  "overall_action_required": z.boolean(),
  "health_report_id": z.string().nullish()
});
export type OpsAdvisorOutput = z.infer<typeof OpsAdvisorOutputSchema>;
