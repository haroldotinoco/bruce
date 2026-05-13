/* eslint-disable */
/* auto-generated from modules/gtm/contracts/campaign-brief.schema.json */

/**
 * Campaign brief specifying objectives, creative, budget, and success metrics
 */
export interface CampaignBrief {
  /**
   * Unique campaign identifier
   */
  campaign_id: string;
  /**
   * Reference to venture
   */
  venture_id: string;
  /**
   * Human-readable campaign name
   */
  campaign_name: string;
  /**
   * Primary channel for this campaign
   */
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
  /**
   * Campaign objective in funnel
   */
  objective: "awareness" | "consideration" | "conversion" | "retention" | "upsell";
  target_audience: {
    description?: string;
    segment?: string;
    job_titles?: string[];
    company_size?: string;
    geography?: string[];
    buyer_persona?: string;
    [k: string]: unknown;
  };
  creative_brief?: {
    headline?: string;
    subheading?: string;
    body_copy?: string;
    /**
     * Call-to-action text
     */
    cta?: string;
    visual_theme?: string;
    tone?: "professional" | "casual" | "technical" | "inspirational" | "humorous";
    [k: string]: unknown;
  };
  budget: {
    /**
     * Total campaign budget in USD
     */
    total_budget: number;
    /**
     * Campaign duration in days
     */
    duration_days: number;
    /**
     * Daily budget allocation
     */
    daily_budget?: number;
    [k: string]: unknown;
  };
  duration: {
    start_date?: string;
    end_date?: string;
    [k: string]: unknown;
  };
  /**
   * A/B test variants
   */
  ab_variants?: {
    variant_id?: string;
    variant_name?: string;
    variant_description?: string;
    expected_traffic_split?: number;
    [k: string]: unknown;
  }[];
  success_metrics?: {
    kpis?: {
      metric?: "impressions" | "clicks" | "ctr" | "cpc" | "cpa" | "conversions" | "roas" | "ltv" | "roi";
      target_value?: number;
      [k: string]: unknown;
    }[];
    success_criteria?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
