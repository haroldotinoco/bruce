import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';
import { handlePortfolioPipelineCompleted } from '../services/inter-module.js';

export function startBruceMemoryModuleEventWorker(): void {
  createModuleEventWorker('bruce-memory', async (event: InterModuleEvent) => {
    try {
      await handlePortfolioPipelineCompleted(event);
    } catch (e) {
      logger.error({ e, event_id: event.event_id }, '[bruce-memory] portfolio.pipeline.completed failed');
      throw e;
    }
  }, { expectedEventTypes: ['portfolio.pipeline.completed'] });
}
