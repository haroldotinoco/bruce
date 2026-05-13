/* eslint-disable */
/* auto-generated from modules/portfolio/contracts/kill-record.schema.json */

/**
 * Record of a venture that was killed, for learning extraction and historical reference
 */
export interface KillRecord {
  /**
   * Unique identifier for this kill record
   */
  kill_id: string;
  /**
   * Venture that was killed
   */
  venture_id: string;
  /**
   * Name of the venture
   */
  venture_name: string;
  /**
   * Timestamp when venture was officially killed
   */
  killed_at: string;
  /**
   * Number of weeks from launch to kill
   */
  weeks_lived: number;
  /**
   * Reference to the governance decision that led to kill
   */
  decision_id?: string;
  /**
   * Best metrics venture achieved during its lifetime
   */
  peak_metrics?: {
    /**
     * Peak monthly recurring revenue
     */
    mrr?: number;
    /**
     * Week at which peak MRR was achieved
     */
    mrr_achieved_week?: number;
    /**
     * Peak daily active users
     */
    dau?: number;
    /**
     * Week at which peak DAU was achieved
     */
    dau_achieved_week?: number;
    /**
     * Peak total registered users
     */
    users?: number;
    [k: string]: unknown;
  };
  /**
   * Primary reason for kill decision
   */
  kill_reason:
    | "no_traction"
    | "unit_economics_broken"
    | "hypothesis_disproven"
    | "market_blocked"
    | "burn_unsustainable"
    | "founder_attrition"
    | "other";
  /**
   * Detailed explanations of kill reasons
   */
  kill_reason_details?: {
    /**
     * Insufficient user adoption or revenue growth after sufficient time
     */
    no_traction?: {
      [k: string]: unknown;
    };
    /**
     * CAC/LTV ratio unsustainable or declining
     */
    unit_economics_broken?: {
      [k: string]: unknown;
    };
    /**
     * Core product hypothesis found to be false
     */
    hypothesis_disproven?: {
      [k: string]: unknown;
    };
    /**
     * Regulatory, technical, or competitive barrier prevents success
     */
    market_blocked?: {
      [k: string]: unknown;
    };
    /**
     * Burn rate incompatible with runway and no funding path
     */
    burn_unsustainable?: {
      [k: string]: unknown;
    };
    /**
     * Key founder(s) leaving the venture
     */
    founder_attrition?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Comprehensive narrative explaining why venture was killed
   */
  detailed_rationale: string;
  /**
   * Final state of venture at time of kill
   */
  final_metrics?: {
    mrr?: number;
    dau?: number;
    users?: number;
    monthly_burn?: number;
    runway_months?: number;
    team_size?: number;
    [k: string]: unknown;
  };
  /**
   * Key learnings from the venture failure
   */
  learnings_extracted: string[];
  /**
   * References to learning records created from this kill
   */
  learning_record_refs?: string[];
  /**
   * Impact on customers/users
   */
  customer_impact?: {
    /**
     * Number of active paying customers
     */
    active_customers?: number;
    /**
     * Action taken for customers
     */
    action_taken?: "refunded" | "migrated" | "open_sourced" | "other";
    /**
     * Details of customer impact and action
     */
    details?: string;
    [k: string]: unknown;
  };
  /**
   * Reference to detailed post-mortem document if exists
   */
  post_mortem_document?: string;
  /**
   * Person/system that confirmed kill decision
   */
  killed_by?: string;
  [k: string]: unknown;
}
