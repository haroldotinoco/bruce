# BruceAI Operator Golden Path

This is the canonical local runbook for operators and agents. Use it before `todo/QUICK_START.md`; that file is now a short vertical smoke path built from this guide.

## 1. Baseline Setup

From the repository root:

```bash
pnpm install
cp .env.example .env
pnpm run infra:up
pnpm --filter @bruce/db run db:migrate
```

The apps load the root `.env` through `@bruce/env`; sourcing the file is optional for most `pnpm --filter ...` commands. Source it only when you need shell variables such as `TOKEN`.

```bash
set -a
. ./.env
set +a
```

Default local infrastructure:

| Service | Address | Notes |
| --- | --- | --- |
| Postgres | `localhost:5432` | `bruce` / `bruce_dev` / `bruce_dev_password` |
| Redis | `localhost:6379` | Required for recommended multi-process event behavior |
| Temporal | `localhost:7233` | Worker/client endpoint |
| Temporal UI | `http://localhost:8080` | Workflow inspection |
| Qdrant | `http://localhost:6333` | Vector store |
| MinIO | `http://localhost:9000` | Console at `http://localhost:9001` |

## 2. Startup Matrix

| Use case | Command | Starts | Workers | Required env |
| --- | --- | --- | --- | --- |
| Minimal Bruce-Core + Opportunity smoke | See section 5 | `bruce-core`, `opportunity` | Inline Temporal workers | `DATABASE_URL`, `TEMPORAL_ADDRESS`, `TOKEN` |
| Full app dev surface | `pnpm dev` | All workspaces with a `dev` script, including dashboard and gateway | App-dependent inline workers only when enabled | `.env`, ports available |
| Full Temporal worker surface | `pnpm workers` | Worker scripts for all module apps | Temporal workers | `TEMPORAL_ADDRESS`, module LLM keys for real agent calls |
| Clean local reset | `pnpm run restart:dev-stack` | Rebuilds, starts infra, migrates DB, best-effort model sync | None after script exits | Docker, DB env, optional `OPENROUTER_API_KEY` |
| HTTP integration test | `pnpm test:integration` | Tests only; APIs must already be running unless skipped | Existing running services | Optional `BRUCE_E2E_INTEGRATION`, `BRUCE_E2E_TOKEN` |

`pnpm dev` is broad and convenient once the stack is known-good. For first verification, prefer the two-service smoke in section 5 so port ownership and worker behavior are explicit.

## 3. Auth Matrix

| Mode | Env | Token source | Expected behavior | Common symptom |
| --- | --- | --- | --- | --- |
| Dev JWT, no Clerk | `CLERK_SECRET_KEY=` | `node scripts/print-dev-jwt.mjs` | Local decoded JWT claims are accepted | Missing `Authorization` returns 401 |
| Dev JWT while Clerk env exists | `AUTH_DEV_JWT_ONLY=true` | `node scripts/print-dev-jwt.mjs` | Dev token bypasses Clerk verification | Dev JWT rejected if flag is absent |
| Clerk | `CLERK_SECRET_KEY=<value>` and no dev-only flag | Real Clerk session token | Production-like auth path | `print-dev-jwt` token fails verification |

Generate the local token:

```bash
export TOKEN=$(node scripts/print-dev-jwt.mjs)
```

Use another tenant:

```bash
export TOKEN=$(DEV_JWT_ORG_ID=org_meu_tenant node scripts/print-dev-jwt.mjs)
```

## 4. Event Bus Matrix

| Layer | Env / command | Durability | Use |
| --- | --- | --- | --- |
| In-memory event bus | Omit `BRUCE_EVENT_BUS` or set `memory` | Same process only | Unit tests, single-process experiments |
| Redis event bus | `BRUCE_EVENT_BUS=redis` plus `REDIS_URL` | Cross-process pub/sub | Recommended local multi-process behavior |
| BullMQ module queues | `ENABLE_BULLMQ_WORKERS=true` or module worker scripts | Durable jobs and retries | Inter-module handoffs and replay |
| DLQ replay | `pnpm run events:retry-dlq` | Requeues DLQ jobs | Recovery after fixing routing/payload/config |

For replay details, use [operator-dlq-recovery-runbook.md](operator-dlq-recovery-runbook.md).

