/* eslint-disable */
/* auto-generated from modules/startup-ops/saas/tenant.schema.json */

/**
 * Tenant context schema for StartupOps module defining operational health monitoring configuration per account
 */
export interface StartupOpsTenantConfiguration {
  /**
   * Unique account identifier
   */
  account_id: string;
  /**
   * Billing plan tier determining feature availability
   */
  plan?: "free" | "pro" | "enterprise";
  /**
   * List of venture IDs being monitored under this account
   *
   * @minItems 0
   */
  monitored_ventures: string[];
  /**
   * Frequency of health monitoring checks in hours (0.25 = 15min for enterprise, 6 for pro)
   */
  monitoring_frequency_hours: number;
  /**
   * Dimensions of operational health to monitor
   *
   * @minItems 1
   */
  health_dimensions_enabled: [
    "activation" | "retention" | "revenue" | "product_quality" | "financial_sustainability" | "market_fit",
    ...("activation" | "retention" | "revenue" | "product_quality" | "financial_sustainability" | "market_fit")[]
  ];
  /**
   * Anomaly detection configuration
   */
  anomaly_detection?: {
    enabled: boolean;
    /**
     * Standard deviations from mean to trigger anomaly alert
     */
    threshold_sigma?: number;
    /**
     * Historical window for baseline calculation
     */
    lookback_days?: number;
    [k: string]: unknown;
  };
  /**
   * Webhook configuration for anomaly escalations
   */
  escalation_webhook?: {
    enabled?: boolean;
    /**
     * Webhook endpoints for escalations
     */
    urls?: string[];
    retry_policy?: {
      max_retries?: number;
      backoff_seconds?: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Frequency of health reports
   */
  reporting_cadence?: "weekly" | "biweekly" | "monthly" | "custom";
  /**
   * Email addresses for automated health reports
   */
  report_recipients?: string[];
  /**
   * Connected data source credentials and configuration per venture
   */
  data_sources?: {
    [k: string]: {
      venture_id?: string;
      /**
       * Product analytics integration
       */
      analytics?: {
        provider?: "mixpanel" | "amplitude" | "segment" | "custom";
        /**
         * Encrypted API key for analytics provider
         */
        api_key_encrypted?: string;
        workspace_id?: string;
        [k: string]: unknown;
      };
      /**
       * Financial data integration
       */
      financial?: {
        provider?: "stripe" | "custom";
        /**
         * Encrypted API key for financial provider
         */
        api_key_encrypted?: string;
        account_id?: string;
        [k: string]: unknown;
      };
      /**
       * Go-to-market metrics integration
       */
      gtm?: {
        provider?: "salesforce" | "hubspot" | "pipedrive" | "custom";
        api_key_encrypted?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
  };
  /**
   * Custom thresholds for health dimension scoring (enterprise only)
   */
  custom_thresholds?: {
    [k: string]: {
      warning_level?: number;
      critical_level?: number;
      [k: string]: unknown;
    };
  };
  /**
   * Timestamp of tenant configuration creation
   */
  created_at?: string;
  /**
   * Timestamp of last configuration update
   */
  updated_at?: string;
  [k: string]: unknown;
}
