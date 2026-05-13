# Fase 2 — Runtime de Agentes

**Status:** Não iniciado  
**Prioridade:** Crítica (necessário para Fase 3 e 4)  
**Duração estimada:** 2–3 dias  
**Responsável:** Backend Engineers

---

## Visão Geral

O agent runtime é a máquina que lê as especificações de agentes na pasta `modules/` e as executa. Cada agente tem:

- **SKILL.md** — Instruções do agente (system prompt)
- **capabilities.json** — Configuração de modelo, timeout, retry
- **input.schema.json** — Validação de entrada
- **output.schema.json** — Validação de saída
- **tools.json** — Ferramentas que o agente pode usar

O runtime:
1. Carrega a spec do agente
2. Valida entrada
3. Chama LLM com system prompt do SKILL.md
4. Valida saída contra schema
5. Se validação falhar, retenta até 3x
6. Retorna output tipado

---

## 1. Estrutura do Package

**Localização:** `packages/agent-runtime/`

```
packages/agent-runtime/
├── src/
│   ├── index.ts                      # Exports principais
│   ├── agent-runner.ts               # Classe AgentRunner (núcleo)
│   ├── agent-loader.ts               # Carrega specs de agentes
│   ├── tool-registry.ts              # Registry de ferramentas
│   ├── validators.ts                 # Input/output validation
│   ├── errors.ts                     # Exceções customizadas
│   └── types.ts                      # Interfaces
├── package.json
├── tsconfig.json
└── README.md
```

---

## 2. Tipos Principais

```typescript
// packages/agent-runtime/src/types.ts
import { z } from 'zod';

export interface AgentCapabilities {
  model: string;
  provider: string;
  temperature?: number;
  maxTokens?: number;
  stateless: boolean; // Se true, cada execução é independent
  retryPolicy?: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

export interface AgentSpec {
  id: string;
  module: string;
  name: string;
  description: string;
  skillPrompt: string; // Conteúdo de SKILL.md
  capabilities: AgentCapabilities;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  tools: ToolDefinition[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ExecutionContext {
  accountId: string;
  ventureId?: string;
  executionId: string;
  module: string;
  correlationId: string;
}

export interface AgentExecutionResult<T> {
  success: boolean;
  output?: T;
  error?: string;
  attempts: number;
  executionTimeMs: number;
}
```

---

## 3. AgentLoader

Carrega a especificação de um agente do filesystem:

