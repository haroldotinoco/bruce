/* eslint-disable */
/* auto-generated from modules/builder/state/execution-state.schema.json */

export interface BuildExecutionState {
  build_id: string;
  venture_id: string;
  current_stage: string;
  /**
   * Output and status from each completed stage
   */
  stage_results?: {
    functional_validation?: {
      [k: string]: unknown;
    };
    ux_bdd_specification?: {
      [k: string]: unknown;
    };
    solution_architecture?: {
      [k: string]: unknown;
    };
    backend_development?: {
      [k: string]: unknown;
    };
    frontend_development?: {
      [k: string]: unknown;
    };
    qa_testing?: {
      [k: string]: unknown;
    };
    security_audit?: {
      [k: string]: unknown;
    };
    governance_review?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Number of rework cycles per stage
   */
  rework_counts?: {
    backend_development?: number;
    frontend_development?: number;
    qa_testing?: number;
    [k: string]: unknown;
  };
  /**
   * All artifact references generated
   */
  artifacts_produced?: {
    functional_spec_ref?: string;
    bdd_spec_ref?: string;
    wireframes_refs?: unknown[];
    architecture_spec_ref?: string;
    backend_code_ref?: string;
    frontend_code_ref?: string;
    qa_report_ref?: string;
    security_report_ref?: string;
    governance_report_ref?: string;
    [k: string]: unknown;
  };
  /**
   * Current blocking issues preventing progress
   */
  blocking_issues?: {
    issue_id?: string;
    stage?: string;
    description?: string;
    severity?: string;
    created_at?: string;
    [k: string]: unknown;
  }[];
  /**
   * Gate evaluation results
   */
  gate_decisions?: {
    functional_validation_gate?: string;
    bdd_gate?: string;
    architecture_gate?: string;
    backend_build_gate?: string;
    frontend_build_gate?: string;
    qa_gate?: string;
    security_gate?: string;
    launch_gate?: string;
    [k: string]: unknown;
  };
  started_at?: string;
  last_updated_at?: string;
  [k: string]: unknown;
}
