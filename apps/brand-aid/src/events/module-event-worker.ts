import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';
import { handleVentureQualified } from '../services/inter-module.js';

export function startBrandAidModuleEventWorker(): void {
  createModuleEventWorker('brand-aid', async (event: InterModuleEvent) => {
    if (event.event_type !== 'venture.qualified') return;
    try {
      await handleVentureQualified(event);
    } catch (e) {
      logger.error({ e, event_id: event.event_id }, '[brand-aid] venture.qualified failed');
      throw e;
    }
  });
}
