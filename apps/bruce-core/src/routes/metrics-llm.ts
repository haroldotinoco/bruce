import { Hono } from 'hono';
import { getLlmUsageForAccountInRange } from '@bruce/observability';
import { requireAuth } from '../middleware/auth-local.js';

export const metricsLlmRoutes = new Hono();

/** Current calendar month LLM usage (all modules). */
metricsLlmRoutes.get('/global', async (c) => {
  const { accountId } = requireAuth(c);
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const month = await getLlmUsageForAccountInRange(accountId, { since: start });
  return c.json({ month });
});

/** Usage in a rolling window, optionally filtered by module id. */
metricsLlmRoutes.get('/module', async (c) => {
  const { accountId } = requireAuth(c);
  const module = c.req.query('module') ?? undefined;
  const days = Math.min(90, Math.max(1, Number(c.req.query('days') ?? '7')));
  const until = new Date();
  const since = new Date(until.getTime() - days * 86_400_000);
  const period = await getLlmUsageForAccountInRange(accountId, {
    module,
    since,
    until,
  });
  return c.json({ module: module ?? 'all', days, period });
});
