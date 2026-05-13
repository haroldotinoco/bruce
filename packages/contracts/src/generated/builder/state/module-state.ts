/* eslint-disable */
/* auto-generated from modules/builder/state/module-state.schema.json */

export interface BuilderModuleState {
  /**
   * Currently running builds
   */
  active_builds?: {
    build_id?: string;
    venture_id?: string;
    current_stage?: string;
    started_at?: string;
    progress_percent?: number;
    [k: string]: unknown;
  }[];
  /**
   * Total number of successfully completed builds
   */
  completed_builds_count?: number;
  /**
   * Total number of failed builds
   */
  failed_builds_count?: number;
  /**
   * Average time to complete pipeline
   */
  avg_pipeline_duration_hours?: number;
  /**
   * Failure rate per stage (percentage)
   */
  stage_failure_rates?: {
    functional_validation?: number;
    ux_bdd_specification?: number;
    solution_architecture?: number;
    backend_development?: number;
    frontend_development?: number;
    qa_testing?: number;
    security_audit?: number;
    governance_review?: number;
    [k: string]: unknown;
  };
  /**
   * Percentage of builds requiring rework per stage
   */
  stage_rework_rates?: {
    backend_development?: number;
    frontend_development?: number;
    qa_testing?: number;
    [k: string]: unknown;
  };
  /**
   * Average code quality across completed builds
   */
  avg_build_quality_score?: number;
  /**
   * Average test coverage across builds
   */
  avg_test_coverage_percent?: number;
  /**
   * Average security score across builds
   */
  avg_security_score?: number;
  last_updated?: string;
  [k: string]: unknown;
}
