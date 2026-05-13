import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

declare module 'hono' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ContextVariableMap {
    accountId: string;
    userId: string;
    orgSlug: string;
  }
}

export function requireAuth(c: Context) {
  const accountId = c.get('accountId');
  if (!accountId) throw new HTTPException(401, { message: 'Unauthorized' });
  return {
    accountId,
    userId: c.get('userId') ?? '',
    orgSlug: c.get('orgSlug') ?? '',
    correlationId: c.get('correlationId') ?? '',
  };
}
