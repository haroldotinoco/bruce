import { and, eq, sql } from 'drizzle-orm';
import { getAgentRunner } from '@bruce/agent-runtime';
import { schema, withAccountContext } from '@bruce/db';
import { emitEvent, getEventBus } from '@bruce/events';
import { renderStructuringInsightsMd, renderVentureDossierSummaryMd } from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { writeDeliverable, writeProjectKnowledgeDoc } from '@bruce/project-store';
import { getRedisClient } from '@bruce/redis';

const { pipelineRuns, ventureDossiers } = schema;

type RecordLike = Record<string, unknown>;

function asRecord(x: unknown): RecordLike {
  return x && typeof x === 'object' ? (x as RecordLike) : {};
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

// =============================================================
// Agent activities
// =============================================================

export async function runBriefingInterpreter(params: {
  accountId: string;
  ventureId: string;
  opportunityId: string;
  opportunity: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  const { accountId, ventureId, opportunityId, opportunity, correlationId } = params;
  logger.info({ accountId, ventureId }, 'Running briefing-interpreter');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'add-venture',
    'briefing-interpreter',
    {
      opportunity: {
        opportunity_id: opportunityId,
        title: String(opportunity.title ?? 'Untitled'),
        problem_statement: String(
          opportunity.problem_statement ?? opportunity.description ?? '',
        ),
        target_segment: String(
          opportunity.target_segment ??
            opportunity.market_segment ??
            opportunity.segment ??
            '',
        ),
        market_size_estimate: opportunity.market_size_estimate as
          | Record<string, unknown>
          | undefined,
        competition_landscape: opportunity.competition_landscape as
          | Record<string, unknown>
          | undefined,
        problem_analysis: opportunity.problem_analysis as
          | Record<string, unknown>
          | undefined,
        analysis_quality: opportunity.analysis_quality as
          | Record<string, unknown>
          | undefined,
      },
      portfolio_context: {},
    },
    {
      accountId,
      ventureId,
      module: 'add-venture',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    },
  );

  if (!result.success) {
    throw new Error(`Briefing interpreter failed: ${result.error}`);
  }

  return result.output;
}

export async function runOpportunityAnalystVol1(params: {
  accountId: string;
  ventureId: string;
  opportunityId: string;
  briefingResult: unknown;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  const { accountId, ventureId, opportunityId, briefingResult, correlationId } = params;
  logger.info({ accountId, ventureId }, 'Running opportunity-analyst-vol1');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'add-venture',
    'opportunity-analyst-vol1',
    {
      briefing: buildBriefing(ventureId, opportunityId, briefingResult),
      analysis_parameters: { depth_level: 'standard' },
    },
    {
      accountId,
      ventureId,
      module: 'add-venture',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    },
  );

  if (!result.success) {
    throw new Error(`Opportunity analyst vol1 failed: ${result.error}`);
  }

  return result.output;
}

interface VolActivityParams {
  accountId: string;
  ventureId: string;
  opportunityId: string;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}

async function runVolAgent(
  agentId: string,
  input: unknown,
  params: VolActivityParams,
): Promise<unknown> {
  const agentRunner = getAgentRunner();
  const result = await agentRunner.run('add-venture', agentId, input, {
    accountId: params.accountId,
    ventureId: params.ventureId,
    module: 'add-venture',
    executionId: crypto.randomUUID(),
    correlationId: params.correlationId,
    observabilityRunId: params.observabilityRunId,
    observabilityStepKey: params.observabilityStepKey,
    observabilityParentStepKey: params.observabilityParentStepKey,
    projectNickname: params.projectNickname,
  });
  if (!result.success) {
    throw new Error(`${agentId} failed: ${result.error}`);
  }
  return result.output;
}

export async function runCustomerMarketArchitect(
  params: VolActivityParams & { briefing: unknown; vol1: unknown },
): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running customer-market-architect');
  return runVolAgent(
    'customer-market-architect',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      briefing: asRecord(params.briefing),
      vol_1_opportunity: asRecord(params.vol1),
    },
    params,
  );
}

export async function runValuePropositionDesigner(
  params: VolActivityParams & {
    briefing: unknown;
    vol1: unknown;
    vol2: unknown;
  },
): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running value-proposition-designer');
  return runVolAgent(
    'value-proposition-designer',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      briefing: asRecord(params.briefing),
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
    },
    params,
  );
}

