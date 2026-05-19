/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/logo-designer/input.schema.json */

export interface LogoDesignerInput {
  creative_direction: {
    brand_promise?: string;
    key_visual_metaphors?: string[];
    visual_language_criteria?: string[];
    mood_board_description?: string;
    [k: string]: unknown;
  };
  /**
   * The chosen brand name for wordmark integration
   */
  brand_name: string;
  /**
   * Primary brand archetype
   */
  brand_archetype?: string;
  visual_system: {
    primary_colors?: unknown[];
    typography_system?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  logo_requirements?: {
    include_wordmark?: boolean;
    icon_only_needed?: boolean;
    primary_use_case?: "web" | "print" | "merchandise" | "multi-channel";
    [k: string]: unknown;
  };
  /**
   * Exploratory Ideogram raster logo studies used as reference only; final logo output remains SVG/vector-first.
   */
  logo_studies?: {
    id?: string;
    label?: string;
    url?: string;
    storage_key?: string;
    source_url?: string;
    metadata?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
