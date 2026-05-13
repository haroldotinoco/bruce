/* eslint-disable */
/* auto-generated from modules/contracts/provider-registry.schema.json */

/**
 * Global registry of available LLM providers and models. Enables runtime provider routing without hardcoding. Agents declare preferred provider in capabilities.json; platform uses this registry to verify availability and select model.
 */
export interface LLMProviderRegistry {
  /**
   * When 'openrouter', all LLM calls route through OpenRouter (https://openrouter.ai) regardless of individual provider settings. When 'direct', each provider is called directly. OpenRouter provides a unified API for all major LLM providers. When routing_mode=openrouter, set api_key_env_ref to OPENROUTER_API_KEY and use model IDs with provider prefix (e.g., anthropic/claude-opus-4-6).
   */
  routing_mode?: "direct" | "openrouter";
  /**
   * Array of available LLM provider configurations
   *
   * @minItems 1
   */
  providers: [
    {
      /**
       * Provider identifier
       */
      name: "openai" | "anthropic" | "google" | "openrouter";
      /**
       * Human-readable name (e.g., 'OpenAI')
       */
      display_name?: string;
      /**
       * Base API endpoint URL
       */
      api_endpoint: string;
      /**
       * Environment variable name for API key (e.g., 'OPENAI_API_KEY')
       */
      api_key_env_ref: string;
      /**
       * Available models from this provider
       */
      models: {
        /**
         * Model identifier (e.g., 'gpt-4-turbo', 'claude-opus-4')
         */
        model_id: string;
        /**
         * Human-readable model name
         */
        display_name: string;
        /**
         * Model version/release date (e.g., '2024-04-09')
         */
        version?: string;
        /**
         * Max input tokens
         */
        context_window_tokens: number;
        /**
         * Can process images
         */
        supports_vision?: boolean;
        /**
         * Can use function calling / tools
         */
        supports_tools: boolean;
        /**
         * Can guarantee JSON schema compliance
         */
        supports_structured_output?: boolean;
        /**
         * Cost in USD
         */
        input_cost_per_1m_tokens?: number;
        /**
         * Cost in USD
         */
        output_cost_per_1m_tokens?: number;
        /**
         * Geographic regions where model is available
         */
        supported_regions?: string[];
        /**
         * Model maturity/stability
         */
        maturity?: "experimental" | "beta" | "stable" | "deprecated";
        [k: string]: unknown;
      }[];
      /**
       * Default model ID if not specified in capabilities.json
       */
      default_model: string;
      /**
       * API rate limiting
       */
      rate_limits: {
        requests_per_minute?: number;
        tokens_per_minute?: number;
        concurrent_requests?: number;
        [k: string]: unknown;
      };
      /**
       * Authentication configuration
       */
      authentication?: {
        type?: "api_key" | "oauth" | "bearer_token";
        /**
         * HTTP header for auth (e.g., 'Authorization')
         */
        header_name?: string;
        /**
         * Prefix for header value (e.g., 'Bearer')
         */
        header_prefix?: string;
        [k: string]: unknown;
      };
      /**
       * Current provider status
       */
      status?: "active" | "degraded" | "maintenance" | "offline";
      /**
       * URL for status monitoring
       */
      status_page_url?: string;
      /**
       * Feature matrix for this provider
       */
      supported_capabilities?: {
        function_calling?: boolean;
        vision?: boolean;
        structured_outputs?: boolean;
        streaming?: boolean;
        batch_processing?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    },
    ...{
      /**
       * Provider identifier
       */
      name: "openai" | "anthropic" | "google" | "openrouter";
      /**
       * Human-readable name (e.g., 'OpenAI')
       */
      display_name?: string;
      /**
       * Base API endpoint URL
       */
      api_endpoint: string;
      /**
       * Environment variable name for API key (e.g., 'OPENAI_API_KEY')
       */
      api_key_env_ref: string;
      /**
       * Available models from this provider
       */
      models: {
        /**
         * Model identifier (e.g., 'gpt-4-turbo', 'claude-opus-4')
         */
        model_id: string;
        /**
         * Human-readable model name
         */
        display_name: string;
        /**
         * Model version/release date (e.g., '2024-04-09')
         */
        version?: string;
        /**
         * Max input tokens
         */
        context_window_tokens: number;
        /**
         * Can process images
         */
        supports_vision?: boolean;
        /**
         * Can use function calling / tools
         */
        supports_tools: boolean;
        /**
         * Can guarantee JSON schema compliance
         */
        supports_structured_output?: boolean;
        /**
         * Cost in USD
         */
        input_cost_per_1m_tokens?: number;
        /**
         * Cost in USD
         */
        output_cost_per_1m_tokens?: number;
        /**
         * Geographic regions where model is available
         */
        supported_regions?: string[];
        /**
         * Model maturity/stability
         */
        maturity?: "experimental" | "beta" | "stable" | "deprecated";
        [k: string]: unknown;
      }[];
      /**
       * Default model ID if not specified in capabilities.json
       */
      default_model: string;
      /**
       * API rate limiting
       */
      rate_limits: {
        requests_per_minute?: number;
        tokens_per_minute?: number;
        concurrent_requests?: number;
        [k: string]: unknown;
      };
      /**
       * Authentication configuration
       */
      authentication?: {
        type?: "api_key" | "oauth" | "bearer_token";
        /**
         * HTTP header for auth (e.g., 'Authorization')
         */
        header_name?: string;
        /**
         * Prefix for header value (e.g., 'Bearer')
         */
        header_prefix?: string;
        [k: string]: unknown;
      };
      /**
       * Current provider status
       */
      status?: "active" | "degraded" | "maintenance" | "offline";
      /**
       * URL for status monitoring
       */
      status_page_url?: string;
      /**
       * Feature matrix for this provider
       */
      supported_capabilities?: {
        function_calling?: boolean;
        vision?: boolean;
        structured_outputs?: boolean;
        streaming?: boolean;
        batch_processing?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[]
  ];
  /**
   * Default provider fallback order if primary provider is unavailable
   */
  fallback_order: ("openai" | "anthropic" | "google" | "openrouter")[];
  /**
   * Default timeout for any LLM API call
   */
  global_timeout_seconds?: number;
  /**
   * Retry behavior for failed API calls
   */
  retry_policy?: {
    max_retries?: number;
    initial_delay_ms?: number;
    max_delay_ms?: number;
    backoff_multiplier?: number;
    [k: string]: unknown;
  };
  /**
   * When this registry was last updated
   */
  updated_at?: string;
}
