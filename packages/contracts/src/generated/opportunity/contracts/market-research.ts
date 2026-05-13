/* eslint-disable */
/* auto-generated from modules/opportunity/contracts/market-research.schema.json */

/**
 * Output schema for market-scanner agent discovery phase
 */
export interface MarketResearch {
  /**
   * Unique identifier for this scan cycle
   */
  scan_id: string;
  scan_timestamp: string;
  opportunities_found: {
    title: string;
    problem_statement: string;
    segment: string;
    pain_points: string[];
    /**
     * Signals indicating market readiness
     */
    market_signals?: string[];
    sources: {
      url?: string;
      title?: string;
      relevance?: "high" | "medium" | "low";
      [k: string]: unknown;
    }[];
    /**
     * Confidence that this is a real opportunity (0-1)
     */
    discovery_confidence?: number;
    [k: string]: unknown;
  }[];
  scan_quality?: {
    sources_queried?: number;
    geographic_scope?: string;
    domains_covered?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
