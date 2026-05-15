export type EventRoutingKind = 'durable_trigger' | 'terminal_signal' | 'telemetry';

export interface EventRoutingPolicy {
  kind: EventRoutingKind;
  subscribers: string[];
  description: string;
}

export const EVENT_ROUTING_POLICY: Record<string, EventRoutingPolicy> = {
  'opportunity.advanced': {
    kind: 'durable_trigger',
    subscribers: ['add-venture'],
    description: 'Opportunity screening handoff that starts Add-Venture structuring.',
  },
  'venture.qualified': {
    kind: 'durable_trigger',
    subscribers: ['brand-aid', 'builder'],
    description: 'Qualified venture handoff that starts Brand-Aid and Builder in parallel.',
  },
  'brand-aid.pipeline.completed': {
    kind: 'terminal_signal',
    subscribers: [],
    description: 'Brand-Aid completion marker; Builder is the current GTM prerequisite.',
  },
  'builder.pipeline.completed': {
    kind: 'durable_trigger',
    subscribers: ['gtm'],
    description: 'Builder output handoff that starts GTM planning.',
  },
  'gtm.pipeline.completed': {
    kind: 'durable_trigger',
    subscribers: ['startup-ops'],
    description: 'GTM launch plan handoff that starts operational monitoring.',
  },
  'startup-ops.pipeline.completed': {
    kind: 'durable_trigger',
    subscribers: ['portfolio'],
    description: 'Operational health handoff that starts portfolio analysis.',
  },
  'portfolio.pipeline.completed': {
    kind: 'durable_trigger',
    subscribers: ['bruce-memory', 'bruce-core'],
    description: 'Portfolio decision handoff for memory ingestion and Bruce-Core governance.',
  },
  'bruce-memory.pipeline.completed': {
    kind: 'terminal_signal',
    subscribers: [],
    description: 'Bruce-Memory ingestion completion marker; no downstream durable trigger.',
  },
};

export function getEventRoutingPolicy(eventType: string): EventRoutingPolicy | undefined {
  return EVENT_ROUTING_POLICY[eventType];
}

export function isTerminalEvent(eventType: string): boolean {
  return getEventRoutingPolicy(eventType)?.kind === 'terminal_signal';
}
