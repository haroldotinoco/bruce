# Fase 4 — Camada HTTP (APIs dos Módulos)

**Status:** Não iniciado  
**Prioridade:** Alta (completa a stack executável)  
**Duração estimada:** 3–5 dias por módulo, ~2 semanas total  
**Responsável:** Backend / API Engineers

---

## Visão Geral

Cada módulo BruceAI precisa expor uma HTTP API que:
1. Autentica requisições via Clerk JWT
2. Define contexto RLS (Row-Level Security) por conta
3. Valida entrada contra schemas
4. Executa workflows via Temporal ou queries diretas
5. Retorna respostas tipadas

A API é definida em `modules/{module}/saas/api-contract.yaml` (OpenAPI). Este documento descreve como implementar cada módulo em TypeScript + Hono.

---

## 1. Stack HTTP: Hono

**Por que Hono?**
- Ultra-fast (competindo com Fastify)
- TypeScript-first
- Middleware-first design
- OpenAPI plugin built-in
- Edge-compatible (Cloudflare Workers, Deno)
- Tiny bundle size

Alternativa: Fastify (mais pesado, mais robusto)

---

## 2. Estrutura de uma App (Módulo)

```
apps/bruce-core/
├── src/
│   ├── index.ts                      # Entry point (inicia Hono + worker)
│   ├── app.ts                        # Configuração Hono, middleware
│   ├── routes/
│   │   ├── ventures.ts               # POST /ventures, GET /ventures/:id
│   │   ├── index.ts                  # Exports de rotas
│   │   └── utils.ts                  # Helpers para rotas
│   ├── temporal/
│   │   ├── workflows.ts
│   │   ├── activities.ts
│   │   └── worker.ts
│   ├── middleware/
│   │   ├── auth.ts                   # Clerk JWT + auth context
│   │   ├── tenant.ts                 # Set RLS context
│   │   ├── error-handler.ts          # Error handling
│   │   └── logging.ts                # Request/response logging
│   ├── services/
│   │   ├── venture.service.ts        # Business logic
│   │   └── index.ts
│   └── schemas/
│       └── index.ts                  # Re-exports de @bruce/contracts
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 3. Arquivo Principal: `app.ts`

Setup do Hono com middleware e rotas:

```typescript
// apps/bruce-core/src/app.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { OpenAPIHono, z } from '@hono/zod-openapi';

import { getAuth, authMiddleware } from '@bruce/auth';
import { setAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';

import { ventureRoutes } from './routes/ventures';
import { jobRoutes } from './routes/jobs';
import { errorHandler } from './middleware/error-handler';

// Usa OpenAPIHono para geração automática de docs
type Variables = {
  accountId: string;
  userId: string;
  orgSlug: string;
};

const app = new OpenAPIHono<{ Variables: Variables }>();

// ============= CORS

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// ============= LOGGING

app.use('*', honoLogger((message) => logger.info({ message }, 'HTTP request')));

// ============= HEALTH CHECK

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ============= AUTHENTICATION

app.use('*', authMiddleware());

// ============= SET RLS CONTEXT

app.use('*', async (c, next) => {
  const auth = getAuth(c);
  c.set('accountId', auth.accountId);
  c.set('userId', auth.userId);
  c.set('orgSlug', auth.orgSlug);

  // Seta contexto RLS para queries subsequentes
  setAccountContext(auth.accountId);

  await next();
});

// ============= ROUTES

// Rotas de negócio
app.route('/ventures', ventureRoutes);
app.route('/jobs', jobRoutes);

// OpenAPI docs
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'BruceAI Core API',
    description: 'Venture management API',
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'Current server',
    },
  ],
});

// ============= ERROR HANDLING

app.onError(errorHandler);

// ============= 404 Handler

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

export default app;
```

---

## 4. Middleware: Autenticação e RLS

### 4.1 `middleware/auth.ts`

```typescript
// apps/bruce-core/src/middleware/auth.ts
import { Context, Next } from 'hono';
import { getAuth as getAuthFromContext } from '@bruce/auth';
import { logger } from '@bruce/logger';

export async function authMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      const auth = getAuthFromContext(c);
      c.set('accountId', auth.accountId);
      c.set('userId', auth.userId);
      await next();
    } catch (error) {
      logger.error({ error }, 'Authentication failed');
      return c.json(
        { error: 'Unauthorized', details: (error as Error).message },
        401
      );
    }
  };
}

