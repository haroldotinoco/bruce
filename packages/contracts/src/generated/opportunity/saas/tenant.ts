/* eslint-disable */
/* auto-generated from modules/opportunity/saas/tenant.schema.json */

export interface OpportunityTenant {
  /**
   * Clerk Organization ID — tenant identifier
   */
  account_id: string;
  plan: "free" | "pro" | "enterprise";
  usage_this_period?: {
    scans_run?: number;
    opportunities_scored?: number;
    opportunities_advanced?: number;
    [k: string]: unknown;
  };
  period_start?: string;
  period_end?: string;
  [k: string]: unknown;
}
