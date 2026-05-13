/* eslint-disable */
/* auto-generated from modules/portfolio/agents/risk-monitor/input.schema.json */

/**
 * Portfolio composition and venture metrics for risk analysis
 */
export interface RiskMonitorInput {
  /**
   * All active ventures with financial and dependency data
   *
   * @minItems 1
   * @maxItems 100
   */
  portfolio_composition: [
    {
      venture_id: string;
      name: string;
      /**
       * Industry vertical
       */
      sector: string;
      /**
       * MRR or ARR/12 in USD
       */
      monthly_revenue: number;
      /**
       * Monthly burn in USD
       */
      monthly_burn_rate: number;
      /**
       * Months of cash remaining
       */
      runway_months: number;
      /**
       * 0-100 health score from analyst
       */
      traction_score?: number;
      /**
       * IDs of other ventures sharing infrastructure
       */
      shared_infrastructure?: string[];
      /**
       * IDs of other ventures with overlapping customer base
       */
      shared_customers?: string[];
      /**
       * IDs of other ventures sharing key team
       */
      shared_team_members?: string[];
      /**
       * Top customer dependency metrics
       */
      customer_concentration?: {
        /**
         * % of revenue from single largest customer
         */
        top_customer_percent?: number;
        /**
         * % of revenue from top 3 customers
         */
        top_3_customer_percent?: number;
        [k: string]: unknown;
      };
      /**
       * External factors affecting venture
       */
      market_factors?: {
        /**
         * Primary geographies (e.g., US, EU, APAC)
         */
        geographic_concentration?: string[];
        /**
         * Subject to regulatory headwinds
         */
        regulatory_risk?: boolean;
        /**
         * Sensitivity to economic downturns
         */
        economic_sensitivity?: "low" | "medium" | "high";
        [k: string]: unknown;
      };
      [k: string]: unknown;
    },
    ...{
      venture_id: string;
      name: string;
      /**
       * Industry vertical
       */
      sector: string;
      /**
       * MRR or ARR/12 in USD
       */
      monthly_revenue: number;
      /**
       * Monthly burn in USD
       */
      monthly_burn_rate: number;
      /**
       * Months of cash remaining
       */
      runway_months: number;
      /**
       * 0-100 health score from analyst
       */
      traction_score?: number;
      /**
       * IDs of other ventures sharing infrastructure
       */
      shared_infrastructure?: string[];
      /**
       * IDs of other ventures with overlapping customer base
       */
      shared_customers?: string[];
      /**
       * IDs of other ventures sharing key team
       */
      shared_team_members?: string[];
      /**
       * Top customer dependency metrics
       */
      customer_concentration?: {
        /**
         * % of revenue from single largest customer
         */
        top_customer_percent?: number;
        /**
         * % of revenue from top 3 customers
         */
        top_3_customer_percent?: number;
        [k: string]: unknown;
      };
      /**
       * External factors affecting venture
       */
      market_factors?: {
        /**
         * Primary geographies (e.g., US, EU, APAC)
         */
        geographic_concentration?: string[];
        /**
         * Subject to regulatory headwinds
         */
        regulatory_risk?: boolean;
        /**
         * Sensitivity to economic downturns
         */
        economic_sensitivity?: "low" | "medium" | "high";
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[]
  ];
  /**
   * Analysis timeframe
   */
  timeframe: {
    analysis_date?: string;
    /**
     * How far forward to project risks
     */
    projection_months?: number;
    [k: string]: unknown;
  };
  /**
   * Portfolio policy constraints
   */
  portfolio_constraints?: {
    /**
     * Max % revenue allowed in top 3 ventures
     */
    max_concentration_percent?: number;
    /**
     * Minimum acceptable collective runway
     */
    min_portfolio_runway_months?: number;
    /**
     * Portfolio monthly burn limit in USD
     */
    max_burn_rate_monthly?: number;
    [k: string]: unknown;
  };
  /**
   * Specific risk dimensions to emphasize (e.g., ['concentration', 'codependency'])
   */
  analysis_focus?: string[];
  [k: string]: unknown;
}
