import { desc, eq } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import { deliverableExists, readDeliverable } from '@bruce/project-store';

const { ventureDossiers, pipelineRuns } = schema;

export interface DossierListItem {
  id: string;
  venture_id: string | null;
  pipeline_run_id: string | null;
  project_nickname: string | null;
  venture_name: string | null;
  critic_score: number | null;
  status: string | null;
  executive_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface DossierDetail extends DossierListItem {
  dossier: unknown | null;
  dossier_source: 'filesystem' | 'missing';
  pipeline_run?: {
    id: string;
    status: string;
    started_at: string | null;
    ended_at: string | null;
    error_message: string | null;
  } | null;
}

function numericToNumber(v: string | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function listDossiersForAccount(
  accountId: string,
  opts: { limit: number; status?: string },
): Promise<DossierListItem[]> {
  const rows = await withAccountContext(accountId, async (tx) => {
    const base = tx
      .select({
        id: ventureDossiers.id,
        venture_id: ventureDossiers.venture_id,
        pipeline_run_id: ventureDossiers.pipeline_run_id,
        project_nickname: ventureDossiers.project_nickname,
        venture_name: ventureDossiers.venture_name,
        critic_score: ventureDossiers.critic_score,
        status: ventureDossiers.status,
        executive_summary: ventureDossiers.executive_summary,
        created_at: ventureDossiers.created_at,
        updated_at: ventureDossiers.updated_at,
      })
      .from(ventureDossiers);

    const filtered =
      opts.status != null ? base.where(eq(ventureDossiers.status, opts.status)) : base;

    return await filtered.orderBy(desc(ventureDossiers.created_at)).limit(opts.limit);
  });

  return rows.map((r) => ({
    id: r.id,
    venture_id: r.venture_id,
    pipeline_run_id: r.pipeline_run_id,
    project_nickname: r.project_nickname,
    venture_name: r.venture_name,
    critic_score: numericToNumber(r.critic_score),
    status: r.status,
    executive_summary: r.executive_summary,
    created_at: r.created_at.toISOString(),
    updated_at: r.updated_at.toISOString(),
  }));
}

export async function getDossierById(
  accountId: string,
  id: string,
): Promise<DossierDetail | null> {
  const detail = await withAccountContext(accountId, async (tx) => {
    const [row] = await tx
      .select({
        id: ventureDossiers.id,
        venture_id: ventureDossiers.venture_id,
        pipeline_run_id: ventureDossiers.pipeline_run_id,
        project_nickname: ventureDossiers.project_nickname,
        venture_name: ventureDossiers.venture_name,
        critic_score: ventureDossiers.critic_score,
        status: ventureDossiers.status,
        executive_summary: ventureDossiers.executive_summary,
        created_at: ventureDossiers.created_at,
        updated_at: ventureDossiers.updated_at,
      })
      .from(ventureDossiers)
      .where(eq(ventureDossiers.id, id))
      .limit(1);

    if (!row) return null;

    let pipelineRun: DossierDetail['pipeline_run'] = null;
    if (row.pipeline_run_id) {
      const [pr] = await tx
        .select({
          id: pipelineRuns.id,
          status: pipelineRuns.status,
          started_at: pipelineRuns.started_at,
          ended_at: pipelineRuns.ended_at,
          error_message: pipelineRuns.error_message,
        })
        .from(pipelineRuns)
        .where(eq(pipelineRuns.id, row.pipeline_run_id))
        .limit(1);
      pipelineRun = pr
        ? {
            id: pr.id,
            status: pr.status,
            started_at: pr.started_at?.toISOString() ?? null,
            ended_at: pr.ended_at?.toISOString() ?? null,
            error_message: pr.error_message,
          }
        : null;
    }

    return { row, pipelineRun };
  });

  if (!detail) return null;
  const { row, pipelineRun } = detail;

  let dossierJson: unknown | null = null;
  let source: DossierDetail['dossier_source'] = 'missing';

  if (row.project_nickname) {
    try {
      const exists = await deliverableExists(
        row.project_nickname,
        'add-venture',
        'dossier-composer',
        'dossier.json',
      );
      if (exists) {
        dossierJson = await readDeliverable(
          row.project_nickname,
          'add-venture',
          'dossier-composer',
          'dossier.json',
        );
        source = 'filesystem';
      }
    } catch (e) {
      logger.warn(
        { error: (e as Error).message, project_nickname: row.project_nickname },
        'Failed to read dossier.json from project folder',
      );
    }
  }

  return {
    id: row.id,
    venture_id: row.venture_id,
    pipeline_run_id: row.pipeline_run_id,
    project_nickname: row.project_nickname,
    venture_name: row.venture_name,
    critic_score: numericToNumber(row.critic_score),
    status: row.status,
    executive_summary: row.executive_summary,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    dossier: dossierJson,
    dossier_source: source,
    pipeline_run: pipelineRun,
  };
}
