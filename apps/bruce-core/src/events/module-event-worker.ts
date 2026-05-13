import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';

export function startBruceCoreModuleEventWorker(): void {
  createModuleEventWorker('bruce-core', async (event: InterModuleEvent) => {
    if (event.event_type !== 'opportunity.advanced') {
      return;
    }

    logger.info(
      {
        correlation_id: event.correlation_id,
        event_id: event.event_id,
        venture_id: event.venture_id,
      },
      '[bruce-core] opportunity.advanced received (stub)',
    );
  });
}
