/* eslint-disable */
/* auto-generated from modules/startup-ops/contracts/metric-snapshot.schema.json */

/**
 * Normalized metric snapshot from multiple data sources with completeness tracking and deviation flagging
 */
export interface MetricSnapshot {
  /**
   * Unique identifier for this metric snapshot
   */
  snapshot_id: string;
  /**
   * Venture this snapshot is for
   */
  venture_id: string;
  /**
   * ISO 8601 timestamp when metrics were collected
   */
  collected_at: string;
  time_range?: {
    start: string;
    end: string;
    [k: string]: unknown;
  };
  /**
   * Percentage of required metrics successfully collected
   */
  completeness_percent: number;
  sources_status: {
    [k: string]: {
      status?: "success" | "partial" | "failed";
      metric_count?: number;
      error?: string | null;
      last_updated?: string;
      [k: string]: unknown;
    };
  };
  metrics: {
    product?: {
      [k: string]: unknown;
    };
    revenue?: {
      [k: string]: unknown;
    };
    acquisition?: {
      [k: string]: unknown;
    };
    financial?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
