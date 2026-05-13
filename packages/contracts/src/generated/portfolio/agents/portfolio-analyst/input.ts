/* eslint-disable */
/* auto-generated from modules/portfolio/agents/portfolio-analyst/input.schema.json */

/**
 * Health reports from all active ventures for comparative analysis
 */
export interface PortfolioAnalystInput {
  /**
   * Unique identifier for this review cycle (e.g., 2026-Q2-review-001)
   */
  review_cycle_id: string;
  /**
   * When this review cycle was initiated
   */
  review_timestamp?: string;
  /**
   * Array of venture health reports
   *
   * @minItems 1
   * @maxItems 100
   */
  ventures: [
    {
      /**
       * Unique venture identifier
       */
      venture_id: string;
      /**
       * Venture name
       */
      name: string;
      /**
       * Current venture status
       */
      status: "active" | "paused" | "in_review";
      /**
       * Weeks since venture launch
       */
      weeks_since_launch?: number;
      /**
       * Detailed health metrics
       */
      health_report: {
        /**
         * Date health report was generated
         */
        report_date: string;
        /**
         * Core health metrics
         */
        metrics: {
          /**
           * Growth and adoption metrics
           */
          traction?: {
            /**
             * Monthly recurring revenue in USD
             */
            mrr?: number;
            /**
             * Annual recurring revenue in USD
             */
            arr?: number;
            /**
             * Month-over-month growth rate (0-1 scale)
             */
            monthly_growth_rate?: number;
            /**
             * Current active users/customers
             */
            active_users?: number;
            /**
             * Month-over-month user growth rate
             */
            user_growth_rate?: number;
            /**
             * Free-to-paid or visitor-to-customer conversion (0-1 scale)
             */
            conversion_rate?: number;
            /**
             * Net Promoter Score
             */
            nps?: number;
            [k: string]: unknown;
          };
          /**
           * Financial health
           */
          financial?: {
            /**
             * Months of runway at current burn rate
             */
            runway_months?: number;
            /**
             * Monthly burn in USD (expenses - revenue)
             */
            monthly_burn_rate?: number;
            /**
             * Total cash available in USD
             */
            cash_position?: number;
            /**
             * Customer acquisition cost in USD
             */
            cac?: number;
            /**
             * Customer lifetime value in USD
             */
            ltv?: number;
            /**
             * CAC to LTV ratio (ideal: <0.3)
             */
            cac_ltv_ratio?: number;
            [k: string]: unknown;
          };
          /**
           * Team and operational health
           */
          team?: {
            /**
             * Current team size
             */
            headcount?: number;
            /**
             * Planned headcount for next quarter
             */
            headcount_planned?: number;
            /**
             * Number of critical roles filled
             */
            key_hires_filled?: number;
            /**
             * Number of critical open roles
             */
            key_hires_open?: number;
            /**
             * Current team momentum
             */
            team_velocity?: "accelerating" | "steady" | "decelerating";
            [k: string]: unknown;
          };
          /**
           * Market validation signals
           */
          market?: {
            /**
             * TAM estimate in USD
             */
            total_addressable_market?: number;
            /**
             * Estimated market share (0-100)
             */
            market_share_percent?: number;
            /**
             * Number of direct competitors
             */
            competitor_count?: number;
            /**
             * Summary of recent customer feedback
             */
            customer_feedback?: string;
            [k: string]: unknown;
          };
          [k: string]: unknown;
        };
        [k: string]: unknown;
      };
      /**
       * Additional context
       */
      context?: {
        /**
         * Industry vertical
         */
        sector?: string;
        /**
         * Venture stage
         */
        stage?: "pre-launch" | "early" | "growth" | "mature";
        /**
         * Health score from previous review
         */
        previous_health_score?: number;
        /**
         * Any flagged concerns from previous period
         */
        flags?: string[];
        [k: string]: unknown;
      };
      [k: string]: unknown;
    },
    ...{
      /**
       * Unique venture identifier
       */
      venture_id: string;
      /**
       * Venture name
       */
      name: string;
      /**
       * Current venture status
       */
      status: "active" | "paused" | "in_review";
      /**
       * Weeks since venture launch
       */
      weeks_since_launch?: number;
      /**
       * Detailed health metrics
       */
      health_report: {
        /**
         * Date health report was generated
         */
        report_date: string;
        /**
         * Core health metrics
         */
        metrics: {
          /**
           * Growth and adoption metrics
           */
          traction?: {
            /**
             * Monthly recurring revenue in USD
             */
            mrr?: number;
            /**
             * Annual recurring revenue in USD
             */
            arr?: number;
            /**
             * Month-over-month growth rate (0-1 scale)
             */
            monthly_growth_rate?: number;
            /**
             * Current active users/customers
             */
            active_users?: number;
            /**
             * Month-over-month user growth rate
             */
            user_growth_rate?: number;
            /**
             * Free-to-paid or visitor-to-customer conversion (0-1 scale)
             */
            conversion_rate?: number;
            /**
             * Net Promoter Score
             */
            nps?: number;
            [k: string]: unknown;
          };
          /**
           * Financial health
           */
          financial?: {
            /**
             * Months of runway at current burn rate
             */
            runway_months?: number;
            /**
             * Monthly burn in USD (expenses - revenue)
             */
            monthly_burn_rate?: number;
            /**
             * Total cash available in USD
             */
            cash_position?: number;
            /**
             * Customer acquisition cost in USD
             */
            cac?: number;
            /**
             * Customer lifetime value in USD
             */
            ltv?: number;
            /**
             * CAC to LTV ratio (ideal: <0.3)
             */
            cac_ltv_ratio?: number;
            [k: string]: unknown;
          };
          /**
           * Team and operational health
           */
          team?: {
            /**
             * Current team size
             */
            headcount?: number;
            /**
             * Planned headcount for next quarter
             */
            headcount_planned?: number;
            /**
             * Number of critical roles filled
             */
            key_hires_filled?: number;
            /**
             * Number of critical open roles
             */
            key_hires_open?: number;
            /**
             * Current team momentum
             */
            team_velocity?: "accelerating" | "steady" | "decelerating";
            [k: string]: unknown;
          };
          /**
           * Market validation signals
           */
          market?: {
            /**
             * TAM estimate in USD
             */
            total_addressable_market?: number;
            /**
             * Estimated market share (0-100)
             */
            market_share_percent?: number;
            /**
             * Number of direct competitors
             */
            competitor_count?: number;
            /**
             * Summary of recent customer feedback
             */
            customer_feedback?: string;
            [k: string]: unknown;
          };
          [k: string]: unknown;
        };
        [k: string]: unknown;
      };
      /**
       * Additional context
       */
      context?: {
        /**
         * Industry vertical
         */
        sector?: string;
        /**
         * Venture stage
         */
        stage?: "pre-launch" | "early" | "growth" | "mature";
        /**
         * Health score from previous review
         */
        previous_health_score?: number;
        /**
         * Any flagged concerns from previous period
         */
        flags?: string[];
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[]
  ];
  /**
   * Optional parameters for analysis
   */
  analysis_scope?: {
    /**
     * Specific areas to focus analysis (e.g., ['unit_economics', 'team_health'])
     */
    focus_areas?: string[];
    /**
     * Venture IDs to exclude from comparison
     */
    exclude_ventures?: string[];
    /**
     * Whether to perform cross-venture pattern analysis
     */
    include_pattern_analysis?: boolean;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
