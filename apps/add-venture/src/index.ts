import { loadRepoEnv } from '@bruce/env';
loadRepoEnv();

import { serve } from '@hono/node-server';
import { logger } from '@bruce/logger';
import app from './app.js';
import { startAddVentureModuleEventWorker } from './events/module-event-worker.js';
import { startWorker } from './temporal/worker.js';

const PORT = Number(process.env.PORT ?? 3003);

if (process.env.ENABLE_BULLMQ_WORKERS === 'true') {
  startAddVentureModuleEventWorker();
  logger.info({}, 'BullMQ module worker started (add-venture)');
}

if (process.env.ENABLE_TEMPORAL_WORKER === 'true') {
  void startWorker().catch((error) => {
    logger.error({ error }, 'Temporal worker failed; HTTP server continues');
  });
}

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    logger.info({ port: info.port, url: `http://localhost:${info.port}` }, 'Add-venture HTTP server');
  }
);
