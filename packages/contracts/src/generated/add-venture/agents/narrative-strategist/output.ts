/* eslint-disable */
/* auto-generated from modules/add-venture/agents/narrative-strategist/output.schema.json */

export interface NarrativeStrategistOutput {
  venture_id: string;
  volume_number: 6;
  volume_title: string;
  one_liner: string;
  elevator_pitches: {
    thirty_seconds?: string;
    two_minutes?: string;
    [k: string]: unknown;
  };
  messaging_pillars: {
    pillar?: string;
    why_matters?: string;
    supporting_evidence?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Descriptors of brand personality (e.g., confident, expert, pragmatic)
   */
  tone_of_voice: string[];
  brand_narrative: {
    heros_journey?: string;
    what_we_stand_for?: string;
    customer_transformation?: string;
    why_now?: string;
    [k: string]: unknown;
  };
  investor_pitch_hook: string;
  /**
   * @maxItems 5
   */
  tagline_candidates?:
    | []
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string];
  stakeholder_narratives?: {
    customer_narrative?: string;
    investor_narrative?: string;
    employee_narrative?: string;
    partner_narrative?: string;
    [k: string]: unknown;
  };
  assumptions?: string[];
  data_gaps?: string[];
  confidence_score: number;
  confidence_rationale?: string;
  key_sections?: string[];
  execution_timestamp?: string;
  agent_id?: string;
  [k: string]: unknown;
}
