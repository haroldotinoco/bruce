/* eslint-disable */
/* auto-generated from modules/builder/saas/tenant.schema.json */

export interface BuilderTenantSchema {
  /**
   * Account identifier for tenant isolation
   */
  account_id: string;
  /**
   * Associated venture identifier
   */
  venture_id: string;
  /**
   * Subscription plan tier
   */
  plan: "free" | "pro" | "enterprise";
  /**
   * Maximum number of sprints allowed (null for unlimited)
   */
  max_sprints?: number | null;
  /**
   * Account or venture-specific technology preferences
   */
  tech_stack_preferences?: {
    category?:
      | "frontend_framework"
      | "backend_framework"
      | "database"
      | "authentication"
      | "hosting"
      | "monitoring"
      | "payment_processor";
    /**
     * Preferred technology for this category
     */
    preference?: string;
    [k: string]: unknown;
  }[];
  /**
   * Expected development team size
   */
  team_size?: number | null;
  /**
   * Development methodology preference
   */
  methodology?: "agile" | "lean" | "waterfall" | "kanban";
  /**
   * Maximum team members allowed (null for unlimited)
   */
  max_team_members?: number | null;
  /**
   * Supported output export formats
   */
  output_formats_enabled?: ("markdown" | "pdf" | "jira" | "asana" | "monday" | "linear" | "json")[];
  /**
   * Whether API access is enabled for this tenant
   */
  api_access_enabled?: boolean;
  /**
   * Whether webhooks are enabled for event-driven integrations
   */
  webhooks_enabled?: boolean;
  /**
   * Whether custom workflow templates are supported
   */
  custom_workflows_support?: boolean;
  /**
   * When the tenant was provisioned
   */
  created_at: string;
  /**
   * Last update timestamp
   */
  updated_at?: string;
  /**
   * Whether the tenant is currently active
   */
  is_active?: boolean;
  [k: string]: unknown;
}
