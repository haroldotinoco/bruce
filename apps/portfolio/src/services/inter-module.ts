import type { InterModuleEvent } from '@bruce/contracts';
import {
  buildPortfolioAgentInputFromStartupOpsToPortfolioHandoff,
  resolveModuleHandoffEnvelope,
  validateStartupOpsToPortfolioHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startPortfolioPipeline } from './pipeline.service.js';

export async function handleStartupOpsPipelineCompleted(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[portfolio] startup-ops.pipeline.completed without venture_id');
    return;
  }
  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const redis = getRedisClient();
  const dedupe = await redis.get<boolean>(
    accountKey,
    'portfolio',
    'intermodule',
    event.event_id,
    'done'
  );
  if (dedupe) return;
  await redis.set(accountKey, 'portfolio', 'intermodule', event.event_id, 'done', true, 604800);

  const envelope = resolveModuleHandoffEnvelope(event.payload as Record<string, unknown>, 'portfolio');
  if (!envelope) {
    throw new Error('startup-ops.pipeline.completed missing portfolio handoff envelope');
  }
  const validation = validateStartupOpsToPortfolioHandoff(envelope.payload);
  if (!validation.ok || !validation.normalized) {
    throw new Error(`startup-ops-to-portfolio handoff invalid: ${validation.errors?.join('; ')}`);
  }
  await startPortfolioPipeline({
    accountId: accountKey,
    ventureId,
    agentInput: buildPortfolioAgentInputFromStartupOpsToPortfolioHandoff(validation.normalized),
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[portfolio] pipeline started from startup-ops.pipeline.completed');
}
