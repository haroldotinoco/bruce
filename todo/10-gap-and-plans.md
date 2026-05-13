# Lacunas vs roadmap 00–09 e planos seguintes

## Esclarecimento importante

Os ficheiros `00-xxx.md` … `09-xxx.md` são um **roadmap de implementação** (o que construir), não um relatório do que já está feito. O código no repositório foi crescendo **por fases e por prioridade**; várias fases estão **parciais** e **sete apps de módulo** ainda são *scaffold* (sem API HTTP nem fluxo completo).

**Não é verdade** que “só existem core e opportunity” em termos de *pacotes* — `@bruce/logger`, `@bruce/db`, `@bruce/auth`, `@bruce/llm`, `@bruce/events`, etc. existem e são usados. O que falta para “100% todos os módulos” é sobretudo **camada HTTP + workers Temporal + ligação a workflows** em cada app de módulo que hoje só arranca um `console.log`.

---

## Estado por fase (alto nível)

| Fase | Tópico | Estado no repo (resumo) |
|------|--------|-------------------------|
| 0 | Monorepo + Docker | **Feito** — pnpm, turbo, compose, apps/pacotes criados |
| 1 | Pacotes `@bruce/*` | **Majoritariamente feito** — builds; RLS/DB a evoluir com o resto |
| 2 | Agent runtime | **Feito** (loader, runner, LLM); ToolRegistry / ferramentas reais parciais |
| 3 | Temporal workers | **Parcial** — workers em bruce-core/opportunity/add-venture; workflows E2E a cravar |
| 4 | HTTP por módulo | **Parcial** — **só** `bruce-core` e `opportunity` têm servidor Hono real |
| 5 | Auth / multi-tenant | **Parcial** — Clerk middleware, webhooks, plan limits, migrações orgs; RLS session em fluxo real a validar |
| 6 | Eventos inter-módulo | **Parcial** — Redis/BullMQ possível; fan-out entre módulos não está completo |
| 7 | Observabilidade | **Parcial** — Pino, correlation; Better Stack / atributos Temporal como no doc |
| 8 | Billing SaaS | **Parcial** — rotas Stripe existem; produto completo depende de chaves e testes |
| 9 | Testes / evals | **Parcial** — Vitest workspace, evals CLI, integração opportunity skipped |

---

## Estado por app (`apps/*`)

| App | HTTP (Hono) | Worker Temporal | Worker BullMQ | Nota |
|-----|-------------|-----------------|---------------|------|
| `bruce-core` | Sim | Opcional (`ENABLE_TEMPORAL_WORKER`) | Opcional | Caminho principal de ventures/jobs |
| `opportunity` | Sim | Opcional | — | Scans / jobs |
| `add-venture` | **Não** (scaffold) | Ficheiro worker existe | Opcional | Falta API + integração |
| `brand-aid` | **Não** | — | Opcional | Scaffold |
| `builder` | **Não** | — | Opcional | Scaffold |
| `gtm` | **Não** | — | — | Scaffold |
| `startup-ops` | **Não** | — | — | Scaffold |
| `portfolio` | **Não** | — | — | Scaffold |
| `bruce-memory` | **Não** | — | — | Scaffold |
| `api-gateway` | **Não** | — | — | Scaffold |

Para “todos funcionando 100%”, cada linha acima precisa do mesmo nível de **rotas + auth + DB + workflows + testes** que já tens em bruce-core/opportunity (ajustado ao domínio do módulo).

---

## Plano A — Cadeia vertical E2E (recomendado primeiro)

Objetivo: um fluxo **documentado e testável** ponta a ponta antes de espalhar pelos outros módulos.

1. **Congelar ambiente:** `.env` na raiz, `pnpm infra:up`, migrações OK, `dotenv-cli` ou carregamento de env nos scripts.
2. **bruce-core:** criar venture → job/workflow com JWT válido (Clerk ou dev).
3. **opportunity:** disparar scan → Temporal UI mostra execução → resultado persistido ou visível.
4. **Testes:** `pnpm test`, depois integração real (substituir `describe.skip` quando infra de teste estiver estável).
5. **Critério de pronto:** README com sequência de curls/scripts que qualquer pessoa repete e vê sucesso.

*Entrega:* `todo/QUICK_START.md` ou secção no README raiz atualizada com essa sequência.

---

## Plano B — Completar HTTP + Temporal por módulo (ordem sugerida)

Repetir o *padrão* de `apps/opportunity` (ou `bruce-core`) para cada app:

1. **`app.ts` + rotas** — health, `/doc`, recursos do módulo (`modules/<nome>/` OpenAPI).
2. **`index.ts`** — `serve()` com `PORT` (usar convenção `.env.example`: 3003…3009).
3. **Temporal** — task queue por módulo, workflows/activities que chamam `AgentRunner`.
4. **Jobs** — `GET /jobs/:id` alinhado a `bruce-core` ou padrão comum.
5. **Testes** — smoke HTTP + um teste de integração com Temporal/DB se aplicável.

**Ordem recomendada** (alinha ao roadmap e dependências de negócio):

1. **add-venture** — recebe eventos pós-opportunity; desbloqueia narrativa “venture completa”.
2. **brand-aid** + **builder** — em paralelo após add-venture se quiseres fan-out (Fase 6).
3. **gtm** — depois de brand/builder se o fluxo for sequencial.
4. **startup-ops** + **portfolio** — operações e reporting.
5. **bruce-memory** — vector/Qdrant + agentes de memória.
6. **api-gateway** — opcional no fim (roteamento, rate limit, um único entrypoint público).

Cada módulo pode ser um **mini-projeto** de 2–5 dias (como no `todo/README` por fase).

---

## Plano C — Eventos entre módulos (Fase 6 completa)

1. Contratos de eventos em `@bruce/contracts` já alinhados aos `modules/*/events`.
2. Com `BRUCE_EVENT_BUS=redis`, garantir **publish** no bruce-core/opportunity quando o estado muda.
3. **Subscribers** nos apps que hoje só têm BullMQ stub — handler que inicia workflow ou idempotência.
4. DLQ / retry — já há peças em `@bruce/events`; fechar com testes e monitorização.

---

## Plano D — Observabilidade e billing (produção)

1. **Fase 7:** correlation end-to-end, Better Stack se usares, search attributes no Temporal.
2. **Fase 8:** Stripe end-to-end em staging (webhooks, metering, portal).

---

## Plano E — Qualidade (Fase 9 contínua)

1. Aumentar cobertura nos pacotes críticos (`auth`, `db`, `agent-runtime`).
2. Evals LLM por módulo em CI (opcional `continue-on-error` enquanto estabiliza).
3. Pipeline CI: unit sempre; integração com serviços em branch `main` ou job manual.

---

## Resumo executivo

| Queres | Foco |
|--------|------|
| “Tudo no ar” técnico | Plano **B** (um app de cada vez) + **C** |
| “Demo vendável” | Plano **A** primeiro, depois **B** só em **add-venture** |
| “SaaS fechado” | **A + B** mínimo viável + **D** |

O ficheiro `todo/README.md` continua a ser o índice das fases 0–9; **este documento** é o mapa do que ainda falta em relação a esse alvo e a ordem sugerida para fechar.

Quando começares um módulo novo, podes adicionar `todo/11-add-venture-http.md` (ou nome do módulo) com checklist copiada do Plano B para esse app em concreto.
