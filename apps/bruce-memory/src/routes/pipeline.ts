import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { startBruceMemoryPipeline } from '../services/pipeline.service.js';

const bodySchema = z.object({
  venture_id: z.string().uuid(),
  input: z.record(z.unknown()),
});

export const pipelineRoutes = new Hono();

pipelineRoutes.post('/', zValidator('json', bodySchema), async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const body = c.req.valid('json');
  try {
    const result = await startBruceMemoryPipeline({
      accountId,
      ventureId: body.venture_id,
      agentInput: body.input,
      correlationId,
    });
    return c.json({ ...result, poll_url: `/jobs/${result.workflow_id}` }, 202);
  } catch (error) {
    logger.error({ error, accountId }, 'bruce-memory pipeline start failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});
