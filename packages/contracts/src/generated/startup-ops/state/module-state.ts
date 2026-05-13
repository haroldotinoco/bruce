/* eslint-disable */
/* auto-generated from modules/startup-ops/state/module-state.schema.json */

/**
 * Module-level state for startup-ops including metric history and source health
 */
export interface StartupOpsModuleState {
  module_id?: string;
  last_updated?: string;
  ventures?: {
    [k: string]: {
      venture_id?: string;
      /**
       * Last 4 metric snapshots for trend analysis
       *
       * @maxItems 4
       */
      metric_history?:
        | []
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
       * Last 4 health reports for trend calculation
       *
       * @maxItems 4
       */
      health_history?:
        | []
        | [
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            }
          ]
        | [
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            },
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            }
          ]
        | [
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            },
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            },
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            }
          ]
        | [
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            },
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            },
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            },
            {
              health_report_id?: string;
              scored_at?: string;
              composite_score?: number;
              [k: string]: unknown;
            }
          ];
      /**
       * Health status of each data source
       */
      source_health?: {
        [k: string]: {
          source?: string;
          success_rate?: number;
          consecutive_failures?: number;
          last_failure_at?: string | null;
          last_failure_reason?: string | null;
          [k: string]: unknown;
        };
      };
      last_ingestion?: string;
      last_health_check?: string;
      last_anomaly_detection?: string;
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}
