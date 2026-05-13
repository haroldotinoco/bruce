import { asc, and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import { removeProjectSubdirs } from '@bruce/project-store';
import { getTemporalClient } from '../temporal/client.js';
import { getScanById } from './scans-list.service.js';

const { pipelineRuns, ventureDossiers, opportunities, projects } = schema;

const DOWNSTREAM_MODULE_DIRS = ['add-venture', 'brand-aid', 'builder'] as const;

const TERMINAL_PIPELINE_STATUSES = new Set(['completed', 'failed']);

export class RestartDownstreamError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'RestartDownstreamError';
  }
}

function parseUuid(value: string): string | null {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRe.test(value) ? value : null;
}

function firstOpportunityFromScanResult(result: unknown): Record<string, unknown> {
  if (!result || typeof result !== 'object') {
    return {
      title: 'Restart downstream',
      problem_statement: 'No scan result payload',
      target_segment: 'general',
    };
  }
  const r = result as Record<string, unknown>;
  const ranked =
    r.ranked_opportunities ?? r.opportunities ?? r.scored_opportunities;
  if (Array.isArray(ranked) && ranked.length > 0 && ranked[0] && typeof ranked[0] === 'object') {
    return ranked[0] as Record<string, unknown>;
  }
  return {
    title: 'Restart downstream',
    problem_statement: 'No ranked list in scan result',
    target_segment: 'general',
  };
}

export async function resolveProjectNicknameForVenture(
  accountId: string,
  ventureIdUuid: string,
): Promise<string | null> {
  return await withAccountContext(accountId, async (tx) => {
    // Primary source: platform.projects
    const [projectRow] = await tx
      .select({ nickname: projects.nickname })
      .from(projects)
      .where(and(eq(projects.account_id, accountId), eq(projects.venture_id, ventureIdUuid)))
      .orderBy(desc(projects.created_at))
      .limit(1);
    if (projectRow?.nickname) return projectRow.nickname;

    // Fallback source 1: add_venture.pipeline_runs
    const accountUuid = parseUuid(accountId);
    const pipelineWhere = accountUuid
      ? and(
          eq(pipelineRuns.venture_id, ventureIdUuid),
          eq(pipelineRuns.account_id, accountUuid),
          isNotNull(pipelineRuns.project_nickname),
        )
      : and(eq(pipelineRuns.venture_id, ventureIdUuid), isNotNull(pipelineRuns.project_nickname));

    const [pipelineRow] = await tx
      .select({ nickname: pipelineRuns.project_nickname })
      .from(pipelineRuns)
      .where(pipelineWhere)
      .orderBy(desc(pipelineRuns.updated_at), desc(pipelineRuns.created_at))
      .limit(1);
    if (pipelineRow?.nickname) return pipelineRow.nickname;

    // Fallback source 2: add_venture.venture_dossiers
    const dossierWhere = accountUuid
      ? and(
          eq(ventureDossiers.venture_id, ventureIdUuid),
          eq(ventureDossiers.account_id, accountUuid),
          isNotNull(ventureDossiers.project_nickname),
        )
      : and(
          eq(ventureDossiers.venture_id, ventureIdUuid),
          isNotNull(ventureDossiers.project_nickname),
        );

    const [dossierRow] = await tx
      .select({ nickname: ventureDossiers.project_nickname })
      .from(ventureDossiers)
      .where(dossierWhere)
      .orderBy(desc(ventureDossiers.updated_at), desc(ventureDossiers.created_at))
      .limit(1);
    return dossierRow?.nickname ?? null;
  });
}

