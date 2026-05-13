/* eslint-disable */
/* auto-generated from modules/bruce-memory/agents/cross-venture-analyst/input.schema.json */

export interface CrossVentureAnalystInput {
  /**
   * Summary data for each venture to be analyzed
   *
   * @minItems 2
   */
  ventures_data: [
    {
      venture_id: string;
      venture_name?: string;
      stage: "structured" | "built" | "launched" | "operating" | "iterating" | "scaling" | "paused" | "killed";
      market_segment?: string;
      business_model?: string;
      outcome: "success" | "failure" | "ongoing";
      weeks_live?: number;
      key_metrics: {
        [k: string]: unknown;
      };
      learning_records: {
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    },
    {
      venture_id: string;
      venture_name?: string;
      stage: "structured" | "built" | "launched" | "operating" | "iterating" | "scaling" | "paused" | "killed";
      market_segment?: string;
      business_model?: string;
      outcome: "success" | "failure" | "ongoing";
      weeks_live?: number;
      key_metrics: {
        [k: string]: unknown;
      };
      learning_records: {
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    },
    ...{
      venture_id: string;
      venture_name?: string;
      stage: "structured" | "built" | "launched" | "operating" | "iterating" | "scaling" | "paused" | "killed";
      market_segment?: string;
      business_model?: string;
      outcome: "success" | "failure" | "ongoing";
      weeks_live?: number;
      key_metrics: {
        [k: string]: unknown;
      };
      learning_records: {
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    }[]
  ];
  analysis_type:
    | "success_factors"
    | "failure_patterns"
    | "timing_analysis"
    | "segment_comparison"
    | "gtm_effectiveness"
    | "unit_economics_comparison";
  time_range?: {
    start?: string;
    end?: string;
    [k: string]: unknown;
  };
  /**
   * Minimum number of ventures required to assert a pattern. Default: 3.
   */
  min_ventures_in_pattern?: number;
  /**
   * Optional filter: only analyze ventures in these market segments
   */
  focus_segments?: string[];
  [k: string]: unknown;
}
