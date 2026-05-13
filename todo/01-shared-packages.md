# Fase 1 — Pacotes Compartilhados (@bruce/*)

**Status:** Não iniciado  
**Prioridade:** Crítica (bloqueador para agentes e APIs)  
**Duração estimada:** 2–3 dias  
**Responsável:** Backend / Platform Engineers

---

## Visão Geral

Os pacotes compartilhados são importados por cada módulo e serviço. Sem esses, nenhum código consegue:
- Validar dados contra schemas
- Conectar ao banco de dados
- Chamar LLMs
- Gerenciar cache Redis
- Armazenar arquivos
- Verificar autenticação
- Emitir/consumir eventos

**Objetivo:** Implementar 8 pacotes `@bruce/*` que cada módulo importa como dependências.

---

## 1. @bruce/contracts

**Localização:** `packages/contracts/`

**Responsabilidade:** Tipos TypeScript + Zod schemas gerados automaticamente a partir dos arquivos JSON na pasta `modules/`.

### 1.1 Estrutura

```
packages/contracts/
├── src/
│   ├── index.ts
│   ├── opportunity/
│   │   ├── types.ts              # GeradoMarketOpportunity, OpportunityScan, etc.
│   │   ├── schemas.ts            # Zod schemas para validação
│   │   └── index.ts              # re-exports
│   ├── venture/
│   │   ├── types.ts              # VentureLifecycle, VentureProfile, etc.
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── brand-aid/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── builder/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── gtm/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── startup-ops/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── portfolio/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── bruce-memory/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── bruce-core/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── common/
│   │   ├── module-event.ts       # ModuleEvent, ModuleHandoff, ExecutionState
│   │   ├── provider-config.ts    # LLM provider config
│   │   ├── errors.ts             # BruceError, ValidationError
│   │   └── index.ts
│   └── index.ts                  # Arquivo principal de exports
├── scripts/
│   └── generate-types.ts         # Script para gerar tipos a partir de schemas JSON
├── package.json
├── tsconfig.json
└── README.md
```

### 1.2 Script de Geração de Tipos

O arquivo `scripts/generate-types.ts` lê todos os `*.schema.json` em `modules/` e gera TypeScript tipos:

```typescript
// packages/contracts/scripts/generate-types.ts
import fs from 'fs/promises';
import path from 'path';
import { compile } from 'json-schema-to-typescript';
import { z } from 'zod';

async function generateTypes() {
  const modulesDir = path.resolve(process.cwd(), 'modules');
  
  // Procura todos os *.schema.json
  const schemas = await findJsonSchemas(modulesDir);
  
  for (const schemaPath of schemas) {
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    
    // Gera tipos TS
    const tsTypes = await compile(schema, schema.title || 'Generated');
    
    // Escreve em packages/contracts/src/{module}/types.ts
    const relativePath = path.relative(modulesDir, schemaPath);
    const outputPath = path.join(
      process.cwd(),
      'packages/contracts/src',
      relativePath.replace('.schema.json', '.types.ts')
    );
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, tsTypes);
  }
  
  console.log('✅ Tipos gerados com sucesso');
}

async function findJsonSchemas(dir: string, results: string[] = []): Promise<string[]> {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await findJsonSchemas(fullPath, results);
    } else if (file.name.endsWith('.schema.json')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

generateTypes().catch(console.error);
```

Execute com: `pnpm --filter @bruce/contracts run generate`

### 1.3 Exemplo: Tipos de Opportunity

Se `modules/opportunity/contracts/opportunity-scan.schema.json` contém:

```json
{
  "type": "object",
  "title": "OpportunityScan",
  "properties": {
    "scan_id": { "type": "string" },
    "venture_id": { "type": "string" },
    "market_size": { "type": "number" },
    "competitive_intensity": { "type": "number", "minimum": 0, "maximum": 10 },
    "founding_team_readiness": { "type": "number", "minimum": 0, "maximum": 10 },
    "status": { "enum": ["pending", "scanning", "completed", "failed"] }
  },
  "required": ["scan_id", "venture_id", "market_size"]
}
```

