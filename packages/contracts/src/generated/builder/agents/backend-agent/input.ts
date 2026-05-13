/* eslint-disable */
/* auto-generated from modules/builder/agents/backend-agent/input.schema.json */

export interface BackendAgentInput {
  /**
   * Architecture specification with services and API contracts
   */
  architecture_spec: {
    [k: string]: unknown;
  };
  /**
   * BDD scenarios for acceptance testing
   */
  bdd_scenarios: unknown[];
  /**
   * Entity definitions and database schema
   */
  data_models: unknown[];
  /**
   * OpenAPI specifications
   */
  api_contracts?: unknown[];
  /**
   * Database, cache, and external service configurations
   */
  environment_config?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
