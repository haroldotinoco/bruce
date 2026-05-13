# Fase 0 — Scaffolding do Monorepo

**Status:** Não iniciado  
**Prioridade:** Crítica (bloqueador para todas as outras fases)  
**Duração estimada:** 2–4 horas  
**Responsável:** DevOps / Tech Lead

---

## Visão Geral

Esta é a fundação na qual tudo mais se apoia. Sem uma estrutura de workspace adequada e configuração correta, os módulos não conseguirão importar código compartilhado, e nenhuma das fases subsequentes funcionará.

**Objetivo:** Criar a estrutura de monorepo com pnpm workspaces, Turborepo, e TypeScript configurado para que cada pacote compartilhado (`@bruce/*`) e cada aplicação (módulo) possa ser desenvolvida, testada e compilada de forma independente mas integrada.

---

## 1. Estrutura de Pastas a Criar

```
bruce/
├── apps/
│   ├── api-gateway/          # (Opcional) Gateway HTTP único que roteia para módulos
│   ├── bruce-core/           # Serviço do módulo core (gestão de ventures)
│   ├── opportunity/          # Serviço do módulo de oportunidades
│   ├── add-venture/          # Serviço do módulo de criação de ventures
│   ├── brand-aid/            # Serviço do módulo de assistência com brand
│   ├── builder/              # Serviço do módulo de building
│   ├── gtm/                  # Serviço do módulo de Go-to-Market
│   ├── startup-ops/          # Serviço do módulo de operações
│   ├── portfolio/            # Serviço do módulo de portfólio
│   └── bruce-memory/         # Serviço do módulo de memória
│
├── packages/
│   ├── contracts/            # @bruce/contracts — tipos TS gerados de schemas JSON
│   ├── db/                   # @bruce/db — cliente Drizzle/Prisma
│   ├── llm/                  # @bruce/llm — router de LLM (OpenRouter, Anthropic, OpenAI)
│   ├── redis/                # @bruce/redis — cliente Redis com namespace de conta
│   ├── storage/              # @bruce/storage — S3/R2/MinIO
│   ├── auth/                 # @bruce/auth — Clerk JWT + middleware
│   ├── events/               # @bruce/events — bus de eventos inter-módulos
│   ├── logger/               # @bruce/logger — logging estruturado (Pino)
│   └── agent-runtime/        # @bruce/agent-runtime — executor de agentes
│
├── modules/                  # (Existente) camada de especificação
├── .github/
│   └── workflows/            # CI/CD (GitHub Actions)
├── docker-compose.yml        # PostgreSQL, Redis, Qdrant, Temporal local
├── pnpm-workspace.yaml       # Configuração de workspaces
├── turbo.json                # Configuração de build pipeline
├── package.json              # Root (devDependencies, scripts)
├── tsconfig.base.json        # Configuração base de TypeScript
├── tsconfig.json             # (Referencia tsconfig.base.json)
├── .npmrc                     # Configuração pnpm (shamefully-hoist, etc.)
└── README.md                 # Instruções de setup
```

---

## 2. Conteúdo Exato dos Arquivos Necessários

### 2.1 `pnpm-workspace.yaml`

Este arquivo define quais diretórios são tratados como workspaces:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'

ignore:
  - 'modules'
  - '.github'
  - 'node_modules'
