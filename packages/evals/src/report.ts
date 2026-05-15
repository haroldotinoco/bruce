import type { EvaluationResult } from './types.js';

export function generateReport(results: EvaluationResult[]): string {
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const passRate = total === 0 ? 0 : (passed / total) * 100;
  const modes = [...new Set(results.map((r) => r.execution_mode))].join(', ') || 'none';

  const lines = results.map((r) => {
    const status = r.passed ? 'PASS' : 'FAIL';
    const scoreStr = Object.entries(r.scores)
      .map(([k, v]) => `${k}=${(v * 100).toFixed(0)}%`)
      .join(', ');
    return `${status} ${r.module_name}/${r.scenario_id}${scoreStr ? ` — ${scoreStr}` : ''}${r.error ? ` (${r.error})` : ''}`;
  });

  return `
Evaluation report
=================
Total: ${total}
Passed: ${passed}/${total}
Pass rate: ${passRate.toFixed(1)}%
Execution mode: ${modes}

${lines.join('\n')}

Time: ${new Date().toISOString()}
`.trim();
}
