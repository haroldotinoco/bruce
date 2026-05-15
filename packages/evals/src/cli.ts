import { generateReport } from './report.js';
import { buildEvalInventory, listEvaluationModules } from './discovery.js';
import { runAllEvaluations, runEvaluations } from './run-evals.js';

const args = process.argv.slice(2);
const wantReport = args.includes('--report');
const wantList = args.includes('--list');
const wantCoverage = args.includes('--coverage');
const scenarioArg = args.find((a) => a.startsWith('--scenario='));
const scenarioFilter = scenarioArg?.split('=')[1];
const positional = args.filter((a) => !a.startsWith('-'));

const repoRoot = new URL('../../..', import.meta.url).pathname;
if (wantList) {
  console.log(JSON.stringify(listEvaluationModules(repoRoot), null, 2));
  process.exit(0);
}

if (wantCoverage) {
  console.log(JSON.stringify(buildEvalInventory(repoRoot), null, 2));
  process.exit(0);
}

const moduleName = positional[0];
if (!moduleName) {
  console.error('Usage: pnpm evals <module|all> [--report] [--scenario=name] [--list] [--coverage]');
  process.exit(1);
}

const results =
  moduleName === 'all'
    ? await runAllEvaluations({ scenarioFilter })
    : await runEvaluations(moduleName, { scenarioFilter });
if (wantReport) {
  console.log(generateReport(results));
} else {
  console.log(JSON.stringify(results, null, 2));
}

const failed = results.filter((r) => !r.passed).length;
process.exit(failed > 0 ? 1 : 0);
