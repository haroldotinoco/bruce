# Bruce Lite 10 - Validacao 100 Funcional

## Objetivo
Garantir que o refactor `bruce-lite` esta funcional de ponta a ponta antes de mergear.

## Validacao tecnica
Rodar:

```bash
pnpm type-check
pnpm test
pnpm build
```

Quando aplicavel, rodar testes filtrados por pacote:

```bash
pnpm --filter @bruce/agent-runtime test
pnpm --filter @bruce/app-add-venture test
pnpm --filter @bruce/schemas test
```

## Validacao funcional add-venture
1. Subir dependencias locais necessarias.
2. Executar um fluxo add-venture completo.
3. Confirmar que cada etapa roda na ordem esperada:
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
4. Confirmar que outputs sao validados pelo Zod central.
5. Confirmar que deliverables continuam sendo persistidos.
6. Confirmar que observability e status do workflow continuam aparecendo no dashboard.

## Validacao de simplificacao
Executar buscas para comprovar que a duplicacao caiu:

```bash
rg "BusinessModelModelerOutput"
rg "business-model-modeler" packages apps modules
rg "jsonSchemaToZod"
rg "runBusinessModelModeler"
```

## Criterios de aceite finais
- O fluxo `add-venture` roda de ponta a ponta.
- `AgentRunner.run` continua sendo o unico nucleo de chamada LLM.
- Activities por agente foram substituidas por activity generica.
- Schemas Zod centrais sao a fonte de tipos e validacao.
- Prompts, skills, constraints e exemplos dos agentes foram preservados.
- Nenhum contrato publico foi quebrado sem migracao correspondente.

## Checklist de merge
- Branch atual: `bruce-lite`.
- CI verde.
- Diff revisado para garantir que nao houve remocao acidental de conteudo de agente.
- README ou docs atualizados.
- Plano de rollback entendido: voltar para wrappers antigos e codegen antigo se a execucao Temporal falhar.
