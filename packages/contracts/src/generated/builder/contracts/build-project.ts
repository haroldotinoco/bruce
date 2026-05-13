/* eslint-disable */
/* auto-generated from modules/builder/contracts/build-project.schema.json */

export interface BuildProject {
  /**
   * Unique build identifier
   */
  build_id: string;
  /**
   * Reference to parent venture
   */
  venture_id: string;
  /**
   * Overall build status
   */
  status:
    | "pending"
    | "in_progress"
    | "functional_validation_complete"
    | "ux_bdd_complete"
    | "architecture_complete"
    | "backend_complete"
    | "frontend_complete"
    | "qa_complete"
    | "security_complete"
    | "governance_approved"
    | "launch_ready"
    | "failed"
    | "blocked";
  /**
   * Current pipeline stage
   */
  current_stage:
    | "functional-validation"
    | "ux-bdd-specification"
    | "solution-architecture"
    | "backend-development"
    | "frontend-development"
    | "qa-testing"
    | "security-audit"
    | "governance-review"
    | "emit-launch-ready";
  /**
   * Output from each stage
   */
  stage_reports?: {
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
   * Artifact references produced during build
   */
  artifacts?: {
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
   * Record of rework cycles triggered
   */
  rework_history?: {
    cycle_number?: number;
    triggered_at?: string;
    triggered_by_stage?: string;
    rework_target?: string;
    result?: string;
    [k: string]: unknown;
  }[];
  /**
   * Build start timestamp
   */
  started_at?: string;
  /**
   * Build completion timestamp (if completed)
   */
  completed_at?: string;
  /**
   * Total build execution time
   */
  total_duration_seconds?: number;
  /**
   * Issues preventing progress
   */
  blocking_issues?: {
    issue_id?: string;
    stage?: string;
    severity?: string;
    description?: string;
    remediation_required?: string;
    [k: string]: unknown;
  }[];
  /**
   * Aggregate quality metrics across pipeline
   */
  quality_metrics?: {
    overall_quality_score?: number;
    test_coverage_percent?: number;
    security_score?: number;
    qa_pass_rate?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
