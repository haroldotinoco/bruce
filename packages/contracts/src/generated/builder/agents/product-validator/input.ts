/* eslint-disable */
/* auto-generated from modules/builder/agents/product-validator/input.schema.json */

export interface ProductValidatorInput {
  /**
   * The venture hypothesis and problem statement
   */
  venture_hypothesis: string;
  /**
   * Target user segments and their needs
   */
  target_users: {
    segment?: string;
    needs?: string[];
    use_case?: string;
    [k: string]: unknown;
  }[];
  /**
   * Proposed features for MVP
   */
  proposed_features?: {
    name?: string;
    description?: string;
    priority?: "critical" | "high" | "medium" | "low";
    [k: string]: unknown;
  }[];
  /**
   * Technical, timeline, and resource constraints
   */
  constraints?: {
    tech_stack?: string;
    timeline?: string;
    team_size?: number;
    budget?: string;
    [k: string]: unknown;
  };
  /**
   * How we define MVP success
   */
  success_metrics?: string[];
  [k: string]: unknown;
}
