/* eslint-disable */
/* auto-generated from modules/gtm/agents/growth-experimenter/output.schema.json */

/**
 * Prioritized growth experiments with sequencing and playbook opportunity identification
 */
export interface GrowthExperimenterOutput {
  /**
   * @minItems 1
   * @maxItems 5
   */
  prioritized_experiments:
    | [
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        },
        {
          rank: number;
          /**
           * Memorable experiment name
           */
          experiment_name: string;
          /**
           * Clear, falsifiable hypothesis (e.g., 'If we enable referral program, conversion will increase 15%')
           */
          hypothesis: string;
          /**
           * How the experiment will be executed
           */
          methodology?: string;
          /**
           * Primary metric that determines if hypothesis is confirmed
           */
          success_metric: string;
          /**
           * Target value for success metric
           */
          target_value?: number;
          /**
           * Estimated impact on key business metrics (e.g., '+25% monthly signups')
           */
          target_impact?: string;
          /**
           * Budget required
           */
          budget_usd?: number;
          /**
           * Days to completion
           */
          timeline_days: number;
          /**
           * FTE and skill types needed
           */
          resource_requirement?: string;
          /**
           * Budget spent to learn (budget / expected sample size)
           */
          cost_of_learning?: number;
          /**
           * Estimated ROI if experiment succeeds and is scaled
           */
          roi_if_successful?: string;
          /**
           * Clear criteria for scaling vs. pausing
           */
          go_no_go_decision_criteria?: string;
          /**
           * Other experiments or outcomes this depends on
           */
          dependencies?: string[];
          /**
           * What could go wrong
           */
          risks?: string[];
          [k: string]: unknown;
        }
      ];
  /**
   * How experiments build on each other and what learnings from early experiments inform later ones
   */
  experiment_sequencing?: string;
  success_playbook_opportunity?: {
    /**
     * What becomes a repeatable playbook if #1 experiment succeeds?
     */
    if_top_experiment_succeeds?: string;
    /**
     * How to scale successful experiment from learnings to full production
     */
    scaling_path?: string;
    /**
     * What new capabilities will team need to build for successful scaling?
     */
    team_capability_to_build?: string[];
    [k: string]: unknown;
  };
  resource_allocation_plan?: {
    total_budget?: number;
    allocation_by_experiment?: {
      [k: string]: number;
    };
    contingency_reserve?: number;
    [k: string]: unknown;
  };
  quarterly_roadmap?: {
    /**
     * Experiments to run in month 1
     */
    month_1?: string[];
    month_2?: string[];
    month_3?: string[];
    [k: string]: unknown;
  };
  stopping_rules?: {
    /**
     * Conditions to pause experiment
     */
    pause_if?: string[];
    /**
     * Conditions to kill experiment and move on
     */
    kill_if?: string[];
    /**
     * Conditions to scale experiment
     */
    scale_if?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
