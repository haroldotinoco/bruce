/* eslint-disable */
/* auto-generated from modules/portfolio/contracts/venture-decision.schema.json */

/**
 * Governance decision on venture trajectory (scale, iterate, pause, kill, continue)
 */
export interface VentureDecision {
  /**
   * Unique identifier for this decision
   */
  decision_id: string;
  /**
   * Venture being decided on
   */
  venture_id: string;
  /**
   * Venture name for reference
   */
  venture_name: string;
  /**
   * The governance decision
   */
  decision: "scale" | "iterate" | "pause" | "kill" | "continue";
  /**
   * Details of each decision type
   */
  decision_enum_details?: {
    /**
     * Venture is performing well and should increase investment, team, and resources
     */
    scale?: {
      [k: string]: unknown;
    };
    /**
     * Venture shows some traction but needs pivots; continue with current resources while implementing changes
     */
    iterate?: {
      [k: string]: unknown;
    };
    /**
     * External blocker or market timing issue; pause work but maintain skeleton crew; revisit in 30-90 days
     */
    pause?: {
      [k: string]: unknown;
    };
    /**
     * No viable path to success; shut down operations and extract learnings
     */
    kill?: {
      [k: string]: unknown;
    };
    /**
     * Venture is on track; maintain current trajectory and resources
     */
    continue?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Detailed explanation for the decision
   */
  rationale: string;
  /**
   * Confidence level in this decision (0-100)
   */
  confidence_score: number;
  /**
   * References to data supporting this decision
   */
  supporting_data_refs?: string[];
  /**
   * Key metrics that influenced the decision
   */
  key_metrics_considered?: {
    mrr?: number;
    mrr_growth_pct?: number;
    dau?: number;
    retention_d30?: number;
    unit_economics_ltv_cac_ratio?: number;
    cac?: number;
    ltv?: number;
    burn_rate?: number;
    runway_months?: number;
    [k: string]: unknown;
  };
  /**
   * Milestones venture should hit before next review
   */
  milestones_for_next_period?: {
    milestone?: string;
    target_date?: string;
    success_criteria?: string;
    [k: string]: unknown;
  }[];
  /**
   * Date of next portfolio review
   */
  next_review_date: string;
  /**
   * Who made the decision
   */
  decided_by: "human" | "autonomous";
  /**
   * If autonomous, which agent made the decision
   */
  decided_by_agent?: string;
  /**
   * Timestamp when decision was made
   */
  decided_at: string;
  /**
   * Human confirmation record (if required)
   */
  human_confirmation?: {
    required?: boolean;
    confirmed_at?: string;
    confirmed_by?: string;
    confirmation_notes?: string;
    [k: string]: unknown;
  };
  /**
   * Reference to related allocation decision if applicable
   */
  related_allocation_id?: string;
  [k: string]: unknown;
}
