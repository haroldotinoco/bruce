# Bruce Lite 08 - Migracao dos Consumidores

## Objetivo
Migrar apps e pacotes para importar contratos de agente a partir da fonte central Zod, removendo duplicacoes graduais.

## Consumidores principais
- `apps/add-venture`
- `apps/dashboard`
- `packages/handoff`
- `packages/contracts`
- `packages/agent-runtime`
- demais apps que importam `packages/contracts/src/generated/**`

## Tarefas
1. Fazer grep por imports de `@bruce/contracts/generated` e paths diretos em `packages/contracts/src/generated`.
2. Migrar primeiro os consumidores do modulo `add-venture`.
3. Trocar interfaces geradas por tipos de `@bruce/schemas`.
4. Trocar validacoes locais por schemas Zod centrais quando aplicavel.
5. Manter compatibilidade temporaria com `@bruce/contracts` se outros modulos ainda dependerem.

## Ordem sugerida
1. `agent-runtime`
2. `apps/add-venture`
3. `packages/handoff`
4. `apps/dashboard`
5. outros apps
6. limpeza final de `packages/contracts`

## Criterios de aceite
- `business-model-modeler` nao tem shape duplicado fora do schema central e dos JSON originais.
- `add-venture` compila usando tipos centrais.
- `packages/contracts` nao gera mais tipos de agent I/O para partes ja migradas.
- Imports antigos remanescentes estao documentados e justificados.

## Cuidados
- Nao remover tipos usados por modulos ainda nao migrados.
- Evitar refactor visual no dashboard nesta etapa.
- Preservar nomes publicos de rotas e payloads.
