type RecordLike = Record<string, unknown>;

export type VentureAdditionStatus =
  | 'briefing'
  | 'vol1'
  | 'vol2'
  | 'vol3'
  | 'vol4'
  | 'vol5'
  | 'vol6'
  | 'vol7'
  | 'vol8'
  | 'critic'
  | 'composer';

export type PipelineOutputKey =
  | 'briefing'
  | 'vol1'
  | 'vol2'
  | 'vol3'
  | 'vol4'
  | 'vol5'
  | 'vol6'
  | 'vol7'
  | 'vol8'
  | 'critique'
  | 'dossier';

export interface AddVenturePipelineContext {
  ventureId: string;
  opportunityId: string;
  opportunity: Record<string, unknown>;
  ventureName: string;
  forcedBrandName?: string;
  outputs: Partial<Record<PipelineOutputKey, unknown>>;
}

export interface AddVenturePipelineStep {
  key: string;
  status: VentureAdditionStatus;
  label: string;
  icon: string;
  description: string;
  agentId: string;
  outputKey: PipelineOutputKey;
  buildInput(ctx: AddVenturePipelineContext): unknown;
  postProcess?(output: unknown, ctx: AddVenturePipelineContext): unknown;
}

export const STEP_BRIEFING = 'briefing_interpreter';
export const STEP_VOL1 = 'vol1_opportunity';
export const STEP_VOL2 = 'vol2_customer_market';
export const STEP_VOL3 = 'vol3_value_proposition';
export const STEP_VOL4 = 'vol4_business_model';
export const STEP_VOL5 = 'vol5_gtm';
export const STEP_VOL6 = 'vol6_narrative';
export const STEP_VOL7 = 'vol7_risk_validation';
export const STEP_VOL8 = 'vol8_execution_roadmap';
export const STEP_CRITIC = 'venture_critic';
export const STEP_COMPOSER = 'dossier_composer';

function asRecord(x: unknown): RecordLike {
  return x && typeof x === 'object' ? (x as RecordLike) : {};
}

function withForcedBrandNaming(input: RecordLike, forcedBrandName?: string): RecordLike {
  const forced = forcedBrandName?.trim();
  if (!forced) return input;
  return {
    ...input,
    forced_brand_name: forced,
    brand_naming_constraints: `Use "${forced}" as the official venture/product/brand name. Do not invent alternative names or taglines.`,
  };
}

function applyForcedBrandToVol3(output: unknown, forced: string): unknown {
  const vol = asRecord(output);
  const positioning = asRecord(vol.positioning_statement);
  return {
    ...vol,
    positioning_statement: { ...positioning, product_name: forced },
  };
}

function applyForcedBrandToVol6(output: unknown, forced: string): unknown {
  const vol = asRecord(output);
  const taglines = Array.isArray(vol.tagline_candidates)
    ? vol.tagline_candidates.filter((item): item is string => typeof item === 'string' && item !== forced)
    : [];
  return {
    ...vol,
    one_liner: forced,
    tagline_candidates: [forced, ...taglines].slice(0, 5),
  };
}

function buildBriefing(
  ventureId: string,
  opportunityId: string,
  briefingResult: unknown,
): RecordLike {
  const br = asRecord(briefingResult);
  return {
    venture_id: ventureId,
    opportunity_id: opportunityId,
    problem_context: (br.problem_context as object) ?? { interpreted: br },
    market_context: (br.market_context as object) ?? {},
    customer_context: (br.customer_context as object) ?? {},
    key_assumptions: Array.isArray(br.key_assumptions) ? br.key_assumptions : [],
    data_gaps: Array.isArray(br.data_gaps) ? br.data_gaps : [],
  };
}

