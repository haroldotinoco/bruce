/* eslint-disable */
/* auto-generated from modules/builder/agents/security-agent/input.schema.json */

export interface SecurityAgentInput {
  /**
   * Artifact ID for backend code repository
   */
  code_repo_ref: string;
  /**
   * Staging environment URL for configuration audit
   */
  deployed_staging_url?: string;
  /**
   * API specifications to review
   */
  api_contract_refs?: string[];
  /**
   * Infrastructure configuration details
   */
  infrastructure_spec?: {
    [k: string]: unknown;
  };
  /**
   * Regulatory compliance standards to check
   */
  compliance_requirements?: string[];
  [k: string]: unknown;
}
