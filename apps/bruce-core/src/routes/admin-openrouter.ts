import { Hono } from 'hono';
import { syncOpenRouterCatalogFromApi } from '@bruce/db';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';

export const adminOpenRouterRoutes = new Hono();

/**
 * Syncs the full OpenRouter model catalog into `platform.openrouter_models`.
 */
adminOpenRouterRoutes.post('/models/sync', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  try {
    const { upserted, syncedAt } = await syncOpenRouterCatalogFromApi();
    logger.info(
      { accountId, correlationId, upserted, syncedAt: syncedAt.toISOString() },
      'OpenRouter catalog synced',
    );
    return c.json({ ok: true, upserted, synced_at: syncedAt.toISOString() });
  } catch (err) {
    logger.error({ err, accountId, correlationId }, 'OpenRouter catalog sync failed');
    return c.json({ error: (err as Error).message }, 502);
  }
});
