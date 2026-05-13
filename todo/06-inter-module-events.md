# Fase 6 — Eventos Inter-módulo

**Status:** Não iniciado  
**Prioridade:** Alta (essencial para orquestração)  
**Duração estimada:** 1–2 dias  
**Responsável:** Backend / Integration  
**Dependências:** Fases 0–5 (monorepo, runtime, auth)

---

## Visão Geral

Módulos trabalham de forma coordenada através de eventos. Quando uma tarefa importante se completa, o módulo emite um evento que outros módulos assinam e reagem.

Exemplos:
- `opportunity.advanced` → dispara `add-venture` workflow
- `venture.approved` → dispara `brand-aid` + `builder` em paralelo
- `brand.completed` + `spec.completed` → dispara `gtm`

**Objetivo:** Implementar um event bus durável com fila de retry para coordenar workflows entre módulos sem acoplamento direto.

---

## 1. Arquitetura de Eventos

### 1.1 Fluxo Completo

```
[Opportunity Module]
        ↓ emits: opportunity.advanced
[Event Bus] (BullMQ)
        ↓ subscribers: [add-venture, bruce-core, bruce-memory]
    ┌───┴───┬─────────────┐
    ↓       ↓             ↓
[add-venture] [bruce-core] [bruce-memory]
(priority: high) (priority: medium) (priority: low)
```

### 1.2 Event Schema

Definido em `modules/contracts/module-event.schema.json`. Todo evento deve ter:

```typescript
interface ModuleEvent {
  event_id: string; // UUID v4
  event_type: string; // opportunity.advanced, venture.qualified, etc
  module: string; // Qual módulo emitiu
  venture_id?: string; // ID da venture afetada
  timestamp: string; // ISO 8601
  severity: 'info' | 'warning' | 'error' | 'critical';
  payload: object; // Dados específicos do evento
  correlation_id: string; // Trace ID
  subscribers: string[]; // Módulos que recebem (preenchido pelo bus)
}
```

### 1.3 Chain de Eventos Esperado

Arquivo: `modules/contracts/event-flow.md`

```
[Opportunity]
  opportunity.advanced
    ↓
[AddVenture]
  venture.initialized → venture.qualified → venture.hypothesis_updated
    ↓
[BrandAid] ─┐
  brand_assets_generated
              │
[Builder] ───┘
  product_spec_completed
              │
              └─→ [GTM] (quando ambas completas)
                  gtm_plan_activated
                    ↓
              [StartupOps]
                startup_ops_initialized
                    ↓
              [Portfolio] (weekly via heartbeat)
                health_score_updated
                    ↓
              [BruceCore] (toma decisões)
                decision_made
                    ↓
              [BruceMemory] (aprende)
                learning_ingested
```

---

## 2. Implementação com BullMQ

BullMQ é uma fila Redis-backed que oferece durabilidade, retry automático, e visibilidade.

### 2.1 Setup

Arquivo: `packages/events/src/event-bus.ts`

