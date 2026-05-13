/* eslint-disable */
/* auto-generated from modules/add-venture/saas/tenant.schema.json */

/**
 * Account/organization record for multi-tenant SaaS
 */
export interface AddVentureTenantSchema {
  /**
   * Clerk organization ID or user ID
   */
  account_id: string;
  /**
   * Current plan tier
   */
  plan: "free" | "pro" | "enterprise";
  /**
   * Last time plan was changed
   */
  plan_updated_at?: string;
  /**
   * Stripe customer ID for billing
   */
  stripe_customer_id?: string;
  /**
   * Active Stripe subscription
   */
  stripe_subscription_id?: string;
  billing_email?: string;
  /**
   * Usage counters for current billing period
   */
  usage_this_period?: {
    dossiers_created?: number;
    iterations_requested?: number;
    volumes_downloaded?: number;
    [k: string]: unknown;
  };
  /**
   * Start of current billing period
   */
  period_start?: string;
  /**
   * End of current billing period
   */
  period_end?: string;
  created_at: string;
  updated_at?: string;
  /**
   * Custom metadata (company name, industry, etc.)
   */
  metadata?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
