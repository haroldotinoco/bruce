/**
 * Default fan-out routing when `emitEvent` is called without explicit `subscribers`.
 * Keys use dotted event names (e.g. `opportunity.advanced`).
 */
export const DEFAULT_EVENT_ROUTING: Record<string, string[]> = {
  'opportunity.advanced': ['add-venture', 'bruce-core'],
  'venture.qualified': ['brand-aid', 'builder'],
  'builder.pipeline.completed': ['gtm'],
  'gtm.pipeline.completed': ['startup-ops'],
  'startup-ops.pipeline.completed': ['portfolio'],
  'portfolio.pipeline.completed': ['bruce-memory'],
};

export function resolveSubscribers(
  eventType: string,
  explicit?: string[],
): string[] {
  if (explicit?.length) {
    return explicit;
  }
  return DEFAULT_EVENT_ROUTING[eventType] ?? [];
}
