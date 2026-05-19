/* eslint-disable */
// auto-generated from modules/startup-ops/agents/ops-advisor/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const OpsAdvisorInputSchema = z.object({
  "health_report": z.object({
  "health_report_id": z.string().nullish(),
  "composite_score": z.number().min(0).max(100),
  "dimension_scores": z.object({}).nullish(),
  "at_risk_dimensions": z.array(z.unknown()).nullish(),
  "critical_dimensions": z.array(z.unknown()).nullish()
}),
  "anomalies": z.object({
  "anomalies_detected": z.array(z.unknown()).nullish(),
  "anomaly_count_by_severity": z.object({}).nullish(),
  "escalation_required": z.boolean().nullish()
}),
  "venture_context": z.object({
  "venture_id": z.string().nullish(),
  "stage": z.enum(["seed", "early", "growth"]),
  "hypothesis": z.string().nullish(),
  "kill_criteria": z.array(z.string()).nullish()
})
});
export type OpsAdvisorInput = z.infer<typeof OpsAdvisorInputSchema>;