export async function runBusinessModelModeler(
  params: VolActivityParams & {
    briefing: unknown;
    vol1: unknown;
    vol2: unknown;
    vol3: unknown;
  },
): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running business-model-modeler');
  return runVolAgent(
    'business-model-modeler',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      briefing: asRecord(params.briefing),
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
      vol_3_value_proposition: asRecord(params.vol3),
    },
    params,
  );
}

export async function runGtmPlanner(
  params: VolActivityParams & {
    briefing: unknown;
    vol1: unknown;
    vol2: unknown;
    vol3: unknown;
    vol4: unknown;
  },
): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running gtm-planner');
  return runVolAgent(
    'gtm-planner',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      briefing: asRecord(params.briefing),
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
      vol_3_value_proposition: asRecord(params.vol3),
      vol_4_business_model: asRecord(params.vol4),
    },
    params,
  );
}

export async function runNarrativeStrategist(
  params: VolActivityParams & {
    briefing: unknown;
    vol1: unknown;
    vol2: unknown;
    vol3: unknown;
    vol5: unknown;
  },
): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running narrative-strategist');
  return runVolAgent(
    'narrative-strategist',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      briefing: asRecord(params.briefing),
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
      vol_3_value_proposition: asRecord(params.vol3),
      vol_5_gtm: asRecord(params.vol5),
    },
    params,
  );
}

export async function runRiskValidationAnalyst(
  params: VolActivityParams & {
    vol1: unknown;
    vol2: unknown;
    vol3: unknown;
    vol4: unknown;
    vol5: unknown;
    vol6: unknown;
  },
): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running risk-validation-analyst');
  return runVolAgent(
    'risk-validation-analyst',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
      vol_3_value_proposition: asRecord(params.vol3),
      vol_4_business_model: asRecord(params.vol4),
      vol_5_gtm: asRecord(params.vol5),
      vol_6_narrative: asRecord(params.vol6),
    },
    params,
  );
}

export async function runExecutionRoadmapPlanner(
  params: VolActivityParams & {
    vol1: unknown;
    vol2: unknown;
    vol3: unknown;
    vol4: unknown;
    vol5: unknown;
    vol7: unknown;
  },
): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running execution-roadmap-planner');
  return runVolAgent(
    'execution-roadmap-planner',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
      vol_3_value_proposition: asRecord(params.vol3),
      vol_4_business_model: asRecord(params.vol4),
      vol_5_gtm: asRecord(params.vol5),
      vol_7_risk_validation: asRecord(params.vol7),
    },
    params,
  );
}

export async function runVentureCritic(params: {
  accountId: string;
  ventureId: string;
  vol1: unknown;
  vol2: unknown;
  vol3: unknown;
  vol4: unknown;
  vol5: unknown;
  vol6: unknown;
  vol7: unknown;
  vol8: unknown;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running venture-critic');
  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'add-venture',
    'venture-critic',
    {
      venture_id: params.ventureId,
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
      vol_3_value_proposition: asRecord(params.vol3),
      vol_4_business_model: asRecord(params.vol4),
      vol_5_gtm: asRecord(params.vol5),
      vol_6_narrative: asRecord(params.vol6),
      vol_7_risk_validation: asRecord(params.vol7),
      vol_8_execution_roadmap: asRecord(params.vol8),
    },
    {
      accountId: params.accountId,
      ventureId: params.ventureId,
      module: 'add-venture',
      executionId: crypto.randomUUID(),
      correlationId: params.correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    },
  );
  if (!result.success) {
    throw new Error(`venture-critic failed: ${result.error}`);
  }
  return result.output;
}

export async function runDossierComposer(params: {
  accountId: string;
  ventureId: string;
  opportunityId: string;
  ventureName: string;
  vol1: unknown;
  vol2: unknown;
  vol3: unknown;
  vol4: unknown;
  vol5: unknown;
  vol6: unknown;
  vol7: unknown;
  vol8: unknown;
  critique: unknown;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
  projectNickname?: string;
}): Promise<unknown> {
  logger.info({ accountId: params.accountId }, 'Running dossier-composer');
  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'add-venture',
    'dossier-composer',
    {
      venture_id: params.ventureId,
      opportunity_id: params.opportunityId,
      venture_name: params.ventureName,
      vol_1_opportunity: asRecord(params.vol1),
      vol_2_customer_market: asRecord(params.vol2),
      vol_3_value_proposition: asRecord(params.vol3),
      vol_4_business_model: asRecord(params.vol4),
      vol_5_gtm: asRecord(params.vol5),
      vol_6_narrative: asRecord(params.vol6),
      vol_7_risk_validation: asRecord(params.vol7),
      vol_8_execution_roadmap: asRecord(params.vol8),
      critique_result: asRecord(params.critique),
    },
    {
      accountId: params.accountId,
      ventureId: params.ventureId,
      module: 'add-venture',
      executionId: crypto.randomUUID(),
      correlationId: params.correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
      projectNickname: params.projectNickname,
    },
  );
  if (!result.success) {
    throw new Error(`dossier-composer failed: ${result.error}`);
  }
  return result.output;
}

