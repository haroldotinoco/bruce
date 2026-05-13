/* eslint-disable */
/* auto-generated from modules/builder/agents/solution-architect/output.schema.json */

export interface SolutionArchitectOutput {
  /**
   * Artifact ID reference for architecture diagram
   */
  architecture_diagram_ref?: string;
  /**
   * Microservices and their responsibilities
   */
  services: {
    name: string;
    responsibility: string;
    tech: string;
    api_endpoints?: string[];
    dependencies?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Entity definitions and relationships
   */
  data_models: {
    entity: string;
    fields: {
      name?: string;
      type?: string;
      required?: boolean;
      description?: string;
      [k: string]: unknown;
    }[];
    relationships?: {
      target_entity?: string;
      relationship_type?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  /**
   * Artifact IDs for API specifications
   */
  api_contract_refs?: string[];
  infrastructure_spec: {
    cloud_provider: string;
    services: {
      name?: string;
      type?: string;
      configuration?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    networking?: {
      vpc_config?: {
        [k: string]: unknown;
      };
      load_balancing?: string;
      [k: string]: unknown;
    };
    /**
     * Estimated AWS/cloud cost in USD
     */
    estimated_monthly_cost?: string;
    [k: string]: unknown;
  };
  /**
   * Notes on scaling strategy and bottleneck considerations
   */
  scalability_notes?: string;
  [k: string]: unknown;
}
