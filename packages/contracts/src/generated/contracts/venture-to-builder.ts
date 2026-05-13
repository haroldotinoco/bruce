/* eslint-disable */
/* auto-generated from modules/contracts/venture-to-builder.schema.json */

/**
 * Handoff from add-venture module to builder module (runs in parallel with brand-aid handoff). Encapsulates product hypothesis, MVP scope, tech requirements, and success metrics to enable technical implementation planning.
 */
export interface VentureToBuilderHandoff {
  /**
   * Venture identifier (UUID v4)
   */
  venture_id: string;
  /**
   * MVP definition - what must ship, what defers
   */
  mvp_scope: {
    /**
     * Must-have features for launch
     *
     * @minItems 1
     */
    core_features: [
      {
        feature_name: string;
        description: string;
        user_stories?: string[];
        acceptance_criteria?: string[];
        priority?: "critical" | "high" | "medium" | "low";
        /**
         * e.g., 'L' (Large), 'M' (Medium), 'S' (Small) or in days
         */
        estimated_effort?: string;
        [k: string]: unknown;
      },
      ...{
        feature_name: string;
        description: string;
        user_stories?: string[];
        acceptance_criteria?: string[];
        priority?: "critical" | "high" | "medium" | "low";
        /**
         * e.g., 'L' (Large), 'M' (Medium), 'S' (Small) or in days
         */
        estimated_effort?: string;
        [k: string]: unknown;
      }[]
    ];
    /**
     * Explicitly deferred features (for v2+)
     */
    out_of_scope?: {
      feature_name?: string;
      /**
       * Why is this deferred?
       */
      rationale?: string;
      [k: string]: unknown;
    }[];
    /**
     * Third-party services to integrate
     */
    integrations?: {
      /**
       * e.g., 'Stripe', 'Auth0', 'SendGrid'
       */
      service_name?: string;
      purpose?: string;
      required_for_mvp?: boolean;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * Technology choices
   */
  tech_stack: {
    frontend: {
      /**
       * e.g., 'React 18'
       */
      framework?: string;
      /**
       * e.g., 'TypeScript'
       */
      language?: string;
      /**
       * e.g., 'Vite'
       */
      build_tool?: string;
      /**
       * e.g., 'Tailwind CSS', 'Shadcn/ui'
       */
      ui_library?: string;
      /**
       * e.g., 'Redux', 'Zustand', 'Context API'
       */
      state_management?: string;
      [k: string]: unknown;
    };
    backend: {
      /**
       * e.g., 'Node.js 20', 'Python 3.11'
       */
      runtime?: string;
      /**
       * e.g., 'Express', 'FastAPI', 'Rails'
       */
      framework?: string;
      /**
       * e.g., 'JavaScript', 'Python', 'Ruby'
       */
      language?: string;
      /**
       * API architecture
       */
      api_style?: "rest" | "graphql" | "grpc";
      [k: string]: unknown;
    };
    database: {
      /**
       * e.g., 'PostgreSQL 15'
       */
      primary?: string;
      /**
       * e.g., 'Redis'
       */
      cache?: string;
      /**
       * e.g., 'Elasticsearch', 'Meilisearch'
       */
      search?: string;
      [k: string]: unknown;
    };
    infrastructure: {
      /**
       * e.g., 'AWS', 'Vercel', 'Heroku', 'DigitalOcean'
       */
      hosting?: string;
      /**
       * e.g., 'ECS', 'Lambda', 'App Engine'
       */
      compute?: string;
      /**
       * e.g., 'CloudFront', 'Cloudflare'
       */
      cdn?: string;
      /**
       * e.g., 'S3', 'Google Cloud Storage'
       */
      storage?: string;
      [k: string]: unknown;
    };
    /**
     * e.g., 'OAuth2', 'JWT', 'Magic Links'
     */
    authentication?: string;
    /**
     * Analytics tools to integrate
     */
    analytics?: string[];
    [k: string]: unknown;
  };
  /**
   * Performance and quality targets
   */
  non_functional_requirements?: {
    /**
     * e.g., 200ms for API responses
     */
    target_response_time_ms?: number;
    /**
     * e.g., 99.5
     */
    uptime_sla?: number;
    /**
     * Expected concurrent users at launch
     */
    max_concurrent_users?: number;
    /**
     * Projected users 6 months post-launch
     */
    projected_users_month_6?: number;
    [k: string]: unknown;
  };
  /**
   * Core user journeys and stories
   */
  user_stories: {
    story_title?: string;
    /**
     * e.g., 'As a user, I want to X so that Y'
     */
    story_text?: string;
    acceptance_criteria?: string[];
    flow_steps?: string[];
    [k: string]: unknown;
  }[];
  /**
   * KPIs for MVP validation
   */
  success_metrics: {
    /**
     * e.g., 'Sign-up Conversion', 'Feature Activation'
     */
    metric_name?: string;
    target_value?: number;
    /**
     * e.g., '%', 'days', 'count'
     */
    unit?: string;
    /**
     * Implementation details
     */
    how_to_measure?: string;
    [k: string]: unknown;
  }[];
  /**
   * UX and design requirements
   */
  ux_requirements?: {
    /**
     * e.g., 'Desktop', 'Mobile', 'Tablet'
     */
    target_devices?: string[];
    /**
     * Is this mobile-first?
     */
    mobile_first?: boolean;
    /**
     * Accessibility compliance level
     */
    accessibility_requirements?: "wcag_a" | "wcag_aa" | "wcag_aaa";
    /**
     * Browsers to support
     */
    browser_support?: string[];
    [k: string]: unknown;
  };
  /**
   * Security and compliance needs
   */
  security_requirements?: {
    /**
     * Require data encryption at rest and in transit?
     */
    data_encryption?: boolean;
    gdpr_compliance?: boolean;
    soc2_compliance?: boolean;
    /**
     * If handling payments
     */
    pci_dss_compliance?: boolean;
    /**
     * e.g., 'OAuth', 'SAML'
     */
    authentication_method?: string;
    /**
     * e.g., 'Delete within 30 days of account closure'
     */
    user_data_retention?: string;
    [k: string]: unknown;
  };
  /**
   * Industry/region-specific compliance
   */
  compliance_requirements?: string[];
  /**
   * How will MVP be deployed and released?
   */
  deployment_strategy?: {
    /**
     * e.g., 'Daily', 'Weekly'
     */
    deployment_frequency?: string;
    /**
     * e.g., 'GitHub Actions', 'CircleCI'
     */
    ci_cd_pipeline?: string;
    /**
     * How to handle failed deployments
     */
    rollback_strategy?: string;
    [k: string]: unknown;
  };
  /**
   * Technical decisions still to be made
   */
  open_questions?: {
    question?: string;
    options?: string[];
    impact?: "high" | "medium" | "low";
    [k: string]: unknown;
  }[];
  created_at?: string;
}
