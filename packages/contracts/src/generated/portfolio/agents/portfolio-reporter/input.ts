/* eslint-disable */
/* auto-generated from modules/portfolio/agents/portfolio-reporter/input.schema.json */

/**
 * All governance cycle outputs for report composition
 */
export interface PortfolioReporterInput {
  /**
   * Output from portfolio-analyst
   */
  portfolio_snapshot: {
    [k: string]: unknown;
  };
  /**
   * Output from risk-monitor
   */
  risk_assessment: {
    [k: string]: unknown;
  };
  /**
   * Output from allocation-agent
   */
  allocation_decisions: {
    [k: string]: unknown;
  };
  /**
   * Output from governance-decision-agent
   */
  governance_decisions: {
    [k: string]: unknown;
  };
  /**
   * Configuration for report generation
   */
  report_config?: {
    /**
     * Target audience for report
     */
    audience?: "operators" | "investors" | "board" | "team";
    include_appendices?: boolean;
    /**
     * Areas to emphasize in report
     */
    focus_areas?: string[];
    /**
     * Previous cycle's report for comparison (optional)
     */
    previous_report?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
