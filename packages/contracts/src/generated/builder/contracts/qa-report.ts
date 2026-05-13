/* eslint-disable */
/* auto-generated from modules/builder/contracts/qa-report.schema.json */

export interface QAReport {
  /**
   * Unique report identifier
   */
  report_id: string;
  /**
   * Parent build ID
   */
  build_id: string;
  /**
   * Unique test run identifier
   */
  test_run_id?: string;
  executed_at?: string;
  test_environment?: {
    browser?: string;
    staging_url?: string;
    [k: string]: unknown;
  };
  scenarios_total?: number;
  scenarios_passed?: number;
  scenarios_failed?: number;
  pass_rate_percent?: number;
  overall_status: "pass" | "fail";
  /**
   * Individual test result entries
   */
  test_results?: {
    scenario_id?: string;
    scenario_name?: string;
    status?: "pass" | "fail";
    duration_ms?: number;
    error_message?: string;
    failed_step?: string;
    screenshot_ref?: string;
    [k: string]: unknown;
  }[];
  /**
   * Summary of failed scenarios
   */
  failures?: {
    scenario_id?: string;
    failure_type?: string;
    root_cause?: string;
    affected_component?: string;
    [k: string]: unknown;
  }[];
  /**
   * Critical blocking failures
   */
  critical_failures?: {
    scenario_id?: string;
    issue?: string;
    impact?: string;
    [k: string]: unknown;
  }[];
  /**
   * Artifact references for failure screenshots
   */
  screenshots_refs?: string[];
  performance_metrics?: {
    avg_duration_ms?: number;
    min_duration_ms?: number;
    max_duration_ms?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