export function requireAuth(c: Context) {
  const accountId = c.get('accountId');
  if (!accountId) {
    throw new Error('Account context not found');
  }
  return { accountId, userId: c.get('userId') };
}
```

### 4.2 `middleware/error-handler.ts`

```typescript
// apps/bruce-core/src/middleware/error-handler.ts
import { Context, HonoRequest } from 'hono';
import { logger } from '@bruce/logger';

export const errorHandler = (error: Error, c: Context) => {
  logger.error(
    {
      error: error.message,
      stack: error.stack,
      method: c.req.method,
      path: c.req.path,
    },
    'Unhandled error'
  );

  // Erros conhecidos
  if (error.message.includes('validation')) {
    return c.json(
      { error: 'Validation error', details: error.message },
      400
    );
  }

  if (error.message.includes('not found')) {
    return c.json({ error: 'Resource not found' }, 404);
  }

  // Default: 500
  return c.json(
    {
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    },
    500
  );
};
```

---

## 5. Rotas Exemplo: Ventures (bruce-core)

Implementação de duas rotas principais: POST /ventures (criar) e GET /ventures/:id (ler):

### 5.1 `routes/ventures.ts`

```typescript
// apps/bruce-core/src/routes/ventures.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { requireAuth } from '../middleware/auth';
import { VentureCreateInput, VentureResponse } from '@bruce/contracts';
import { ventureService } from '../services/venture.service';
import { logger } from '@bruce/logger';

export const ventureRoutes = new OpenAPIHono();

// ============= POST /ventures (Create)

const createVentureRoute = createRoute({
  method: 'post',
  path: '/',
  summary: 'Create a new venture',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1).max(256),
            description: z.string().optional(),
            stage: z.enum(['concept', 'preseed', 'seed', 'series-a']).default('concept'),
            team_profile: z.record(z.any()).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().uuid(),
            name: z.string(),
            stage: z.string(),
            created_at: z.string().datetime(),
          }),
        },
      },
      description: 'Venture created',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
      description: 'Validation error',
    },
  },
});

ventureRoutes.openapi(createVentureRoute, async (c) => {
  const { accountId, userId } = requireAuth(c);
  const body = c.req.valid('json');

  try {
    const venture = await ventureService.createVenture(accountId, {
      name: body.name,
      description: body.description,
      stage: body.stage,
      team_profile: body.team_profile,
    });

    logger.info(
      { accountId, venture_id: venture.id },
      'Venture created'
    );

    return c.json(venture, 201);
  } catch (error) {
    logger.error({ error, accountId }, 'Failed to create venture');
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============= GET /ventures/:id (Read)

const getVentureRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get venture by ID',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().uuid(),
            name: z.string(),
            stage: z.string(),
            created_at: z.string().datetime(),
          }),
        },
      },
      description: 'Venture details',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
      description: 'Venture not found',
    },
  },
});

ventureRoutes.openapi(getVentureRoute, async (c) => {
  const { accountId } = requireAuth(c);
  const { id } = c.req.param();

  try {
    const venture = await ventureService.getVenture(accountId, id);
    if (!venture) {
      return c.json({ error: 'Venture not found' }, 404);
    }
    return c.json(venture);
  } catch (error) {
    logger.error({ error, accountId, venture_id: id }, 'Failed to get venture');
    return c.json({ error: (error as Error).message }, 404);
  }
});

// ============= POST /ventures/:id/start-analysis (Start Workflow)

const startAnalysisRoute = createRoute({
  method: 'post',
  path: '/{id}/start-analysis',
  summary: 'Start opportunity analysis workflow',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    202: {
      content: {
        'application/json': {
          schema: z.object({
            job_id: z.string(),
            status: z.string(),
          }),
        },
      },
      description: 'Workflow started',
    },
  },
});

ventureRoutes.openapi(startAnalysisRoute, async (c) => {
  const { accountId } = requireAuth(c);
  const { id: ventureId } = c.req.param();

  try {
    const jobId = await ventureService.startAnalysisWorkflow(accountId, ventureId);

    logger.info(
      { accountId, venture_id: ventureId, job_id: jobId },
      'Analysis workflow started'
    );

    return c.json(
      {
        job_id: jobId,
        status: 'queued',
        poll_url: `/jobs/${jobId}`,
      },
      202
    );
  } catch (error) {
    logger.error({ error, accountId, venture_id: ventureId }, 'Failed to start workflow');
    return c.json({ error: (error as Error).message }, 400);
  }
});

export default ventureRoutes;
```

### 5.2 `routes/jobs.ts`

Para polling async jobs:

```typescript
// apps/bruce-core/src/routes/jobs.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { requireAuth } from '../middleware/auth';
import { jobService } from '../services/job.service';

export const jobRoutes = new OpenAPIHono();

