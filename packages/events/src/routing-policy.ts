export type EventRoutingKind = 'durable_trigger' | 'terminal_signal' | 'telemetry';
export type EventRoutingClassification =
  | 'durable_downstream_trigger'
  | 'terminal_lifecycle_signal'
  | 'telemetry_only'
  | 'deprecated_or_stub';

export interface EventRoutingPolicy {
  kind: EventRoutingKind;
  classification: EventRoutingClassification;
  subscribers: string[];
  description: string;
}

export const EVENT_ROUTING_POLICY: Record<string, EventRoutingPolicy> = {
  'opportunity.advanced': {
    kind: 'durable_trigger',
    classification: 'durable_downstream_trigger',
    subscribers: ['add-venture'],
    description: 'Opportunity screening handoff that starts Add-Venture structuring.',
  },
  'venture.qualified': {
    kind: 'durable_trigger',
    classification: 'durable_downstream_trigger',
    subscribers: ['brand-aid', 'builder'],
    description: 'Qualified venture handoff that starts Brand-Aid and Builder in parallel.',
  },
  'brand-aid.pipeline.completed': {
    kind: 'terminal_signal',
    classification: 'terminal_lifecycle_signal',
    subscribers: [],
    description: 'Brand-Aid completion marker; Builder is the current GTM prerequisite.',
  },
  'builder.pipeline.completed': {
    kind: 'durable_trigger',
    classification: 'durable_downstream_trigger',
    subscribers: ['gtm'],
    description: 'Builder output handoff that starts GTM planning.',
  },
  'gtm.pipeline.completed': {
    kind: 'durable_trigger',
    classification: 'durable_downstream_trigger',
    subscribers: ['startup-ops'],
    description: 'GTM launch plan handoff that starts operational monitoring.',
  },
  'startup-ops.pipeline.completed': {
    kind: 'durable_trigger',
    classification: 'durable_downstream_trigger',
    subscribers: ['portfolio'],
    description: 'Operational health handoff that starts portfolio analysis.',
  },
  'portfolio.pipeline.completed': {
    kind: 'durable_trigger',
    classification: 'durable_downstream_trigger',
    subscribers: ['bruce-memory', 'bruce-core'],
    description: 'Portfolio decision handoff for memory ingestion and Bruce-Core governance.',
  },
  'bruce-memory.pipeline.completed': {
    kind: 'terminal_signal',
    classification: 'terminal_lifecycle_signal',
    subscribers: [],
    description: 'Bruce-Memory ingestion completion marker; no downstream durable trigger.',
  },
  'bruce-core.venture.created': {
    kind: 'terminal_signal',
    classification: 'terminal_lifecycle_signal',
    subscribers: [],
    description: 'Bruce-Core venture creation marker; no default downstream queue subscriber.',
  },
};

export function getEventRoutingPolicy(eventType: string): EventRoutingPolicy | undefined {
  return EVENT_ROUTING_POLICY[eventType];
}

export function isTerminalEvent(eventType: string): boolean {
  return getEventRoutingPolicy(eventType)?.kind === 'terminal_signal';
}

export function isDurableDownstreamTrigger(eventType: string): boolean {
  return getEventRoutingPolicy(eventType)?.classification === 'durable_downstream_trigger';
}
