/* eslint-disable */
/* auto-generated from modules/contracts/builder-to-gtm.schema.json */

/**
 * Handoff from builder module to gtm module. Encapsulates product readiness status, launch metrics, and positioning for go-to-market execution.
 */
export interface BuilderToGTMHandoff {
  /**
   * Venture identifier (UUID v4)
   */
  venture_id: string;
  /**
   * Product name
   */
  product_name: string;
  /**
   * Live product URL or deployment URL
   */
  product_url: string;
  /**
   * Current deployment status
   */
  product_deployment_status?: "staging" | "alpha" | "beta" | "live";
  /**
   * Clear description of what product does
   */
  product_description: string;
  /**
   * The primary value delivered (1-2 sentences)
   */
  core_value_delivered: string;
  /**
   * Features actually shipped (vs. planned)
   */
  mvp_features_shipped: string[];
  /**
   * Features still planned but deferred
   */
  features_deferred?: string[];
  /**
   * Who should buy this product?
   */
  target_user_profile: {
    /**
     * e.g., 'Mid-market SaaS founders'
     */
    user_segment?: string;
    primary_pain_point?: string;
    secondary_pain_points?: string[];
    /**
     * What matters to buyer?
     */
    buying_criteria?: string[];
    [k: string]: unknown;
  };
  /**
   * What makes this product unique?
   *
   * @minItems 1
   */
  key_differentiators: [
    {
      differentiator?: string;
      competitive_advantage?: string;
      [k: string]: unknown;
    },
    ...{
      differentiator?: string;
      competitive_advantage?: string;
      [k: string]: unknown;
    }[]
  ];
  /**
   * Builder's assessment of launch readiness (0-100). Score < 70 may trigger escalation.
   */
  launch_readiness_score: number;
  /**
   * Detailed readiness assessment
   */
  readiness_scorecard?: {
    /**
     * Are core features working?
     */
    core_functionality?: number;
    /**
     * Is product stable?
     */
    reliability?: number;
    /**
     * Does it perform well?
     */
    performance?: number;
    /**
     * Is UX polished?
     */
    user_experience?: number;
    /**
     * Is it documented?
     */
    documentation?: number;
    /**
     * Are security practices in place?
     */
    security?: number;
    [k: string]: unknown;
  };
  /**
   * Known issues or limitations to disclose
   */
  known_limitations?: {
    limitation?: string;
    impact?: "high" | "medium" | "low";
    workaround?: string;
    /**
     * e.g., 'v1.1', '2 weeks'
     */
    timeline_to_fix?: string;
    [k: string]: unknown;
  }[];
  /**
   * Feedback from beta testing (if available)
   */
  beta_user_feedback?: {
    feedback?: string;
    sentiment?: "positive" | "neutral" | "negative";
    user_segment?: string;
    [k: string]: unknown;
  }[];
  /**
   * How easy is it for users to get started?
   */
  onboarding_experience?: {
    /**
     * Minutes until first value is realized
     */
    time_to_value_minutes?: number;
    onboarding_steps?: string[];
    /**
     * Available help (docs, video, etc)
     */
    help_resources?: string[];
    [k: string]: unknown;
  };
  /**
   * Technical implementation details for GTM planning
   */
  technical_implementation?: {
    /**
     * Summary of tech stack used
     */
    tech_stack?: string;
    /**
     * Where is it hosted?
     */
    deployment_infrastructure?: string;
    /**
     * Link to API docs (if applicable)
     */
    api_documentation?: string;
    /**
     * External services product depends on
     */
    third_party_dependencies?: string[];
    [k: string]: unknown;
  };
  /**
   * What analytics are built into the product?
   */
  analytics_instrumentation?: {
    /**
     * Key events being tracked
     */
    events_tracked?: string[];
    /**
     * e.g., 'Mixpanel', 'Amplitude', 'custom'
     */
    analytics_provider?: string;
    dashboard_available?: boolean;
    [k: string]: unknown;
  };
  /**
   * Assets available for marketing
   */
  marketing_assets?: {
    product_screenshots?: boolean;
    demo_video?: boolean;
    product_demo_url?: string;
    case_study_templates?: boolean;
    [k: string]: unknown;
  };
  /**
   * Pricing strategy (if applicable)
   */
  pricing_model?: {
    /**
     * Type of pricing
     */
    pricing_model_type?: "free" | "freemium" | "subscription" | "pay_per_use" | "hybrid";
    price_points?: {
      tier_name?: string;
      price_usd?: number;
      /**
       * e.g., 'monthly', 'annual'
       */
      billing_period?: string;
      included_features?: string[];
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * What must be done before launch can proceed?
   */
  launch_prerequisites?: {
    prerequisite?: string;
    status?: "complete" | "in_progress" | "not_started";
    due_date?: string;
    [k: string]: unknown;
  }[];
  created_at?: string;
}
