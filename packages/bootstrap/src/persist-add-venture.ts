import { sql } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import { obsCompleteRun, obsStartRun } from '@bruce/observability';
import { writeDeliverable } from '@bruce/project-store';
import { dossierVolumes } from './heuristic.js';
import { asRecord, parseUuid, syntheticMeta } from './util.js';

const { pipelineRuns, ventureDossiers } = schema;

function extractCriticScore(dossier: unknown): number | null {
  const d = asRecord(dossier);
  const km = asRecord(d.key_metrics);
  if (typeof km.critique_overall_score === 'number') return km.critique_overall_score;
  const crit = asRecord(d.critique_result);
  if (typeof crit.overall_score === 'number') return crit.overall_score;
  return null;
}

function extractSummary(dossier: unknown): string | null {
  const es = asRecord(asRecord(dossier).executive_summary);
  const s = es.narrative_summary;
  return typeof s === 'string' && s.length > 0 ? s : null;
}

export async function persistSyntheticAddVentureRun(params: {
  accountId: string;
  ventureId: string;
  ventureName: string;
  opportunityId: string;
  prompt: string;
  dossier: Record<string, unknown>;
  correlationId: string;
  projectNickname?: string;
}): Promise<{
  pipelineRunId: string | null;
  observabilityRunId: string;
  temporalWorkflowId: string;
  dossierId: string | null;
}> {
  const temporalWorkflowId = `bootstrap-add-venture-${params.ventureId}-${Date.now()}`;
  const accountUuid = parseUuid(params.accountId);
  const ventureUuid = parseUuid(params.ventureId);
  const opportunityUuid = parseUuid(params.opportunityId);

  const obsRunId = await obsStartRun({
    accountId: params.accountId,
    module: 'add-venture',
    workflowType: 'bootstrapSyntheticStructuring',
    temporalWorkflowId,
    correlationId: params.correlationId,
    ventureId: params.ventureId,
    title: `Synthetic structuring · ${params.ventureName}`,
    subtitle: 'Bootstrap backfill',
  });

  if (params.projectNickname) {
    try {
      await writeDeliverable(
        params.projectNickname,
        'add-venture',
        'dossier-composer',
        'dossier.json',
        { ...params.dossier, ...syntheticMeta(params.prompt) },
      );
    } catch (e) {
      logger.warn({ error: (e as Error).message }, 'Failed to write synthetic dossier.json');
    }
  }

  let pipelineRunId: string | null = null;
  let dossierId: string | null = null;

  if (accountUuid) {
    await withAccountContext(params.accountId, async (tx) => {
      const [run] = await tx
        .insert(pipelineRuns)
        .values({
          account_id: accountUuid,
          venture_id: ventureUuid ?? null,
          opportunity_id: opportunityUuid ?? null,
          project_nickname: params.projectNickname ?? null,
          temporal_workflow_id: temporalWorkflowId,
          status: 'completed',
          ended_at: sql`CURRENT_TIMESTAMP`,
          created_at: sql`CURRENT_TIMESTAMP`,
          updated_at: sql`CURRENT_TIMESTAMP`,
        })
        .returning({ id: pipelineRuns.id });
      pipelineRunId = run?.id ?? null;

      if (pipelineRunId) {
        const criticScore = extractCriticScore(params.dossier);
        const summary = extractSummary(params.dossier);
        const [dRow] = await tx
          .insert(ventureDossiers)
          .values({
            account_id: accountUuid,
            venture_id: ventureUuid ?? null,
            pipeline_run_id: pipelineRunId,
            project_nickname: params.projectNickname ?? null,
            venture_name: params.ventureName,
            critic_score: criticScore !== null ? String(criticScore) : null,
            status: 'approved',
            executive_summary: summary,
          })
          .returning({ id: ventureDossiers.id });
        dossierId = dRow?.id ?? null;
      }
    });
  }

  const volumes = dossierVolumes(params.dossier);

  await obsCompleteRun({
    runId: obsRunId,
    accountId: params.accountId,
    result: {
      pipeline_id: pipelineRunId,
      dossier: params.dossier,
      vol2: volumes.vol2,
      vol3: volumes.vol3,
      vol5: volumes.vol5,
      vol6: volumes.vol6,
      vol8: volumes.vol8,
      status: 'completed',
      ...syntheticMeta(params.prompt),
    },
  });

  return { pipelineRunId, observabilityRunId: obsRunId, temporalWorkflowId, dossierId };
}
