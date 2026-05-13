/* eslint-disable */
/* auto-generated from modules/bruce-memory/state/module-state.schema.json */

/**
 * Current state of the bruce-memory module including metrics and health indicators
 */
export interface BruceMemoryModuleState {
  /**
   * Cumulative count of learning records ingested
   */
  total_learnings_stored?: number;
  /**
   * Cumulative count of unique patterns extracted
   */
  total_patterns_extracted?: number;
  /**
   * Current count of active (non-retired, non-contradicted) patterns
   */
  total_patterns_active?: number;
  /**
   * When pattern extraction last ran successfully
   */
  last_extraction_timestamp?: string;
  /**
   * When intelligence synthesis last ran successfully
   */
  last_synthesis_timestamp?: string;
  /**
   * Health of vector database index
   */
  vector_index_status?: "healthy" | "rebuilding" | "stale";
  pattern_confidence_distribution?: {
    /**
     * Count of patterns with confidence 0.4-0.59
     */
    low?: number;
    /**
     * Count of patterns with confidence 0.6-0.79
     */
    medium?: number;
    /**
     * Count of patterns with confidence 0.8-1.0
     */
    high?: number;
    [k: string]: unknown;
  };
  /**
   * ID of most recent intelligence snapshot
   */
  last_snapshot_id?: string;
  [k: string]: unknown;
}