```

**O que faz:**
- Tells pnpm que todos os diretórios em `apps/` e `packages/` são workspaces separados
- Allows cross-workspace dependencies (ex: `add-venture` pode depender de `@bruce/contracts`)
- Usa symlinks para desenvolvimento local (zero overhead)

---

### 2.2 `package.json` (root)

```json
{
  "name": "bruce-ai",
  "version": "0.0.1",
  "description": "BruceAI — Modular AI Agent Platform for Venture Building",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "db:migrate": "turbo run db:migrate",
    "db:seed": "turbo run db:seed",
    "temporal:start": "docker-compose up temporal",
    "infra:up": "docker-compose up -d",
    "infra:down": "docker-compose down",
    "clean": "turbo run clean && rm -rf node_modules && pnpm store prune",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "turbo": "^1.10.0",
    "typescript": "^5.3.0"
  }
}
```

**Pontos-chave:**
- `"private": true` — monorepo não deve ser publicado no npm
- `"type": "module"` — usa ES modules (não CommonJS)
- Scripts `dev`, `build`, `test` delegam a `turbo` para paralelização
- DevDependencies com TypeScript, ESLint, Prettier para toda a monorepo

---

### 2.3 `turbo.json`

```json
{
  "version": "1",
  "tasks": {
    "build": {
      "description": "Build application or package",
      "dependsOn": ["^build"],
      "inputs": ["src/**", "package.json", "tsconfig.json"],
      "outputs": ["dist/**"],
      "cache": true,
      "outputMode": "minimal"
    },
    "dev": {
      "description": "Start development server",
      "cache": false,
      "interactive": true
    },
    "test": {
      "description": "Run tests",
      "dependsOn": ["^build"],
      "inputs": ["src/**", "test/**", "package.json"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "type-check": {
      "description": "Type-check with TypeScript",
      "inputs": ["src/**", "tsconfig.json"],
      "cache": true
    },
    "lint": {
      "description": "Lint code with ESLint",
      "inputs": ["src/**", ".eslintrc.json"],
      "cache": true
    },
    "db:migrate": {
      "description": "Run database migrations",
      "cache": false,
      "env": ["DATABASE_URL"]
    },
    "clean": {
      "description": "Clean build artifacts",
      "cache": false
    }
  },
  "globalEnv": [
    "NODE_ENV",
    "CI",
    "TURBO_TOKEN"
  ],
  "globalPassThroughEnv": [
    "DATABASE_URL",
    "REDIS_URL",
    "QDRANT_URL",
    "TEMPORAL_ADDRESS",
    "OPENROUTER_API_KEY",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_PUBLISHABLE_KEY"
  ]
}
```

**Pontos-chave:**
- `dependsOn: ["^build"]` — uma tarefa deve esperar que suas dependências sejam compiladas primeiro
- `cache: true` — artifacts de build são cacheados entre execuções
- `globalEnv` e `globalPassThroughEnv` — variáveis disponíveis para todas as tasks

---

### 2.4 `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@bruce/contracts": ["packages/contracts/src/index.ts"],
      "@bruce/db": ["packages/db/src/index.ts"],
      "@bruce/llm": ["packages/llm/src/index.ts"],
      "@bruce/redis": ["packages/redis/src/index.ts"],
      "@bruce/storage": ["packages/storage/src/index.ts"],
      "@bruce/auth": ["packages/auth/src/index.ts"],
      "@bruce/events": ["packages/events/src/index.ts"],
      "@bruce/logger": ["packages/logger/src/index.ts"],
      "@bruce/agent-runtime": ["packages/agent-runtime/src/index.ts"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Pontos-chave:**
- `strict: true` — ativa todos os checks de tipo estrito
- `paths` — permite imports como `import { ... } from '@bruce/contracts'` em vez de `../../../packages/contracts`
- Cada app/package estende este base em seu próprio `tsconfig.json`

---

### 2.5 `tsconfig.json` (root)

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": [
    "apps/*/src",
    "packages/*/src",
    "modules"
  ]
}
```

---

### 2.6 `.npmrc`

```ini
# Force pnpm strict mode (recomendado para monorepos)
strict-peer-dependencies=false
shamefully-hoist=false
auto-install-peers=true

# Registry
registry=https://registry.npmjs.org/

# Permissões de hook
allow-scripts=true
ignore-scripts=false
```

---

### 2.7 `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: bruce_dev
      POSTGRES_USER: bruce
      POSTGRES_PASSWORD: bruce_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bruce"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 5s
      timeout: 3s
      retries: 5

  temporal:
    image: temporalio/auto-setup:1.21.5
    environment:
      DB: postgresql
      DB_PORT: 5432
      POSTGRES_USER: bruce
      POSTGRES_PWD: bruce_dev_password
      POSTGRES_SEEDS: bruce_temporal
      POSTGRES_HOST: postgres
    ports:
      - "7233:7233"
      - "7234:7234"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7233/health"]
      interval: 5s
      timeout: 3s
      retries: 5

  temporal-ui:
    image: temporalio/ui:2.20.0
    ports:
      - "8080:8080"
    environment:
      TEMPORAL_ADDRESS: temporal:7233
      TEMPORAL_TLS_ENABLED: "false"
    depends_on:
      - temporal

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/minio
    command: server /minio --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
  minio_data:
```

---

### 2.8 Estrutura de uma App (exemplo: `apps/bruce-core/`)

```
apps/bruce-core/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Configuração Hono
│   ├── routes/
│   │   ├── ventures.ts       # POST /ventures, GET /ventures/:id
│   │   └── jobs.ts           # GET /jobs/:id
│   ├── temporal/
│   │   ├── workflows.ts      # Workflow definitions
│   │   ├── activities.ts     # Activity implementations
│   │   └── worker.ts         # Worker setup
│   ├── middleware/
│   │   ├── auth.ts           # Clerk JWT verification
│   │   └── tenant.ts         # Account context setting
│   └── schemas/              # Zod schemas (re-export de @bruce/contracts)
├── package.json
├── tsconfig.json
└── .env.example
```

**Exemplo de `package.json` de uma app:**

```json
{
  "name": "@bruce/app-bruce-core",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "@bruce/contracts": "workspace:*",
    "@bruce/db": "workspace:*",
    "@bruce/llm": "workspace:*",
    "@bruce/auth": "workspace:*",
    "@bruce/events": "workspace:*",
    "@bruce/logger": "workspace:*",
    "@bruce/agent-runtime": "workspace:*",
    "hono": "^4.0.0",
    "temporal": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

**Pontos-chave:**
- `"workspace:*"` — especifica que usa a versão do workspace (symlink local)
- `tsx watch` — executa TS directly sem compilar intermediariamente

---

### 2.9 Estrutura de um Package (exemplo: `packages/contracts/`)

```
packages/contracts/
├── src/
│   ├── index.ts                      # Exports principais
│   ├── opportunity/
│   │   ├── types.ts                  # Types gerados de *.schema.json
│   │   └── schemas.ts                # Zod schemas
│   ├── venture/
│   │   ├── types.ts
│   │   └── schemas.ts
│   ├── module-event.ts               # ModuleEvent type + Zod
│   └── ... (outros módulos)
├── package.json
├── tsconfig.json
└── README.md
```

**`package.json` de um package:**

```json
{
  "name": "@bruce/contracts",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "generate": "node scripts/generate-types.js"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "json-schema-to-typescript": "^13.1.0",
    "typescript": "^5.3.0",
    "zod": "^3.22.0"
  },
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

---

## 3. Por Que Isso Vem Primeiro

1. **Sem workspace config**, `pnpm install` não consegue resolver `@bruce/*` packages
2. **Sem path mapping** em `tsconfig.json`, TypeScript não encontra imports com aliases
3. **Sem Turborepo**, você compila tudo manualmente e perde cache de builds
4. **Sem Docker Compose**, não há infraestrutura local (Postgres, Redis, etc.)

Todas as fases subsequentes dependem desses fundamentos.

---

## 4. Checklist de Implementação

- [ ] Criar diretórios: `apps/`, `packages/`, `modules/`
- [ ] Criar `pnpm-workspace.yaml`
- [ ] Criar `turbo.json` com tasks
- [ ] Criar `tsconfig.base.json` e `tsconfig.json`
- [ ] Criar root `package.json`
- [ ] Criar `.npmrc`
- [ ] Criar `docker-compose.yml` com todos os serviços
- [ ] Criar scaffold básico de cada app em `apps/*/` (pasta `src/`, `package.json`, `tsconfig.json`)
- [ ] Criar scaffold de cada package em `packages/*/` (pasta `src/`, `package.json`, `tsconfig.json`)
- [ ] Executar `pnpm install` (deve completar sem erros)
- [ ] Executar `pnpm run build` (deve compilar tudo)
- [ ] Executar `docker-compose up -d` (infraestrutura local online)
- [ ] Confirmar que `pnpm run dev` consegue iniciar serviços

---

## 5. Done Criteria

✅ **Fase 0 está completa quando:**

1. `pnpm install` executa sem erros
2. `pnpm run build --filter=@bruce/contracts` compila com sucesso
3. `pnpm run type-check` passa (zero TS errors)
4. `docker-compose up -d` inicia Postgres, Redis, Qdrant, Temporal, MinIO
5. `docker ps` mostra 5+ containers rodando
6. Você consegue conectar ao Postgres: `psql -h localhost -U bruce bruce_dev`
7. Você consegue acessar Temporal UI em `http://localhost:8080`
8. Você consegue acessar MinIO em `http://localhost:9001` com user/password `minioadmin/minioadmin`

---

## 6. Próximos Passos

Após completar a Fase 0:
- **Fase 1:** Implementar pacotes compartilhados (`@bruce/contracts`, `@bruce/db`, `@bruce/llm`, etc.)
- **Fase 2:** Implementar agent runtime
- **Fase 3:** Implementar Temporal workers
- **Fase 4:** Implementar HTTP APIs
