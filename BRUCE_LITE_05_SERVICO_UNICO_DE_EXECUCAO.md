# Bruce Lite 05 - Servico Unico de Execucao

## Objetivo
Criar uma camada unica para executar qualquer agente, reduzindo wrappers duplicados em activities e services.

## Arquitetura alvo
Expor uma funcao central:

```ts
runAgentStep({
  module,
  agentId,
  input,
  context,
})
```

Essa funcao deve ser o unico caminho de alto nivel para chamar IA dentro dos apps.

## Escopo
- Criar `runAgentStep` em `@bruce/agent-runtime` ou pacote dedicado.
- Padronizar `ExecutionContext`.
- Padronizar erros, logs, correlation id, observability ids e persistencia de deliverables.
- Manter `AgentRunner.run` como nucleo de execucao.

## Tarefas
1. Definir tipo `RunAgentStepParams`.
2. Implementar `runAgentStep` como wrapper fino em cima de `AgentRunner.run`.
3. Substituir chamadas repetidas em `apps/add-venture/src/temporal/activities.ts`.
4. Garantir que o erro final inclua `module`, `agentId` e `correlationId`.
5. Adicionar testes unitarios para sucesso e falha de validacao.

## Criterios de aceite
- Existe uma unica funcao reutilizavel para executar agentes.
- Apps nao montam manualmente retry, logger ou validacao de agente.
- `runVolAgent` deixa de ser padrao local e vira funcionalidade compartilhada.
- As assinaturas publicas ficam pequenas e previsiveis.

## Arquivos importantes
- `packages/agent-runtime/src/agent-runner.ts`
- `packages/agent-runtime/src/index.ts`
- `apps/add-venture/src/temporal/activities.ts`
