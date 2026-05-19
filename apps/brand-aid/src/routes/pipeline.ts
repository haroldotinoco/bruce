import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { startBrandAidPipeline } from '../services/pipeline.service.js';

const bodySchema = z.object({
  venture_id: z.string().uuid(),
  input: z.record(z.unknown()),
  forced_brand_name: z.string().min(1).optional(),
  project_nickname: z.string().min(1).optional(),
});

export const pipelineRoutes = new Hono();

pipelineRoutes.post('/', zValidator('json', bodySchema), async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const body = c.req.valid('json');
  const agentInput = { ...body.input };
  const forced =
    body.forced_brand_name?.trim() ||
    (typeof agentInput.forced_brand_name === 'string' ? agentInput.forced_brand_name.trim() : '');
  if (forced) {
    agentInput.forced_brand_name = forced;
  }
  try {
    const result = await startBrandAidPipeline({
      accountId,
      ventureId: body.venture_id,
      agentInput,
      correlationId,
      projectNickname: body.project_nickname,
    });
    return c.json({ ...result, poll_url: `/jobs/${result.workflow_id}` }, 202);
  } catch (error) {
    logger.error({ error, accountId }, 'brand-aid pipeline start failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});
