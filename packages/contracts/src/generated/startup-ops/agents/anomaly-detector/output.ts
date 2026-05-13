/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/anomaly-detector/output.schema.json */

export interface AnomalyDetectionOutput {
  /**
   * Venture this anomaly detection run is for
   */
  venture_id: string;
  /**
   * Timestamp when anomaly detection completed
   */
  detected_at: string;
  /**
   * Array of detected anomalies
   */
  anomalies_detected: {
    /**
     * Unique identifier for this anomaly
     */
    anomaly_id: string;
    /**
     * Name of metric with anomaly
     */
    metric_name: string;
    /**
     * Classification of anomaly type
     */
    type: "sudden_drop" | "concerning_trend" | "positive_breakout" | "sustained_decline";
    /**
     * Severity level requiring different response levels
     */
    severity: "info" | "warning" | "critical";
    /**
     * Current metric value
     */
    current_value: number;
    /**
     * Baseline (4-week average or previous value)
     */
    baseline_value: number;
    /**
     * Percentage change from baseline
     */
    delta_percent?: number;
    /**
     * Standard deviations from mean (if calculable)
     */
    z_score?: number;
    /**
     * Human-readable description of the anomaly
     */
    description?: string;
    /**
     * Suggested investigation or remediation action
     */
    recommendation?: string;
    /**
     * Whether this anomaly requires immediate escalation
     */
    requires_escalation?: boolean;
    [k: string]: unknown;
  }[];
  /**
   * Count of anomalies by severity level
   */
  anomaly_count_by_severity: {
    critical: number;
    warning: number;
    info: number;
    [k: string]: unknown;
  };
  /**
   * Reference to current metric snapshot analyzed
   */
  snapshot_id?: string;
  /**
   * Whether any detected anomaly requires escalation
   */
  escalation_required?: boolean;
  [k: string]: unknown;
}
