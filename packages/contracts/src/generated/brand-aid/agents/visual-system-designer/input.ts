/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/visual-system-designer/input.schema.json */

export interface VisualSystemDesignerInput {
  creative_direction: {
    mood_board_description?: string;
    visual_language_criteria?: string[];
    design_token_guidance?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Primary brand archetype
   */
  brand_archetype: string;
  implementation_context?: {
    primary_medium?: "web" | "mobile" | "print" | "multi-channel";
    color_model_preference?: "RGB" | "HSL" | "HEX";
    design_tool?: "Figma" | "Sketch" | "XD" | "agnostic";
    [k: string]: unknown;
  };
  accessibility_requirements?: {
    wcag_level?: "A" | "AA" | "AAA";
    color_blindness_safe?: boolean;
    [k: string]: unknown;
  };
  /**
   * Any colors that must be included or excluded
   */
  constraint_colors?: string[];
  [k: string]: unknown;
}
