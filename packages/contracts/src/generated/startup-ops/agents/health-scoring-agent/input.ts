/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/health-scoring-agent/input.schema.json */

export interface HealthScoringInput {
  metric_snapshot: {
    snapshot_id: string;
    venture_id: string;
    collected_at?: string;
    metrics: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Venture stage for stage-appropriate rubrics and weights
   */
  stage: "seed" | "early" | "growth";
  /**
   * NPS data if available for product quality and market fit scoring
   */
  nps_data?: {
    score?: number;
    sample_size?: number;
    collected_at?: string;
    [k: string]: unknown;
  };
  /**
   * Reference to previous health report for trend calculation
   */
  previous_health_report_ref?: string;
  [k: string]: unknown;
}
