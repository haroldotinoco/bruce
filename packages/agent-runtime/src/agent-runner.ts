import { z } from 'zod';
import {
  createLLMClient,
  getDefaultFallbackAgentModel,
  type LLMClient,
  type LlmUsageContext,
} from '@bruce/llm';
import { logger } from '@bruce/logger';
import { writeDeliverable } from '@bruce/project-store';
import { agentLoader } from './agent-loader.js';
import type {
  AgentCapabilities,
  AgentExecutionResult,
  AgentRunnerDeps,
  AgentSpec,
  ExecutionContext,
} from './types.js';
import type { AgentLoaderLike } from './types.js';

const INNER_LLM_RETRIES = 1;

/** OpenRouter upstream 429s need longer backoff than generic transient errors. */
function isRateLimitedError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('rate-limited') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  );
}

function retryDelayMs(error: Error, attempt: number, policy: AgentCapabilities['retryPolicy']): number {
  const base =
    Math.pow(policy?.backoffMultiplier ?? 2, attempt - 1) * (policy?.initialDelayMs ?? 1000);
  if (isRateLimitedError(error)) {
    return Math.max(base, 5_000 * attempt);
  }
  return base;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item),
      )
    : [];
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>;
        return stringValue(rec.description ?? rec.gap ?? rec.name ?? rec.reason ?? rec.title);
      }
      return '';
    })
    .filter((item) => item.length > 0);
}

function coerceStringArray(value: unknown): string[] {
  const fromArray = stringArray(value);
  if (fromArray.length > 0) return fromArray;
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function coerceValidationRoadmap(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    const rows: Record<string, unknown>[] = [];
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) {
        rows.push({
          assumption: item.trim(),
          validation_method: 'To be defined',
          success_criteria: 'To be defined',
        });
        continue;
      }
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const row = item as Record<string, unknown>;
        rows.push({
          assumption: stringValue(row.assumption, stringValue(row.hypothesis, 'Key assumption')),
          validation_method: stringValue(row.validation_method, 'To be defined'),
          success_criteria: stringValue(row.success_criteria, 'To be defined'),
        });
      }
    }
    return rows;
  }
  if (typeof value === 'string' && value.trim()) {
    return [
      {
        assumption: value.trim(),
        validation_method: 'To be defined',
        success_criteria: 'To be defined',
      },
    ];
  }
  return [];
}

function coerceSectionObject(
  value: unknown,
  summaryKey: string,
  arrayKeys: string[] = [],
): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const raw = { ...(value as Record<string, unknown>) };
    for (const key of arrayKeys) {
      if (key in raw) raw[key] = coerceStringArray(raw[key]);
    }
    return raw;
  }
  if (typeof value === 'string' && value.trim()) {
    return { [summaryKey]: value.trim() };
  }
  return { [summaryKey]: '' };
}

function coerceDifferentiatorItem(item: unknown): Record<string, unknown> {
  if (typeof item === 'string' && item.trim()) {
    return {
      differentiator: item.trim(),
      why_matters_to_customer: '',
      defensibility_rationale: '',
      competitive_comparison: '',
    };
  }
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const row = item as Record<string, unknown>;
    return {
      differentiator: stringValue(row.differentiator, stringValue(row.name, stringValue(row.title, 'Differentiator'))),
      why_matters_to_customer: stringValue(row.why_matters_to_customer, stringValue(row.rationale)),
      defensibility_rationale: stringValue(row.defensibility_rationale),
      competitive_comparison: stringValue(row.competitive_comparison),
    };
  }
  return {
    differentiator: 'Differentiator',
    why_matters_to_customer: '',
    defensibility_rationale: '',
    competitive_comparison: '',
  };
}

function coerceDifferentiationStrategy(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.map((item) => coerceDifferentiatorItem(item));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.items)) return coerceDifferentiationStrategy(obj.items);
    if (Array.isArray(obj.differentiators)) return coerceDifferentiationStrategy(obj.differentiators);
    if (stringValue(obj.differentiator) || stringValue(obj.why_matters_to_customer)) {
      return [coerceDifferentiatorItem(obj)];
    }
    const stringEntries = Object.entries(obj).filter(([, v]) => typeof v === 'string' && v.trim());
    if (stringEntries.length > 0) {
      return stringEntries.map(([key, v]) => ({
        differentiator: key,
        why_matters_to_customer: String(v),
        defensibility_rationale: '',
        competitive_comparison: '',
      }));
    }
    const nested = Object.values(obj).filter(
      (v) => v && typeof v === 'object' && !Array.isArray(v),
    ) as Record<string, unknown>[];
    if (nested.length > 0) return nested.map((item) => coerceDifferentiatorItem(item));
  }
  if (typeof value === 'string' && value.trim()) {
    return [coerceDifferentiatorItem(value)];
  }
  return [];
}