```typescript
import { Queue, Worker, QueueEvents } from 'bullmq';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Schema do evento (importado do módulo contracts)
const ModuleEventSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  module: z.string(),
  venture_id: z.string().optional(),
  timestamp: z.string().datetime(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  payload: z.record(z.any()),
  correlation_id: z.string(),
  subscribers: z.array(z.string()),
});

export type ModuleEvent = z.infer<typeof ModuleEventSchema>;

// Singleton de Redis
const redis = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '1'),
});

// Fila de eventos
export const eventQueue = new Queue<ModuleEvent>('bruce-events', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // Retry 3x antes de Dead Letter Queue
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: true, // Limpar jobs completados após 1h
  },
});

// Dead Letter Queue
export const deadLetterQueue = new Queue<ModuleEvent>('bruce-events-dlq', {
  connection: redis,
});

// Eventos da fila (para monitoramento)
const queueEvents = new QueueEvents('bruce-events', { connection: redis });

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`✅ Event ${jobId} processed successfully`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Event ${jobId} failed: ${failedReason}`);
});
```

### 2.2 Emitir Evento

Arquivo: `packages/events/src/emit-event.ts`

```typescript
export async function emitEvent(
  eventType: string,
  module: string,
  payload: object,
  options?: {
    ventureId?: string;
    correlationId?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    subscribers?: string[];
  },
): Promise<ModuleEvent> {
  const event: ModuleEvent = {
    event_id: uuidv4(),
    event_type,
    module,
    venture_id: options?.ventureId,
    timestamp: new Date().toISOString(),
    severity: options?.severity || 'info',
    payload,
    correlation_id: options?.correlationId || uuidv4(),
    subscribers: options?.subscribers || [],
  };

  // Validar contra schema
  const validated = ModuleEventSchema.parse(event);

  // Adicionar à fila com prioridade
  const priority = event.severity === 'critical' ? 1 : 10;

  await eventQueue.add(`${event.module}:${event.event_type}`, validated, {
    priority,
  });

  console.log(
    `📤 Event emitted: ${event.event_type} from ${event.module} (${event.event_id})`,
  );

  return event;
}
```

**Uso:**

```typescript
// Em opportunity module
await emitEvent('opportunity.advanced', 'opportunity', {
  problem_statement: 'Mobile payment platform for emerging markets',
  market_segment: 'FinTech',
  validation_score: 85,
});
```

### 2.3 Subscrever Eventos

Arquivo: `apps/add-venture/src/temporal/worker.ts`

```typescript
import { Worker } from 'bullmq';
import { eventQueue, ModuleEvent } from '@bruce/events';
import { startAddVentureWorkflow } from './workflows/add-venture.workflow';

// Registrar handler de eventos
const eventWorker = new Worker<ModuleEvent>(
  'bruce-events',
  async (job) => {
    const event = job.data;

    console.log(
      `📥 [add-venture] Received event: ${event.event_type} from ${event.module}`,
    );

    // Filtrar eventos que importam para add-venture
    if (event.event_type === 'opportunity.advanced') {
      // Iniciar workflow
      await startAddVentureWorkflow({
        venture_id: event.venture_id!,
        problem_statement: event.payload.problem_statement as string,
        market_segment: event.payload.market_segment as string,
        correlation_id: event.correlation_id,
      });

      return { processed: true };
    }

    // Ignorar outros eventos
    return { processed: false };
  },
  {
    connection: redis,
    concurrency: 5, // Processar até 5 eventos em paralelo
    settings: {
      lockDuration: 30000, // Lock por 30s
      lockRenewTime: 15000, // Renovar lock a cada 15s
    },
  },
);

eventWorker.on('completed', (job) => {
  console.log(`✅ Event processed: ${job.id}`);
});

eventWorker.on('failed', (job, err) => {
  console.error(`❌ Event failed: ${job?.id}`, err);
  // Se falhar 3x, vai para DLQ
});
```

---

## 3. Padrão: Fan-out (Parallelização)

Quando um evento dispara múltiplos workflows em paralelo.

### 3.1 Exemplo: add-venture → brand-aid + builder

```typescript
// Em add-venture, após venture.qualified
await emitEvent('venture.qualified', 'add-venture', {
  venture_id: ventureId,
  hypothesis: { ... },
}, {
  ventureId,
  subscribers: ['brand-aid', 'builder'],
  severity: 'info',
});
```

### 3.2 Handler em brand-aid

```typescript
if (event.event_type === 'venture.qualified') {
  await startBrandAidWorkflow({
    venture_id: event.venture_id!,
    hypothesis: event.payload.hypothesis,
    correlation_id: event.correlation_id,
  });
}
```

### 3.3 Handler em builder

```typescript
if (event.event_type === 'venture.qualified') {
  await startBuilderWorkflow({
    venture_id: event.venture_id!,
    hypothesis: event.payload.hypothesis,
    correlation_id: event.correlation_id,
  });
}
```

**Resultado:** Ambas as workflows rodam em paralelo, sem que uma bloqueia a outra.

---

## 4. Dead Letter Queue

Eventos que falham 3x consecutivas vão para DLQ e alertam via Better Stack.

### 4.1 Monitor de DLQ

Arquivo: `packages/events/src/dlq-monitor.ts`

```typescript
import { deadLetterQueue } from './event-bus';
import { alert } from '@bruce/monitoring';

