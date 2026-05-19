/* eslint-disable */
// auto-generated from modules/startup-ops/agents/anomaly-detector/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const AnomalyDetectorOutputSchema = z.object({
  "venture_id": z.string(),
  "detected_at": z.string(),
  "anomalies_detected": z.array(z.object({
  "anomaly_id": z.string(),
  "metric_name": z.string(),
  "type": z.enum(["sudden_drop", "concerning_trend", "positive_breakout", "sustained_decline"]),
  "severity": z.enum(["info", "warning", "critical"]),
  "current_value": z.number().nullable(),
  "baseline_value": z.number().nullable(),
  "delta_percent": z.number().nullish(),
  "z_score": z.number().nullable().nullish(),
  "description": z.string().nullish(),
  "recommendation": z.string().nullish(),
  "requires_escalation": z.boolean().nullish()
})),
  "anomaly_count_by_severity": z.object({
  "critical": z.number().int().min(0),
  "warning": z.number().int().min(0),
  "info": z.number().int().min(0)
}),
  "snapshot_id": z.string().nullish(),
  "escalation_required": z.boolean().nullish()
});
export type AnomalyDetectorOutput = z.infer<typeof AnomalyDetectorOutputSchema>;
