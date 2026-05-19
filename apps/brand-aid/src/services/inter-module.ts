import type { InterModuleEvent } from '@bruce/contracts';
import {
  buildBrandAidAgentInputFromVentureToBrandHandoff,
  resolveModuleHandoffEnvelope,
  validateVentureToBrandHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startBrandAidPipeline } from './pipeline.service.js';

export async function handleVentureQualified(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[brand-aid] venture.qualified without venture_id');
    return;
  }
  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const redis = getRedisClient();
  const dedupe = await redis.get<boolean>(
    accountKey,
    'brand-aid',
    'intermodule',
    event.event_id,
    'done'
  );
  if (dedupe) return;
  await redis.set(accountKey, 'brand-aid', 'intermodule', event.event_id, 'done', true, 604800);

  const envelope = resolveModuleHandoffEnvelope(event.payload as Record<string, unknown>, 'brand-aid');
  if (!envelope) {
    throw new Error('venture.qualified missing brand-aid handoff envelope');
  }
  const validation = validateVentureToBrandHandoff(envelope.payload);
  if (!validation.ok || !validation.normalized) {
    throw new Error(`venture-to-brand handoff invalid: ${validation.errors?.join('; ')}`);
  }
  const agentInput = buildBrandAidAgentInputFromVentureToBrandHandoff(validation.normalized);
  const projectNickname =
    typeof event.payload.project_nickname === 'string' ? event.payload.project_nickname : undefined;
  await startBrandAidPipeline({
    accountId: accountKey,
    ventureId,
    agentInput,
    correlationId: event.correlation_id,
    projectNickname,
  });
  logger.info({ venture_id: ventureId }, '[brand-aid] pipeline started from venture.qualified');
}
