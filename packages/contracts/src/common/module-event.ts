import { z } from 'zod';

export const ModuleEventSchema = z.object({
  type: z.string(),
  version: z.string().optional(),
  /** Clerk org id (org_…) or internal account key — not always a UUID */
  accountId: z.string().min(1),
  ventureId: z.string().uuid().optional(),
  sourceModule: z.string(),
  payload: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
  occurredAt: z.string().optional(),
});

export type ModuleEvent = z.infer<typeof ModuleEventSchema>;
