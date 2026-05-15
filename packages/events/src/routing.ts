import { EVENT_ROUTING_POLICY } from './routing-policy.js';

/**
 * Default fan-out routing when `emitEvent` is called without explicit subscribers.
 * Derived from the reviewed event policy so terminal signals are documented too.
 */
export const DEFAULT_EVENT_ROUTING: Record<string, string[]> = Object.fromEntries(
  Object.entries(EVENT_ROUTING_POLICY).map(([eventType, policy]) => [
    eventType,
    policy.subscribers,
  ]),
);

export function resolveSubscribers(
  eventType: string,
  explicit?: string[],
): string[] {
  if (explicit?.length) {
    return explicit;
  }
  return DEFAULT_EVENT_ROUTING[eventType] ?? [];
}
