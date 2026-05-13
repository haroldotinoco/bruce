/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/creative-director/output.schema.json */

export interface CreativeDirectionOutput {
  /**
   * 2-3 paragraph synthesis of strategy and market research, framing the creative challenge
   */
  creative_brief: string;
  /**
   * Sensory and emotional description of the visual direction (color, texture, energy, materiality)
   */
  mood_board_description: string;
  /**
   * Adjectives and principles guiding visual execution (e.g., 'clean and minimal', 'warm and inviting')
   */
  visual_language_criteria: string[];
  /**
   * Specific attributes the brand name should embody (e.g., 'memorable', 'conveys partnership', 'domain-available')
   */
  naming_criteria: string[];
  /**
   * How the brand communicates: formality level, emotional register, key linguistic patterns
   */
  tone_of_voice_guidelines: string;
  /**
   * Guidance for design token selection
   */
  design_token_guidance?: {
    color_temperature?: string;
    color_vibrancy?: string;
    typography_attitude?: string;
    spacing_philosophy?: string;
    imagery_style?: string;
    [k: string]: unknown;
  };
  /**
   * Metaphors, symbols, or concepts to explore in visual design
   */
  key_visual_metaphors?: string[];
  /**
   * Sample sentences or phrases in the brand voice
   *
   * @maxItems 5
   */
  brand_voice_examples?:
    | []
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string];
  /**
   * What to avoid, boundary conditions for creative execution
   */
  constraints_and_guardrails?: string[];
  [k: string]: unknown;
}
