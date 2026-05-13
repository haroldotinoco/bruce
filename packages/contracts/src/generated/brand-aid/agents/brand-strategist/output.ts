/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/brand-strategist/output.schema.json */

export interface BrandStrategyOutput {
  /**
   * The strategic positioning: what does this brand own in the customer's mind?
   */
  positioning: string;
  /**
   * Primary brand archetype
   */
  primary_archetype:
    | "Hero"
    | "Sage"
    | "Creator"
    | "Innocent"
    | "Explorer"
    | "Lover"
    | "Jester"
    | "Everyman"
    | "Caregiver"
    | "Ruler"
    | "Magician"
    | "Mentor";
  /**
   * Secondary archetype (optional)
   */
  secondary_archetype?:
    | "Hero"
    | "Sage"
    | "Creator"
    | "Innocent"
    | "Explorer"
    | "Lover"
    | "Jester"
    | "Everyman"
    | "Caregiver"
    | "Ruler"
    | "Magician"
    | "Mentor"
    | null;
  /**
   * The core emotional and functional promise the brand makes to customers
   */
  brand_promise: string;
  /**
   * Brand personality traits (5-7)
   *
   * @minItems 5
   * @maxItems 7
   */
  personality_traits:
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string];
  /**
   * Core brand values (3-4)
   *
   * @minItems 3
   * @maxItems 4
   */
  values: [string, string, string] | [string, string, string, string];
  /**
   * Summary of target customer
   */
  target_customer_summary: {
    segment: string;
    primary_need: string;
    psychographic?: string;
    [k: string]: unknown;
  };
  /**
   * How this brand differs from and owns white space vs. competitors
   */
  competitive_context: string;
  /**
   * Explanation of why these strategic choices fit the venture
   */
  strategic_rationale?: string;
  [k: string]: unknown;
}
