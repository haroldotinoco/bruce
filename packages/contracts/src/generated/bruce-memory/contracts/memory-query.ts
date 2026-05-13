/* eslint-disable */
/* auto-generated from modules/bruce-memory/contracts/memory-query.schema.json */

/**
 * Schema for on-demand memory queries and their responses
 */
export interface MemoryQuery {
  query?: {
    query_id?: string;
    question?: string;
    context?: {
      venture_id?: string;
      current_stage?: string;
      market_segment?: string;
      [k: string]: unknown;
    };
    filters?: {
      min_confidence?: number;
      market_segments?: string[];
      stages?: string[];
      source_modules?: string[];
      [k: string]: unknown;
    };
    requested_by_module?: string;
    requested_at?: string;
    [k: string]: unknown;
  };
  response?: {
    query_id?: string;
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
    confidence_overall?: number;
    no_results?: boolean;
    suggested_related_queries?: string[];
    served_at?: string;
    latency_ms?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
