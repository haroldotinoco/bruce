/* eslint-disable */
/* auto-generated from modules/portfolio/agents/risk-monitor/output.schema.json */

/**
 * Portfolio-level risk assessment with dimensioned analysis and mitigation strategies
 */
export interface RiskMonitorOutput {
  portfolio_risk_assessment: {
    analysis_date: string;
    /**
     * Composite portfolio risk (higher = more risk)
     */
    overall_risk_score: number;
    /**
     * Overall risk rating
     */
    risk_rating: "low" | "medium" | "high" | "critical";
    /**
     * Risk scores by dimension
     */
    risk_dimensions: {
      concentration_risk_score?: number;
      burn_rate_risk_score?: number;
      runway_distribution_risk_score?: number;
      codependency_risk_score?: number;
      market_correlation_risk_score?: number;
      [k: string]: unknown;
    };
    /**
     * Concentration of revenue and traction
     */
    concentration_analysis?: {
      /**
       * % of portfolio revenue/traction in top 3
       */
      top_3_ventures_percent?: number;
      top_3_ventures?: {
        venture_id?: string;
        name?: string;
        percentage?: number;
        [k: string]: unknown;
      }[];
      /**
       * Is concentration acceptable?
       */
      concentration_risk?: "low" | "medium" | "high";
      /**
       * Max allowed per policy
       */
      concentration_threshold?: number;
      /**
       * Impact if top venture fails (e.g., portfolio burn increases 15% or portfolio runway reduced by 1 month)
       */
      single_venture_failure_impact?: string;
      [k: string]: unknown;
    };
    /**
     * Portfolio burn rate analysis
     */
    burn_dynamics?: {
      /**
       * Total portfolio monthly burn in USD
       */
      total_monthly_burn?: number;
      /**
       * Total portfolio monthly revenue in USD
       */
      total_monthly_revenue?: number;
      /**
       * Monthly burn minus revenue in USD
       */
      net_burn?: number;
      /**
       * Direction of burn rate over last 3 months
       */
      burn_trend?: "increasing" | "stable" | "decreasing";
      /**
       * % change in burn over last 3 months
       */
      burn_trend_percent?: number;
      /**
       * Ventures burning >25% of portfolio total
       */
      ventures_exceeding_burn_budget?: {
        venture_id?: string;
        name?: string;
        burn_percent?: number;
        [k: string]: unknown;
      }[];
      /**
       * Is burn sustainable?
       */
      burn_risk_status?: "healthy" | "monitor" | "high";
      [k: string]: unknown;
    };
    /**
     * Portfolio runway statistics
     */
    runway_distribution?: {
      median_runway_months?: number;
      /**
       * Venture with least runway
       */
      min_runway_months?: number;
      max_runway_months?: number;
      /**
       * Ventures with runway <6 months requiring action
       */
      ventures_under_6_months?: {
        venture_id?: string;
        name?: string;
        runway_months?: number;
        critical_date?: string;
        [k: string]: unknown;
      }[];
      /**
       * Are 2+ ventures depleting in same month?
       */
      runway_cliff_alert?: boolean;
      /**
       * Timing and ventures involved in runway cliff
       */
      runway_cliff_details?: string;
      [k: string]: unknown;
    };
    /**
     * Inter-venture dependencies and single points of failure
     */
    codependency_analysis?: {
      /**
       * Risk edges in dependency graph
       */
      dependency_graph?: {
        venture_a?: string;
        venture_b?: string;
        /**
         * Type of dependency
         */
        dependency_type?: "infrastructure" | "customers" | "team";
        risk_level?: "low" | "medium" | "high";
        /**
         * What happens to venture B if A fails
         */
        failure_impact?: string;
        [k: string]: unknown;
      }[];
      single_points_of_failure?: {
        /**
         * Infrastructure, team member, or shared component
         */
        entity?: string;
        affects_ventures?: string[];
        risk_level?: "medium" | "high";
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    };
    /**
     * Market-level risk factors
     */
    market_correlation_analysis?: {
      /**
       * Ventures by sector and vulnerability
       */
      sector_concentration?: {
        sector?: string;
        venture_count?: number;
        revenue_percent?: number;
        /**
         * Common external risk factors
         */
        shared_risk?: string;
        [k: string]: unknown;
      }[];
      /**
       * Portfolio exposure to geographies
       */
      geographic_concentration?: {
        primary_geographies?: {
          geography?: string;
          venture_count?: number;
          revenue_percent?: number;
          [k: string]: unknown;
        }[];
        [k: string]: unknown;
      };
      /**
       * Scenarios where multiple ventures are affected
       *
       * @maxItems 3
       */
      correlated_shock_scenarios?:
        | []
        | [
            {
              scenario_name?: string;
              affected_ventures?: string[];
              impact_description?: string;
              revenue_impact_percent?: number;
              [k: string]: unknown;
            }
          ]
        | [
            {
              scenario_name?: string;
              affected_ventures?: string[];
              impact_description?: string;
              revenue_impact_percent?: number;
              [k: string]: unknown;
            },
            {
              scenario_name?: string;
              affected_ventures?: string[];
              impact_description?: string;
              revenue_impact_percent?: number;
              [k: string]: unknown;
            }
          ]
        | [
            {
              scenario_name?: string;
              affected_ventures?: string[];
              impact_description?: string;
              revenue_impact_percent?: number;
              [k: string]: unknown;
            },
            {
              scenario_name?: string;
              affected_ventures?: string[];
              impact_description?: string;
              revenue_impact_percent?: number;
              [k: string]: unknown;
            },
            {
              scenario_name?: string;
              affected_ventures?: string[];
              impact_description?: string;
              revenue_impact_percent?: number;
              [k: string]: unknown;
            }
          ];
      [k: string]: unknown;
    };
    /**
     * Prioritized list of risk mitigation actions
     */
    mitigation_recommendations?: {
      rank?: number;
      risk_addressed?: string;
      recommendation?: string;
      /**
       * How much risk this reduces
       */
      impact?: string;
      urgency?: "immediate" | "within_month" | "within_quarter";
      /**
       * Who should drive this (e.g., allocation-agent, governance-decision-agent)
       */
      owner?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
