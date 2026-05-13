# Fase 7 — Observabilidade e Logging

**Status:** Não iniciado  
**Prioridade:** Alta (crítico para debug em produção)  
**Duração estimada:** 1 dia  
**Responsável:** DevOps / Backend  
**Dependências:** Fases 0–6 (monorepo, runtime, events)

---

## Visão Geral

A observabilidade é a capacidade de entender o que está acontecendo em um sistema através de logs, métricas e traces. BruceAI precisa de:

1. **Logs estruturados** — JSON com `correlation_id`, `account_id`, `module`, `workflow_id`
2. **Correlation ID propagation** — rastrear um request desde HTTP até DB
3. **Activity/agent observability** — saber quando cada agente começa, termina, falha
4. **Better Stack integration** — centralizar logs e alertas
5. **Temporal visibility** — filtrar workflows por account/venture na UI

**Objetivo:** Ser capaz de encontrar, em segundos, o que aconteceu em qualquer ponto da execução de uma venture.

---

## 1. Logging Estruturado com Pino

### 1.1 Setup do Logger

Arquivo: `packages/logger/src/index.ts`

```typescript
import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

// Context storage para propagação automática
export const logContext = new AsyncLocalStorage<{
  correlationId?: string;
  accountId?: string;
  ventureId?: string;
  module?: string;
  agentId?: string;
  workflowId?: string;
}>();

// Configuração base
const pinoConfig: pino.LoggerOptions = {
  transport: {
    // Formato: JSON em prod, pretty em dev
    target: process.env.NODE_ENV === 'production' ? 'pino/transport' : 'pino-pretty',
    options: {
      colorize: process.env.NODE_ENV !== 'production',
      singleLine: process.env.NODE_ENV === 'production',
    },
  },
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
};

const baseLogger = pino(pinoConfig);

/**
 * Wrapper que injeta context automaticamente
 */
export const logger = {
  info: (message: string, obj?: object) => {
    const context = logContext.getStore() || {};
    baseLogger.info({ ...context, ...obj }, message);
  },
  warn: (message: string, obj?: object) => {
    const context = logContext.getStore() || {};
    baseLogger.warn({ ...context, ...obj }, message);
  },
  error: (message: string, obj?: object | Error) => {
    const context = logContext.getStore() || {};
    if (obj instanceof Error) {
      baseLogger.error({ ...context, err: obj }, message);
    } else {
      baseLogger.error({ ...context, ...obj }, message);
    }
  },
  debug: (message: string, obj?: object) => {
    const context = logContext.getStore() || {};
    baseLogger.debug({ ...context, ...obj }, message);
  },
};
```

### 1.2 Schema de Log

Todo log deve incluir (quando disponível):

```typescript
interface LogEntry {
  // Obrigatórios
  timestamp: string; // ISO 8601, auto-adicionado pelo Pino
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;

  // Context (injetado automaticamente)
  correlation_id?: string; // Rastreabilidade
  account_id?: string; // Isolamento tenant
  venture_id?: string; // Associação com venture
  module?: string; // Qual módulo gerou
  agent_id?: string; // Qual agente (ex: brand-positioning-agent)
  workflow_id?: string; // Temporal workflow ID

  // Dados adicionais (variam por caso)
  [key: string]: any;
}
```

**Exemplo de log estruturado:**

```json
{
  "level": 30,
  "time": "2026-04-12T14:30:45.123Z",
  "pid": 12345,
  "hostname": "bruce-core-1",
  "message": "Venture created",
  "correlation_id": "corr_abc123",
  "account_id": "org_xyz",
  "venture_id": "vent_123",
  "module": "bruce-core",
  "venture_name": "Acme Marketplace",
  "status": "initialized"
}
```

---

## 2. Propagação de Correlation ID

### 2.1 HTTP Middleware

Arquivo: `packages/auth/src/correlation-middleware.ts`

