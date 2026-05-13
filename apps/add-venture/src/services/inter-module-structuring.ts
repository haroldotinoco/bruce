import type { InterModuleEvent } from '@bruce/contracts';
import {
  handoffValidationFailedTotal,
  isHandoffStrictValidationEnabled,
  resolveOpportunityFromInterModulePayload,
  validateOpportunityToVentureHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startVentureStructuringWorkflow } from './structuring.service.js';

/**
 * Idempotent start from `opportunity.advanced` (BullMQ subscriber).
 */
export async function handleOpportunityAdvancedEvent(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[add-venture] opportunity.advanced without venture_id');
    return;
  }

  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const payload = event.payload as Record<string, unknown>;
  const opportunity = resolveOpportunityFromInterModulePayload(payload);
  const validation = validateOpportunityToVentureHandoff(opportunity);
  if (!validation.ok) {
    handoffValidationFailedTotal.labels('add_venture_consume').inc();
    logger.warn(
      { errors: validation.errors, event_id: event.event_id },
      '[add-venture] Handoff validation failed (continuing unless strict mode)',
    );
    if (isHandoffStrictValidationEnabled()) {
      throw new Error(`venture_handoff invalid: ${validation.errors?.join('; ')}`);
    }
  }

  const redis = getRedisClient();
  const dedupe = await redis.get<boolean>(
    accountKey,
    'add-venture',
    'intermodule',
    event.event_id,
    'done'
  );
  if (dedupe) {
    logger.info({ event_id: event.event_id }, '[add-venture] duplicate event skipped');
    return;
  }
  await redis.set(accountKey, 'add-venture', 'intermodule', event.event_id, 'done', true, 604800);

  const opportunityId =
    typeof opportunity.opportunity_id === 'string' && opportunity.opportunity_id.length > 0
      ? opportunity.opportunity_id
      : crypto.randomUUID();

  const projectNickname =
    typeof payload.project_nickname === 'string' ? payload.project_nickname : undefined;

  await startVentureStructuringWorkflow({
    accountId: accountKey,
    ventureId,
    opportunityId,
    opportunity,
    correlationId: event.correlation_id,
    projectNickname,
  });

  logger.info(
    { venture_id: ventureId, event_id: event.event_id, workflow: 'ventureAdditionWorkflow' },
    '[add-venture] started from opportunity.advanced'
  );
}
