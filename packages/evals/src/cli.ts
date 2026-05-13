import { generateReport } from './report.js';
import { runEvaluations } from './run-evals.js';

const args = process.argv.slice(2);
const wantReport = args.includes('--report');
const scenarioArg = args.find((a) => a.startsWith('--scenario='));
const scenarioFilter = scenarioArg?.split('=')[1];
const positional = args.filter((a) => !a.startsWith('-'));

const moduleName = positional[0];
if (!moduleName) {
  console.error('Usage: pnpm evals <module> [--report] [--scenario=name]');
  process.exit(1);
}

const results = await runEvaluations(moduleName, { scenarioFilter });
if (wantReport) {
  console.log(generateReport(results));
} else {
  console.log(JSON.stringify(results, null, 2));
}

const failed = results.filter((r) => !r.passed).length;
process.exit(failed > 0 ? 1 : 0);
