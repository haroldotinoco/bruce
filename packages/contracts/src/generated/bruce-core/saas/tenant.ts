/* eslint-disable */
/* auto-generated from modules/bruce-core/saas/tenant.schema.json */

/**
 * Tenant context propagated through all bruce-core operations
 */
export interface BruceCoreTenant {
  /**
   * Clerk Organization ID — primary tenant identifier
   */
  account_id: string;
  plan: "free" | "pro" | "enterprise";
  plan_limits?: {
    max_active_ventures?: number;
    max_modules_enabled?: number;
    human_gate_notifications?: boolean;
    [k: string]: unknown;
  };
  /**
   * Which modules this account has access to
   */
  modules_enabled?: (
    | "opportunity"
    | "add-venture"
    | "brand-aid"
    | "builder"
    | "gtm"
    | "startup-ops"
    | "portfolio"
    | "bruce-memory"
  )[];
  /**
   * Temporal.io namespace for this account's workflows
   */
  temporal_namespace?: string;
  [k: string]: unknown;
}
