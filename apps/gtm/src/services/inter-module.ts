import type { InterModuleEvent } from '@bruce/contracts';
import {
  buildGtmAgentInputFromBuilderToGtmHandoff,
  resolveModuleHandoffEnvelope,
  validateBuilderToGtmHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startGtmPipeline } from './pipeline.service.js';

export async function handleBuilderPipelineCompleted(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[gtm] builder.pipeline.completed without venture_id');
    return;
  }
  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const redis = getRedisClient();
  const dedupe = await redis.get<boolean>(
    accountKey,
    'gtm',
    'intermodule',
    event.event_id,
    'done'
  );
  if (dedupe) return;
  await redis.set(accountKey, 'gtm', 'intermodule', event.event_id, 'done', true, 604800);

  const envelope = resolveModuleHandoffEnvelope(event.payload as Record<string, unknown>, 'gtm');
  if (!envelope) {
    throw new Error('builder.pipeline.completed missing gtm handoff envelope');
  }
  const validation = validateBuilderToGtmHandoff(envelope.payload);
  if (!validation.ok || !validation.normalized) {
    throw new Error(`builder-to-gtm handoff invalid: ${validation.errors?.join('; ')}`);
  }
  const agentInput = buildGtmAgentInputFromBuilderToGtmHandoff(validation.normalized);
  await startGtmPipeline({
    accountId: accountKey,
    ventureId,
    agentInput,
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[gtm] pipeline started from builder.pipeline.completed');
}
