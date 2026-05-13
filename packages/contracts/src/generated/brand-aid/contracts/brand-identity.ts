/* eslint-disable */
/* auto-generated from modules/brand-aid/contracts/brand-identity.schema.json */

export interface CompleteBrandIdentity {
  strategy: {
    positioning?: string;
    primary_archetype?: string;
    secondary_archetype?: string;
    brand_promise?: string;
    personality_traits?: string[];
    values?: string[];
    [k: string]: unknown;
  };
  visual_system: {
    color_palette?: {
      [k: string]: unknown;
    };
    typography_system?: {
      [k: string]: unknown;
    };
    design_tokens?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  logo: {
    concept_name?: string;
    rationale?: string;
    svg_horizontal?: string;
    svg_vertical?: string;
    svg_icon?: string;
    [k: string]: unknown;
  };
  naming: {
    chosen_name?: string;
    rationale?: string;
    pronunciation?: string;
    domain?: string;
    [k: string]: unknown;
  };
  metadata?: {
    created_date?: string;
    version?: string;
    critique_score?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
