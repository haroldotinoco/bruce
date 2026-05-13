import { loadRepoEnv } from '@bruce/env';
loadRepoEnv();

import { serve } from '@hono/node-server';
import { logger } from '@bruce/logger';
import app from './app.js';
import { startBrandAidModuleEventWorker } from './events/module-event-worker.js';
import { startWorker } from './temporal/worker.js';

const PORT = Number(process.env.PORT ?? 3004);

if (process.env.ENABLE_BULLMQ_WORKERS === 'true') {
  startBrandAidModuleEventWorker();
  logger.info({}, 'BullMQ worker (brand-aid)');
}

if (process.env.ENABLE_TEMPORAL_WORKER === 'true') {
  void startWorker().catch((e) => logger.error({ e }, 'Temporal worker failed'));
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
  logger.info({ port: info.port }, 'Brand-aid HTTP');
});
