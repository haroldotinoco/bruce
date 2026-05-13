import { Hono } from 'hono';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { getWorkflowJobStatus } from '../services/job.service.js';

export const jobRoutes = new Hono();

jobRoutes.get('/:id', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const jobId = c.req.param('id');

  try {
    const status = await getWorkflowJobStatus(jobId);
    logger.info({ accountId, job_id: jobId, correlationId, status: status.status }, 'Job polled');
    return c.json(status);
  } catch (error) {
    logger.error({ error, accountId, job_id: jobId, correlationId }, 'Failed to get job status');
    return c.json({ error: (error as Error).message }, 404);
  }
});
