/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/creative-director/input.schema.json */

export interface CreativeDirectorInput {
  /**
   * Output from brand-strategist agent
   */
  brand_strategy: {
    positioning?: string;
    primary_archetype?: string;
    secondary_archetype?: string;
    brand_promise?: string;
    personality_traits?: string[];
    values?: string[];
    [k: string]: unknown;
  };
  /**
   * Output from market-analyst agent
   */
  market_analysis: {
    white_space_opportunities?: unknown[];
    competitor_positioning_map?: unknown[];
    tone_and_voice_analysis?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Reference brands or aesthetics (URLs or brand names)
   */
  visual_inspiration?: string[];
  /**
   * Sample text or brands with voice similar to target (not necessarily competitors)
   */
  brand_voice_references?: string[];
  /**
   * Technical or business constraints (e.g., 'must work at 16px', 'B2B context')
   */
  design_constraints?: string[];
  [k: string]: unknown;
}
