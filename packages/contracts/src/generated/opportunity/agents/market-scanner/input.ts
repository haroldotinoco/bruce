/* eslint-disable */
/* auto-generated from modules/opportunity/agents/market-scanner/input.schema.json */

/**
 * Input parameters for market-scanner agent discovery cycle
 */
export interface MarketScannerInput {
  /**
   * Unique identifier for this scan cycle
   */
  scan_id: string;
  discovery_focus?: {
    /**
     * Industries to prioritize (e.g., 'healthcare', 'fintech', 'manufacturing')
     */
    industry_verticals?: string[];
    /**
     * Regions to focus on
     */
    geographic_scope?: string[];
    /**
     * Minimum estimated TAM in USD
     */
    minimum_tam?: number;
    /**
     * Specific themes or problem types to emphasize
     */
    focus_areas?: string[];
    [k: string]: unknown;
  };
  search_strategy?: {
    /**
     * Core search terms
     */
    primary_keywords?: string[];
    /**
     * Secondary/long-tail search terms
     */
    secondary_keywords?: string[];
    /**
     * Terms to exclude from results
     */
    exclude_keywords?: string[];
    [k: string]: unknown;
  };
  quality_filters?: {
    /**
     * Minimum confidence threshold (0-1)
     */
    minimum_discovery_confidence?: number;
    /**
     * Minimum independent sources per opportunity
     */
    minimum_sources_required?: number;
    /**
     * Auto-exclusion criteria (e.g., 'illegal', 'requires_fda_approval')
     */
    auto_exclude_criteria?: string[];
    [k: string]: unknown;
  };
  output_targets?: {
    /**
     * Minimum opportunities to return
     */
    minimum_opportunities?: number;
    /**
     * Maximum opportunities to return
     */
    maximum_opportunities?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
