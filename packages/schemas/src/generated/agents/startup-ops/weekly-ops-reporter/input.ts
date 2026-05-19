/* eslint-disable */
// auto-generated from modules/startup-ops/agents/weekly-ops-reporter/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const WeeklyOpsReporterInputSchema = z.object({
  "health_report": z.object({
  "health_report_id": z.string().nullish(),
  "composite_score": z.number().nullish(),
  "dimension_scores": z.object({}).nullish(),
  "at_risk_dimensions": z.array(z.unknown()).nullish(),
  "critical_dimensions": z.array(z.unknown()).nullish()
}),
  "anomalies": z.object({
  "anomalies_detected": z.array(z.unknown()).nullish()
}).nullable().nullish(),
  "recommendations": z.object({
  "recommendations": z.array(z.unknown()).nullish()
}).nullable().nullish(),
  "metric_snapshot": z.object({
  "metrics": z.object({}).nullish()
}).nullable().nullish(),
  "previous_week_report_ref": z.string().nullable().nullish(),
  "venture_context": z.object({
  "venture_id": z.string(),
  "venture_name": z.string().nullish(),
  "stage": z.enum(["seed", "early", "growth"]).nullish()
})
});
export type WeeklyOpsReporterInput = z.infer<typeof WeeklyOpsReporterInputSchema>;
