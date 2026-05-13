# Fase 3 — Temporal Workers (Orquestração)

**Status:** Não iniciado  
**Prioridade:** Crítica (necessário para workflows assíncronos)  
**Duração estimada:** 1 semana (3 módulos), 2 semanas (todos 9 módulos)  
**Responsável:** Backend / Workflow Engineers

---

## Visão Geral

Temporal é um mecanismo de orquestração que executa workflows de forma confiável e durável. Cada arquivo `*.workflow.json` em `modules/{module}/workflows/` define uma sequência de passos que:

1. Chama um agente (ex: market-scanner)
2. Processa resultado
3. Chama próximo agente (ex: scoring-agent)
4. Repete até completion
5. Persiste estado em cada passo

O **Temporal worker** é o processo que:
- Registra workflows e activities
- Inicia workers para uma task queue específica
- Executa workflows quando solicitado via HTTP

Cada módulo precisa de seu próprio worker que conhece seus workflows.

---

## 1. Arquitetura Temporal no BruceAI

```
BruceAI Temporal Setup:
├── Task Queues (um por módulo):
│   ├── bruce-bruce-core
│   ├── bruce-opportunity
│   ├── bruce-add-venture
│   ├── bruce-brand-aid
│   ├── bruce-builder
│   ├── bruce-gtm
│   ├── bruce-startup-ops
│   ├── bruce-portfolio
│   └── bruce-bruce-memory
│
└── Workflows (por módulo):
    ├── bruce-core:
    │   └── venture-creation-workflow
    ├── opportunity:
    │   ├── opportunity-screening
    │   └── opportunity-analysis
    ├── add-venture:
    │   └── venture-addition-workflow
    └── ... (outros módulos)
```

**Componentes:**
- **Workflow** — Define lógica de orquestração (Typescript)
- **Activity** — Unidade de trabalho executável (chama AgentRunner)
- **Worker** — Executa workflows + activities registrados (processa task queue)

---

## 2. Estrutura de um Worker por Módulo

```
apps/opportunity/src/temporal/
├── activities.ts          # Implementações de activities
├── workflows.ts           # Definições de workflows
├── worker.ts              # Startup do worker
└── config.ts              # Configuração (taskQueue, etc.)
```

---

## 3. Exemplo Completo: Módulo Opportunity

### 3.1 `activities.ts`

Activities são funções que o Temporal executa. Cada activity = uma ação executável:

```typescript
// apps/opportunity/src/temporal/activities.ts
import { proxyActivities, ActivityOptions } from '@temporalio/workflow';
import { getAgentRunner } from '@bruce/agent-runtime';
import { db, withAccountContext } from '@bruce/db';
import { getRedisClient } from '@bruce/redis';
import { getEventBus } from '@bruce/events';
import { logger } from '@bruce/logger';

// Configuração padrão de retry para todas as activities
const defaultActivityOptions: ActivityOptions = {
  startToCloseTimeout: '5 minutes',
  heartbeatTimeout: '30 seconds',
  retryPolicy: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
};

// ============= Implementations (não são activities ainda, são funções normais)

export async function runMarketScannerAgent(
  accountId: string,
  ventureId: string,
  opportunityData: any
): Promise<any> {
  logger.info(
    { accountId, ventureId },
    'Running market-scanner agent'
  );

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'opportunity',
    'market-scanner',
    {
      venture_id: ventureId,
      opportunity: opportunityData,
    },
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId: logger.correlationId,
    }
  );

  if (!result.success) {
    throw new Error(`Market scanner failed: ${result.error}`);
  }

  return result.output;
}

export async function runScoringAgent(
  accountId: string,
  ventureId: string,
  marketAnalysis: any
): Promise<any> {
  logger.info({ accountId, ventureId }, 'Running scoring agent');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'opportunity',
    'scoring-agent',
    {
      venture_id: ventureId,
      market_analysis: marketAnalysis,
    },
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId: logger.correlationId,
    }
  );

  if (!result.success) {
    throw new Error(`Scoring agent failed: ${result.error}`);
  }

  return result.output;
}

export async function runPrioritizationAgent(
  accountId: string,
  ventureId: string,
  scoredOpportunities: any[]
): Promise<any> {
  logger.info({ accountId, ventureId }, 'Running prioritization agent');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'opportunity',
    'prioritization-agent',
    {
      venture_id: ventureId,
      scored_opportunities: scoredOpportunities,
    },
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId: logger.correlationId,
    }
  );

  if (!result.success) {
    throw new Error(`Prioritization agent failed: ${result.error}`);
  }

  return result.output;
}

export async function persistOpportunityScan(
  accountId: string,
  ventureId: string,
  scanResults: any
): Promise<string> {
  logger.info(
    { accountId, ventureId },
    'Persisting opportunity scan to database'
  );

  return await withAccountContext(accountId, async () => {
    // Insere/atualiza opportunity_scans no DB
    const id = crypto.randomUUID();
    // TODO: Implementar insert real com Drizzle
    return id;
  });
}

export async function emitOpportunityScanCompleted(
  accountId: string,
  ventureId: string,
  scanId: string,
  results: any
): Promise<void> {
  logger.info({ accountId, ventureId, scanId }, 'Emitting scan completed event');

  const eventBus = getEventBus();
  await eventBus.emit({
    type: 'opportunity.scan.completed',
    timestamp: new Date().toISOString(),
    module: 'opportunity',
    source_agent: 'prioritization-agent',
    account_id: accountId,
    venture_id: ventureId,
    payload: {
      scan_id: scanId,
      results,
    },
  });
}

export async function updateExecutionState(
  accountId: string,
  ventureId: string,
  step: string,
  state: any
): Promise<void> {
  logger.info(
    { accountId, ventureId, step },
    'Updating execution state'
  );

  const redis = getRedisClient();
  await redis.set(
    accountId,
    'opportunity',
    'scan',
    ventureId,
    `state:${step}`,
    state,
    3600 // 1 hora TTL
  );
}
```

