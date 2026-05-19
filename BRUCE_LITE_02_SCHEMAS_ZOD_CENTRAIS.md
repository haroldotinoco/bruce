# Bruce Lite 02 - Schemas Zod Centrais

## Objetivo
Criar uma fonte central de validacao e tipos baseada em Zod, mantendo os JSON Schemas dos agentes como a estrutura visivel do sistema.

## Decisao arquitetural
Os arquivos `modules/<module>/agents/<agentId>/input.schema.json` e `output.schema.json` continuam existindo. A partir deles, o build gera schemas Zod e tipos TypeScript inferidos.

## Escopo
- Criar ou evoluir um pacote central, preferencialmente `@bruce/schemas`.
- Gerar schemas Zod por agente.
- Exportar tipos via `z.infer`.
- Evitar interfaces paralelas geradas por `json-schema-to-typescript` para agent input/output.

## Tarefas
1. Criar o pacote `packages/schemas` ou adaptar `packages/contracts` se for mais simples.
2. Adicionar script de codegen que percorre `modules/**/input.schema.json` e `modules/**/output.schema.json`.
3. Gerar arquivos como:
   - `agents/add-venture/business-model-modeler/input.ts`
   - `agents/add-venture/business-model-modeler/output.ts`
4. Cada arquivo gerado deve exportar:
   - `BusinessModelModelerInputSchema`
   - `BusinessModelModelerInput`
   - `BusinessModelModelerOutputSchema`
   - `BusinessModelModelerOutput`
5. Criar um registry gerado para lookup por `module` e `agentId`.

## Criterios de aceite
- `business-model-modeler` possui schema Zod central para input e output.
- Tipos sao inferidos de Zod, nao declarados manualmente.
- O codegen e repetivel e nao depende de estado local.
- `pnpm type-check` passa para o pacote de schemas.

## Fora de escopo
- Migrar todos os consumidores nesta etapa.
- Remover `packages/contracts/src/generated/**` antes de confirmar que nao ha referencias.
