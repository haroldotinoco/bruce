# BruceAI Implementation Roadmap (Fases 0–9)

## Visão Geral

Este diretório contém um **roadmap detalhado, fase por fase** para construir a plataforma BruceAI completa a partir das especificações arquiteturais em `modules/`.

O objetivo é transformar JSON schemas, definições de workflows e agent SKILLs em um **sistema totalmente funcional, pronto para produção** usando TypeScript/Node.js, Temporal.io, PostgreSQL, Redis e OpenRouter.

**Estado atual vs este roadmap:** a implementação no repositório é incremental; nem todas as fases estão fechadas e vários apps de módulo ainda são scaffold. Ver [lacunas e planos seguintes](./10-gap-and-plans.md) para o que falta e em que ordem atacar.

---

## Estimativa de Tempo Total

| Escopo | Fases | Tempo Realista |
|--------|-------|----------------|
| **MVP (com auth + observabilidade)** | 0–7, 9 | **14–18 dias** |
| **Full SaaS (com billing)** | 0–9 | **17–20 dias** |

*Desenvolvedor solo, 40h/semana. Multiplique por 1.5 para primeira vez com stack.*

---

## As 9 Fases de Implementação

### [Fase 0 — Scaffolding do Monorepo](./00-monorepo-scaffold.md)
**Duration:** 2–4 hours | **Status:** Foundation / Blocker

Sets up the pnpm monorepo infrastructure, Turborepo build pipeline, TypeScript configuration, and Docker Compose local services. Without this phase, nothing else is possible.

