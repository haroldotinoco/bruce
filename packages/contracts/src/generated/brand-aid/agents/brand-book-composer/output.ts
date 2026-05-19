/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/brand-book-composer/output.schema.json */

export interface BrandBookOutput {
  /**
   * PDF brand book document
   */
  brand_book_pdf: {
    file_path?: string;
    file_size_kb?: number;
    page_count?: number;
    sections?: string[];
    [k: string]: unknown;
  };
  /**
   * Complete brand identity in JSON format
   */
  brand_book_json: {
    metadata?: {
      [k: string]: unknown;
    };
    strategy?: {
      [k: string]: unknown;
    };
    visual_system?: {
      [k: string]: unknown;
    };
    logo?: {
      [k: string]: unknown;
    };
    naming?: {
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
    usage_guidelines?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Design tokens in JSON format for implementation
   */
  design_tokens_json?: {
    [k: string]: unknown;
  };
  /**
   * Design tokens as CSS custom properties
   */
  design_tokens_css?: string;
  /**
   * Design tokens for Figma variables import
   */
  design_tokens_figma?: string;
  export_manifest: {
    timestamp?: string;
    brand_name?: string;
    files?: {
      name?: string;
      format?: string;
      path?: string;
      size_kb?: number;
      [k: string]: unknown;
    }[];
    critique_score?: number;
    [k: string]: unknown;
  };
  /**
   * Stored logo, imagery, token, and brandbook asset references. URLs must refer to retained storage assets, not ephemeral provider URLs.
   */
  asset_manifest?: {
    id?: string;
    type?: string;
    label?: string;
    url?: string;
    storage_key?: string;
    mime_type?: string;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
