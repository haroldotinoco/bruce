/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/weekly-ops-reporter/output.schema.json */

export interface WeeklyReporterOutput {
  /**
   * Unique identifier for this weekly report
   */
  report_id: string;
  /**
   * Venture this report covers
   */
  venture_id: string;
  /**
   * Week covered by this report (Monday-Sunday)
   */
  period: {
    start: string;
    end: string;
    [k: string]: unknown;
  };
  /**
   * 3-5 sentence summary of venture operational status and key changes
   */
  executive_summary: string;
  /**
   * Change in composite health score from previous week
   */
  health_score_delta_vs_last_week?: number;
  /**
   * 2-4 positive signals or achievements from the week
   *
   * @minItems 1
   * @maxItems 4
   */
  highlights?: [string] | [string, string] | [string, string, string] | [string, string, string, string];
  /**
   * 2-4 areas of concern requiring attention
   *
   * @minItems 0
   * @maxItems 4
   */
  concerns?: [] | [string] | [string, string] | [string, string, string] | [string, string, string, string];
  /**
   * Top 15 KPIs with current values and week-over-week change
   */
  metric_table: {
    [k: string]: {
      value?: number;
      previous_value?: number;
      change_percent?: number;
      status?: "up" | "down" | "stable";
      [k: string]: unknown;
    };
  };
  /**
   * Narrative summary of detected anomalies and required actions
   */
  anomalies_summary?: string;
  /**
   * Condensed version of key recommendations
   */
  recommendations_summary?: {
    title?: string;
    urgency?: "immediate" | "this_week" | "next_cycle";
    action?: string;
    [k: string]: unknown;
  }[];
  /**
   * 1-3 specific priorities for next week
   *
   * @minItems 1
   * @maxItems 3
   */
  next_week_focus?: [string] | [string, string] | [string, string, string];
  /**
   * When this report was generated
   */
  generated_at?: string;
  /**
   * Optional reference to full report storage location
   */
  report_artifact_ref?: string;
  [k: string]: unknown;
}