O gerador produz `packages/contracts/src/opportunity/types.ts`:

```typescript
export interface OpportunityScan {
  scan_id: string;
  venture_id: string;
  market_size: number;
  competitive_intensity?: number;
  founding_team_readiness?: number;
  status?: 'pending' | 'scanning' | 'completed' | 'failed';
}
```

### 1.4 Zod Schemas

Também precisa gerar Zod schemas para validação em runtime. Cria um arquivo complementar:

```typescript
// packages/contracts/src/opportunity/schemas.ts
import { z } from 'zod';

export const OpportunityScanSchema = z.object({
  scan_id: z.string().uuid(),
  venture_id: z.string().uuid(),
  market_size: z.number().positive(),
  competitive_intensity: z.number().min(0).max(10).optional(),
  founding_team_readiness: z.number().min(0).max(10).optional(),
  status: z.enum(['pending', 'scanning', 'completed', 'failed']).optional(),
});

export type OpportunityScan = z.infer<typeof OpportunityScanSchema>;
```

---

## 2. @bruce/db

**Localização:** `packages/db/`

**Responsabilidade:** ORM cliente, pool de conexões, RLS (Row-Level Security) e migrações.

### 2.1 Escolha: Drizzle ORM

Recomenda-se **Drizzle ORM** sobre Prisma porque:
- Zero runtime (compile-time only)
- Native RLS support
- Melhor performance em workspaces
- Mais controle sobre SQL

### 2.2 Estrutura

```
packages/db/
├── src/
│   ├── index.ts                 # Exports principais
│   ├── client.ts                # Configuração do cliente Drizzle + pool
│   ├── rls.ts                   # Middleware de RLS (setAccountContext)
│   ├── schema/
│   │   ├── index.ts
│   │   ├── opportunities.ts     # Tabelas do módulo opportunity
│   │   ├── ventures.ts          # Tabelas do módulo bruce-core
│   │   ├── brand-aid.ts         # Tabelas do módulo brand-aid
│   │   ├── builder.ts           # Tabelas do módulo builder
│   │   ├── gtm.ts               # Tabelas do módulo gtm
│   │   ├── startup-ops.ts       # Tabelas do módulo startup-ops
│   │   ├── portfolio.ts         # Tabelas do módulo portfolio
│   │   ├── bruce-memory.ts      # Tabelas do módulo bruce-memory
│   │   └── common.ts            # Tabelas compartilhadas (accounts, users)
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_add_rls.sql
│   │   └── ... (lida com as migrações existentes em modules/infrastructure/)
│   └── queries/
│       ├── opportunity.ts       # Helpers tipados para queries
│       ├── venture.ts
│       └── ... (um arquivo por módulo)
├── package.json
├── tsconfig.json
└── README.md
```

### 2.3 Exemplo: Client com RLS

```typescript
// packages/db/src/client.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// RLS context: define qual conta está rodando a query
let currentAccountId: string | null = null;

export function setAccountContext(accountId: string) {
  currentAccountId = accountId;
}

export function getCurrentAccountId(): string {
  if (!currentAccountId) {
    throw new Error('No account context set. Use setAccountContext() first.');
  }
  return currentAccountId;
}

// Wrapper que seta context antes de cada query
export async function withAccountContext<T>(
  accountId: string,
  fn: () => Promise<T>
): Promise<T> {
  const previous = currentAccountId;
  try {
    setAccountContext(accountId);
    return await fn();
  } finally {
    currentAccountId = previous;
  }
}

export { schema };
```

### 2.4 Schema Drizzle (exemplo)

```typescript
// packages/db/src/schema/ventures.ts
import { pgTable, text, timestamp, uuid, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const ventures = pgTable(
  'ventures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    account_id: uuid('account_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    stage: text('stage').notNull().default('concept'),
    team_profile: jsonb('team_profile'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    accountIdx: index('ventures_account_id_idx').on(table.account_id),
  })
);

// Exemplo de RLS policy (aplicada no banco):
// CREATE POLICY ventures_rls ON ventures
//   USING (account_id = current_setting('app.current_account_id')::uuid);
```

