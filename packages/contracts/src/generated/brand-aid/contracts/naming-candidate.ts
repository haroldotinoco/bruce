/* eslint-disable */
/* auto-generated from modules/brand-aid/contracts/naming-candidate.schema.json */

export interface NamingCandidate {
  /**
   * The candidate brand name
   */
  name: string;
  /**
   * The naming approach or strategy
   */
  approach: "semantic" | "metaphorical" | "invented" | "alliterative" | "multilingual";
  /**
   * Why this name works for the brand
   */
  rationale: string;
  /**
   * Overall score 0-100
   */
  overall_score: number;
  /**
   * Scores for each naming criterion
   */
  scores_by_criteria?: {
    [k: string]: number;
  };
  /**
   * Availability of .com domain
   */
  domain_status?: string;
  /**
   * Trademark conflict risk assessment
   */
  trademark_risk?: string;
  /**
   * How to pronounce the name
   */
  pronunciation?: string;
  [k: string]: unknown;
}