### 3.2 `workflows.ts`

Workflows orquestram activities. Definem a sequência de passos:

```typescript
// apps/opportunity/src/temporal/workflows.ts
import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  getInfo,
  sleep,
} from '@temporalio/workflow';
import type * as activities from './activities';

// "Proxy" das activities para chamar dentro do workflow
const {
  runMarketScannerAgent,
  runScoringAgent,
  runPrioritizationAgent,
  persistOpportunityScan,
  emitOpportunityScanCompleted,
  updateExecutionState,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retryPolicy: {
    maximumAttempts: 3,
  },
});

// Define estado do workflow que pode ser consultado
export interface OpportunityScreeningState {
  status: 'starting' | 'market_scanning' | 'scoring' | 'prioritizing' | 'completed' | 'failed';
  currentStep: string;
  results?: any;
  error?: string;
}

let workflowState: OpportunityScreeningState = {
  status: 'starting',
  currentStep: 'init',
};

// Query permite consultar estado do workflow
export const queryState = defineQuery<OpportunityScreeningState>('state', () => {
  return workflowState;
});

// Signal permite enviar informações para workflow em execução
export const signalCancel = defineSignal('cancel', () => {
  workflowState.status = 'failed';
  workflowState.error = 'Cancelled via signal';
  throw new Error('Workflow cancelled');
});

/**
 * Workflow principal: Oportunidade Screening
 * Orquestra: Market Scanner → Scoring → Prioritization → Persist
 */
export async function opportunityScreeningWorkflow(input: {
  account_id: string;
  venture_id: string;
  opportunities: any[];
}): Promise<any> {
  const { account_id, venture_id, opportunities } = input;

  // Registra handlers para sinais e queries
  setHandler(signalCancel);
  setHandler(queryState);

  try {
    // Step 1: Market Analysis
    workflowState = {
      status: 'market_scanning',
      currentStep: 'market_scanner',
    };

    const marketAnalysis = [];
    for (const opportunity of opportunities) {
      const result = await runMarketScannerAgent(
        account_id,
        venture_id,
        opportunity
      );
      marketAnalysis.push(result);
      await updateExecutionState(account_id, venture_id, 'market_scanning', {
        completed: marketAnalysis.length,
        total: opportunities.length,
      });
    }

    // Step 2: Scoring
    workflowState = {
      status: 'scoring',
      currentStep: 'scoring_agent',
    };

    const scoredResults = await runScoringAgent(
      account_id,
      venture_id,
      marketAnalysis
    );

    await updateExecutionState(account_id, venture_id, 'scoring', {
      scored: true,
    });

    // Step 3: Prioritization
    workflowState = {
      status: 'prioritizing',
      currentStep: 'prioritization_agent',
    };

    const prioritized = await runPrioritizationAgent(
      account_id,
      venture_id,
      scoredResults
    );

    await updateExecutionState(account_id, venture_id, 'prioritizing', {
      prioritized: true,
    });

    // Step 4: Persist Results
    const scanId = await persistOpportunityScan(
      account_id,
      venture_id,
      prioritized
    );

    // Step 5: Emit Event
    await emitOpportunityScanCompleted(account_id, venture_id, scanId, prioritized);

    workflowState = {
      status: 'completed',
      currentStep: 'done',
      results: {
        scan_id: scanId,
        opportunities_analyzed: opportunities.length,
      },
    };

    return {
      scan_id: scanId,
      status: 'completed',
      results: prioritized,
    };
  } catch (error) {
    workflowState = {
      status: 'failed',
      currentStep: 'error',
      error: (error as Error).message,
    };
    throw error;
  }
}

/**
 * Workflow adicional: Quick Scan (versão lite)
 */
export async function quickOpportunityScanWorkflow(input: {
  account_id: string;
  venture_id: string;
  opportunity: any;
}): Promise<any> {
  const { account_id, venture_id, opportunity } = input;

  workflowState = {
    status: 'market_scanning',
    currentStep: 'market_scanner',
  };

  const analysis = await runMarketScannerAgent(
    account_id,
    venture_id,
    opportunity
  );

  workflowState = {
    status: 'completed',
    currentStep: 'done',
    results: { analysis },
  };

  return analysis;
}
```

