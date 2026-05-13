/* eslint-disable */
/* auto-generated from modules/portfolio/state/execution-state.schema.json */

/**
 * Transient execution state for active review cycles and workflows
 */
export interface PortfolioExecutionState {
  /**
   * ID of current review cycle
   */
  review_cycle_id: string;
  /**
   * Current workflow being executed
   */
  workflow_id?: string;
  /**
   * When review cycle started
   */
  started_at: string;
  /**
   * Current step in workflow
   */
  current_step: string;
  /**
   * Status of current step
   */
  step_status?: "not_started" | "in_progress" | "completed" | "failed" | "paused";
  /**
   * Number of ventures analyzed so far
   */
  ventures_analyzed_count: number;
  /**
   * Decisions made in this cycle
   */
  decisions_made: {
    decision_id?: string;
    venture_id?: string;
    decision?: string;
    made_at?: string;
    [k: string]: unknown;
  }[];
  /**
   * Decisions awaiting human confirmation
   */
  pending_human_confirmations?: {
    venture_id?: string;
    venture_name?: string;
    decision_type?: string;
    decision_id?: string;
    requested_at?: string;
    deadline?: string;
    assigned_to?: string;
    [k: string]: unknown;
  }[];
  /**
   * Number of pending confirmations
   */
  pending_confirmations_count?: number;
  /**
   * Status of final report generation
   */
  report_status?: "not_started" | "in_progress" | "completed" | "failed";
  /**
   * ID of generated report if completed
   */
  report_id?: string;
  /**
   * Errors during execution
   */
  errors_encountered?: {
    step?: string;
    error_message?: string;
    timestamp?: string;
    severity?: "warning" | "error" | "critical";
    [k: string]: unknown;
  }[];
  /**
   * Estimated time for cycle completion
   */
  expected_completion_time?: string;
  [k: string]: unknown;
}
