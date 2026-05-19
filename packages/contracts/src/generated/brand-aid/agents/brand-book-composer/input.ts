/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/brand-book-composer/input.schema.json */

export interface BrandBookComposerInput {
  /**
   * Complete brand identity (strategy + visual + logo + naming)
   */
  brand_identity: {
    strategy?: {
      [k: string]: unknown;
    };
    visual_system?: {
      [k: string]: unknown;
    };
    logo_concepts?: {
      [k: string]: unknown;
    };
    naming_candidates?: {
      [k: string]: unknown;
    };
    moodboard?: {
      [k: string]: unknown;
    };
    logo_studies?: {
      [k: string]: unknown;
    }[];
    approved_logo?: {
      [k: string]: unknown;
    };
    brand_imagery?: {
      [k: string]: unknown;
    }[];
    asset_manifest?: {
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * Brand critique with scoring
   */
  brand_critique: {
    overall?: number;
    pass_fail?: boolean;
    [k: string]: unknown;
  };
  /**
   * Requested export formats
   */
  export_formats: string[];
  /**
   * Final chosen brand name
   */
  brand_name?: string;
  composition_options?: {
    include_extended_guidelines?: boolean;
    include_marketing_brief?: boolean;
    audience?: "internal" | "partners" | "all";
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
