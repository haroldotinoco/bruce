/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/health-scoring-agent/output.schema.json */

export interface HealthScoringOutput {
  /**
   * Unique identifier for this health report
   */
  health_report_id: string;
  /**
   * Venture this report is for
   */
  venture_id: string;
  /**
   * ISO 8601 timestamp when health was scored
   */
  scored_at: string;
  /**
   * Venture stage used for scoring
   */
  stage: "seed" | "early" | "growth";
  dimension_scores: {
    activation: {
      score?: number;
      status?: "critical" | "at_risk" | "healthy";
      based_on?: string[];
      [k: string]: unknown;
    };
    retention: {
      score?: number;
      status?: "critical" | "at_risk" | "healthy";
      based_on?: string[];
      [k: string]: unknown;
    };
    revenue: {
      score?: number;
      status?: "critical" | "at_risk" | "healthy" | "insufficient_data";
      based_on?: string[];
      [k: string]: unknown;
    };
    product_quality: {
      score?: number;
      status?: "critical" | "at_risk" | "healthy" | "insufficient_data";
      based_on?: string[];
      [k: string]: unknown;
    };
    financial_sustainability: {
      score?: number;
      status?: "critical" | "at_risk" | "healthy";
      based_on?: string[];
      [k: string]: unknown;
    };
    market_fit: {
      score?: number;
      status?: "critical" | "at_risk" | "healthy";
      based_on?: string[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Weighted average of all dimension scores
   */
  composite_score: number;
  /**
   * Overall health status based on composite score
   */
  composite_status?: "critical" | "warning" | "healthy";
  /**
   * Trend direction for each dimension and composite
   */
  trends?: {
    activation?: "improving" | "stable" | "declining" | "n/a";
    retention?: "improving" | "stable" | "declining" | "n/a";
    revenue?: "improving" | "stable" | "declining" | "n/a";
    product_quality?: "improving" | "stable" | "declining" | "n/a";
    financial_sustainability?: "improving" | "stable" | "declining" | "n/a";
    market_fit?: "improving" | "stable" | "declining" | "n/a";
    composite?: "improving" | "stable" | "declining" | "n/a";
    [k: string]: unknown;
  };
  /**
   * Dimensions with score 20-39
   */
  at_risk_dimensions: {
    dimension?: string;
    score?: number;
    reason?: string;
    [k: string]: unknown;
  }[];
  /**
   * Dimensions with score < 20
   */
  critical_dimensions: {
    dimension?: string;
    score?: number;
    reason?: string;
    [k: string]: unknown;
  }[];
  /**
   * Time period this health report covers
   */
  period?: {
    start?: string;
    end?: string;
    [k: string]: unknown;
  };
  /**
   * Reference to the metric snapshot this health report is based on
   */
  metric_snapshot_id?: string;
  [k: string]: unknown;
}