// =============================================================
// Persistence
// =============================================================

function parseVentureUuid(ventureId: string): string | null {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRe.test(ventureId) ? ventureId : null;
}

function parseAccountUuid(accountId: string): string | null {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRe.test(accountId) ? accountId : null;
}

function extractCriticScore(dossier: unknown): number | null {
  const d = asRecord(dossier);
  const km = asRecord(d.key_metrics);
  const v = km.critique_overall_score;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const crit = asRecord(d.critique_result);
  if (typeof crit.overall_score === 'number' && Number.isFinite(crit.overall_score)) {
    return crit.overall_score;
  }
  return null;
}

function extractSummary(dossier: unknown): string | null {
  const d = asRecord(dossier);
  const es = asRecord(d.executive_summary);
  const s = es.narrative_summary;
  return typeof s === 'string' && s.length > 0 ? s : null;
}

function extractStatus(dossier: unknown): string {
  const d = asRecord(dossier);
  const s = d.status;
  if (s === 'approved' || s === 'needs_iteration' || s === 'rejected') return s as string;
  return 'composed';
}

/**
 * Persist the composed dossier:
 *  1) Write `dossier.json` to `.projects/<nickname>/add-venture/dossier-composer/`.
 *     The runner also wrote `output.json` from the composer; this is the
 *     canonical, human-readable copy other modules will read.
 *  2) Mark the `pipeline_runs` row as completed.
 *  3) Upsert the thin `venture_dossiers` read-model row used by `GET /dossiers`.
 */