### 3.3 `worker.ts`

O worker é o processo que registra workflows + activities e começa a processar:

```typescript
// apps/opportunity/src/temporal/worker.ts
import { Worker, NativeConnection } from '@temporalio/worker';
import * as workflows from './workflows';
import * as activities from './activities';
import { logger } from '@bruce/logger';

async function startWorker() {
  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const taskQueue = 'bruce-opportunity';

  try {
    logger.info({ address, taskQueue }, 'Starting Temporal worker');

    // Conecta ao Temporal server
    const connection = await NativeConnection.connect({
      address,
    });

    // Cria worker
    const worker = await Worker.create({
      connection,
      namespace: 'default',
      taskQueue,
      workflowsPath: require.resolve('./workflows'),
      activities,
      // Opções adicionais:
      dataConverter: undefined, // usa default JSON serializer
      maxActivitiesPerSecond: 100,
      maxConcurrentActivityExecutionSize: 100,
      maxConcurrentWorkflowTaskExecutionSize: 100,
    });

    logger.info({ taskQueue }, 'Worker registered and listening');

    // Inicia o worker (bloqueia até interrupção)
    await worker.run();
  } catch (error) {
    logger.error({ error, address, taskQueue }, 'Worker failed to start');
    process.exit(1);
  }
}

// Se executado como script
if (require.main === module) {
  startWorker().catch((error) => {
    logger.error({ error }, 'Unexpected error in worker startup');
    process.exit(1);
  });
}

export default startWorker;
```

### 3.4 `config.ts`

```typescript
// apps/opportunity/src/temporal/config.ts
export const OPPORTUNITY_TASK_QUEUE = 'bruce-opportunity';

export const WORKFLOW_TIMEOUTS = {
  opportunityScreening: {
    executionTimeout: 3600, // 1 hora
    decisionTaskTimeout: 60, // 1 minuto
  },
  quickScan: {
    executionTimeout: 600, // 10 minutos
    decisionTaskTimeout: 30,
  },
};
```

---

## 4. Como Iniciar um Workflow (do HTTP API)

Exemplos de como chamar workflows de uma HTTP route:

```typescript
// apps/opportunity/src/routes/scans.ts
import { Client } from '@temporalio/client';
import { OPPORTUNITY_TASK_QUEUE } from '../temporal/config';

export async function startOpportunityScanWorkflow(
  accountId: string,
  ventureId: string,
  opportunities: any[]
) {
  const client = new Client({
    connection: await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    }),
  });

  // Cria workflow ID único
  const workflowId = `opportunity-scan-${accountId}-${ventureId}-${Date.now()}`;

  try {
    const handle = await client.workflow.start('opportunityScreeningWorkflow', {
      taskQueue: OPPORTUNITY_TASK_QUEUE,
      workflowId,
      input: {
        account_id: accountId,
        venture_id: ventureId,
        opportunities,
      },
    });

    return {
      workflow_id: workflowId,
      status: 'queued',
      execution_id: handle.execution.runId,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to start workflow');
    throw error;
  }
}
```

