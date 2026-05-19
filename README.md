# BruceAI

Monorepo da plataforma BruceAI (pnpm + Turborepo).

## Pré-requisitos

- Node.js 18+
- pnpm 8+
- Docker (para Postgres, Redis, Qdrant, Temporal, MinIO)

## Setup

```bash
pnpm install
pnpm run build
```

Runbook operacional canônico para ambiente local, autenticação, event bus, workers, dashboard e testes: [docs/operator-golden-path.md](docs/operator-golden-path.md).

Smoke curto da cadeia vertical local (venture → workflows bruce-core e opportunity, Temporal UI, curls): [todo/QUICK_START.md](todo/QUICK_START.md).

## Infra local

```bash
pnpm run infra:up
```

Serviços (portas padrão do roadmap; se alguma estiver em uso no host, pare o processo ou ajuste o mapeamento em `docker-compose.yml`):

- Postgres: `localhost:5432` (user `bruce`, DB `bruce_dev`, senha `bruce_dev_password`)
- Redis: `localhost:6379`
- Qdrant: `localhost:6333` (REST), `6334` (gRPC interno)
- Temporal: `localhost:7233` (frontend gRPC), `7234`
- Temporal UI: `http://localhost:8080`
- MinIO API: `localhost:9000`, console: `http://localhost:9001` (`minioadmin` / `minioadmin`)

Variáveis úteis (ex.: `.env` na raiz):

- `DATABASE_URL=postgresql://bruce:bruce_dev_password@localhost:5432/bruce_dev`
- `REDIS_URL=redis://localhost:6379`
- `QDRANT_URL=http://localhost:6333`
- `TEMPORAL_ADDRESS=localhost:7233`
- `STORAGE_ENDPOINT=http://localhost:9000`

## Scripts úteis

| Script            | Descrição              |
| ----------------- | ---------------------- |
| `pnpm dev`        | Dev (Turborepo)        |
| `pnpm build`      | Build de tudo          |
| `pnpm type-check` | Typecheck em workspaces|
| `pnpm lint`       | ESLint                 |
| `pnpm infra:down` | Para containers        |
| `pnpm --filter @bruce/schemas run generate` | Gera schemas Zod e registry de agentes a partir de `modules/*/agents/*/{input,output}.schema.json` |
| `pnpm --filter @bruce/contracts run generate` | Gera tipos a partir de `modules/**/*.schema.json` |
| `pnpm --filter @bruce/db run db:migrate` | Aplica SQL em `packages/db/migrations/` |
| `pnpm test:integration` | Vitest HTTP E2E opcional (ver `BRUCE_E2E_*` em `docs/operator-golden-path.md`) |

Schemas e tipos de agent input/output ficam em `@bruce/schemas`, gerados em `packages/schemas/src/generated/` a partir dos JSON Schemas visíveis em `modules/*/agents/*`. Contratos não-agent continuam em `packages/contracts/src/generated/`; o pacote raiz `@bruce/contracts` exporta os contratos comuns (`ModuleEvent`, erros, etc.).

Event bus: por padrão usa memória; para Redis Pub/Sub defina `BRUCE_EVENT_BUS=redis` e `REDIS_URL`.

Mapeamento central de modelos LLM (aliases curtos → slugs OpenRouter, defaults): [`bruce-model-registry.json`](bruce-model-registry.json) na raiz — opcionalmente override com `BRUCE_MODEL_REGISTRY_PATH` (ver `.env.example`).

Especificações dos módulos ficam em `modules/`. Roadmap em `todo/README.md`.