function coercePainGainPairs(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    if (typeof value === 'string' && value.trim()) {
      return [{ pain: value.trim(), how_we_relieve: '' }];
    }
    return [];
  }
  return value.map((item) => {
    if (typeof item === 'string' && item.trim()) {
      return { pain: item.trim(), how_we_relieve: '' };
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const row = item as Record<string, unknown>;
      return {
        pain: stringValue(row.pain, stringValue(row.gain)),
        how_we_relieve: stringValue(row.how_we_relieve, stringValue(row.how_we_create)),
      };
    }
    return { pain: '', how_we_relieve: '' };
  });
}

function coerceComparisonAlternatives(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return coerceComparisonAlternatives(Object.values(value as Record<string, unknown>));
    }
    return [];
  }
  const rows: Record<string, unknown>[] = [];
  for (const item of value) {
    if (typeof item === 'string' && item.trim()) {
      rows.push({ alternative: item.trim(), their_strength: '', our_advantage: '' });
      continue;
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const row = item as Record<string, unknown>;
      rows.push({
        alternative: stringValue(row.alternative, stringValue(row.name)),
        their_strength: stringValue(row.their_strength),
        our_advantage: stringValue(row.our_advantage),
      });
    }
  }
  return rows;
}

function repairValuePropositionDesignerOutput(output: Record<string, unknown>): Record<string, unknown> {
  const canvas = asRecord(output.value_proposition_canvas);
  const positioning = output.positioning_statement;
  let positioningObj: Record<string, unknown>;
  if (positioning && typeof positioning === 'object' && !Array.isArray(positioning)) {
    positioningObj = positioning as Record<string, unknown>;
  } else if (typeof positioning === 'string' && positioning.trim()) {
    positioningObj = {
      for_target: '',
      product_name: '',
      category: '',
      key_benefit: positioning.trim(),
      primary_differentiator: '',
      proof_point: '',
    };
  } else {
    positioningObj = {};
  }

  const strategy = coerceDifferentiationStrategy(output.differentiation_strategy);
  return {
    ...output,
    core_value_proposition: stringValue(
      output.core_value_proposition,
      'Value proposition to be refined.',
    ),
    differentiation_strategy:
      strategy.length > 0
        ? strategy
        : [
            {
              differentiator: 'Primary differentiator',
              why_matters_to_customer: 'To be validated with customers.',
              defensibility_rationale: '',
              competitive_comparison: '',
            },
          ],
    value_proposition_canvas: {
      customer_pains: coerceStringArray(canvas.customer_pains),
      customer_gains: coerceStringArray(canvas.customer_gains),
      pain_relievers: coercePainGainPairs(canvas.pain_relievers),
      gain_creators: coercePainGainPairs(canvas.gain_creators),
    },
    positioning_statement: positioningObj,
    unique_differentiators: coerceStringArray(output.unique_differentiators),
    comparison_vs_alternatives: coerceComparisonAlternatives(output.comparison_vs_alternatives),
    assumptions: coerceStringArray(output.assumptions),
    data_gaps: coerceStringArray(output.data_gaps),
  };
}

function repairOpportunityAnalystVol1Output(output: Record<string, unknown>): Record<string, unknown> {
  const content = asRecord(output.content);
  const repairedContent = {
    problem_anatomy: coerceSectionObject(content.problem_anatomy, 'core_problem', [
      'current_workarounds',
      'acceptance_criteria',
    ]),
    market_readiness: coerceSectionObject(content.market_readiness, 'maturity_stage', [
      'demand_signals',
      'urgency_drivers',
    ]),
    addressable_market: coerceSectionObject(content.addressable_market, 'tam_analysis'),
    macro_context: coerceSectionObject(content.macro_context, 'regulatory_shifts', [
      'industry_trends',
      'technology_enablers',
      'demographic_drivers',
    ]),
    opportunity_thesis: stringValue(
      content.opportunity_thesis,
      stringValue(output.opportunity_thesis, 'Opportunity thesis to be refined.'),
    ),
  };

  return {
    ...output,
    content: repairedContent,
    key_assumptions: coerceStringArray(output.key_assumptions),
    validation_roadmap: coerceValidationRoadmap(output.validation_roadmap),
    critical_unknowns: coerceStringArray(output.critical_unknowns),
  };
}

