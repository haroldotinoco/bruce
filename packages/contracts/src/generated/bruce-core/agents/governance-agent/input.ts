/* eslint-disable */
/* auto-generated from modules/bruce-core/agents/governance-agent/input.schema.json */

/**
 * Input to Governance Agent for portfolio-level decision making
 */
export interface GovernanceAgentInput {
  venture_id: string;
  /**
   * Type of governance decision request
   */
  decision_request_type?: "periodic_review" | "gate_failure_response" | "manual_request";
  /**
   * Health analysis from Portfolio module
   */
  portfolio_health_report: {
    venture_id?: string;
    current_stage?: string;
    health_score?: number;
    growth_metrics?: {
      wow_growth_pct?: number;
      mom_growth_pct?: number;
      [k: string]: unknown;
    };
    unit_economics?: {
      cac?: number;
      ltv?: number;
      cac_ltv_ratio?: number;
      gross_margin_pct?: number;
      cac_payback_months?: number;
      [k: string]: unknown;
    };
    product_market_fit?: {
      month_1_retention?: number;
      month_2_retention?: number;
      nps?: number;
      [k: string]: unknown;
    };
    operational_health?: {
      burn_rate_monthly?: number;
      runway_months?: number;
      team_size?: number;
      key_open_roles?: string[];
      [k: string]: unknown;
    };
    identified_risks?: {
      risk?: string;
      severity?: "critical" | "high" | "medium" | "low";
      identified_at?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  venture_context?: {
    venture_id?: string;
    name?: string;
    founder_info?: {
      [k: string]: unknown;
    };
    stage?: string;
    launched_date?: string;
    [k: string]: unknown;
  };
  /**
   * Portfolio composition and constraints
   */
  portfolio_context?: {
    total_active_ventures?: number;
    ventures_by_stage?: {
      [k: string]: unknown;
    };
    total_monthly_burn?: number;
    total_runway_months?: number;
    resource_constraints?: string[];
    [k: string]: unknown;
  };
  /**
   * Prior governance decisions for this venture (for consistency check)
   */
  prior_decisions?: {
    decision?: string;
    decided_at?: string;
    confidence_score?: number;
    [k: string]: unknown;
  }[];
  correlation_id?: string;
  [k: string]: unknown;
}
