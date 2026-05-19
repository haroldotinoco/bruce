# Bruce Lite 07 - Pipeline Declarativo Add Venture

## Objetivo
Transformar o workflow `add-venture` em um executor orientado por definicao de etapas, alinhando o manifesto JSON ao runtime real.

## Problema atual
`modules/add-venture/workflows/venture-structuring-pipeline.workflow.json` existe, mas a implementacao real esta hardcoded em `apps/add-venture/src/temporal/workflows.ts`.

## Arquitetura alvo
Um pipeline declarativo com:
- lista ordenada de etapas;
- `agentId` por etapa;
- chave de output no contexto;
- mapper de input;
- metadados de UI/observability;
- hooks opcionais para excecoes de dominio.

## Tarefas
1. Definir `AddVenturePipelineContext`.
2. Criar definicao de steps em TypeScript ou JSON validado por Zod.
3. Para cada etapa, declarar:
   - `key`
   - `label`
   - `agentId`
   - `outputKey`
   - `buildInput(ctx)`
4. Recriar o fluxo atual:
   - briefing
   - vol1
   - vol2
   - vol3
   - vol4
   - vol5
   - vol6
   - vol7
   - vol8
   - critic
   - composer
5. Manter `ventureAdditionWorkflow` como wrapper fino em cima do executor declarativo.

## Criterios de aceite
- `workflows.ts` fica majoritariamente como loop de execucao e gerenciamento de estado.
- O manifesto deixa de divergir do runtime ou passa a ser claramente gerado a partir da definicao real.
- Etapas novas podem ser adicionadas sem criar nova activity.
- Output de cada etapa fica salvo no contexto com nome estavel.

## Arquivos importantes
- `apps/add-venture/src/temporal/workflows.ts`
- `modules/add-venture/workflows/venture-structuring-pipeline.workflow.json`
- `apps/add-venture/src/temporal/activities.ts`
