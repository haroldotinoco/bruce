/* eslint-disable */
/* auto-generated from modules/portfolio/agents/allocation-agent/input.schema.json */

/**
 * Portfolio health, risk, and venture requirements for resource allocation decision
 */
export interface AllocationAgentInput {
  /**
   * All active ventures with current allocation and requirements
   *
   * @minItems 1
   * @maxItems 100
   */
  ventures: [
    {
      venture_id: string;
      name: string;
      sector?: string;
      stage?: "pre-launch" | "early" | "growth" | "mature";
      health_score: number;
      traction_score?: number;
      runway_months: number;
      monthly_revenue?: number;
      monthly_burn_rate: number;
      /**
       * Current resource allocation
       */
      current_allocation?: {
        monthly_budget_usd?: number;
        headcount?: number;
        allocated_infrastructure_costs?: number;
        [k: string]: unknown;
      };
      /**
       * Venture's stated resource needs
       */
      resource_requirements?: {
        hiring_plan?: {
          open_roles?: number;
          critical_hires?: number;
          cost_per_hire?: number;
          [k: string]: unknown;
        };
        /**
         * Additional monthly budget requested (USD)
         */
        budget_increase_request?: number;
        /**
         * Infrastructure requirements (e.g., 'dedicated database', '3rd party API access')
         */
        infrastructure_needs?: string;
        /**
         * Venture IDs this venture could share resources with
         */
        shared_resource_candidates?: string[];
        [k: string]: unknown;
      };
      status?: "active" | "decision_pending" | "paused";
      [k: string]: unknown;
    },
    ...{
      venture_id: string;
      name: string;
      sector?: string;
      stage?: "pre-launch" | "early" | "growth" | "mature";
      health_score: number;
      traction_score?: number;
      runway_months: number;
      monthly_revenue?: number;
      monthly_burn_rate: number;
      /**
       * Current resource allocation
       */
      current_allocation?: {
        monthly_budget_usd?: number;
        headcount?: number;
        allocated_infrastructure_costs?: number;
        [k: string]: unknown;
      };
      /**
       * Venture's stated resource needs
       */
      resource_requirements?: {
        hiring_plan?: {
          open_roles?: number;
          critical_hires?: number;
          cost_per_hire?: number;
          [k: string]: unknown;
        };
        /**
         * Additional monthly budget requested (USD)
         */
        budget_increase_request?: number;
        /**
         * Infrastructure requirements (e.g., 'dedicated database', '3rd party API access')
         */
        infrastructure_needs?: string;
        /**
         * Venture IDs this venture could share resources with
         */
        shared_resource_candidates?: string[];
        [k: string]: unknown;
      };
      status?: "active" | "decision_pending" | "paused";
      [k: string]: unknown;
    }[]
  ];
  /**
   * Current portfolio-level state and constraints
   */
  portfolio_state: {
    /**
     * Total capital available to allocate per month
     */
    total_available_budget_monthly: number;
    current_allocation_summary: {
      total_monthly_allocation?: number;
      total_headcount?: number;
      /**
       * Current budget by stage
       */
      allocation_by_stage?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    portfolio_constraints?: {
      max_concentration_percent?: number;
      min_avg_runway_months?: number;
      max_portfolio_burn_monthly?: number;
      [k: string]: unknown;
    };
    /**
     * Risk findings from risk-monitor to inform allocation
     */
    risk_assessment?: {
      concentration_risk_score?: number;
      codependency_risks?: string[];
      ventures_at_risk?: string[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Strategy parameters for allocation decision
   */
  allocation_strategy?: {
    /**
     * High-level strategy
     */
    strategy_type?: "growth_focused" | "risk_mitigation" | "balanced";
    /**
     * Venture IDs to prioritize for additional resources
     */
    priority_ventures?: string[];
    /**
     * Venture IDs receiving runway-only allocation
     */
    ventures_to_wind_down?: string[];
    /**
     * Target revenue per $1 spend (e.g., 0.15 = $0.15 revenue per $1 allocated)
     */
    resource_efficiency_target?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
