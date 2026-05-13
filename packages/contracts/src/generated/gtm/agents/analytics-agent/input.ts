/* eslint-disable */
/* auto-generated from modules/gtm/agents/analytics-agent/input.schema.json */

/**
 * Campaign performance data for analysis and interpretation
 */
export interface AnalyticsAgentInput {
  /**
   * Campaign identifier
   */
  campaign_id: string;
  campaign_context?: {
    name?: string;
    channel?: string;
    target_value?: number;
    budget?: number;
    launch_date?: string;
    data_collection_date?: string;
    [k: string]: unknown;
  };
  success_metric: {
    /**
     * Metric name (e.g., 'cost_per_lead')
     */
    name: string;
    /**
     * Target value for success
     */
    target: number;
    /**
     * Unit of measurement (e.g., '$', '%', 'count')
     */
    unit?: string;
    [k: string]: unknown;
  };
  performance_data: {
    overall: {
      impressions?: number;
      clicks?: number;
      conversions?: number;
      spend_usd?: number;
      ctr_percent?: number;
      conversion_rate_percent?: number;
      cost_per_conversion?: number;
      roas?: number;
      [k: string]: unknown;
    };
    /**
     * Performance breakdown by test variant (control, variant_1, etc.)
     */
    by_variant?: {
      [k: string]: {
        impressions?: number;
        clicks?: number;
        conversions?: number;
        spend_usd?: number;
        [k: string]: unknown;
      };
    };
    /**
     * Performance by audience segment
     */
    by_audience_segment?: {
      [k: string]: {
        impressions?: number;
        clicks?: number;
        conversions?: number;
        [k: string]: unknown;
      };
    };
    /**
     * Daily performance data for trend analysis
     */
    time_series?: {
      date?: string;
      impressions?: number;
      clicks?: number;
      conversions?: number;
      spend_usd?: number;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * Historical data for comparison
   */
  historical_benchmarks?: {
    previous_campaign_ctr?: number;
    previous_campaign_conversion_rate?: number;
    previous_campaign_cpc?: number;
    platform_average_ctr?: number;
    industry_average_cpc?: number;
    [k: string]: unknown;
  };
  external_context?: {
    /**
     * Platform algorithm or policy changes during campaign
     */
    platform_updates?: string[];
    /**
     * External events that may affect campaign (e.g., 'competitor price drop', 'media coverage')
     */
    market_events?: string[];
    /**
     * Any tracking or platform issues
     */
    technical_issues?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
