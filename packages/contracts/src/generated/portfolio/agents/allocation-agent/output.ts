/* eslint-disable */
/* auto-generated from modules/portfolio/agents/allocation-agent/output.schema.json */

/**
 * Resource allocation recommendations for all ventures and portfolio
 */
export interface AllocationAgentOutput {
  allocation_decision: {
    decision_timestamp: string;
    /**
     * Resource allocation per venture
     */
    allocation_recommendations: {
      venture_id: string;
      name: string;
      current_monthly_budget?: number;
      recommended_monthly_budget: number;
      /**
       * Change from current (USD)
       */
      budget_delta?: number;
      /**
       * % change from current
       */
      budget_change_percent?: number;
      /**
       * Why this budget level
       */
      budget_rationale: string;
      current_headcount?: number;
      recommended_headcount?: number;
      headcount_delta?: number;
      headcount_rationale?: string;
      /**
       * Top roles to fill (if hiring recommended)
       */
      hiring_priorities?: string[];
      /**
       * Opportunities to share resources with other ventures
       */
      resource_sharing_targets?: {
        venture_id?: string;
        resource_type?: "infrastructure" | "expertise" | "tools";
        description?: string;
        estimated_savings?: number;
        [k: string]: unknown;
      }[];
      /**
       * Confidence in this allocation
       */
      confidence_score?: number;
      /**
       * When to implement changes
       */
      implementation_timeline?: "immediate" | "this_month" | "next_month" | "next_quarter";
      [k: string]: unknown;
    }[];
    /**
     * Cross-venture resource sharing recommendations
     */
    resource_sharing_opportunities?: {
      opportunity_id?: string;
      ventures_involved?: string[];
      resource_type?: "infrastructure" | "expertise" | "tools";
      description?: string;
      estimated_monthly_savings?: number;
      implementation_complexity?: "low" | "medium" | "high";
      implementation_cost?: number;
      payback_period_months?: number;
      /**
       * Risk of codependency creation
       */
      dependency_risk?: "low" | "medium" | "high";
      [k: string]: unknown;
    }[];
    /**
     * Portfolio-level impact of allocation decision
     */
    portfolio_impact_summary: {
      /**
       * Current total monthly allocation (USD)
       */
      previous_total_allocation?: number;
      /**
       * Proposed total monthly allocation (USD)
       */
      new_total_allocation?: number;
      allocation_delta?: number;
      allocation_delta_percent?: number;
      ventures_increasing_budget?: number;
      ventures_decreasing_budget?: number;
      ventures_frozen?: number;
      /**
       * Average runway across portfolio after allocation
       */
      projected_avg_runway_months?: number;
      /**
       * Top 3 ventures % of allocation after change
       */
      projected_concentration_percent?: number;
      concentration_trend?: "improving" | "stable" | "worsening";
      /**
       * Narrative of expected portfolio impact (e.g., traction improvement, runway extension, risk reduction)
       */
      expected_portfolio_impact?: string;
      portfolio_constraints_met?: {
        max_concentration_met?: boolean;
        min_runway_met?: boolean;
        max_burn_met?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    /**
     * Tactical notes on implementation (e.g., timing dependencies, communication strategy)
     */
    implementation_notes?: string;
    /**
     * Risks created by this allocation and suggested mitigations
     */
    risks_and_mitigations?: {
      risk?: string;
      mitigation?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
