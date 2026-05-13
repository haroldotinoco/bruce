/* eslint-disable */
/* auto-generated from modules/gtm/contracts/gtm-strategy.schema.json */

/**
 * Go-to-market strategy with channel selections, budget allocation, and success metrics
 */
export interface GTMStrategy {
  /**
   * Unique identifier for this GTM strategy
   */
  strategy_id: string;
  /**
   * Reference to the venture this strategy supports
   */
  venture_id: string;
  /**
   * When this strategy was developed
   */
  strategy_timestamp: string;
  product_context?: {
    product_name?: string;
    product_stage?: "MVP" | "beta" | "production" | "mature";
    target_market?: string;
    primary_use_case?: string;
    [k: string]: unknown;
  };
  channel_rankings: {
    channel:
      | "paid_search"
      | "paid_social"
      | "organic_social"
      | "content_marketing"
      | "organic_search"
      | "partnerships"
      | "direct_sales"
      | "events"
      | "referral"
      | "email"
      | "influencer"
      | "community";
    rank: number;
    score: number;
    /**
     * Why this channel ranks here
     */
    rationale: string;
    target_audience_fit?: "excellent" | "good" | "moderate" | "poor";
    [k: string]: unknown;
  }[];
  /**
   * Maximum 4 channels per budget policy
   *
   * @maxItems 4
   */
  selected_channels:
    | []
    | [
        | "paid_search"
        | "paid_social"
        | "organic_social"
        | "content_marketing"
        | "organic_search"
        | "partnerships"
        | "direct_sales"
        | "events"
        | "referral"
        | "email"
        | "influencer"
        | "community"
      ]
    | [
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        ),
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        )
      ]
    | [
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        ),
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        ),
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        )
      ]
    | [
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        ),
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        ),
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        ),
        (
          | "paid_search"
          | "paid_social"
          | "organic_social"
          | "content_marketing"
          | "organic_search"
          | "partnerships"
          | "direct_sales"
          | "events"
          | "referral"
          | "email"
          | "influencer"
          | "community"
        )
      ];
  budget_allocation: {
    /**
     * Total monthly GTM budget in USD
     */
    total_budget_monthly: number;
    /**
     * Budget allocation per channel
     */
    channels: {
      [k: string]: number;
    };
    [k: string]: unknown;
  };
  /**
   * Phased launch plan for channels
   */
  launch_sequence?: {
    phase?: number;
    channels?: string[];
    start_date?: string;
    duration_weeks?: number;
    description?: string;
    [k: string]: unknown;
  }[];
  success_metrics: {
    primary_kpis?: {
      metric?: "CAC" | "conversion_rate" | "signups" | "activations" | "revenue" | "roi";
      target_value?: number;
      unit?: string;
      review_cadence?: "daily" | "weekly" | "bi-weekly" | "monthly";
      [k: string]: unknown;
    }[];
    /**
     * Target customer acquisition cost
     */
    target_cac?: number;
    /**
     * Overall conversion rate target (visitor to signup)
     */
    target_conversion_rate?: number;
    /**
     * Target new user signups per month
     */
    target_monthly_signups?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
