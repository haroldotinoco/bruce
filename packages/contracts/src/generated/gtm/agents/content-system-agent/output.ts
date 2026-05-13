/* eslint-disable */
/* auto-generated from modules/gtm/agents/content-system-agent/output.schema.json */

/**
 * Complete content system including messaging, calendar structure, and templates
 */
export interface ContentSystemAgentOutput {
  messaging_system: {
    /**
     * 1-2 sentence core narrative that differentiates product
     */
    core_narrative: string;
    /**
     * @maxItems 5
     */
    narrative_supporting_pillars:
      | []
      | [
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          }
        ]
      | [
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          }
        ]
      | [
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          }
        ]
      | [
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          }
        ]
      | [
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          },
          {
            /**
             * Core message pillar (e.g., 'Salesforce-Native Design')
             */
            pillar: string;
            /**
             * Evidence supporting the pillar
             */
            proof_points: string[];
            [k: string]: unknown;
          }
        ];
    /**
     * Mapping of vs_competitor_name: unique_claim
     */
    competitive_positioning?: {
      [k: string]: string;
    };
    /**
     * Common objections and one-liner responses
     */
    objection_handlers?: {
      objection: string;
      response: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  content_calendar_structure: {
    /**
     * Total pieces per month across all channels
     */
    monthly_volume: number;
    /**
     * Posts per month per channel
     */
    channel_breakdown: {
      [k: string]: number;
    };
    content_mix?: {
      /**
       * % of content targeting unaware/new audiences
       */
      awareness: number;
      /**
       * % of content addressing problem/solution
       */
      consideration: number;
      /**
       * % of content for evaluating/deciding buyers
       */
      decision: number;
      [k: string]: unknown;
    };
    /**
     * Content themes for each of next 12 months
     */
    themes_by_month?: {
      [k: string]: string[];
    };
    [k: string]: unknown;
  };
  /**
   * @minItems 5
   * @maxItems 15
   */
  copywriting_templates:
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        },
        {
          /**
           * Unique identifier (e.g., 'linkedin-case-study-v1')
           */
          template_id: string;
          /**
           * Channel this template is optimized for
           */
          channel: string;
          /**
           * Content type
           */
          type:
            | "case-study"
            | "thought-leadership"
            | "objection-handler"
            | "feature-spotlight"
            | "customer-testimonial"
            | "stat-callout"
            | "how-to"
            | "comparison"
            | "announcement";
          /**
           * Template with {{variable}} placeholders for easy substitution
           */
          template: string;
          /**
           * Target character count for this channel
           */
          character_limit?: number;
          /**
           * 1-2 concrete usage examples filled with real content
           *
           * @minItems 1
           * @maxItems 2
           */
          usage_examples?: [string] | [string, string];
          /**
           * Who needs to approve (e.g., ['legal', 'product', 'brand'])
           */
          approval_requirements?: string[];
          [k: string]: unknown;
        }
      ];
  content_library_plan?: {
    /**
     * Must-have foundational content pieces
     */
    core_assets: {
      asset_name: string;
      description: string;
      owner: string;
      target_publish_date?: string;
      [k: string]: unknown;
    }[];
    /**
     * Nice-to-have secondary content
     */
    supporting_assets?: string[];
    /**
     * 4-week rolling content production schedule
     */
    production_timeline: string;
    [k: string]: unknown;
  };
  approval_workflow?: {
    /**
     * Step-by-step content approval workflow
     */
    process: string;
    /**
     * Expected approval turnaround
     */
    turnaround_time_hours?: number;
    /**
     * When to escalate to legal/exec
     */
    escalation_criteria?: string[];
    [k: string]: unknown;
  };
  distribution_strategy?: {
    /**
     * How to adapt content across channels (e.g., blog post → LinkedIn article → email → social snippets)
     */
    repurposing_plan?: string;
    /**
     * Paid amplification strategy for core assets
     */
    amplification_plan?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
