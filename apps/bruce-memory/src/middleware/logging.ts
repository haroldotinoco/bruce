import type { Context, Next } from 'hono';
import { patchLogContext } from '@bruce/logger';

export async function syncLogContextAccountMiddleware(c: Context, next: Next): Promise<void> {
  const accountId = c.get('accountId');
  if (accountId) patchLogContext({ accountId });
  await next();
}
