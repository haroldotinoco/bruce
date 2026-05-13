/* eslint-disable */
/* auto-generated from modules/bruce-core/state/execution-state.schema.json */

/**
 * Ephemeral state during workflow execution - cleared after workflow completes
 */
export interface ExecutionStateSchema {
  /**
   * Active workflow being executed
   */
  current_workflow_id?: string;
  /**
   * Type of workflow
   */
  current_workflow_type?: "venture-onboarding" | "module-dispatch" | "gate-evaluation" | "portfolio-review";
  current_step?: {
    step_id?: string;
    step_name?: string;
    start_time?: string;
    status?: "pending" | "in_progress" | "completed" | "failed";
    [k: string]: unknown;
  };
  /**
   * Venture being processed (if applicable)
   */
  venture_id?: string;
  /**
   * Human decisions awaiting response
   */
  pending_human_approvals?: {
    escalation_id?: string;
    escalation_type?: string;
    required_by?: string;
    context?: string;
    venture_id?: string;
    [k: string]: unknown;
  }[];
  /**
   * Modules currently executing
   */
  in_flight_module_calls?: {
    module_name?: string;
    dispatch_batch_id?: string;
    start_time?: string;
    timeout_at?: string;
    status?: string;
    [k: string]: unknown;
  }[];
  /**
   * Retry count per module/step
   */
  retry_counts?: {
    [k: string]: number;
  };
  workflow_start_time?: string;
  estimated_completion_time?: string;
  [k: string]: unknown;
}
