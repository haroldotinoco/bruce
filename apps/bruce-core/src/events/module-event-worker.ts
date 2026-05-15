import type { InterModuleEvent } from '@bruce/contracts';
import {
  resolveModuleHandoffEnvelope,
  validatePortfolioToBruceCoreHandoff,
} from '@bruce/handoff';
import { createModuleEventWorker } from '@bruce/events';
import { logger } from '@bruce/logger';

export function startBruceCoreModuleEventWorker(): void {
  createModuleEventWorker('bruce-core', async (event: InterModuleEvent) => {
    const payload = event.payload as Record<string, unknown>;
    const envelope = resolveModuleHandoffEnvelope(payload, 'bruce-core');
    if (!envelope) {
      throw new Error('portfolio.pipeline.completed missing bruce-core handoff envelope');
    }
    const validation = validatePortfolioToBruceCoreHandoff(envelope.payload);
    if (!validation.ok) {
      throw new Error(`portfolio-to-bruce-core handoff invalid: ${validation.errors?.join('; ')}`);
    }

    logger.info(
      {
        correlation_id: event.correlation_id,
        event_id: event.event_id,
        venture_id: event.venture_id,
        decision: validation.normalized?.decision,
        confidence_score: validation.normalized?.confidence_score,
      },
      '[bruce-core] portfolio decision handoff received',
    );
  }, { expectedEventTypes: ['portfolio.pipeline.completed'] });
}
