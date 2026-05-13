import type { InterModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startBruceMemoryPipeline } from './pipeline.service.js';

function minimalLearningInput(ventureId: string): Record<string, unknown> {
  return {
    learning_record: {
      venture_id: ventureId,
      venture_name: 'Venture',
      source_module: 'portfolio',
      learning_type: 'operational_signal',
      outcome: 'success',
      narrative: 'Automated ingestion from portfolio pipeline.',
      quantitative_data: { conversion_rate: 0.08 },
      confidence: 70,
      applicability_tags: ['general'],
    },
  };
}

export async function handlePortfolioPipelineCompleted(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[bruce-memory] portfolio.pipeline.completed without venture_id');
    return;
  }
  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const redis = getRedisClient();
  const dedupe = await redis.get<boolean>(
    accountKey,
    'bruce-memory',
    'intermodule',
    event.event_id,
    'done'
  );
  if (dedupe) return;
  await redis.set(accountKey, 'bruce-memory', 'intermodule', event.event_id, 'done', true, 604800);

  await startBruceMemoryPipeline({
    accountId: accountKey,
    ventureId,
    agentInput: minimalLearningInput(ventureId),
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[bruce-memory] pipeline started from portfolio.pipeline.completed');
}
