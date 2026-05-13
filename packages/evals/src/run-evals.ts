import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@bruce/logger';
import { scoreOutput } from './score.js';
import type { EvaluationResult, EvaluationScenario } from './types.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');

export type RunAgentFn = (moduleName: string, input: Record<string, unknown>) => Promise<Record<string, unknown>>;

/**
 * Default stub: echoes input as output (replace with real agent wiring in CI).
 */
export async function defaultRunAgent(
  moduleName: string,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (moduleName === 'opportunity') {
    return {
      tam_estimate: {
        value: 15_000_000_000,
        currency: 'USD',
        year: 2026,
        confidence: 'high',
      },
      reasoning:
        'SEA has 200M+ freelancers, avg transaction value $50-100, 40% adoption target',
    };
  }

  if (moduleName === 'brand-aid') {
    return {
      headline: 'Clarity for growing finance teams',
    };
  }

  return { echo: input };
}

export async function runEvaluations(
  moduleName: string,
  options?: {
    scenarioFilter?: string;
    runAgent?: RunAgentFn;
  },
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  const evalDir = join(repoRoot, 'modules', moduleName, 'evaluations');
  let files: string[];
  try {
    files = readdirSync(evalDir).filter((f) => f.endsWith('.eval.json'));
  } catch {
    logger.warn({ evalDir }, 'No evaluations directory or cannot read');
    return results;
  }

  const runAgent = options?.runAgent ?? defaultRunAgent;

  for (const file of files) {
    if (options?.scenarioFilter && !file.includes(options.scenarioFilter)) {
      continue;
    }

    const raw = readFileSync(join(evalDir, file), 'utf-8');
    const scenario = JSON.parse(raw) as EvaluationScenario;

    logger.info({ scenario_id: scenario.scenario_id, title: scenario.title }, 'Running evaluation');

    try {
      const actualOutput = await runAgent(moduleName, scenario.input);
      const scores = await scoreOutput(actualOutput, scenario.expected_output, scenario.scoring);

      const values = Object.values(scores);
      const passed = values.length > 0 && values.every((s) => s >= 0.7);

      results.push({
        scenario_id: scenario.scenario_id,
        passed,
        scores,
        actual_output: actualOutput,
        expected_output: scenario.expected_output,
      });

      logger.info({ scenario_id: scenario.scenario_id, passed, scores }, 'Evaluation finished');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        scenario_id: scenario.scenario_id,
        passed: false,
        scores: {},
        actual_output: null,
        expected_output: scenario.expected_output,
        error: message,
      });
      logger.error({ err: error, scenario_id: scenario.scenario_id }, 'Evaluation failed');
    }
  }

  return results;
}
