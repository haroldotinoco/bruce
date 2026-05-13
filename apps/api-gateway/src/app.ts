import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from '@bruce/logger';

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:3000',
  'http://localhost:5173',
];

function parseOrigins(raw: string | undefined): string[] | '*' {
  if (!raw) return DEFAULT_DEV_ORIGINS;
  const trimmed = raw.trim();
  if (trimmed === '*' || trimmed === '') return '*';
  return trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const MODULE_BASES: Record<string, string> = {
  'bruce-core': process.env.BRUCE_GATEWAY_BRUCE_CORE ?? 'http://localhost:3000',
  opportunity: process.env.BRUCE_GATEWAY_OPPORTUNITY ?? 'http://localhost:3002',
  'add-venture': process.env.BRUCE_GATEWAY_ADD_VENTURE ?? 'http://localhost:3003',
  'brand-aid': process.env.BRUCE_GATEWAY_BRAND_AID ?? 'http://localhost:3004',
  builder: process.env.BRUCE_GATEWAY_BUILDER ?? 'http://localhost:3005',
  gtm: process.env.BRUCE_GATEWAY_GTM ?? 'http://localhost:3006',
  'startup-ops': process.env.BRUCE_GATEWAY_STARTUP_OPS ?? 'http://localhost:3007',
  portfolio: process.env.BRUCE_GATEWAY_PORTFOLIO ?? 'http://localhost:3008',
  'bruce-memory': process.env.BRUCE_GATEWAY_BRUCE_MEMORY ?? 'http://localhost:3009',
};

export function buildApp(): Hono {
  const app = new Hono();

  const allowedOrigins = parseOrigins(process.env.BRUCE_GATEWAY_CORS_ORIGINS);
  app.use(
    '*',
    cors({
      origin: (origin) => {
        if (!origin) return origin;
        if (allowedOrigins === '*') return origin;
        return allowedOrigins.includes(origin) ? origin : null;
      },
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'X-Request-Id'],
      exposeHeaders: ['X-Request-Id'],
      credentials: false,
      maxAge: 600,
    })
  );

  app.get('/health', (c) =>
    c.json({
      status: 'ok',
      gateway: true,
      routes: Object.keys(MODULE_BASES),
      pattern: 'ALL /services/:module/* → upstream module',
    })
  );

  app.all('/services/:module/*', async (c) => {
    const mod = c.req.param('module');
    const base = MODULE_BASES[mod];
    if (!base) {
      return c.json({ error: `Unknown module: ${mod}`, known: Object.keys(MODULE_BASES) }, 404);
    }

    const prefix = `/services/${mod}`;
    const rest = c.req.path.slice(prefix.length) || '/';
    const target = new URL(rest, base.endsWith('/') ? base : `${base}/`);

    const incoming = new URL(c.req.url);
    target.search = incoming.search;

    const passHeaders = new Headers();
    const hop = ['host', 'connection', 'content-length'];
    c.req.raw.headers.forEach((v, k) => {
      if (!hop.includes(k.toLowerCase())) passHeaders.set(k, v);
    });

    const body =
      c.req.method === 'GET' || c.req.method === 'HEAD' ? undefined : await c.req.arrayBuffer();

    logger.debug({ module: mod, target: target.toString() }, 'api-gateway proxy');

    let upstream: Response;
    try {
      upstream = await fetch(target, {
        method: c.req.method,
        headers: passHeaders,
        body: body && body.byteLength > 0 ? body : undefined,
        redirect: 'manual',
      });
    } catch (e) {
      logger.error({ e, mod, target: target.toString() }, 'Upstream fetch failed');
      return c.json({ error: 'Upstream unavailable', module: mod }, 502);
    }

    const outHeaders = new Headers(upstream.headers);
    for (const h of [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials',
      'access-control-expose-headers',
      'access-control-max-age',
    ]) {
      outHeaders.delete(h);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: outHeaders,
    });
  });

  app.notFound((c) => c.json({ error: 'Not Found', hint: 'GET /health or ALL /services/:module/*' }, 404));
  return app;
}
