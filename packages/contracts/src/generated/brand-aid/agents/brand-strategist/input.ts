/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/brand-strategist/input.schema.json */

export interface BrandStrategistInput {
  /**
   * The core venture hypothesis: what problem does this solve, for whom, and why now?
   */
  venture_hypothesis: string;
  /**
   * Target customer profile
   */
  target_customer: {
    /**
     * Customer segment description
     */
    segment: string;
    /**
     * Primary needs this venture addresses
     */
    needs: string[];
    /**
     * Current pain points
     */
    pain_points: string[];
    [k: string]: unknown;
  };
  /**
   * The specific problem the venture solves
   */
  problem_statement: string;
  /**
   * Known competitors and their positioning (optional, for context)
   */
  competitive_landscape?: {
    competitor?: string;
    positioning?: string;
    strengths?: string[];
    weaknesses?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Basic business model for context
   */
  business_model?: {
    revenue_model?: string;
    customer_acquisition?: string;
    unit_economics?: string;
    [k: string]: unknown;
  };
  /**
   * How should customers perceive this brand? (aspirational)
   */
  desired_perception?: string;
  /**
   * Any constraints or requirements for the brand strategy
   */
  constraints?: string[];
  [k: string]: unknown;
}
