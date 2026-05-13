/* eslint-disable */
/* auto-generated from modules/startup-ops/contracts/health-report.schema.json */

/**
 * Operational health scores across 6 dimensions with trends and risk flags
 */
export interface HealthReport {
  health_report_id: string;
  venture_id: string;
  scored_at: string;
  stage: "seed" | "early" | "growth";
  dimension_scores: {
    activation?: {
      score?: number;
      status?: string;
      [k: string]: unknown;
    };
    retention?: {
      score?: number;
      status?: string;
      [k: string]: unknown;
    };
    revenue?: {
      score?: number;
      status?: string;
      [k: string]: unknown;
    };
    product_quality?: {
      score?: number;
      status?: string;
      [k: string]: unknown;
    };
    financial_sustainability?: {
      score?: number;
      status?: string;
      [k: string]: unknown;
    };
    market_fit?: {
      score?: number;
      status?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  composite_score: number;
  composite_status?: "critical" | "warning" | "healthy";
  trends?: {
    [k: string]: unknown;
  };
  at_risk_dimensions: unknown[];
  critical_dimensions: unknown[];
  period?: {
    start?: string;
    end?: string;
    [k: string]: unknown;
  };
  metric_snapshot_id?: string;
  [k: string]: unknown;
}
