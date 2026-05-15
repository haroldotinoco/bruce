import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';
import { handleGtmPipelineCompleted } from '../services/inter-module.js';

export function startStartupOpsModuleEventWorker(): void {
  createModuleEventWorker('startup-ops', async (event: InterModuleEvent) => {
    try {
      await handleGtmPipelineCompleted(event);
    } catch (e) {
      logger.error({ e, event_id: event.event_id }, '[startup-ops] gtm.pipeline.completed failed');
      throw e;
    }
  }, { expectedEventTypes: ['gtm.pipeline.completed'] });
}
