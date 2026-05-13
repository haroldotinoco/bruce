/* eslint-disable */
/* auto-generated from modules/startup-ops/saas/billing-events.schema.json */

/**
 * Billing events emitted by StartupOps module for usage tracking, metering, and invoice generation
 */
export interface StartupOpsBillingEventsSchema {
  /**
   * Emitted when StartupOps monitoring is activated for a venture
   */
  "startup-ops.monitoring.activated"?: {
    event_id: string;
    event_type: "startup-ops.monitoring.activated";
    account_id: string;
    venture_id: string;
    /**
     * What triggered the monitoring activation
     */
    trigger: "gtm_launch" | "manual_activation";
    plan_tier?: "pro" | "enterprise";
    /**
     * Monitoring check frequency in hours
     */
    monitoring_frequency_hours?: number;
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Emitted when a health check completes, regardless of result
   */
  "startup-ops.health-check.completed"?: {
    event_id: string;
    event_type: "startup-ops.health-check.completed";
    account_id: string;
    venture_id: string;
    /**
     * Time taken to complete the health check
     */
    check_duration_seconds?: number;
    /**
     * Which data sources were queried during this check
     */
    data_sources_accessed?: (
      | "mixpanel"
      | "amplitude"
      | "segment"
      | "stripe"
      | "salesforce"
      | "hubspot"
      | "pipedrive"
    )[];
    /**
     * Health dimensions included in this check
     */
    dimensions_calculated?: string[];
    overall_score?: number;
    /**
     * Whether the health check succeeded
     */
    status: "success" | "partial_failure" | "failure";
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Emitted when an anomaly is detected in venture operational health
   */
  "startup-ops.anomaly.detected"?: {
    event_id: string;
    event_type: "startup-ops.anomaly.detected";
    account_id: string;
    venture_id: string;
    anomaly_id: string;
    dimension: "activation" | "retention" | "revenue" | "product_quality" | "financial_sustainability" | "market_fit";
    /**
     * Severity level of the anomaly
     */
    severity: "warning" | "critical";
    /**
     * Standard deviations from baseline
     */
    sigma_deviation?: number;
    /**
     * Current observed value
     */
    detected_value?: number;
    /**
     * Historical baseline value
     */
    baseline_value?: number;
    /**
     * Number of anomalies detected this billing period for this venture
     */
    anomaly_count_this_period?: number;
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Emitted when an escalation action is triggered for detected anomalies
   */
  "startup-ops.escalation.triggered"?: {
    event_id: string;
    event_type: "startup-ops.escalation.triggered";
    account_id: string;
    venture_id: string;
    escalation_id: string;
    /**
     * Type of escalation triggered
     */
    escalation_type?: "webhook" | "email" | "slack" | "pagerduty";
    /**
     * Number of anomalies included in this escalation
     */
    anomalies_included?: number;
    /**
     * Number of webhook endpoints called
     */
    webhook_count?: number;
    /**
     * Escalation delivery status
     */
    status?: "sent" | "failed" | "partial";
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Emitted when a health report is generated (weekly or custom)
   */
  "startup-ops.report.generated"?: {
    event_id: string;
    event_type: "startup-ops.report.generated";
    account_id: string;
    venture_id: string;
    report_id: string;
    /**
     * Type of report generated
     */
    report_type: "weekly" | "custom";
    period_start?: string;
    period_end?: string;
    /**
     * Report output format
     */
    format?: "json" | "pdf";
    /**
     * Number of pages in PDF report (if applicable)
     */
    pages?: number;
    /**
     * Number of anomalies in the report
     */
    anomalies_included?: number;
    /**
     * Number of recommendations in the report
     */
    recommendations_included?: number;
    /**
     * Number of recipients who received the report
     */
    recipients_count?: number;
    timestamp: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
