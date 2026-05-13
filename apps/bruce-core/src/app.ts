import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { authMiddleware, correlationLogContextMiddleware, getAuth } from '@bruce/auth';
import { logger } from '@bruce/logger';
import { errorHandler } from './middleware/error-handler.js';
import { syncLogContextAccountMiddleware } from './middleware/logging.js';
import { bruceCoreOpenApi } from './openapi.js';
import { adminOpenRouterRoutes } from './routes/admin-openrouter.js';
import { adminRevenueRoutes } from './routes/admin-revenue.js';
import { metricsLlmRoutes } from './routes/metrics-llm.js';
import { billingRoutes } from './routes/billing.js';
import { jobRoutes } from './routes/jobs.js';
import { stripeWebhookRoutes } from './routes/stripe-webhook.js';
import { clerkWebhookRoutes } from './routes/webhooks.js';
import { ventureRoutes } from './routes/ventures.js';
import { workflowsRoutes } from './routes/workflows.js';

const app = new Hono();

function isPublicPath(path: string): boolean {
  return path === '/health' || path === '/doc' || path.startsWith('/webhooks');
}

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  })
);

app.use('*', correlationLogContextMiddleware({ module: 'bruce-core' }));
app.use('*', honoLogger((message) => logger.debug({ message }, 'HTTP request')));

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
);

app.get('/doc', (c) => c.json(bruceCoreOpenApi));

app.route('/webhooks', clerkWebhookRoutes);
app.route('/webhooks/stripe', stripeWebhookRoutes);

app.use('*', async (c, next) => {
  const path = c.req.path;
  if (isPublicPath(path)) {
    return next();
  }
  return authMiddleware()(c, next);
});

app.use('*', async (c, next) => {
  const path = c.req.path;
  if (isPublicPath(path)) {
    return next();
  }
  const auth = getAuth(c);
  c.set('accountId', auth.accountId);
  c.set('userId', auth.userId);
  c.set('orgSlug', auth.orgSlug);
  await next();
});

app.use('*', syncLogContextAccountMiddleware);

app.route('/ventures', ventureRoutes);
app.route('/jobs', jobRoutes);
app.route('/workflows', workflowsRoutes);
app.route('/billing', billingRoutes);
app.route('/admin/revenue', adminRevenueRoutes);
app.route('/admin/openrouter', adminOpenRouterRoutes);
app.route('/metrics/llm', metricsLlmRoutes);

app.onError(errorHandler);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

export default app;
