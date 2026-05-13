/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/naming-agent/input.schema.json */

export interface NamingAgentInput {
  /**
   * Creative direction brief from creative-director
   */
  creative_direction: {
    naming_criteria?: string[];
    key_visual_metaphors?: string[];
    brand_voice_examples?: string[];
    [k: string]: unknown;
  };
  /**
   * Brand positioning from brand strategy
   */
  positioning: string;
  /**
   * Target customer segment description
   */
  target_customer?: string;
  /**
   * Competitor brand names to avoid similarity with
   */
  competitive_names?: string[];
  naming_preferences?: {
    preferred_length_syllables?: number;
    preferred_style?: string[];
    cultural_context?: string;
    international_availability?: boolean;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
