/* eslint-disable */
/* auto-generated from modules/portfolio/state/module-state.schema.json */

/**
 * Persistent state for the portfolio module
 */
export interface PortfolioModuleState {
  /**
   * Current portfolio composition
   */
  portfolio_composition: {
    by_stage?: {
      /**
       * Venture IDs in ideation stage
       */
      ideation?: string[];
      pre_launch?: string[];
      launch?: string[];
      growth?: string[];
      scale?: string[];
      mature?: string[];
      [k: string]: unknown;
    };
    total_active_ventures?: number;
    [k: string]: unknown;
  };
  /**
   * Current resource allocations keyed by venture_id
   */
  current_allocations: {
    [k: string]: {
      budget?: number;
      headcount?: number;
      tools_budget?: number;
      effective_from?: string;
      allocation_id?: string;
      [k: string]: unknown;
    };
  };
  /**
   * Timestamp of last completed review cycle
   */
  last_review_date?: string;
  /**
   * Scheduled timestamp for next review cycle
   */
  next_review_date?: string;
  /**
   * Standard review cycle interval in weeks
   */
  review_cycle_weeks: number;
  /**
   * Sum of all monthly burns
   */
  total_portfolio_burn_monthly: number;
  /**
   * Total monthly recurring revenue
   */
  total_mrr?: number;
  /**
   * Total count of ventures killed
   */
  ventures_killed_count: number;
  /**
   * Total count of ventures scaled
   */
  ventures_scaled_count: number;
  /**
   * Total count of ventures iterated
   */
  ventures_iterated_count?: number;
  /**
   * ID of ongoing review cycle if any
   */
  current_review_cycle_id?: string;
  /**
   * Last update timestamp
   */
  last_updated?: string;
  [k: string]: unknown;
}
