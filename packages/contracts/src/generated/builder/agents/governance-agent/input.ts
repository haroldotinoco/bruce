/* eslint-disable */
/* auto-generated from modules/builder/agents/governance-agent/input.schema.json */

export interface GovernanceAgentInput {
  /**
   * Product validation stage report
   */
  functional_spec_report: {
    [k: string]: unknown;
  };
  /**
   * UX/BDD specification stage report
   */
  bdd_spec_report: {
    [k: string]: unknown;
  };
  /**
   * Architecture design stage report
   */
  architecture_report?: {
    [k: string]: unknown;
  };
  /**
   * Backend development stage report
   */
  backend_report?: {
    [k: string]: unknown;
  };
  /**
   * Frontend development stage report
   */
  frontend_report?: {
    [k: string]: unknown;
  };
  /**
   * QA testing stage report
   */
  qa_report: {
    [k: string]: unknown;
  };
  /**
   * Security audit stage report
   */
  security_report: {
    [k: string]: unknown;
  };
  /**
   * Monitoring and alerting strategy
   */
  post_launch_monitoring_plan?: {
    [k: string]: unknown;
  };
  /**
   * Steps to rollback in case of critical issues
   */
  rollback_procedure?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
