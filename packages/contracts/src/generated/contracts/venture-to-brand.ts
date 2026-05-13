/* eslint-disable */
/* auto-generated from modules/contracts/venture-to-brand.schema.json */

/**
 * Handoff from add-venture module to brand-aid module. Encapsulates hypothesis, target audience, and positioning to enable brand strategy and visual identity creation.
 */
export interface VentureToBrandHandoff {
  /**
   * Venture identifier (UUID v4)
   */
  venture_id: string;
  /**
   * Core value proposition - what unique benefit is delivered to customer?
   */
  value_proposition: string;
  /**
   * Detailed target audience definition
   */
  target_audience: {
    /**
     * Primary customer segment name
     */
    primary_segment: string;
    /**
     * Demographic characteristics (e.g., 'Age 25-45', 'Tech workers', 'High income')
     */
    demographics?: string[];
    /**
     * Psychographic traits (e.g., 'Early adopters', 'Values efficiency', 'Quality-conscious')
     */
    psychographics?: string[];
    /**
     * Specific problems they face
     */
    pain_points?: string[];
    /**
     * What do they want to achieve?
     */
    aspirations?: string[];
    [k: string]: unknown;
  };
  /**
   * How should brand be positioned vs. competitors? (1-2 sentences)
   */
  positioning_statement: string;
  /**
   * Key positioning pillars (e.g., 'Simplicity', 'Speed', 'Trust')
   *
   * @minItems 2
   * @maxItems 4
   */
  positioning_pillars?: [string, string] | [string, string, string] | [string, string, string, string];
  /**
   * Brand voice descriptors (e.g., 'friendly', 'authoritative', 'playful', 'professional')
   *
   * @minItems 2
   * @maxItems 5
   */
  tone_of_voice:
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string];
  /**
   * Visual identity mood (e.g., 'modern', 'minimal', 'vibrant', 'corporate', 'creative')
   *
   * @minItems 2
   * @maxItems 5
   */
  visual_mood:
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string];
  /**
   * What makes this brand different from competitors?
   */
  competitive_differentiation?: string;
  /**
   * Brand archetypes (e.g., 'The Innovator', 'The Sage', 'The Caregiver', 'The Creator')
   */
  brand_archetypes?: string[];
  /**
   * Origin story or brand narrative
   */
  brand_story?: string;
  /**
   * What is the higher purpose?
   */
  mission_statement?: string;
  /**
   * Core company values
   */
  core_values?: string[];
  /**
   * Suggested brand names (if not yet finalized)
   */
  brand_name_suggestions?: {
    name?: string;
    rationale?: string;
    /**
     * Has domain/trademark availability been checked?
     */
    availability_check?: boolean;
    [k: string]: unknown;
  }[];
  /**
   * Direct and indirect competitors for brand differentiation
   */
  competitive_set?: {
    name?: string;
    positioning?: string;
    differentiation_opportunity?: string;
    [k: string]: unknown;
  }[];
  /**
   * Guidance for visual identity
   */
  visual_direction_preferences?: {
    /**
     * Example brands or design styles to reference
     */
    style_references?: string[];
    /**
     * Color temperature preference
     */
    color_temperature?: "cool" | "warm" | "neutral";
    /**
     * Shape preference
     */
    geometric_vs_organic?: "geometric" | "organic" | "mixed";
    /**
     * Detail level
     */
    minimal_vs_detailed?: "minimal" | "detailed" | "balanced";
    [k: string]: unknown;
  };
  /**
   * Key messages to communicate
   */
  messaging_pillars?: {
    pillar?: string;
    supporting_messages?: string[];
    [k: string]: unknown;
  }[];
  created_at?: string;
}
