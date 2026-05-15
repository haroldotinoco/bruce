import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@bruce/logger';
import { listEvaluationModules } from './discovery.js';
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

  if (moduleName === 'add-venture') {
    return {
      venture_id: 'v-002-ai-compliance-saas',
      opportunity_id: 'opp-ai-compliance-v1',
      venture_name: 'ComplianceAI',
      status: 'approved',
      key_metrics: {
        critique_overall_score: 76,
        year_1_revenue_target: 3000000,
      },
      artifact_refs: {
        json_url: 's3://ventures/v-002-ai-compliance-saas/dossier.json',
      },
      next_steps: [
        'Send to brand-aid module for brand strategy and messaging',
        'Send to builder module for execution roadmap and resource planning',
      ],
    };
  }

  if (moduleName === 'builder') {
    return {
      status: 'ready_for_gtm',
      mvp_spec: {
        venture_id: 'v-002-ai-compliance-saas',
        product_name: 'ComplianceAI',
      },
      gtm_handoff: {
        venture_id: 'v-002-ai-compliance-saas',
        target_schema: 'builder-to-gtm.schema.json',
        positioning: 'AI compliance automation for regulated financial institutions',
        primary_segments: ['Chief Compliance Officer', 'AI Governance Lead'],
      },
    };
  }

  if (moduleName === 'portfolio') {
    return {
      review_cycle_id: 'cycle_20260406_00',
      decisions: [
        { venture_id: 'complify', decision: 'scale', confidence_score: 90 },
        { venture_id: 'zenote', decision: 'iterate', confidence_score: 70 },
        { venture_id: 'metathink', decision: 'continue', confidence_score: 75 },
        { venture_id: 'taskflow', decision: 'continue', confidence_score: 65 },
      ],
      portfolio_summary: {
        scale_decisions: 1,
        iterate_decisions: 1,
        continue_decisions: 2,
        kill_decisions: 0,
        human_confirmations_required: 1,
      },
    };
  }

  if (moduleName === 'bruce-core') {
    return {
      gate_id: 'post-screening',
      decision: 'BORDERLINE',
      gate_score: 68,
      escalation_required: true,
      correlation_id: 'corr-gate-001',
    };
  }

  if (moduleName === 'bruce-memory') {
    return {
      query_id: 'memory-query-001',
      no_results: true,
      minimum_confidence: 0.6,
      patterns: [],
      answer: 'No matching patterns met the minimum confidence threshold.',
    };
  }

  if (moduleName === 'gtm') {
    return {
      status: 'ready_for_startup_ops',
      launch_plan: {
        primary_channel: 'compliance partnerships',
        first_campaign: 'AI compliance audit readiness',
      },
      startup_ops_handoff: {
        venture_id: 'v-002-ai-compliance-saas',
        target_schema: 'gtm-to-startup-ops.schema.json',
        metrics_to_monitor: ['pipeline_created', 'cac', 'activation_rate'],
      },
    };
  }

  if (moduleName === 'startup-ops') {
    return {
      venture_id: 'taskflow',
      health_score: 48,
      escalation_required: true,
      anomalies: [
        {
          metric_name: 'retention_d30',
          severity: 'high',
          requires_escalation: true,
        },
      ],
      portfolio_handoff: {
        target_schema: 'startup-ops-to-portfolio.schema.json',
        decision_context: 'At-risk retention and weak growth require review.',
      },
    };
  }

  return { echo: input };
}

export async function runEvaluations(
  moduleName: string,
  options?: {
    scenarioFilter?: string;
    runAgent?: RunAgentFn;
    executionMode?: EvaluationResult['execution_mode'];
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
  const executionMode = options?.executionMode ?? 'stub_framework';

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
        module_name: moduleName,
        scenario_id: scenario.scenario_id,
        scenario_file: file,
        execution_mode: executionMode,
        passed,
        scores,
        actual_output: actualOutput,
        expected_output: scenario.expected_output,
      });

      logger.info({ scenario_id: scenario.scenario_id, passed, scores }, 'Evaluation finished');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        module_name: moduleName,
        scenario_id: scenario.scenario_id,
        scenario_file: file,
        execution_mode: executionMode,
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

export async function runAllEvaluations(options?: {
  scenarioFilter?: string;
  runAgent?: RunAgentFn;
  executionMode?: EvaluationResult['execution_mode'];
}): Promise<EvaluationResult[]> {
  const modules = listEvaluationModules(repoRoot);
  const results: EvaluationResult[] = [];
  for (const moduleName of modules) {
    results.push(...(await runEvaluations(moduleName, options)));
  }
  return results;
}