export async function persistVentureDossier(params: {
  accountId: string;
  ventureId: string;
  ventureName: string;
  dossier: unknown;
  projectNickname?: string;
  pipelineRunId?: string;
}): Promise<string> {
  const { accountId, ventureId, ventureName, dossier, projectNickname, pipelineRunId } =
    params;
  logger.info({ accountId, ventureId, pipelineRunId }, 'Persisting venture dossier');

  if (projectNickname) {
    try {
      await writeDeliverable(
        projectNickname,
        'add-venture',
        'dossier-composer',
        'dossier.json',
        dossier,
      );
    } catch (e) {
      logger.warn(
        { error: (e as Error).message, projectNickname },
        'Failed to write dossier.json to project folder (continuing)',
      );
    }
  }

  const ventureUuid = parseVentureUuid(ventureId);
  const accountUuid = parseAccountUuid(accountId);
  const status = extractStatus(dossier);
  const criticScore = extractCriticScore(dossier);
  const summary = extractSummary(dossier);

  if (projectNickname) {
    try {
      const structuringSteps = [
        'briefing_interpreter',
        'vol1_opportunity',
        'vol2_customer_market',
        'vol3_value_proposition',
        'vol4_business_model',
        'vol5_gtm',
        'vol6_narrative',
        'vol7_risk_validation',
        'vol8_execution_roadmap',
        'venture_critic',
        'dossier_composer',
      ];
      await writeProjectKnowledgeDoc(
        projectNickname,
        'VENTURE_DOSSIER_SUMMARY.md',
        renderVentureDossierSummaryMd({
          ventureName,
          ventureId,
          status,
          criticScore,
          executiveSummary: summary,
          dossierPreview: dossier,
        }),
      );
      await writeProjectKnowledgeDoc(
        projectNickname,
        'STRUCTURING_INSIGHTS.md',
        renderStructuringInsightsMd({
          ventureName,
          pipelineRunId,
          stepsCompleted: structuringSteps,
        }),
      );
    } catch (e) {
      logger.warn(
        { error: (e as Error).message, projectNickname },
        'Failed to write structuring knowledge-base markdown (continuing)',
      );
    }
  }

  return await withAccountContext(accountId, async (tx) => {
    if (pipelineRunId) {
      await tx
        .update(pipelineRuns)
        .set({
          status: 'completed',
          ended_at: sql`CURRENT_TIMESTAMP`,
          updated_at: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(pipelineRuns.id, pipelineRunId));
    }

    // `account_id` on venture_dossiers is uuid — only write the read-model row
    // if we have a proper UUID account id. (Workers in dev/tests may use a
    // non-UUID accountId; in that case we still wrote the dossier.json to disk.)
    if (!accountUuid) {
      logger.warn(
        { accountId },
        'accountId is not a UUID; skipping venture_dossiers upsert',
      );
      return pipelineRunId ?? crypto.randomUUID();
    }

    const existing = pipelineRunId
      ? await tx
          .select({ id: ventureDossiers.id })
          .from(ventureDossiers)
          .where(
            and(
              eq(ventureDossiers.account_id, accountUuid),
              eq(ventureDossiers.pipeline_run_id, pipelineRunId),
            ),
          )
          .limit(1)
      : [];

    if (existing[0]) {
      await tx
        .update(ventureDossiers)
        .set({
          venture_id: ventureUuid ?? null,
          project_nickname: projectNickname ?? null,
          venture_name: ventureName,
          critic_score: criticScore !== null ? String(criticScore) : null,
          status,
          executive_summary: summary,
          updated_at: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(ventureDossiers.id, existing[0].id));
      return existing[0].id;
    }

    const [row] = await tx
      .insert(ventureDossiers)
      .values({
        account_id: accountUuid,
        venture_id: ventureUuid ?? null,
        pipeline_run_id: pipelineRunId ?? null,
        project_nickname: projectNickname ?? null,
        venture_name: ventureName,
        critic_score: criticScore !== null ? String(criticScore) : null,
        status,
        executive_summary: summary,
      })
      .returning({ id: ventureDossiers.id });

    if (!row?.id) {
      throw new Error('Failed to insert venture_dossiers row');
    }
    return row.id;
  });
}

/** @deprecated Kept for backwards compatibility; new callers should use `persistVentureDossier`. */
export async function persistVenturePipelineState(params: {
  accountId: string;
  ventureId: string;
  output: unknown;
}): Promise<string> {
  const { accountId, ventureId, output } = params;
  logger.info({ accountId, ventureId }, 'persistVenturePipelineState (deprecated) called');
  return await withAccountContext(accountId, async () => {
    void output;
    return crypto.randomUUID();
  });
}

export async function markPipelineRunStarted(params: {
  accountId: string;
  pipelineRunId: string;
}): Promise<void> {
  const { accountId, pipelineRunId } = params;
  await withAccountContext(accountId, async (tx) => {
    await tx
      .update(pipelineRuns)
      .set({
        status: 'running',
        started_at: sql`CURRENT_TIMESTAMP`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(pipelineRuns.id, pipelineRunId));
  });
}

export async function markPipelineRunFailed(params: {
  accountId: string;
  pipelineRunId: string;
  errorMessage: string;
}): Promise<void> {
  const { accountId, pipelineRunId, errorMessage } = params;
  await withAccountContext(accountId, async (tx) => {
    await tx
      .update(pipelineRuns)
      .set({
        status: 'failed',
        error_message: errorMessage,
        ended_at: sql`CURRENT_TIMESTAMP`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(pipelineRuns.id, pipelineRunId));
  });
}

export async function emitVentureStructuringCompleted(params: {
  accountId: string;
  ventureId: string;
  pipelineId: string;
  output: unknown;
  projectNickname?: string;
}): Promise<void> {
  const eventBus = getEventBus();
  await eventBus.emit({
    type: 'add-venture.structuring.completed',
    accountId: params.accountId,
    ventureId: params.ventureId,
    sourceModule: 'add-venture',
    payload: {
      pipeline_id: params.pipelineId,
      output: params.output,
      project_nickname: params.projectNickname,
    },
  });

  await emitEvent(
    'venture.qualified',
    'add-venture',
    {
      account_id: params.accountId,
      pipeline_id: params.pipelineId,
      output: params.output,
      project_nickname: params.projectNickname,
    },
    {
      ventureId: params.ventureId,
      warnWhenNoSubscribers: false,
    },
  );
}

export async function updatePipelineExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const { accountId, ventureId, step, state } = params;
  const redis = getRedisClient();
  await redis.set(accountId, 'add-venture', 'pipeline', ventureId, `state:${step}`, state, 3600);
}

export {
  obsStartRun,
  obsUpdateStep,
  obsStepEvent,
  obsCompleteRun,
  obsFailRun,
  obsSetRunProgress,
} from '@bruce/observability';
