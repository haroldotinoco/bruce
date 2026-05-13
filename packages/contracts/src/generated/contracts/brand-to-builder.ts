/* eslint-disable */
/* auto-generated from modules/contracts/brand-to-builder.schema.json */

/**
 * Handoff from brand-aid module to builder module. Encapsulates brand identity assets, design tokens, visual guidelines, and brand voice for product implementation.
 */
export interface BrandToBuilderHandoff {
  /**
   * Venture identifier (UUID v4)
   */
  venture_id: string;
  /**
   * Official brand/venture name
   */
  brand_name: string;
  /**
   * Short tagline/slogan
   */
  brand_tagline?: string;
  /**
   * Primary logo as inline SVG string
   */
  logo_svg: string;
  /**
   * Logo variants (icon, horizontal, vertical, monochrome)
   */
  logo_variants?: {
    variant_name?: string;
    svg_content?: string;
    /**
     * e.g., 'favicon', 'social profile', 'header'
     */
    use_case?: string;
    [k: string]: unknown;
  }[];
  /**
   * Complete color scheme
   */
  color_palette: {
    primary: {
      hex?: string;
      /**
       * e.g., 'rgb(52, 211, 153)'
       */
      rgb?: string;
      name?: string;
      [k: string]: unknown;
    };
    secondary: {
      hex?: string;
      rgb?: string;
      name?: string;
      [k: string]: unknown;
    };
    accent?: {
      hex?: string;
      rgb?: string;
      name?: string;
      [k: string]: unknown;
    };
    /**
     * Neutral color scale (grays)
     */
    neutral: {
      /**
       * e.g., '50', '100', '200', ... '900'
       */
      value?: string;
      hex?: string;
      [k: string]: unknown;
    }[];
    /**
     * Semantic colors for UI states
     */
    semantic?: {
      success?: string;
      warning?: string;
      error?: string;
      info?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Typography system
   */
  typography: {
    heading_font: {
      /**
       * e.g., 'Inter', 'Poppins'
       */
      family?: string;
      /**
       * e.g., 'Bold', 'Semi Bold'
       */
      style?: string;
      weights?: number[];
      /**
       * e.g., Google Fonts URL
       */
      import_url?: string;
      [k: string]: unknown;
    };
    body_font: {
      family?: string;
      style?: string;
      weights?: number[];
      import_url?: string;
      [k: string]: unknown;
    };
    /**
     * For code/technical content
     */
    monospace_font?: {
      family?: string;
      style?: string;
      [k: string]: unknown;
    };
    /**
     * Type scale (e.g., 'major-third' 1.25x, 'golden-ratio' 1.618x)
     */
    scale: string;
    /**
     * Named font sizes
     */
    sizes?: {
      /**
       * e.g., '12px'
       */
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      "2xl"?: string;
      "3xl"?: string;
      [k: string]: unknown;
    };
    line_height?: {
      /**
       * e.g., '1.1'
       */
      tight?: string;
      normal?: string;
      relaxed?: string;
      [k: string]: unknown;
    };
    /**
     * Letter spacing (tracking)
     */
    letter_spacing?: {
      tight?: string;
      normal?: string;
      wide?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Design tokens for spacing, shadows, border radius, etc.
   */
  design_tokens?: {
    /**
     * Spacing scale (base unit typically 4px or 8px)
     */
    spacing?: {
      /**
       * e.g., '4px'
       */
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      "2xl"?: string;
      [k: string]: unknown;
    };
    /**
     * Border radius scale
     */
    border_radius?: {
      none?: string;
      sm?: string;
      base?: string;
      lg?: string;
      full?: string;
      [k: string]: unknown;
    };
    /**
     * Shadow effects
     */
    shadows?: {
      /**
       * e.g., '0 1px 2px 0 rgba(0,0,0,0.05)'
       */
      sm?: string;
      base?: string;
      md?: string;
      lg?: string;
      [k: string]: unknown;
    };
    /**
     * Animation/transition timings
     */
    transitions?: {
      /**
       * e.g., '150ms'
       */
      fast?: string;
      base?: string;
      slow?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Concise summary of brand voice for product copy
   */
  brand_voice_summary: string;
  /**
   * Specific guidelines for how to write in this brand voice
   */
  voice_guidelines?: {
    guideline?: string;
    example_dos?: string[];
    example_donts?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Reference to full brand guidelines document/PDF in artifact store
   */
  brand_guidelines_artifact_id?: string;
  /**
   * Figma file key where design system components are stored
   */
  figma_file_key?: string;
  /**
   * List of design system components ready for builder
   */
  design_system_components?: {
    /**
     * e.g., 'Button', 'Card', 'Navigation'
     */
    component_name?: string;
    figma_node_id?: string;
    variants?: string[];
    [k: string]: unknown;
  }[];
  created_at?: string;
}