```typescript
import { randomUUID } from 'crypto';
import { logContext } from '@bruce/logger';

export const correlationMiddleware = createMiddleware(async (c, next) => {
  // Gerar ou recuperar correlation_id
  const correlationId =
    c.req.header('X-Correlation-ID') || randomUUID();

  // Obter context do JWT (se autenticado)
  const auth = c.get('auth');

  // Setup async local storage
  await logContext.run(
    {
      correlationId,
      accountId: auth?.accountId,
      module: 'api-gateway', // Será sobrescrito por cada módulo
    },
    async () => {
      // Injetar headers de resposta para rastreabilidade
      c.res.headers.set('X-Correlation-ID', correlationId);

      // Próximo middleware
      await next();

      // Log de conclusão
      logger.info('HTTP request completed', {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration_ms: Date.now() - startTime,
      });
    },
  );
});
```

### 2.2 Propagação em Temporal

Arquivo: `packages/agent-runtime/src/workflow-utils.ts`

```typescript
/**
 * Input padrão para todos os workflows
 */
export interface WorkflowInput {
  correlation_id: string;
  account_id: string;
  venture_id: string;
  // payload específico varia por workflow
}

/**
 * Executar activity com context propagado
 */
export async function executeActivityWithContext<T>(
  activity: (...args: any[]) => Promise<T>,
  input: WorkflowInput,
  activityName: string,
): Promise<T> {
  const startTime = Date.now();

  logger.debug('Activity starting', {
    activity_name: activityName,
    workflow_id: workflowInfo().workflowId,
  });

  try {
    const result = await activity(input);

    logger.info('Activity completed', {
      activity_name: activityName,
      duration_ms: Date.now() - startTime,
      workflow_id: workflowInfo().workflowId,
    });

    return result;
  } catch (error) {
    logger.error('Activity failed', {
      activity_name: activityName,
      error: (error as Error).message,
      workflow_id: workflowInfo().workflowId,
    });

    throw error;
  }
}
```

### 2.3 Propagação Inter-módulo

Quando um módulo chama outro via HTTP:

```typescript
// Em add-venture, chamar builder
const { correlationId, accountId, ventureId } = logContext.getStore()!;

const response = await fetch('http://builder:3003/api/internal/compile', {
  method: 'POST',
  headers: {
    'X-Correlation-ID': correlationId,
    'X-Account-ID': accountId,
    'X-Venture-ID': ventureId,
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});
```

---

## 3. Agent/Activity Observability

Cada agente deve emitir 3 eventos: **started**, **completed**, **failed**.

### 3.1 Agent Execution Wrapper

Arquivo: `packages/agent-runtime/src/execute-agent.ts`

```typescript
import { emitEvent } from '@bruce/events';
import { logger } from '@bruce/logger';
import { createHash } from 'crypto';

export interface ExecuteAgentOptions {
  agentId: string;
  module: string;
  input: object;
  correlationId: string;
  accountId: string;
  ventureId: string;
  llmModel?: string;
}

export async function executeAgent<T>(
  agentId: string,
  agentFunction: (input: object) => Promise<T>,
  options: ExecuteAgentOptions,
): Promise<T> {
  const startTime = Date.now();
  const inputHash = createHash('sha256')
    .update(JSON.stringify(options.input))
    .digest('hex')
    .slice(0, 8);

  logger.info(`Agent started`, {
    agent_id: agentId,
    input_hash: inputHash,
    module: options.module,
  });

  // Emitir evento started
  await emitEvent(`${options.module}.${agentId}.started`, options.module, {
    input_hash: inputHash,
    timestamp: new Date().toISOString(),
  }, {
    ventureId: options.ventureId,
    correlationId: options.correlationId,
    severity: 'info',
  });

  try {
    // Executar agente
    const result = await agentFunction(options.input);

    const duration_ms = Date.now() - startTime;
    const outputHash = createHash('sha256')
      .update(JSON.stringify(result))
      .digest('hex')
      .slice(0, 8);

    logger.info(`Agent completed`, {
      agent_id: agentId,
      duration_ms,
      output_hash: outputHash,
    });

    // Emitir evento completed
    await emitEvent(
      `${options.module}.${agentId}.completed`,
      options.module,
      {
        output_hash: outputHash,
        duration_ms,
        status: 'success',
      },
      {
        ventureId: options.ventureId,
        correlationId: options.correlationId,
        severity: 'info',
      },
    );

    return result;
  } catch (error) {
    const duration_ms = Date.now() - startTime;

    logger.error(`Agent failed`, {
      agent_id: agentId,
      error: (error as Error).message,
      duration_ms,
      stack: (error as Error).stack,
    });

    // Emitir evento failed
    await emitEvent(
      `${options.module}.${agentId}.failed`,
      options.module,
      {
        error_message: (error as Error).message,
        duration_ms,
        retry_count: 0,
      },
      {
        ventureId: options.ventureId,
        correlationId: options.correlationId,
        severity: 'error',
      },
    );

    throw error;
  }
}
```

