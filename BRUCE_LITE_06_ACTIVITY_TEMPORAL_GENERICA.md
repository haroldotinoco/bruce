# Bruce Lite 06 - Activity Temporal Generica

## Objetivo
Reduzir as activities Temporal por agente para uma activity generica por app ou modulo.

## Problema atual
`apps/add-venture/src/temporal/activities.ts` possui funcoes como `runBriefingInterpreter`, `runBusinessModelModeler`, `runGtmPlanner` e outras que repetem a mesma estrutura.

## Arquitetura alvo
Manter uma activity generica:

```ts
runAgentActivity({
  module,
  agentId,
  input,
  context,
})
```

Activities que fazem persistencia, handoff ou eventos podem continuar separadas se nao forem execucao direta de agente.

## Tarefas
1. Criar `runAgentActivity` em `apps/add-venture/src/temporal/activities.ts`.
2. Fazer essa activity chamar `runAgentStep`.
3. Remover wrappers por agente depois que o workflow usar a activity generica.
4. Preservar campos atuais:
   - `accountId`
   - `ventureId`
   - `opportunityId`
   - `correlationId`
   - `observabilityRunId`
   - `observabilityStepKey`
   - `observabilityParentStepKey`
   - `projectNickname`
5. Manter helpers de DB, handoff, eventos e deliverables fora da activity generica quando forem comportamento especifico.

## Criterios de aceite
- `apps/add-venture/src/temporal/activities.ts` nao tem uma funcao `run*` por agente.
- O workflow chama `act.runAgentActivity(...)` para etapas de agente.
- Erros continuam falhando a workflow de forma clara.
- O comportamento de observability permanece equivalente.

## Arquivos importantes
- `apps/add-venture/src/temporal/activities.ts`
- `apps/add-venture/src/temporal/workflows.ts`
- `packages/agent-runtime/src/index.ts`
