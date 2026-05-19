/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/logo-designer/output.schema.json */

export interface LogoConceptsOutput {
  /**
   * @minItems 3
   * @maxItems 5
   */
  concepts:
    | [
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        },
        {
          concept_name?: string;
          visual_metaphor?: string;
          rationale?: string;
          design_approach?: string;
          strengths?: string[];
          considerations?: string[];
          [k: string]: unknown;
        }
      ];
  recommended_concept: {
    concept_name?: string;
    rationale?: string;
    design_decisions?: string;
    strategic_fit?: string;
    [k: string]: unknown;
  };
  svg_output: {
    /**
     * SVG code for horizontal logo + wordmark
     */
    horizontal_lockup?: string;
    /**
     * SVG code for vertical/stacked layout
     */
    vertical_lockup?: string;
    /**
     * SVG code for icon without wordmark
     */
    icon_only?: string;
    /**
     * SVG code for icon with text
     */
    icon_with_text?: string;
    [k: string]: unknown;
  };
  color_variations?: {
    /**
     * Primary colorway SVG
     */
    full_color?: string;
    /**
     * Single-color version SVG
     */
    monochrome?: string;
    /**
     * White-on-transparent SVG
     */
    white?: string;
    /**
     * Dark background version SVG
     */
    dark?: string;
    [k: string]: unknown;
  };
  /**
   * Verification that logo works at 16px, 64px, 256px, 512px scales
   */
  scale_testing_report?: string;
  file_references?: {
    svg_folder?: string;
    file_sizes?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Stored references to raster logo studies generated before final SVG production.
   */
  exploratory_studies?: {
    id?: string;
    label?: string;
    url?: string;
    storage_key?: string;
    [k: string]: unknown;
  }[];
  /**
   * Auto-approved SVG logo asset selected after critique passes.
   */
  approved_logo?: {
    id?: string;
    label?: string;
    url?: string;
    storage_key?: string;
    mime_type?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
