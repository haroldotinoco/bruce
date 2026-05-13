import { Hono } from 'hono';
import { logger } from '@bruce/logger';
import {
  getWorkflowRun,
  getWorkflowRunByTemporalId,
  listWorkflowRuns,
} from '@bruce/observability';
import { requireAuth } from '../middleware/auth-local.js';

const MODULE_NAME = 'builder';

export const workflowsRoutes = new Hono();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

workflowsRoutes.get('/', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const status = c.req.query('status') ?? undefined;
  const ventureId = c.req.query('venture_id') ?? undefined;
  const limit = Number(c.req.query('limit') ?? '50');
  try {
    const rows = await listWorkflowRuns(accountId, {
      module: MODULE_NAME,
      status,
      ventureId,
      limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 50,
    });
    return c.json({ runs: rows, items: rows });
  } catch (err) {
    logger.error({ err, accountId, correlationId }, 'workflows.list failed');
    return c.json({ error: (err as Error).message }, 500);
  }
});

workflowsRoutes.get('/:run_id', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const runId = c.req.param('run_id');
  try {
    const run = UUID_RE.test(runId)
      ? await getWorkflowRun(accountId, runId)
      : await getWorkflowRunByTemporalId(accountId, runId);
    if (!run) return c.json({ error: 'Workflow run not found' }, 404);
    return c.json(run);
  } catch (err) {
    logger.error({ err, accountId, run_id: runId, correlationId }, 'workflows.get failed');
    return c.json({ error: (err as Error).message }, 500);
  }
});
