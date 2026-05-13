/**
 * Default fan-out routing when `emitEvent` is called without explicit `subscribers`.
 * Keys use dotted event names (e.g. `opportunity.advanced`).
 */
export const DEFAULT_EVENT_ROUTING: Record<string, string[]> = {
  'opportunity.advanced': ['add-venture'],
  'venture.qualified': ['brand-aid', 'builder'],
  'brand-aid.pipeline.completed': [],
  'builder.pipeline.completed': ['gtm'],
  'gtm.pipeline.completed': ['startup-ops'],
  'startup-ops.pipeline.completed': ['portfolio'],
  'portfolio.pipeline.completed': ['bruce-memory', 'bruce-core'],
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
