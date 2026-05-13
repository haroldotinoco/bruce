import type { Context, Next } from 'hono';
import { patchLogContext } from '@bruce/logger';

/**
 * After auth, copy tenant id into AsyncLocalStorage log context (same request ALS run).
 */
export async function syncLogContextAccountMiddleware(c: Context, next: Next): Promise<void> {
  const accountId = c.get('accountId');
  if (accountId) {
    patchLogContext({ accountId });
  }
  await next();
}
