/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/visual-system-designer/output.schema.json */

export interface VisualSystemOutput {
  color_palette: {
    primary_colors?: {
      name?: string;
      hex?: string;
      rgb?: string;
      usage?: string;
      [k: string]: unknown;
    }[];
    secondary_colors?: {
      name?: string;
      hex?: string;
      usage?: string;
      [k: string]: unknown;
    }[];
    neutral_palette?: {
      name?: string;
      hex?: string;
      lum_value?: number;
      [k: string]: unknown;
    }[];
    palette_rationale?: string;
    [k: string]: unknown;
  };
  typography_system: {
    headline_font?: {
      family?: string;
      weight_range?: string;
      use_cases?: string[];
      [k: string]: unknown;
    };
    body_font?: {
      family?: string;
      weight_range?: string;
      line_height?: number;
      [k: string]: unknown;
    };
    type_scale?: {
      name?: string;
      size_px?: number;
      weight?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  design_tokens: {
    color_tokens?: {
      [k: string]: string;
    };
    spacing_tokens?: {
      [k: string]: string;
    };
    sizing_tokens?: {
      [k: string]: string;
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
  accessibility_report: {
    wcag_level?: string;
    contrast_ratios_verified?: boolean;
    color_blindness_safe?: boolean;
    detailed_checks?: string[];
    [k: string]: unknown;
  };
  token_export_formats?: {
    /**
     * JSON format tokens
     */
    json?: string;
    /**
     * CSS custom properties format
     */
    css?: string;
    /**
     * Figma/design tool export format
     */
    design_file?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
