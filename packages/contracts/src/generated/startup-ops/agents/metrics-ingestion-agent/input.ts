/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/metrics-ingestion-agent/input.schema.json */

export interface MetricsIngestionInput {
  /**
   * Unique identifier for the venture
   */
  venture_id: string;
  ingestion_config: {
    /**
     * List of data sources to ingest from
     *
     * @minItems 1
     */
    sources: ["mixpanel" | "stripe" | "amplitude" | "gtm", ...("mixpanel" | "stripe" | "amplitude" | "gtm")[]];
    /**
     * Time range for metric collection
     */
    time_range: "6h" | "24h" | "7d" | "30d";
    /**
     * Whether to include comparison with previous snapshot
     */
    include_historical_comparison?: boolean;
    /**
     * Force fresh API calls, ignore cache
     */
    force_refresh?: boolean;
    [k: string]: unknown;
  };
  /**
   * Reference to previous metric snapshot for comparison and baseline calculation
   */
  last_snapshot_ref?: string;
  /**
   * Venture stage for stage-appropriate metric selection
   */
  stage?: "seed" | "early" | "growth";
  [k: string]: unknown;
}
