# Bruce Lite 04 - AgentRunner Limpo

## Objetivo
Transformar `AgentRunner` em um runtime generico, sem conhecimento de agentes especificos.

## Problema atual
`packages/agent-runtime/src/agent-runner.ts` contem logica condicional por `agentId`, incluindo fallbacks e normalizacoes que pertencem aos agentes ou ao pipeline.

## Responsabilidade final do AgentRunner
O runner deve fazer apenas:
- carregar especificacao do agente;
- validar input;
- montar prompt com skill, constraints e contexto;
- chamar o cliente LLM;
- validar output;
- aplicar retry;
- persistir deliverable quando aplicavel;
- retornar resultado padronizado.

## Tarefas
1. Localizar todos os `switch`, `case` ou `if` por `agentId` no runner.
2. Separar fallbacks por agente em arquivos locais ao agente ou em registry especifico.
3. Criar interface opcional:
   - `normalizeInput?(input, context)`
   - `normalizeOutput?(output, context)`
   - `fallbackOutput?(input, context, error)`
4. Garantir que o runner invoque hooks genericos sem saber nomes de agentes.
5. Adicionar testes para input invalido, output invalido, retry e fallback.

## Criterios de aceite
- `agent-runner.ts` nao possui `case 'business-model-modeler'` nem regras por agente.
- Fallbacks especificos ficam proximos ao agente ou em registry dedicado.
- O comportamento atual de execucao continua preservado.
- `pnpm --filter @bruce/agent-runtime test` ou equivalente passa.

## Arquivos importantes
- `packages/agent-runtime/src/agent-runner.ts`
- `packages/agent-runtime/src/types.ts`
- `modules/add-venture/agents/*`