function addVentureOutputDefaults(
  agentId: string,
  input: unknown,
  context: ExecutionContext,
): Record<string, unknown> | undefined {
  const i = asRecord(input);
  const ventureId = context.ventureId ?? stringValue(i.venture_id);
  const opportunityId = stringValue(i.opportunity_id);
  const now = new Date().toISOString();
  const common = {
    venture_id: ventureId,
    assumptions: [] as string[],
    data_gaps: [] as string[],
    confidence_score: 50,
    confidence_rationale: 'Auto-filled by runtime because the agent output omitted required structure.',
    key_sections: [] as string[],
    execution_timestamp: now,
    agent_id: agentId,
  };

  switch (agentId) {
    case 'briefing-interpreter':
      return briefingInterpreterMergeOutput(input, context);
    case 'opportunity-analyst-vol1':
      return {
        ...common,
        volume_number: 1,
        volume_title: 'Opportunity Diagnosis',
        content: {
          problem_anatomy: {
            core_problem: 'Problem anatomy needs further detail.',
            problem_evolution: '',
            stakeholder_impact: '',
            current_workarounds: [],
            acceptance_criteria: [],
          },
          market_readiness: {
            maturity_stage: 'unknown',
            demand_signals: [],
            competitive_activation: '',
            urgency_drivers: [],
            timeline_assessment: '',
          },
          addressable_market: {
            tam_analysis: 'Addressable market needs further detail.',
            sam_definition: '',
            som_realistic: '',
            growth_trajectory: '',
            unit_economics_feasibility: '',
          },
          macro_context: {
            industry_trends: [],
            regulatory_shifts: '',
            technology_enablers: [],
            economic_context: '',
            demographic_drivers: [],
          },
          opportunity_thesis: 'Opportunity thesis needs further detail.',
        },
        key_assumptions: [],
        validation_roadmap: [],
        critical_unknowns: [],
      };
    case 'customer-market-architect':
      return {
        ...common,
        volume_number: 2,
        volume_title: 'Customer & Market Architecture',
        customer_segments: [
          {
            segment_name: 'Primary target segment',
            priority_rank: 1,
            segment_size_customers: 0,
            segment_tam_usd: 0,
            customer_archetypes: [],
            primary_pain_points: [],
            willingness_to_pay_range: {
              min_annual_usd: 0,
              max_annual_usd: 0,
              median_annual_usd: 0,
            },
          },
        ],
        jtbd_map: {
          functional_jobs: [],
          emotional_jobs: [],
          social_jobs: [],
          job_hierarchy: [],
        },
        decision_maker_map: {
          primary_buyer_title: 'Unknown buyer',
          primary_buyer_motivation: 'Requires validation',
          end_user_title: 'Unknown user',
          end_user_motivation: 'Requires validation',
          stakeholders: [],
          buying_approval_workflow: 'Unknown',
          typical_sales_cycle_months: 0,
        },
        market_architecture: {
          total_addressable_segment: 0,
          revenue_concentration: 'Unknown',
          geographic_distribution: 'Unknown',
          competitive_positioning: 'Unknown',
          barriers_to_entry: [],
        },
      };
    case 'value-proposition-designer':
      return {
        ...common,
        volume_number: 3,
        volume_title: 'Value Proposition Design',
        core_value_proposition: 'Value proposition requires validation.',
        differentiation_strategy: [],
        value_proposition_canvas: {
          customer_pains: [],
          customer_gains: [],
          pain_relievers: [],
          gain_creators: [],
        },
        positioning_statement: {},
        unique_differentiators: [],
        comparison_vs_alternatives: [],
      };
    case 'business-model-modeler':
      return {
        ...common,
        volume_number: 4,
        volume_title: 'Business Model',
        revenue_model: {},
        unit_economics: {},
        business_model_scenarios: [],
        break_even_analysis: {},
        recommended_scenario: {},
      };
    case 'gtm-planner':
      return {
        ...common,
        volume_number: 5,
        volume_title: 'Go-To-Market Plan',
        icp_definition: {},
        channel_priorities: [],
        launch_sequence: {},
        ninety_day_playbook: {},
        budget_allocation: {},
      };
    case 'narrative-strategist':
      return {
        ...common,
        volume_number: 6,
        volume_title: 'Narrative Strategy',
        one_liner: 'Narrative requires validation.',
        elevator_pitches: [],
        messaging_pillars: [],
        tone_of_voice: ['pragmatic'],
        brand_narrative: {},
        investor_pitch_hook: 'Requires validation.',
      };
    case 'risk-validation-analyst':
      return {
        ...common,
        volume_number: 7,
        volume_title: 'Risk Validation',
        critical_assumptions: [],
        risk_matrix: {},
        kill_criteria: [],
        validation_roadmap: {},
        minimum_viable_validation: {},
        risk_mitigation_strategy: {},
      };
    case 'execution-roadmap-planner':
      return {
        ...common,
        volume_number: 8,
        volume_title: 'Execution Roadmap',
        phases: [],
        critical_path: {},
        resource_requirements: {},
        success_metrics_and_gates: [],
        first_30_days: {},
      };
    case 'venture-critic':
      return {
        venture_id: ventureId,
        critique_timestamp: now,
        overall_score: 50,
        dimension_scores: {},
        volume_scores: {},
        approval_recommendation: 'revise',
        agent_id: agentId,
      };
    case 'dossier-composer':
      return {
        venture_id: ventureId,
        opportunity_id: opportunityId,
        venture_name: 'Structured venture',
        created_date: now,
        volumes: [],
        critique_result: {},
        executive_summary: 'Dossier composed with runtime defaults for missing fields.',
        key_metrics: {},
        status: 'draft',
        agent_id: agentId,
      };
    default:
      return undefined;
  }
}

