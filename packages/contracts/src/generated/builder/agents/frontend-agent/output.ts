/* eslint-disable */
/* auto-generated from modules/builder/agents/frontend-agent/output.schema.json */

export interface FrontendAgentOutput {
  /**
   * Artifact ID for generated frontend repository
   */
  code_repo_ref?: string;
  /**
   * List of generated components
   */
  components_generated?: {
    name?: string;
    path?: string;
    props?: {
      name?: string;
      type?: string;
      required?: boolean;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  /**
   * List of generated pages
   */
  pages_generated?: {
    name?: string;
    path?: string;
    route?: string;
    [k: string]: unknown;
  }[];
  /**
   * Build completion status
   */
  build_status: "success" | "failed";
  /**
   * Estimated Lighthouse score (0-100)
   */
  lighthouse_score_estimate?: number;
  /**
   * Build errors if any
   */
  build_errors?: {
    file?: string;
    error?: string;
    [k: string]: unknown;
  }[];
  /**
   * Notes on backend API integration and testing
   */
  integration_notes?: string;
  [k: string]: unknown;
}
