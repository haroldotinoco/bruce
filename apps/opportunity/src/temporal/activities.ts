import { ApplicationFailure } from '@temporalio/common';
import { and, eq, sql } from 'drizzle-orm';
import { getAgentRunner } from '@bruce/agent-runtime';
import { schema, withAccountContext } from '@bruce/db';
import { emitEvent, getEventBus } from '@bruce/events';
import {
  handoffValidationFailedTotal,
  isHandoffStrictValidationEnabled,
  renderOpportunityHandoffMd,
  renderOpportunityScanSummaryMd,
  validateOpportunityToVentureHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { writeProjectKnowledgeDoc } from '@bruce/project-store';
import { getRedisClient } from '@bruce/redis';
export {
  obsStartRun,
  obsUpdateStep,
  obsStepEvent,
  obsCompleteRun,
  obsFailRun,
  obsSetRunProgress,
} from '@bruce/observability';
import { searchSerper } from '../lib/serper.js';
import {
  canonicalMarketSizeEstimateObject,
  normalizeOpportunitySources,
  scoringPayloadFromSingleAnalyst,
  scoredOpportunitiesFromOutput,
} from '../lib/opportunity-screening-helpers.js';

const { scans, opportunities } = schema;

/** Deterministic agent input errors should not retry the activity. */
function throwAgentRunFailure(agentLabel: string, errorMessage: string | undefined): never {
  const message = errorMessage ?? 'Unknown error';
  const full = `${agentLabel} failed: ${message}`;
  if (message.startsWith('Input validation failed')) {
    throw ApplicationFailure.nonRetryable(full, 'AgentInputValidationFailed');
  }
  throw new Error(full);
}

function marketScannerPayload(opportunity: unknown): Record<string, unknown> {
  const o =
    opportunity && typeof opportunity === 'object'
      ? (opportunity as Record<string, unknown>)
      : {};
  const verticals = Array.isArray(o.industry_verticals)
    ? (o.industry_verticals as string[])
    : ['general'];
  return {
    scan_id: crypto.randomUUID(),
    discovery_focus: {
      industry_verticals: verticals,
      geographic_scope: Array.isArray(o.geographic_scope) ? o.geographic_scope : [],
      minimum_tam: typeof o.minimum_tam === 'number' ? o.minimum_tam : undefined,
      focus_areas: Array.isArray(o.focus_areas) ? o.focus_areas : [],
    },
    search_strategy: {
      primary_keywords: Array.isArray(o.primary_keywords) ? o.primary_keywords : ['venture'],
      secondary_keywords: [],
      exclude_keywords: [],
    },
    quality_filters: {
      minimum_discovery_confidence: 0.6,
      minimum_sources_required: 2,
      auto_exclude_criteria: [],
    },
  };
}

/** Fills required pipeline fields when the LLM omits them (strict schemas used to fail here). */
function normalizeMarketScannerOutput(output: unknown, scanId: string): Record<string, unknown> {
  const o = output && typeof output === 'object' ? (output as Record<string, unknown>) : {};
  let opportunities = Array.isArray(o.opportunities_found)
    ? [...(o.opportunities_found as unknown[])]
    : [];
  if (opportunities.length === 0) {
    opportunities = [
      {
        opportunity_title: 'Discovery placeholder',
        problem_statement: 'Model returned no opportunities; tune prompt or max_tokens.',
        target_segment: 'general',
        pain_points: ['unspecified'],
        discovery_confidence: 0.25,
        sources: [
          {
            url: 'https://example.com',
            source_title: 'placeholder',
            source_type: 'blog',
            relevance_to_opportunity: 'medium',
          },
        ],
      },
    ];
  }
  return {
    ...o,
    scan_id: typeof o.scan_id === 'string' ? o.scan_id : scanId,
    scan_timestamp: typeof o.scan_timestamp === 'string' ? o.scan_timestamp : new Date().toISOString(),
    opportunities_found: opportunities,
  };
}

function normalizeAnalystOutput(output: unknown): Record<string, unknown> {
  const o = output && typeof output === 'object' ? (output as Record<string, unknown>) : {};
  const merged: Record<string, unknown> = {
    opportunity_id: typeof o.opportunity_id === 'string' ? o.opportunity_id : crypto.randomUUID(),
    title: typeof o.title === 'string' ? o.title : 'Analyzed opportunity',
    problem_statement: typeof o.problem_statement === 'string' ? o.problem_statement : 'TBD',
    target_segment: typeof o.target_segment === 'string' ? o.target_segment : 'general',
    market_size_estimate: { tam: 0, sam: 0, som: 0, confidence: 0.5 },
    competition_landscape:
      o.competition_landscape && typeof o.competition_landscape === 'object'
        ? o.competition_landscape
        : { direct_competitors: [], competitive_intensity: 'medium' },
    status: typeof o.status === 'string' ? o.status : 'analyzed',
    ...o,
  };
  merged.market_size_estimate = canonicalMarketSizeEstimateObject(merged);
  return merged;
}

function normalizeScoringOutput(output: unknown): Record<string, unknown> {
  const o = output && typeof output === 'object' ? (output as Record<string, unknown>) : {};
  return {
    opportunity_id: typeof o.opportunity_id === 'string' ? o.opportunity_id : crypto.randomUUID(),
    scoring_timestamp: typeof o.scoring_timestamp === 'string' ? o.scoring_timestamp : new Date().toISOString(),
    total_score: typeof o.total_score === 'number' ? o.total_score : 0,
    recommendation:
      o.recommendation === 'advance' || o.recommendation === 'reconsider' || o.recommendation === 'reject'
        ? o.recommendation
        : 'reconsider',
    dimensions:
      o.dimensions && typeof o.dimensions === 'object' ? o.dimensions : {},
    ...o,
  };
}

function normalizePrioritizationOutput(output: unknown): Record<string, unknown> {
  const o = output && typeof output === 'object' ? (output as Record<string, unknown>) : {};
  let ranked = Array.isArray(o.ranked_opportunities) ? [...(o.ranked_opportunities as unknown[])] : [];
  if (ranked.length === 0) {
    ranked = [
      {
        rank: 1,
        opportunity_id: crypto.randomUUID(),
        title: 'Ranked placeholder',
        total_score: 70,
        recommendation: 'review',
        status: 'HOLD',
      },
    ];
  }
  const rankedRecords = ranked as Array<Record<string, unknown>>;
  const computedSummary = buildPrioritizationSummaryFromRanked(rankedRecords);
  const fromModelRaw =
    o.summary && typeof o.summary === 'object' && !Array.isArray(o.summary)
      ? (o.summary as Record<string, unknown>)
      : {};
  const fromModel: Record<string, unknown> = { ...fromModelRaw };
  if (Array.isArray(fromModel.notes)) {
    fromModel.notes = fromModel.notes
      .map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
      .join('\n');
  }
  if (Array.isArray(fromModel.overview)) {
    fromModel.overview = fromModel.overview
      .map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
      .join(' ');
  }
  const summary: Record<string, unknown> = {
    ...computedSummary,
    ...fromModel,
  };
  const notesVal = summary.notes;
  if (typeof notesVal !== 'string' || notesVal.trim() === '') {
    summary.notes = computedSummary.notes;
  }
  const overviewVal = summary.overview;
  if (typeof overviewVal !== 'string' || overviewVal.trim() === '') {
    summary.overview = computedSummary.overview;
  }

  return {
    ...o,
    prioritization_id:
      typeof o.prioritization_id === 'string' ? o.prioritization_id : crypto.randomUUID(),
    prioritization_timestamp:
      typeof o.prioritization_timestamp === 'string'
        ? o.prioritization_timestamp
        : new Date().toISOString(),
    ranked_opportunities: ranked,
    summary,
  };
}

function firstDiscoveredOpportunity(marketScannerOutput: unknown): Record<string, unknown> {
  const o =
    marketScannerOutput && typeof marketScannerOutput === 'object'
      ? (marketScannerOutput as Record<string, unknown>)
      : {};
  const found = Array.isArray(o.opportunities_found) ? o.opportunities_found : [];
  const first =
    found[0] && typeof found[0] === 'object' ? (found[0] as Record<string, unknown>) : {};
  return {
    opportunity_title:
      typeof first.opportunity_title === 'string' ? first.opportunity_title : 'Discovered opportunity',
    problem_statement:
      typeof first.problem_statement === 'string' ? first.problem_statement : 'Problem TBD',
    target_segment:
      typeof first.target_segment === 'string' ? first.target_segment : 'General market',
    pain_points: Array.isArray(first.pain_points) ? first.pain_points : [],
    sources: normalizeOpportunitySources(first.sources),
    discovery_confidence:
      typeof first.discovery_confidence === 'number' ? first.discovery_confidence : 0.6,
  };
}

function opportunityAnalystPayload(
  marketScannerOutput: unknown,
  qualityFeedback?: {
    attempt: number;
    previous_score?: number;
    feedback: string;
    scoring_output?: unknown;
  }
): Record<string, unknown> {
  const raw = firstDiscoveredOpportunity(marketScannerOutput);
  const base: Record<string, unknown> = {
    raw_opportunity: raw,
    analysis_focus: {
      depth_level: 'standard',
      priority_areas: [],
    },
  };
  if (qualityFeedback) {
    base.quality_retry = {
      attempt: qualityFeedback.attempt,
      previous_score: qualityFeedback.previous_score,
      feedback_to_address: qualityFeedback.feedback,
      prior_scoring_summary:
        qualityFeedback.scoring_output !== undefined
          ? JSON.stringify(qualityFeedback.scoring_output).slice(0, 8000)
          : undefined,
    };
  }
  return base;
}

/** Human-readable summary when the model returns an empty summary object. */
function buildPrioritizationSummaryFromRanked(
  ranked: Array<Record<string, unknown>>
): Record<string, unknown> {
  const advance = ranked.filter((r) => String(r.status).toUpperCase() === 'ADVANCE').length;
  const hold = ranked.filter((r) => String(r.status).toUpperCase() === 'HOLD').length;
  const reject = ranked.filter((r) => String(r.status).toUpperCase() === 'REJECT').length;
  const perOpportunity = ranked.map((r) => {
    const title = typeof r.title === 'string' ? r.title : 'Untitled';
    const score = typeof r.total_score === 'number' ? r.total_score : undefined;
    const status = typeof r.status === 'string' ? r.status : undefined;
    const reasoning =
      typeof r.reasoning === 'string'
        ? r.reasoning
        : typeof r.advancement_reason === 'string'
          ? r.advancement_reason
          : undefined;
    return { title, total_score: score, status, reasoning };
  });
  const overview = perOpportunity
    .map((p) => {
      const base = `${p.title} (${p.total_score ?? '—'} pts, ${p.status ?? 'unknown'})`;
      return p.reasoning ? `${base}: ${p.reasoning}` : base;
    })
    .join(' ');
  const notes = perOpportunity
    .map((p, i) => {
      const head = `${i + 1}. ${p.title} — score ${p.total_score ?? '—'}, status ${p.status ?? 'UNKNOWN'}`;
      return p.reasoning ? `${head}. ${p.reasoning}` : head;
    })
    .join('\n');
  return {
    total_opportunities_processed: ranked.length,
    total_advancing: advance,
    total_holding: hold,
    total_rejecting: reject,
    overview,
    per_opportunity: perOpportunity,
    notes,
  };
}

function prioritizationPayload(
  scoredOutput: unknown,
  minimumAdvancementScore: number
): Record<string, unknown> {
  let rows: Array<Record<string, unknown>>;
  if (scoredOutput && typeof scoredOutput === 'object') {
    const o = scoredOutput as Record<string, unknown>;
    if (Array.isArray(o.scored_opportunities)) {
      rows = o.scored_opportunities as Array<Record<string, unknown>>;
    } else {
      rows = scoredOpportunitiesFromOutput(scoredOutput);
    }
  } else {
    rows = scoredOpportunitiesFromOutput(scoredOutput);
  }
  return {
    scored_opportunities: rows,
    prioritization_context: {
      portfolio_focus_areas: [],
      max_ventures_per_cycle: 3,
      diversity_constraint: true,
      minimum_advancement_score: minimumAdvancementScore,
    },
  };
}

export async function runMarketScannerAgent(params: {
  accountId: string;
  ventureId: string;
  opportunity: unknown;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  const { accountId, ventureId, opportunity, correlationId } = params;
  logger.info({ accountId, ventureId }, 'Running market-scanner agent');

  const base = marketScannerPayload(opportunity);
  let supplemental: unknown = null;
  if (process.env.SERPER_API_KEY) {
    const o =
      opportunity && typeof opportunity === 'object'
        ? (opportunity as Record<string, unknown>)
        : {};
    const q = Array.isArray(o.primary_keywords)
      ? (o.primary_keywords as string[]).join(' ')
      : 'venture market opportunity';
    supplemental = await searchSerper(q);
  }

  const payload = { ...base, supplemental_live_search: supplemental };

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'opportunity',
    'market-scanner',
    payload,
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    }
  );

  if (!result.success) {
    throwAgentRunFailure('Market scanner', result.error);
  }

  return normalizeMarketScannerOutput(result.output, String(base.scan_id));
}

