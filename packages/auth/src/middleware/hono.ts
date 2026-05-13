import type { Context, Next } from 'hono';
import { extractTokenFromHeader, verifyClerkToken } from '../clerk.js';

export interface AuthContext {
  userId: string;
  accountId: string;
  orgSlug: string;
}

declare module 'hono' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

export function authMiddleware() {
  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        return c.json({ error: 'Missing Authorization header' }, 401);
      }

      const token = extractTokenFromHeader(authHeader);
      const session = await verifyClerkToken(token);

      c.set('auth', {
        userId: session.userId,
        accountId: session.orgId,
        orgSlug: session.orgSlug,
      });

      await next();
      return;
    } catch {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  };
}

export function getAuth(c: Context): AuthContext {
  const auth = c.get('auth');
  if (!auth) {
    throw new Error('Auth context not found. Ensure authMiddleware is applied.');
  }
  return auth;
}
