/* eslint-disable */
/* auto-generated from modules/brand-aid/contracts/visual-system.schema.json */

export interface VisualSystem {
  color_palette: {
    primary_colors?: {
      name?: string;
      hex?: string;
      rgb?: string;
      usage?: string;
      [k: string]: unknown;
    }[];
    secondary_colors?: unknown[];
    neutral_palette?: unknown[];
    [k: string]: unknown;
  };
  typography_system: {
    headline_font?: {
      family?: string;
      weight_range?: string;
      [k: string]: unknown;
    };
    body_font?: {
      family?: string;
      weight_range?: string;
      line_height?: number;
      [k: string]: unknown;
    };
    type_scale?: unknown[];
    [k: string]: unknown;
  };
  design_tokens: {
    color_tokens?: {
      [k: string]: unknown;
    };
    spacing_tokens?: {
      [k: string]: unknown;
    };
    typography_tokens?: {
      [k: string]: unknown;
    };
    shadow_tokens?: {
      [k: string]: unknown;
    };
    border_radius_tokens?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  accessibility_report?: {
    wcag_level?: string;
    contrast_ratios_verified?: boolean;
    color_blindness_safe?: boolean;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
