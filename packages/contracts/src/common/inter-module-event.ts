import { z } from 'zod';

/**
 * Durable inter-module event envelope (BullMQ / Phase 6).
 * Snake_case fields match `modules/contracts/module-event.schema.json` and event-flow docs.
 */
export const InterModuleEventSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  module: z.string(),
  venture_id: z.string().optional(),
  timestamp: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  payload: z.record(z.unknown()),
  correlation_id: z.string(),
  subscribers: z.array(z.string()),
});

export type InterModuleEvent = z.infer<typeof InterModuleEventSchema>;