### 2.5 Migrations

Leia `modules/infrastructure/migrations/001_init.sql` e crie `packages/db/migrations/001_init.sql` com:

```sql
-- Core tables
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ventures
CREATE TABLE IF NOT EXISTS ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'concept',
  team_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ventures_account_id_idx ON ventures(account_id);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunity_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  market_size DECIMAL(15, 2),
  competitive_intensity INTEGER CHECK (competitive_intensity >= 0 AND competitive_intensity <= 10),
  founding_team_readiness INTEGER CHECK (founding_team_readiness >= 0 AND founding_team_readiness <= 10),
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX opportunity_scans_account_id_idx ON opportunity_scans(account_id);
CREATE INDEX opportunity_scans_venture_id_idx ON opportunity_scans(venture_id);

-- RLS Policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY ventures_rls ON ventures
  USING (account_id = (current_setting('app.current_account_id'))::uuid);

CREATE POLICY opportunity_scans_rls ON opportunity_scans
  USING (account_id = (current_setting('app.current_account_id'))::uuid);

-- ... tabelas dos outros módulos (brand-aid, builder, gtm, etc.)
```

Run migrations com: `pnpm --filter @bruce/db run db:migrate`

---

## 3. @bruce/llm

**Localização:** `packages/llm/`

**Responsabilidade:** Router de LLM, validação de output, retry logic.

### 3.1 Estrutura

```
packages/llm/
├── src/
│   ├── index.ts
│   ├── client.ts               # Classe LLMClient principal
│   ├── providers/
│   │   ├── openrouter.ts       # OpenRouter API
│   │   ├── anthropic.ts        # Anthropic SDK
│   │   ├── openai.ts           # OpenAI SDK
│   │   └── index.ts            # Factory
│   ├── structured-output.ts    # JSON mode / tool calling
│   ├── retry.ts                # Retry logic com backoff
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 3.2 Classe Principal: LLMClient

```typescript
// packages/llm/src/client.ts
import { z } from 'zod';
import { getLLMProvider } from './providers';
import { validateStructuredOutput } from './structured-output';
import { withRetry } from './retry';

export interface LLMCallOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  retries?: number;
}

export class LLMClient {
  private provider: string;
  private model: string;

  constructor(provider: string = process.env.LLM_PROVIDER_MODE || 'openrouter', model: string = 'openai/gpt-oss-120b:free') {
    this.provider = provider;
    this.model = model;
  }

  /**
   * Chama um agente LLM com validação estruturada de output
   * @param systemPrompt - System prompt (ex: skill.md content)
   * @param userMessage - Input do usuário
   * @param outputSchema - Zod schema para validar output
   * @param options - Opções adicionais
   * @returns Output validado contra schema
   */
  async callAgent<T>(
    systemPrompt: string,
    userMessage: string,
    outputSchema: z.ZodSchema<T>,
    options: LLMCallOptions = {}
  ): Promise<T> {
    const client = getLLMProvider(this.provider);

    // Wrapper com retry automático se validação falhar
    return withRetry(
      async () => {
        const response = await client.chat({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? 2048,
          responseFormat: { type: 'json_object' }, // Forces JSON mode
        });

        // Parse e valida contra schema
        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from LLM');

        const parsed = JSON.parse(content);
        return outputSchema.parse(parsed) as T;
      },
      options.retries ?? 3
    );
  }

