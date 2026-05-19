/* eslint-disable */
/* auto-generated from modules/opportunity/agents/opportunity-analyst/output.schema.json */

/**
 * Deep-dive analysis output consumed by the scoring-agent. TAM/SAM/SOM MUST be emitted as plain numbers in the document's declared `currency` (default USD). Never emit formatted strings like "$100 billion" — the downstream scoring-agent reads these as raw numbers and will assign 0 if it receives strings.
 */
export interface OpportunityAnalystOutput {
  opportunity_id: string;
  title: string;
  problem_statement?: string;
  /**
   * Market sizing at the document root with numeric TAM/SAM/SOM in the declared `currency`. Methodology strings go in `tam_methodology`/`sam_methodology`/`som_methodology`, NOT mixed into the numeric fields.
   */
  market_size_estimate: {
    /**
     * Total Addressable Market as a plain number in `currency`. Example: 100000000000 for $100B. Do NOT emit "$100 billion" or "100B".
     */
    tam: number;
    /**
     * Serviceable Available Market as a plain number in `currency`.
     */
    sam: number;
    /**
     * Serviceable Obtainable Market as a plain number in `currency`.
     */
    som: number;
    /**
     * ISO 4217 currency code for tam/sam/som. Default USD. Always emit this field so downstream code is not source-dependent.
     */
    currency: string;
    /**
     * Confidence in the market sizing estimate, 0..1.
     */
    confidence?: number;
    tam_methodology?: string;
    sam_methodology?: string;
    som_methodology?: string;
    [k: string]: unknown;
  };
  deep_analysis?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