// ============= GET /jobs/:id (Poll Status)

const getJobRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get job status',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            job_id: z.string(),
            status: z.enum(['queued', 'running', 'completed', 'failed']),
            progress: z.number().optional(),
            result: z.record(z.any()).optional(),
            error: z.string().optional(),
          }),
        },
      },
      description: 'Job status',
    },
  },
});

jobRoutes.openapi(getJobRoute, async (c) => {
  const { accountId } = requireAuth(c);
  const { id: jobId } = c.req.param();

  try {
    const status = await jobService.getJobStatus(accountId, jobId);
    return c.json(status);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 404);
  }
});

export default jobRoutes;
```

---

## 6. Service Layer: Lógica de Negócio

Services encapsulam lógica e chamadas a Temporal:

### 6.1 `services/venture.service.ts`

```typescript
// apps/bruce-core/src/services/venture.service.ts
import { Client } from '@temporalio/client';
import { db, withAccountContext } from '@bruce/db';
import { ventures } from '@bruce/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@bruce/logger';

export class VentureService {
  private temporalClient: Client | null = null;

  async getTemporalClient(): Promise<Client> {
    if (!this.temporalClient) {
      this.temporalClient = new Client({
        connection: await Connection.connect({
          address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
        }),
      });
    }
    return this.temporalClient;
  }

  async createVenture(
    accountId: string,
    data: {
      name: string;
      description?: string;
      stage: string;
      team_profile?: any;
    }
  ): Promise<any> {
    return await withAccountContext(accountId, async () => {
      const newVenture = await db.insert(ventures).values({
        account_id: accountId,
        name: data.name,
        description: data.description,
        stage: data.stage,
        team_profile: data.team_profile,
      }).returning();

      return newVenture[0];
    });
  }

  async getVenture(accountId: string, ventureId: string): Promise<any> {
    return await withAccountContext(accountId, async () => {
      const [venture] = await db
        .select()
        .from(ventures)
        .where(
          eq(ventures.id, ventureId) &&
          eq(ventures.account_id, accountId)
        );

      return venture || null;
    });
  }

  async startAnalysisWorkflow(
    accountId: string,
    ventureId: string
  ): Promise<string> {
    const temporalClient = await this.getTemporalClient();

    const workflowId = `analysis-${ventureId}-${Date.now()}`;

    const handle = await temporalClient.workflow.start('ventureAnalysisWorkflow', {
      taskQueue: 'bruce-bruce-core',
      workflowId,
      input: {
        account_id: accountId,
        venture_id: ventureId,
      },
    });

    logger.info({ workflowId, accountId, ventureId }, 'Workflow started');

    return workflowId;
  }
}

export const ventureService = new VentureService();
```

### 6.2 `services/job.service.ts`

```typescript
// apps/bruce-core/src/services/job.service.ts
import { Client } from '@temporalio/client';
import { getRedisClient } from '@bruce/redis';

export class JobService {
  private temporalClient: Client | null = null;
  private redis = getRedisClient();

  async getTemporalClient(): Promise<Client> {
    if (!this.temporalClient) {
      this.temporalClient = new Client({
        connection: await Connection.connect({
          address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
        }),
      });
    }
    return this.temporalClient;
  }

  async getJobStatus(accountId: string, jobId: string): Promise<any> {
    const temporalClient = await this.getTemporalClient();

    try {
      const handle = temporalClient.getHandle(jobId);
      const execution = await handle.describe();
      const state = await handle.query('state');

      return {
        job_id: jobId,
        status: execution.status,
        state,
      };
    } catch (error) {
      throw new Error(`Job not found: ${jobId}`);
    }
  }
}

export const jobService = new JobService();
```

---

## 7. Entry Point: `index.ts`

```typescript
// apps/bruce-core/src/index.ts
import app from './app';
import startWorker from './temporal/worker';
import { logger } from '@bruce/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  // Inicia Temporal worker em background
  logger.info('Starting Temporal worker...');
  startWorker().catch((error) => {
    logger.error({ error }, 'Worker failed');
    // Continua rodando sem worker se falhar
  });

  // Inicia HTTP server
  logger.info({ port: PORT }, 'Starting HTTP server');
  const server = Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });

  logger.info({ url: `http://localhost:${PORT}` }, 'Server running');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down...');
    server.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});
```

---

## 8. Padrões de API por Tipo de Endpoint

### 8.1 GET /resource (Leitura)

```typescript
export const getResourceRoute = createRoute({
  method: 'get',
  path: '/{id}',
  ...
});

