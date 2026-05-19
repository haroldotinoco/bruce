import { getAgentRunner } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import {
  IdeogramClient,
  persistMoodboardReferences,
  SerperImageClient,
  storeSvgAsset,
  type SerperImageReference,
  type StoredAsset,
} from '../services/provider-clients.js';
import { packageIdFor, saveBrandPackage, type BrandAidPackage } from '../services/package-store.js';

interface AgentParams {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item)) : [];
}

function paletteFromVisualSystem(visualSystem: unknown): string[] {
  const palette = asRecord(asRecord(visualSystem).color_palette);
  return [
    ...asRecordArray(palette.primary_colors),
    ...asRecordArray(palette.secondary_colors),
    ...asRecordArray(palette.neutral_palette),
  ]
    .map((color) => stringValue(color.hex))
    .filter(Boolean)
    .slice(0, 8);
}

function critiqueScore(critique: unknown): number {
  const scores = asRecord(asRecord(critique).scores);
  const overall = scores.overall;
  return typeof overall === 'number' ? Math.round(overall) : 0;
}

async function runBrandAgent(agentId: string, params: AgentParams): Promise<unknown> {
  const runner = getAgentRunner();
  const result = await runner.run(
    'brand-aid',
    agentId,
    params.agentInput,
    {
      accountId: params.accountId,
      ventureId: params.ventureId,
      module: 'brand-aid',
      executionId: crypto.randomUUID(),
      correlationId: params.correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? `${agentId} failed`);
  }
  return result.output;
}

export async function runMarketAnalystAgent(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  const { accountId, ventureId } = params;
  logger.info({ accountId, ventureId }, 'brand-aid: market-analyst');
  return runBrandAgent('market-analyst', params);
}

export async function runBrandStrategistAgent(params: AgentParams): Promise<unknown> {
  logger.info({ accountId: params.accountId, ventureId: params.ventureId }, 'brand-aid: brand-strategist');
  return runBrandAgent('brand-strategist', params);
}

export async function runCreativeDirectorAgent(params: AgentParams): Promise<unknown> {
  logger.info({ accountId: params.accountId, ventureId: params.ventureId }, 'brand-aid: creative-director');
  return runBrandAgent('creative-director', params);
}

export async function runNamingAgent(params: AgentParams): Promise<unknown> {
  logger.info({ accountId: params.accountId, ventureId: params.ventureId }, 'brand-aid: naming-agent');
  return runBrandAgent('naming-agent', params);
}

export async function runVisualSystemDesignerAgent(params: AgentParams): Promise<unknown> {
  logger.info({ accountId: params.accountId, ventureId: params.ventureId }, 'brand-aid: visual-system-designer');
  return runBrandAgent('visual-system-designer', params);
}

export async function runLogoDesignerAgent(params: AgentParams): Promise<unknown> {
  logger.info({ accountId: params.accountId, ventureId: params.ventureId }, 'brand-aid: logo-designer');
  return runBrandAgent('logo-designer', params);
}

export async function runBrandCriticAgent(params: AgentParams): Promise<unknown> {
  logger.info({ accountId: params.accountId, ventureId: params.ventureId }, 'brand-aid: brand-critic');
  return runBrandAgent('brand-critic', params);
}

export async function runBrandBookComposerAgent(params: AgentParams): Promise<unknown> {
  logger.info({ accountId: params.accountId, ventureId: params.ventureId }, 'brand-aid: brand-book-composer');
  return runBrandAgent('brand-book-composer', params);
}

