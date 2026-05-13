/* eslint-disable */
/* auto-generated from modules/builder/contracts/security-report.schema.json */

export interface SecurityReport {
  /**
   * Unique report identifier
   */
  report_id: string;
  /**
   * Parent build ID
   */
  build_id: string;
  /**
   * Unique audit identifier
   */
  audit_id?: string;
  executed_at?: string;
  /**
   * Agent or system performing audit
   */
  auditor?: string;
  overall_security_score: number;
  /**
   * True if critical vulnerabilities prevent launch
   */
  launch_blocked?: boolean;
  /**
   * All identified vulnerabilities
   */
  vulnerabilities?: {
    vuln_id: string;
    title: string;
    description?: string;
    severity: "critical" | "high" | "medium" | "low";
    affected_component?: string;
    cwe_id?: string;
    recommendation?: string;
    remediation_effort?: string;
    [k: string]: unknown;
  }[];
  /**
   * Vulnerability count summary
   */
  summary?: {
    critical_count?: number;
    high_count?: number;
    medium_count?: number;
    low_count?: number;
    total_count?: number;
    [k: string]: unknown;
  };
  /**
   * OWASP Top 10 assessment
   */
  owasp_assessment?: {
    a01_broken_access_control?: string;
    a02_cryptographic_failures?: string;
    a03_injection?: string;
    a04_insecure_design?: string;
    a05_security_misconfiguration?: string;
    a06_vulnerable_components?: string;
    a07_authentication_failures?: string;
    a08_data_integrity_failures?: string;
    a09_logging_monitoring?: string;
    a10_ssrf?: string;
    [k: string]: unknown;
  };
  /**
   * Known vulnerabilities in dependencies
   */
  dependency_vulnerabilities?: {
    package_name?: string;
    current_version?: string;
    vulnerability_id?: string;
    severity?: string;
    recommended_version?: string;
    [k: string]: unknown;
  }[];
  /**
   * Regulatory compliance check
   */
  compliance_assessment?: {
    gdpr_compliant?: boolean;
    soc2_compliant?: boolean;
    hipaa_compliant?: boolean;
    notes?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