```typescript
// packages/agent-runtime/src/agent-loader.ts
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { AgentSpec, AgentCapabilities, ToolDefinition } from './types';
import { logger } from '@bruce/logger';

export class AgentLoader {
  private modulesDir: string;
  private cache: Map<string, AgentSpec> = new Map();

  constructor(modulesDir: string = path.resolve(process.cwd(), 'modules')) {
    this.modulesDir = modulesDir;
  }

  /**
   * Carrega spec completa de um agente
   * Exemplo: agentId='market-scanner', module='opportunity'
   * Procura em: modules/opportunity/agents/market-scanner/
   */
  async loadAgent(module: string, agentId: string): Promise<AgentSpec> {
    const cacheKey = `${module}:${agentId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const agentDir = path.join(this.modulesDir, module, 'agents', agentId);

    try {
      // Carrega cada componente
      const skillPrompt = await this.loadSkillPrompt(agentDir);
      const capabilities = await this.loadCapabilities(agentDir);
      const inputSchema = await this.loadSchema(agentDir, 'input');
      const outputSchema = await this.loadSchema(agentDir, 'output');
      const tools = await this.loadTools(agentDir);

      const spec: AgentSpec = {
        id: agentId,
        module,
        name: agentId, // Pode ser mais descritivo
        description: `Agent ${agentId} in module ${module}`,
        skillPrompt,
        capabilities,
        inputSchema,
        outputSchema,
        tools,
      };

      this.cache.set(cacheKey, spec);
      logger.info({ module, agentId }, 'Loaded agent spec');
      return spec;
    } catch (error) {
      logger.error({ error, module, agentId }, 'Failed to load agent spec');
      throw error;
    }
  }

  private async loadSkillPrompt(agentDir: string): Promise<string> {
    const path_ = path.join(agentDir, 'SKILL.md');
    return await fs.readFile(path_, 'utf-8');
  }

  private async loadCapabilities(agentDir: string): Promise<AgentCapabilities> {
    const path_ = path.join(agentDir, 'capabilities.json');
    const content = await fs.readFile(path_, 'utf-8');
    return JSON.parse(content);
  }

  private async loadSchema(agentDir: string, type: 'input' | 'output'): Promise<z.ZodSchema> {
    const path_ = path.join(agentDir, `${type}.schema.json`);
    const content = await fs.readFile(path_, 'utf-8');
    const schemaJson = JSON.parse(content);

    // Converte JSON schema para Zod (simplificado)
    // Em produção, usar json-schema-to-zod ou similar
    return z.object(schemaJson.properties || {});
  }

  private async loadTools(agentDir: string): Promise<ToolDefinition[]> {
    const path_ = path.join(agentDir, 'tools.json');

    try {
      const content = await fs.readFile(path_, 'utf-8');
      return JSON.parse(content).tools || [];
    } catch {
      // Arquivo tools.json é opcional
      return [];
    }
  }

  /**
   * Invalida cache para reloadar specs (útil em desenvolvimento)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const agentLoader = new AgentLoader();
```

---

## 4. Tool Registry

Mapa de nomes de ferramenta para implementações:

```typescript
// packages/agent-runtime/src/tool-registry.ts
import { db } from '@bruce/db';
import { getStorageClient } from '@bruce/storage';
import { getRedisClient } from '@bruce/redis';
import { logger } from '@bruce/logger';

export type ToolImplementation = (input: any, context: any) => Promise<any>;

export class ToolRegistry {
  private tools: Map<string, ToolImplementation> = new Map();

  constructor() {
    this.registerBuiltinTools();
  }

  private registerBuiltinTools(): void {
    // Ferramentas padrão disponíveis para todos os agentes

    this.register('web_search', async (input: { query: string; maxResults?: number }) => {
      // Integração com Serper ou Tavily
      logger.info({ query: input.query }, 'Web search requested');
      // TODO: Implementar chamada a API de busca
      return { results: [] };
    });

    this.register('db_read', async (input: { query: string }, context: any) => {
      // Executa query SQL diretamente (dangerous, apenas para agentes trusted)
      logger.warn({ query: input.query }, 'DB read requested');
      // Seria mais seguro ter queries pré-definidas
      throw new Error('db_read not yet implemented for safety');
    });

    this.register('db_write', async (input: any, context: any) => {
      throw new Error('db_write requires explicit authorization');
    });

    this.register('storage_read', async (input: { key: string }) => {
      const storage = getStorageClient();
      return await storage.download(input.key);
    });

    this.register('storage_write', async (input: { key: string; content: string }) => {
      const storage = getStorageClient();
      const fileKey = await storage.upload('temp', 'temp', 'temp', input.key, input.content);
      return { fileKey };
    });

    this.register('vector_search', async (input: { query: string; topK?: number; module?: string }) => {
      // Busca em Qdrant
      logger.info({ query: input.query }, 'Vector search requested');
      // TODO: Conectar a Qdrant
      return { results: [] };
    });

    this.register('http_fetch', async (input: { url: string; method?: string; headers?: any; body?: any }) => {
      const response = await fetch(input.url, {
        method: input.method || 'GET',
        headers: input.headers,
        body: input.body ? JSON.stringify(input.body) : undefined,
      });
      return {
        status: response.status,
        data: await response.json(),
      };
    });

    this.register('redis_get', async (input: { key: string }) => {
      const redis = getRedisClient();
      return await redis.get('system', 'temp', 'temp', 'temp', input.key);
    });

    this.register('redis_set', async (input: { key: string; value: any; ttl?: number }) => {
      const redis = getRedisClient();
      await redis.set('system', 'temp', 'temp', 'temp', input.key, input.value, input.ttl);
      return { success: true };
    });
  }

  register(name: string, implementation: ToolImplementation): void {
    this.tools.set(name, implementation);
    logger.debug({ name }, 'Registered tool');
  }

  get(name: string): ToolImplementation | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getAll(): Record<string, ToolImplementation> {
    return Object.fromEntries(this.tools);
  }
}

let instance: ToolRegistry;

export function getToolRegistry(): ToolRegistry {
  if (!instance) {
    instance = new ToolRegistry();
  }
  return instance;
}
```

---

## 5. AgentRunner (Núcleo)

A classe principal que orquestra tudo:

```typescript
// packages/agent-runtime/src/agent-runner.ts
import { z } from 'zod';
import { LLMClient, createLLMClient } from '@bruce/llm';
import { logger } from '@bruce/logger';
import { agentLoader } from './agent-loader';
import { getToolRegistry } from './tool-registry';
import {
  AgentSpec,
  ExecutionContext,
  AgentExecutionResult,
} from './types';

export class AgentRunner {
  private llmClient: LLMClient;
  private agentLoader = agentLoader;
  private toolRegistry = getToolRegistry();

  constructor() {
    this.llmClient = createLLMClient();
  }

  /**
   * Executa um agente
   * @param module - Nome do módulo (ex: 'opportunity')
   * @param agentId - ID do agente (ex: 'market-scanner')
   * @param input - Dados de entrada (validados contra inputSchema)
   * @param context - Contexto de execução (accountId, ventureId, etc.)
   * @returns Resultado validado contra outputSchema
   */
  async run<T = any>(
    module: string,
    agentId: string,
    input: unknown,
    context: ExecutionContext
  ): Promise<AgentExecutionResult<T>> {
    const startTime = Date.now();
    const maxAttempts = 3;
    let lastError: Error | null = null;

    // Carrega spec do agente
    const spec = await this.agentLoader.loadAgent(module, agentId);

    // Valida input
    let validatedInput: any;
    try {
      validatedInput = spec.inputSchema.parse(input);
    } catch (error) {
      logger.error(
        { error, module, agentId, input },
        'Input validation failed'
      );
      return {
        success: false,
        error: `Input validation failed: ${(error as Error).message}`,
        attempts: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Tenta executar até maxAttempts vezes
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logger.info(
          { module, agentId, attempt, maxAttempts },
          'Executing agent'
        );

        const output = await this.executeWithTools<T>(
          spec,
          validatedInput,
          context
        );

        logger.info(
          { module, agentId, executionTimeMs: Date.now() - startTime },
          'Agent execution successful'
        );

        return {
          success: true,
          output,
          attempts: attempt,
          executionTimeMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          { error: lastError.message, module, agentId, attempt },
          'Agent execution failed, retrying...'
        );

        // Backoff exponencial
        if (attempt < maxAttempts) {
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    return {
      success: false,
      error: `Agent execution failed after ${maxAttempts} attempts: ${lastError?.message}`,
      attempts: maxAttempts,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Executa agente com suporte a tools
   */
  private async executeWithTools<T>(
    spec: AgentSpec,
    input: any,
    context: ExecutionContext
  ): Promise<T> {
    const inputJson = JSON.stringify(input, null, 2);
    const userMessage = `Process the following input:\n\n${inputJson}`;

    // Se agente tem tools, usa tool calling
    if (spec.tools.length > 0) {
      return await this.llmClient.callAgentWithTools(
        spec.skillPrompt,
        userMessage,
        spec.tools,
        spec.outputSchema as z.ZodSchema<T>,
        {
          temperature: spec.capabilities.temperature,
          maxTokens: spec.capabilities.maxTokens,
          retries: spec.capabilities.retryPolicy?.maxAttempts ?? 3,
        }
      );
    }

    // Agente sem tools: JSON mode simples
    return await this.llmClient.callAgent(
      spec.skillPrompt,
      userMessage,
      spec.outputSchema as z.ZodSchema<T>,
      {
        temperature: spec.capabilities.temperature,
        maxTokens: spec.capabilities.maxTokens,
        retries: spec.capabilities.retryPolicy?.maxAttempts ?? 3,
      }
    );
  }
}

let instance: AgentRunner;

export function getAgentRunner(): AgentRunner {
  if (!instance) {
    instance = new AgentRunner();
  }
  return instance;
}
```

---

## 6. Validadores

```typescript
// packages/agent-runtime/src/validators.ts
import { z } from 'zod';
import { logger } from '@bruce/logger';

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: any[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateInput<T>(
  input: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ errors: error.errors }, 'Input validation failed');
      throw new ValidationError('Input validation failed', error.errors);
    }
    throw error;
  }
}

export function validateOutput<T>(
  output: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(output);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ errors: error.errors, output }, 'Output validation failed');
      throw new ValidationError('Output validation failed', error.errors);
    }
    throw error;
  }
}
```

---

## 7. Erros Customizados

```typescript
// packages/agent-runtime/src/errors.ts
export class AgentRuntimeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentRuntimeError';
  }
}

