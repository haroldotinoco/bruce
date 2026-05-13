/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/anomaly-detector/input.schema.json */

export interface AnomalyDetectionInput {
  current_snapshot: {
    snapshot_id: string;
    venture_id?: string;
    collected_at?: string;
    metrics: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Previous 4 metric snapshots for baseline calculation and trend analysis
   *
   * @minItems 1
   * @maxItems 4
   */
  last_4_snapshots:
    | [
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        }
      ]
    | [
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        },
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        }
      ]
    | [
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        },
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        },
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        }
      ]
    | [
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        },
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        },
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        },
        {
          snapshot_id?: string;
          collected_at?: string;
          metrics?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        }
      ];
  /**
   * Current health scores for severity context
   */
  health_scores: {
    composite_score?: number;
    dimension_scores?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  venture_context?: {
    stage?: "seed" | "early" | "growth";
    /**
     * Known external events (e.g., 'major_customer_churn', 'paid_campaign_launch')
     */
    known_events?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
