# Fase 5 — Autenticação e Multi-tenancy

**Status:** Não iniciado  
**Prioridade:** Alta (bloqueador para fases SaaS)  
**Duração estimada:** 1–2 dias  
**Responsável:** Backend / Security  
**Dependências:** Fases 0–4 (monorepo, shared packages, runtime, workers)

---

## Visão Geral

BruceAI é uma plataforma multi-tenant onde cada organização tem seu próprio espaço isolado. Esta fase implementa:

1. **Integração com Clerk** — criação automática de contas quando uma org é criada
2. **JWT verification** — toda requisição HTTP é validada contra JWT do Clerk
3. **Row-Level Security (RLS)** — queries automaticamente filtram por `account_id`
4. **Inter-module JWT** — módulos comunicam entre si de forma segura
5. **Plano multi-tier** — diferentes planos (free/pro/enterprise) com limites de uso

**Objetivo:** Garantir isolamento completo entre tenants e aplicar limites de uso conforme o plano contratado.

---

## 1. Integração Clerk

### 1.1 Setup no Dashboard Clerk

1. Criar app no [dashboard.clerk.com](https://dashboard.clerk.com)
2. Copiar `CLERK_SECRET_KEY` e `CLERK_PUBLISHABLE_KEY`
3. No Clerk → Webhooks → Criar webhook para a aplicação:
   - Endpoint: `https://seu-dominio/webhooks/clerk` (será implementado em fase 4)
   - Events: `organization.created`, `organization.updated`, `organization.deleted`
   - Teste: Clerk envia requests POST com `X-Svix-ID` header

### 1.2 Webhook Handler em bruce-core

Arquivo: `apps/bruce-core/src/api/webhooks/clerk.handler.ts`

```typescript
import { Hono } from 'hono';
import { verify } from '@svix/svix-ts';
import { getDB } from '@bruce/db';
import { stripe } from '@bruce/stripe-client';

const clerkWebhook = new Hono();

// Tipos do Clerk
interface OrganizationEvent {
  type: 'organization.created' | 'organization.updated' | 'organization.deleted';
  data: {
    id: string;
    name: string;
    slug: string;
    public_metadata?: {
      plan?: 'free' | 'pro' | 'enterprise';
    };
  };
}

clerkWebhook.post('/clerk', async (c) => {
  const signature = c.req.header('svix-signature');
  const body = await c.req.text();

  // Validar assinatura Svix
  try {
    const evt = verify(body, signature || '', process.env.CLERK_WEBHOOK_SECRET || '');
  } catch (err) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const event = JSON.parse(body) as OrganizationEvent;
  const db = getDB();

  if (event.type === 'organization.created') {
    const { id: org_id, name, slug } = event.data;
    const plan = event.data.public_metadata?.plan || 'free';

    try {
      // 1. Criar registro de account em bruce_core.accounts
      await db
        .insert(accounts)
        .values({
          account_id: org_id,
          name,
          slug,
          plan,
          status: 'active',
          created_at: new Date(),
        })
        .run();

      // 2. Criar customer no Stripe
      const stripeCustomer = await stripe.customers.create({
        metadata: {
          account_id: org_id,
          bruce_slug: slug,
        },
        name,
      });

      // 3. Atualizar account com stripe_customer_id
      await db
        .update(accounts)
        .set({ stripe_customer_id: stripeCustomer.id })
        .where(eq(accounts.account_id, org_id))
        .run();

      console.log(`✅ Account created: ${org_id}`);
      return c.json({ ok: true });
    } catch (error) {
      console.error(`❌ Failed to create account:`, error);
      return c.json({ error: 'Failed to create account' }, 500);
    }
  }

  if (event.type === 'organization.deleted') {
    const { id: org_id } = event.data;

    try {
      // Soft delete — mark as inactive instead of removing
      await db
        .update(accounts)
        .set({ status: 'deleted', deleted_at: new Date() })
        .where(eq(accounts.account_id, org_id))
        .run();

      console.log(`✅ Account marked deleted: ${org_id}`);
      return c.json({ ok: true });
    } catch (error) {
      console.error(`❌ Failed to delete account:`, error);
      return c.json({ error: 'Failed to delete account' }, 500);
    }
  }

  return c.json({ ok: true });
});

export default clerkWebhook;
```

**O que faz:**
- Recebe eventos do Clerk via webhook
- Valida assinatura Svix
- Cria `accounts` record na DB
- Cria customer no Stripe
- Marca como deletada (soft delete) quando org é removida

---

## 2. JWT Verification Middleware

Arquivo: `packages/auth/src/clerk-middleware.ts`

```typescript
import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';

interface AuthContext {
  userId: string;
  organizationId: string;
  accountId: string; // = organizationId
  sessionId: string;
}

export const clerkAuth = createMiddleware<{
  Variables: {
    auth: AuthContext;
  };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    // Verificar JWT com chave pública do Clerk
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || '',
    });

    const auth: AuthContext = {
      userId: decoded.sub || '',
      organizationId: decoded.org_id || '',
      accountId: decoded.org_id || '', // Multi-tenancy: org_id = account_id
      sessionId: decoded.sid || '',
    };

    // Injetar no contexto Hono
    c.set('auth', auth);

    // Chamar próximo middleware
    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});
```

**Uso em handlers:**

```typescript
app.get('/ventures', clerkAuth, async (c) => {
  const auth = c.get('auth');
  console.log(`User ${auth.userId} from account ${auth.accountId}`);
  // Todas as queries já filtram por account_id (ver RLS abaixo)
});
```

---

## 3. Row-Level Security (RLS) no PostgreSQL

A chave para isolamento multi-tenant é garantir que TODA query filtre automaticamente por `account_id`.

### 3.1 Schema de Accounts

Arquivo: `packages/db/src/schema/accounts.ts`

```typescript
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  account_id: varchar('account_id', { length: 255 }).primaryKey(), // = Clerk org_id
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: varchar('plan', { length: 50 }).default('free'), // free | pro | enterprise
  stripe_customer_id: text('stripe_customer_id'),
  status: varchar('status', { length: 50 }).default('active'), // active | deleted
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});
```

### 3.2 Middleware de RLS no Drizzle

Arquivo: `packages/db/src/rls-middleware.ts`

```typescript
import { PoolClient } from 'pg';

/**
 * RLS Middleware: antes de fazer queries, configura a sessão PostgreSQL
 * com o account_id atual. Todas as tabelas devem checar esse setting
 * em suas policies.
 */
export async function applyRLS(
  client: PoolClient,
  accountId: string,
): Promise<void> {
  // PostgreSQL permite variables de sessão via SET
  // Esse valor fica disponível em policies SQL
  await client.query('SET app.current_account_id = $1', [accountId]);
}

/**
 * Helper para executar queries com RLS garantido
 */
export async function withRLS<T>(
  accountId: string,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await applyRLS(client, accountId);
    return await fn(client);
  } finally {
    client.release();
  }
}
```

### 3.3 RLS Policies no PostgreSQL

Execute esse SQL na primeira run (migration):

```sql
-- Criar extensão necessária
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adicionar coluna de account_id a TODAS as tabelas tenant-specific
ALTER TABLE ventures ADD COLUMN account_id VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE hypothesis ADD COLUMN account_id VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE metrics ADD COLUMN account_id VARCHAR(255) NOT NULL DEFAULT '';
-- ... para cada tabela

-- Criar política de RLS para ventures
CREATE POLICY rls_ventures_account ON ventures
  USING (account_id = current_setting('app.current_account_id')::text);

CREATE POLICY rls_ventures_insert ON ventures
  WITH CHECK (account_id = current_setting('app.current_account_id')::text);

-- Repetir para cada tabela tenant-specific
CREATE POLICY rls_hypothesis_account ON hypothesis
  USING (account_id = current_setting('app.current_account_id')::text);

CREATE POLICY rls_hypothesis_insert ON hypothesis
  WITH CHECK (account_id = current_setting('app.current_account_id')::text);
```

### 3.4 Validação de RLS

Arquivo: `packages/db/src/tests/rls.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getDB } from '@bruce/db';

describe('RLS — Row Level Security', () => {
  it('should prevent account A from seeing ventures created by account B', async () => {
    const db = getDB();

    // Account A cria uma venture
    const accountA = 'org_123';
    const ventureA = await db
      .insert(ventures)
      .values({
        venture_id: 'vent_a1',
        account_id: accountA,
        name: 'Startup A',
      })
      .returning()
      .run();

    expect(ventureA).toHaveLength(1);

    // Account B tenta listar ventures
    const accountB = 'org_456';
    const resultB = await db
      .select()
      .from(ventures)
      .where(eq(ventures.account_id, accountB))
      .run();

    // RLS policy deve garantir que accountB não vê ventureA
    expect(resultB).toHaveLength(0);
  });
});
```

---

## 4. Inter-module JWT

Módulos precisam chamar uns aos outros (ex: bruce-core chama opportunity). Para isso, usamos JWTs assinados internamente.

### 4.1 Geração de Inter-Module JWT

Arquivo: `packages/auth/src/inter-module-jwt.ts`

```typescript
import jwt from '@node-rs/jsonwebtoken';

export interface InterModuleJWT {
  iss: string; // = 'bruce-internal'
  sub: string; // = `${accountId}--${ventureId}`
  aud: string; // = target module name (ex: 'opportunity')
  module: string; // = calling module (ex: 'bruce-core')
  iat: number;
  exp: number;
}

export function signInterModuleJWT(
  accountId: string,
  ventureId: string,
  targetModule: string,
  callingModule: string,
  expiresInSeconds = 300, // 5 min
): string {
  const payload: InterModuleJWT = {
    iss: 'bruce-internal',
    sub: `${accountId}--${ventureId}`,
    aud: targetModule,
    module: callingModule,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  return jwt.sign(
    payload,
    process.env.INTER_MODULE_JWT_SECRET || '',
    { algorithm: 'HS256' },
  );
}

export function verifyInterModuleJWT(token: string): InterModuleJWT {
  try {
    const decoded = jwt.verify(token, process.env.INTER_MODULE_JWT_SECRET || '');
    return decoded as InterModuleJWT;
  } catch (error) {
    throw new Error(`Invalid inter-module JWT: ${error}`);
  }
}
```

### 4.2 Middleware para Validação

```typescript
export const interModuleAuth = createMiddleware<{
  Variables: {
    interModule: InterModuleJWT;
  };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyInterModuleJWT(token);
    c.set('interModule', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid inter-module token' }, 401);
  }
});
```

### 4.3 Uso em Chamadas Inter-módulo

```typescript
// No bruce-core, chamar opportunity:
const token = signInterModuleJWT(
  accountId,
  ventureId,
  'opportunity', // target module
  'bruce-core', // calling module
);

const response = await fetch('http://opportunity:3002/api/internal/scan', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ problem_statement }),
});
```

---

## 5. Plano Multi-tier e Limites

### 5.1 Schema de Planos

Arquivo: `packages/db/src/schema/plan-limits.ts`

```typescript
export const PLAN_LIMITS = {
  free: {
    max_ventures: 1,
    max_opportunities_per_month: 5,
    max_ai_credits_per_month: 100,
    features: ['opportunity', 'add-venture'], // só módulos free
  },
  pro: {
    max_ventures: 10,
    max_opportunities_per_month: 100,
    max_ai_credits_per_month: 2000,
    features: ['opportunity', 'add-venture', 'brand-aid', 'builder'],
  },
  enterprise: {
    max_ventures: 999,
    max_opportunities_per_month: 9999,
    max_ai_credits_per_month: 999999,
    features: ['all'],
  },
};

// Carregar via module spec
import { readFileSync } from 'fs';

export function getPlanLimits(module: string, plan: string) {
  const spec = JSON.parse(
    readFileSync(`modules/${module}/saas/plan-limits.json`, 'utf-8'),
  );
  return spec[plan];
}
```

### 5.2 Middleware de Enforcement

Arquivo: `packages/auth/src/plan-limit-middleware.ts`

```typescript
import { getDB } from '@bruce/db';
import { eq } from 'drizzle-orm';
import { accounts } from '@bruce/db/schema';

export const enforcePlanLimits = (limitKey: string) =>
  createMiddleware(async (c, next) => {
    const auth = c.get('auth');
    const db = getDB();

    // Buscar plano da account
    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.account_id, auth.accountId))
      .run();

    if (!account || account.length === 0) {
      return c.json({ error: 'Account not found' }, 404);
    }

    const plan = account[0].plan;
    const limits = PLAN_LIMITS[plan];

    if (!limits) {
      return c.json({ error: 'Invalid plan' }, 400);
    }

    // Verificar o limite específico
    const currentUsage = await getUsage(auth.accountId, limitKey);

    if (currentUsage >= limits[limitKey]) {
      return c.json(
        {
          error: `Plan limit exceeded: ${limitKey}`,
          limit: limits[limitKey],
          current: currentUsage,
        },
        402, // Payment Required
      );
    }

    await next();
  });

// Uso
app.post(
  '/ventures',
  clerkAuth,
  enforcePlanLimits('max_ventures'),
  createVentureHandler,
);
```

---

## 6. Testes de Validação

### 6.1 Isolamento de Tenants

```typescript
it('should isolate ventures between accounts', async () => {
  // Criar venture como account A
  const ventureA = await createVenture('org_aaa', { name: 'Startup A' });

  // Listar ventures como account B
  const venturesB = await listVentures('org_bbb');

  // Account B não deve ver venture de account A
  expect(venturesB).not.toContainEqual(ventureA);
});
```

### 6.2 Aplicação de Limites

```typescript
it('should block creation of ventures exceeding plan limit', async () => {
  const accountId = 'org_free';

  // Plan free = max_ventures: 1
  await createVenture(accountId, { name: 'Venture 1' });

  // Segunda tentativa deve falhar com 402
  const response = await createVenture(accountId, { name: 'Venture 2' });
  expect(response.status).toBe(402);
});
```

---

## Checklist de Implementação

- [ ] Clerk integration: webhook handler em bruce-core
- [ ] Clerk JWT verification middleware
- [ ] RLS policies criadas no PostgreSQL
- [ ] RLS middleware aplicado em getDB()
- [ ] Inter-module JWT signing + verification
- [ ] Plan limits schema + middleware
- [ ] Teste de isolamento entre accounts
- [ ] Teste de aplicação de limites
- [ ] Webhook testado com Clerk CLI
- [ ] Documentação de setup Clerk atualizada

---

## Pronto para Produção?

✅ **Sim**, quando:
- Criar uma org no Clerk automaticamente cria um `accounts` record na DB
- Listar ventures como accountA mostra 0 ventures (mesmo que accountB tenha uma)
- Tentar criar venture além do limite retorna 402
- Inter-module JWT valida corretamente
- RLS está ativo (test SQL: `SELECT current_setting('app.current_account_id')`)
