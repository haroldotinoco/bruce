import {
  defineQuery,
  proxyActivities,
  setHandler,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';
import type { LogValue } from '@bruce/contracts/observability';
import { v } from '@bruce/contracts/observability';
import type * as Activities from './activities.js';
import {
  assetImageObsFields,
  creativeDirectionObsFields,
  critiqueObsFields,
  moodboardObsFields,
  visualSystemObsFields,
} from './workflow-obs-fields.js';

export interface BrandAidPipelineState {
  status: 'starting' | 'running' | 'completed' | 'failed';
  currentStep: string;
  results?: unknown;
  error?: string;
  critiqueIteration?: number;
}

let workflowState: BrandAidPipelineState = {
  status: 'starting',
  currentStep: 'init',
};

export const queryState = defineQuery<BrandAidPipelineState>('state');

const act = proxyActivities<typeof Activities>({
  startToCloseTimeout: '20 minutes',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

const STEP_BRAND_STRATEGY = 'brand-strategy';
const STEP_MARKET_RESEARCH = 'market-research';
const STEP_MOODBOARD = 'moodboard-curation';
const STEP_CREATIVE_DIRECTION = 'creative-direction';
const STEP_NAMING = 'naming';
const STEP_VISUAL_SYSTEM = 'visual-system-design';
const STEP_LOGO_STUDY = 'logo-study';
const STEP_LOGO_DESIGN = 'logo-design';
const STEP_BRAND_CRITIQUE = 'brand-critique';
const STEP_BRAND_IMAGERY = 'brand-imagery';
const STEP_BRAND_BOOK = 'brand-book-composition';

const TOP_LEVEL_STEPS = [
  { key: STEP_BRAND_STRATEGY, label: 'Brand strategy', icon: 'target', description: 'Define positioning and strategic brand choices.', agentIds: ['brand-strategist'] },
  { key: STEP_MARKET_RESEARCH, label: 'Market research', icon: 'bar-chart-3', description: 'Analyze competitors and market voice.', agentIds: ['market-analyst'] },
  { key: STEP_MOODBOARD, label: 'Moodboard curation', icon: 'images', description: 'Ground the creative direction in image references.', agentIds: ['serper-images'] },
  { key: STEP_CREATIVE_DIRECTION, label: 'Creative direction', icon: 'compass', description: 'Synthesize strategy into visual and naming criteria.', agentIds: ['creative-director'] },
  { key: STEP_NAMING, label: 'Naming', icon: 'type', description: 'Generate and score name candidates.', agentIds: ['naming-agent'] },
  { key: STEP_VISUAL_SYSTEM, label: 'Visual system', icon: 'palette', description: 'Create palette, typography, and design tokens.', agentIds: ['visual-system-designer'] },
  { key: STEP_LOGO_STUDY, label: 'Logo studies', icon: 'sparkles', description: 'Generate exploratory raster studies with Ideogram.', agentIds: ['ideogram'] },
  { key: STEP_LOGO_DESIGN, label: 'Logo design', icon: 'pen-tool', description: 'Convert the selected study direction into SVG assets.', agentIds: ['logo-designer'] },
  { key: STEP_BRAND_CRITIQUE, label: 'Brand critique', icon: 'award', description: 'Score the full brand package and iterate if needed.', agentIds: ['brand-critic'] },
  { key: STEP_BRAND_IMAGERY, label: 'Brand imagery', icon: 'image', description: 'Generate final hero and supporting brand images.', agentIds: ['ideogram'] },
  { key: STEP_BRAND_BOOK, label: 'Brand book', icon: 'book-open', description: 'Compose final export package.', agentIds: ['brand-book-composer'] },
];

interface PipelineInput {
  account_id: string;
  venture_id: string;
  agent_input: Record<string, unknown>;
  correlation_id?: string;
  project_nickname?: string;
  critiquePassScore?: number;
  maxIterations?: number;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item)) : [];
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
}

function ventureName(input: Record<string, unknown>, ventureId: string): string {
  const source = asRecord(input.source_handoff);
  return stringValue(source.venture_name, stringValue(input.venture_name, `Venture ${ventureId.slice(0, 8)}`));
}

function targetCustomer(input: Record<string, unknown>): Record<string, unknown> {
  const source = asRecord(input.source_handoff);
  const audience = asRecord(source.target_audience);
  const segment = stringValue(input.customer_segment, stringValue(audience.primary_segment, 'General market'));
  return {
    segment,
    needs: stringArray(audience.needs).length ? stringArray(audience.needs) : ['clarity', 'trust', 'speed'],
    pain_points: stringArray(audience.pain_points).length ? stringArray(audience.pain_points) : ['fragmented alternatives', 'unclear value'],
  };
}

function brandStrategyInput(input: Record<string, unknown>): Record<string, unknown> {
  const source = asRecord(input.source_handoff);
  return {
    venture_hypothesis: stringValue(input.venture_hypothesis, stringValue(source.value_proposition, 'New venture')),
    target_customer: targetCustomer(input),
    problem_statement: stringValue(source.problem_statement, stringValue(input.venture_hypothesis, 'Customer problem')),
    competitive_landscape: asRecordArray(input.competitors).map((competitor) => ({
      competitor: stringValue(competitor.name, 'Competitor'),
      positioning: stringValue(competitor.positioning, 'Known category alternative'),
      strengths: [],
      weaknesses: [],
    })),
    desired_perception: stringValue(source.positioning_statement, 'credible, differentiated, and useful'),
    constraints: stringArray(source.visual_mood),
  };
}

function enrichBrandStrategyForCreative(
  strategy: unknown,
  agentInput: Record<string, unknown>,
): Record<string, unknown> {
  const s = asRecord(strategy);
  const handoff = asRecord(agentInput.source_handoff);
  const audience = asRecord(handoff.target_audience);
  return {
    ...s,
    positioning: stringValue(
      s.positioning,
      stringValue(handoff.positioning_statement, stringValue(handoff.competitive_differentiation)),
    ),
    brand_promise: stringValue(
      s.brand_promise,
      stringValue(handoff.value_proposition, stringValue(handoff.mission_statement)),
    ),
    personality_traits:
      stringArray(s.personality_traits).length > 0
        ? stringArray(s.personality_traits)
        : stringArray(handoff.tone_of_voice),
    values:
      stringArray(s.values).length > 0 ? stringArray(s.values) : stringArray(handoff.positioning_pillars),
    primary_archetype: stringValue(s.primary_archetype, 'Creator'),
    secondary_archetype: stringValue(s.secondary_archetype),
    target_customer_summary: stringValue(
      audience.primary_segment,
      stringValue(agentInput.customer_segment),
    ),
  };
}

function moodboardVisualInspiration(moodboard: unknown): string[] {
  const items: string[] = [];
  for (const cluster of asRecordArray(asRecord(moodboard).clusters)) {
    const label = stringValue(cluster.label);
    const rationale = stringValue(cluster.rationale);
    if (label) items.push(label);
    if (rationale) items.push(rationale);
    for (const ref of asRecordArray(cluster.references)) {
      const url =
        stringValue(ref.persisted_url) ||
        stringValue(ref.image_url) ||
        stringValue(ref.thumbnail_url);
      const title = stringValue(ref.title);
      if (url) items.push(url);
      else if (title) items.push(title);
    }
  }
  return [...new Set(items)].filter(Boolean).slice(0, 24);
}

function creativeDirectionInput(
  strategy: unknown,
  market: unknown,
  moodboard: unknown,
  agentInput: Record<string, unknown>,
): Record<string, unknown> {
  const handoff = asRecord(agentInput.source_handoff);
  return {
    brand_strategy: enrichBrandStrategyForCreative(strategy, agentInput),
    market_analysis: market,
    visual_inspiration: moodboardVisualInspiration(moodboard),
    brand_voice_references: stringArray(handoff.tone_of_voice),
    design_constraints: [
      'must work for digital product surfaces',
      'must remain legible at small sizes',
      ...stringArray(handoff.visual_mood),
    ].slice(0, 8),
  };
}

function namingInput(strategy: unknown, creativeDirection: unknown, marketInput: Record<string, unknown>): Record<string, unknown> {
  const forced = forcedBrandName(marketInput);
  return {
    creative_direction: creativeDirection,
    positioning: stringValue(asRecord(strategy).positioning, 'Distinct product positioning'),
    target_customer: stringValue(marketInput.customer_segment, 'Target customer'),
    competitive_names: asRecordArray(marketInput.competitors).map((item) => stringValue(item.name)).filter(Boolean),
    naming_preferences: { preferred_length_syllables: 2, preferred_style: ['memorable', 'ownable'] },
    ...(forced ? { forced_brand_name: forced } : {}),
  };
}

function forcedBrandName(input: Record<string, unknown>): string {
  return stringValue(input.forced_brand_name);
}

function syntheticNamingOutput(forcedName: string): Record<string, unknown> {
  const candidate = {
    name: forcedName,
    approach: 'forced',
    rationale: 'User-provided brand name.',
    domain_status: 'not_checked',
  };
  return {
    top_candidates: [
      {
        rank: 1,
        name: forcedName,
        overall_score: 100,
        rationale: 'User-provided brand name.',
        approach: 'forced',
      },
    ],
    all_candidates: [candidate],
    scoring_methodology: 'Skipped — forced brand name.',
    domain_availability_summary: 'Naming step skipped; domain check not run.',
    trademark_flags: [],
    recommendation: 'Proceed with visual system using the forced brand name.',
  };
}

function selectedBrandName(naming: unknown, input: Record<string, unknown>, ventureId: string): string {
  const forced = forcedBrandName(input);
  if (forced) return forced;
  const top = asRecordArray(asRecord(naming).top_candidates)[0];
  return stringValue(top?.name, ventureName(input, ventureId));
}

function critiquePassed(critique: unknown, passScore: number): { score: number; passed: boolean; focus: string } {
  const scores = asRecord(asRecord(critique).scores);
  const rawScore = scores.overall;
  const score = typeof rawScore === 'number' ? Math.round(rawScore) : 0;
  const passFail = asRecord(critique).pass_fail;
  return {
    score,
    passed: passFail === true || score >= passScore,
    focus: stringValue(asRecord(critique).iteration_recommendations, 'Improve strategic fit and visual coherence.'),
  };
}

async function markStep(
  runId: string,
  accountId: string,
  key: string,
  status: 'running' | 'done' | 'failed',
  fields?: Record<string, LogValue>,
): Promise<void> {
  if (status === 'running') {
    await act.obsUpdateStep({ runId, accountId, key, status, startedAt: new Date().toISOString(), fields });
  } else {
    await act.obsUpdateStep({ runId, accountId, key, status, finishedAt: new Date().toISOString(), fields });
  }
}

export async function brandAidPipelineWorkflow(input: PipelineInput): Promise<unknown> {
  const { account_id, venture_id, agent_input, correlation_id, project_nickname } = input;
  const correlationId = correlation_id ?? uuid4();
  const wfId = workflowInfo().workflowId;
  const passScore = Number.isFinite(input.critiquePassScore) ? input.critiquePassScore ?? 75 : 75;
  const maxIterations = Number.isFinite(input.maxIterations) ? input.maxIterations ?? 2 : 2;
  const providerMetadata: Record<string, unknown> = {};
  const stageOutputs: Record<string, unknown> = {};
  const critiqueIterations: Array<{ iteration: number; score: number; passed: boolean; focus: string }> = [];

  setHandler(queryState, () => workflowState);

  const obsRunId = await act.obsStartRun({
    accountId: account_id,
    module: 'brand-aid',
    workflowType: 'brandAidPipelineWorkflow',
    temporalWorkflowId: wfId,
    correlationId,
    ventureId: venture_id,
    title: `Brand-aid pipeline · ${wfId.slice(-8)}`,
    steps: TOP_LEVEL_STEPS,
  });

  const baseAgentParams = {
    accountId: account_id,
    ventureId: venture_id,
    correlationId,
    observabilityRunId: obsRunId,
    projectNickname: project_nickname,
  };

  try {
    workflowState = { status: 'running', currentStep: STEP_BRAND_STRATEGY };
    await act.persistBrandPackage({
      accountId: account_id,
      ventureId: venture_id,
      ventureName: ventureName(agent_input, venture_id),
      status: 'generating',
      stageOutputs,
      moodboard: { clusters: [] },
      logoStudies: [],
      brandImagery: [],
      providerMetadata,
      critiqueIterations,
      projectNickname: project_nickname,
    });

    await Promise.all([
      markStep(obsRunId, account_id, STEP_BRAND_STRATEGY, 'running'),
      markStep(obsRunId, account_id, STEP_MARKET_RESEARCH, 'running'),
    ]);

    const [strategy, market] = await Promise.all([
      act.runAgentActivity({
        module: 'brand-aid',
        agentId: 'brand-strategist',
        input: brandStrategyInput(agent_input),
        context: { ...baseAgentParams, observabilityStepKey: STEP_BRAND_STRATEGY },
      }),
      act.runAgentActivity({
        module: 'brand-aid',
        agentId: 'market-analyst',
        input: agent_input,
        context: { ...baseAgentParams, observabilityStepKey: STEP_MARKET_RESEARCH },
      }),
    ]);
    stageOutputs.strategy = strategy;
    stageOutputs.market_research = market;

    await Promise.all([
      markStep(obsRunId, account_id, STEP_BRAND_STRATEGY, 'done', { agent: { kind: 'text_short', value: 'brand-strategist' } }),
      markStep(obsRunId, account_id, STEP_MARKET_RESEARCH, 'done', { agent: { kind: 'text_short', value: 'market-analyst' } }),
    ]);

    workflowState = { status: 'running', currentStep: STEP_MOODBOARD };
    await markStep(obsRunId, account_id, STEP_MOODBOARD, 'running');
    const moodboard = await act.searchMoodboardImages({
      accountId: account_id,
      ventureId: venture_id,
      query: `${stringValue(agent_input.venture_hypothesis)} ${stringValue(agent_input.customer_segment)} brand moodboard competitor visual identity`,
    });
    stageOutputs.moodboard = { clusters: moodboard.clusters, limitations: moodboard.limitations };
    providerMetadata.serper = moodboard.provider_metadata;
    await markStep(obsRunId, account_id, STEP_MOODBOARD, 'done', {
      ...moodboardObsFields(stageOutputs.moodboard),
      package_id: v.idRef('job', `brand_${venture_id}`, 'Brand package', `/brand-aid/package/brand_${venture_id}`),
    });

    await act.persistBrandPackage({
      accountId: account_id,
      ventureId: venture_id,
      ventureName: ventureName(agent_input, venture_id),
      status: 'generating',
      stageOutputs,
      moodboard: stageOutputs.moodboard as { clusters: []; limitations?: string },
      logoStudies: [],
      brandImagery: [],
      providerMetadata,
      critiqueIterations,
      projectNickname: project_nickname,
    });

    workflowState = { status: 'running', currentStep: STEP_CREATIVE_DIRECTION };
    await markStep(obsRunId, account_id, STEP_CREATIVE_DIRECTION, 'running');
    const creativeDirection = await act.runAgentActivity({
      module: 'brand-aid',
      agentId: 'creative-director',
      input: creativeDirectionInput(strategy, market, stageOutputs.moodboard, agent_input),
      context: { ...baseAgentParams, observabilityStepKey: STEP_CREATIVE_DIRECTION },
    });
    stageOutputs.creative_direction = creativeDirection;
    await markStep(obsRunId, account_id, STEP_CREATIVE_DIRECTION, 'done', creativeDirectionObsFields(creativeDirection));

    workflowState = { status: 'running', currentStep: STEP_NAMING };
    await markStep(obsRunId, account_id, STEP_NAMING, 'running');
    const forcedName = forcedBrandName(agent_input);
    let naming: unknown;
    if (forcedName) {
      naming = syntheticNamingOutput(forcedName);
      stageOutputs.naming = naming;
      await markStep(obsRunId, account_id, STEP_NAMING, 'done', {
        brand_name: { kind: 'text_short', value: forcedName },
        skipped: { kind: 'text_short', value: 'forced_brand_name' },
      });
    } else {
      naming = await act.runAgentActivity({
        module: 'brand-aid',
        agentId: 'naming-agent',
        input: namingInput(strategy, creativeDirection, agent_input),
        context: { ...baseAgentParams, observabilityStepKey: STEP_NAMING },
      });
      stageOutputs.naming = naming;
      await markStep(obsRunId, account_id, STEP_NAMING, 'done', {
        brand_name: { kind: 'text_short', value: selectedBrandName(naming, agent_input, venture_id) },
      });
    }
    const brandName = selectedBrandName(naming, agent_input, venture_id);

    let visualSystem: unknown;
    let logoStudies: Awaited<ReturnType<typeof act.generateLogoStudies>>['assets'] = [];
    let logoConcepts: unknown;
    let approvedLogo: Awaited<ReturnType<typeof act.storeApprovedLogoAssets>>['approved_logo'];
    let critique: unknown;

    for (let iteration = 0; iteration <= maxIterations; iteration++) {
      workflowState = { status: 'running', currentStep: STEP_VISUAL_SYSTEM, critiqueIteration: iteration };
      await markStep(obsRunId, account_id, STEP_VISUAL_SYSTEM, 'running', { iteration: { kind: 'number', value: iteration } });
      visualSystem = await act.runAgentActivity({
        module: 'brand-aid',
        agentId: 'visual-system-designer',
        input: {
          creative_direction: creativeDirection,
          brand_archetype: stringValue(asRecord(strategy).primary_archetype, 'Creator'),
          implementation_context: { primary_medium: 'multi-channel', color_model_preference: 'HEX', design_tool: 'agnostic' },
          accessibility_requirements: { wcag_level: 'AA', color_blindness_safe: true },
        },
        context: { ...baseAgentParams, observabilityStepKey: STEP_VISUAL_SYSTEM },
      });
      stageOutputs.visual_system = visualSystem;
      await markStep(obsRunId, account_id, STEP_VISUAL_SYSTEM, 'done', visualSystemObsFields(visualSystem));

      workflowState = { status: 'running', currentStep: STEP_LOGO_STUDY, critiqueIteration: iteration };
      await markStep(obsRunId, account_id, STEP_LOGO_STUDY, 'running', { iteration: { kind: 'number', value: iteration } });
      const studyResult = await act.generateLogoStudies({
        accountId: account_id,
        ventureId: venture_id,
        brandName,
        creativeDirection,
        visualSystem,
      });
      logoStudies = studyResult.assets;
      providerMetadata.ideogram_logo_studies = studyResult.provider_metadata;
      stageOutputs.logo_studies = logoStudies;
      await markStep(obsRunId, account_id, STEP_LOGO_STUDY, 'done', assetImageObsFields(logoStudies, 'logo_images'));

      workflowState = { status: 'running', currentStep: STEP_LOGO_DESIGN, critiqueIteration: iteration };
      await markStep(obsRunId, account_id, STEP_LOGO_DESIGN, 'running', { iteration: { kind: 'number', value: iteration } });
      logoConcepts = await act.runAgentActivity({
        module: 'brand-aid',
        agentId: 'logo-designer',
        input: {
          creative_direction: creativeDirection,
          brand_name: brandName,
          brand_archetype: stringValue(asRecord(strategy).primary_archetype, 'Creator'),
          visual_system: visualSystem,
          logo_requirements: { include_wordmark: true, icon_only_needed: true, primary_use_case: 'multi-channel' },
          logo_studies: logoStudies,
        },
        context: { ...baseAgentParams, observabilityStepKey: STEP_LOGO_DESIGN },
      });
      stageOutputs.logo_concepts = logoConcepts;
      const logoAssets = await act.storeApprovedLogoAssets({ accountId: account_id, ventureId: venture_id, logoConcepts });
      approvedLogo = logoAssets.approved_logo;
      stageOutputs.approved_logo = approvedLogo;
      await markStep(obsRunId, account_id, STEP_LOGO_DESIGN, 'done');

      workflowState = { status: 'running', currentStep: STEP_BRAND_CRITIQUE, critiqueIteration: iteration };
      await markStep(obsRunId, account_id, STEP_BRAND_CRITIQUE, 'running', { iteration: { kind: 'number', value: iteration } });
      critique = await act.runAgentActivity({
        module: 'brand-aid',
        agentId: 'brand-critic',
        input: {
          brand_strategy: strategy,
          visual_system: visualSystem,
          logo_concepts: logoConcepts,
          naming_candidates: naming,
          market_analysis: market,
          moodboard: stageOutputs.moodboard,
          logo_studies: logoStudies,
        },
        context: { ...baseAgentParams, observabilityStepKey: STEP_BRAND_CRITIQUE },
      });
      stageOutputs.critique = critique;
      const gate = critiquePassed(critique, passScore);
      critiqueIterations.push({ iteration, ...gate });
      await markStep(obsRunId, account_id, STEP_BRAND_CRITIQUE, 'done', {
        ...critiqueObsFields(critique),
        passed: { kind: 'boolean', value: gate.passed },
      });
      if (gate.passed) break;
      if (iteration === maxIterations) {
        const packageResult = await act.persistBrandPackage({
          accountId: account_id,
          ventureId: venture_id,
          ventureName: ventureName(agent_input, venture_id),
          status: 'failed',
          stageOutputs,
          moodboard: stageOutputs.moodboard as { clusters: []; limitations?: string },
          logoStudies,
          approvedLogo,
          brandImagery: [],
          providerMetadata,
          critiqueIterations,
          projectNickname: project_nickname,
          error: `Critique score ${gate.score} below pass score ${passScore} after ${maxIterations + 1} attempts.`,
        });
        await act.emitBrandPipelineCompleted({
          accountId: account_id,
          ventureId: venture_id,
          result: packageResult,
          correlationId,
          observabilityRunId: obsRunId,
          temporalWorkflowId: wfId,
        });
        await act.obsCompleteRun({ runId: obsRunId, accountId: account_id, result: packageResult });
        workflowState = { status: 'completed', currentStep: 'critique-failed', results: packageResult };
        return packageResult;
      }
    }

    workflowState = { status: 'running', currentStep: STEP_BRAND_IMAGERY };
    await markStep(obsRunId, account_id, STEP_BRAND_IMAGERY, 'running');
    const imageryResult = await act.generateBrandImagery({
      accountId: account_id,
      ventureId: venture_id,
      brandName,
      creativeDirection,
      visualSystem,
    });
    providerMetadata.ideogram_brand_imagery = imageryResult.provider_metadata;
    stageOutputs.brand_imagery = imageryResult.assets;
    await markStep(obsRunId, account_id, STEP_BRAND_IMAGERY, 'done', assetImageObsFields(imageryResult.assets, 'brand_images'));

    workflowState = { status: 'running', currentStep: STEP_BRAND_BOOK };
    await markStep(obsRunId, account_id, STEP_BRAND_BOOK, 'running');
    const brandbook = await act.runAgentActivity({
      module: 'brand-aid',
      agentId: 'brand-book-composer',
      input: {
        brand_identity: {
          strategy,
          visual_system: visualSystem,
          logo_concepts: logoConcepts,
          naming_candidates: naming,
          logo_studies: logoStudies,
          approved_logo: approvedLogo,
          brand_imagery: imageryResult.assets,
        },
        brand_critique: {
          overall: critiquePassed(critique, passScore).score,
          pass_fail: true,
          critique,
        },
        export_formats: ['pdf', 'json', 'css'],
        brand_name: brandName,
        composition_options: { include_extended_guidelines: true, include_marketing_brief: true, audience: 'all' },
      },
      context: { ...baseAgentParams, observabilityStepKey: STEP_BRAND_BOOK },
    });
    stageOutputs.brandbook = brandbook;
    await markStep(obsRunId, account_id, STEP_BRAND_BOOK, 'done');

    const finalResult = await act.persistBrandPackage({
      accountId: account_id,
      ventureId: venture_id,
      ventureName: ventureName(agent_input, venture_id),
      status: 'ready',
      stageOutputs,
      moodboard: stageOutputs.moodboard as { clusters: []; limitations?: string },
      logoStudies,
      approvedLogo,
      brandImagery: imageryResult.assets,
      providerMetadata,
      critiqueIterations,
      projectNickname: project_nickname,
    });

    await act.emitBrandPipelineCompleted({
      accountId: account_id,
      ventureId: venture_id,
      result: finalResult,
      correlationId,
      observabilityRunId: obsRunId,
      temporalWorkflowId: wfId,
    });
    await act.emitBrandReady({
      accountId: account_id,
      ventureId: venture_id,
      brandPackage: finalResult,
      correlationId,
      observabilityRunId: obsRunId,
      temporalWorkflowId: wfId,
    });
    await act.obsCompleteRun({ runId: obsRunId, accountId: account_id, result: finalResult });

    workflowState = { status: 'completed', currentStep: 'done', results: finalResult };
    return finalResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const failedStep = workflowState.currentStep;
    const topLevelStepKeys = new Set(TOP_LEVEL_STEPS.map((step) => step.key));
    if (failedStep && topLevelStepKeys.has(failedStep)) {
      await markStep(obsRunId, account_id, failedStep, 'failed', {
        error: { kind: 'text_long', value: errorMessage },
      });
    }
    const partialLogoStudies = Array.isArray(stageOutputs.logo_studies)
      ? (stageOutputs.logo_studies as Awaited<ReturnType<typeof act.generateLogoStudies>>['assets'])
      : [];
    await act.persistBrandPackage({
      accountId: account_id,
      ventureId: venture_id,
      ventureName: ventureName(agent_input, venture_id),
      status: 'failed',
      stageOutputs,
      moodboard: (stageOutputs.moodboard ?? { clusters: [] }) as { clusters: []; limitations?: string },
      logoStudies: partialLogoStudies,
      brandImagery: [],
      providerMetadata,
      critiqueIterations,
      projectNickname: project_nickname,
      error: errorMessage,
    });
    await act.obsFailRun({ runId: obsRunId, accountId: account_id, errorMessage });
    workflowState = { status: 'failed', currentStep: failedStep || 'error', error: errorMessage };
    throw error;
  }
}