export async function searchMoodboardImages(params: {
  accountId: string;
  ventureId: string;
  query: string;
}): Promise<{ clusters: Array<{ label: string; rationale: string; references: SerperImageReference[] }>; limitations?: string; provider_metadata: Record<string, unknown> }> {
  const client = new SerperImageClient();
  const result = await client.search(params.query, 12);
  const references = await persistMoodboardReferences({
    accountId: params.accountId,
    ventureId: params.ventureId,
    references: result.references,
  });
  const clusters = [
    {
      label: 'Category Signals',
      rationale: 'Competitive and category-level visual material to ground the visual territory.',
      references: references.slice(0, 4),
    },
    {
      label: 'Customer Context',
      rationale: 'Visual cues associated with the customer segment and use environment.',
      references: references.slice(4, 8),
    },
    {
      label: 'Differentiation Cues',
      rationale: 'Images that can help the brand avoid category sameness.',
      references: references.slice(8, 12),
    },
  ].filter((cluster) => cluster.references.length > 0);
  return {
    clusters,
    limitations: result.limitations,
    provider_metadata: result.provider_metadata,
  };
}

export async function generateLogoStudies(params: {
  accountId: string;
  ventureId: string;
  brandName: string;
  creativeDirection: unknown;
  visualSystem: unknown;
}): Promise<{ assets: StoredAsset[]; provider_metadata: Record<string, unknown> }> {
  const metaphors = stringArray(asRecord(params.creativeDirection).key_visual_metaphors).join(', ');
  const palette = paletteFromVisualSystem(params.visualSystem).join(', ');
  logger.info(
    {
      accountId: params.accountId,
      ventureId: params.ventureId,
      brandName: params.brandName,
      studyCount: Number(process.env.BRAND_AID_LOGO_STUDY_COUNT ?? 4),
    },
    'brand-aid: generateLogoStudies',
  );
  return new IdeogramClient().generateAndStore({
    accountId: params.accountId,
    ventureId: params.ventureId,
    count: Number(process.env.BRAND_AID_LOGO_STUDY_COUNT ?? 4),
    assetType: 'logo_study',
    transparentBackground: true,
    prompt: `Premium vector logo study for ${params.brandName}. Explore ${metaphors || 'strategic abstract symbols'}. Use palette ${palette || 'distinctive brand colors'}. Transparent background, no mockup.`,
  });
}

export async function generateBrandImagery(params: {
  accountId: string;
  ventureId: string;
  brandName: string;
  creativeDirection: unknown;
  visualSystem: unknown;
}): Promise<{ assets: StoredAsset[]; provider_metadata: Record<string, unknown> }> {
  const mood = stringValue(asRecord(params.creativeDirection).mood_board_description, 'premium product brand imagery');
  const palette = paletteFromVisualSystem(params.visualSystem).join(', ');
  return new IdeogramClient().generateAndStore({
    accountId: params.accountId,
    ventureId: params.ventureId,
    count: Number(process.env.BRAND_AID_IMAGERY_COUNT ?? 5),
    assetType: 'brand_imagery',
    prompt: `Brand imagery system for ${params.brandName}: one hero image and supporting campaign assets. Mood: ${mood}. Palette: ${palette}. Sophisticated, ownable, product-ready.`,
  });
}

export async function storeApprovedLogoAssets(params: {
  accountId: string;
  ventureId: string;
  logoConcepts: unknown;
}): Promise<{ approved_logo?: StoredAsset; assets: StoredAsset[] }> {
  const svgOutput = asRecord(asRecord(params.logoConcepts).svg_output);
  const entries = Object.entries(svgOutput).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].includes('<svg'));
  const assets: StoredAsset[] = [];
  for (const [name, svg] of entries) {
    assets.push(await storeSvgAsset({
      accountId: params.accountId,
      ventureId: params.ventureId,
      filename: `${name.replace(/_/g, '-')}.svg`,
      svg,
      label: name.replace(/_/g, ' '),
    }));
  }
  return { approved_logo: assets[0], assets };
}

