/* eslint-disable */
/* auto-generated from modules/builder/agents/qa-agent/input.schema.json */

export interface QAAgentInput {
  /**
   * BDD scenarios to test
   */
  bdd_scenarios: unknown[];
  /**
   * URL of deployed staging environment
   */
  staging_url: string;
  /**
   * Test account credentials
   */
  test_credentials?: {
    email?: string;
    password?: string;
    [k: string]: unknown;
  };
  /**
   * Environment variables or pre-test data setup
   */
  test_environment_setup?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
