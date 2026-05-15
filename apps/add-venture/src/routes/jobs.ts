import { Hono } from 'hono';
import { logger } from '@bruce/logger';
import { standardJobErrorResponse } from '@bruce/observability';
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
    const mapped = standardJobErrorResponse(error);
    return c.json(mapped.body, mapped.httpStatus);
  }
});
