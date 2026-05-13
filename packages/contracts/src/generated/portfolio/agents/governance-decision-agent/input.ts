/* eslint-disable */
/* auto-generated from modules/portfolio/agents/governance-decision-agent/input.schema.json */

/**
 * Portfolio analysis, risk, and allocation data for final governance decisions
 */
export interface GovernanceDecisionAgentInput {
  /**
   * Ventures requiring governance decisions
   *
   * @minItems 1
   * @maxItems 100
   */
  ventures: [
    {
      venture_id: string;
      name: string;
      weeks_since_launch?: number;
      health_score: number;
      health_trend?: "improving" | "stable" | "declining";
      traction_score: number;
      /**
       * Month-over-month growth rate (decimal, e.g., 0.18 = 18%)
       */
      monthly_growth_rate?: number;
      monthly_revenue?: number;
      monthly_burn_rate?: number;
      runway_months?: number;
      cac?: number;
      ltv?: number;
      cac_ltv_ratio?: number;
      /**
       * 0-1 scale
       */
      conversion_rate?: number;
      nps?: number;
      team_health?: "strong" | "adequate" | "declining" | "at_risk";
      /**
       * Specific risks identified
       */
      key_risk_factors?: string[];
      /**
       * Decision from last review (if any)
       */
      previous_decision?: "scale" | "iterate" | "pause" | "kill";
      previous_decision_date?: string;
      /**
       * Context-specific factors
       */
      decision_context?: {
        /**
         * Flagged as outlier by analyst
         */
        is_outlier?: boolean;
        outlier_reason?: string;
        /**
         * Importance to portfolio goals
         */
        portfolio_importance?: "strategic" | "high" | "medium" | "low";
        [k: string]: unknown;
      };
      [k: string]: unknown;
    },
    ...{
      venture_id: string;
      name: string;
      weeks_since_launch?: number;
      health_score: number;
      health_trend?: "improving" | "stable" | "declining";
      traction_score: number;
      /**
       * Month-over-month growth rate (decimal, e.g., 0.18 = 18%)
       */
      monthly_growth_rate?: number;
      monthly_revenue?: number;
      monthly_burn_rate?: number;
      runway_months?: number;
      cac?: number;
      ltv?: number;
      cac_ltv_ratio?: number;
      /**
       * 0-1 scale
       */
      conversion_rate?: number;
      nps?: number;
      team_health?: "strong" | "adequate" | "declining" | "at_risk";
      /**
       * Specific risks identified
       */
      key_risk_factors?: string[];
      /**
       * Decision from last review (if any)
       */
      previous_decision?: "scale" | "iterate" | "pause" | "kill";
      previous_decision_date?: string;
      /**
       * Context-specific factors
       */
      decision_context?: {
        /**
         * Flagged as outlier by analyst
         */
        is_outlier?: boolean;
        outlier_reason?: string;
        /**
         * Importance to portfolio goals
         */
        portfolio_importance?: "strategic" | "high" | "medium" | "low";
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[]
  ];
  /**
   * Policy governing decisions
   */
  decision_policy: {
    /**
     * Minimum thresholds for scale decision
     */
    scale_criteria?: {
      min_health_score?: number;
      min_traction_score?: number;
      min_monthly_growth_rate?: number;
      max_cac_ltv_ratio?: number;
      min_runway_months?: number;
      [k: string]: unknown;
    };
    /**
     * Any one of these criteria triggers kill consideration
     */
    kill_criteria?: {
      criterion?: string;
      threshold?: string;
      [k: string]: unknown;
    }[];
    /**
     * Decisions requiring human approval
     */
    human_review_required_for?: string[];
    [k: string]: unknown;
  };
  /**
   * Key findings from portfolio-analyst
   */
  analyst_insights?: {
    patterns?: string[];
    outliers?: string[];
    [k: string]: unknown;
  };
  /**
   * Risk factors from risk-monitor
   */
  risk_assessment?: {
    portfolio_risk_score?: number;
    venture_specific_risks?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Resource allocation suggestions from allocation-agent
   */
  allocation_recommendations?: {
    venture_id?: string;
    recommended_budget_delta?: number;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
