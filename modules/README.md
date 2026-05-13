# BruceAI — Modules

> Plataforma multi-agente para criação e operação autônoma de ventures.

---

## Rodando localmente (do zero)

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclui Docker Compose)
- Node.js 20+ ou Bun
- Uma chave de API de LLM — a mais simples é o [OpenRouter](https://openrouter.ai/keys) (acessa todos os modelos com uma chave só)

### Passo 1 — Clonar e navegar até a pasta

```bash
git clone <repo-url>
cd <repo>/modules
```

### Passo 2 — Configurar variáveis de ambiente

```bash
cp infrastructure/.env.example .env
```

Abra `.env` e preencha **no mínimo** estas variáveis para o fluxo básico funcionar:

```env
# LLM — escolha OpenRouter (recomendado) ou chaves diretas
LLM_PROVIDER_MODE=openrouter
OPENROUTER_API_KEY=sk-or-...      # openrouter.ai/keys

# Database (já sobe via docker-compose, não precisa mudar)
DATABASE_URL=postgresql://bruceai:bruceai@localhost:5432/bruceai

# Redis (idem)
REDIS_URL=redis://localhost:6379

# Temporal
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default

# Qdrant
QDRANT_URL=http://localhost:6333

# Storage local (MinIO sobe via docker-compose)
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=bruceai-artifacts
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# Flags locais
NODE_ENV=development
ENABLE_HUMAN_GATE=false
ENABLE_BILLING=false
ENABLE_SMTP=false
```

> Para produção, preencha também: `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `R2_*`, `RESEND_API_KEY`. Veja `infrastructure/.env.example` para a lista completa.

### Passo 3 — Subir a infraestrutura local

```bash
chmod +x infrastructure/scripts/setup-local.sh
./infrastructure/scripts/setup-local.sh
```

Esse script sobe PostgreSQL, Redis, Temporal, Qdrant e MinIO via Docker Compose e aguarda todos ficarem saudáveis.

**Ou manualmente:**

```bash
docker compose -f infrastructure/docker-compose.local.yml up -d
```

Serviços após subir:

| Serviço | URL local |
|---------|-----------|
| PostgreSQL | `localhost:5432` (user: bruceai / pass: bruceai) |
| Redis | `localhost:6379` |
| Temporal UI | `http://localhost:8080` |
| Qdrant | `http://localhost:6333` |
| MinIO Console | `http://localhost:9001` (minioadmin / minioadmin) |
| pgAdmin | `http://localhost:5050` (admin@example.com / admin) |

### Passo 4 — Rodar as migrations do banco

```bash
chmod +x infrastructure/scripts/migrate.sh
./infrastructure/scripts/migrate.sh
```

Executa `infrastructure/migrations/001_init.sql`, que cria todos os schemas, tabelas, índices e políticas RLS de todos os módulos.

### Passo 5 — Instalar dependências e rodar os módulos

```bash
# Na raiz do repo
npm install   # ou: bun install

# Todos os módulos em paralelo (monorepo com turbo/nx):
npm run dev

# Ou módulo a módulo:
npm run dev --workspace=bruce-core     # :3001
npm run dev --workspace=opportunity    # :3002
npm run dev --workspace=add-venture    # :3003
npm run dev --workspace=brand-aid      # :3004
npm run dev --workspace=builder        # :3005
npm run dev --workspace=gtm            # :3006
npm run dev --workspace=startup-ops    # :3007
npm run dev --workspace=portfolio      # :3008
npm run dev --workspace=bruce-memory   # :3009
```

### Passo 6 — Disparar o fluxo completo (end-to-end)

```bash
# 1. Cria um venture via bruce-core
curl -X POST http://localhost:3001/ventures \
  -H "Content-Type: application/json" \
  -d '{"theme": "AI-powered compliance automation", "description": "Automate regulatory reporting for fintechs"}'
# → retorna { "venture_id": "vent_..." }

# 2. Dispara o scan de oportunidades
curl -X POST http://localhost:3002/scans \
  -H "Content-Type: application/json" \
  -d '{"venture_id": "vent_...", "themes": ["AI compliance", "regtech"]}'

# 3. Acompanhe os workflows no Temporal UI
open http://localhost:8080
```

O Temporal UI em `localhost:8080` mostra todos os workflows rodando, o estado de cada step, os inputs/outputs de cada agente e os eventos emitidos.

### Parar tudo

```bash
docker compose -f infrastructure/docker-compose.local.yml down

# Reset completo (apaga volumes):
docker compose -f infrastructure/docker-compose.local.yml down -v
```

---

## Estrutura do projeto

```
modules/
├── infrastructure/                      # Stack local e configuração global
│   ├── .env.example                     # Todas as variáveis de ambiente
│   ├── docker-compose.local.yml         # Stack Docker para dev local
│   ├── provider-registry.instance.json  # Configuração dos provedores LLM
│   ├── llm-routing.md                   # Guia: OpenRouter vs. direto
│   ├── poc-stack.md                     # Stack SaaS zero-custo para produção
│   ├── persistence-map.md               # Mapeamento de dados por backend
│   ├── tenant-isolation.md              # Estratégia de multi-tenancy
│   ├── scripts/
│   │   ├── setup-local.sh               # Setup inicial
│   │   └── migrate.sh                   # Executa migrations SQL
│   └── migrations/
│       └── 001_init.sql                 # Schema completo de todos os módulos
│
├── contracts/                           # Contratos compartilhados entre módulos
│   ├── provider-registry.schema.json    # Schema do registro de LLMs
│   ├── module-event.schema.json         # Eventos inter-módulo
│   ├── module-handoff.schema.json       # Payloads de handoff entre workflows
│   ├── venture-lifecycle.schema.json    # Ciclo de vida de ventures
│   ├── opportunity-to-venture.schema.json
│   ├── venture-to-brand.schema.json
│   ├── venture-to-builder.schema.json
│   ├── brand-to-builder.schema.json
│   ├── builder-to-gtm.schema.json
│   ├── gtm-to-startup-ops.schema.json
│   ├── startup-ops-to-portfolio.schema.json
│   ├── portfolio-to-bruce-core.schema.json
│   └── artifact-store.schema.json
│
├── bruce-core/       # Núcleo: lifecycle de ventures + dispatch
├── opportunity/      # Descoberta e scoring de oportunidades
├── add-venture/      # Estruturação da hipótese de venture
├── brand-aid/        # Identidade de marca e brand book
├── builder/          # Especificação técnica e MVP
├── gtm/              # Go-to-market e campanhas
├── startup-ops/      # Monitoramento operacional contínuo
├── portfolio/        # Governança e alocação do portfólio
└── bruce-memory/     # Memória cross-venture e aprendizado
```

Cada módulo segue a mesma estrutura interna:

```
<module>/
├── agents/          # Agentes isolados (SKILL.md, schemas, capabilities, examples)
├── workflows/       # Definições de workflow Temporal (orquestração da cadeia)
├── contracts/       # Schemas locais do módulo
├── state/           # Contratos de estado (persistido + efêmero)
├── policies/        # Governança, retry, escalonamento humano
├── evaluations/     # Cenários de teste (happy path, edge cases, failures)
├── observability/   # Eventos, métricas, correlation IDs
├── saas/            # Camada SaaS: plan limits, tenant, onboarding, API contract
└── README.md
```

---

## Provedores de LLM

### Opção recomendada: OpenRouter

[OpenRouter](https://openrouter.ai) roteia para qualquer modelo com uma chave só. É o modo padrão para desenvolvimento — você vê o custo por modelo em tempo real no dashboard deles.

```env
LLM_PROVIDER_MODE=openrouter
OPENROUTER_API_KEY=sk-or-...
```

Modelos usados no projeto:

| Uso | Modelo | ID OpenRouter |
|-----|--------|---------------|
| Decisões de governança | Claude Opus 4 | `anthropic/claude-opus-4-6` |
| Análise e escrita | Claude Sonnet 4 | `anthropic/claude-sonnet-4-6` |
| Outputs estruturados, tool use | GPT-4o | `openai/gpt-4o` |
| Raciocínio profundo, risco | o1 | `openai/o1` |
| Contexto longo / bulk | Gemini 1.5 Pro | `google/gemini-pro-1.5` |

### Opção alternativa: chaves diretas

```env
LLM_PROVIDER_MODE=direct
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

Veja `infrastructure/llm-routing.md` para detalhes do roteamento e `infrastructure/provider-registry.instance.json` para a configuração completa de modelos e preços.

---

## Fluxo end-to-end

```
[Operador cria venture]
         │
         ▼
  bruce-core (venture-onboarding)
         │
         ▼
  opportunity (screening + scoring)
         │  oportunidade aprovada
         ▼
  add-venture (structuring-pipeline)
         │  dossier aprovado
         ▼
  brand-aid ──────────────── builder
  (brand-creation)           (build-pipeline)
         │                         │
         └──────────┬──────────────┘
                    ▼
                  gtm (strategy + campaign-launch)
                    │  produto lançado
                    ▼
           startup-ops (real-time-monitoring + weekly-health-check)
                    │  health reports
                    ▼
           portfolio (review-cycle → SCALE / ITERATE / PAUSE / KILL)
                    │  decisão
                    ▼
           bruce-core (gate-evaluation → próximo ciclo)
                    │  aprendizados
                    ▼
           bruce-memory (learning-ingestion + pattern-extraction)
```

Cada seta é um evento definido em `contracts/module-event.schema.json`. Os payloads de handoff estão em `contracts/module-handoff.schema.json`. Todo o encadeamento é orquestrado por workflows Temporal — nenhum agente conhece o fluxo completo.

---

## Módulos

### bruce-core
Núcleo da plataforma. Gerencia o lifecycle de ventures, despacha módulos, controla gates de aprovação humana e atua como message bus entre todos os módulos.

Agentes: `venture-lifecycle-manager`, `module-dispatcher`, `gate-enforcer`, `governance-agent`

Workflows: `venture-onboarding`, `module-dispatch`, `gate-evaluation`, `portfolio-review-trigger`

---

### opportunity
Descobre e valida oportunidades de mercado. Faz pesquisa, analisa competidores, pontua e prioriza oportunidades.

Agentes: `market-scanner`, `opportunity-analyst`, `scoring-agent`, `prioritization-agent`

Workflows: `opportunity-screening`, `opportunity-scoring`, `weekly-discovery-cycle`

---

### add-venture
Transforma uma oportunidade aprovada em uma hipótese de venture estruturada: modelo de negócio, mercado-alvo, proposta de valor, roadmap de execução, análise de risco e dossier completo.

Agentes: `briefing-interpreter`, `opportunity-analyst-vol1`, `value-proposition-designer`, `customer-market-architect`, `business-model-modeler`, `risk-validation-analyst`, `gtm-planner`, `execution-roadmap-planner`, `narrative-strategist`, `venture-critic`, `dossier-composer`

Workflows: `venture-structuring-pipeline`

---

### brand-aid
Constrói a identidade completa de marca: naming, direção visual, messaging framework, tom de voz e brand guidelines.

Agentes: `market-analyst`, `brand-strategist`, `naming-agent`, `brand-critic`, `creative-director`, `visual-system-designer`, `logo-designer`, `brand-book-composer`

Workflows: `brand-creation-pipeline`

---

### builder
Gera a especificação técnica do MVP: arquitetura de sistema, backlog de features, sprint plans, critérios de aceitação e specs de integração com terceiros.

Agentes: `solution-architect`, `product-validator`, `ux-bdd-agent`, `backend-agent`, `frontend-agent`, `integration-agent`, `security-agent`, `qa-agent`, `governance-agent`

Workflows: `build-pipeline`, `rework-loop`, `stage-gate-evaluation`

---

### gtm
Executa o go-to-market completo: seleção de canais, sistema de conteúdo, lançamento de campanhas, tracking de performance, experimentos de crescimento e relatórios semanais de governança.

Agentes: `channel-strategist`, `content-system-agent`, `campaign-manager`, `analytics-agent`, `growth-experimenter`, `weekly-governance-agent`

Workflows: `gtm-strategy`, `campaign-launch`, `weekly-performance-review`, `channel-rebalancing`

---

### startup-ops
Monitoramento operacional contínuo. Ingere métricas de produto e financeiras, calcula health scores em 6 dimensões (activation, retention, revenue, product quality, financial sustainability, market fit), detecta anomalias, gera recomendações e relatórios semanais.

Agentes: `metrics-ingestion-agent`, `health-scoring-agent`, `anomaly-detector`, `ops-advisor`, `weekly-ops-reporter`

Workflows: `real-time-monitoring` (a cada 6h), `weekly-health-check`, `anomaly-escalation`, `metric-snapshot`

---

### portfolio
Motor de governança de portfólio. Analisa todos os ventures, avalia risco, aloca recursos e toma decisões estruturadas de SCALE / ITERATE / PAUSE / KILL em ciclos de 2–4 semanas.

Agentes: `portfolio-analyst`, `risk-monitor`, `allocation-agent`, `governance-decision-agent`, `portfolio-reporter`

Workflows: `portfolio-review-cycle`, `venture-decision`, `resource-allocation`, `kill-process`

---

### bruce-memory
Sistema de memória cross-venture. Ingere aprendizados de todos os módulos, extrai padrões estatisticamente significativos, sintetiza inteligência estratégica e responde queries sobre o que o portfólio já aprendeu.

Agentes: `learning-ingestion-agent`, `pattern-extractor`, `cross-venture-analyst`, `intelligence-synthesizer`, `query-agent`

Workflows: `learning-ingestion`, `weekly-pattern-extraction`, `cross-venture-analysis`, `monthly-intelligence-synthesis`, `on-demand-query`

---

## Configuração para produção (POC zero-custo)

Veja `infrastructure/poc-stack.md` para o stack SaaS completo com free tiers reais:

| Serviço local | Substitui por | Free tier |
|---------------|---------------|-----------|
| Docker Postgres | Neon | 0.5 GB grátis |
| Docker Redis | Upstash | 10k cmds/dia grátis |
| Docker Temporal | Temporal Cloud | trial disponível |
| Docker Qdrant | Qdrant Cloud | 1 GB grátis |
| MinIO | Cloudflare R2 | 10 GB + 1M ops/mês grátis |
| — | Clerk | 10k MAU grátis |
| — | Stripe | sem setup fee |
| — | Railway | $5/mês de crédito grátis |
| — | Resend | 3k emails/mês grátis |

---

## Princípios arquiteturais

**Agentes = capacidades isoladas.** Nenhum agente conhece o fluxo completo. Cada um recebe um input estruturado, produz um output estruturado, e encerra.

**Workflows = orquestração.** A cadeia de execução vive nos workflows Temporal, não dentro dos agentes. A lógica de transição (branching, retry, escalonamento) fica no workflow, não no agente.

**Contratos = linguagem formal.** Toda comunicação entre módulos passa por JSON schemas versionados em `contracts/`. Nenhum módulo assume o formato interno do outro.

**Estado = memória operacional.** Persistido → PostgreSQL com RLS. Efêmero → Redis com TTL. Artefatos → R2/MinIO. Vetores → Qdrant.

**Policies = governança.** Regras de retry, limites de custo, escalonamento humano e critérios de bloqueio ficam em `policies/` de cada módulo — não embutidas nos agentes.

**Observability = auditoria completa.** Todo step de workflow emite eventos com `correlation_id`, `account_id`, `venture_id` e `timestamp`. Nenhuma transição silenciosa.

---

*Última atualização: 2026-04-06*
