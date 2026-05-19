import { and, eq, sql } from 'drizzle-orm';
import { AgentLoader, AgentRunner, runAgentStep } from '@bruce/agent-runtime';
import { schema, withAccountContext } from '@bruce/db';
import { emitEvent, getEventBus } from '@bruce/events';
import {
  buildVentureToBrandHandoff,
  buildVentureToBuilderHandoff,
  createValidatedModuleHandoffEnvelope,
  renderStructuringInsightsMd,
  renderVentureDossierSummaryMd,
  validateVentureToBrandHandoff,
  validateVentureToBuilderHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { writeDeliverable, writeProjectKnowledgeDoc } from '@bruce/project-store';
import { getRedisClient } from '@bruce/redis';
import { getAddVentureAgentRuntimeHooks } from './agent-hooks.js';

const { pipelineRuns, ventureDossiers } = schema;
const addVentureAgentRunner = new AgentRunner({
  agentLoader: new AgentLoader(undefined, getAddVentureAgentRuntimeHooks),
});

type RecordLike = Record<string, unknown>;

function asRecord(x: unknown): RecordLike {
  return x && typeof x === 'object' ? (x as RecordLike) : {};
}

export interface RunAgentActivityParams {
  module: string;
  agentId: string;
  input: unknown;
  context: {
    accountId: string;
    ventureId?: string;
    executionId?: string;
    correlationId: string;
    observabilityRunId?: string;
    observabilityStepKey?: string;
    observabilityParentStepKey?: string;
    projectNickname?: string;
  };
}

// =============================================================
// Agent activities
// =============================================================

export async function runAgentActivity(params: RunAgentActivityParams): Promise<unknown> {
  logger.info(
    { accountId: params.context.accountId, module: params.module, agentId: params.agentId },
    'Running agent activity',
  );

  const result = await runAgentStep({
    module: params.module,
    agentId: params.agentId,
    input: params.input,
    runner: addVentureAgentRunner,
    context: {
      accountId: params.context.accountId,
      ventureId: params.context.ventureId,
      module: params.module,
      executionId: params.context.executionId ?? crypto.randomUUID(),
      correlationId: params.context.correlationId,
      observabilityRunId: params.context.observabilityRunId,
      observabilityStepKey: params.context.observabilityStepKey,
      observabilityParentStepKey: params.context.observabilityParentStepKey,
      projectNickname: params.context.projectNickname,
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? `${params.module}/${params.agentId} failed`);
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
  vol2: unknown;
  vol3: unknown;
  vol5: unknown;
  vol6: unknown;
  vol8: unknown;
  correlationId?: string;
  temporalWorkflowId?: string;
  observabilityRunId?: string;
  projectNickname?: string;
}): Promise<void> {
  const eventBus = getEventBus();
  const brandPayload = buildVentureToBrandHandoff({
    ventureId: params.ventureId,
    vol2: asRecord(params.vol2),
    vol3: asRecord(params.vol3),
    vol6: asRecord(params.vol6),
  });
  const builderPayload = buildVentureToBuilderHandoff({
    ventureId: params.ventureId,
    vol2: asRecord(params.vol2),
    vol3: asRecord(params.vol3),
    vol5: asRecord(params.vol5),
    vol8: asRecord(params.vol8),
  });
  const correlationId = params.correlationId ?? crypto.randomUUID();
  const contextRefs = [
    { ref_type: 'artifact' as const, ref_id: params.pipelineId, description: 'Approved venture dossier' },
  ];
  const brandHandoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'add-venture',
    toModule: 'brand-aid',
    ventureId: params.ventureId,
    payload: brandPayload,
    correlationId,
    workflowExecutionId: params.temporalWorkflowId,
    triggeredBy: 'workflow_step',
    targetSchema: 'venture-to-brand.schema.json',
    contextRefs,
    validator: validateVentureToBrandHandoff,
  });
  const builderHandoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'add-venture',
    toModule: 'builder',
    ventureId: params.ventureId,
    payload: builderPayload,
    correlationId,
    workflowExecutionId: params.temporalWorkflowId,
    triggeredBy: 'workflow_step',
    targetSchema: 'venture-to-builder.schema.json',
    contextRefs,
    validator: validateVentureToBuilderHandoff,
  });
  await eventBus.emit({
    type: 'add-venture.structuring.completed',
    accountId: params.accountId,
    ventureId: params.ventureId,
    sourceModule: 'add-venture',
    payload: {
      pipeline_id: params.pipelineId,
      observability_run_id: params.observabilityRunId,
      temporal_workflow_id: params.temporalWorkflowId,
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
      handoffs: {
        'brand-aid': brandHandoff,
        builder: builderHandoff,
      },
      project_nickname: params.projectNickname,
    },
    {
      ventureId: params.ventureId,
      correlationId,
      observabilityRunId: params.observabilityRunId,
      temporalWorkflowId: params.temporalWorkflowId,
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
