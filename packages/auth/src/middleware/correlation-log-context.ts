import { randomUUID } from 'node:crypto';
import type { Context, Next } from 'hono';
import { logContext, type MutableLogContext } from '@bruce/logger';

declare module 'hono' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ContextVariableMap {
    correlationId: string;
  }
}

export function correlationLogContextMiddleware(options: { module: string }) {
  return async (c: Context, next: Next): Promise<void> => {
    const incoming = c.req.header('x-correlation-id');
    const correlationId = incoming && incoming.length > 0 ? incoming : randomUUID();
    c.set('correlationId', correlationId);
    c.header('x-correlation-id', correlationId);

    const ctx: MutableLogContext = {
      correlationId,
      module: options.module,
    };

    await logContext.run(ctx, async () => {
      await next();
    });
  };
}
