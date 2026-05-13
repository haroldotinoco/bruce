/* eslint-disable */
/* auto-generated from modules/builder/agents/product-validator/output.schema.json */

export interface FunctionalSpecification {
  feature_list: {
    name?: string;
    description?: string;
    priority?: string;
    acceptance_criteria?: string[];
    dependencies?: string[];
    [k: string]: unknown;
  }[];
  user_flows: {
    flow_name?: string;
    actors?: string[];
    steps?: string[];
    happy_path?: string;
    edge_cases?: string[];
    [k: string]: unknown;
  }[];
  data_model_overview?: {
    entities?: string[];
    relationships?: string;
    key_fields?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  external_dependencies?: {
    service?: string;
    purpose?: string;
    criticality?: "critical" | "high" | "medium" | "low";
    [k: string]: unknown;
  }[];
  assumptions_and_constraints?: string[];
  buildability_assessment: {
    feasible?: boolean;
    concerns?: string[];
    scope_evaluation?: string;
    recommendations?: string[];
    [k: string]: unknown;
  };
  /**
   * Can this proceed to design/architecture phases?
   */
  pass_fail?: boolean;
  [k: string]: unknown;
}
