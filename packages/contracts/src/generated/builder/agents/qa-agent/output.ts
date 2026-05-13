/* eslint-disable */
/* auto-generated from modules/builder/agents/qa-agent/output.schema.json */

export interface QAAgentOutput {
  /**
   * Individual test results per scenario
   */
  test_results: {
    scenario_id: string;
    status: "pass" | "fail";
    duration_ms?: number;
    screenshot_ref?: string;
    error_message?: string;
    failed_step?: string;
    [k: string]: unknown;
  }[];
  /**
   * Overall test execution status
   */
  overall_status: "pass" | "fail";
  /**
   * Percentage of passed tests
   */
  pass_rate_percent: number;
  /**
   * Critical issues blocking deployment
   */
  critical_failures?: {
    scenario_id?: string;
    failure_type?: string;
    impact?: string;
    [k: string]: unknown;
  }[];
  /**
   * Artifact ID for detailed QA report
   */
  qa_report_ref?: string;
  test_environment_used?: {
    browser?: string;
    staging_url?: string;
    test_execution_time?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
