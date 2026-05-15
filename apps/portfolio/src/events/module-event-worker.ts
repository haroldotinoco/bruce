import type { InterModuleEvent } from '@bruce/contracts';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';
import { handleStartupOpsPipelineCompleted } from '../services/inter-module.js';

export function startPortfolioModuleEventWorker(): void {
  createModuleEventWorker('portfolio', async (event: InterModuleEvent) => {
    try {
      await handleStartupOpsPipelineCompleted(event);
    } catch (e) {
      logger.error({ e, event_id: event.event_id }, '[portfolio] startup-ops.pipeline.completed failed');
      throw e;
    }
  }, { expectedEventTypes: ['startup-ops.pipeline.completed'] });
}
