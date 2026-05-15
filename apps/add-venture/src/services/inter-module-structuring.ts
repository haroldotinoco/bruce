import type { InterModuleEvent } from '@bruce/contracts';
import {
  handoffValidationFailedTotal,
  isHandoffStrictValidationEnabled,
  resolveModuleHandoffEnvelope,
  resolveOpportunityFromInterModulePayload,
  validateOpportunityToVentureHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startVentureStructuringWorkflow } from './structuring.service.js';

/**
 * Idempotent start from `opportunity.advanced` (BullMQ subscriber).
 */
type InterModuleDedupeState = {
  status: 'received' | 'started' | 'failed';
  event_id: string;
  received_at: string;
  updated_at: string;
  workflow_id?: string;
  error_message?: string;
};

export async function handleOpportunityAdvancedEvent(event: InterModuleEvent): Promise<void> {
  const ventureId = event.venture_id?.trim();
  if (!ventureId) {
    logger.warn({ event_id: event.event_id }, '[add-venture] opportunity.advanced without venture_id');
    return;
  }

  const accountKey =
    typeof event.payload.account_id === 'string' ? event.payload.account_id : ventureId;

  const payload = event.payload as Record<string, unknown>;
  const envelope = resolveModuleHandoffEnvelope(payload, 'add-venture');
  const opportunity = envelope ? envelope.payload : resolveOpportunityFromInterModulePayload(payload);
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
  const legacyDone = await redis.get<boolean>(
    accountKey,
    'add-venture',
    'intermodule',
    event.event_id,
    'done'
  );
  if (legacyDone) {
    logger.info({ event_id: event.event_id }, '[add-venture] duplicate event skipped (legacy done)');
    return;
  }

  const existingState = await redis.get<InterModuleDedupeState>(
    accountKey,
    'add-venture',
    'intermodule',
    event.event_id,
    'state',
  );
  if (existingState?.status === 'started') {
    logger.info(
      {
        event_id: event.event_id,
        workflow_id: existingState.workflow_id,
      },
      '[add-venture] duplicate event skipped after confirmed workflow start',
    );
    return;
  }

  const receivedAt = existingState?.received_at ?? new Date().toISOString();
  await redis.set(
    accountKey,
    'add-venture',
    'intermodule',
    event.event_id,
    'state',
    {
      status: 'received',
      event_id: event.event_id,
      received_at: receivedAt,
      updated_at: new Date().toISOString(),
    } satisfies InterModuleDedupeState,
    604800,
  );

  const opportunityId =
    typeof opportunity.opportunity_id === 'string' && opportunity.opportunity_id.length > 0
      ? opportunity.opportunity_id
      : crypto.randomUUID();

  const projectNickname =
    typeof payload.project_nickname === 'string' ? payload.project_nickname : undefined;

  try {
    const startResult = await startVentureStructuringWorkflow({
      accountId: accountKey,
      ventureId,
      opportunityId,
      opportunity,
      correlationId: event.correlation_id,
      projectNickname,
    });

    await redis.set(
      accountKey,
      'add-venture',
      'intermodule',
      event.event_id,
      'state',
      {
        status: 'started',
        event_id: event.event_id,
        received_at: receivedAt,
        updated_at: new Date().toISOString(),
        workflow_id: startResult.workflow_id,
      } satisfies InterModuleDedupeState,
      604800,
    );
    await redis.set(accountKey, 'add-venture', 'intermodule', event.event_id, 'done', true, 604800);
  } catch (error) {
    await redis.set(
      accountKey,
      'add-venture',
      'intermodule',
      event.event_id,
      'state',
      {
        status: 'failed',
        event_id: event.event_id,
        received_at: receivedAt,
        updated_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : String(error),
      } satisfies InterModuleDedupeState,
      604800,
    );
    throw error;
  }

  logger.info(
    { venture_id: ventureId, event_id: event.event_id, workflow: 'ventureAdditionWorkflow' },
    '[add-venture] started from opportunity.advanced'
  );
}