---

## 5. Consultar Status de Workflow

```typescript
// apps/opportunity/src/routes/jobs.ts
import { Client } from '@temporalio/client';

export async function getWorkflowStatus(workflowId: string) {
  const client = new Client({
    connection: await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    }),
  });

  try {
    const handle = client.getHandle(workflowId);
    const state = await handle.query('state'); // Chama custom query
    const execution = await handle.describe();

    return {
      workflow_id: workflowId,
      status: execution.status,
      state,
    };
  } catch (error) {
    logger.error({ error, workflowId }, 'Failed to get workflow status');
    throw error;
  }
}
```

---

## 6. Migrrar Specs JSON → Temporal

Para cada `modules/{module}/workflows/{name}.workflow.json`, criar correspondente Temporal workflow:

### Exemplo: opportunity-screening.workflow.json

```json
{
  "name": "opportunity-screening",
  "steps": [
    {
      "name": "market-scanner",
      "agent": "market-scanner",
      "timeout": "300s",
      "retry": { "maxAttempts": 3 }
    },
    {
      "name": "scoring-agent",
      "agent": "scoring-agent",
      "dependsOn": "market-scanner",
      "timeout": "300s"
    },
    {
      "name": "prioritization-agent",
      "agent": "prioritization-agent",
      "dependsOn": "scoring-agent",
      "timeout": "300s"
    }
  ]
}
```

Fica como `opportunityScreeningWorkflow()` no `workflows.ts`, com activities para cada step.

---

## 7. Prioridade de Implementação

**Fase 3.1 (Semana 1):**
1. bruce-core: venture-creation-workflow
2. opportunity: opportunity-screening + quick-scan
3. add-venture: venture-addition-workflow

**Fase 3.2 (Semana 2):**
4. brand-aid: brand-analysis-workflow
5. builder: builder-workflow
6. gtm: gtm-analysis-workflow

**Fase 3.3 (Depois):**
7. startup-ops: startup-ops-workflow
8. portfolio: portfolio-tracking-workflow
9. bruce-memory: memory-consolidation-workflow

---

## 8. Configurações Necessárias

### `.env` para workers:

```bash
# Temporal
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default

# Logging
LOG_LEVEL=debug
NODE_ENV=development

# Banco de dados (usado por activities)
DATABASE_URL=postgresql://bruce:bruce_dev_password@localhost:5432/bruce_dev
REDIS_URL=redis://localhost:6379
```

### `package.json` de cada app:

```json
{
  "scripts": {
    "worker": "tsx src/temporal/worker.ts",
    "worker:watch": "tsx watch src/temporal/worker.ts"
  },
  "dependencies": {
    "@temporalio/client": "^1.0.0",
    "@temporalio/worker": "^1.0.0"
  }
}
```

---

## 9. Monitorar Workflows

Acessar Temporal UI em `http://localhost:8080`:
- Ver workflows em execução
- Ver activities completadas
- Ver logs de cada step
- Ver retry history
- Manualmente sinalizar workflows (ex: cancel)

---

## Checklist de Implementação

- [ ] Criar estrutura `apps/{module}/src/temporal/`
- [ ] Implementar activities para cada agente
- [ ] Implementar workflows (traduzirem *.workflow.json)
- [ ] Implementar worker startup
- [ ] Testar workflows com Temporal UI
- [ ] Implementar queries e signals (status polling)
- [ ] Integrar com database persistence
- [ ] Integrar com event bus
- [ ] Adicionar retry/timeout policies
- [ ] Documentar como adicionar novo workflow

---

## Done Criteria

✅ **Fase 3.1 está completa quando:**

1. Workers para bruce-core, opportunity, add-venture rodando sem erros
2. Temporal UI mostra workflows em execução
3. `opportunityScreeningWorkflow` roda fim-a-fim com 3 agentes
4. Status queries funcionam (`GET /jobs/{id}` retorna state)
5. Erros em activities são retentados até 3x
6. Eventos são emitidos ao completion
7. Dados persistem no banco após workflow completion

---

## Próximos Passos

Após completar a Fase 3:
- **Fase 4:** Implementar HTTP APIs que iniciam workflows
