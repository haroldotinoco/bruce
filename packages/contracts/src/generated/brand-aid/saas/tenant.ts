/* eslint-disable */
/* auto-generated from modules/brand-aid/saas/tenant.schema.json */

export interface BrandAidTenantSchema {
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
   * Total storage quota for brand assets in GB
   */
  brand_assets_storage_gb?: number;
  /**
   * Preferred format for brand guidelines document
   */
  guidelines_format?: "markdown" | "pdf" | "figma" | "html" | "json";
  /**
   * Access level to brand templates
   */
  template_library?: "standard" | "full";
  /**
   * Supported output formats for brand deliverables
   */
  output_formats?: ("pdf" | "markdown" | "figma" | "html" | "json")[];
  /**
   * Maximum brand identities per venture (null for unlimited)
   */
  brand_identities_limit?: number | null;
  /**
   * Whether custom font recommendations are available
   */
  custom_fonts_enabled?: boolean;
  /**
   * Whether multiple brands per account are supported
   */
  multi_brand_support?: boolean;
  /**
   * Maximum brand revisions allowed (null for unlimited)
   */
  max_revisions?: number | null;
  /**
   * Whether white-label branding is enabled
   */
  white_label_enabled?: boolean;
  /**
   * When the tenant was provisioned
   */
  created_at: string;
  /**
   * Last update timestamp
   */
  updated_at?: string;
  /**
   * Current storage usage in GB
   */
  storage_used_gb?: number;
  /**
   * Whether the tenant is currently active
   */
  is_active?: boolean;
  [k: string]: unknown;
}
