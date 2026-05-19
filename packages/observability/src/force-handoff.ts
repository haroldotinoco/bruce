import { emitEvent } from '@bruce/events';
import {
  buildBruceMemoryInputFromPortfolioDecisionHandoff,
  buildBuilderToGtmHandoff,
  buildGtmToStartupOpsHandoff,
  buildPortfolioToBruceCoreHandoff,
  buildStartupOpsToPortfolioHandoff,
  buildVentureHandoffFromPrioritization,
  buildVentureToBrandHandoff,
  buildVentureToBuilderHandoff,
  createModuleHandoffEnvelope,
  createValidatedModuleHandoffEnvelope,
  validateBuilderToGtmHandoff,
  validateGtmToStartupOpsHandoff,
  validatePortfolioToBruceCoreHandoff,
  validateStartupOpsToPortfolioHandoff,
  validateVentureToBrandHandoff,
  validateVentureToBuilderHandoff,
} from '@bruce/handoff';
import type { ActiveWorkflow, LogValue, WorkflowStep } from '@bruce/contracts/observability';
import { getWorkflowRun, getWorkflowRunByTemporalId, getWorkflowRunRecord, getWorkflowRunRecordByTemporalId, type WorkflowRunRecord } from './workflow-loader.js';
import { obsStepEvent } from './temporal-activities.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FORCE_HANDOFF_ROUTES = {
  opportunity: { eventType: 'opportunity.advanced', targets: ['add-venture'] },
  'add-venture': { eventType: 'venture.qualified', targets: ['brand-aid', 'builder'] },
  builder: { eventType: 'builder.pipeline.completed', targets: ['gtm'] },
  gtm: { eventType: 'gtm.pipeline.completed', targets: ['startup-ops'] },
  'startup-ops': { eventType: 'startup-ops.pipeline.completed', targets: ['portfolio'] },
  portfolio: { eventType: 'portfolio.pipeline.completed', targets: ['bruce-memory', 'bruce-core'] },
} as const;

type ForceSourceModule = keyof typeof FORCE_HANDOFF_ROUTES;

export interface ForceHandoffRequest {
  force: boolean;
  reason: string;
  target_module?: string;
  source_step_id?: string;
}

export interface ForceHandoffResponse {
  status: 'emitted';
  event_type: string;
  source_module: string;
  target_modules: string[];
  forced_from_run_id: string;
  forced_from_temporal_workflow_id?: string;
}

export class ForceHandoffError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ForceHandoffError';
  }
}

