/* eslint-disable */
/* auto-generated from modules/builder/agents/backend-agent/output.schema.json */

export interface BackendAgentOutput {
  /**
   * Artifact ID for generated backend repository
   */
  code_repo_ref?: string;
  /**
   * Generated API endpoints
   */
  api_endpoints?: {
    method?: string;
    path?: string;
    handler?: string;
    [k: string]: unknown;
  }[];
  /**
   * Code coverage percentage (0-100)
   */
  test_coverage_percent?: number;
  /**
   * Quality score (0-100)
   */
  code_quality_score?: number;
  /**
   * List of generated file paths
   */
  generated_files?: string[];
  /**
   * Build completion status
   */
  build_status: "success" | "failed";
  /**
   * Build errors if any
   */
  build_errors?: {
    file?: string;
    line?: number;
    error?: string;
    [k: string]: unknown;
  }[];
  /**
   * Deployment and runtime instructions
   */
  deployment_notes?: string;
  [k: string]: unknown;
}
