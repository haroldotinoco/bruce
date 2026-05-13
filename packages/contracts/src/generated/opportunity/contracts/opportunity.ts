/* eslint-disable */
/* auto-generated from modules/opportunity/contracts/opportunity.schema.json */

/**
 * Core opportunity entity representing a market opportunity for venture creation
 */
export interface Opportunity {
  /**
   * Unique identifier (UUID format)
   */
  opportunity_id: string;
  /**
   * Brief opportunity title
   */
  title: string;
  /**
   * Detailed description of the opportunity
   */
  description: string;
  /**
   * Core problem being addressed
   */
  problem_statement: string;
  /**
   * Primary customer segment
   */
  target_segment: string;
  market_size_estimate: {
    /**
     * Total addressable market in USD
     */
    tam: number;
    /**
     * Serviceable addressable market in USD
     */
    sam: number;
    /**
     * Serviceable obtainable market in USD
     */
    som: number;
    currency?: string;
    /**
     * Confidence level of estimate (0-1)
     */
    confidence?: number;
    [k: string]: unknown;
  };
  competition_landscape?: {
    /**
     * Direct competitor names
     */
    direct_competitors?: string[];
    /**
     * Indirect competitor names
     */
    indirect_competitors?: string[];
    /**
     * Intensity of competition in market
     */
    competitive_intensity?: "low" | "medium" | "high";
    /**
     * Potential differentiation strategies
     */
    differentiation_opportunities?: string[];
    [k: string]: unknown;
  };
  /**
   * Where/how this opportunity was discovered
   */
  discovery_source: string;
  /**
   * When opportunity was discovered
   */
  discovery_date: string;
  /**
   * Current status in opportunity pipeline
   */
  status: "discovered" | "screening" | "analyzing" | "scored" | "rejected" | "advanced";
  /**
   * Categorization tags
   */
  tags?: string[];
  [k: string]: unknown;
}
