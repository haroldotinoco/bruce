/* eslint-disable */
/* auto-generated from modules/builder/contracts/functional-spec.schema.json */

export interface FunctionalSpecification {
  /**
   * Unique spec identifier
   */
  spec_id: string;
  /**
   * Parent venture ID
   */
  venture_id: string;
  product_name?: string;
  product_description?: string;
  /**
   * Essential features for MVP
   */
  core_features: {
    feature_id: string;
    name: string;
    description?: string;
    acceptance_criteria?: string[];
    priority?: "critical" | "high" | "medium";
    estimated_effort_hours?: number;
    [k: string]: unknown;
  }[];
  /**
   * Features explicitly excluded from MVP
   */
  out_of_scope?: {
    feature_name?: string;
    rationale?: string;
    [k: string]: unknown;
  }[];
  /**
   * User personas and roles
   */
  user_roles?: {
    role_id?: string;
    name?: string;
    description?: string;
    key_responsibilities?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Technology stack requirements
   */
  tech_stack?: {
    backend?: string;
    frontend?: string;
    database?: string;
    cloud_platform?: string;
    [k: string]: unknown;
  };
  /**
   * External system integrations
   */
  integrations?: {
    service_name?: string;
    purpose?: string;
    api_available?: boolean;
    [k: string]: unknown;
  }[];
  /**
   * Performance, security, scalability requirements
   */
  non_functional_requirements?: {
    uptime_sla_percent?: number;
    response_time_p99_ms?: number;
    concurrent_users_initial?: number;
    concurrent_users_12month?: number;
    data_retention_years?: number;
    [k: string]: unknown;
  };
  /**
   * Regulatory compliance needs
   */
  compliance_requirements?: string[];
  validated_at?: string;
  validation_notes?: string;
  [k: string]: unknown;
}
