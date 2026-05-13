import type { InterModuleEvent } from '@bruce/contracts';
import {
  buildBuilderAgentInputFromVentureToBuilderHandoff,
  resolveModuleHandoffEnvelope,
  validateVentureToBuilderHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startBuilderPipeline } from './pipeline.service.js';

export async function handleVentureQualified(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[builder] venture.qualified without venture_id');
    return;
  }
  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const redis = getRedisClient();
  const dedupe = await redis.get<boolean>(
    accountKey,
    'builder',
    'intermodule',
    event.event_id,
    'done'
  );
  if (dedupe) return;
  await redis.set(accountKey, 'builder', 'intermodule', event.event_id, 'done', true, 604800);

  const envelope = resolveModuleHandoffEnvelope(event.payload as Record<string, unknown>, 'builder');
  if (!envelope) {
    throw new Error('venture.qualified missing builder handoff envelope');
  }
  const validation = validateVentureToBuilderHandoff(envelope.payload);
  if (!validation.ok || !validation.normalized) {
    throw new Error(`venture-to-builder handoff invalid: ${validation.errors?.join('; ')}`);
  }
  const agentInput = buildBuilderAgentInputFromVentureToBuilderHandoff(validation.normalized);
  await startBuilderPipeline({
    accountId: accountKey,
    ventureId,
    agentInput,
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[builder] pipeline started from venture.qualified');
}