**Deliverables:**
- `pnpm-workspace.yaml` with apps/ and packages/ workspaces
- `turbo.json` with build cache and task definitions
- Root `tsconfig.json` with @bruce/* path aliases
- `docker-compose.yml` with Postgres, Redis, Qdrant, Temporal, MinIO
- Scaffolding of all 9 module apps and 8 shared packages

**Done when:** `pnpm install` completes, `pnpm run build` succeeds, infrastructure services run via Docker.

---

### [Fase 1 — Pacotes Compartilhados (@bruce/*)](./01-shared-packages.md)
**Duration:** 2–3 days | **Status:** Critical dependency

Implements the 8 shared packages that every module depends on:

1. **@bruce/contracts** — TypeScript types generated from all JSON schemas
2. **@bruce/db** — Drizzle ORM client with RLS, migrations, connection pooling
3. **@bruce/llm** — LLM router supporting OpenRouter, Anthropic, OpenAI with structured output
4. **@bruce/redis** — Redis client with account-namespaced keys
5. **@bruce/storage** — S3-compatible file upload/download (MinIO local, R2 prod)
6. **@bruce/auth** — Clerk JWT verification and middleware
7. **@bruce/events** — Inter-module event bus (in-process for dev, Redis Pub/Sub for prod)
8. **@bruce/logger** — Structured logging with Pino (JSON in prod, pretty in dev)

These packages are **imported by every module** and **block all subsequent phases**.

**Done when:** All packages build, @bruce/llm can call real LLMs, @bruce/db can query Postgres with RLS.

---

### [Fase 2 — Runtime de Agentes](./02-agent-runtime.md)
**Duration:** 2–3 days | **Status:** Enables agent execution

Implements `@bruce/agent-runtime`, the engine that executes agent specifications from `modules/`:

- **AgentLoader** — Reads SKILL.md, capabilities.json, input/output schemas from disk
- **AgentRunner** — Orchestrates full execution: validate input → call LLM → validate output → retry on failure
- **ToolRegistry** — Maps tool names (web_search, db_read, vector_search, etc.) to implementations
- Automatic retry logic with exponential backoff
- Full type safety via Zod schemas

Any module can now call: `getAgentRunner().run('opportunity', 'market-scanner', input, context)` and get validated output.

**Done when:** A single agent executes end-to-end with real LLM calls and output validation.

---

### [Fase 3 — Temporal Workers (Orquestração)](./03-temporal-workers.md)
**Duration:** 1 week (3 modules), 2 weeks (all 9) | **Status:** Enables async workflows

Implements the Temporal worker infrastructure for each module:

- **Activities** — Functions that Temporal executes (each calls AgentRunner)
- **Workflows** — Orchestrate activities in sequence with error handling, retries, timeouts
- **Workers** — Register workflows + activities, poll task queues
- State tracking + querying
- Per-module task queues: `bruce-opportunity`, `bruce-bruce-core`, etc.

Starts with: bruce-core (venture creation) → opportunity (scanning) → add-venture

**Done when:** `opportunityScreeningWorkflow` runs end-to-end, completes in Temporal UI, persists results.

---

### [Fase 4 — Camada HTTP (APIs dos Módulos)](./04-http-api.md)
**Duration:** 3–5 days per module, ~2 weeks total | **Status:** Makes system accessible

Implements HTTP APIs for each module using Hono framework:

- OpenAPI routes with Zod validation
- Clerk JWT authentication
- RLS context setting per request
- Workflow initiation (async jobs returning job_id)
- Job status polling
- Plan limit enforcement
- Structured error handling
- Automatically generated OpenAPI docs at `/doc`

**Deliverables per module:**
- `POST /ventures` — Create venture, return 201
- `GET /ventures/:id` — Read venture with RLS
- `POST /ventures/:id/start-analysis` — Start workflow, return 202 with job_id
- `GET /jobs/:id` — Poll workflow status
- Full test coverage

**Done when:** `POST /ventures` → Temporal workflow → LLM agents → results returned via `GET /jobs/:id`

---

### [Fase 5 — Autenticação e Multi-tenancy](./05-auth-multitenancy.md)
**Duração:** 1–2 dias | **Status:** Ativa isolamento de tenants

Implementa isolamento completo entre contas:

- **Clerk integration** — Webhook cria account automaticamente quando org é criada
- **JWT verification** — Toda requisição validada contra JWT do Clerk
- **Row-Level Security (RLS)** — Queries filtram automaticamente por `account_id`
- **Inter-module JWT** — Módulos chamam uns aos outros de forma segura
- **Plan limits** — Free vs Pro vs Enterprise com limites de uso

**Entregáveis:**
- Webhook handler `POST /webhooks/clerk` em bruce-core
- Middleware de RLS para todas as queries
- JWT signing/verification inter-módulos
- Enforcement de planos na API

**Pronto quando:** Criar org no Clerk cria account na DB, RLS previne data leakage, plan limits são enforçados.

---

### [Fase 6 — Eventos Inter-módulo](./06-inter-module-events.md)
**Duração:** 1–2 dias | **Status:** Ativa orquestração assíncrona

Coordena módulos através de eventos durável:

- **BullMQ event bus** — Fila com retry automático
- **Event schema validation** — Zod validation
- **Event subscriptions** — Cada módulo subscreve eventos relevantes
- **Fan-out (parallelização)** — Quando opportunity.advanced, brand-aid + builder iniciam juntos
- **Dead Letter Queue** — Eventos com falha 3x vão para DLQ com alertas

**Fluxo de exemplo:**
```
opportunity.advanced 
  → add-venture.started 
    → venture.qualified 
      → brand-aid.started (paralelo)
      → builder.started (paralelo)
        → gtm.started (quando ambas completarem)
```

**Pronto quando:** Emitir opportunity.advanced dispara add-venture automaticamente, fan-out funciona, retry automático ressolve falhas transientes.

---

### [Fase 7 — Observabilidade e Logging](./07-observability.md)
**Duração:** 1 dia | **Status:** Ativa debug em produção

Logging estruturado e traceamento end-to-end:

- **Logs estruturados (Pino)** — JSON com correlation_id, account_id, module
- **Correlation ID propagation** — Rastrear request do HTTP até DB write final
- **Activity observability** — Cada agente emite started/completed/failed
- **Better Stack integration** — Centralizar logs + alertas
- **Temporal visibility** — Filtrar workflows por account_id/venture_id

**Entregáveis:**
- Logger wrapper com AsyncLocalStorage
- Middleware de correlation_id em HTTP
- Transport Pino para Better Stack
- Search attributes customizados no Temporal

**Pronto quando:** Log contém correlation_id, agent events emitidos, Better Stack recebe em < 1s, Temporal UI filtra por account/venture.

---

### [Fase 8 — SaaS e Billing](./08-saas-billing.md)
**Duração:** 2–3 dias | **Status:** OPCIONAL para MVP (skip se não monetizando)

Monetização via Stripe:

- **Stripe setup** — Produtos (free/pro/enterprise), preços, billing meters
- **Webhook handler** — Atualizar plan conforme pagamentos
- **Usage metering** — Registrar ações cobráveis (scans, campanhas, health-checks)
- **Billing portal** — Link self-service Stripe para usuários
- **Revenue dashboard** — MRR, churn, ARR (para admin)

**Recomendação:** Skip para MVP. Implemente DEPOIS de launch se houver tração.

**Pronto quando:** Stripe webhook atualiza plan, metering registra uso, portal Stripe funciona.

---

### [Fase 9 — Testes e Avaliações](./09-testing-evals.md)
**Duração:** 3–5 dias (básico), ongoing (evals avançadas) | **Status:** Ativa confiança

Três níveis de teste:

1. **Unit tests (Vitest)** — Schema validation, plan limits, RLS (rápido, sem LLM)
2. **Integration tests** — Workflows com DB/Redis real, LLM mockado (médio)
3. **LLM evaluation tests** — Agentes contra scenarios, scoring automático (lento, caro, CI only)

**Entregáveis:**
- Suite Vitest com > 70% coverage
- Integration tests com testcontainers
- Evaluation scenarios em `modules/*/evaluations/*.json`
- GitHub Actions rodando testes em PR

**Pronto quando:** `pnpm test` roda em < 2min, coverage > 70%, eval pass rate > 90%, GitHub Actions passa.

---

## Arquitetura do Sistema

```
┌────────────────────────────────────────────────────────────┐
│                   HTTP API Layer                            │
│        (Hono + OpenAPI + Zod + Clerk JWT Auth)            │
│               [Fases 4–5]                                   │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ↓
┌────────────────────────────────────────────────────────────┐
│             Multi-tenancy & Auth Layer                      │
│    (RLS, Plan Limits, Inter-module JWT, Webhooks)         │
│               [Fase 5]                                      │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ↓
┌────────────────────────────────────────────────────────────┐
│          Temporal Orchestration + Events                    │
│   (Workflows + Activities + BullMQ + Event Bus)            │
│              [Fases 3, 6]                                   │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ↓
┌────────────────────────────────────────────────────────────┐
│                   Agent Runtime                             │
│ (Load specs → Call LLM → Validate → Retry → Return)       │
│ (with observability: logs, events, traces)                │
│              [Fases 2, 7]                                   │
└──────────────────────────┬─────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
      ┌─────────┐   ┌─────────┐   ┌──────────┐
      │   LLM   │   │  Data   │   │ Storage  │
      │ Router  │   │   +     │   │  + Cache │
      │(Phase8) │   │ Vector  │   │  + SaaS  │
      └─────────┘   │   DB    │   └──────────┘
                    └─────────┘
      
    Shared Packages (@bruce/*)
           [Fase 1]
           
    Monorepo Setup + Infrastructure
           [Fase 0]
           
    Testing & Observability
           [Fases 7, 9]
```

---

## Sequência de Implementação

### Semana 1: Fundação
- **Dia 1–2:** Fase 0 — Monorepo scaffold + Docker Compose
- **Dia 3–5:** Fase 1 — Pacotes compartilhados (@bruce/*)

### Semana 2: Core Runtime
- **Dia 6–7:** Fase 2 — Agent runtime
- **Dia 8:** Fase 3 — Temporal workers (core modules)

### Semana 3: APIs + Auth
- **Dia 9–10:** Fase 4 — HTTP APIs (core modules)
- **Dia 11:** Fase 5 — Autenticação + Multi-tenancy
- **Dia 12:** Fase 6 — Eventos Inter-módulo
- **Dia 13:** Fase 7 — Observabilidade

### Semana 4: SaaS + Testing
- **Dia 14:** Fase 8 (opcional) — SaaS/Billing OU skip se MVP
- **Dia 15–17:** Fase 9 — Testes + Evaluations
- **Dia 18–19:** Remaining modules (startup-ops, portfolio, bruce-memory)
- **Dia 20:** Deployment + production ready

---

## Key Design Decisions

### Stack Choices (Already Made)
- **Runtime:** TypeScript / Node.js (type safety, ecosystem)
- **Package Manager:** pnpm (faster, stricter peer deps, workspaces)
- **Build Tool:** Turborepo (incremental builds, task caching)
- **ORM:** Drizzle ORM (type-safe, zero-runtime, native RLS)
- **HTTP Framework:** Hono (ultra-fast, TypeScript-first, minimal deps)
- **Workflows:** Temporal.io (reliable, durable, resumable)
- **Database:** PostgreSQL + Neon (prod), Docker (local)
- **Cache:** Redis + Upstash (prod), local Redis (dev)
- **Vector DB:** Qdrant (semantic search, open-source)
- **LLM:** OpenRouter (multi-provider), direct Anthropic/OpenAI (fallback)
- **Auth:** Clerk (multi-tenancy, JWT)
- **Storage:** Cloudflare R2 (prod), MinIO (local)

### Architecture Principles
1. **Separation of Concerns:** Shared packages, agent runtime, workflow orchestration, API layer are independent
2. **RLS by Default:** Every query automatically scoped to account_id via context
3. **Type Safety:** Zod schemas enforce contracts at runtime
4. **Observable:** Structured logs with correlation_id, correlation across modules
5. **Resilient:** Automatic retries, exponential backoff, circuit breakers
6. **Testable:** Each layer has clear boundaries and can be unit tested

---

## Success Metrics

- ✅ `pnpm install` completes without errors
- ✅ `pnpm run build` compiles all packages and apps
- ✅ All 8 shared packages are importable and working
- ✅ Single agent executes via AgentRunner with real LLM calls
- ✅ Temporal UI shows workflows in execution
- ✅ HTTP POST request → Temporal workflow → LLM call → result returned
- ✅ OpenAPI docs generated for all modules
- ✅ RLS works: queries automatically filtered by account_id
- ✅ E2E test: venture creation → opportunity scan → results persisted

---

## Additional Resources

Each phase file includes:
- **Exact folder structure** to create
- **Code examples** (TypeScript) for key components
- **Configuration files** (package.json, tsconfig.json, etc.)
- **Checklist** of concrete tasks
- **Done criteria** (specific, measurable)
- **Common pitfalls** and solutions

---

## Roadmap por Caso de Uso

### 🎯 MVP/Prototipo (2 semanas)

**Fases:** 0, 1, 2, 3, 4 (completas) + 5, 6, 7 (básico) + 9 (básico)

- ✅ Incluir: Autenticação, multi-tenancy, eventos, logs
- ❌ Skip: Fase 8 (Billing)
- **Resultado:** Demo funcional com isolamento multi-tenant, primeira venture end-to-end
- **Tempo:** ~14 dias

### 📈 POC com Pagamentos (3 semanas)

**Fases:** 0–9 (todas)

- ✅ Incluir: Fase 8 (Stripe)
- **Resultado:** SaaS pronto para produção, monetizável
- **Tempo:** ~18 dias

### 🚀 Production Ready (3+ semanas)

**Fases:** 0–9 + hardening

- ✅ Cobertura de testes > 85%
- ✅ Eval pass rate > 95%
- ✅ Docs completa
- ✅ Load testing
- ✅ Security audit

---

## Próximos Passos

1. ✅ Verifique se Fases 0–4 estão completas
2. ⭐ **Abra `05-auth-multitenancy.md` e comece pela Fase 5**
3. Após cada fase, faça o checklist de validação
4. Organize timeline realista (estimativa × 1.5)
5. Coordene com time se multi-pessoa
6. Depois da Fase 7, é seguro fazer PR e deploy 🚀

---

## Dúvidas?

Cada fase é **totalmente auto-contida** e pode ser abordada independentemente uma vez que os pré-requisitos forem atendidos.

Comece com **Fase 5** se já tem Fases 0–4 prontas. Se começando do zero, comece com **Fase 0**.

Boa sorte construindo BruceAI! 🚀
