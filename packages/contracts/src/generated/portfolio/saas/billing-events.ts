/* eslint-disable */
/* auto-generated from modules/portfolio/saas/billing-events.schema.json */

/**
 * Event schemas for Portfolio governance module billing and usage tracking
 */
export interface PortfolioModuleBillingEventsSchema {
  /**
   * Fired when a portfolio review cycle completes
   */
  "portfolio.review.completed"?: {
    /**
     * Unique event identifier
     */
    event_id: string;
    event_type?: "portfolio.review.completed";
    /**
     * Account that performed the review
     */
    account_id: string;
    /**
     * Billing plan tier at time of review
     */
    plan_tier?: "pro" | "enterprise";
    /**
     * Review identifier
     */
    review_id: string;
    /**
     * Cycle number within account
     */
    review_cycle_number?: number;
    /**
     * Number of ventures in portfolio reviewed
     */
    ventures_analyzed: number;
    /**
     * List of agents that participated in review
     */
    agents_used?: string[];
    /**
     * Total review execution time in seconds
     */
    duration_seconds?: number;
    timestamp: string;
    /**
     * Whether review counts toward monthly limit
     */
    billable?: boolean;
    [k: string]: unknown;
  };
  /**
   * Fired when a governance decision is recorded (scale, iterate, pause, kill)
   */
  "portfolio.decision.made"?: {
    event_id: string;
    event_type?: "portfolio.decision.made";
    account_id: string;
    decision_id: string;
    /**
     * Type of governance decision
     */
    decision_type: "scale" | "iterate" | "pause" | "kill";
    venture_id?: string;
    venture_name?: string;
    review_id?: string;
    confidence_score?: number;
    /**
     * Agent or user that recorded the decision
     */
    recorded_by?: string;
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Fired when a venture receives a kill decision and is removed from active portfolio
   */
  "portfolio.venture.killed"?: {
    event_id: string;
    event_type?: "portfolio.venture.killed";
    account_id: string;
    venture_id: string;
    venture_name?: string;
    /**
     * Decision that triggered the kill
     */
    decision_id?: string;
    /**
     * Total capital invested in venture
     */
    funding_deployed?: number;
    final_health_score?: number;
    /**
     * Governance reason for kill decision
     */
    kill_reason?: string;
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Fired when a venture receives a scale decision and resource allocation increases
   */
  "portfolio.venture.scaled"?: {
    event_id: string;
    event_type?: "portfolio.venture.scaled";
    account_id: string;
    venture_id: string;
    venture_name?: string;
    decision_id?: string;
    previous_allocation_percent?: number;
    new_allocation_percent?: number;
    /**
     * Percentage point increase in allocation
     */
    allocation_increase_percent?: number;
    health_score?: number;
    market_traction?: number;
    /**
     * Governance reason for scale decision
     */
    scale_reason?: string;
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Fired when a governance report is generated and distributed
   */
  "portfolio.report.generated"?: {
    event_id: string;
    event_type?: "portfolio.report.generated";
    account_id: string;
    report_id: string;
    /**
     * Associated review identifier
     */
    review_id?: string;
    /**
     * Report format generated
     */
    format?: "json" | "pdf" | "email";
    /**
     * Number of recipients who received the report
     */
    recipients_count?: number;
    /**
     * Pages in generated report (if PDF)
     */
    page_count?: number;
    /**
     * Number of ventures covered in report
     */
    venturesincluded?: number;
    /**
     * Agent or user that triggered generation
     */
    generated_by?: string;
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Fired when resource allocation plan is computed or manually adjusted
   */
  "portfolio.allocation.updated"?: {
    event_id: string;
    event_type?: "portfolio.allocation.updated";
    account_id: string;
    allocation_id: string;
    review_id?: string;
    /**
     * Model used to compute allocation
     */
    allocation_model?: "linear" | "risk-weighted" | "market-fit-weighted" | "custom";
    /**
     * Whether allocation was computed or manually adjusted
     */
    update_type?: "automated" | "manual_override";
    /**
     * Number of ventures with allocation changes
     */
    ventures_affected?: number;
    /**
     * Sum of absolute percentage changes
     */
    total_rebalanced_percent?: number;
    /**
     * Largest single venture allocation change
     */
    max_single_change_percent?: number;
    /**
     * Reason for manual override (if applicable)
     */
    override_reason?: string;
    /**
     * Agent or user that triggered the update
     */
    updated_by?: string;
    timestamp: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