export function resolveForceHandoffRoute(
  sourceModule: string,
  targetModule?: string,
): { eventType: string; targetModules: string[] } {
  const route = FORCE_HANDOFF_ROUTES[sourceModule as ForceSourceModule];
  if (!route) {
    throw new ForceHandoffError(409, `Module ${sourceModule} has no durable downstream handoff.`);
  }
  const targets = [...route.targets];
  if (targetModule) {
    if (!targets.includes(targetModule as never)) {
      throw new ForceHandoffError(
        400,
        `Target module ${targetModule} is not downstream of ${sourceModule}.`,
      );
    }
    return { eventType: route.eventType, targetModules: [targetModule] };
  }
  return { eventType: route.eventType, targetModules: targets };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function maybeRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function nonEmpty<T>(items: T[], fallback: T[]): T[] {
  return items.length > 0 ? items : fallback;
}

function unwrapLogValue(value: LogValue | undefined): unknown {
  return value && typeof value === 'object' && 'value' in value ? value.value : undefined;
}

function walkSteps(steps: WorkflowStep[]): WorkflowStep[] {
  return steps.flatMap((step) => [step, ...walkSteps(step.sub_steps ?? [])]);
}

function stepPayloadScore(step: WorkflowStep): number {
  let score = 0;
  if (step.fields?.raw_input) score += 4;
  if (step.fields?.raw_output) score += 4;
  if (step.fields?.analyst_input) score += 5;
  if (step.quality_gate?.score) score += 2;
  if ((step.key ?? step.id).includes('scoring')) score += 3;
  if ((step.key ?? step.id).includes('analyst')) score += 2;
  if (step.status === 'done' || step.status === 'failed') score += 1;
  return score;
}

function selectedStep(workflow: ActiveWorkflow | null, sourceStepId?: string): WorkflowStep | undefined {
  const steps = walkSteps(workflow?.steps ?? []);
  if (!sourceStepId) {
    return [...steps].sort((a, b) => stepPayloadScore(b) - stepPayloadScore(a))[0];
  }
  return steps.find((step) => step.id === sourceStepId || step.key === sourceStepId);
}

async function loadRun(
  accountId: string,
  runId: string,
): Promise<{ record: WorkflowRunRecord; workflow: ActiveWorkflow | null }> {
  const byId = UUID_RE.test(runId);
  const record = byId
    ? await getWorkflowRunRecord(accountId, runId)
    : await getWorkflowRunRecordByTemporalId(accountId, runId);
  if (!record) throw new ForceHandoffError(404, 'Workflow run not found.');

  const workflow = byId
    ? await getWorkflowRun(accountId, runId)
    : await getWorkflowRunByTemporalId(accountId, runId);
  return { record, workflow };
}

function resultRoot(record: WorkflowRunRecord): Record<string, unknown> {
  return asRecord(record.result_json);
}

function primaryResult(record: WorkflowRunRecord): Record<string, unknown> {
  const root = resultRoot(record);
  return maybeRecord(root.result) ?? maybeRecord(root.results) ?? maybeRecord(root.dossier) ?? root;
}

function forceMetadata(record: WorkflowRunRecord, req: ForceHandoffRequest): Record<string, unknown> {
  return {
    force_override: true,
    force_reason: req.reason,
    forced_from_run_id: record.id,
    forced_from_temporal_workflow_id: record.temporal_workflow_id,
    forced_source_step_id: req.source_step_id,
  };
}

function ensureOpportunityHandoffPayload(
  payload: Record<string, unknown>,
  record: WorkflowRunRecord,
): Record<string, unknown> {
  return {
    ...payload,
    opportunity_id: stringValue(payload.opportunity_id, `forced-${record.id}`),
    title: stringValue(payload.title, record.title),
    problem_statement: stringValue(
      payload.problem_statement,
      stringValue(payload.description, 'Forced opportunity handoff from workflow detail.'),
    ),
    target_segment: stringValue(
      payload.target_segment,
      stringValue(payload.market_segment, 'general'),
    ),
    market_segment: stringValue(
      payload.market_segment,
      stringValue(payload.target_segment, 'general'),
    ),
  };
}

function opportunityPayloadFromStep(
  record: WorkflowRunRecord,
  workflow: ActiveWorkflow | null,
  req: ForceHandoffRequest,
): Record<string, unknown> {
  const step = selectedStep(workflow, req.source_step_id);
  const rawInput = asRecord(unwrapLogValue(step?.fields?.raw_input));
  const rawOutput = asRecord(unwrapLogValue(step?.fields?.raw_output));
  const analystInput = asRecord(unwrapLogValue(step?.fields?.analyst_input));
  const gateScore = numberValue(step?.quality_gate?.score?.value, numberValue(rawOutput.total_score, 0));
  return ensureOpportunityHandoffPayload(
    {
      ...analystInput,
      ...rawInput,
      ...rawOutput,
      total_score: gateScore,
      validation_score: gateScore,
      prioritization_status: 'FORCED',
      prioritization_recommendation: 'force_advance',
    },
    record,
  );
}

function buildOpportunityEventPayload(
  record: WorkflowRunRecord,
  workflow: ActiveWorkflow | null,
  req: ForceHandoffRequest,
  correlationId: string,
): Record<string, unknown> {
  const root = resultRoot(record);
  const prioritized = asRecord(root.results);
  const ranked = asArray(prioritized.ranked_opportunities);
  const ventureHandoff = ranked.length
    ? buildVentureHandoffFromPrioritization({
        prioritizedResults: prioritized,
        passedAnalystOutputs: [],
        passedScoredOutputs: [],
      })
    : opportunityPayloadFromStep(record, workflow, req);
  const forced = ensureOpportunityHandoffPayload(
    { ...ventureHandoff, ...forceMetadata(record, req) },
    record,
  );
  const handoff = createModuleHandoffEnvelope({
    fromModule: 'opportunity',
    toModule: 'add-venture',
    ventureId: stringValue(record.venture_id, record.id),
    payload: forced,
    correlationId,
    workflowExecutionId: record.temporal_workflow_id,
    triggeredBy: 'manual_trigger',
    targetSchema: 'opportunity-to-venture.schema.json',
  });
  return {
    account_id: record.account_id,
    scan_id: root.scan_id,
    observability_run_id: record.id,
    temporal_workflow_id: record.temporal_workflow_id,
    results: ranked.length ? prioritized : { ranked_opportunities: [forced] },
    venture_handoff: forced,
    handoff,
    ...forceMetadata(record, req),
  };
}

function ensureBrandPayload(payload: Record<string, unknown>, record: WorkflowRunRecord): Record<string, unknown> {
  return {
    ...payload,
    venture_id: stringValue(payload.venture_id, stringValue(record.venture_id, record.id)),
    value_proposition: stringValue(payload.value_proposition, record.title),
    target_audience: {
      primary_segment: 'general',
      ...asRecord(payload.target_audience),
    },
    positioning_statement: stringValue(payload.positioning_statement, record.title),
    brand_attributes: nonEmpty(asArray(payload.brand_attributes).map(String), ['credible', 'focused']),
    tone_of_voice: nonEmpty(asArray(payload.tone_of_voice).map(String), ['confident', 'pragmatic']),
    visual_mood: nonEmpty(asArray(payload.visual_mood).map(String), ['modern', 'credible']),
    competitive_differentiation: stringValue(payload.competitive_differentiation, 'Forced handoff'),
    brand_story: stringValue(payload.brand_story, record.title),
    mission_statement: stringValue(payload.mission_statement, record.title),
    competitive_set: asArray(payload.competitive_set),
    messaging_pillars: asArray(payload.messaging_pillars),
    created_at: stringValue(payload.created_at, new Date().toISOString()),
  };
}

function ensureBuilderPayload(payload: Record<string, unknown>, record: WorkflowRunRecord): Record<string, unknown> {
  const mvpScope = asRecord(payload.mvp_scope);
  const features = asArray(mvpScope.core_features);
  return {
    ...payload,
    venture_id: stringValue(payload.venture_id, stringValue(record.venture_id, record.id)),
    mvp_scope: {
      ...mvpScope,
      core_features: nonEmpty(features, [
        {
          feature_name: 'Forced MVP scope',
          description: 'Operator-forced downstream handoff.',
          user_stories: ['As an operator, I need the next module to continue.'],
          acceptance_criteria: ['The downstream module starts from the forced handoff.'],
          priority: 'high',
          estimated_effort: 'S',
        },
      ]),
      out_of_scope: asArray(mvpScope.out_of_scope),
      integrations: asArray(mvpScope.integrations),
    },
    tech_stack: {
      frontend: { framework: 'React', language: 'TypeScript' },
      backend: { runtime: 'Node.js', language: 'TypeScript' },
      database: { primary: 'PostgreSQL' },
      infrastructure: { hosting: 'AWS' },
      ...asRecord(payload.tech_stack),
    },
    non_functional_requirements: asRecord(payload.non_functional_requirements),
    user_stories: nonEmpty(asArray(payload.user_stories), [
      { story_title: 'Forced continuation', story_text: 'Continue the venture pipeline.' },
    ]),
    success_metrics: nonEmpty(asArray(payload.success_metrics), [
      { metric_name: 'handoff_continued', target_value: 1, unit: 'count' },
    ]),
    ux_requirements: asRecord(payload.ux_requirements),
    security_requirements: asRecord(payload.security_requirements),
    created_at: stringValue(payload.created_at, new Date().toISOString()),
  };
}

function buildAddVentureEventPayload(
  record: WorkflowRunRecord,
  req: ForceHandoffRequest,
  correlationId: string,
): Record<string, unknown> {
  const root = resultRoot(record);
  const dossier = maybeRecord(root.dossier) ?? primaryResult(record);
  const vol2 = maybeRecord(root.vol2) ?? maybeRecord(dossier.vol2) ?? dossier;
  const vol3 = maybeRecord(root.vol3) ?? maybeRecord(dossier.vol3) ?? dossier;
  const vol5 = maybeRecord(root.vol5) ?? maybeRecord(dossier.vol5) ?? dossier;
  const vol6 = maybeRecord(root.vol6) ?? maybeRecord(dossier.vol6) ?? dossier;
  const vol8 = maybeRecord(root.vol8) ?? maybeRecord(dossier.vol8) ?? dossier;
  const ventureId = stringValue(record.venture_id, record.id);
  const brandPayload = ensureBrandPayload(buildVentureToBrandHandoff({ ventureId, vol2, vol3, vol6 }), record);
  const builderPayload = ensureBuilderPayload(buildVentureToBuilderHandoff({ ventureId, vol2, vol3, vol5, vol8 }), record);
  const brandHandoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'add-venture',
    toModule: 'brand-aid',
    ventureId,
    payload: brandPayload,
    correlationId,
    workflowExecutionId: record.temporal_workflow_id,
    triggeredBy: 'manual_trigger',
    targetSchema: 'venture-to-brand.schema.json',
    validator: validateVentureToBrandHandoff,
  });
  const builderHandoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'add-venture',
    toModule: 'builder',
    ventureId,
    payload: builderPayload,
    correlationId,
    workflowExecutionId: record.temporal_workflow_id,
    triggeredBy: 'manual_trigger',
    targetSchema: 'venture-to-builder.schema.json',
    validator: validateVentureToBuilderHandoff,
  });
  return {
    account_id: record.account_id,
    pipeline_id: root.pipeline_id,
    output: dossier,
    handoffs: {
      'brand-aid': brandHandoff,
      builder: builderHandoff,
    },
    project_nickname: root.project_nickname,
    ...forceMetadata(record, req),
  };
}

