/* eslint-disable */
/* auto-generated from modules/startup-ops/agents/ops-advisor/output.schema.json */

export interface OpsAdvisorOutput {
  /**
   * Venture these recommendations are for
   */
  venture_id: string;
  /**
   * When recommendations were generated
   */
  created_at: string;
  /**
   * Prioritized list of recommendations (max 5)
   *
   * @maxItems 5
   */
  recommendations:
    | []
    | [
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier for this recommendation
           */
          recommendation_id: string;
          /**
           * Operational area this recommendation addresses
           */
          area:
            | "activation"
            | "retention"
            | "revenue"
            | "product_quality"
            | "financial_sustainability"
            | "market_fit"
            | "general";
          /**
           * Short, actionable title
           */
          title: string;
          /**
           * Detailed explanation of why this action matters
           */
          description?: string;
          /**
           * Timeline for execution
           */
          urgency: "immediate" | "this_week" | "next_cycle";
          /**
           * Estimated business outcome if recommendation is executed
           */
          expected_impact?: string;
          /**
           * Concrete, executable action items
           *
           * @minItems 1
           * @maxItems 5
           */
          specific_actions:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
            | [string, string, string, string, string];
          /**
           * KPIs to monitor for success
           */
          metrics_to_watch?: string[];
          /**
           * Reference to anomaly that triggered this recommendation
           */
          created_from_anomaly_id?: string;
          [k: string]: unknown;
        }
      ];
  /**
   * Executive summary of current operational risks and opportunities
   */
  risk_summary: string;
  /**
   * Whether immediate action is required to address health or anomalies
   */
  overall_action_required: boolean;
  /**
   * Reference to health report analyzed
   */
  health_report_id?: string;
  [k: string]: unknown;
}
