import type { InterModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startBrandAidPipeline } from './pipeline.service.js';

function defaultMarketInputFromQualification(payload: Record<string, unknown>): Record<string, unknown> {
  const out = payload.output;
  const title =
    typeof out === 'object' && out !== null && typeof (out as { title?: string }).title === 'string'
      ? (out as { title: string }).title
      : 'Qualified venture';
  return {
    venture_hypothesis: `${title} — brand positioning research (from venture.qualified)`,
    competitors: [
      { name: 'Competitor A', website: 'example.com', category: 'direct' },
      { name: 'Competitor B', website: 'example.org', category: 'adjacent' },
    ],
    customer_segment: 'Early-stage B2B buyers',
    research_focus: ['brand messaging', 'positioning'],
    geographic_scope: 'global',
    timeframe: 'last_12_months',
  };
}

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

  const agentInput = defaultMarketInputFromQualification(event.payload);
  await startBrandAidPipeline({
    accountId: accountKey,
    ventureId,
    agentInput,
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[brand-aid] pipeline started from venture.qualified');
}