function brandAidOutputDefaults(
  agentId: string,
  input: unknown,
  context: ExecutionContext,
): Record<string, unknown> | undefined {
  if (context.module !== 'brand-aid' || agentId !== 'naming-agent') return undefined;
  const i = asRecord(input);
  const ventureId = context.ventureId ?? stringValue(i.venture_id);
  const forced = stringValue(i.forced_brand_name);
  const handoff = asRecord(i.source_handoff);
  const name =
    forced || stringValue(handoff.venture_name, `Venture ${ventureId.slice(0, 8) || 'brand'}`);
  const brief = {
    name,
    approach: forced ? 'forced' : 'fallback',
    rationale: forced
      ? 'User-provided brand name.'
      : 'Auto-filled by runtime because naming output was incomplete.',
    domain_status: 'not_checked',
  };
  return {
    top_candidates: [
      {
        rank: 1,
        name,
        overall_score: forced ? 100 : 60,
        rationale: brief.rationale,
        approach: brief.approach,
      },
    ],
    all_candidates: [brief],
    scoring_methodology: forced
      ? 'Skipped — forced brand name.'
      : 'Runtime fallback after incomplete LLM naming output.',
    domain_availability_summary: 'Not checked in fallback path.',
    trademark_flags: [],
    recommendation: 'Review naming output and re-run if alternatives are needed.',
  };
}