export async function monitorDLQ() {
  // Verificar DLQ a cada minuto
  setInterval(async () => {
    const dlqCount = await deadLetterQueue.count();

    if (dlqCount > 0) {
      const jobs = await deadLetterQueue.getJobs();

      for (const job of jobs) {
        const event = job.data as ModuleEvent;

        // Enviar alerta
        await alert({
          level: 'error',
          title: `Event in Dead Letter Queue`,
          message: `Event ${event.event_id} (${event.event_type}) failed 3 times. Last error: ${job.failedReason}`,
          context: {
            event_id: event.event_id,
            event_type: event.event_type,
            module: event.module,
            venture_id: event.venture_id,
          },
        });
      }
    }
  }, 60000); // 1 minute
}
```

### 4.2 Manual Retry

```typescript
// CLI: `pnpm events:retry-dlq`
export async function retryDLQ() {
  const jobs = await deadLetterQueue.getJobs();

  for (const job of jobs) {
    await eventQueue.add(job.name, job.data);
    await deadLetterQueue.remove(job.id);
    console.log(`🔄 Requeued: ${job.id}`);
  }
}
```

---

## 5. Validação de Eventos

Todo evento é validado ANTES de entrar na fila e DEPOIS de sair.

### 5.1 Validação no Emissor

```typescript
try {
  const validated = ModuleEventSchema.parse(event);
  await eventQueue.add(jobName, validated);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid event schema:', error.errors);
    throw new Error('Event validation failed');
  }
}
```

### 5.2 Validação no Receptor

```typescript
const eventWorker = new Worker<ModuleEvent>(
  'bruce-events',
  async (job) => {
    try {
      const validated = ModuleEventSchema.parse(job.data);
      // Process validated event
    } catch (error) {
      console.error('❌ Invalid event received:', error);
      // Enviar para DLQ, não fazer retry
      throw error;
    }
  },
);
```

---

## 6. Rastreamento com Correlation ID

Toda requisição HTTP inicia com um `correlation_id`. Esse ID flui através de:
- HTTP request
- Event emission
- Temporal workflow
- Database writes
- Logs estruturados

### 6.1 Propagação em HTTP

```typescript
import { randomUUID } from 'crypto';

export const correlationIdMiddleware = createMiddleware(async (c, next) => {
  const correlationId =
    c.req.header('X-Correlation-ID') || randomUUID();
  c.set('correlationId', correlationId);

  // Injetar em todos os logs
  c.res.headers.set('X-Correlation-ID', correlationId);

  await next();
});
```

### 6.2 Propagação em Eventos

```typescript
const correlationId = c.get('correlationId');

await emitEvent('opportunity.advanced', 'opportunity', payload, {
  correlationId,
});
```

### 6.3 Propagação em Temporal

```typescript
// Input do workflow inclui correlationId
interface AddVentureInput {
  correlation_id: string;
  venture_id: string;
  problem_statement: string;
}

// Cada activity recebe
activity.correlationId = input.correlation_id;

// Logs incluem
logger.info('Starting activity', {
  correlation_id: activity.correlationId,
  venture_id: input.venture_id,
});
```

---

## 7. Observabilidade

### 7.1 Métricas

```typescript
import { register, Counter, Histogram } from 'prom-client';

const eventEmitted = new Counter({
  name: 'bruce_events_emitted_total',
  help: 'Total events emitted',
  labelNames: ['event_type', 'module'],
});

const eventProcessed = new Counter({
  name: 'bruce_events_processed_total',
  help: 'Total events processed',
  labelNames: ['event_type', 'status'], // status: success, failed
});

const eventProcessingDuration = new Histogram({
  name: 'bruce_events_processing_seconds',
  help: 'Event processing duration',
  labelNames: ['event_type'],
  buckets: [0.1, 0.5, 1, 5, 10],
});