export class AgentNotFoundError extends AgentRuntimeError {
  constructor(module: string, agentId: string) {
    super(
      `Agent ${agentId} not found in module ${module}`,
      'AGENT_NOT_FOUND',
      { module, agentId }
    );
  }
}

export class AgentExecutionError extends AgentRuntimeError {
  constructor(message: string, attempts: number, details?: any) {
    super(message, 'AGENT_EXECUTION_FAILED', { attempts, ...details });
  }
}

export class ToolExecutionError extends AgentRuntimeError {
  constructor(toolName: string, message: string, details?: any) {
    super(
      `Tool ${toolName} execution failed: ${message}`,
      'TOOL_EXECUTION_FAILED',
      { toolName, ...details }
    );
  }
}
```

---

## 8. Export Principal

```typescript
// packages/agent-runtime/src/index.ts
export { AgentRunner, getAgentRunner } from './agent-runner';
export { AgentLoader, agentLoader } from './agent-loader';
export { ToolRegistry, getToolRegistry } from './tool-registry';
export type {
  AgentSpec,
  AgentCapabilities,
  ExecutionContext,
  AgentExecutionResult,
  ToolDefinition,
} from './types';
export {
  AgentRuntimeError,
  AgentNotFoundError,
  AgentExecutionError,
  ToolExecutionError,
} from './errors';
```

---

## 9. Exemplo de Uso

Como um módulo usaria o agent runtime:

```typescript
// apps/opportunity/src/agents/opportunity-scanner.ts
import { getAgentRunner } from '@bruce/agent-runtime';
import { logger } from '@bruce/logger';

