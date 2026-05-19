/* eslint-disable */
/* auto-generated from modules/bootstrap/agents/handoff-synthesizer/output.schema.json */

export interface HandoffSynthesizerOutput {
  synthesis_phase: "opportunity" | "dossier";
  /**
   * opportunity-to-venture shaped payload
   */
  venture_handoff?: {
    [k: string]: unknown;
  };
  scan_results?: {
    ranked_opportunities?: {
      [k: string]: unknown;
    }[];
    prioritization_timestamp?: string;
    [k: string]: unknown;
  };
  /**
   * dossier-composer shaped final dossier when phase is dossier
   */
  dossier?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
