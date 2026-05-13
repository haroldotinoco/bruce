# Fase 9 — Testes e Avaliações

**Status:** Não iniciado  
**Prioridade:** Alta (essencial para confiança)  
**Duração estimada:** 3–5 dias para cobertura básica  
**Responsável:** QA / Backend  
**Dependências:** Fases 0–8 (todas as fases anteriores)

---

## Visão Geral

Testes garantem que o sistema funciona. Avaliações garantem que os agentes de IA fazem bom trabalho.

Três níveis:

1. **Unit tests** — input/output, schemas, lógica isolada (rápido, sem LLM)
2. **Integration tests** — workflows completas com DB real (médio, LLM mockado)
3. **LLM evaluation tests** — agentes reais contra scenarios (lento, caro, apenas CI)

**Objetivo:** Ter confiança que cada peça funciona isolada e integrada, e que agentes não decaem em qualidade.

---

## 1. Unit Tests (Rápido, Sem LLM)

### 1.1 Setup

Arquivo: `packages/*/src/__tests__/unit.test.ts`

```bash
# Instalar Vitest
pnpm add -D vitest @vitest/ui happy-dom

# Executar
pnpm test:unit
```

Arquivo: `vitest.config.ts` (root)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    exclude: ['**/integration.test.ts', '**/eval.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/dist/',
        '**/__tests__/',
      ],
    },
  },
});
```

### 1.2 Test de Schema Validation

Arquivo: `packages/db/src/__tests__/schema-validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ModuleEventSchema } from '@bruce/events';

describe('Schema Validation', () => {
  it('should validate correct ModuleEvent', () => {
    const event = {
      event_id: 'abc123',
      event_type: 'opportunity.advanced',
      module: 'opportunity',
      timestamp: new Date().toISOString(),
      severity: 'info',
      payload: { problem: 'Test' },
    };

    const result = ModuleEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('should reject event with missing fields', () => {
    const event = {
      event_type: 'opportunity.advanced',
      // missing other required fields
    };

    const result = ModuleEventSchema.safeParse(event);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].code).toBe('invalid_type');
  });

  it('should reject invalid event_type', () => {
    const event = {
      event_id: 'abc123',
      event_type: 'invalid.event',
      module: 'opportunity',
      timestamp: new Date().toISOString(),
      severity: 'info',
      payload: {},
    };

    const result = ModuleEventSchema.safeParse(event);
    expect(result.success).toBe(false);
  });
});
```

### 1.3 Test de Plan Limits

Arquivo: `packages/auth/src/__tests__/plan-limits.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS } from '@bruce/auth';

describe('Plan Limits', () => {
  it('free plan has lower limits than pro', () => {
    const free = PLAN_LIMITS.free;
    const pro = PLAN_LIMITS.pro;

    expect(free.max_ventures).toBeLessThan(pro.max_ventures);
    expect(free.max_opportunities_per_month).toBeLessThan(
      pro.max_opportunities_per_month,
    );
  });

  it('enterprise has unlimited usage', () => {
    const enterprise = PLAN_LIMITS.enterprise;

    expect(enterprise.max_ventures).toBeGreaterThan(100);
    expect(enterprise.max_ai_credits_per_month).toBeGreaterThan(999000);
  });

  it('should load limits from module spec', async () => {
    const limits = getPlanLimits('opportunity', 'pro');

    expect(limits).toHaveProperty('max_scans_per_month');
    expect(typeof limits.max_scans_per_month).toBe('number');
  });
});
```

### 1.4 Test de RLS

Arquivo: `packages/db/src/__tests__/rls.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getDB, accounts, ventures } from '@bruce/db';
import { eq } from 'drizzle-orm';

