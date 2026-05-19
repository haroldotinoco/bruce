/* eslint-disable */
/* auto-generated from modules/bootstrap/agents/handoff-synthesizer/input.schema.json */

export interface HandoffSynthesizerInput {
  /**
   * Operator description of the venture idea
   */
  prompt: string;
  target_module: "add-venture" | "brand-aid";
  /**
   * Venture UUID
   */
  venture_id: string;
  venture_name?: string;
  /**
   * Which artifact pack to generate in this call
   */
  synthesis_phase?: "opportunity" | "dossier";
  /**
   * Prior opportunity pack when synthesizing dossier
   */
  opportunity_handoff?: {
    [k: string]: unknown;
  };
  /**
   * Schema validation errors from a previous attempt
   */
  validation_errors?: string[];
  [k: string]: unknown;
}
