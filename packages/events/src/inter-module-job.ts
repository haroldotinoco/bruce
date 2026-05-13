import { InterModuleEventSchema } from '@bruce/contracts';
import { z } from 'zod';

/** Payload stored on each BullMQ job (one job per subscriber queue). */
export const InterModuleJobDataSchema = z.object({
  envelope: InterModuleEventSchema,
  subscriber: z.string(),
});

export type InterModuleJobData = z.infer<typeof InterModuleJobDataSchema>;
