/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/ops-advisor/input.schema.json */

export interface OpsAdvisorInput {
  health_report: {
    health_report_id?: string;
    composite_score: number;
    dimension_scores?: {
      [k: string]: unknown;
    };
    at_risk_dimensions?: unknown[];
    critical_dimensions?: unknown[];
    [k: string]: unknown;
  };
  anomalies: {
    anomalies_detected?: unknown[];
    anomaly_count_by_severity?: {
      [k: string]: unknown;
    };
    escalation_required?: boolean;
    [k: string]: unknown;
  };
  venture_context: {
    venture_id?: string;
    stage: "seed" | "early" | "growth";
    /**
     * Current product-market fit hypothesis
     */
    hypothesis?: string;
    /**
     * Metrics or conditions that would trigger wind-down decision
     */
    kill_criteria?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