export async function scanOpportunity(
  accountId: string,
  ventureId: string,
  opportunityData: any
) {
  const agentRunner = getAgentRunner();

  const result = await agentRunner.run(
    'opportunity',
    'market-scanner',
    {
      opportunity: opportunityData,
      venture_id: ventureId,
    },
    {
      accountId,
      ventureId,
      module: 'opportunity',
      executionId: crypto.randomUUID(),
      correlationId: logger.correlationId, // de alguma forma rastreada
    }
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.output;
}
```

---

## 10. Integração com @bruce/llm

O agent runtime usa `@bruce/llm` para chamar LLMs. Fluxo:

1. **AgentRunner** carrega spec do agente
2. **AgentRunner** cria LLMClient configurado com modelo da `capabilities.json`
3. **LLMClient** usa o provider correto (OpenRouter, Anthropic, etc.)
4. LLM retorna resposta JSON
5. **AgentRunner** valida contra `outputSchema`
6. Se falhar, retenta até 3x com backoff exponencial

---

## Checklist de Implementação

- [ ] Criar package.json para @bruce/agent-runtime
- [ ] Implementar AgentLoader (carrega specs de módulos)
- [ ] Implementar ToolRegistry (registry de ferramentas)
- [ ] Implementar AgentRunner (orquestrador principal)
- [ ] Implementar validadores (input/output)
- [ ] Implementar erros customizados
- [ ] Escrever testes para AgentRunner
- [ ] Documentar como adicionar novos agents
- [ ] Documentar como registrar novas ferramentas

---

## Done Criteria

✅ **Fase 2 está completa quando:**

1. `pnpm run build --filter @bruce/agent-runtime` compila sem erros
2. Teste consegue carregar spec de um agente em `modules/opportunity/agents/market-scanner/`
3. Teste consegue executar um agente e receber output tipado validado
4. Retry logic funciona (executa até 3x em caso de falha)
5. Input/output validation detecta dados inválidos
6. Ferramentas básicas (web_search, storage_read, vector_search, etc.) registram sem erros
7. Correlação de logs funciona (correlation_id é propagado)

---

## Próximos Passos

Após completar a Fase 2:
- **Fase 3:** Usar AgentRunner dentro de Temporal workflows
- **Fase 4:** Expor agentes via HTTP API
