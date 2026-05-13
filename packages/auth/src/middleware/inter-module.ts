import type { Context, Next } from 'hono';
import { verifyInterModuleJWT } from '../inter-module-jwt.js';

declare module 'hono' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ContextVariableMap {
    interModule: Awaited<ReturnType<typeof verifyInterModuleJWT>>;
  }
}

export function interModuleAuthMiddleware() {
  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Missing Authorization header' }, 401);
      }

      const token = authHeader.slice(7);
      const decoded = await verifyInterModuleJWT(token);
      c.set('interModule', decoded);
      await next();
      return;
    } catch {
      return c.json({ error: 'Invalid inter-module token' }, 401);
    }
  };
}
