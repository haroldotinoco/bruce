#!/usr/bin/env bash
# Reinício completo: volumes Docker, dependências, build, infra e migrações.
# Uso: na raiz do repo — `bash scripts/restart-dev-stack.sh` ou `pnpm run restart:dev-stack`
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> docker compose down -v"
docker compose down -v

echo "==> pnpm install"
pnpm install

echo "==> pnpm run build"
pnpm run build

echo "==> pnpm run infra:up"
pnpm run infra:up

echo "==> pnpm --filter @bruce/db run db:migrate"
pnpm --filter @bruce/db run db:migrate

echo "==> pnpm --filter @bruce/db run sync:openrouter-models (best effort)"
pnpm --filter @bruce/db run sync:openrouter-models || echo "WARN: OpenRouter model sync failed (continuing)"

echo ""
echo "Stack local pronta. Arranca as APIs com: pnpm dev (e opcionalmente pnpm workers)."
