import type { InterModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startGtmPipeline } from './pipeline.service.js';

/** Minimal channel-strategist payload when triggered after builder completes */
function defaultGtmInputFromBuilder(_payload: Record<string, unknown>): Record<string, unknown> {
  return {
    product: {
      name: 'VentureProduct',
      category: 'b2b-saas',
      value_proposition: 'Ship faster with BruceAI',
      competitive_positioning: 'Integrated venture stack',
      price_point_usd: 12000,
    },
    target_audience: {
      primary_persona: 'Technical founder',
      secondary_personas: ['Product lead'],
      geography: ['US', 'EU'],
      company_size: { min_headcount: 10, max_headcount: 500 },
      media_consumption: ['LinkedIn', 'Twitter'],
      psychographics: 'Early adopters',
    },
    resources: {
      monthly_budget_usd: 5000,
      team_size: 1,
      existing_capabilities: ['content'],
      founder_network: 'moderate',
    },
    market_context: {
      competitors: [{ name: 'Generic SaaS', estimated_active_channels: ['linkedin', 'content'] }],
      market_trends: ['AI adoption'],
      time_to_revenue_days: 60,
    },
    goals: {
      target_mqls_per_month: 10,
      target_signups_per_month: 20,
      timeline_weeks: 6,
    },
  };
}

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

  const agentInput = defaultGtmInputFromBuilder(event.payload);
  await startGtmPipeline({
    accountId: accountKey,
    ventureId,
    agentInput,
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[gtm] pipeline started from builder.pipeline.completed');
}
