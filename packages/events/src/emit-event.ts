import { randomUUID } from 'node:crypto';
import type { InterModuleEvent } from '@bruce/contracts';
import { InterModuleEventSchema } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getBruceQueueForSubscriber } from './bruce-queues.js';
import { eventEmittedTotal } from './metrics.js';
import { resolveSubscribers } from './routing.js';
import { getEventRoutingPolicy } from './routing-policy.js';

export async function emitEvent(
  eventType: string,
  module: string,
  payload: Record<string, unknown>,
  options?: {
    ventureId?: string;
    correlationId?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    subscribers?: string[];
    /** If true, validate and return without enqueuing (e.g. observability-only events). */
    skipQueue?: boolean;
    /** When no subscribers match, log a warning unless set to false. */
    warnWhenNoSubscribers?: boolean;
  },
): Promise<InterModuleEvent> {
  const subscribers = resolveSubscribers(eventType, options?.subscribers);
  const policy = getEventRoutingPolicy(eventType);

  const event: InterModuleEvent = {
    event_id: randomUUID(),
    event_type: eventType,
    module,
    venture_id: options?.ventureId,
    timestamp: new Date().toISOString(),
    severity: options?.severity ?? 'info',
    payload,
    correlation_id: options?.correlationId ?? randomUUID(),
    subscribers,
  };

  const validated = InterModuleEventSchema.parse(event);

  if (options?.skipQueue) {
    logger.info(
      {
        event_id: validated.event_id,
        event_type: validated.event_type,
        module: validated.module,
        correlation_id: validated.correlation_id,
      },
      'emitEvent: validated (skipQueue — not enqueued)',
    );
    return validated;
  }

  if (subscribers.length === 0) {
    const nonTerminal = policy?.kind !== 'terminal_signal' && policy?.kind !== 'telemetry';
    const ciLike = process.env.CI === 'true' || process.env.NODE_ENV !== 'production';
    const forceWarnForPolicyDrift = nonTerminal && ciLike;
    if (options?.warnWhenNoSubscribers !== false || forceWarnForPolicyDrift) {
      logger.warn(
        {
          event_type: eventType,
          module,
          event_id: validated.event_id,
          policy_kind: policy?.kind ?? 'undocumented',
        },
        'emitEvent: no subscribers resolved; nothing enqueued',
      );
    }
    return validated;
  }

  const priority = validated.severity === 'critical' ? 1 : 10;
  const jobName = `${validated.module}:${validated.event_type}`;

  for (const subscriber of subscribers) {
    const q = getBruceQueueForSubscriber(subscriber);
    await q.add(
      jobName,
      { envelope: validated, subscriber },
      { priority },
    );
    eventEmittedTotal.labels(validated.event_type, validated.module).inc();
  }

  logger.info(
    {
      event_id: validated.event_id,
      event_type: validated.event_type,
      module: validated.module,
      correlation_id: validated.correlation_id,
      subscribers,
    },
    'Inter-module event emitted (BullMQ)',
  );

  return validated;
}
