/* eslint-disable */
/* auto-generated from modules/builder/agents/solution-architect/input.schema.json */

export interface SolutionArchitectInput {
  /**
   * Functional requirements and feature definitions
   */
  functional_spec: {
    [k: string]: unknown;
  };
  /**
   * BDD scenarios and user flows
   */
  bdd_spec: {
    [k: string]: unknown;
  };
  tech_stack_requirements?: {
    backend_preference?: string;
    database_preference?: string;
    cloud_provider?: string;
    [k: string]: unknown;
  };
  scalability_requirements?: {
    initial_users?: number;
    growth_forecast_months?: number;
    peak_concurrent_users?: number;
    [k: string]: unknown;
  };
  compliance_requirements?: string[];
  [k: string]: unknown;
}
