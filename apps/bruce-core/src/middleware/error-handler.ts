import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { logger } from '@bruce/logger';

export const errorHandler = (error: Error, c: Context): Response => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }

  if (error instanceof ZodError) {
    return c.json(
      {
        error: 'Validation error',
        details: error.flatten(),
      },
      400
    );
  }

  logger.error(
    {
      error: error.message,
      stack: error.stack,
      method: c.req.method,
      path: c.req.path,
    },
    'Unhandled error'
  );

  if (error.message.toLowerCase().includes('validation')) {
    return c.json({ error: 'Validation error', details: error.message }, 400);
  }

  if (error.message.toLowerCase().includes('not found')) {
    return c.json({ error: 'Resource not found' }, 404);
  }

  return c.json(
    {
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    },
    500
  );
};