### 3.2 Uso em Agentes

```typescript
// Em opportunity scanner
const result = await executeAgent(
  'opportunity-scanner',
  async (input) => {
    return await scanOpportunity(input);
  },
  {
    agentId: 'opportunity-scanner',
    module: 'opportunity',
    input: { problem_statement },
    correlationId,
    accountId,
    ventureId,
  },
);
```

---

## 4. Better Stack Integration

Better Stack centraliza logs e oferece alerting.

### 4.1 Pino Transport para Better Stack

Arquivo: `packages/logger/src/betterstack-transport.ts`

```typescript
import pino from 'pino';
import https from 'https';

export function createBetterStackTransport() {
  return pino.transport({
    target: 'pino/file',
    options: {
      destination: process.env.BETTERSTACK_SOURCE_TOKEN
        ? 'https://in.logs.betterstack.com/'
        : 1, // stdout se não configurado
    },
  });
}

/**
 * Ou via HTTP direto (mais controle)
 */
export function sendToBetterStack(logEntry: any) {
  if (!process.env.BETTERSTACK_SOURCE_TOKEN) return;

  const payload = JSON.stringify({
    dt: new Date().toISOString(),
    message: logEntry.message,
    severity: {
      debug: 'debug',
      info: 'info',
      warn: 'warning',
      error: 'error',
    }[logEntry.level] || 'info',
    context: {
      correlation_id: logEntry.correlation_id,
      account_id: logEntry.account_id,
      venture_id: logEntry.venture_id,
      module: logEntry.module,
      agent_id: logEntry.agent_id,
    },
  });

  const req = https.request('https://in.logs.betterstack.com/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BETTERSTACK_SOURCE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  req.write(payload);
  req.end();
}
```

### 4.2 Configuração no package.json

```json
{
  "dependencies": {
    "pino": "^8.0.0",
    "pino-pretty": "^10.0.0"
  },
  "devDependencies": {
    "pino-betterstack": "^1.0.0"
  }
}
```

### 4.3 Alertas Automáticos

No dashboard Better Stack, configurar alertas para:

- `level = 'error'` → alerta imediato
- `event_type = 'agent.failed'` → alerta imediato
- `event_type = 'event_dlq'` → alerta imediato
- `severity = 'critical'` → alerta P1

---

## 5. Temporal Visibility

Temporal UI oferece search para filtrar workflows. Adicionar custom search attributes:

### 5.1 Registrar Custom Search Attributes

Arquivo: `apps/bruce-core/src/temporal/setup.ts`

```typescript
import { Connection, WorkflowService } from '@temporalio/proto';

async function registerSearchAttributes() {
  const connection = new Connection();
  const service = WorkflowService.create(connection);

  // Registrar custom search attributes
  await service.registerNamespace({
    namespace: 'default',
    workflowExecutionRetentionTtl: { seconds: 86400 * 30 }, // 30 days
    workflowExecutionHistoryRetentionTtl: { seconds: 3600 },
  });

  // Adicionar search attributes customizados
  const searchAttributes = {
    account_id: { valueType: 'Keyword' },
    venture_id: { valueType: 'Keyword' },
    module_name: { valueType: 'Keyword' },
    correlation_id: { valueType: 'Keyword' },
  };

  // Registrar no Temporal cluster (requer CLI ou SDK)
  // tctl --namespace default adv search-attr upsert --search_attr_key account_id --search_attr_type Keyword
}
```

