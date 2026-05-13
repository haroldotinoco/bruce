import { Counter } from 'prom-client';

export const handoffValidationFailedTotal = new Counter({
  name: 'bruce_handoff_validation_failed_total',
  help: 'Opportunity→venture handoff schema validation failures',
  labelNames: ['stage'] as const,
});

export const handoffPayloadFallbackTotal = new Counter({
  name: 'bruce_handoff_payload_fallback_total',
  help: 'Fallback payload resolution used for opportunity→venture handoffs',
  labelNames: ['reason'] as const,
});

export const handoffPayloadIntegrityViolationTotal = new Counter({
  name: 'bruce_handoff_payload_integrity_violation_total',
  help: 'Missing or malformed durable handoff payloads',
  labelNames: ['reason'] as const,
});
