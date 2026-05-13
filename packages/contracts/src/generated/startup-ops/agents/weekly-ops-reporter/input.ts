/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/weekly-ops-reporter/input.schema.json */

export interface WeeklyReporterInput {
  health_report: {
    health_report_id?: string;
    composite_score?: number;
    dimension_scores?: {
      [k: string]: unknown;
    };
    at_risk_dimensions?: unknown[];
    critical_dimensions?: unknown[];
    [k: string]: unknown;
  };
  anomalies?: {
    anomalies_detected?: unknown[];
    [k: string]: unknown;
  };
  recommendations?: {
    recommendations?: unknown[];
    [k: string]: unknown;
  };
  metric_snapshot?: {
    metrics?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Reference to prior week's report for trend comparison
   */
  previous_week_report_ref?: string;
  venture_context: {
    venture_id: string;
    venture_name?: string;
    stage?: "seed" | "early" | "growth";
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
