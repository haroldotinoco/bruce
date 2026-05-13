import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { startVentureStructuringWorkflow } from '../services/structuring.service.js';

const bodySchema = z.object({
  venture_id: z.string().uuid(),
  opportunity_id: z.string().min(1),
  opportunity: z.record(z.unknown()),
  project_nickname: z.string().min(1).optional(),
});

export const structuringRoutes = new Hono();

structuringRoutes.post('/', zValidator('json', bodySchema), async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const body = c.req.valid('json');

  try {
    const result = await startVentureStructuringWorkflow({
      accountId,
      ventureId: body.venture_id,
      opportunityId: body.opportunity_id,
      opportunity: body.opportunity,
      correlationId,
      projectNickname: body.project_nickname,
    });

    logger.info(
      { accountId, workflow_id: result.workflow_id, correlationId },
      'Venture structuring workflow started'
    );

    return c.json(
      {
        ...result,
        poll_url: `/jobs/${result.workflow_id}`,
      },
      202
    );
  } catch (error) {
    logger.error({ error, accountId, correlationId }, 'Structuring start failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});
