/* eslint-disable */
/* auto-generated from modules/builder/agents/governance-agent/output.schema.json */

export interface GovernanceAgentOutput {
  /**
   * Final launch approval decision
   */
  launch_approved: boolean;
  /**
   * Detailed explanation of approval or blocking decision
   */
  approval_rationale: string;
  /**
   * Issues preventing launch approval
   */
  blocking_issues?: {
    stage?: string;
    issue?: string;
    severity?: string;
    remediation?: string;
    [k: string]: unknown;
  }[];
  /**
   * Overall readiness percentage (0-100)
   */
  launch_readiness_score: number;
  /**
   * Approval timestamp
   */
  approved_at?: string;
  /**
   * Role/system approving launch
   */
  approved_by?: string;
  /**
   * Post-launch monitoring and operational requirements
   */
  conditions?: {
    condition_id?: string;
    description?: string;
    enforcement?: string;
    [k: string]: unknown;
  }[];
  /**
   * Summary of all stage results
   */
  stage_summary?: {
    functional_validation?: string;
    ux_bdd_specification?: string;
    solution_architecture?: string;
    backend_development?: string;
    frontend_development?: string;
    qa_testing?: string;
    security_audit?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
