Quero uma auditoria agressiva de limpeza do refactor `bruce-lite`.

Objetivo: garantir que o repositório ficou realmente minimalista, sem camadas antigas convivendo com a arquitetura nova.

Assuma que o refactor está incompleto até provar o contrário por busca no repositório. Seja cético: se duas camadas fazem a mesma coisa, uma delas deve morrer.

Faça uma análise completa e depois proponha/remova código legado com segurança.

## O que verificar

1. Procure duplicações de contratos de agentes:
   - `BusinessModelModelerInput`
   - `BusinessModelModelerOutput`
   - qualquer `*Input` / `*Output` de agentes em mais de uma fonte
   - imports de `packages/contracts/src/generated/**`
   - imports de `@bruce/contracts/generated/**`

2. Confirme que existe uma única fonte real de schema/tipo:
   - Zod central ou registry central
   - JSON dos agentes apenas como fonte/manifesto, se esse foi o desenho escolhido
   - nenhum tipo manual duplicando shape de agente

3. Procure runtime legado:
   - `jsonSchemaToZod`
   - `json-schema-to-typescript`
   - `generate-types.ts`
   - conversões JSON Schema → Zod feitas em runtime
   - registries paralelos

4. Procure orchestration legado:
   - `runBusinessModelModeler`
   - `runBriefingInterpreter`
   - `runGtmPlanner`
   - qualquer `run<AgentName>` que só embrulhe `AgentRunner.run`
   - workflows Temporal hardcoded etapa por etapa
   - manifests marcados como `runtime_alignment: diverges_from_temporal_implementation`

5. Procure lógica específica de agente dentro de runtime genérico:
   - `case 'business-model-modeler'`
   - `case 'gtm-planner'`
   - `switch (agentId)`
   - fallbacks hardcoded dentro de `agent-runner.ts`
   - normalizações por agente fora do agente/pipeline

6. Procure arquivos mortos:
   - arquivos gerados antigos sem import
   - scripts antigos sem uso no `package.json`
   - exports públicos que apontam para código removido
   - testes que só validam arquitetura antiga
   - docs que ensinam fluxo antigo

## Critérios de limpeza

Para cada item encontrado, classifique como:

- `REMOVER`: legado sem uso real
- `MIGRAR`: ainda usado, mas deveria apontar para arquitetura nova
- `MANTER`: necessário e justificado
- `DÚVIDA`: precisa de decisão humana

Não aceite “compila” como prova de limpeza. Quero evidência por busca no repo.

## Saída esperada antes de editar

Primeiro me mostre um relatório curto com:

- principais duplicações encontradas
- arquivos candidatos a remoção
- arquivos candidatos a migração
- riscos de remover
- plano de limpeza em ordem segura

Depois, se estiver em Agent mode, execute a limpeza em commits lógicos ou etapas pequenas.

## Regras de execução

- Não remova `SKILL.md`, `constraints.md`, `capabilities.json`, `tools.json`, `examples/`, `input.schema.json` ou `output.schema.json` dos agentes.
- Não remova contratos intermodulares que não sejam duplicação de agent input/output.
- Não apague fixtures usadas por testes/evals.
- Não faça refactor cosmético.
- Não mantenha shims “temporários” se todos os consumidores já foram migrados.
- Se um arquivo existe só para compatibilidade com código que também está na branch, migre o consumidor e remova o shim.
- Se houver dois caminhos equivalentes para executar agente, escolha o novo e remova o antigo.

## Comandos/buscas obrigatórios

Use buscas equivalentes a:

```bash
rg "BusinessModelModeler(Input|Output)"
rg "@bruce/contracts.*generated|packages/contracts/src/generated"
rg "jsonSchemaToZod|json-schema-to-typescript|generate-types"
rg "run(BusinessModelModeler|BriefingInterpreter|OpportunityAnalystVol1|CustomerMarketArchitect|ValuePropositionDesigner|GtmPlanner|NarrativeStrategist|RiskValidationAnalyst|ExecutionRoadmapPlanner|VentureCritic|DossierComposer)"
rg "switch .*agentId|case '.*-.*'"
rg "runtime_alignment.*diverges"
rg "AgentRunner.run|getAgentRunner\\(\\)\\.run"
```

Também rode:
```bash
pnpm type-check
pnpm test
pnpm build
```

Se algum comando for pesado ou falhar por motivo externo, explique exatamente o que falhou e continue com verificações menores por pacote.

Resultado final desejado
No final, quero que você responda com:

O que foi removido.
O que foi migrado.
O que ainda ficou por compatibilidade, com justificativa.
Evidências de que não existem caminhos duplicados para:
schemas/tipos de agentes;
execução de agentes;
pipeline add-venture.
Resultado dos testes/type-check/build.
