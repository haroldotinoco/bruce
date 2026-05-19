import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { BootstrapError } from '@bruce/bootstrap';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { bootstrapBrandAidFromPrompt } from '../services/bootstrap-from-prompt.service.js';

const bodySchema = z.object({
  prompt: z.string().min(20),
  venture_id: z.string().uuid().optional(),
  venture_name: z.string().min(1).optional(),
  forced_brand_name: z.string().min(1).optional(),
  project_nickname: z.string().min(1).optional(),
});

export const bootstrapRoutes = new Hono();

bootstrapRoutes.post('/start-from-prompt', zValidator('json', bodySchema), async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const body = c.req.valid('json');

  try {
    const result = await bootstrapBrandAidFromPrompt({
      accountId,
      targetModule: 'brand-aid',
      prompt: body.prompt,
      ventureId: body.venture_id,
      ventureName: body.venture_name,
      forcedBrandName: body.forced_brand_name,
      projectNickname: body.project_nickname,
      correlationId,
    });

    return c.json(
      {
        ...result,
        poll_url: result.poll_url ?? `/jobs/${result.workflow_id}`,
      },
      202,
    );
  } catch (error) {
    if (error instanceof BootstrapError) {
      return c.json({ error: error.message }, error.status as 400 | 403 | 422);
    }
    logger.error({ error, accountId }, 'bootstrap start-from-prompt failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});
