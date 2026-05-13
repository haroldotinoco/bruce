/* eslint-disable */
/* auto-generated from modules/builder/contracts/architecture-spec.schema.json */

export interface ArchitectureSpecification {
  /**
   * Unique architecture spec identifier
   */
  spec_id: string;
  venture_id: string;
  product_name?: string;
  /**
   * Artifact reference for diagram
   */
  architecture_diagram_ref?: string;
  /**
   * Microservices definitions
   */
  services: {
    service_id: string;
    name: string;
    responsibility: string;
    tech_stack?: string;
    api_endpoints?: string[];
    dependencies?: string[];
    database?: string;
    [k: string]: unknown;
  }[];
  /**
   * Entity definitions
   */
  data_models?: {
    entity_id?: string;
    name?: string;
    fields?: {
      field_name?: string;
      field_type?: string;
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
   * API specification references
   */
  api_contracts?: {
    api_id?: string;
    service?: string;
    openapi_ref?: string;
    [k: string]: unknown;
  }[];
  /**
   * Infrastructure configuration
   */
  infrastructure?: {
    cloud_provider?: string;
    cloud_services?: {
      service_name?: string;
      service_type?: string;
      configuration?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    networking?: {
      [k: string]: unknown;
    };
    security?: {
      [k: string]: unknown;
    };
    estimated_monthly_cost_usd?: number;
    [k: string]: unknown;
  };
  /**
   * Scalability considerations
   */
  scalability?: {
    initial_users?: number;
    target_users_12month?: number;
    horizontal_scaling_services?: string[];
    caching_strategy?: string;
    database_scaling_plan?: string;
    [k: string]: unknown;
  };
  /**
   * External service dependencies
   */
  dependencies?: {
    service_name?: string;
    service_type?: string;
    criticality?: "critical" | "high" | "medium";
    [k: string]: unknown;
  }[];
  created_at?: string;
  [k: string]: unknown;
}