  /**
   * Chama um agente com tool calling (para agentes que precisam de actions)
   */
  async callAgentWithTools<T>(
    systemPrompt: string,
    userMessage: string,
    tools: Array<{ name: string; description: string; parameters: object }>,
    outputSchema: z.ZodSchema<T>,
    options: LLMCallOptions = {}
  ): Promise<T> {
    const client = getLLMProvider(this.provider);

    return withRetry(
      async () => {
        const response = await client.chat({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          tools: tools.map((t) => ({
            type: 'function',
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          })),
          temperature: options.temperature ?? 0.7,
        });

        const toolCall = response.choices[0]?.message?.tool_calls?.[0];
        if (!toolCall) throw new Error('No tool call returned');

        const output = JSON.parse(toolCall.function.arguments);
        return outputSchema.parse(output) as T;
      },
      options.retries ?? 3
    );
  }
}

export function createLLMClient(provider?: string, model?: string): LLMClient {
  return new LLMClient(provider, model);
}
```

### 3.3 Provider OpenRouter

```typescript
// packages/llm/src/providers/openrouter.ts
import { logger } from '@bruce/logger';

export class OpenRouterProvider {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not set');
    }
  }

  async chat(options: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    responseFormat?: { type: string };
    tools?: Array<{ type: string; function: any }>;
  }) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://bruceai.dev',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        top_p: options.topP ?? 1.0,
        response_format: options.responseFormat,
        tools: options.tools,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error({ status: response.status, error }, 'OpenRouter API error');
      throw new Error(`OpenRouter API error: ${error}`);
    }

    return await response.json();
  }
}
```

### 3.4 Structured Output Validation

```typescript
// packages/llm/src/structured-output.ts
import { z } from 'zod';

export async function validateStructuredOutput<T>(
  output: unknown,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    return schema.parse(output);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Output validation failed: ${error.message}`,
        error.errors
      );
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: any[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### 3.5 Retry Logic

```typescript
// packages/llm/src/retry.ts
import { logger } from '@bruce/logger';

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, attempt); // exponential backoff
        logger.warn(
          {
            attempt: attempt + 1,
            maxRetries,
            waitTime,
            error: lastError.message,
          },
          'Retry after error'
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}
```

---

## 4. @bruce/redis

**Localização:** `packages/redis/`

**Responsabilidade:** Cliente Redis com namespace de conta.

### 4.1 Estrutura

```
packages/redis/
├── src/
│   ├── index.ts
│   ├── client.ts
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 4.2 Cliente Redis com Namespace

