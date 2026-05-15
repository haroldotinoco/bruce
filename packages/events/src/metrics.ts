import { Counter, Histogram, Registry } from 'prom-client';

const registry = new Registry();

export const eventEmittedTotal = new Counter({
  name: 'bruce_events_emitted_total',
  help: 'Total inter-module events emitted',
  labelNames: ['event_type', 'module'],
  registers: [registry],
});

export const eventProcessedTotal = new Counter({
  name: 'bruce_events_processed_total',
  help: 'Total inter-module events processed by workers',
  labelNames: ['event_type', 'status'],
  registers: [registry],
});

export const eventProcessingSeconds = new Histogram({
  name: 'bruce_events_processing_seconds',
  help: 'Event handler duration in seconds',
  labelNames: ['event_type'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
  registers: [registry],
});

export const eventUnexpectedTotal = new Counter({
  name: 'bruce_events_unexpected_total',
  help: 'Total events delivered to a module worker that did not expect the event type',
  labelNames: ['event_type', 'subscriber'],
  registers: [registry],
});

export function getMetricsRegistry(): Registry {
  return registry;
}