export async function persistBrandPackage(params: {
  accountId: string;
  ventureId: string;
  ventureName: string;
  status: 'generating' | 'ready' | 'failed';
  stageOutputs: Record<string, unknown>;
  moodboard: BrandAidPackage['moodboard'];
  logoStudies: StoredAsset[];
  approvedLogo?: StoredAsset;
  brandImagery: StoredAsset[];
  providerMetadata: Record<string, unknown>;
  critiqueIterations: BrandAidPackage['critique_iterations'];
  projectNickname?: string;
  error?: string;
}): Promise<BrandAidPackage> {
  const now = new Date().toISOString();
  const naming = params.stageOutputs.naming;
  const visualSystem = params.stageOutputs.visual_system;
  const critique = params.stageOutputs.critique;
  const logoAssets = params.approvedLogo ? [params.approvedLogo] : [];
  const brandbook = params.stageOutputs.brandbook;
  const pkg: BrandAidPackage = {
    id: packageIdFor(params.ventureId),
    account_id: params.accountId,
    venture_id: params.ventureId,
    venture_name: params.ventureName,
    status: params.status,
    created_at: now,
    updated_at: now,
    current_step: params.status === 'ready' ? 'brand-ready' : 'generating',
    names: asRecordArray(asRecord(naming).top_candidates).map((item) => stringValue(item.name)).filter(Boolean).slice(0, 5),
    palette: paletteFromVisualSystem(visualSystem),
    score: critiqueScore(critique),
    logo_count: params.logoStudies.length + logoAssets.length,
    moodboard: params.moodboard,
    logo_studies: params.logoStudies,
    approved_logo: params.approvedLogo,
    brand_imagery: params.brandImagery,
    brandbook,
    export_manifest: asRecord(brandbook).export_manifest,
    critique,
    critique_iterations: params.critiqueIterations,
    provider_metadata: params.providerMetadata,
    asset_manifest: [...params.logoStudies, ...logoAssets, ...params.brandImagery],
    stage_outputs: params.stageOutputs,
    project_nickname: params.projectNickname,
    error: params.error,
  };
  await saveBrandPackage(pkg);
  return pkg;
}

export async function emitBrandPipelineCompleted(params: {
  accountId: string;
  ventureId: string;
  result: unknown;
  correlationId?: string;
  observabilityRunId?: string;
  temporalWorkflowId?: string;
}): Promise<void> {
  await emitEvent(
    'brand-aid.pipeline.completed',
    'brand-aid',
    {
      account_id: params.accountId,
      observability_run_id: params.observabilityRunId,
      temporal_workflow_id: params.temporalWorkflowId,
      result: params.result,
    },
    {
      ventureId: params.ventureId,
      correlationId: params.correlationId,
      observabilityRunId: params.observabilityRunId,
      temporalWorkflowId: params.temporalWorkflowId,
      warnWhenNoSubscribers: false,
    }
  );
}

export async function emitBrandReady(params: {
  accountId: string;
  ventureId: string;
  brandPackage: BrandAidPackage;
  correlationId?: string;
  observabilityRunId?: string;
  temporalWorkflowId?: string;
}): Promise<void> {
  await emitEvent(
    'brand-aid.brand-ready',
    'brand-aid',
    {
      account_id: params.accountId,
      package_id: params.brandPackage.id,
      venture_id: params.ventureId,
      approved_logo: params.brandPackage.approved_logo,
      brandbook: params.brandPackage.brandbook,
      asset_manifest: params.brandPackage.asset_manifest,
    },
    {
      ventureId: params.ventureId,
      correlationId: params.correlationId,
      observabilityRunId: params.observabilityRunId,
      temporalWorkflowId: params.temporalWorkflowId,
      warnWhenNoSubscribers: false,
    }
  );
}

export async function updateBrandExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const redis = getRedisClient();
  await redis.set(params.accountId, 'brand-aid', 'pipeline', params.ventureId, `state:${params.step}`, params.state, 3600);
}

export { obsStartRun, obsUpdateStep, obsStepEvent, obsCompleteRun, obsFailRun, obsSetRunProgress } from '@bruce/observability';