```typescript
// packages/redis/src/client.ts
import Redis from 'ioredis';
import { logger } from '@bruce/logger';

export class RedisClient {
  private redis: Redis;

  constructor(url?: string) {
    this.redis = new Redis(url || process.env.REDIS_URL || 'redis://localhost:6379');
    this.redis.on('error', (err) => logger.error({ err }, 'Redis error'));
  }

  /**
   * Gera chave com namespace de conta
   * Padrão: bruce:{module}:{accountId}:{resourceType}:{resourceId}:{field}
   */
  private makeKey(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string
  ): string {
    return `bruce:${module}:${accountId}:${resourceType}:${resourceId}:${field}`;
  }

  async get<T = any>(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string
  ): Promise<T | null> {
    const key = this.makeKey(accountId, module, resourceType, resourceId, field);
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string,
    value: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    const key = this.makeKey(accountId, module, resourceType, resourceId, field);
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string
  ): Promise<void> {
    const key = this.makeKey(accountId, module, resourceType, resourceId, field);
    await this.redis.del(key);
  }

  async invalidateModule(accountId: string, module: string): Promise<void> {
    const pattern = `bruce:${module}:${accountId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

let instance: RedisClient;

export function getRedisClient(): RedisClient {
  if (!instance) {
    instance = new RedisClient();
  }
  return instance;
}
```

---

## 5. @bruce/storage

**Localização:** `packages/storage/`

**Responsabilidade:** Upload/download de arquivos em S3-compatible storage (MinIO local, R2 produção).

### 5.1 Estrutura

```
packages/storage/
├── src/
│   ├── index.ts
│   ├── client.ts
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 5.2 Cliente Storage

```typescript
// packages/storage/src/client.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@bruce/logger';

export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export class StorageClient {
  private s3: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;
    this.s3 = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Gera chave: {module}/{accountId}/{resourceId}/{filename}
   */
  private makeKey(
    module: string,
    accountId: string,
    resourceId: string,
    filename: string
  ): string {
    return `${module}/${accountId}/${resourceId}/${filename}`;
  }

  async upload(
    module: string,
    accountId: string,
    resourceId: string,
    filename: string,
    content: Buffer | string,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    const key = this.makeKey(module, accountId, resourceId, filename);

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: typeof content === 'string' ? content : content,
          ContentType: contentType,
        })
      );

      logger.info({ key }, 'File uploaded to storage');
      return key;
    } catch (error) {
      logger.error({ error, key }, 'Failed to upload file');
      throw error;
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      return Buffer.from(await response.Body!.transformToByteArray());
    } catch (error) {
      logger.error({ error, key }, 'Failed to download file');
      throw error;
    }
  }

  async getSignedUrl(key: string, expirationSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: expirationSeconds });
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      logger.info({ key }, 'File deleted from storage');
    } catch (error) {
      logger.error({ error, key }, 'Failed to delete file');
      throw error;
    }
  }
}

let instance: StorageClient;

export function getStorageClient(): StorageClient {
  if (!instance) {
    instance = new StorageClient({
      bucket: process.env.STORAGE_BUCKET || 'bruce',
      region: process.env.STORAGE_REGION || 'us-east-1',
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
    });
  }
  return instance;
}
```

---

## 6. @bruce/auth

**Localização:** `packages/auth/`

**Responsabilidade:** Clerk JWT verification + middleware para Hono/Fastify.

### 6.1 Estrutura

```
packages/auth/
├── src/
│   ├── index.ts
│   ├── clerk.ts              # Clerk SDK integration
│   ├── middleware/
│   │   ├── hono.ts           # Middleware Hono
│   │   └── fastify.ts        # Middleware Fastify
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 6.2 Clerk Verification

```typescript
// packages/auth/src/clerk.ts
import { jwtDecode } from 'jwt-decode';
import { logger } from '@bruce/logger';

export interface ClerkSession {
  userId: string;
  orgId: string; // = accountId
  orgSlug: string;
}

export function verifyClerkJWT(token: string): ClerkSession {
  try {
    const decoded = jwtDecode<{
      sub: string; // user ID
      org_id: string;
      org_slug: string;
    }>(token);

    return {
      userId: decoded.sub,
      orgId: decoded.org_id,
      orgSlug: decoded.org_slug,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to verify Clerk JWT');
    throw new Error('Invalid or expired JWT');
  }
}

export function extractTokenFromHeader(authHeader: string): string {
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid Authorization header format');
  }
  return parts[1];
}
```

### 6.3 Middleware Hono

```typescript
// packages/auth/src/middleware/hono.ts
import { Context, Next } from 'hono';
import { verifyClerkJWT, extractTokenFromHeader } from '../clerk';

export interface AuthContext {
  userId: string;
  accountId: string; // orgId
  orgSlug: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

export function authMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        return c.json({ error: 'Missing Authorization header' }, 401);
      }

      const token = extractTokenFromHeader(authHeader);
      const session = verifyClerkJWT(token);

      c.set('auth', {
        userId: session.userId,
        accountId: session.orgId,
        orgSlug: session.orgSlug,
      });

      await next();
    } catch (error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  };
}

