/* eslint-disable */
/* auto-generated from modules/brand-aid/saas/billing-events.schema.json */

export type BrandAidBillingEventsSchema =
  | BrandAidBriefCreated
  | BrandAidBrandGenerated
  | BrandAidNameSelected
  | BrandAidGuidelinesExported
  | BrandAidRevisionRequested;

/**
 * Published when a brand brief is created from a venture
 */
export interface BrandAidBriefCreated {
  event_type: "brand-aid.brief.created";
  /**
   * Account identifier for billing purposes
   */
  account_id: string;
  /**
   * Associated venture identifier
   */
  venture_id: string;
  /**
   * Unique identifier for the brand brief
   */
  brief_id: string;
  /**
   * Account plan tier at time of event
   */
  plan_tier?: "free" | "pro" | "enterprise";
  /**
   * UTC timestamp of event
   */
  timestamp: string;
  metadata?: {
    user_id?: string;
    session_id?: string;
    venture_name?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when a complete brand identity is generated and guidelines are finalized
 */
export interface BrandAidBrandGenerated {
  event_type: "brand-aid.brand.generated";
  account_id: string;
  venture_id: string;
  /**
   * Unique identifier for the generated brand
   */
  brand_id: string;
  /**
   * Final selected brand name
   */
  brand_name: string;
  brief_id?: string;
  plan_tier?: "free" | "pro" | "enterprise";
  /**
   * Generated deliverables summary
   */
  deliverables?: {
    guidelines_formats?: ("pdf" | "markdown" | "figma" | "html" | "json")[];
    /**
     * Total size of brand assets in KB
     */
    total_assets_kb?: number;
    color_palettes_generated?: number;
    names_generated?: number;
    names_evaluated?: number;
    [k: string]: unknown;
  };
  timestamp: string;
  metadata?: {
    user_id?: string;
    workflow_duration_seconds?: number;
    generation_steps_completed?: (
      | "brief_creation"
      | "naming_workshop"
      | "visual_identity"
      | "messaging_framework"
      | "guidelines_export"
    )[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when a brand name is selected from generated options
 */
export interface BrandAidNameSelected {
  event_type: "brand-aid.name.selected";
  account_id: string;
  venture_id: string;
  brand_id: string;
  brief_id?: string;
  /**
   * The final selected brand name
   */
  selected_name: string;
  /**
   * Reference to the name option that was selected
   */
  name_id?: string;
  /**
   * Domain availability status for the selected name
   */
  domain_status?: "available" | "unavailable" | "not_checked";
  plan_tier?: "free" | "pro" | "enterprise";
  timestamp: string;
  metadata?: {
    user_id?: string;
    selection_rationale?: string;
    evaluation_score?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when brand guidelines are exported in one or more formats
 */
export interface BrandAidGuidelinesExported {
  event_type: "brand-aid.guidelines.exported";
  account_id: string;
  venture_id: string;
  brand_id: string;
  brief_id?: string;
  /**
   * Formats in which guidelines were exported
   */
  export_formats: ("pdf" | "markdown" | "figma" | "html" | "json")[];
  /**
   * Combined file size of all exported guidelines
   */
  total_file_size_kb?: number;
  plan_tier?: "free" | "pro" | "enterprise";
  timestamp: string;
  metadata?: {
    user_id?: string;
    export_duration_seconds?: number;
    /**
     * S3 prefix or storage location (account-isolated)
     */
    storage_location?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when a user requests revisions to an approved brand
 */
export interface BrandAidRevisionRequested {
  event_type: "brand-aid.revision.requested";
  account_id: string;
  venture_id: string;
  brand_id: string;
  brief_id?: string;
  /**
   * Which aspects of the brand are being revised
   */
  revision_scope: (
    | "brand_name"
    | "color_palette"
    | "typography"
    | "imagery_style"
    | "tone_of_voice"
    | "messaging_framework"
    | "overall_direction"
  )[];
  /**
   * Total number of revisions requested for this brand
   */
  revision_count?: number;
  plan_tier?: "free" | "pro" | "enterprise";
  timestamp: string;
  metadata?: {
    user_id?: string;
    /**
     * User feedback on what to revise
     */
    revision_notes?: string;
    revision_context?: {
      days_since_approval?: number;
      revision_reason?: "strategic_pivot" | "market_feedback" | "internal_feedback" | "competitive_concern" | "other";
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
