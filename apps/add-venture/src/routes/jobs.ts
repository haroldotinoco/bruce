import { Hono } from 'hono';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { getWorkflowStatus } from '../services/job.service.js';

export const jobRoutes = new Hono();

jobRoutes.get('/:id', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const workflowId = c.req.param('id');

  try {
    const result = await getWorkflowStatus(workflowId);
    logger.info({ accountId, workflow_id: workflowId, correlationId }, 'Job polled');
    return c.json(result);
  } catch (error) {
    logger.error({ error, accountId, workflow_id: workflowId, correlationId }, 'Job status failed');
    return c.json({ error: (error as Error).message }, 404);
  }
});
