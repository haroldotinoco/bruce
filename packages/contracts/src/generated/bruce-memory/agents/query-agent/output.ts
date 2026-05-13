/* eslint-disable */
/* auto-generated from modules/bruce-memory/agents/query-agent/output.schema.json */

export interface QueryAgentOutput {
  query_id: string;
  question: string;
  /**
   * @maxItems 5
   */
  relevant_patterns?:
    | []
    | [
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        },
        {
          pattern_id?: string;
          statement?: string;
          confidence?: number;
          evidence_count?: number;
          relevance_score?: number;
          action_implication?: string;
          [k: string]: unknown;
        }
      ];
  /**
   * 2-3 sentence synthesis of what memory knows about this question
   */
  synthesis?: string;
  /**
   * Overall confidence in the response based on pattern confidence and evidence count
   */
  confidence_overall?: number;
  /**
   * True if no patterns matched at minimum confidence threshold
   */
  no_results?: boolean;
  /**
   * Related queries that might yield results
   */
  suggested_related_queries?: string[];
  served_at?: string;
  /**
   * Response time in milliseconds
   */
  latency_ms?: number;
  [k: string]: unknown;
}
