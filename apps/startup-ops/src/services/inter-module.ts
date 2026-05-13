import type { InterModuleEvent } from '@bruce/contracts';
import {
  buildStartupOpsAgentInputFromGtmToStartupOpsHandoff,
  resolveModuleHandoffEnvelope,
  validateGtmToStartupOpsHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startStartupOpsPipeline } from './pipeline.service.js';

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

  const envelope = resolveModuleHandoffEnvelope(event.payload as Record<string, unknown>, 'startup-ops');
  if (!envelope) {
    throw new Error('gtm.pipeline.completed missing startup-ops handoff envelope');
  }
  const validation = validateGtmToStartupOpsHandoff(envelope.payload);
  if (!validation.ok || !validation.normalized) {
    throw new Error(`gtm-to-startup-ops handoff invalid: ${validation.errors?.join('; ')}`);
  }
  await startStartupOpsPipeline({
    accountId: accountKey,
    ventureId,
    agentInput: buildStartupOpsAgentInputFromGtmToStartupOpsHandoff(validation.normalized),
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[startup-ops] pipeline started from gtm.pipeline.completed');
}