function ensureBuilderToGtmPayload(payload: Record<string, unknown>, record: WorkflowRunRecord): Record<string, unknown> {
  return {
    ...payload,
    product_name: stringValue(payload.product_name, record.title),
    product_description: stringValue(payload.product_description, record.title),
    core_value_delivered: stringValue(payload.core_value_delivered, 'Forced continuation'),
    mvp_features_shipped: nonEmpty(asArray(payload.mvp_features_shipped).map(String), ['Forced MVP scope']),
    key_differentiators: nonEmpty(asArray(payload.key_differentiators), [
      { differentiator: 'Operator override', competitive_advantage: 'Manual pipeline continuation' },
    ]),
  };
}

function ensureGtmToStartupPayload(payload: Record<string, unknown>, record: WorkflowRunRecord): Record<string, unknown> {
  return {
    ...payload,
    gtm_strategy_summary: stringValue(payload.gtm_strategy_summary, record.title),
    target_market: stringValue(payload.target_market, 'general'),
    launch_channels: nonEmpty(asArray(payload.launch_channels), [
      { channel: 'operator-forced', rationale: 'Manual pipeline continuation' },
    ]),
    analytics_configuration: asRecord(payload.analytics_configuration),
    critical_metrics: nonEmpty(asArray(payload.critical_metrics), [
      { metric_name: 'forced_handoff_started', definition: 'Force handoff was emitted.' },
    ]),
    hypothesis_being_validated: asRecord(payload.hypothesis_being_validated),
  };
}

