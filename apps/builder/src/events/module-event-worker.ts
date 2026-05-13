import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';
import { handleVentureQualified } from '../services/inter-module.js';

export function startBuilderModuleEventWorker(): void {
  createModuleEventWorker('builder', async (event: InterModuleEvent) => {
    if (event.event_type !== 'venture.qualified') return;
    try {
      await handleVentureQualified(event);
    } catch (e) {
      logger.error({ e, event_id: event.event_id }, '[builder] venture.qualified failed');
      throw e;
    }
  });
}
