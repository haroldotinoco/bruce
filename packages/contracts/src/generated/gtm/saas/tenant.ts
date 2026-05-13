/* eslint-disable */
/* auto-generated from modules/gtm/saas/tenant.schema.json */

/**
 * Tenant context for GTM module — campaign management, channel strategy, analytics, and growth experiments
 */
export interface GTMTenant {
  /**
   * Clerk Organization ID — primary tenant identifier
   */
  account_id: string;
  /**
   * Associated venture ID from the add-venture module
   */
  venture_id: string;
  /**
   * Current subscription plan determining GTM feature access
   */
  plan: "free" | "pro" | "enterprise";
  plan_limits?: {
    max_active_campaigns?: number;
    max_channels?: number;
    max_monthly_spend_usd?: number;
    analytics_retention_days?: number;
    reporting_cadence?: "monthly" | "weekly";
    growth_experiments_per_month?: number;
    [k: string]: unknown;
  };
  /**
   * List of currently active campaign IDs
   */
  active_campaigns?: string[];
  /**
   * Channels this venture is actively using
   */
  channels_enabled?: (
    | "email"
    | "social"
    | "paid_search"
    | "display"
    | "organic_search"
    | "content"
    | "affiliate"
    | "direct"
    | "sms"
    | "push"
  )[];
  /**
   * Monthly budget cap in USD for paid channel spend
   */
  monthly_spend_limit?: number;
  /**
   * Current month's cumulative spend across all channels
   */
  current_monthly_spend?: number;
  /**
   * Frequency of automated governance reports
   */
  reporting_cadence?: "weekly" | "monthly";
  /**
   * Reference to the current GTM strategy document
   */
  gtm_strategy_id?: string;
  /**
   * Temporal.io namespace for this venture's GTM workflow orchestration
   */
  temporal_namespace?: string;
  /**
   * Credentials and connection status for external ad platforms and analytics services
   */
  external_integrations?: {
    google_ads?: {
      customer_id?: string;
      enabled?: boolean;
      [k: string]: unknown;
    };
    facebook_ads?: {
      ad_account_id?: string;
      enabled?: boolean;
      [k: string]: unknown;
    };
    linkedin_ads?: {
      ad_account_id?: string;
      enabled?: boolean;
      [k: string]: unknown;
    };
    google_analytics?: {
      property_id?: string;
      enabled?: boolean;
      [k: string]: unknown;
    };
    hubspot?: {
      portal_id?: string;
      enabled?: boolean;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  created_at?: string;
  updated_at?: string;
  [k: string]: unknown;
}
