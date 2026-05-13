/* eslint-disable */
/* auto-generated from modules/contracts/venture-lifecycle.schema.json */

/**
 * Central entity that crosses all modules. Represents the complete state of a venture from discovery through operating/scaling/exit. All modules read and write to this single record; all changes recorded in governance_history for audit.
 */
export interface VentureLifecycleEntity {
  /**
   * Unique identifier for the venture (UUID v4 format)
   */
  venture_id: string;
  /**
   * Current lifecycle stage. generated=opportunity identified, qualified=passed risk filters, structured=hypothesis + brand defined, built=MVP complete, launched=live, operating=post-launch, iterating=testing new hypotheses, scaling=growing revenue/users, paused=temporarily halted, killed=terminated.
   */
  status:
    | "generated"
    | "qualified"
    | "structured"
    | "built"
    | "launched"
    | "operating"
    | "iterating"
    | "scaling"
    | "paused"
    | "killed";
  /**
   * Market context from opportunity module
   */
  opportunity_context?: {
    /**
     * Problem being solved (1-2 sentences)
     */
    problem_statement?: string;
    /**
     * Target market segment (e.g., 'SMB SaaS', 'Creator Economy')
     */
    market_segment?: string;
    /**
     * Total addressable market estimate
     */
    tam?: {
      /**
       * TAM in USD
       */
      value: number;
      currency?: string;
      reasoning?: string;
      [k: string]: unknown;
    };
    /**
     * Opportunity validation score (0-100) from opportunity module screening
     */
    validation_score?: number;
    /**
     * Key market insights from opportunity research
     */
    key_insights?: string[];
    /**
     * Known competitors and their positioning
     */
    competitive_landscape?: {
      competitor_name?: string;
      positioning?: string;
      market_share_pct?: number;
      [k: string]: unknown;
    }[];
    /**
     * Reference to originating opportunity record
     */
    opportunity_id?: string;
    /**
     * When opportunity was screened by opportunity module
     */
    screened_at?: string;
    [k: string]: unknown;
  };
  /**
   * Initial business hypothesis from add-venture module
   */
  hypothesis?: {
    /**
     * Core value proposition (what unique value is delivered)
     */
    value_proposition?: string;
    /**
     * Who the product serves
     */
    target_audience?: {
      demographics?: string[];
      psychographics?: string[];
      pain_points?: string[];
      [k: string]: unknown;
    };
    /**
     * Business model category
     */
    business_model_type?:
      | "saas"
      | "subscription"
      | "marketplace"
      | "creator"
      | "e-commerce"
      | "b2b_services"
      | "freemium"
      | "hardware"
      | "hybrid";
    /**
     * Key metrics to validate hypothesis success
     */
    success_metrics?: {
      /**
       * e.g., 'DAU', 'MRR', 'Retention Rate'
       */
      metric_name: string;
      /**
       * Target value to achieve
       */
      target_value: number;
      /**
       * Unit of measurement (e.g., 'users', 'USD', '%')
       */
      unit: string;
      /**
       * Weeks to achieve target
       */
      timeframe_weeks?: number;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * Brand identity from brand-aid module
   */
  brand_context?: {
    /**
     * Official venture name
     */
    brand_name?: string;
    /**
     * How the brand is positioned in market
     */
    positioning_statement?: string;
    /**
     * Brand voice descriptors (e.g., 'playful', 'professional', 'irreverent')
     */
    tone_of_voice?: string[];
    /**
     * Visual identity mood (e.g., 'modern', 'minimal', 'vibrant')
     */
    visual_mood?: string[];
    /**
     * Logo as SVG string (inline)
     */
    logo_svg?: string;
    /**
     * Color scheme
     */
    color_palette?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      neutral?: string;
      [k: string]: unknown;
    };
    /**
     * Typography scheme
     */
    typography?: {
      /**
       * e.g., 'Inter Bold'
       */
      heading_font?: string;
      /**
       * e.g., 'Inter Regular'
       */
      body_font?: string;
      /**
       * e.g., 'major-third' (1.25x), 'golden-ratio' (1.618x)
       */
      scale?: string;
      [k: string]: unknown;
    };
    /**
     * Reference to artifact_store record for full brand guidelines
     */
    brand_guidelines_artifact_id?: string;
    [k: string]: unknown;
  };
  /**
   * Product specification from builder module
   */
  product_context?: {
    /**
     * Minimal viable product definition
     */
    mvp_scope?: {
      /**
       * Must-have features for launch
       */
      core_features?: string[];
      /**
       * Explicitly deferred features
       */
      out_of_scope?: string[];
      [k: string]: unknown;
    };
    /**
     * Technology choices
     */
    tech_stack?: {
      /**
       * e.g., 'React 18 + TypeScript'
       */
      frontend?: string;
      /**
       * e.g., 'Node.js + Express'
       */
      backend?: string;
      /**
       * e.g., 'PostgreSQL + Redis'
       */
      database?: string;
      /**
       * e.g., 'AWS ECS + CloudFront'
       */
      infrastructure?: string;
      [k: string]: unknown;
    };
    /**
     * Third-party integrations
     */
    integrations?: {
      name?: string;
      purpose?: string;
      [k: string]: unknown;
    }[];
    /**
     * GitHub/GitLab repository URL
     */
    repo_url?: string;
    /**
     * Live product URL (if launched)
     */
    deployed_url?: string;
    /**
     * Current deployment stage
     */
    deployment_status?: "not_deployed" | "staging" | "alpha" | "beta" | "live";
    /**
     * Reference to detailed product specification document
     */
    product_spec_artifact_id?: string;
    [k: string]: unknown;
  };
  /**
   * Go-to-market execution from gtm module
   */
  launch_context?: {
    /**
     * Marketing channels being used
     */
    gtm_channels?: (
      | "organic"
      | "paid_search"
      | "paid_social"
      | "content"
      | "partnerships"
      | "pr"
      | "community"
      | "direct_sales"
      | "influencer"
      | "affiliate"
    )[];
    /**
     * Active campaign identifiers for tracking
     */
    campaign_ids?: string[];
    /**
     * Planned or actual launch date
     */
    launch_date?: string;
    /**
     * Score from gtm module assessing readiness (0-100)
     */
    launch_readiness_score?: number;
    /**
     * Reference to full GTM plan document
     */
    gtm_plan_artifact_id?: string;
    [k: string]: unknown;
  };
  /**
   * Operational metrics tracked by startup-ops module
   */
  performance_metrics?: {
    /**
     * Daily active users (most recent)
     */
    dau?: number;
    /**
     * Weekly active users (most recent)
     */
    wau?: number;
    /**
     * Monthly active users (most recent)
     */
    mau?: number;
    /**
     * Monthly recurring revenue (most recent, USD)
     */
    mrr?: number;
    /**
     * Annual recurring revenue (most recent, USD)
     */
    arr?: number;
    /**
     * Customer acquisition cost (USD)
     */
    cac?: number;
    /**
     * Customer lifetime value (USD)
     */
    ltv?: number;
    /**
     * Monthly retention rate (%)
     */
    retention_rate?: number;
    /**
     * Monthly churn rate (%)
     */
    churn_rate?: number;
    /**
     * Monthly cash burn (USD, negative is positive cash flow)
     */
    burn_rate?: number;
    /**
     * Estimated months of cash runway
     */
    runway_months?: number;
    /**
     * When metrics were last updated
     */
    last_updated?: string;
    [k: string]: unknown;
  };
  /**
   * Append-only log of all governance decisions made by bruce-core or portfolio modules
   */
  governance_history?: {
    /**
     * UUID for this decision record
     */
    decision_id: string;
    /**
     * Type of governance action taken
     */
    decision_type:
      | "initialize"
      | "qualify"
      | "reject"
      | "scale"
      | "iterate"
      | "pause"
      | "unpause"
      | "kill"
      | "resurrect"
      | "reallocate_resources";
    /**
     * Explanation for the decision
     */
    rationale: string;
    /**
     * Confidence in this decision (0-100)
     */
    confidence_score: number;
    /**
     * Which agent/module made the decision (e.g., 'bruce-core', 'portfolio')
     */
    decided_by_agent: string;
    /**
     * References to metrics, reports, or artifacts supporting decision
     */
    supporting_data_refs?: string[];
    timestamp: string;
    /**
     * Trace ID for workflow execution
     */
    correlation_id?: string;
    [k: string]: unknown;
  }[];
  /**
   * When venture record was first created
   */
  created_at: string;
  /**
   * When venture record was last updated
   */
  updated_at: string;
  /**
   * Schema version of this venture record (for migrations)
   */
  version?: number;
}
