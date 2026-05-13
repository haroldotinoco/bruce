/* eslint-disable */
/* auto-generated from modules/portfolio/contracts/allocation-decision.schema.json */

/**
 * Resource allocation decision for a venture
 */
export interface AllocationDecision {
  /**
   * Unique identifier for this allocation decision
   */
  allocation_id: string;
  /**
   * Reference to related governance decision
   */
  decision_id?: string;
  /**
   * Venture receiving allocation
   */
  venture_id: string;
  /**
   * Name of venture for reference
   */
  venture_name: string;
  /**
   * Current resource allocation
   */
  current_allocation: {
    /**
     * Monthly budget in USD
     */
    budget: number;
    /**
     * Full-time equivalent headcount
     */
    headcount: number;
    /**
     * Tools/software budget in USD per month
     */
    tools_budget?: number;
    [k: string]: unknown;
  };
  /**
   * Recommended resource allocation
   */
  recommended_allocation: {
    /**
     * Recommended monthly budget in USD
     */
    budget: number;
    /**
     * Recommended full-time equivalent headcount
     */
    headcount: number;
    /**
     * Recommended tools/software budget in USD per month
     */
    tools_budget?: number;
    [k: string]: unknown;
  };
  /**
   * Change in budget (recommended - current)
   */
  budget_delta: number;
  /**
   * Percentage change in budget
   */
  budget_delta_pct?: number;
  /**
   * Change in headcount (recommended - current)
   */
  headcount_delta: number;
  /**
   * Explanation for allocation recommendation
   */
  rationale: string;
  /**
   * Confidence score in this allocation decision
   */
  confidence: number;
  /**
   * Date when allocation becomes effective
   */
  effective_date: string;
  /**
   * Timestamp of decision
   */
  decision_made_at: string;
  /**
   * List of constraints that affected this decision
   */
  constraints_applied?: string[];
  [k: string]: unknown;
}