describe('Row-Level Security (RLS)', () => {
  let db: ReturnType<typeof getDB>;

  beforeEach(() => {
    db = getDB();
  });

  it('should isolate ventures between accounts', async () => {
    const accountA = 'org_aaa';
    const accountB = 'org_bbb';

    // Setup: Create accounts
    await db.insert(accounts).values([
      { account_id: accountA, name: 'Account A', slug: 'account-a' },
      { account_id: accountB, name: 'Account B', slug: 'account-b' },
    ]).run();

    // Account A creates a venture
    await db
      .insert(ventures)
      .values({
        venture_id: 'vent_a1',
        account_id: accountA,
        name: 'Startup A',
      })
      .run();

    // Account A queries its ventures
    const venturesA = await db
      .select()
      .from(ventures)
      .where(eq(ventures.account_id, accountA))
      .run();

    // Account B queries (with RLS, should see nothing)
    const venturesB = await db
      .select()
      .from(ventures)
      .where(eq(ventures.account_id, accountB))
      .run();

    expect(venturesA).toHaveLength(1);
    expect(venturesA[0].venture_id).toBe('vent_a1');

    expect(venturesB).toHaveLength(0); // RLS prevents visibility
  });

  it('should prevent cross-account updates', async () => {
    const accountA = 'org_ccc';
    const accountB = 'org_ddd';

    // Setup
    await db.insert(accounts).values([
      { account_id: accountA, name: 'Account A', slug: 'account-a' },
      { account_id: accountB, name: 'Account B', slug: 'account-b' },
    ]).run();

    // Create venture by A
    await db.insert(ventures).values({
      venture_id: 'vent_x1',
      account_id: accountA,
      name: 'Secret Venture',
    }).run();

    // B tries to update A's venture
    const updated = await db
      .update(ventures)
      .set({ name: 'Hacked Venture' })
      .where(
        eq(ventures.venture_id, 'vent_x1'),
        // But if RLS is set to filter by current account (B), this should return 0 rows
      )
      .run();

    // RLS prevents the update
    expect(updated.rowCount || 0).toBe(0);
  });
});
```

### 1.5 Test de Event Schema

```typescript
import { describe, it, expect } from 'vitest';
import { ModuleEventSchema } from '@bruce/events';

describe('Event Schema', () => {
  it('should accept all valid event types', () => {
    const validTypes = [
      'opportunity.advanced',
      'venture.qualified',
      'brand_assets_generated',
      'product_spec_completed',
    ];

    for (const type of validTypes) {
      const event = {
        event_id: 'abc',
        event_type: type,
        module: 'test',
        timestamp: new Date().toISOString(),
        severity: 'info',
        payload: {},
      };

      expect(ModuleEventSchema.safeParse(event).success).toBe(true);
    }
  });

  it('should reject unknown severity', () => {
    const event = {
      event_id: 'abc',
      event_type: 'opportunity.advanced',
      module: 'opportunity',
      timestamp: new Date().toISOString(),
      severity: 'critical+',
      payload: {},
    };

    expect(ModuleEventSchema.safeParse(event).success).toBe(false);
  });
});
```

---

## 2. Integration Tests (Médio, LLM Mockado)

Integration tests começam serviços reais: PostgreSQL, Redis, Temporal.

### 2.1 Setup com Testcontainers

Arquivo: `docker-compose.test.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: bruce
      POSTGRES_PASSWORD: test
      POSTGRES_DB: bruce_test
    ports:
      - "5433:5432"

  redis:
    image: redis:7
    ports:
      - "6380:6379"

  temporal:
    image: temporalio/auto-setup:latest
    environment:
      DB: postgres
      DB_PORT: 5432
      POSTGRES_USER: bruce
      POSTGRES_PWD: test
    ports:
      - "7233:7233"
      - "7234:7234"
```

```bash
# Iniciar serviços para testes
docker-compose -f docker-compose.test.yml up -d

# Executar testes de integração
pnpm test:integration

# Limpar
docker-compose -f docker-compose.test.yml down
```

### 2.2 Test de Workflow Completa

Arquivo: `apps/opportunity/src/__tests__/opportunity-scan.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { scanOpportunityWorkflow } from '../workflows/scan-opportunity';
import { registerActivities } from '../activities';

