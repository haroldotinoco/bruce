/* eslint-disable */
/* auto-generated from modules/builder/agents/ux-bdd-agent/output.schema.json */

export interface UXBDDAgentOutput {
  /**
   * Array of artifact IDs for generated wireframes
   */
  wireframe_refs?: string[];
  /**
   * Array of BDD scenarios in Gherkin format
   */
  bdd_scenarios: {
    /**
     * Unique scenario identifier
     */
    scenario_id: string;
    /**
     * Feature name
     */
    feature: string;
    /**
     * Given preconditions
     */
    given: string[];
    /**
     * When action steps
     */
    when: string[];
    /**
     * Then expected outcomes
     */
    then: string[];
    /**
     * Scenario priority level
     */
    priority?: "critical" | "high" | "medium" | "low";
    /**
     * Tags for scenario categorization
     */
    tags?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Array of user flows with step definitions
   */
  user_flows: {
    flow_id: string;
    name: string;
    steps: {
      step_number?: number;
      action?: string;
      screen_ref?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  /**
   * Non-BDD acceptance criteria
   */
  acceptance_criteria: {
    criterion_id?: string;
    description?: string;
    verification_method?: string;
    [k: string]: unknown;
  }[];
  /**
   * UX notes and annotations for wireframes
   */
  ux_annotations?: {
    accessibility_notes?: string[];
    interaction_notes?: string[];
    error_handling_strategy?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
