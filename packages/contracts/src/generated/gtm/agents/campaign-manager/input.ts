/* eslint-disable */
/* auto-generated from modules/gtm/agents/campaign-manager/input.schema.json */

/**
 * Campaign objectives, audience, budget, and A/B test parameters
 */
export interface CampaignManagerInput {
  campaign_objective: {
    /**
     * Campaign name (e.g., 'DataShield CISO LinkedIn ABM Q2')
     */
    name: string;
    /**
     * Primary distribution channel
     */
    channel:
      | "paid-linkedin"
      | "paid-google-ads"
      | "paid-social"
      | "email"
      | "organic-social"
      | "content"
      | "partnerships"
      | "events"
      | "plg";
    /**
     * Campaign goal in 1 sentence
     */
    goal: string;
    /**
     * Campaign duration in days
     */
    timeline_days?: number;
    [k: string]: unknown;
  };
  target_audience: {
    /**
     * Target persona (e.g., 'CISO at mid-market SaaS')
     */
    persona: string;
    /**
     * Estimated addressable market size
     */
    segment_size: number;
    geographic_focus?: string[];
    /**
     * Audiences to exclude (e.g., 'existing customers', 'competitors')
     */
    exclusions?: string[];
    [k: string]: unknown;
  };
  budget: {
    /**
     * Total campaign budget
     */
    total_usd: number;
    currency: string;
    /**
     * How to allocate budget across test variants
     */
    allocation_strategy?: "equal-split" | "performance-based" | "sequential" | "fixed-allocation";
    [k: string]: unknown;
  };
  success_metric: {
    /**
     * Primary success metric
     */
    metric_type:
      | "impressions"
      | "clicks"
      | "ctr"
      | "conversions"
      | "cost-per-lead"
      | "cost-per-signup"
      | "conversion-rate"
      | "roas";
    /**
     * Target value for metric
     */
    target_value: number;
    /**
     * Other metrics to track
     */
    secondary_metrics?: string[];
    [k: string]: unknown;
  };
  ab_test_config?: {
    /**
     * What's being tested
     */
    variable_to_test?: "audience" | "messaging" | "creative" | "offer" | "channel-variant" | "landing-page";
    /**
     * Control messaging/creative version
     */
    control_version?: string;
    /**
     * Test variant messaging/creative
     */
    test_variant?: string;
    /**
     * Statistical confidence threshold (0.95 = 95%)
     */
    confidence_level?: 0.9 | 0.95 | 0.99;
    [k: string]: unknown;
  };
  constraints?: {
    /**
     * CAC > (target * multiplier) triggers campaign pause
     */
    kill_threshold_cac_multiplier?: number;
    /**
     * Minimum days of data before making scale/kill decision
     */
    minimum_days_before_decision?: number;
    /**
     * Maximum daily spend (prevents budget burn)
     */
    daily_spend_cap?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