describe('Opportunity Scan Workflow', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    // Start test Temporal environment
    testEnv = await TestWorkflowEnvironment.createLocal();
    await testEnv.start();

    // Register workflow and activities
    testEnv.registerWorkflow(scanOpportunityWorkflow);
    testEnv.registerActivities(registerActivities());
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  it('should scan opportunity and emit event', async () => {
    const input = {
      correlation_id: 'corr_test',
      account_id: 'org_test',
      venture_id: 'vent_test',
      problem_statement: 'Need to fix supply chain issues',
    };

    // Mock LLM
    vi.mock('@bruce/llm', () => ({
      callLLM: vi.fn().mockResolvedValue({
        market_size: '$10B TAM',
        validation_score: 85,
      }),
    }));

    // Execute workflow
    const result = await testEnv.client.workflow.execute(
      scanOpportunityWorkflow,
      {
        args: [input],
        taskQueue: 'opportunity',
      },
    );

    // Assertions
    expect(result).toMatchObject({
      qualification_score: 85,
      qualified: true,
      insights: expect.arrayContaining(['supply chain', 'TAM']),
    });
  });

  it('should emit opportunity.advanced event on success', async () => {
    const emitEventSpy = vi.spyOn(eventQueue, 'add');

    const input = {
      correlation_id: 'corr_test',
      account_id: 'org_test',
      venture_id: 'vent_test',
      problem_statement: 'Test',
    };

    // Execute
    await testEnv.client.workflow.execute(scanOpportunityWorkflow, {
      args: [input],
      taskQueue: 'opportunity',
    });

    // Check event was emitted
    expect(emitEventSpy).toHaveBeenCalledWith(
      expect.stringContaining('opportunity.advanced'),
      expect.objectContaining({
        event_type: 'opportunity.advanced',
      }),
    );
  });
});
```

### 2.3 Test de Inter-Module Communication

```typescript
it('should trigger add-venture when opportunity.advanced', async () => {
  // 1. Start opportunity workflow
  const oppResult = await testEnv.client.workflow.execute(
    scanOpportunityWorkflow,
    { args: [input], taskQueue: 'opportunity' },
  );

  // 2. Wait for event to be processed
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Check that add-venture workflow was started
  const workflows = await testEnv.client.workflow.list();
  const addVentureWorkflow = workflows.executions.find(
    w => w.type === 'add-venture',
  );

  expect(addVentureWorkflow).toBeDefined();
});
```

### 2.4 Test de RLS em Integration

```typescript
it('should enforce RLS across full workflow', async () => {
  // Create venture by accountA via workflow
  const accountA = 'org_a';
  const result = await testEnv.client.workflow.execute(
    addVentureWorkflow,
    {
      args: [{ account_id: accountA, venture_id: 'vent_a1', ... }],
      taskQueue: 'add-venture',
    },
  );

  // Query as accountB
  const accountB = 'org_b';
  const venturesB = await db
    .select()
    .from(ventures)
    .where(eq(ventures.account_id, accountB))
    .run();

  // Should not see ventureA
  expect(venturesB).not.toContainEqual(expect.objectContaining({
    venture_id: 'vent_a1',
  }));
});
```

---

## 3. LLM Evaluation Tests (Lento, Caro, CI Only)

Avalia qualidade dos agentes em cenários reais.

### 3.1 Estrutura de Evaluations

Cada módulo tem `evaluations/` com cenários esperados:

```
modules/opportunity/evaluations/
├── market-sizing.eval.json
├── startup-detection.eval.json
└── disqualify-low-traction.eval.json