export async function runOpportunityAnalystAgent(params: {
  accountId: string;
  ventureId: string;
  marketScannerOutput: unknown;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
  qualityFeedback?: {
    attempt: number;
    previous_score?: number;
    feedback: string;
    scoring_output?: unknown;
  };
}): Promise<unknown> {
  const { accountId, ventureId, marketScannerOutput, correlationId, qualityFeedback } = params;
  logger.info({ accountId, ventureId, qualityRetry: Boolean(qualityFeedback) }, 'Running opportunity-analyst agent');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'opportunity',
    'opportunity-analyst',
    opportunityAnalystPayload(marketScannerOutput, qualityFeedback),
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    }
  );

  if (!result.success) {
    throwAgentRunFailure('Opportunity analyst', result.error);
  }

  return normalizeAnalystOutput(result.output);
}

export async function runScoringAgent(params: {
  accountId: string;
  ventureId: string;
  analystOutput: unknown;
  scanThemes?: string[];
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  const { accountId, ventureId, analystOutput, correlationId, scanThemes } = params;
  logger.info({ accountId, ventureId }, 'Running scoring agent');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'opportunity',
    'scoring-agent',
    scoringPayloadFromSingleAnalyst(analystOutput, { scanThemes }),
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    }
  );

  if (!result.success) {
    throwAgentRunFailure('Scoring agent', result.error);
  }

  return normalizeScoringOutput(result.output);
}

