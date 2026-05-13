import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { authMiddleware, correlationLogContextMiddleware, getAuth } from '@bruce/auth';
import { logger } from '@bruce/logger';
import { errorHandler } from './middleware/error-handler.js';
import { syncLogContextAccountMiddleware } from './middleware/logging.js';
import { addVentureOpenApi } from './openapi.js';
import { dossierRoutes } from './routes/dossiers.js';
import { jobRoutes } from './routes/jobs.js';
import { structuringRoutes } from './routes/structuring.js';
import { workflowsRoutes } from './routes/workflows.js';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  })
);

app.use('*', correlationLogContextMiddleware({ module: 'add-venture' }));
app.use('*', honoLogger((message) => logger.debug({ message }, 'HTTP request')));

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
);

app.get('/doc', (c) => c.json(addVentureOpenApi));

app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path === '/health' || path === '/doc') {
    return next();
  }
  return authMiddleware()(c, next);
});

app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path === '/health' || path === '/doc') {
    return next();
  }
  const auth = getAuth(c);
  c.set('accountId', auth.accountId);
  c.set('userId', auth.userId);
  c.set('orgSlug', auth.orgSlug);
  await next();
});

app.use('*', syncLogContextAccountMiddleware);

app.route('/structuring', structuringRoutes);
app.route('/dossiers', dossierRoutes);
app.route('/jobs', jobRoutes);
app.route('/workflows', workflowsRoutes);

app.onError(errorHandler);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

export default app;
