import type { InterModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startBuilderPipeline } from './pipeline.service.js';

/** Minimal valid-shaped input for solution-architect when triggered from venture.qualified */
function defaultBuilderInputFromQualification(_payload: Record<string, unknown>): Record<string, unknown> {
  return {
    functional_spec: {
      core_features: [
        { feature_id: 'FT-001', name: 'Core API', description: 'REST API for the product' },
      ],
      integrations: [],
      non_functional_requirements: { uptime_sla: '99%', response_time_p99: '800ms', data_retention: '1 year' },
    },
    bdd_spec: { features: [{ feature_name: 'Smoke', scenario_count: 1 }] },
    tech_stack_requirements: {
      backend_preference: 'Node.js',
      database_preference: 'PostgreSQL',
      cloud_provider: 'AWS',
    },
    scalability_requirements: {
      initial_users: 10,
      growth_forecast_months: 6,
      peak_concurrent_users: 100,
    },
    compliance_requirements: [],
  };
}

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

  const agentInput = defaultBuilderInputFromQualification(event.payload);
  await startBuilderPipeline({
    accountId: accountKey,
    ventureId,
    agentInput,
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[builder] pipeline started from venture.qualified');
}
