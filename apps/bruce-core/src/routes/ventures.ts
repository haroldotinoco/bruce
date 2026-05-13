import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { enforcePlanLimits } from '@bruce/auth';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import * as ventureService from '../services/venture.service.js';

const createVentureSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().optional(),
  stage: z.enum(['concept', 'preseed', 'seed', 'series-a']).default('concept'),
  team_profile: z.record(z.unknown()).optional(),
  industry: z.string().optional(),
  founder_names: z.string().optional(),
});

export const ventureRoutes = new Hono();

ventureRoutes.post(
  '/',
  enforcePlanLimits('max_ventures'),
  zValidator('json', createVentureSchema),
  async (c) => {
    const { accountId, correlationId } = requireAuth(c);
    const body = c.req.valid('json');

    try {
      const venture = await ventureService.createVenture(accountId, {
        name: body.name,
        description: body.description,
        stage: body.stage,
        industry: body.industry,
        founder_names: body.founder_names,
      });

      logger.info({ accountId, venture_id: venture.id, correlationId }, 'Venture created');

      return c.json(ventureService.toVentureResponse(venture), 201);
    } catch (error) {
      logger.error({ error, accountId, correlationId }, 'Failed to create venture');
      return c.json({ error: (error as Error).message }, 400);
    }
  }
);

const uuidParam = z.object({
  id: z.string().uuid(),
});

ventureRoutes.post('/:id/start-analysis', zValidator('param', uuidParam), async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const { id: ventureId } = c.req.valid('param');

  try {
    const jobId = await ventureService.startVentureAnalysisWorkflow(accountId, ventureId);

    logger.info(
      { accountId, venture_id: ventureId, job_id: jobId, correlationId },
      'Analysis workflow started'
    );

    return c.json(
      {
        job_id: jobId,
        status: 'queued',
        poll_url: `/jobs/${jobId}`,
      },
      202
    );
  } catch (error) {
    logger.error({ error, accountId, venture_id: ventureId, correlationId }, 'Failed to start workflow');
    return c.json({ error: (error as Error).message }, 400);
  }
});

ventureRoutes.get('/:id', zValidator('param', uuidParam), async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const { id } = c.req.valid('param');

  try {
    const venture = await ventureService.getVenture(accountId, id);
    if (!venture) {
      return c.json({ error: 'Venture not found' }, 404);
    }
    logger.info({ accountId, venture_id: id, correlationId }, 'Venture read');
    return c.json(ventureService.toVentureResponse(venture));
  } catch (error) {
    logger.error({ error, accountId, venture_id: id, correlationId }, 'Failed to get venture');
    return c.json({ error: (error as Error).message }, 404);
  }
});
