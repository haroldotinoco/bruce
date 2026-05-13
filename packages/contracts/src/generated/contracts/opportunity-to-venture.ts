/* eslint-disable */
/* auto-generated from modules/contracts/opportunity-to-venture.schema.json */

/**
 * Handoff contract from opportunity module to add-venture module. Encapsulates validation results and market context from opportunity screening. Triggers venture initialization in add-venture if validation passes.
 */
export interface OpportunityToVentureHandoff {
  /**
   * Reference to originating opportunity record
   */
  opportunity_id: string;
  /**
   * Clear articulation of the problem being solved (1-2 sentences)
   */
  problem_statement: string;
  /**
   * Deeper context on why this problem exists and who experiences it
   */
  problem_context?: string;
  /**
   * Target market segment (e.g., 'SMB SaaS', 'Creator Economy', 'Enterprise DevOps')
   */
  market_segment: string;
  /**
   * Estimated total addressable market
   */
  market_size_estimate: {
    /**
     * TAM in USD
     */
    tam: number;
    /**
     * How TAM was calculated
     */
    tam_reasoning?: string;
    /**
     * SAM (Serviceable Addressable Market) in USD
     */
    addressable_market?: number;
    /**
     * SOM (Serviceable Obtainable Market) in USD - realistic 5-year capture
     */
    capturable_market?: number;
    [k: string]: unknown;
  };
  /**
   * Overall opportunity validation score (0-100). Score > 70 typically qualifies for venture creation.
   */
  validation_score: number;
  /**
   * Breakdown of validation scoring
   */
  validation_criteria?: {
    /**
     * How acute is the problem?
     */
    problem_severity_score?: number;
    /**
     * Is the addressable market large enough?
     */
    market_size_score?: number;
    /**
     * How crowded is the market? (lower = less competition)
     */
    competitive_intensity_score?: number;
    /**
     * Does the team have relevant expertise?
     */
    founder_market_fit_score?: number;
    /**
     * Is there a defensible angle?
     */
    uniqueness_score?: number;
    [k: string]: unknown;
  };
  /**
   * Key findings from market research
   */
  key_insights: {
    insight?: string;
    /**
     * Data or examples supporting insight
     */
    evidence?: string;
    confidence_score?: number;
    [k: string]: unknown;
  }[];
  /**
   * Known competitors and their positioning
   */
  competitive_landscape?: {
    competitor_name?: string;
    /**
     * How are they positioned?
     */
    positioning?: string;
    /**
     * Estimated market share (%)
     */
    market_share_estimate?: number;
    strengths?: string[];
    weaknesses?: string[];
    /**
     * e.g., 'Bootstrapped', 'Series A', 'Public'
     */
    funding_status?: string;
    [k: string]: unknown;
  }[];
  /**
   * Who is the ideal customer?
   */
  target_customer_profile?: {
    /**
     * e.g., 'Mid-market B2B SaaS companies'
     */
    customer_segment?: string;
    pain_points?: string[];
    /**
     * Who makes the decision? (e.g., 'VP Engineering')
     */
    buying_authority?: string;
    /**
     * Price sensitivity analysis
     */
    willingness_to_pay?: {
      currency?: string;
      /**
       * What would customer budget for this?
       */
      estimated_monthly_budget?: number;
      price_sensitivity?: "very_price_sensitive" | "moderately_sensitive" | "low_sensitivity";
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Suggested go-to-market approach based on market research
   */
  recommended_approach?: string;
  /**
   * Risks that could cause this opportunity to be rejected at add-venture stage
   */
  rejection_risk_flags?: {
    risk_type?:
      | "market_size_too_small"
      | "too_competitive"
      | "unproven_problem"
      | "founder_skill_gaps"
      | "regulatory_constraints"
      | "technical_feasibility_unclear"
      | "capital_requirements_too_high";
    description?: string;
    severity?: "low" | "medium" | "high";
    /**
     * How could this be addressed?
     */
    mitigation?: string;
    [k: string]: unknown;
  }[];
  /**
   * What should add-venture validate further?
   */
  next_validation_steps?: string[];
  /**
   * When opportunity module screened this
   */
  screened_at: string;
  /**
   * Which opportunity agent instance screened this
   */
  screened_by_agent?: string;
  /**
   * Sources and references for market data
   */
  references?: {
    source?: string;
    url?: string;
    retrieved_at?: string;
    [k: string]: unknown;
  }[];
}