function buildSingleHandoffEventPayload(
  record: WorkflowRunRecord,
  req: ForceHandoffRequest,
  correlationId: string,
): Record<string, unknown> {
  const ventureId = stringValue(record.venture_id, record.id);
  const result = primaryResult(record);
  const sourceHandoff = asRecord(result.source_handoff);
  if (record.module === 'builder') {
    const payload = ensureBuilderToGtmPayload(buildBuilderToGtmHandoff({ ventureId, result, sourceHandoff }), record);
    return {
      account_id: record.account_id,
      observability_run_id: record.id,
      temporal_workflow_id: record.temporal_workflow_id,
      result,
      source_handoff: sourceHandoff,
      handoff: createValidatedModuleHandoffEnvelope({
        fromModule: 'builder',
        toModule: 'gtm',
        ventureId,
        payload,
        correlationId,
        workflowExecutionId: record.temporal_workflow_id,
        triggeredBy: 'manual_trigger',
        targetSchema: 'builder-to-gtm.schema.json',
        validator: validateBuilderToGtmHandoff,
      }),
      ...forceMetadata(record, req),
    };
  }
  if (record.module === 'gtm') {
    const payload = ensureGtmToStartupPayload(buildGtmToStartupOpsHandoff({ ventureId, result, sourceHandoff }), record);
    return {
      account_id: record.account_id,
      observability_run_id: record.id,
      temporal_workflow_id: record.temporal_workflow_id,
      result,
      source_handoff: sourceHandoff,
      handoff: createValidatedModuleHandoffEnvelope({
        fromModule: 'gtm',
        toModule: 'startup-ops',
        ventureId,
        payload,
        correlationId,
        workflowExecutionId: record.temporal_workflow_id,
        triggeredBy: 'manual_trigger',
        targetSchema: 'gtm-to-startup-ops.schema.json',
        validator: validateGtmToStartupOpsHandoff,
      }),
      ...forceMetadata(record, req),
    };
  }
  if (record.module === 'startup-ops') {
    const payload = buildStartupOpsToPortfolioHandoff({ ventureId, result, sourceHandoff });
    return {
      account_id: record.account_id,
      observability_run_id: record.id,
      temporal_workflow_id: record.temporal_workflow_id,
      result,
      source_handoff: sourceHandoff,
      handoff: createValidatedModuleHandoffEnvelope({
        fromModule: 'startup-ops',
        toModule: 'portfolio',
        ventureId,
        payload,
        correlationId,
        workflowExecutionId: record.temporal_workflow_id,
        triggeredBy: 'manual_trigger',
        targetSchema: 'startup-ops-to-portfolio.schema.json',
        validator: validateStartupOpsToPortfolioHandoff,
      }),
      ...forceMetadata(record, req),
    };
  }
  throw new ForceHandoffError(409, `Module ${record.module} does not use a single handoff payload.`);
}

