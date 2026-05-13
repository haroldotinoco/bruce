import { Hono } from 'hono';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { getWorkflowStatus, JobNotFoundError } from '../services/job.service.js';

export const jobRoutes = new Hono();

jobRoutes.get('/:id', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const workflowId = c.req.param('id');

  try {
    const result = await getWorkflowStatus(workflowId);
    logger.info({ accountId, workflow_id: workflowId, correlationId }, 'Job polled');
    return c.json(result);
  } catch (error) {
    if (error instanceof JobNotFoundError) {
      logger.info(
        { accountId, workflow_id: workflowId, correlationId },
        'Job status: workflow not found',
      );
      return c.json({ error: 'Job not found' }, 404);
    }
    logger.error({ error, accountId, workflow_id: workflowId, correlationId }, 'Job status failed');
    return c.json(
      { error: 'Unable to load job status from the workflow service. Try again shortly.' },
      502,
    );
  }
});