// Usar em handlers
const startTime = Date.now();
await eventWorker.process(event);
eventProcessingDuration
  .labels(event.event_type)
  .observe((Date.now() - startTime) / 1000);
```

### 7.2 Logs Estruturados

```typescript
logger.info('Event processed', {
  event_id: event.event_id,
  event_type: event.event_type,
  module: event.module,
  venture_id: event.venture_id,
  correlation_id: event.correlation_id,
  duration_ms: duration,
  status: 'success',
});
```

---

## 8. Testes

### 8.1 Teste de Emissão

```typescript
it('should emit opportunity.advanced event', async () => {
  const spy = vi.spyOn(eventQueue, 'add');

  await emitEvent('opportunity.advanced', 'opportunity', {
    problem_statement: 'Test problem',
  });

  expect(spy).toHaveBeenCalledWith(
    expect.stringContaining('opportunity.advanced'),
    expect.objectContaining({
      event_type: 'opportunity.advanced',
    }),
  );
});
```

### 8.2 Teste de Processamento

```typescript
it('should trigger add-venture when opportunity.advanced is emitted', async () => {
  const event: ModuleEvent = {
    event_id: uuidv4(),
    event_type: 'opportunity.advanced',
    module: 'opportunity',
    venture_id: 'vent_123',
    timestamp: new Date().toISOString(),
    severity: 'info',
    payload: { problem_statement: 'Test' },
    correlation_id: uuidv4(),
    subscribers: ['add-venture'],
  };

  const workflowSpy = vi.spyOn(temporal, 'startAddVentureWorkflow');

  // Simular job processado pelo worker
  const job = { data: event } as any;
  await eventWorker.processor(job);

  expect(workflowSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      venture_id: 'vent_123',
    }),
  );
});
```

### 8.3 Teste de Fan-out

```typescript
it('should trigger both brand-aid and builder when venture.qualified', async () => {
  const event: ModuleEvent = {
    event_type: 'venture.qualified',
    subscribers: ['brand-aid', 'builder'],
    // ...
  };

  const brandAidSpy = vi.spyOn(temporal, 'startBrandAidWorkflow');
  const builderSpy = vi.spyOn(temporal, 'startBuilderWorkflow');

  // Emitir e processar
  await eventQueue.add('add-venture:venture.qualified', event);

  // Workers de brand-aid e builder processam
  await sleep(100);

  expect(brandAidSpy).toHaveBeenCalled();
  expect(builderSpy).toHaveBeenCalled();
});
```

---

## 9. Migração de Redis Pub/Sub → Temporal Signals (Futuro)

Quando a complexidade crescer, podem migrar para Temporal signals:

```typescript
// Fase 7 (futuro): Usar Temporal signals em vez de BullMQ
await client.signalWorkflow('add-venture', {
  signalName: 'opportunityAdvanced',
  args: [event],
});
```

Por enquanto, BullMQ é mais simples e suficiente.

---

## Checklist de Implementação

- [ ] BullMQ queue criada e conectada ao Redis
- [ ] Event schema validado com Zod
- [ ] emitEvent() implementada com validação
- [ ] Worker de add-venture subscreve `opportunity.advanced`
- [ ] Worker de brand-aid subscreve `venture.qualified`
- [ ] Worker de builder subscreve `venture.qualified` (paralelo)
- [ ] Dead Letter Queue monitorada com alertas
- [ ] Correlation ID propagado em todos os logs
- [ ] Métricas Prometheus exportadas
- [ ] Testes de emissão e processamento
- [ ] Teste de fan-out (parallelização)
- [ ] DLQ manual retry script

---

## Pronto para Produção?

✅ **Sim**, quando:
- Emitir `opportunity.advanced` automaticamente dispara add-venture workflow
- Fan-out: brand-aid e builder iniciam em paralelo quando `venture.qualified`
- Evento com payload inválido é rejeitado e vai para DLQ
- Correlation ID aparece em logs, métricas, e Temporal UI
- Retry automático funciona (simule falha via job timeout)
- DLQ alerta via Better Stack quando há eventos não-processáveis
