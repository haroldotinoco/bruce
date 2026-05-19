# Bruce Lite 09 - Limpeza de Legado

## Objetivo
Remover codigo duplicado ou obsoleto somente depois que os consumidores estiverem migrados e testados.

## Itens candidatos a remocao
- Interfaces de agent I/O geradas em `packages/contracts/src/generated/**`.
- Conversor runtime `jsonSchemaToZod`, se nenhum caminho ainda depender dele.
- Wrappers por agente em `apps/*/src/temporal/activities.ts`.
- Switches por agente dentro de `agent-runner.ts`.
- Manifestos marcados como divergentes, se forem substituidos por fonte declarativa real.

## Tarefas
1. Rodar grep antes de remover qualquer arquivo.
2. Remover apenas arquivos sem referencias.
3. Atualizar exports publicos dos pacotes.
4. Atualizar READMEs com o novo fluxo:
   - como adicionar agente;
   - como gerar schemas;
   - como adicionar etapa ao pipeline;
   - como executar localmente.
5. Remover scripts de codegen antigos somente quando nao forem usados por outros contratos.

## Criterios de aceite
- Nao existem imports quebrados para arquivos removidos.
- O build nao depende de artefatos antigos.
- Documentacao explica o novo caminho feliz.
- `git diff` nao contem remocoes acidentais de prompts, constraints ou exemplos de agentes.

## Comandos de verificacao sugeridos
```bash
pnpm type-check
pnpm test
pnpm build
```

## Cuidados
- Nao apagar contratos intermodulares que nao sejam agent input/output.
- Nao apagar fixtures usadas por testes ou avaliacoes.
- Nao apagar exemplos em `modules/*/agents/*/examples`.
