import type { InterModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';
import { startPortfolioPipeline } from './pipeline.service.js';

function minimalPortfolioInput(ventureId: string): Record<string, unknown> {
  return {
    review_cycle_id: `cycle-${Date.now()}`,
    review_timestamp: new Date().toISOString(),
    ventures: [
      {
        venture_id: ventureId,
        name: 'Venture',
        status: 'active',
        weeks_since_launch: 4,
        health_report: {
          report_date: new Date().toISOString().slice(0, 10),
          metrics: {
            traction: {
              mrr: 0,
              arr: 0,
              monthly_growth_rate: 0,
              active_users: 0,
              user_growth_rate: 0,
              conversion_rate: 0,
              nps: 0,
            },
            financial: {
              runway_months: 12,
              monthly_burn_rate: 0,
              cash_position: 0,
              cac: 0,
              ltv: 0,
              cac_ltv_ratio: 0,
            },
            team: {
              headcount: 1,
              headcount_planned: 2,
              key_hires_filled: 0,
              key_hires_open: 0,
              team_velocity: 'forming',
            },
          },
          red_flags: [],
        },
      },
    ],
    portfolio_context: {
      total_ventures: 1,
      active_ventures: 1,
      dry_powder_mm: 0,
    },
  };
}

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

  await startPortfolioPipeline({
    accountId: accountKey,
    ventureId,
    agentInput: minimalPortfolioInput(ventureId),
    correlationId: event.correlation_id,
  });
  logger.info({ venture_id: ventureId }, '[portfolio] pipeline started from startup-ops.pipeline.completed');
}
