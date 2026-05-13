import type { InterModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startStartupOpsPipeline } from './pipeline.service.js';

function defaultMetricsInput(_payload: Record<string, unknown>, ventureId: string): Record<string, unknown> {
  return {
    venture_id: ventureId,
    ingestion_config: {
      sources: ['stripe'],
      time_range: '24h',
      include_historical_comparison: false,
      force_refresh: false,
    },
    stage: 'early',
  };
}

export async function handleGtmPipelineCompleted(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[startup-ops] gtm.pipeline.completed without venture_id');
    return;
  }
  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const redis = getRedisClient();
  const dedupe = await redis.get<boolean>(
    accountKey,
    'startup-ops',
    'intermodule',
    event.event_id,
    'done'
  );
  if (dedupe) return;
  await redis.set(accountKey, 'startup-ops', 'intermodule', event.event_id, 'done', true, 604800);

  await startStartupOpsPipeline({
    accountId: accountKey,
    ventureId,
    agentInput: defaultMetricsInput(event.payload, ventureId),
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[startup-ops] pipeline started from gtm.pipeline.completed');
}