For the complete module topology, event classifications, handoff envelope policy, and failure taxonomy, use [orchestration-source-of-truth.md](orchestration-source-of-truth.md).

## 5. Minimal Vertical Smoke

Run infrastructure and migrations first, then start only the target services with Temporal workers enabled.

Terminal A:

```bash
PORT=3000 ENABLE_TEMPORAL_WORKER=true pnpm --filter @bruce/app-bruce-core exec tsx src/index.ts
```

Terminal B:

```bash
PORT=3002 ENABLE_TEMPORAL_WORKER=true pnpm --filter @bruce/app-opportunity exec tsx src/index.ts
```

Health checks:

```bash
curl -sS http://localhost:3000/health
curl -sS http://localhost:3002/health
```

Create a venture:

```bash
VENTURE_ID=$(curl -sS -X POST http://localhost:3000/ventures \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Venture","stage":"concept"}' | jq -r .id)
echo "$VENTURE_ID"
```

Start Bruce-Core analysis and poll the job:

```bash
JOB_ID=$(curl -sS -X POST "http://localhost:3000/ventures/$VENTURE_ID/start-analysis" \
  -H "Authorization: Bearer $TOKEN" | jq -r .job_id)

curl -sS "http://localhost:3000/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Start an Opportunity scan and poll by Temporal workflow ID:

```bash
WORKFLOW_ID=$(curl -sS -X POST http://localhost:3002/scans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"venture_id\":\"$VENTURE_ID\",\"opportunities\":[]}" | jq -r .workflow_id)

curl -sS "http://localhost:3002/jobs/$WORKFLOW_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Open `http://localhost:8080` and search for `venture-analysis-` or `opportunity-scan-`.

## 6. Cross-Module Handoff Smoke

Use this after the minimal smoke works.

1. Keep Bruce-Core and Opportunity running.
2. Start Add-Venture HTTP and worker:

```bash
PORT=3003 ENABLE_TEMPORAL_WORKER=true ENABLE_BULLMQ_WORKERS=true pnpm --filter @bruce/app-add-venture exec tsx src/index.ts
```

3. Use `BRUCE_EVENT_BUS=redis` and `REDIS_URL=redis://localhost:6379`.
4. Trigger an Opportunity scan that reaches advancement.
5. Confirm `opportunity.advanced` is processed and an Add-Venture workflow starts.
6. If it lands in DLQ, inspect and replay with `pnpm run events:retry-dlq`.

## 7. Dashboard Truth

Dashboard visibility is not the same as backend readiness.

```bash
pnpm --filter dashboard build:manifests
pnpm --filter dashboard dev
```

Open `http://localhost:4200`, set the token in Settings, and use the runtime readiness column before treating a module as live. The generated manifests describe repository and eval coverage; health checks and token state still decide runtime behavior.

## 8. Test Matrix

| Command | Scope | Notes |
| --- | --- | --- |
| `pnpm test` / `pnpm test:unit` | Root Vitest workspace | Includes every `apps/*` and `packages/*` Vitest config listed in `vitest.workspace.ts` |
| `pnpm test:turbo` | Package `test` scripts through Turbo | Broader package script surface, slower |
| `pnpm test:integration` | Opportunity integration config | HTTP E2E paths require live services and token env |
| `BRUCE_E2E_INTEGRATION=1 BRUCE_E2E_TOKEN="$(node scripts/print-dev-jwt.mjs)" pnpm test:integration` | Real HTTP E2E | Requires running Bruce-Core and Opportunity |
| `pnpm evals all --report` | Agent eval scenarios | LLM-dependent checks may need provider keys |

CI currently runs unit tests on pushes and PRs. Integration and eval jobs run on `main` and may be `continue-on-error` while the stack stabilizes.

## 9. Ready Criteria

- `pnpm run infra:up` is healthy.
- DB migrations complete.
- Dev token or Clerk token is configured.
- `/health` succeeds for every service in the chosen startup path.
- Temporal UI shows the expected workflow IDs.
- Job routes return structured `QUEUED`, `RUNNING`, terminal, or normalized error status.
- For inter-module work, Redis mode and BullMQ workers are explicit.
- `pnpm test` reflects the root Vitest workspace, not package configs hidden outside it.
