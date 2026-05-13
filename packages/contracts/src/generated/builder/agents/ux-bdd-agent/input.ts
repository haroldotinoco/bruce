/* eslint-disable */
/* auto-generated from modules/builder/agents/ux-bdd-agent/input.schema.json */

export interface UXBDDAgentInput {
  functional_spec: {
    [k: string]: unknown;
  };
  user_flows: {
    [k: string]: unknown;
  }[];
  /**
   * Brand visual system (optional)
   */
  design_system?: {
    [k: string]: unknown;
  };
  accessibility_requirements?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
