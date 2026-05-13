/* eslint-disable */
/* auto-generated from modules/opportunity/agents/market-scanner/output.schema.json */

/**
 * Loose validation: LLM JSON is normalized in apps/opportunity (scan_id, timestamps, opportunities).
 */
export interface MarketScannerOutput {
  scan_id?: string;
  scan_timestamp?: string;
  opportunities_found?: {
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