function buildPortfolioEventPayload(
  record: WorkflowRunRecord,
  req: ForceHandoffRequest,
  correlationId: string,
): Record<string, unknown> {
  const ventureId = stringValue(record.venture_id, record.id);
  const result = primaryResult(record);
  const sourceHandoff = asRecord(result.source_handoff);
  const bruceCorePayload = buildPortfolioToBruceCoreHandoff({ ventureId, result, sourceHandoff });
  const bruceCoreHandoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'portfolio',
    toModule: 'bruce-core',
    ventureId,
    payload: bruceCorePayload,
    correlationId,
    workflowExecutionId: record.temporal_workflow_id,
    triggeredBy: 'manual_trigger',
    targetSchema: 'portfolio-to-bruce-core.schema.json',
    validator: validatePortfolioToBruceCoreHandoff,
  });
  const bruceMemoryHandoff = createModuleHandoffEnvelope({
    fromModule: 'portfolio',
    toModule: 'bruce-memory',
    ventureId,
    payload: buildBruceMemoryInputFromPortfolioDecisionHandoff(bruceCorePayload),
    correlationId,
    workflowExecutionId: record.temporal_workflow_id,
    triggeredBy: 'manual_trigger',
  });
  return {
    account_id: record.account_id,
    observability_run_id: record.id,
    temporal_workflow_id: record.temporal_workflow_id,
    result,
    source_handoff: sourceHandoff,
    handoffs: {
      'bruce-core': bruceCoreHandoff,
      'bruce-memory': bruceMemoryHandoff,
    },
    ...forceMetadata(record, req),
  };
}

