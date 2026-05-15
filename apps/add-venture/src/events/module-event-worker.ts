import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';
import { handleOpportunityAdvancedEvent } from '../services/inter-module-structuring.js';

/**
 * Processes durable inter-module jobs for the add-venture module (e.g. opportunity.advanced).
 */
export function startAddVentureModuleEventWorker(): void {
  createModuleEventWorker('add-venture', async (event: InterModuleEvent) => {
    try {
      await handleOpportunityAdvancedEvent(event);
    } catch (e) {
      logger.error({ e, event_id: event.event_id }, '[add-venture] opportunity.advanced handler failed');
      throw e;
    }
  }, { expectedEventTypes: ['opportunity.advanced'] });
}
