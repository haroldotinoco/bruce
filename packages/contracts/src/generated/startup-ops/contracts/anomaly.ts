/* eslint-disable */
/* auto-generated from modules/startup-ops/contracts/anomaly.schema.json */

/**
 * Detected anomaly with severity and recommendation
 */
export interface Anomaly {
  anomaly_id: string;
  venture_id: string;
  detected_at: string;
  type: "sudden_drop" | "concerning_trend" | "positive_breakout" | "sustained_decline";
  metric_name: string;
  severity: "info" | "warning" | "critical";
  current_value: number | null;
  baseline_value: number | null;
  delta_percent: number;
  z_score?: number | null;
  description: string;
  recommendation: string;
  requires_escalation: boolean;
  [k: string]: unknown;
}
