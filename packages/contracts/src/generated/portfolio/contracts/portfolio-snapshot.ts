/* eslint-disable */
/* auto-generated from modules/portfolio/contracts/portfolio-snapshot.schema.json */

/**
 * Snapshot of entire portfolio state at a point in time
 */
export interface PortfolioSnapshot {
  /**
   * Unique identifier for this snapshot
   */
  snapshot_id: string;
  /**
   * Timestamp when snapshot was created
   */
  created_at: string;
  /**
   * Associated review cycle if part of scheduled cycle
   */
  review_cycle_id?: string;
  /**
   * Array of ventures in portfolio
   */
  ventures: {
    /**
     * Unique venture identifier
     */
    venture_id: string;
    /**
     * Venture name
     */
    name: string;
    /**
     * Current stage of venture
     */
    stage: "ideation" | "pre-launch" | "launch" | "growth" | "scale" | "mature";
    /**
     * Reference to latest health report from startup-ops
     */
    health_report_ref: string;
    health_scores: {
      product_market_fit: number;
      traction: number;
      unit_economics: number;
      team: number;
      runway: number;
      [k: string]: unknown;
    };
    /**
     * Date when venture launched
     */
    launch_date?: string;
    /**
     * Number of weeks since launch
     */
    weeks_live: number;
    /**
     * Monthly burn rate in USD
     */
    burn_rate: number;
    /**
     * Months of runway at current burn rate
     */
    runway_months: number;
    key_metrics: {
      /**
       * Monthly recurring revenue in USD
       */
      mrr?: number;
      /**
       * Daily active users
       */
      dau?: number;
      /**
       * Total registered users
       */
      users?: number;
      /**
       * Month-over-month MRR growth percentage
       */
      mrr_growth_pct?: number;
      /**
       * Day 30 retention rate (0-1)
       */
      retention_d30?: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }[];
  /**
   * Aggregate portfolio metrics
   */
  portfolio_summary: {
    /**
     * Total number of active ventures
     */
    total_ventures: number;
    by_stage: {
      ideation?: number;
      pre_launch?: number;
      launch?: number;
      growth?: number;
      scale?: number;
      mature?: number;
      [k: string]: unknown;
    };
    /**
     * Total monthly burn rate across all ventures
     */
    total_burn: number;
    /**
     * Average runway across active ventures in months
     */
    total_runway_avg: number;
    /**
     * Total monthly recurring revenue
     */
    total_mrr?: number;
    /**
     * Distribution of health scores across portfolio
     */
    health_distribution: {
      /**
       * Count of ventures with health score > 80
       */
      excellent?: number;
      /**
       * Count of ventures with health score 60-80
       */
      good?: number;
      /**
       * Count of ventures with health score 40-60
       */
      fair?: number;
      /**
       * Count of ventures with health score < 40
       */
      at_risk?: number;
      [k: string]: unknown;
    };
    /**
     * Portfolio concentration metrics
     */
    concentration?: {
      /**
       * Percentage of total burn in highest-burn venture
       */
      max_venture_burn_pct?: number;
      /**
       * Percentage of total burn in top 3 ventures
       */
      top_3_ventures_pct?: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