async function cancelNonTerminalPipelineWorkflows(
  accountId: string,
  ventureUuid: string,
): Promise<void> {
  const rows = await withAccountContext(accountId, async (tx) => {
    return tx
      .select({
        temporal_workflow_id: pipelineRuns.temporal_workflow_id,
        status: pipelineRuns.status,
      })
      .from(pipelineRuns)
      .where(eq(pipelineRuns.venture_id, ventureUuid));
  });

  const client = await getTemporalClient();
  for (const row of rows) {
    const wfId = row.temporal_workflow_id?.trim();
    if (!wfId) continue;
    if (row.status && TERMINAL_PIPELINE_STATUSES.has(row.status)) continue;
    try {
      const handle = client.workflow.getHandle(wfId);
      await handle.cancel();
      logger.info({ wfId, venture_id: ventureUuid }, 'Cancelled add-venture pipeline workflow');
    } catch (err) {
      logger.warn({ err, wfId, venture_id: ventureUuid }, 'Temporal cancel failed (ignored)');
    }
  }
}

async function wipeDownstreamForVenture(accountId: string, ventureUuid: string): Promise<void> {
  await withAccountContext(accountId, async (tx) => {
    await tx.delete(ventureDossiers).where(eq(ventureDossiers.venture_id, ventureUuid));
    await tx.delete(pipelineRuns).where(eq(pipelineRuns.venture_id, ventureUuid));

    await tx.execute(
      sql.raw(
        `DELETE FROM add_venture.execution_roadmaps WHERE venture_id = '${ventureUuid}'::uuid`,
      ),
    );
    await tx.execute(
      sql.raw(`DELETE FROM add_venture.business_models WHERE venture_id = '${ventureUuid}'::uuid`),
    );

    await tx.execute(
      sql.raw(`DELETE FROM brand_aid.brand_identities WHERE venture_id = '${ventureUuid}'::uuid`),
    );
    await tx.execute(
      sql.raw(`DELETE FROM builder.mvp_specs WHERE venture_id = '${ventureUuid}'::uuid`),
    );
  });
}

function addVentureStructuringUrl(): string {
  const base =
    process.env.BRUCE_GATEWAY_ADD_VENTURE?.replace(/\/$/, '') ??
    process.env.ADD_VENTURE_SERVICE_URL?.replace(/\/$/, '') ??
    'http://localhost:3003';
  return `${base}/structuring`;
}

export interface RestartDownstreamParams {
  accountId: string;
  scanId: string;
  confirmNickname: string;
  acknowledgeIrreversible: boolean;
  opportunityId?: string;
  rollbackFromStep?: string;
  authorizationHeader: string | null;
}

export interface RestartDownstreamResult {
  workflow_id: string;
  pipeline_run_id: string | null;
  status: string;
  execution_id?: string;
  poll_url?: string;
}

/**
 * Validated scan must be completed with a UUID venture_id; wipes add-venture /
 * brand-aid / builder state and starts structuring via add-venture HTTP API.
 */
