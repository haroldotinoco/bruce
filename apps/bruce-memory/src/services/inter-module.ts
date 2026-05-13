import type { InterModuleEvent } from '@bruce/contracts';
import { resolveModuleHandoffEnvelope } from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startBruceMemoryPipeline } from './pipeline.service.js';

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

  const envelope = resolveModuleHandoffEnvelope(event.payload as Record<string, unknown>, 'bruce-memory');
  if (!envelope) {
    throw new Error('portfolio.pipeline.completed missing bruce-memory handoff envelope');
  }
  await startBruceMemoryPipeline({
    accountId: accountKey,
    ventureId,
    agentInput: envelope.payload,
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[bruce-memory] pipeline started from portfolio.pipeline.completed');
}