### 5.2 Usar em Workflows

```typescript
export async function addVentureWorkflow(
  input: WorkflowInput,
): Promise<VentureOutput> {
  // Temporal injeta search attributes automaticamente
  setWorkflowMetadata({
    searchAttributes: {
      account_id: input.account_id,
      venture_id: input.venture_id,
      module_name: 'add-venture',
      correlation_id: input.correlation_id,
    },
  });

  // ... workflow logic
}
```

### 5.3 Buscar na UI

No Temporal UI:

```
account_id = 'org_123' AND venture_id = 'vent_abc' AND module_name = 'add-venture'
```

---

## 6. Observability no Development

### 6.1 Logs Locais em Pretty Format

```bash
# .env
LOG_LEVEL=debug
NODE_ENV=development
```

Resultado:

```
  INFO add-venture (12:30:45.123): Venture created
      correlation_id: "corr_abc123"
      account_id: "org_xyz"
      venture_id: "vent_123"
```

### 6.2 Monitoramento Real-time

```bash
# Terminal 1: Tail logs do Temporal
docker logs -f bruce-temporal

# Terminal 2: Tail logs da aplicação
pnpm logs --filter bruce-core

# Terminal 3: Ver métricas Prometheus
curl http://localhost:9090
```

---

## 7. Testes

### 7.1 Teste de Propagação de Context

```typescript
it('should propagate correlation_id through workflow', async () => {
  const correlationId = uuidv4();

  await logContext.run({ correlationId }, async () => {
    const context = logContext.getStore();
    expect(context?.correlationId).toBe(correlationId);
  });
});
```

### 7.2 Teste de Eventos de Agent

```typescript
it('should emit agent.started and agent.completed events', async () => {
  const spy = vi.spyOn(eventQueue, 'add');

  await executeAgent('test-agent', async () => 'result', {
    agentId: 'test-agent',
    module: 'test',
    input: {},
    correlationId: uuidv4(),
    accountId: 'org_test',
    ventureId: 'vent_test',
  });

  const calls = spy.mock.calls;
  const eventTypes = calls.map(c => c[0]);

  expect(eventTypes).toContain('test.test-agent.started');
  expect(eventTypes).toContain('test.test-agent.completed');
});
```

### 7.3 Teste de Log Estruturado

```typescript
it('should include context in logs', async () => {
  const logs: any[] = [];
  const spy = vi.spyOn(baseLogger, 'info').mockImplementation(
    (obj, msg) => logs.push(obj),
  );

  await logContext.run(
    { correlationId: 'corr_123', accountId: 'org_456' },
    async () => {
      logger.info('Test message');
    },
  );

  expect(logs[0]).toMatchObject({
    correlationId: 'corr_123',
    accountId: 'org_456',
  });
});
```

---

## Checklist de Implementação

- [ ] Logger com AsyncLocalStorage implementado
- [ ] Middleware de correlation_id em HTTP
- [ ] Context propagado em Temporal workflows
- [ ] Context propagado em chamadas inter-módulo
- [ ] executeAgent() wrapper implementado
- [ ] Eventos de agent.started/completed/failed emitidos
- [ ] Better Stack transport configurado
- [ ] Search attributes registrados no Temporal
- [ ] Alertas Better Stack criados
- [ ] Testes de propagação de context
- [ ] Testes de eventos de agent
- [ ] Documentação de querying (Better Stack + Temporal)

---

## Pronto para Produção?

✅ **Sim**, quando:
- HTTP request → log inclui `correlation_id`, `account_id`, `module`
- Workflow → activity logs incluem `workflow_id`
- Agent execution → 3 eventos (started, completed/failed)
- Better Stack → logs aparecem em < 1s
- Temporal UI → filtra workflows por `account_id` e `venture_id`
- Correlation ID rastreável do HTTP até DB write final
- Qualquer erro é visível em Better Stack com contexto completo