export async function runPrioritizationAgent(params: {
  accountId: string;
  ventureId: string;
  scoredOutput: unknown;
  correlationId: string;
  minimumAdvancementScore: number;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  const { accountId, ventureId, scoredOutput, correlationId, minimumAdvancementScore } = params;
  logger.info({ accountId, ventureId }, 'Running prioritization agent');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'opportunity',
    'prioritization-agent',
    prioritizationPayload(scoredOutput, minimumAdvancementScore),
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    }
  );

  if (!result.success) {
    throwAgentRunFailure('Prioritization agent', result.error);
  }

  return normalizePrioritizationOutput(result.output);
}

function parseVentureUuid(ventureId: string): string | undefined {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRe.test(ventureId) ? ventureId : undefined;
}

export async function persistOpportunityScan(params: {
  accountId: string;
  ventureId: string;
  scanResults: unknown;
  temporalWorkflowId: string;
  themes: string[];
}): Promise<string> {
  const { accountId, ventureId, scanResults, temporalWorkflowId, themes } = params;
  logger.info({ accountId, ventureId }, 'Persisting opportunity scan to database');

  return await withAccountContext(accountId, async (tx) => {
    const ventureUuid = parseVentureUuid(ventureId);
    const themesForDb = themes.length ? themes : ['default'];

    const [pending] = await tx
      .select({ id: scans.id })
      .from(scans)
      .where(
        and(eq(scans.account_id, accountId), eq(scans.temporal_workflow_id, temporalWorkflowId))
      )
      .limit(1);

    let scanId: string;
    if (pending) {
      await tx
        .update(scans)
        .set({
          venture_id: ventureUuid ?? null,
          themes: themesForDb,
          status: 'completed',
          result_json: scanResults,
          error_message: null,
          updated_at: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(scans.id, pending.id));
      scanId = pending.id;
    } else {
      const [row] = await tx
        .insert(scans)
        .values({
          account_id: accountId,
          venture_id: ventureUuid ?? null,
          temporal_workflow_id: temporalWorkflowId,
          themes: themesForDb,
          status: 'completed',
          result_json: scanResults,
          updated_at: sql`CURRENT_TIMESTAMP`,
        })
        .returning({ id: scans.id });

      if (!row?.id) {
        throw new Error('Failed to insert opportunity scan');
      }
      scanId = row.id;
    }

    const prioritized = scanResults as Record<string, unknown>;
    const ranked = Array.isArray(prioritized.ranked_opportunities)
      ? (prioritized.ranked_opportunities as Array<Record<string, unknown>>)
      : Array.isArray(prioritized.opportunities)
        ? (prioritized.opportunities as Array<Record<string, unknown>>)
        : scoredOpportunitiesFromOutput(scanResults);

    for (const item of ranked.slice(0, 50)) {
      const title = typeof item.title === 'string' ? item.title : 'Opportunity';
      const desc =
        typeof item.description === 'string'
          ? item.description
          : JSON.stringify(item).slice(0, 2000);
      await tx.insert(opportunities).values({
        account_id: accountId,
        venture_id: ventureUuid ?? null,
        title,
        description: desc,
        status: 'scored',
        research_data: item,
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      });
    }

    return scanId;
  });
}

export async function emitOpportunityScanCompleted(params: {
  accountId: string;
  ventureId: string;
  scanId: string;
  results: unknown;
}): Promise<void> {
  const { accountId, ventureId, scanId, results } = params;
  logger.info({ accountId, ventureId, scanId }, 'Emitting scan completed event');

  const eventBus = getEventBus();
  const vId = parseVentureUuid(ventureId);
  await eventBus.emit({
    type: 'opportunity.scan.completed',
    accountId,
    ...(vId ? { ventureId: vId } : {}),
    sourceModule: 'opportunity',
    payload: {
      scan_id: scanId,
      results,
    },
  });
}

/** BullMQ fan-out to add-venture / bruce-core (Phase 6). */
export async function emitOpportunityAdvancedInterModule(params: {
  accountId: string;
  ventureId: string;
  scanId: string;
  results: unknown;
  venture_handoff: Record<string, unknown>;
  themes?: string[];
  temporalWorkflowId?: string;
  correlationId?: string;
  projectNickname?: string;
}): Promise<void> {
  const {
    accountId,
    ventureId,
    scanId,
    results,
    venture_handoff,
    themes = [],
    temporalWorkflowId,
    correlationId,
    projectNickname,
  } = params;

  const handoffRecord = venture_handoff as Record<string, unknown>;
  const validation = validateOpportunityToVentureHandoff(handoffRecord);
  if (!validation.ok) {
    handoffValidationFailedTotal.labels('opportunity_emit').inc();
    logger.warn(
      { errors: validation.errors, scanId },
      '[opportunity] venture_handoff failed schema validation',
    );
    if (isHandoffStrictValidationEnabled()) {
      throw new Error(`venture_handoff invalid: ${validation.errors?.join('; ')}`);
    }
  }

  if (projectNickname) {
    try {
      const pr = results && typeof results === 'object' ? (results as Record<string, unknown>) : {};
      const summary =
        pr.summary && typeof pr.summary === 'object' ? (pr.summary as Record<string, unknown>) : {};
      const overview = typeof summary.overview === 'string' ? summary.overview : undefined;
      const ranked = Array.isArray(pr.ranked_opportunities)
        ? (pr.ranked_opportunities as Array<Record<string, unknown>>)
        : [];
      const rankedPreview = ranked.slice(0, 10).map((r) => ({
        title: typeof r.title === 'string' ? r.title : undefined,
        score: typeof r.total_score === 'number' ? r.total_score : undefined,
        recommendation: typeof r.recommendation === 'string' ? r.recommendation : undefined,
      }));

      await writeProjectKnowledgeDoc(
        projectNickname,
        'OPPORTUNITY_SCAN_SUMMARY.md',
        renderOpportunityScanSummaryMd({
          themes,
          scanId,
          workflowId: temporalWorkflowId,
          summaryOverview: overview,
          rankedPreview,
        }),
      );
      await writeProjectKnowledgeDoc(
        projectNickname,
        'OPPORTUNITY_HANDOFF.md',
        renderOpportunityHandoffMd(handoffRecord),
      );
    } catch (e) {
      logger.warn(
        { error: (e as Error).message, projectNickname },
        '[opportunity] Failed writing knowledge-base markdown (continuing)',
      );
    }
  }

  await emitEvent(
    'opportunity.advanced',
    'opportunity',
    {
      account_id: accountId,
      scan_id: scanId,
      results,
      venture_handoff: handoffRecord,
      project_nickname: projectNickname,
    },
    {
      ventureId: parseVentureUuid(ventureId) ?? ventureId,
      correlationId,
      warnWhenNoSubscribers: false,
    }
  );
}

export async function emitOpportunityLifecycleEvent(params: {
  type: string;
  accountId: string;
  ventureId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const eventBus = getEventBus();
  const vId = parseVentureUuid(params.ventureId);
  await eventBus.emit({
    type: params.type,
    accountId: params.accountId,
    ...(vId ? { ventureId: vId } : {}),
    sourceModule: 'opportunity',
    payload: params.payload,
  });
}

export async function updateExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const { accountId, ventureId, step, state } = params;
  logger.info({ accountId, ventureId, step }, 'Updating execution state');

  const redis = getRedisClient();
  await redis.set(accountId, 'opportunity', 'scan', ventureId, `state:${step}`, state, 3600);
}
