import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { assertScanQuota } from '../services/usage.service.js';
import {
  startOpportunityScanWorkflow,
  startThemedDiscoveryScan,
} from '../services/scan.service.js';
import { getScanById, listScansForAccount } from '../services/scans-list.service.js';
import {
  RestartDownstreamError,
  restartDownstreamFromScan,
  resolveProjectNicknameForVenture,
} from '../services/restart-downstream.service.js';

const ventureScanBody = z.object({
  venture_id: z.string().min(1),
  opportunities: z.array(z.unknown()).default([]),
  themes: z.array(z.string()).max(5).optional(),
});

const themesOnlyBody = z.object({
  themes: z.array(z.string()).max(5).default([]),
  filters: z.record(z.unknown()).optional(),
  venture_id: z.string().optional(),
  webhook_url: z.string().url().optional(),
});

const scanBodySchema = z.union([ventureScanBody, themesOnlyBody]);

export const scanRoutes = new Hono();

scanRoutes.get('/', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const status = c.req.query('status');
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);

  try {
    const data = await listScansForAccount(accountId, {
      limit,
      status: status ?? undefined,
    });
    logger.info({ accountId, correlationId, count: data.length }, 'Listed scans');
    return c.json({
      data: data.map((row) => ({
        id: row.id,
        status: row.status,
        themes: row.themes,
        opportunities_found: Array.isArray((row.result_json as { opportunities?: unknown })?.opportunities)
          ? ((row.result_json as { opportunities: unknown[] }).opportunities.length)
          : null,
        created_at: row.created_at.toISOString(),
        completed_at: row.status === 'completed' ? row.updated_at.toISOString() : null,
        temporal_workflow_id: row.temporal_workflow_id,
      })),
      next_cursor: null as string | null,
      has_more: false,
    });
  } catch (error) {
    logger.error({ error, accountId }, 'List scans failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const restartDownstreamBody = z.object({
  confirm_nickname: z.string().min(1),
  opportunity_id: z.string().uuid().optional(),
  rollback_from_step: z.string().min(1).optional(),
  acknowledge_irreversible: z.literal(true),
});

scanRoutes.get('/:scan_id', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const scanId = c.req.param('scan_id');

  try {
    const row = await getScanById(accountId, scanId);
    if (!row) {
      // Legacy: if no row yet (e.g. insert failed) and the client used a
      // temporal workflow_id (non-UUID), return a running placeholder so the UI
      // can still poll instead of 404.
      if (!UUID_RE.test(scanId)) {
        const now = new Date().toISOString();
        return c.json({
          id: scanId,
          status: 'running',
          themes: [],
          venture_id: null,
          project_nickname: null,
          temporal_workflow_id: scanId,
          result: null,
          error_message: null,
          created_at: now,
          updated_at: now,
        });
      }
      return c.json({ error: 'Not Found' }, 404);
    }
    logger.info({ accountId, scanId, correlationId }, 'Get scan');

    let project_nickname: string | null = null;
    const ventureKey = row.venture_id;
    if (ventureKey && UUID_RE.test(ventureKey)) {
      project_nickname = await resolveProjectNicknameForVenture(accountId, ventureKey);
    }

    return c.json({
      id: row.id,
      status: row.status,
      themes: row.themes,
      venture_id: row.venture_id,
      project_nickname,
      temporal_workflow_id: row.temporal_workflow_id,
      result: row.result_json,
      error_message: row.error_message,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    });
  } catch (error) {
    logger.error({ error, accountId }, 'Get scan failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

scanRoutes.get('/:scan_id/opportunities', async (c) => {
  const { accountId } = requireAuth(c);
  const scanId = c.req.param('scan_id');
  const minScore = c.req.query('min_score');

  try {
    const row = await getScanById(accountId, scanId);
    if (!row) {
      return c.json({ error: 'Not Found' }, 404);
    }
    const result = row.result_json as Record<string, unknown> | null;
    let opportunities: unknown[] = [];
    if (result && Array.isArray(result.ranked_opportunities)) {
      opportunities = result.ranked_opportunities as unknown[];
    } else if (result && Array.isArray(result.opportunities)) {
      opportunities = result.opportunities as unknown[];
    } else if (result && Array.isArray(result.scored_opportunities)) {
      opportunities = result.scored_opportunities as unknown[];
    }
    const filtered =
      minScore !== undefined
        ? opportunities.filter((o) => {
            const r = o as { total_score?: number };
            return typeof r.total_score === 'number' && r.total_score >= Number(minScore);
          })
        : opportunities;

    return c.json({
      opportunities: filtered,
      total: filtered.length,
    });
  } catch (error) {
    logger.error({ error, accountId }, 'Get scan opportunities failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

scanRoutes.post(
  '/:scan_id/restart-downstream',
  zValidator('json', restartDownstreamBody),
  async (c) => {
    const { accountId, correlationId } = requireAuth(c);
    const scanId = c.req.param('scan_id');
    const body = c.req.valid('json');
    const authorizationHeader = c.req.header('authorization') ?? null;

    try {
      const result = await restartDownstreamFromScan({
        accountId,
        scanId,
        confirmNickname: body.confirm_nickname,
        acknowledgeIrreversible: body.acknowledge_irreversible,
        opportunityId: body.opportunity_id,
        rollbackFromStep: body.rollback_from_step,
        authorizationHeader,
      });

      logger.info(
        {
          accountId,
          scanId,
          workflow_id: result.workflow_id,
          correlationId,
        },
        'Restarted downstream pipeline from scan',
      );

      return c.json(result, 202);
    } catch (error) {
      if (error instanceof RestartDownstreamError) {
        logger.warn(
          { accountId, scanId, status: error.status, message: error.message },
          'restart-downstream rejected',
        );
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      logger.error({ error, accountId, scanId }, 'restart-downstream failed');
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);

scanRoutes.post('/', zValidator('json', scanBodySchema), async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const body = c.req.valid('json');

  try {
    await assertScanQuota(accountId);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes('Plan limit')) {
      return c.json({ error: msg, code: 'PLAN_LIMIT' }, 402);
    }
    throw e;
  }

  try {
    if ('themes' in body && !('venture_id' in body && body.venture_id)) {
      const themed = body as z.infer<typeof themesOnlyBody>;
      const result = await startThemedDiscoveryScan(
        accountId,
        themed.themes,
        correlationId,
        themed.venture_id
      );
      logger.info(
        { accountId, workflow_id: result.workflow_id, correlationId, ai_suggested: result.ai_suggested },
        'Themed opportunity scan started'
      );
      return c.json(
        {
          id: result.scan_id,
          status: 'queued',
          themes: result.themes,
          ai_suggested_themes: result.ai_suggested,
          created_at: new Date().toISOString(),
          workflow_id: result.workflow_id,
          execution_id: result.execution_id,
        },
        202
      );
    }

    const v = body as z.infer<typeof ventureScanBody>;
    const result = await startOpportunityScanWorkflow(
      accountId,
      v.venture_id,
      v.opportunities ?? [],
      correlationId,
      v.themes
    );

    logger.info(
      { accountId, venture_id: v.venture_id, workflow_id: result.workflow_id, correlationId },
      'Opportunity scan started'
    );

    return c.json(
      {
        id: result.scan_id,
        workflow_id: result.workflow_id,
        status: 'queued',
        execution_id: result.execution_id,
      },
      202
    );
  } catch (error) {
    logger.error({ error, accountId, correlationId }, 'Failed to start opportunity scan');
    return c.json({ error: (error as Error).message }, 500);
  }
});
