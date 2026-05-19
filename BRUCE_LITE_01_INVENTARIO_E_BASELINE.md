# Bruce Lite 01 - Inventario e Baseline

## Objetivo
Mapear o estado atual antes de refatorar, garantindo que a branch `bruce-lite` tenha uma linha de base funcional e verificavel.

## Escopo
- Levantar todos os agentes em `modules/*/agents/*`.
- Listar todos os `input.schema.json`, `output.schema.json`, `SKILL.md`, `constraints.md`, `capabilities.json` e `tools.json`.
- Identificar quem importa tipos gerados de `packages/contracts/src/generated/**`.
- Identificar chamadas diretas a `getAgentRunner().run(...)`.
- Identificar workflows hardcoded em `apps/*/src/temporal/workflows.ts`.

## Tarefas
1. Criar um inventario dos agentes por modulo.
2. Fazer grep por tipos duplicados, especialmente `BusinessModelModelerInput` e `BusinessModelModelerOutput`.
3. Rodar `pnpm type-check` e salvar o estado atual de erros, se existirem.
4. Rodar testes relevantes: `pnpm test` ou filtros por pacote quando o suite completo for pesado.
5. Documentar quais arquivos parecem legados, gerados ou divergentes.

## Criterios de aceite
- Existe uma lista clara de agentes, schemas e consumidores.
- O estado inicial de build/type-check/test esta conhecido.
- Nenhum comportamento foi alterado nesta etapa.

## Arquivos importantes
- `modules/`
- `packages/contracts/scripts/generate-types.ts`
- `packages/agent-runtime/src/agent-loader.ts`
- `packages/agent-runtime/src/agent-runner.ts`
- `apps/*/src/temporal/activities.ts`
- `apps/*/src/temporal/workflows.ts`