function sanitizeBrandAidOutput(
  agentId: string,
  input: unknown,
  context: ExecutionContext,
  output: unknown,
): unknown {
  if (context.module !== 'brand-aid') return output;
  const defaults = brandAidOutputDefaults(agentId, input, context);
  if (!defaults) return output;
  const o = { ...defaults, ...asRecord(output) };
  if (!Array.isArray(o.top_candidates) || o.top_candidates.length === 0) {
    o.top_candidates = defaults.top_candidates;
  }
  if (!Array.isArray(o.all_candidates) || o.all_candidates.length < 5) {
    const merged = [
      ...asRecordArray(o.all_candidates),
      ...asRecordArray(defaults.all_candidates),
    ];
    const seen = new Set<string>();
    o.all_candidates = merged.filter((row) => {
      const key = stringValue(row.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    while (asRecordArray(o.all_candidates).length < 5) {
      const idx = asRecordArray(o.all_candidates).length + 1;
      const top = asRecordArray(o.top_candidates)[0];
      o.all_candidates = [
        ...asRecordArray(o.all_candidates),
        {
          name: `${stringValue(top?.name, 'Brand')} Alt ${idx}`,
          approach: 'fallback',
          domain_status: 'not_checked',
        },
      ];
    }
  }
  if (!stringValue(o.scoring_methodology)) o.scoring_methodology = defaults.scoring_methodology;
  return o;
}

function sanitizeAgentOutput(
  agentId: string,
  input: unknown,
  context: ExecutionContext,
  output: unknown,
): unknown {
  return sanitizeBrandAidOutput(
    agentId,
    input,
    context,
    sanitizeAddVentureOutput(agentId, input, context, output),
  );
}

function sanitizeAddVentureOutput(
  agentId: string,
  input: unknown,
  context: ExecutionContext,
  output: unknown,
): unknown {
  if (context.module !== 'add-venture') return output;
  const defaults = addVentureOutputDefaults(agentId, input, context);
  if (!defaults) return output;
  let o = { ...defaults, ...asRecord(output) };
  if (agentId === 'opportunity-analyst-vol1') {
    o = repairOpportunityAnalystVol1Output(o);
  }
  if (agentId === 'value-proposition-designer') {
    o = repairValuePropositionDesignerOutput(o);
  }

  o.venture_id = stringValue(o.venture_id, context.ventureId ?? '');
  if ('volume_number' in defaults) o.volume_number = numberValue(o.volume_number, defaults.volume_number as number);
  if ('volume_title' in defaults) o.volume_title = stringValue(o.volume_title, defaults.volume_title as string);
  if ('confidence_score' in defaults) o.confidence_score = numberValue(o.confidence_score, defaults.confidence_score as number);
  if ('data_gaps' in o) o.data_gaps = stringArray(o.data_gaps);
  if ('assumptions' in o) o.assumptions = stringArray(o.assumptions);
  if ('key_sections' in o) o.key_sections = stringArray(o.key_sections);

  const arrayKeys = [
    'customer_segments',
    'business_model_scenarios',
    'channel_priorities',
    'elevator_pitches',
    'messaging_pillars',
    'critical_assumptions',
    'kill_criteria',
    'phases',
    'success_metrics_and_gates',
    'volumes',
    'key_assumptions',
    'critical_unknowns',
  ];
  for (const key of arrayKeys) {
    if (key in defaults && !Array.isArray(o[key])) {
      o[key] = agentId === 'opportunity-analyst-vol1' ? coerceStringArray(o[key]) : defaults[key];
    }
  }
  if (agentId === 'opportunity-analyst-vol1' && 'validation_roadmap' in defaults && !Array.isArray(o.validation_roadmap)) {
    o.validation_roadmap = coerceValidationRoadmap(o.validation_roadmap);
  }

  const objectKeys = [
    'jtbd_map',
    'decision_maker_map',
    'market_architecture',
    'value_proposition_canvas',
    'positioning_statement',
    'revenue_model',
    'unit_economics',
    'break_even_analysis',
    'recommended_scenario',
    'icp_definition',
    'launch_sequence',
    'ninety_day_playbook',
    'budget_allocation',
    'brand_narrative',
    'risk_matrix',
    'validation_roadmap',
    'minimum_viable_validation',
    'risk_mitigation_strategy',
    'critical_path',
    'resource_requirements',
    'dimension_scores',
    'volume_scores',
    'critique_result',
    'key_metrics',
  ];
  for (const key of objectKeys) {
    if (agentId === 'opportunity-analyst-vol1' && key === 'validation_roadmap') continue;
    if (agentId === 'value-proposition-designer' && key === 'value_proposition_canvas') continue;
    if (agentId === 'value-proposition-designer' && key === 'positioning_statement') continue;
    if (key in defaults && (!o[key] || typeof o[key] !== 'object' || Array.isArray(o[key]))) {
      o[key] = defaults[key];
    }
  }

  return o;
}

/** LLM often omits IDs and empty context shells; merge before Zod so validation passes. */
function briefingInterpreterMergeOutput(
  input: unknown,
  context: ExecutionContext
): Record<string, unknown> {
  const inp = input as { opportunity?: { opportunity_id?: string } };
  return {
    venture_id: context.ventureId ?? '',
    opportunity_id: inp.opportunity?.opportunity_id ?? '',
    briefing_timestamp: new Date().toISOString(),
    problem_context: {},
    market_context: {},
    customer_context: {},
    competitive_context: {},
  };
}

export class AgentRunner {
  private readonly loader: AgentLoaderLike;
  private readonly createLlm: (capabilities: AgentCapabilities) => LLMClient;

  constructor(deps?: AgentRunnerDeps) {
    this.loader = deps?.agentLoader ?? agentLoader;
    this.createLlm =
      deps?.createLlm ??
      ((cap) =>
        createLLMClient(cap.provider ?? 'openrouter', cap.model ?? getDefaultFallbackAgentModel()));
  }

  async run<T = unknown>(
    module: string,
    agentId: string,
    input: unknown,
    context: ExecutionContext
  ): Promise<AgentExecutionResult<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    const spec = await this.loader.loadAgent(module, agentId);
    const retryPolicy = spec.capabilities.retryPolicy ?? {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelayMs: 1000,
    };

    let validatedInput: unknown;
    try {
      validatedInput = spec.inputSchema.parse(input);
    } catch (error) {
      logger.error(
        { error, module, agentId, correlationId: context.correlationId },
        'Input validation failed'
      );
      return {
        success: false,
        error: `Input validation failed: ${(error as Error).message}`,
        attempts: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt++) {
      try {
        logger.debug(
          {
            module,
            agentId,
            attempt,
            maxAttempts: retryPolicy.maxAttempts,
            correlationId: context.correlationId,
          },
          'Executing agent'
        );

        const output = await this.executeWithTools<T>(spec, validatedInput, context);

        if (context.projectNickname) {
          try {
            const target = await writeDeliverable(
              context.projectNickname,
              module,
              agentId,
              'output.json',
              output,
            );
            logger.debug(
              { module, agentId, target, correlationId: context.correlationId },
              'Agent output persisted to project store',
            );
          } catch (writeError) {
            logger.warn(
              {
                error: (writeError as Error).message,
                module,
                agentId,
                projectNickname: context.projectNickname,
                correlationId: context.correlationId,
              },
              'Failed to write agent output to project store (continuing)',
            );
          }
        }

        logger.debug(
          { module, agentId, executionTimeMs: Date.now() - startTime, correlationId: context.correlationId },
          'Agent execution successful'
        );

        return {
          success: true,
          output,
          attempts: attempt,
          executionTimeMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          { error: lastError.message, module, agentId, attempt, correlationId: context.correlationId },
          'Agent execution failed, retrying...'
        );

        if (attempt < retryPolicy.maxAttempts) {
          const delayMs = retryDelayMs(lastError, attempt, retryPolicy);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    return {
      success: false,
      error: `Agent execution failed after ${retryPolicy.maxAttempts} attempts: ${lastError?.message}`,
      attempts: retryPolicy.maxAttempts,
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async executeWithTools<T>(
    spec: AgentSpec,
    input: unknown,
    context: ExecutionContext
  ): Promise<T> {
    const inputJson = JSON.stringify(input, null, 2);
    // OpenAI/Azure (via OpenRouter) require the word "json" in messages when using response_format json_object.
    const userMessage = `Process the following JSON input:\n\n${inputJson}`;

    const llm = this.createLlm(spec.capabilities);
    const systemPrompt = spec.constraints
      ? `${spec.skillPrompt}\n\n## Runtime Constraints\n\n${spec.constraints}`
      : spec.skillPrompt;
    const addVentureDefaults = addVentureOutputDefaults(spec.id, input, context);
    const brandAidDefaults = brandAidOutputDefaults(spec.id, input, context);
    const mergeOutput = addVentureDefaults ?? brandAidDefaults;
    const usageContext: LlmUsageContext | undefined =
      context.observabilityRunId && context.observabilityStepKey
        ? {
            accountId: context.accountId,
            correlationId: context.correlationId,
            module: context.module,
            agentId: spec.id,
            provider: spec.capabilities.provider ?? 'openrouter',
            model: spec.capabilities.model,
            observability: {
              runId: context.observabilityRunId,
              stepKey: context.observabilityStepKey,
              parentStepKey: context.observabilityParentStepKey,
            },
          }
        : undefined;

    const opts = {
      temperature: spec.capabilities.temperature,
      maxTokens: spec.capabilities.maxTokens,
      retries: INNER_LLM_RETRIES,
      mergeOutput,
      usageContext,
      responseSchemaName: spec.id,
    };

    const outputSchema = mergeOutput ? z.unknown() : spec.outputSchema;

    if (spec.tools.length > 0) {
      const raw = await llm.callAgentWithTools(
        systemPrompt,
        userMessage,
        spec.tools,
        outputSchema as z.ZodSchema<unknown>,
        opts
      );
      return spec.outputSchema.parse(sanitizeAgentOutput(spec.id, input, context, raw)) as T;
    }

    const raw = await llm.callAgent(
      systemPrompt,
      userMessage,
      outputSchema as z.ZodSchema<unknown>,
      opts
    );
    return spec.outputSchema.parse(sanitizeAgentOutput(spec.id, input, context, raw)) as T;
  }
}

let runnerInstance: AgentRunner | undefined;

export function getAgentRunner(): AgentRunner {
  if (!runnerInstance) {
    runnerInstance = new AgentRunner();
  }
  return runnerInstance;
}