export async function restartDownstreamFromScan(
  params: RestartDownstreamParams,
): Promise<RestartDownstreamResult> {
  const {
    accountId,
    scanId,
    confirmNickname,
    acknowledgeIrreversible,
    opportunityId: requestedOppId,
    rollbackFromStep,
    authorizationHeader,
  } = params;

  if (!acknowledgeIrreversible) {
    throw new RestartDownstreamError(400, 'You must acknowledge that this action is irreversible.');
  }

  if (!authorizationHeader?.trim()) {
    throw new RestartDownstreamError(401, 'Missing Authorization header.');
  }

  const scan = await getScanById(accountId, scanId);
  if (!scan) {
    throw new RestartDownstreamError(404, 'Scan not found.');
  }

  if (scan.status !== 'completed') {
    throw new RestartDownstreamError(
      409,
      'Scan must be completed before restarting the downstream pipeline.',
    );
  }

  const ventureUuid = scan.venture_id ? parseUuid(scan.venture_id) : null;
  if (!ventureUuid) {
    throw new RestartDownstreamError(
      409,
      'Scan has no venture UUID; cannot restart downstream pipeline.',
    );
  }

  const expectedNickname = await resolveProjectNicknameForVenture(accountId, ventureUuid);
  if (!expectedNickname) {
    throw new RestartDownstreamError(
      400,
      'Cannot verify project folder: no platform.projects row for this venture. Refusing to wipe filesystem.',
    );
  }

  if (confirmNickname.trim() !== expectedNickname) {
    throw new RestartDownstreamError(
      400,
      'Confirmation nickname does not match the project for this venture.',
    );
  }

  let opportunityId: string;
  let opportunity: Record<string, unknown>;

  if (requestedOppId?.trim()) {
    const oppUuid = parseUuid(requestedOppId.trim());
    if (!oppUuid) {
      throw new RestartDownstreamError(400, 'Invalid opportunity_id.');
    }
    const row = await withAccountContext(accountId, async (tx) => {
      const [r] = await tx
        .select()
        .from(opportunities)
        .where(
          and(
            eq(opportunities.account_id, accountId),
            eq(opportunities.id, oppUuid),
            eq(opportunities.venture_id, ventureUuid),
          ),
        )
        .limit(1);
      return r ?? null;
    });
    if (!row) {
      throw new RestartDownstreamError(
        404,
        'Opportunity not found for this scan/venture.',
      );
    }
    opportunityId = row.id;
    const research =
      row.research_data && typeof row.research_data === 'object'
        ? (row.research_data as Record<string, unknown>)
        : {};
    opportunity = { ...research, opportunity_id: opportunityId };
  } else {
    const rows = await withAccountContext(accountId, async (tx) => {
      return tx
        .select()
        .from(opportunities)
        .where(
          and(eq(opportunities.account_id, accountId), eq(opportunities.venture_id, ventureUuid)),
        )
        .orderBy(asc(opportunities.created_at))
        .limit(1);
    });
    const row = rows[0];
    if (row) {
      opportunityId = row.id;
      const research =
        row.research_data && typeof row.research_data === 'object'
          ? (row.research_data as Record<string, unknown>)
          : {};
      opportunity = { ...research, opportunity_id: opportunityId };
    } else {
      const fallback = firstOpportunityFromScanResult(scan.result_json);
      opportunityId =
        typeof fallback.opportunity_id === 'string' && parseUuid(fallback.opportunity_id)
          ? fallback.opportunity_id
          : crypto.randomUUID();
      opportunity = { ...fallback, opportunity_id: opportunityId };
    }
  }

  await cancelNonTerminalPipelineWorkflows(accountId, ventureUuid);
  await wipeDownstreamForVenture(accountId, ventureUuid);

  try {
    await removeProjectSubdirs(expectedNickname, [...DOWNSTREAM_MODULE_DIRS]);
  } catch (err) {
    logger.error({ err, nickname: expectedNickname }, 'removeProjectSubdirs failed');
    throw new RestartDownstreamError(500, 'Failed to remove project module directories on disk.');
  }

  const structuringUrl = addVentureStructuringUrl();
  const res = await fetch(structuringUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorizationHeader,
    },
    body: JSON.stringify({
      venture_id: ventureUuid,
      opportunity_id: opportunityId,
      opportunity: {
        ...opportunity,
        ...(rollbackFromStep ? { rollback_from_step: rollbackFromStep } : {}),
      },
      project_nickname: expectedNickname,
    }),
  });

  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = {};
  }

  if (!res.ok) {
    const msg =
      typeof body.error === 'string'
        ? body.error
        : `Add-venture structuring failed (${res.status})`;
    logger.error(
      { status: res.status, structuringUrl, msg },
      'restartDownstreamFromScan: structuring POST failed',
    );
    throw new RestartDownstreamError(res.status >= 400 && res.status < 600 ? res.status : 502, msg);
  }

  const workflow_id = typeof body.workflow_id === 'string' ? body.workflow_id : '';
  if (!workflow_id) {
    throw new RestartDownstreamError(502, 'Add-venture returned no workflow_id.');
  }

  return {
    workflow_id,
    pipeline_run_id: typeof body.pipeline_run_id === 'string' ? body.pipeline_run_id : null,
    status: typeof body.status === 'string' ? body.status : 'queued',
    execution_id: typeof body.execution_id === 'string' ? body.execution_id : undefined,
    poll_url: typeof body.poll_url === 'string' ? body.poll_url : undefined,
  };
}
