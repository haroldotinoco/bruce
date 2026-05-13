/* eslint-disable */
/* auto-generated from modules/startup-ops/state/execution-state.schema.json */

/**
 * Per-workflow execution state tracking
 */
export interface ExecutionState {
  execution_id?: string;
  workflow_name?: string;
  venture_id?: string;
  started_at?: string;
  completed_at?: string | null;
  status?: "pending" | "running" | "completed" | "failed";
  steps?: {
    step_name?: string;
    agent?: string;
    status?: "pending" | "running" | "completed" | "failed";
    started_at?: string | null;
    completed_at?: string | null;
    duration_ms?: number;
    output_ref?: string | null;
    error?: string | null;
    [k: string]: unknown;
  }[];
  total_duration_ms?: number;
  [k: string]: unknown;
}