export function getAuth(c: Context): AuthContext {
  const auth = c.get('auth');
  if (!auth) {
    throw new Error('Auth context not found. Ensure authMiddleware is applied.');
  }
  return auth;
}
```

---

## 7. @bruce/events

**Localização:** `packages/events/`

**Responsabilidade:** Event bus para comunicação inter-módulos.

### 7.1 Estrutura

```
packages/events/
├── src/
│   ├── index.ts
│   ├── event-bus.ts
│   ├── types.ts
│   └── adapters/
│       ├── in-memory.ts       # Local dev
│       └── redis-pubsub.ts    # Produção
├── package.json
├── tsconfig.json
└── README.md
```

### 7.2 Event Bus

```typescript
// packages/events/src/event-bus.ts
import { ModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';

export type EventHandler = (event: ModuleEvent) => Promise<void>;

export abstract class EventBus {
  abstract emit(event: ModuleEvent): Promise<void>;
  abstract subscribe(eventType: string, handler: EventHandler): void;
  abstract close(): Promise<void>;
}

// In-memory adapter para dev local
export class InMemoryEventBus extends EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async emit(event: ModuleEvent): Promise<void> {
    logger.info({ event }, 'Emitting event');
    const handlers = this.handlers.get(event.type) || [];

    // Execute em paralelo
    await Promise.all(handlers.map((h) => h(event).catch((e) => logger.error({ e }, 'Event handler failed'))));
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    logger.debug({ eventType }, 'Subscribed to event type');
  }

  async close(): Promise<void> {
    this.handlers.clear();
  }
}

// Redis adapter para produção
export class RedisPubSubEventBus extends EventBus {
  private redis: any; // Redis client
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(redis: any) {
    super();
    this.redis = redis;
  }

  async emit(event: ModuleEvent): Promise<void> {
    logger.info({ event }, 'Publishing event to Redis');
    await this.redis.publish(`bruce:events:${event.type}`, JSON.stringify(event));
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      this.redis.subscribe(`bruce:events:${eventType}`, (message: string) => {
        const event = JSON.parse(message);
        const handlers = this.handlers.get(eventType) || [];
        handlers.forEach((h) => h(event).catch((e) => logger.error({ e }, 'Event handler failed')));
      });
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

let instance: EventBus;

export function getEventBus(): EventBus {
  if (!instance) {
    if (process.env.NODE_ENV === 'production') {
      const redis = require('ioredis');
      instance = new RedisPubSubEventBus(redis);
    } else {
      instance = new InMemoryEventBus();
    }
  }
  return instance;
}
```

---

## 8. @bruce/logger

**Localização:** `packages/logger/`

**Responsabilidade:** Structured logging com Pino.

### 8.1 Estrutura

```
packages/logger/
├── src/
│   ├── index.ts
│   └── logger.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 8.2 Logger

```typescript
// packages/logger/src/logger.ts
import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});

export const logger = {
  debug: (data: any, message?: string) => pinoLogger.debug(data, message),
  info: (data: any, message?: string) => pinoLogger.info(data, message),
  warn: (data: any, message?: string) => pinoLogger.warn(data, message),
  error: (data: any, message?: string) => pinoLogger.error(data, message),
};

export { pino };
```

---

## Checklist de Implementação

- [ ] @bruce/contracts: Gerar tipos de todos os schemas JSON
- [ ] @bruce/db: Configurar Drizzle, RLS, migrations
- [ ] @bruce/llm: Integrar OpenRouter + Anthropic + OpenAI
- [ ] @bruce/redis: Cliente com namespace de conta
- [ ] @bruce/storage: Upload/download com S3
- [ ] @bruce/auth: Clerk JWT verification
- [ ] @bruce/events: Event bus in-memory + Redis adapter
- [ ] @bruce/logger: Structured logging
- [ ] Todos os packages buildáveis: `pnpm run build`
- [ ] Testes para cada package: `pnpm run test`

---

## Done Criteria

✅ **Fase 1 está completa quando:**

1. `pnpm run build` compila todos os 8 packages
2. `pnpm --filter @bruce/contracts run generate` gera tipos de todos os schemas JSON
3. `pnpm --filter @bruce/db run db:migrate` executa migrações sem erros
4. Um teste consegue criar um LLM client e fazer um chamado a um provider
5. Todos os imports `import { ... } from '@bruce/*'` resolvem corretamente
6. `pnpm run type-check` passa (zero TS errors)

---

## Próximos Passos

Após completar a Fase 1:
- **Fase 2:** Implementar agent runtime que lê specs dos agentes
- **Fase 3:** Implementar Temporal workflows
- **Fase 4:** Implementar HTTP APIs
