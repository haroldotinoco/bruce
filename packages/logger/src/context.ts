import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Mutable object so HTTP middleware can enrich context after auth (same ALS run).
 */
export interface MutableLogContext {
  correlationId: string;
  accountId?: string;
  ventureId?: string;
  module?: string;
  agentId?: string;
  workflowId?: string;
}

export const logContext = new AsyncLocalStorage<MutableLogContext>();

export function patchLogContext(partial: Partial<MutableLogContext>): void {
  const store = logContext.getStore();
  if (!store) return;
  Object.assign(store, partial);
}

export function storeToSnakeBindings(
  store: MutableLogContext | undefined,
): Record<string, unknown> {
  if (!store) return {};
  return {
    ...(store.correlationId ? { correlation_id: store.correlationId } : {}),
    ...(store.accountId ? { account_id: store.accountId } : {}),
    ...(store.ventureId ? { venture_id: store.ventureId } : {}),
    ...(store.module ? { module: store.module } : {}),
    ...(store.agentId ? { agent_id: store.agentId } : {}),
    ...(store.workflowId ? { workflow_id: store.workflowId } : {}),
  };
}

export function mergeWithLogContext(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...storeToSnakeBindings(logContext.getStore()),
    ...data,
  };
}
