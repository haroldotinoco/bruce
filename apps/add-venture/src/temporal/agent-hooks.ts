import type { AgentRuntimeHooks, ExecutionContext } from '@bruce/agent-runtime';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
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

function normalizeAddVentureAgentOutput(
  agentId: string,
  input: unknown,
  context: ExecutionContext,
  output: unknown,
): unknown {
  return sanitizeAddVentureOutput(agentId, input, context, output);
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
export function getAddVentureAgentRuntimeHooks(module: string, agentId: string): AgentRuntimeHooks | undefined {
  if (module !== 'add-venture') return undefined;
  return {
    fallbackOutput: (input, context) => addVentureOutputDefaults(agentId, input, context),
    normalizeOutput: (output, input, context) => normalizeAddVentureAgentOutput(agentId, input, context, output),
  };
}
