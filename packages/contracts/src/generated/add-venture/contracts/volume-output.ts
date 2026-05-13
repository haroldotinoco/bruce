/* eslint-disable */
/* auto-generated from modules/add-venture/contracts/volume-output.schema.json */

/**
 * Standard output format for each volume of the venture dossier
 */
export interface VolumeOutput {
  venture_id: string;
  volume_number: number;
  volume_title: string;
  /**
   * Volume content (structure varies by volume)
   */
  content: {
    [k: string]: unknown;
  };
  /**
   * Main sections included in this volume
   */
  key_sections?: string[];
  /**
   * Key assumptions driving this volume
   */
  assumptions?: string[];
  /**
   * Agent's confidence in this volume (0-100)
   */
  confidence_score: number;
  confidence_rationale?: string;
  /**
   * Known gaps needing validation
   */
  data_gaps?: string[];
  execution_timestamp?: string;
  agent_id?: string;
  [k: string]: unknown;
}