function buildEventPayload(
  record: WorkflowRunRecord,
  workflow: ActiveWorkflow | null,
  req: ForceHandoffRequest,
  correlationId: string,
): Record<string, unknown> {
  if (record.module === 'opportunity') return buildOpportunityEventPayload(record, workflow, req, correlationId);
  if (record.module === 'add-venture') return buildAddVentureEventPayload(record, req, correlationId);
  if (record.module === 'builder' || record.module === 'gtm' || record.module === 'startup-ops') {
    return buildSingleHandoffEventPayload(record, req, correlationId);
  }
  if (record.module === 'portfolio') return buildPortfolioEventPayload(record, req, correlationId);
  throw new ForceHandoffError(409, `Module ${record.module} has no durable downstream handoff.`);
}

async function auditForceHandoff(
  record: WorkflowRunRecord,
  workflow: ActiveWorkflow | null,
  req: ForceHandoffRequest,
  eventType: string,
  targetModules: string[],
): Promise<void> {
  const step = selectedStep(workflow, req.source_step_id) ?? workflow?.steps[0];
  if (!step) return;
  await obsStepEvent({
    runId: record.id,
    accountId: record.account_id,
    stepKey: step.key ?? step.id,
    level: 'warn',
    message: `Manual force handoff emitted to ${targetModules.join(', ')}`,
    fields: {
      event_type: { kind: 'text_short', value: eventType },
      target_modules: { kind: 'tags', value: targetModules },
      force_reason: { kind: 'text_long', value: req.reason },
      force_override: { kind: 'boolean', value: true },
    },
  });
}

export async function forceHandoffFromWorkflow(
  accountId: string,
  runId: string,
  req: ForceHandoffRequest,
  moduleHint?: string,
): Promise<ForceHandoffResponse> {
  if (req.force !== true) throw new ForceHandoffError(400, 'force must be true.');
  if (!req.reason?.trim()) throw new ForceHandoffError(400, 'reason is required.');

  const { record, workflow } = await loadRun(accountId, runId);
  if (moduleHint && record.module !== moduleHint) {
    throw new ForceHandoffError(404, `Workflow run does not belong to module ${moduleHint}.`);
  }
  const route = resolveForceHandoffRoute(record.module, req.target_module);
  const correlationId = record.correlation_id ?? crypto.randomUUID();
  const payload = buildEventPayload(record, workflow, req, correlationId);
  const targetModules = route.targetModules;
  await emitEvent(route.eventType, record.module, payload, {
    ventureId: stringValue(record.venture_id, record.id),
    correlationId,
    observabilityRunId: record.id,
    temporalWorkflowId: record.temporal_workflow_id,
    subscribers: targetModules,
    warnWhenNoSubscribers: false,
  });
  await auditForceHandoff(record, workflow, req, route.eventType, targetModules);
  return {
    status: 'emitted',
    event_type: route.eventType,
    source_module: record.module,
    target_modules: targetModules,
    forced_from_run_id: record.id,
    forced_from_temporal_workflow_id: record.temporal_workflow_id,
  };
}
