/* eslint-disable */
/* auto-generated from modules/builder/agents/integration-agent/output.schema.json */

export interface IntegrationAgentOutput {
  /**
   * Comprehensive specifications for each required integration
   */
  integrations: {
    /**
     * Unique identifier for the integration
     */
    integration_id?: string;
    /**
     * Integration name (e.g., Stripe, Mixpanel)
     */
    name: string;
    /**
     * Category of integration
     */
    type:
      | "payment"
      | "analytics"
      | "communication"
      | "storage"
      | "auth"
      | "monitoring"
      | "data-sync"
      | "sdk"
      | "api"
      | "webhook";
    /**
     * Purpose and function of this integration
     */
    description?: string;
    /**
     * Implementation priority
     */
    priority: "critical" | "high" | "medium" | "low";
    /**
     * Authentication mechanism
     */
    auth_method: "api_key" | "oauth2" | "sdk" | "jwt" | "webhook_signature" | "basic_auth" | "bearer_token" | "custom";
    /**
     * API endpoints or webhooks used
     */
    endpoints?: {
      endpoint_name?: string;
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      url_pattern?: string;
      description?: string;
      request_schema?: {
        [k: string]: unknown;
      };
      response_schema?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    /**
     * Error handling and retry strategy
     */
    error_handling?: {
      /**
       * Retry policy for failed requests
       */
      retry_strategy?: "exponential_backoff" | "linear_backoff" | "fixed_delay" | "none";
      /**
       * Maximum number of retry attempts
       */
      max_retries?: number;
      /**
       * Request timeout in seconds
       */
      timeout_seconds?: number;
      /**
       * Fallback strategy if integration fails (e.g., queue, cache, manual)
       */
      fallback_mechanism?: string;
      /**
       * HTTP error codes and their handling strategies
       */
      error_codes_handled?: string[];
      [k: string]: unknown;
    };
    /**
     * API rate limiting specifications
     */
    rate_limits?: {
      requests_per_minute?: number;
      requests_per_hour?: number;
      requests_per_day?: number;
      burst_limit?: number;
      backoff_strategy?: string;
      notes?: string;
      [k: string]: unknown;
    };
    /**
     * Estimated implementation time in hours
     */
    estimated_setup_hours?: number;
    /**
     * Cost analysis for this integration
     */
    cost_estimate?: {
      monthly_cost?: number;
      setup_cost?: number;
      free_tier_available?: boolean;
      free_tier_limits?: string;
      paid_tier_start?: string;
      cost_scaling_notes?: string;
      [k: string]: unknown;
    };
    /**
     * Token rotation and secret management strategy
     */
    auth_token_rotation?: {
      rotation_required?: boolean;
      rotation_frequency_days?: number;
      rotation_mechanism?: string;
      secret_storage?: "environment_variables" | "secrets_manager" | "vault" | "kms";
      credential_expiration?: string;
      [k: string]: unknown;
    };
    /**
     * Data privacy and security considerations
     */
    data_handling?: {
      stores_pii?: boolean;
      pii_types?: string[];
      encryption_required?: boolean;
      encryption_type?: string;
      compliance_frameworks?: string[];
      data_retention_policy?: string;
      [k: string]: unknown;
    };
    /**
     * Additional implementation considerations and best practices
     */
    implementation_notes?: string;
    /**
     * Identified risks and mitigation strategies
     */
    risks?: {
      risk?: string;
      severity?: "critical" | "high" | "medium" | "low";
      mitigation?: string;
      [k: string]: unknown;
    }[];
    /**
     * Alternative integrations and why this was recommended
     */
    alternatives?: {
      name?: string;
      reason_not_chosen?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  /**
   * High-level summary of integration specifications
   */
  summary: {
    total_integrations?: number;
    total_setup_hours?: number;
    total_monthly_cost?: number;
    free_tier_integrations?: number;
    paid_integrations?: number;
    critical_integrations?: number;
    high_risk_integrations?: number;
    implementation_phases?: {
      phase?: number;
      integrations?: string[];
      estimated_weeks?: number;
      dependencies?: string[];
      [k: string]: unknown;
    }[];
    cost_optimization_recommendations?: string[];
    compliance_notes?: string;
    [k: string]: unknown;
  };
  /**
   * Integration dependencies and ordering requirements
   */
  dependencies?: {
    integration_order?: string[];
    blocking_dependencies?: string[];
    parallel_implementable?: string[];
    [k: string]: unknown;
  };
  /**
   * Overall estimated implementation timeline
   */
  implementation_timeline?: string;
  /**
   * Timestamp of specification generation
   */
  created_at?: string;
  [k: string]: unknown;
}
