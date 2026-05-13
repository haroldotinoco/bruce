import { Hono } from 'hono';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import {
  getDossierById,
  listDossiersForAccount,
} from '../services/dossier.service.js';

export const dossierRoutes = new Hono();

dossierRoutes.get('/', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const status = c.req.query('status');
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);

  try {
    const data = await listDossiersForAccount(accountId, {
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
      status: status ?? undefined,
    });
    logger.info({ accountId, correlationId, count: data.length }, 'Listed dossiers');
    return c.json({ data });
  } catch (error) {
    logger.error({ error, accountId, correlationId }, 'Failed to list dossiers');
    return c.json({ error: (error as Error).message }, 500);
  }
});

dossierRoutes.get('/:id', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const id = c.req.param('id');

  try {
    const dossier = await getDossierById(accountId, id);
    if (!dossier) {
      return c.json({ error: 'Dossier not found' }, 404);
    }
    logger.info({ accountId, correlationId, id }, 'Fetched dossier');
    return c.json(dossier);
  } catch (error) {
    logger.error({ error, accountId, correlationId, id }, 'Failed to fetch dossier');
    return c.json({ error: (error as Error).message }, 500);
  }
});
