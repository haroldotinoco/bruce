/* eslint-disable */
// auto-generated from modules/startup-ops/agents/weekly-ops-reporter/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const WeeklyOpsReporterOutputSchema = z.object({
  "report_id": z.string(),
  "venture_id": z.string(),
  "period": z.object({
  "start": z.string(),
  "end": z.string()
}),
  "executive_summary": z.string().min(200).max(1000),
  "health_score_delta_vs_last_week": z.number().nullable().nullish(),
  "highlights": z.array(z.string()).nullish(),
  "concerns": z.array(z.string()).nullish(),
  "metric_table": z.object({}).catchall(z.object({
  "value": z.number().nullable().nullish(),
  "previous_value": z.number().nullable().nullish(),
  "change_percent": z.number().nullable().nullish(),
  "status": z.enum(["up", "down", "stable"]).nullish()
})),
  "anomalies_summary": z.string().nullable().nullish(),
  "recommendations_summary": z.array(z.object({
  "title": z.string().nullish(),
  "urgency": z.enum(["immediate", "this_week", "next_cycle"]).nullish(),
  "action": z.string().nullish()
})).nullish(),
  "next_week_focus": z.array(z.string()).nullish(),
  "generated_at": z.string().nullish(),
  "report_artifact_ref": z.string().nullable().nullish()
});
export type WeeklyOpsReporterOutput = z.infer<typeof WeeklyOpsReporterOutputSchema>;
