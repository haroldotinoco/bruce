import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';
import { handleBuilderPipelineCompleted } from '../services/inter-module.js';

export function startGtmModuleEventWorker(): void {
  createModuleEventWorker('gtm', async (event: InterModuleEvent) => {
    try {
      await handleBuilderPipelineCompleted(event);
    } catch (e) {
      logger.error({ e, event_id: event.event_id }, '[gtm] builder.pipeline.completed failed');
      throw e;
    }
  }, { expectedEventTypes: ['builder.pipeline.completed'] });
}
