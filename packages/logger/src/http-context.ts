import { logContext } from './context.js';

/**
 * Propagate correlation / tenant context to internal HTTP calls (inter-module).
 */
export function getOutboundPropagationHeaders(): Record<string, string> {
  const s = logContext.getStore();
  if (!s) return {};
  const h: Record<string, string> = {};
  if (s.correlationId) h['x-correlation-id'] = s.correlationId;
  if (s.accountId) h['x-account-id'] = s.accountId;
  if (s.ventureId) h['x-venture-id'] = s.ventureId;
  return h;
}