handler = async (c) => {
  const { accountId } = requireAuth(c);
  const { id } = c.req.param();

  const resource = await db.query(...)  // RLS automático via context
  return c.json(resource);
};
```

### 8.2 POST /resource (Criação + Workflow)

```typescript
export const createResourceRoute = createRoute({
  method: 'post',
  path: '/',
  ...
});

handler = async (c) => {
  const { accountId } = requireAuth(c);
  const body = c.req.valid('json');

  // Valida input via Zod
  const validated = InputSchema.parse(body);

  // Inicia workflow via Temporal
  const jobId = await temporalClient.workflow.start('workflowName', {
    taskQueue: 'bruce-module',
    workflowId: generateId(),
    input: { account_id: accountId, ...validated }
  });

  return c.json({ job_id: jobId, status: 'queued' }, 202);
};
```

### 8.3 GET /jobs/:id (Polling)

```typescript
handler = async (c) => {
  const { id } = c.req.param();

  const handle = temporalClient.getHandle(id);
  const status = await handle.describe();
  const state = await handle.query('state');

  return c.json({ status, state });
};
```

---

## 9. Checklist por Módulo

Para cada módulo, implementar:

- [ ] `app.ts` com middleware (auth, RLS, error handling)
- [ ] Routes baseadas em `modules/{module}/saas/api-contract.yaml`
- [ ] Service layer que chama Temporal workflows
- [ ] RLS via `setAccountContext(accountId)`
- [ ] Input validation via Zod
- [ ] Temporal integration (start workflows, poll status)
- [ ] Logging estruturado
- [ ] OpenAPI docs gerados automaticamente
- [ ] Error handling customizado
- [ ] Unit tests para rotas principais

### Ordem recomendada:

**Semana 1:**
1. bruce-core (ventures, jobs)
2. opportunity (scans, analyses)

**Semana 2:**
3. add-venture (venture creation flow)
4. brand-aid (brand analysis)

**Depois:**
5. builder, gtm, startup-ops, portfolio, bruce-memory

---

## 10. Plan Limit Enforcement

Middleware que checa planos:

```typescript
// middleware/plan-limits.ts
import { Context, Next } from 'hono';

export const planLimitMiddleware = async (c: Context, next: Next) => {
  const { accountId } = requireAuth(c);
  const planLimits = await loadPlanLimits(accountId);

  // Seta contexto
  c.set('planLimits', planLimits);

  await next();
};

export async function checkPlanLimit(
  accountId: string,
  limitKey: string
): Promise<boolean> {
  const planLimits = await loadPlanLimits(accountId);
  const currentUsage = await getCurrentUsage(accountId, limitKey);

  return currentUsage < planLimits[limitKey];
}
```

Usar em rotas que têm limite:

```typescript
handler = async (c) => {
  const { accountId } = requireAuth(c);

  const canExecute = await checkPlanLimit(accountId, 'scans_per_month');
  if (!canExecute) {
    return c.json(
      { error: 'Plan limit exceeded', limit_key: 'scans_per_month' },
      429
    );
  }

  // Procede normalmente
};
```

---

## 11. Environment Variables por Módulo

```bash
# .env.example para cada app

# HTTP
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Temporal
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default

# Database
DATABASE_URL=postgresql://bruce:bruce_dev_password@localhost:5432/bruce_dev

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug

# Auth
CLERK_SECRET_KEY=sk_test_...
```

---

## Done Criteria

✅ **Fase 4 está completa quando:**

1. `POST /ventures` cria venture e retorna 201
2. `GET /ventures/:id` retorna venture com RLS automático
3. `POST /ventures/:id/start-analysis` retorna job_id 202
4. `GET /jobs/:id` retorna status do workflow Temporal
5. Sem autenticação JWT, endpoints retornam 401
6. Input validation detecta dados inválidos (400)
7. OpenAPI docs disponíveis em `/doc`
8. Logs estruturados incluem accountId + correlationId
9. Health check em `GET /health` retorna 200
10. Temporal UI mostra workflows iniciados via HTTP

---

## Próximos Passos

Após completar a Fase 4, sistema BruceAI é **totalmente executável**:

- ✅ Monorepo scaffolding (Fase 0)
- ✅ Pacotes compartilhados (Fase 1)
- ✅ Agent runtime (Fase 2)
- ✅ Temporal workers (Fase 3)
- ✅ HTTP APIs (Fase 4)

**Próximos work items:**
- Testes E2E (API → Temporal → Agents → LLM)
- Deployment (Docker, Kubernetes, CI/CD)
- Monitoramento (APM, traces distribuídos)
- Documentation (API docs, deployment guides)
- Frontend (dashboard para venture management)
