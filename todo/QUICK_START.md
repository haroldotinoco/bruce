# Quick start — cadeia vertical E2E (Plano A)

Objetivo: repetir localmente **criar venture → workflow bruce-core → scan opportunity → ver execução no Temporal** e **polling de jobs**, com comandos copiáveis.

## Pré-requisitos

- Node.js 18+, pnpm 8+, Docker
- Chave LLM para workflows que chamam agentes (ex.: `OPENROUTER_API_KEY` no `.env`). Sem chave, o workflow pode falhar nas atividades que invocam o modelo; o arranque do workflow e a visibilidade no Temporal UI ainda confirmam a integração.

## 1. Ambiente

Na raiz do repositório:

```bash
cp .env.example .env
# Edite .env: DATABASE_URL, REDIS_URL, TEMPORAL_ADDRESS, OPENROUTER_API_KEY (ou outro provider conforme packages/llm)
```

Carregar variáveis no shell (bash):

```bash
set -a
[ -f .env ] && . ./.env
set +a
```

Instalar e compilar:

```bash
pnpm install
pnpm run build
```

Infra Docker e migrações:

```bash
pnpm run infra:up
pnpm --filter @bruce/db run db:migrate
```

Serviços úteis: Postgres `5432`, Redis `6379`, Temporal `7233`, **Temporal UI** `http://localhost:8080`.

## 2. JWT em desenvolvimento

- Se **`CLERK_SECRET_KEY` estiver vazio** no `.env`, a API aceita um JWT apenas com claims decodificáveis (`sub`, `org_id`) — modo local descrito em `@bruce/auth`.
- Se **`CLERK_SECRET_KEY` estiver definido**, usa um token de sessão Clerk válido no header `Authorization: Bearer …`.

Gerar token local (organização fixa `org_local_dev`):

```bash
export TOKEN=$(node scripts/print-dev-jwt.mjs)
```

Para outro tenant:

```bash
export TOKEN=$(DEV_JWT_ORG_ID=org_meu_tenant node scripts/print-dev-jwt.mjs)
```

## 3. Arrancar APIs com workers Temporal

Em **dois** terminais, com o mesmo `.env` carregado e `ENABLE_TEMPORAL_WORKER=true`:

**Terminal A — bruce-core (porta 3000)**

```bash
export PORT=3000 ENABLE_TEMPORAL_WORKER=true
pnpm --filter @bruce/app-bruce-core exec tsx src/index.ts
```

**Terminal B — opportunity (porta 3002)**

```bash
export PORT=3002 ENABLE_TEMPORAL_WORKER=true
pnpm --filter @bruce/app-opportunity exec tsx src/index.ts
```

Verificar:

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3002/health
```

## 4. Fluxo HTTP (curl)

Substitua `$TOKEN` se não usou `export TOKEN=...` acima. Exemplo com `jq` para extrair IDs:

**Criar venture e guardar `VENTURE_ID`**

```bash
VENTURE_ID=$(curl -sS -X POST http://localhost:3000/ventures \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Venture","stage":"concept"}' | jq -r .id)
echo "$VENTURE_ID"
```

**Iniciar análise (bruce-core → workflow `venture-analysis-…`)**

```bash
JOB_ID=$(curl -sS -X POST "http://localhost:3000/ventures/$VENTURE_ID/start-analysis" \
  -H "Authorization: Bearer $TOKEN" | jq -r .job_id)

curl -sS "http://localhost:3000/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Disparar scan de opportunity**

```bash
WORKFLOW_ID=$(curl -sS -X POST http://localhost:3002/scans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"venture_id\":\"$VENTURE_ID\",\"opportunities\":[]}" | jq -r .workflow_id)

curl -sS "http://localhost:3002/jobs/$WORKFLOW_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## 5. Temporal UI

Abrir `http://localhost:8080` e procurar workflows cujos IDs começam por `venture-analysis-` ou `opportunity-scan-`.

## 6. Testes automatizados

```bash
pnpm test
```

**E2E opcional (HTTP real):** com infra e APIs a correr (`bruce-core` + `opportunity` nas portas por defeito), gera token e corre:

```bash
export BRUCE_E2E_INTEGRATION=1
export BRUCE_E2E_TOKEN=$(node scripts/print-dev-jwt.mjs)
pnpm test:integration
```

Variáveis opcionais: `BRUCE_CORE_URL`, `BRUCE_OPPORTUNITY_URL` se não usares `3000` / `3002`.

## Critério de pronto (Plano A)

- Infra a correr, migrações aplicadas, dois serviços HTTP com workers Temporal.
- Sequência de curls acima devolve `201`/`202` e IDs de workflow; Temporal UI mostra execuções; polling de `/jobs/...` devolve estado (conclusão depende de LLM e de atividades).
