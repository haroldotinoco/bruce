import { loadRepoEnv } from '@bruce/env';
loadRepoEnv();

import { serve } from '@hono/node-server';
import { logger } from '@bruce/logger';
import { buildApp } from './app.js';

const PORT = Number(process.env.API_GATEWAY_PORT ?? process.env.PORT ?? 3010);
const app = buildApp();

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    logger.info(
      { port: info.port, url: `http://localhost:${info.port}` },
      'API gateway (proxy to module services)'
    );
  }
);
