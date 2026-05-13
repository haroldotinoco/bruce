/* eslint-disable */
/* auto-generated from modules/add-venture/saas/billing-events.schema.json */

/**
 * Events that trigger usage billing and metering
 */
export interface AddVentureBillingEvents {
  /**
   * Triggered when dossier generation starts
   */
  "dossier.created"?: {
    event_type?: "dossier.created";
    account_id?: string;
    dossier_id?: string;
    timestamp?: string;
    billing_units?: 1;
    [k: string]: unknown;
  };
  /**
   * Triggered when dossier generation completes successfully
   */
  "dossier.completed"?: {
    event_type?: "dossier.completed";
    account_id?: string;
    dossier_id?: string;
    volumes_generated?: number[];
    timestamp?: string;
    processing_time_seconds?: number;
    /**
     * Billed once per completed dossier
     */
    billing_units?: 1;
    [k: string]: unknown;
  };
  /**
   * Triggered when iteration on volumes completes
   */
  "iteration.completed"?: {
    event_type?: "iteration.completed";
    account_id?: string;
    dossier_id?: string;
    /**
     * @minItems 1
     */
    volumes_iterated?: [number, ...number[]];
    feedback_provided?: boolean;
    timestamp?: string;
    /**
     * Billed once per iteration
     */
    billing_units?: 1;
    [k: string]: unknown;
  };
  /**
   * Triggered when any volume is downloaded (for metering optional)
   */
  "volume.downloaded"?: {
    event_type?: "volume.downloaded";
    account_id?: string;
    dossier_id?: string;
    volume_number?: number;
    format?: "json" | "pdf";
    timestamp?: string;
    /**
     * Optional metering; typically not charged per download
     */
    billing_units?: 0;
    [k: string]: unknown;
  };
  /**
   * Triggered when dossier generation fails; no billing
   */
  "dossier.failed"?: {
    event_type?: "dossier.failed";
    account_id?: string;
    dossier_id?: string;
    error_code?: string;
    error_message?: string;
    timestamp?: string;
    /**
     * No charge for failed jobs
     */
    billing_units?: 0;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
