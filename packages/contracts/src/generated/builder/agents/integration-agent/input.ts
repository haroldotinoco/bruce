/* eslint-disable */
/* auto-generated from modules/builder/agents/integration-agent/input.schema.json */

export interface IntegrationAgentInput {
  /**
   * Reference to architecture documentation
   */
  architecture_doc_ref: {
    document_id?: string;
    version?: string;
    url?: string;
    [k: string]: unknown;
  };
  /**
   * MVP feature list with integration requirements
   */
  feature_backlog: {
    feature_id?: string;
    name?: string;
    description?: string;
    required_integrations?: string[];
    priority?: "critical" | "high" | "medium" | "low";
    acceptance_criteria?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Technology stack for the MVP
   */
  tech_stack: {
    backend_framework?: string;
    backend_language?: string;
    frontend_framework?: string;
    frontend_language?: string;
    database?: string;
    hosting_platform?: string;
    runtime_environment?: string;
    [k: string]: unknown;
  };
  /**
   * List of integrations already in place or planned
   */
  existing_integrations?: {
    name?: string;
    type?: string;
    status?: "active" | "planned" | "deprecated";
    auth_method?: string;
    [k: string]: unknown;
  }[];
  /**
   * Funding stage for cost-based recommendations
   */
  budget_tier?: "pre-seed" | "seed" | "series-a" | "series-b" | "enterprise";
  /**
   * Additional requirements or constraints
   */
  custom_requirements?: {
    compliance_requirements?: string[];
    geographic_constraints?: string[];
    performance_requirements?: {
      [k: string]: unknown;
    };
    availability_sla?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