export const ADD_VENTURE_PIPELINE_STEPS: AddVenturePipelineStep[] = [
  {
    key: STEP_BRIEFING,
    status: 'briefing',
    label: 'Briefing interpreter',
    icon: 'file-text',
    description: 'Interpret the opportunity briefing.',
    agentId: 'briefing-interpreter',
    outputKey: 'briefing',
    buildInput: (ctx) => ({
      opportunity: {
        opportunity_id: ctx.opportunityId,
        title: String(ctx.opportunity.title ?? 'Untitled'),
        problem_statement: String(
          ctx.opportunity.problem_statement ?? ctx.opportunity.description ?? '',
        ),
        target_segment: String(
          ctx.opportunity.target_segment ??
            ctx.opportunity.market_segment ??
            ctx.opportunity.segment ??
            '',
        ),
        market_size_estimate: ctx.opportunity.market_size_estimate as
          | Record<string, unknown>
          | undefined,
        competition_landscape: ctx.opportunity.competition_landscape as
          | Record<string, unknown>
          | undefined,
        problem_analysis: ctx.opportunity.problem_analysis as Record<string, unknown> | undefined,
        analysis_quality: ctx.opportunity.analysis_quality as Record<string, unknown> | undefined,
      },
      portfolio_context: {},
    }),
  },
  {
    key: STEP_VOL1,
    status: 'vol1',
    label: 'Vol 1 · Opportunity',
    icon: 'bar-chart-3',
    description: 'Opportunity diagnosis.',
    agentId: 'opportunity-analyst-vol1',
    outputKey: 'vol1',
    buildInput: (ctx) => ({
      briefing: buildBriefing(ctx.ventureId, ctx.opportunityId, ctx.outputs.briefing),
      analysis_parameters: { depth_level: 'standard' },
    }),
  },
  {
    key: STEP_VOL2,
    status: 'vol2',
    label: 'Vol 2 · Customer / Market',
    icon: 'users',
    description: 'Customer segmentation + addressable market.',
    agentId: 'customer-market-architect',
    outputKey: 'vol2',
    buildInput: (ctx) => ({
      venture_id: ctx.ventureId,
      opportunity_id: ctx.opportunityId,
      briefing: asRecord(ctx.outputs.briefing),
      vol_1_opportunity: asRecord(ctx.outputs.vol1),
    }),
  },
  {
    key: STEP_VOL3,
    status: 'vol3',
    label: 'Vol 3 · Value proposition',
    icon: 'star',
    description: 'Value proposition design.',
    agentId: 'value-proposition-designer',
    outputKey: 'vol3',
    buildInput: (ctx) =>
      withForcedBrandNaming(
        {
          venture_id: ctx.ventureId,
          opportunity_id: ctx.opportunityId,
          briefing: asRecord(ctx.outputs.briefing),
          vol_1_opportunity: asRecord(ctx.outputs.vol1),
          vol_2_customer_market: asRecord(ctx.outputs.vol2),
        },
        ctx.forcedBrandName,
      ),
    postProcess: (output, ctx) =>
      ctx.forcedBrandName ? applyForcedBrandToVol3(output, ctx.forcedBrandName) : output,
  },
  {
    key: STEP_VOL4,
    status: 'vol4',
    label: 'Vol 4 · Business model',
    icon: 'briefcase',
    description: 'Business model + unit economics.',
    agentId: 'business-model-modeler',
    outputKey: 'vol4',
    buildInput: (ctx) => ({
      venture_id: ctx.ventureId,
      opportunity_id: ctx.opportunityId,
      briefing: asRecord(ctx.outputs.briefing),
      vol_1_opportunity: asRecord(ctx.outputs.vol1),
      vol_2_customer_market: asRecord(ctx.outputs.vol2),
      vol_3_value_proposition: asRecord(ctx.outputs.vol3),
    }),
  },
  {
    key: STEP_VOL5,
    status: 'vol5',
    label: 'Vol 5 · GTM',
    icon: 'rocket',
    description: 'Go-to-market plan.',
    agentId: 'gtm-planner',
    outputKey: 'vol5',
    buildInput: (ctx) => ({
      venture_id: ctx.ventureId,
      opportunity_id: ctx.opportunityId,
      briefing: asRecord(ctx.outputs.briefing),
      vol_1_opportunity: asRecord(ctx.outputs.vol1),
      vol_2_customer_market: asRecord(ctx.outputs.vol2),
      vol_3_value_proposition: asRecord(ctx.outputs.vol3),
      vol_4_business_model: asRecord(ctx.outputs.vol4),
    }),
  },
  {
    key: STEP_VOL6,
    status: 'vol6',
    label: 'Vol 6 · Narrative',
    icon: 'megaphone',
    description: 'Brand narrative + positioning.',
    agentId: 'narrative-strategist',
    outputKey: 'vol6',
    buildInput: (ctx) =>
      withForcedBrandNaming(
        {
          venture_id: ctx.ventureId,
          opportunity_id: ctx.opportunityId,
          briefing: asRecord(ctx.outputs.briefing),
          vol_1_opportunity: asRecord(ctx.outputs.vol1),
          vol_2_customer_market: asRecord(ctx.outputs.vol2),
          vol_3_value_proposition: asRecord(ctx.outputs.vol3),
          vol_5_gtm: asRecord(ctx.outputs.vol5),
        },
        ctx.forcedBrandName,
      ),
    postProcess: (output, ctx) =>
      ctx.forcedBrandName ? applyForcedBrandToVol6(output, ctx.forcedBrandName) : output,
  },
  {
    key: STEP_VOL7,
    status: 'vol7',
    label: 'Vol 7 · Risk / validation',
    icon: 'shield',
    description: 'Risk + validation plan.',
    agentId: 'risk-validation-analyst',
    outputKey: 'vol7',
    buildInput: (ctx) => ({
      venture_id: ctx.ventureId,
      opportunity_id: ctx.opportunityId,
      vol_1_opportunity: asRecord(ctx.outputs.vol1),
      vol_2_customer_market: asRecord(ctx.outputs.vol2),
      vol_3_value_proposition: asRecord(ctx.outputs.vol3),
      vol_4_business_model: asRecord(ctx.outputs.vol4),
      vol_5_gtm: asRecord(ctx.outputs.vol5),
      vol_6_narrative: asRecord(ctx.outputs.vol6),
    }),
  },
  {
    key: STEP_VOL8,
    status: 'vol8',
    label: 'Vol 8 · Execution roadmap',
    icon: 'route',
    description: 'Execution roadmap.',
    agentId: 'execution-roadmap-planner',
    outputKey: 'vol8',
    buildInput: (ctx) => ({
      venture_id: ctx.ventureId,
      opportunity_id: ctx.opportunityId,
      vol_1_opportunity: asRecord(ctx.outputs.vol1),
      vol_2_customer_market: asRecord(ctx.outputs.vol2),
      vol_3_value_proposition: asRecord(ctx.outputs.vol3),
      vol_4_business_model: asRecord(ctx.outputs.vol4),
      vol_5_gtm: asRecord(ctx.outputs.vol5),
      vol_7_risk_validation: asRecord(ctx.outputs.vol7),
    }),
  },
  {
    key: STEP_CRITIC,
    status: 'critic',
    label: 'Venture critic',
    icon: 'gavel',
    description: 'Critique + overall score.',
    agentId: 'venture-critic',
    outputKey: 'critique',
    buildInput: (ctx) => ({
      venture_id: ctx.ventureId,
      vol_1_opportunity: asRecord(ctx.outputs.vol1),
      vol_2_customer_market: asRecord(ctx.outputs.vol2),
      vol_3_value_proposition: asRecord(ctx.outputs.vol3),
      vol_4_business_model: asRecord(ctx.outputs.vol4),
      vol_5_gtm: asRecord(ctx.outputs.vol5),
      vol_6_narrative: asRecord(ctx.outputs.vol6),
      vol_7_risk_validation: asRecord(ctx.outputs.vol7),
      vol_8_execution_roadmap: asRecord(ctx.outputs.vol8),
    }),
  },
  {
    key: STEP_COMPOSER,
    status: 'composer',
    label: 'Dossier composer',
    icon: 'book',
    description: 'Compose final dossier JSON.',
    agentId: 'dossier-composer',
    outputKey: 'dossier',
    buildInput: (ctx) => ({
      venture_id: ctx.ventureId,
      opportunity_id: ctx.opportunityId,
      venture_name: ctx.ventureName,
      vol_1_opportunity: asRecord(ctx.outputs.vol1),
      vol_2_customer_market: asRecord(ctx.outputs.vol2),
      vol_3_value_proposition: asRecord(ctx.outputs.vol3),
      vol_4_business_model: asRecord(ctx.outputs.vol4),
      vol_5_gtm: asRecord(ctx.outputs.vol5),
      vol_6_narrative: asRecord(ctx.outputs.vol6),
      vol_7_risk_validation: asRecord(ctx.outputs.vol7),
      vol_8_execution_roadmap: asRecord(ctx.outputs.vol8),
      critique_result: asRecord(ctx.outputs.critique),
    }),
  },
];

export const TOP_LEVEL_STEPS = ADD_VENTURE_PIPELINE_STEPS.map((step) => ({
  key: step.key,
  label: step.label,
  icon: step.icon,
  description: step.description,
  agentIds: [step.agentId],
}));
