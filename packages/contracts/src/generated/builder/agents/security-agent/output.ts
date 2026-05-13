/* eslint-disable */
/* auto-generated from modules/builder/agents/security-agent/output.schema.json */

export interface SecurityAgentOutput {
  /**
   * List of identified vulnerabilities
   */
  vulnerabilities?: {
    id: string;
    title: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    affected_component?: string;
    recommendation?: string;
    cwe_id?: string;
    [k: string]: unknown;
  }[];
  /**
   * Security score 0-100
   */
  overall_security_score: number;
  critical_count?: number;
  high_count?: number;
  medium_count?: number;
  low_count?: number;
  /**
   * True if critical vulnerabilities found
   */
  launch_blocked: boolean;
  /**
   * Artifact ID for detailed security report
   */
  security_report_ref?: string;
  /**
   * OWASP Top 10 assessment
   */
  owasp_compliance?: {
    a01_broken_access_control?: string;
    a02_cryptographic_failures?: string;
    a03_injection?: string;
    a04_insecure_design?: string;
    a05_security_misconfiguration?: string;
    a06_vulnerable_outdated_components?: string;
    a07_authentication_failures?: string;
    a08_software_data_integrity_failures?: string;
    a09_logging_monitoring_failures?: string;
    a10_ssrf?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
