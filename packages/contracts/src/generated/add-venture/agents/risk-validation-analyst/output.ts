/* eslint-disable */
/* auto-generated from modules/add-venture/agents/risk-validation-analyst/output.schema.json */

export interface RiskValidationAnalystOutput {
  venture_id: string;
  volume_number: 7;
  volume_title: string;
  critical_assumptions: {
    assumption?: string;
    risk_level?: "high" | "medium" | "low";
    validation_method?: string;
    timeline_days?: number;
    success_criteria?: string;
    priority_rank?: number;
    [k: string]: unknown;
  }[];
  risk_matrix: {
    high_impact_high_likelihood?: string[];
    high_impact_medium_likelihood?: string[];
    high_impact_low_likelihood?: string[];
    medium_impact_high_likelihood?: string[];
    other_risks?: string[];
    [k: string]: unknown;
  };
  /**
   * @minItems 3
   * @maxItems 5
   */
  kill_criteria:
    | [
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        }
      ]
    | [
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        }
      ]
    | [
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        },
        {
          criterion?: string;
          measurement_method?: string;
          kill_threshold?: string;
          timeline_days?: number;
          [k: string]: unknown;
        }
      ];
  validation_roadmap: {
    experiment_name?: string;
    assumption_testing?: string[];
    method?: string;
    duration_days?: number;
    success_metric?: string;
    expected_learning?: string;
    go_no_go_decision?: string;
    [k: string]: unknown;
  }[];
  minimum_viable_validation: {
    first_30_days?: string[];
    target_learning?: string[];
    resource_requirement?: string;
    [k: string]: unknown;
  };
  risk_mitigation_strategy: {
    top_5_risks?: string[];
    mitigation_actions?: {
      risk?: string;
      action?: string;
      timeline_weeks?: number;
      [k: string]: unknown;
    }[];
    unmitigatable_risks?: string[];
    total_de_risking_timeline_months?: number;
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