modules/brand-aid/evaluations/
├── brand-positioning.eval.json
└── logo-brief.eval.json
```

Arquivo: `modules/opportunity/evaluations/market-sizing.eval.json`

```json
{
  "scenario_id": "opp_eval_001",
  "title": "Accurate Market Sizing",
  "description": "Given a problem statement, estimate TAM correctly",
  "input": {
    "problem_statement": "Mobile payment platform for freelancers in Southeast Asia",
    "context": "Freelance economy in SEA growing 25% YoY"
  },
  "expected_output": {
    "tam_estimate": {
      "value": 15000000000,
      "currency": "USD",
      "year": 2026,
      "confidence": "high"
    },
    "reasoning": "SEA has 200M+ freelancers, avg transaction value $50-100, 40% adoption target"
  },
  "scoring": {
    "tam_accuracy": {
      "type": "numeric_range",
      "tolerance_percent": 20,
      "weight": 0.5
    },
    "reasoning_quality": {
      "type": "semantic_similarity",
      "threshold": 0.75,
      "weight": 0.5
    }
  }
}
```

### 3.2 Evaluation Framework

Arquivo: `packages/evals/src/run-evals.ts`

```typescript
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { callLLM } from '@bruce/llm';
import { logger } from '@bruce/logger';

export interface EvaluationResult {
  scenario_id: string;
  passed: boolean;
  scores: Record<string, number>;
  actual_output: any;
  expected_output: any;
  error?: string;
}

export async function runEvaluations(
  moduleName: string,
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  const evals_dir = join(process.cwd(), `modules/${moduleName}/evaluations`);

  const evalFiles = readdirSync(evals_dir).filter(f => f.endsWith('.eval.json'));

  for (const file of evalFiles) {
    const evalPath = join(evals_dir, file);
    const scenario = JSON.parse(readFileSync(evalPath, 'utf-8'));

    logger.info(`Running evaluation: ${scenario.title}`);

    try {
      // 1. Run agent with input
      const actualOutput = await runAgent(moduleName, scenario.input);

      // 2. Score against expected output
      const scores = await scoreOutput(
        actualOutput,
        scenario.expected_output,
        scenario.scoring,
      );

      // 3. Determine pass/fail
      const passed = Object.values(scores).every(s => s >= 0.7);

      results.push({
        scenario_id: scenario.scenario_id,
        passed,
        scores,
        actual_output: actualOutput,
        expected_output: scenario.expected_output,
      });

      logger.info(`Evaluation result: ${passed ? '✅ PASS' : '❌ FAIL'}`, {
        scores,
      });
    } catch (error) {
      results.push({
        scenario_id: scenario.scenario_id,
        passed: false,
        scores: {},
        actual_output: null,
        expected_output: scenario.expected_output,
        error: (error as Error).message,
      });

      logger.error(`Evaluation failed with error`, { error });
    }
  }

  return results;
}

async function runAgent(moduleName: string, input: object): Promise<any> {
  // Dynamically load agent for module
  const agent = require(`apps/${moduleName}/src/agents`);
  return await agent.execute(input);
}

async function scoreOutput(
  actual: any,
  expected: any,
  scoring: Record<string, any>,
): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};

  for (const [field, metric] of Object.entries(scoring)) {
    const config = metric as any;

    if (config.type === 'numeric_range') {
      // Score numeric fields with tolerance
      const expectedVal = expected[field]?.value || expected[field];
      const actualVal = actual[field]?.value || actual[field];
      const tolerance = expectedVal * (config.tolerance_percent / 100);

      const diff = Math.abs(actualVal - expectedVal);
      const score = diff <= tolerance ? 1.0 : 0.5;

      scores[field] = score;
    } else if (config.type === 'semantic_similarity') {
      // Score text similarity
      const similarity = await computeSemanticSimilarity(
        actual[field],
        expected[field],
      );

      scores[field] = similarity >= config.threshold ? 1.0 : similarity;
    } else if (config.type === 'exact_match') {
      // Exact string match
      scores[field] = actual[field] === expected[field] ? 1.0 : 0.0;
    }
  }

  return scores;
}

async function computeSemanticSimilarity(
  text1: string,
  text2: string,
): Promise<number> {
  // Use embedding model to compute similarity
  const embedding1 = await callLLM('embed', { text: text1 });
  const embedding2 = await callLLM('embed', { text: text2 });

  // Cosine similarity
  return cosineSimilarity(embedding1.vector, embedding2.vector);
}
```

### 3.3 CLI para Rodar Evals

```bash
# Executar todas as evals de um módulo
pnpm evals opportunity

