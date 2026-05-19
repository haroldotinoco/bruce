# Bruce Lite 03 - Registry de Agentes

## Objetivo
Substituir descoberta e conversao dinamica de schemas por um registry central, tipado e gerado.

## Problema atual
`AgentLoader` le arquivos do filesystem e converte JSON Schema para Zod em runtime. Isso cria conversao fraca, dificulta type-check e espalha a responsabilidade dos contratos.

## Arquitetura alvo
Criar um registry com entradas no formato:

```ts
{
  module: 'add-venture',
  agentId: 'business-model-modeler',
  inputSchema,
  outputSchema,
  skillPath,
  constraintsPath,
  capabilitiesPath,
  toolsPath,
}
```

## Tarefas
1. Gerar registry junto com o pacote central de schemas.
2. Manter paths para arquivos markdown e JSON de configuracao do agente.
3. Alterar `AgentLoader` para resolver schemas pelo registry.
4. Manter leitura de `SKILL.md`, `constraints.md`, `capabilities.json` e `tools.json` como esta, salvo se houver simplificacao clara.
5. Remover ou isolar `jsonSchemaToZod` do caminho principal.

## Criterios de aceite
- `AgentLoader.loadAgent(module, agentId)` retorna `AgentSpec` com schemas Zod vindos do registry.
- A validacao de input/output continua acontecendo no `AgentRunner`.
- Agentes inexistentes continuam gerando erro claro.
- Testes cobrem pelo menos um agente existente e um agente inexistente.

## Arquivos importantes
- `packages/agent-runtime/src/agent-loader.ts`
- `packages/agent-runtime/src/json-schema-zod.ts`
- `packages/agent-runtime/src/types.ts`
- `packages/schemas/src/registry.ts`
