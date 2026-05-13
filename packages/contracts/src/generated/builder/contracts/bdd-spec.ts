/* eslint-disable */
/* auto-generated from modules/builder/contracts/bdd-spec.schema.json */

export interface BDDSpecification {
  /**
   * Unique BDD spec identifier
   */
  spec_id: string;
  venture_id: string;
  product_name?: string;
  /**
   * Gherkin features with scenarios
   */
  features: {
    feature_id: string;
    name: string;
    description?: string;
    scenarios?: {
      scenario_id: string;
      name: string;
      given: string[];
      when: string[];
      then: string[];
      priority?: "critical" | "high" | "medium" | "low";
      tags?: string[];
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  /**
   * User journey definitions
   */
  user_flows?: {
    flow_id?: string;
    name?: string;
    actor?: string;
    steps?: {
      step_number?: number;
      action?: string;
      expected_outcome?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  /**
   * Non-BDD acceptance criteria
   */
  acceptance_criteria?: {
    criterion_id?: string;
    description?: string;
    verification_method?: string;
    [k: string]: unknown;
  }[];
  /**
   * References to wireframe artifacts
   */
  wireframe_refs?: string[];
  /**
   * Test data and environment setup needed
   */
  test_environment_requirements?: {
    test_data_fixtures?: string[];
    mock_services?: string[];
    database_setup?: string;
    [k: string]: unknown;
  };
  total_scenarios?: number;
  created_at?: string;
  [k: string]: unknown;
}
