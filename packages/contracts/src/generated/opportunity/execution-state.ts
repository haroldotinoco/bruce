/* eslint-disable */
/* auto-generated from modules/opportunity/execution-state.schema.json */

/**
 * Runtime state tracking active processing in the opportunity module
 */
export interface OpportunityModuleExecutionState {
  current_scan?: {
    scan_id?: string;
    start_time?: string;
    status?: "scanning" | "analyzing" | "scoring" | "prioritizing" | "complete";
    /**
     * Opportunity IDs currently being processed
     */
    opportunities_in_progress?: string[];
    [k: string]: unknown;
  };
  /**
   * Opportunities that have been scored, waiting for prioritization
   */
  scored_queue?: {
    opportunity_id?: string;
    score?: number;
    scored_timestamp?: string;
    advancement_eligible?: boolean;
    [k: string]: unknown;
  }[];
  processing_errors?: {
    opportunity_id?: string;
    error_message?: string;
    agent_id?: string;
    timestamp?: string;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
