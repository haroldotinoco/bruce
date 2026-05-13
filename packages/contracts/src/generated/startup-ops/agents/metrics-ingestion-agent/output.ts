/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/metrics-ingestion-agent/output.schema.json */

export interface MetricsIngestionOutput {
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
    /**
     * Start of time range for this snapshot
     */
    start: string;
    /**
     * End of time range for this snapshot
     */
    end: string;
    [k: string]: unknown;
  };
  /**
   * Percentage of required metrics successfully collected
   */
  completeness_percent: number;
  /**
   * Status breakdown per data source
   */
  sources_status: {
    [k: string]: {
      /**
       * Overall status of this data source
       */
      status: "success" | "partial" | "failed";
      /**
       * Number of metrics successfully retrieved from this source
       */
      metric_count: number;
      /**
       * Error message if source failed
       */
      error?: string;
      /**
       * When data from this source was last updated
       */
      last_updated?: string;
      [k: string]: unknown;
    };
  };
  metrics: {
    product?: {
      dau?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      wau?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      mau?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      new_signups?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      activation_rate?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      d7_retention?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      d30_retention?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      onboarding_completion_rate?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    revenue?: {
      mrr?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      arr?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      new_mrr?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      churned_mrr?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      mrr_growth_rate?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      customer_count?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      new_customers?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      churned_customers?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    acquisition?: {
      cac?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      /**
       * CAC breakdown by acquisition channel
       */
      cac_by_channel?: {
        [k: string]: number;
      };
      ltv?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      ltv_cac_ratio?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    financial?: {
      burn_rate?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      runway_months?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      gross_margin?: {
        value?: number;
        previous_value?: number;
        deviation_percent?: number;
        deviation_flag?: boolean;
        source?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
