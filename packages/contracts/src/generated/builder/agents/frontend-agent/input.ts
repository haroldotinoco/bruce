/* eslint-disable */
/* auto-generated from modules/builder/agents/frontend-agent/input.schema.json */

export interface FrontendAgentInput {
  /**
   * BDD scenarios for feature implementation
   */
  bdd_scenarios: unknown[];
  /**
   * Wireframe references and screen definitions
   */
  wireframes: unknown[];
  /**
   * Brand color, typography, spacing tokens
   */
  design_tokens?: {
    [k: string]: unknown;
  };
  /**
   * OpenAPI specifications for API integration
   */
  api_contracts?: unknown[];
  /**
   * App navigation and routing configuration
   */
  navigation_structure?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