# Executar eval específica
pnpm evals opportunity --scenario market-sizing

# Gerar relatório
pnpm evals opportunity --report

# Comparar com baseline
pnpm evals opportunity --compare baseline-2026-04-01.json
```

### 3.4 Report de Evals

```typescript
export function generateReport(results: EvaluationResult[]) {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const passRate = (passed / total) * 100;

  console.log(`
📊 Evaluation Report
═══════════════════════════════════

Total: ${total}
Passed: ${passed}/${total}
Pass Rate: ${passRate.toFixed(1)}%

${results
  .map(r => {
    const status = r.passed ? '✅' : '❌';
    return `${status} ${r.scenario_id}: ${Object.values(r.scores)
      .map(s => (s * 100).toFixed(0))
      .join('%, ')}%`;
  })
  .join('\n')}

Time: ${new Date().toISOString()}
  `);
}
```

---

## 4. CI/CD Integration

### 4.1 GitHub Actions

Arquivo: `.github/workflows/test.yml`

```yaml
name: Test & Eval

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:unit
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: bruce
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://bruce:test@postgres:5432/bruce_test
          REDIS_URL: redis://redis:6379

  evals:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm evals opportunity --report
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - run: pnpm evals brand-aid --report
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: evaluation-reports
          path: dist/eval-reports/

  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v3
```

### 4.2 Coverage Goals

```json
{
  "coverage": {
    "branches": 70,
    "functions": 75,
    "lines": 75,
    "statements": 75
  }
}
```

---

## 5. Testes Prioritários (MVP)

Para launch rápido, focar nesses primeiro:

### 5.1 Opportunity Module (Crítico)

```typescript
// ✅ MUST HAVE
- Input/output schema validation
- Plan limit enforcement
- RLS isolation
- Event emission (opportunity.advanced)
- Integration: workflow completa sem erro

// ⚠️ NICE TO HAVE
- Agent evaluation (market sizing accuracy)
- DLQ retry handling
```

### 5.2 Add-Venture Module

```typescript
// ✅ MUST HAVE
- Recebe opportunity.advanced event
- Cria venture record
- Schema validation
- RLS

// ⚠️ NICE TO HAVE
- Evals de hypothesis quality
```

### 5.3 Bruce-Core

```typescript
// ✅ MUST HAVE
- Clerk webhook criação de account
- JWT validation
- Plan limits enforced
- RLS

// ⚠️ NICE TO HAVE
- Stripe webhook (se monetizando)
```

---

## Checklist de Implementação

**Unit Tests:**
- [ ] Vitest configurado
- [ ] Schema validation tests
- [ ] Plan limits tests
- [ ] RLS tests
- [ ] Event schema tests
- [ ] Coverage > 70%

**Integration Tests:**
- [ ] docker-compose.test.yml criado
- [ ] Workflow execution tests
- [ ] Inter-module event tests
- [ ] Full RLS scenario tests
- [ ] Temporal visibility tests

**LLM Evaluations:**
- [ ] Evaluation scenarios criados para opportunity
- [ ] Evaluation framework implementado
- [ ] Scoring logic (numeric, semantic, exact match)
- [ ] CLI commands funcionando
- [ ] Report generation

**CI/CD:**
- [ ] GitHub Actions workflow configurado
- [ ] Unit tests rodam em PR
- [ ] Integration tests rodam em main
- [ ] LLM evals rodam em main (com API key segura)
- [ ] Coverage report uploadado para Codecov
- [ ] Artifact evaluation reports salvos

---

## Pronto para Produção?

✅ **Sim**, quando:
- `pnpm test` executa unit + integration em < 2 minutos
- Coverage é > 70%
- Evaluation pass rate > 90% em modules críticos
- GitHub Actions passa em todo commit
- Nenhum evento vai para DLQ durante testes
- RLS isolamento validado em testes
- Todos os módulos têm ≥ 1 evaluation scenario
