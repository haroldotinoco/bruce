import { and, desc, eq, or, sql } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';

const { scans } = schema;

/** Matches `parseVentureUuid` in temporal/activities.ts for venture_id column writes. */
function parseVentureUuid(ventureId: string): string | undefined {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRe.test(ventureId) ? ventureId : undefined;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ScanRow = {
  id: string;
  account_id: string;
  venture_id: string | null;
  temporal_workflow_id: string | null;
  themes: string[];
  status: string;
  result_json: unknown;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function listScansForAccount(
  accountId: string,
  opts: { limit: number; status?: string }
): Promise<ScanRow[]> {
  return await withAccountContext(accountId, async (tx) => {
    const conditions = [eq(scans.account_id, accountId)];
    if (opts.status) {
      conditions.push(eq(scans.status, opts.status));
    }
    const rows = await tx
      .select()
      .from(scans)
      .where(and(...conditions))
      .orderBy(desc(scans.created_at))
      .limit(opts.limit);
    return rows.map((r) => ({
      id: r.id,
      account_id: r.account_id,
      venture_id: r.venture_id,
      temporal_workflow_id: r.temporal_workflow_id,
      themes: (r.themes as string[]) ?? [],
      status: r.status,
      result_json: r.result_json,
      error_message: r.error_message,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  });
}

/**
 * Insert a row as soon as a workflow starts so GET /scans lists in-flight work.
 * Idempotent per `temporalWorkflowId` (skips if a row already exists).
 */
export async function createPendingScanRecord(params: {
  accountId: string;
  temporalWorkflowId: string;
  themes: string[];
  ventureId: string;
}): Promise<string> {
  const { accountId, temporalWorkflowId, themes, ventureId } = params;
  const ventureUuid = parseVentureUuid(ventureId);
  const themesForDb = themes.length ? themes : ['default'];

  return await withAccountContext(accountId, async (tx) => {
    const [existing] = await tx
      .select({ id: scans.id })
      .from(scans)
      .where(and(eq(scans.account_id, accountId), eq(scans.temporal_workflow_id, temporalWorkflowId)))
      .limit(1);
    if (existing) return existing.id;

    const [row] = await tx
      .insert(scans)
      .values({
        account_id: accountId,
        venture_id: ventureUuid ?? null,
        temporal_workflow_id: temporalWorkflowId,
        themes: themesForDb,
        status: 'running',
        result_json: null,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .returning({ id: scans.id });

    if (!row?.id) throw new Error('Failed to create pending scan row');
    return row.id;
  });
}

/**
 * Lookup by either the DB uuid primary key OR the Temporal workflow_id.
 * Clients may poll with either shape. We branch on UUID format to avoid sending
 * a non-UUID string to a `uuid` column (Postgres 22P02). If there is no row yet
 * and the id is not a UUID, a synthetic "running" payload is returned (legacy).
 */
export async function getScanById(accountId: string, scanId: string): Promise<ScanRow | null> {
  return await withAccountContext(accountId, async (tx) => {
    const isUuid = UUID_RE.test(scanId);
    const matchId = isUuid
      ? or(eq(scans.id, scanId), eq(scans.temporal_workflow_id, scanId))
      : eq(scans.temporal_workflow_id, scanId);

    const [row] = await tx
      .select()
      .from(scans)
      .where(and(eq(scans.account_id, accountId), matchId))
      .limit(1);
    if (!row) return null;
    return {
      id: row.id,
      account_id: row.account_id,
      venture_id: row.venture_id,
      temporal_workflow_id: row.temporal_workflow_id,
      themes: (row.themes as string[]) ?? [],
      status: row.status,
      result_json: row.result_json,
      error_message: row.error_message,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });
}
