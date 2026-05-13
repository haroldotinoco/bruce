import { loadRepoEnv } from '@bruce/env';
loadRepoEnv();

import { serve } from '@hono/node-server';
import { logger } from '@bruce/logger';
import app from './app.js';
import { registerWeeklyOpportunitySchedule } from './temporal/schedule.js';
import { startWorker } from './temporal/worker.js';

const PORT = Number(process.env.PORT ?? 3002);

if (process.env.ENABLE_TEMPORAL_WORKER === 'true') {
  void startWorker().catch((error) => {
    logger.error({ error }, 'Temporal worker failed; HTTP server continues');
  });
}

void registerWeeklyOpportunitySchedule().catch((error) => {
  logger.error({ error }, 'Weekly opportunity schedule registration failed');
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    logger.info({ port: info.port, url: `http://localhost:${info.port}` }, 'Opportunity HTTP server');
  }
);
