/* eslint-disable */
/* auto-generated from modules/gtm/contracts/gtm-decision.schema.json */

/**
 * Weekly governance decision on channel continuation, scaling, pausing, or killing
 */
export interface GTMDecision {
  /**
   * Unique decision identifier
   */
  decision_id: string;
  venture_id: string;
  /**
   * Week ending date
   */
  period: string;
  decisions: {
    channel: string;
    current_status?: "active" | "paused" | "testing" | "killed";
    /**
     * Action to take on this channel
     */
    decision: "continue" | "scale" | "pause" | "kill" | "test";
    /**
     * Why this decision was made
     */
    rationale: string;
    /**
     * Budget change in dollars (positive = increase, negative = decrease)
     */
    budget_delta?: number;
    /**
     * Expected impact of this decision
     */
    expected_impact?: string;
    [k: string]: unknown;
  }[];
  /**
   * Overall GTM health status
   */
  overall_status: "on_track" | "needs_attention" | "critical";
  /**
   * Key insights from analysis
   */
  key_findings?: string[];
  /**
   * Next governance review date
   */
  next_review_date?: string;
  /**
   * Suggested growth experiments for next period
   */
  recommended_experiments?: {
    experiment_name?: string;
    hypothesis?: string;
    channel?: string;
    budget?: number;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
