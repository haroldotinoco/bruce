/* eslint-disable */
/* auto-generated from modules/gtm/contracts/traction-report.schema.json */

/**
 * Weekly traction report with performance metrics across all channels
 */
export interface TractionReport {
  /**
   * Unique report identifier
   */
  report_id: string;
  venture_id: string;
  period: {
    start_date?: string;
    end_date?: string;
    /**
     * Week number since product launch
     */
    report_week?: number;
    [k: string]: unknown;
  };
  channels: {
    channel?: string;
    impressions?: number;
    clicks?: number;
    click_through_rate?: number;
    signups?: number;
    activations?: number;
    activation_rate?: number;
    revenue?: number;
    spend?: number;
    /**
     * Cost per acquisition
     */
    cac?: number;
    /**
     * Overall visitor to paying customer
     */
    conversion_rate?: number;
    roi?: number;
    [k: string]: unknown;
  }[];
  totals: {
    total_impressions?: number;
    total_clicks?: number;
    total_signups?: number;
    total_activations?: number;
    total_paying_users?: number;
    total_revenue?: number;
    total_spend?: number;
    overall_cac?: number;
    overall_conversion_rate?: number;
    [k: string]: unknown;
  };
  trends?: {
    week_over_week_signups_growth?: number;
    week_over_week_revenue_growth?: number;
    best_performing_channel?: string;
    worst_performing_channel?: string;
    cac_trend?: "increasing" | "decreasing" | "stable";
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
