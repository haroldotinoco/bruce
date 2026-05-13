/* eslint-disable */
/* auto-generated from modules/portfolio/agents/portfolio-reporter/output.schema.json */

/**
 * Comprehensive portfolio governance report for stakeholders
 */
export interface PortfolioReporterOutput {
  governance_report: {
    report_metadata: {
      title?: string;
      report_date?: string;
      review_cycle?: string;
      audience?: string;
      total_ventures_reviewed?: number;
      [k: string]: unknown;
    };
    executive_summary: {
      /**
       * High-level health assessment
       */
      portfolio_health_snapshot?: string;
      /**
       * Top 3-5 findings from analysis
       *
       * @minItems 3
       * @maxItems 5
       */
      key_findings?:
        | [string, string, string]
        | [string, string, string, string]
        | [string, string, string, string, string];
      governance_decisions_summary?: {
        scale_count?: number;
        iterate_count?: number;
        pause_count?: number;
        kill_count?: number;
        [k: string]: unknown;
      };
      /**
       * Most urgent actions
       *
       * @maxItems 5
       */
      critical_action_items?:
        | []
        | [string]
        | [string, string]
        | [string, string, string]
        | [string, string, string, string]
        | [string, string, string, string, string];
      /**
       * Qualitative assessment of next period
       */
      portfolio_outlook?: string;
      [k: string]: unknown;
    };
    venture_narratives: {
      venture_id?: string;
      name?: string;
      rank?: number;
      health_section?: {
        health_score?: number;
        health_trend?: string;
        key_metrics?: {
          [k: string]: unknown;
        };
        narrative?: string;
        [k: string]: unknown;
      };
      decision_section?: {
        decision?: string;
        confidence?: number;
        rationale?: string;
        [k: string]: unknown;
      };
      allocation_section?: {
        current_budget?: number;
        new_budget?: number;
        budget_change?: number;
        headcount_change?: number;
        narrative?: string;
        [k: string]: unknown;
      };
      milestones_section?: {
        milestone?: string;
        target_date?: string;
        success_criteria?: string;
        [k: string]: unknown;
      }[];
      risks_section?: string[];
      [k: string]: unknown;
    }[];
    portfolio_insights?: {
      sector_analysis?: {
        sector?: string;
        venture_count?: number;
        health_average?: number;
        common_patterns?: string[];
        common_risks?: string[];
        [k: string]: unknown;
      }[];
      /**
       * Common factors in top-performing ventures
       */
      success_factors?: string[];
      /**
       * Portfolio-level risks to monitor
       */
      systemic_risks?: string[];
      resource_efficiency?: {
        portfolio_revenue_per_dollar_spent?: number;
        high_efficiency_ventures?: string[];
        low_efficiency_ventures?: string[];
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    action_items?: {
      /**
       * Priority rank (1 = most urgent)
       */
      priority?: number;
      action?: string;
      owner?: string;
      timeline?: string;
      success_criteria?: string;
      ventures_affected?: string[];
      [k: string]: unknown;
    }[];
    risk_summary?: {
      overall_risk_rating?: string;
      critical_risks?: {
        risk?: string;
        mitigation?: string;
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    };
    appendices?: {
      venture_metrics_table?: {
        [k: string]: unknown;
      }[];
      decision_changelog?: {
        [k: string]: unknown;
      }[];
      glossary?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
