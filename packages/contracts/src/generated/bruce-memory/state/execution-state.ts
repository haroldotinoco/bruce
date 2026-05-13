/* eslint-disable */
/* auto-generated from modules/bruce-memory/state/execution-state.schema.json */

/**
 * Runtime execution state for in-progress or recently completed operations
 */
export interface BruceMemoryExecutionState {
  /**
   * ID of currently running extraction job, if any
   */
  current_extraction_job_id?: string | null;
  /**
   * Current status of extraction pipeline
   */
  extraction_status?: "idle" | "running" | "failed";
  /**
   * Number of learnings processed in current extraction cycle
   */
  learnings_processed_this_cycle?: number;
  /**
   * Number of new patterns created in current extraction cycle
   */
  patterns_added_this_cycle?: number;
  /**
   * Number of existing patterns updated in current extraction cycle
   */
  patterns_updated_this_cycle?: number;
  /**
   * Number of on-demand queries currently in queue
   */
  current_query_queue_length?: number;
  /**
   * List of active query IDs being processed
   */
  active_queries?: string[];
  [k: string]: unknown;
}
