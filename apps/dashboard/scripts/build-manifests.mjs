#!/usr/bin/env node
/* eslint-disable no-console */
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APP_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(APP_ROOT, '..', '..');
const MODULES_ROOT = join(REPO_ROOT, 'modules');
const OUT_DIR = join(APP_ROOT, 'src', 'assets', 'manifests');

const MODULE_IDS = [
  'bruce-core',
  'opportunity',
  'add-venture',
  'brand-aid',
  'builder',
  'gtm',
  'startup-ops',
  'portfolio',
  'bruce-memory',
];

const RUNTIME_READINESS = {
  'bruce-core': readiness('partial', 'mock', 'Backend and workers exist, but dashboard content is still mock-backed.'),
  opportunity: readiness('live', 'real', 'Primary dashboard flow can use the live service when a token is configured.', {
    event_worker: 'partial',
  }),
  'add-venture': readiness('live', 'real', 'Primary dashboard flow can use the live service when a token is configured.', {
    event_worker: 'ready',
  }),
  'brand-aid': readiness('live', 'real', 'Primary dashboard flow can use the live service when a token is configured.',{
    event_worker: 'ready',
  }),
  builder: readiness('mock', 'mock', 'Visible in navigation, but dashboard content is mock-backed.'),
  gtm: readiness('mock', 'mock', 'Visible in navigation, but dashboard content is mock-backed.'),
  'startup-ops': readiness('mock', 'mock', 'Visible in navigation, but dashboard content is mock-backed.'),
  portfolio: readiness('mock', 'mock', 'Visible in navigation, but dashboard content is mock-backed.'),
  'bruce-memory': readiness('mock', 'mock', 'Visible in navigation, but dashboard content is mock-backed.'),
};

function readiness(state, dashboardDataSource, summary, overrides = {}) {
  const mockBacked = dashboardDataSource === 'mock';
  return {
    state,
    navigation: 'ready',
    http_health: 'ready',
    workflow_routes: state === 'live' ? 'ready' : state === 'partial' ? 'ready' : 'partial',
    temporal_worker: state === 'live' || state === 'partial' ? 'ready' : 'partial',
    event_worker: state === 'partial' ? 'ready' : 'partial',
    dashboard_data_source: dashboardDataSource,
    manifest_completeness: 'partial',
    summary: mockBacked ? summary : `${summary} Token and health still determine active live mode at runtime.`,
    ...overrides,
  };
}

async function readEvalCoverage(moduleId) {
  const evalsDir = join(MODULES_ROOT, moduleId, 'evaluations');
  const scenarios = [];
  const agentCounts = new Map();
  if (!existsSync(evalsDir)) return { scenarios, agentCounts };
  let entries;
  try {
    entries = await readdir(evalsDir, { withFileTypes: true });
  } catch {
    return { scenarios, agentCounts };
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.eval.json')) continue;
    const evalPath = join(evalsDir, entry.name);
    try {
      const scenario = JSON.parse(await readFile(evalPath, 'utf8'));
      const id = String(scenario.scenario_id || entry.name.replace(/\.eval\.json$/, ''));
      const agentId = typeof scenario.agent_id === 'string' ? scenario.agent_id : null;
      scenarios.push({
        id,
        title: scenario.title || toTitleCase(id),
        agent_id: agentId,
        path: `modules/${moduleId}/evaluations/${entry.name}`,
      });
      if (agentId) agentCounts.set(agentId, (agentCounts.get(agentId) || 0) + 1);
    } catch (err) {
      console.warn(`[build-manifests] skipped ${evalPath}: ${err?.message ?? err}`);
    }
  }

  return { scenarios, agentCounts };
}

async function walkCapabilities(moduleId, evalCoverage) {
  const results = [];
  const agentsDir = join(MODULES_ROOT, moduleId, 'agents');
  if (!existsSync(agentsDir)) return results;
  let entries;
  try {
    entries = await readdir(agentsDir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const capPath = join(agentsDir, entry.name, 'capabilities.json');
    if (!existsSync(capPath)) continue;
    try {
      const txt = await readFile(capPath, 'utf8');
      const cap = JSON.parse(txt);
      const id = `${moduleId}/${cap.name || entry.name}`;
      const name = cap.name || entry.name;
      const scenarioCount = evalCoverage.agentCounts.get(name) || 0;
      results.push({
        id,
        module: moduleId,
        name,
        label: cap.label || toTitleCase(name),
        description: cap.description || cap.summary || '',
        capabilities: Array.isArray(cap.capabilities)
          ? cap.capabilities
          : Array.isArray(cap.skills)
            ? cap.skills
            : [],
        inputs: Array.isArray(cap.inputs) ? cap.inputs : cap.input_schema ? Object.keys(cap.input_schema.properties || {}) : undefined,
        outputs: Array.isArray(cap.outputs) ? cap.outputs : cap.output_schema ? Object.keys(cap.output_schema.properties || {}) : undefined,
        model: cap.model || cap.default_model,
        evaluation: {
          covered: scenarioCount > 0,
          scenario_count: scenarioCount,
        },
        runtime_readiness: {
          ...RUNTIME_READINESS[moduleId],
          eval_coverage: scenarioCount > 0 ? 'covered' : 'none',
        },
      });
    } catch (err) {
      console.warn(`[build-manifests] skipped ${capPath}: ${err?.message ?? err}`);
    }
  }
  return results;
}

function toTitleCase(s) {
  return String(s)
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const agents = [];
  const moduleEvalCoverage = new Map();
  for (const mod of MODULE_IDS) {
    const coverage = await readEvalCoverage(mod);
    moduleEvalCoverage.set(mod, coverage);
    const list = await walkCapabilities(mod, coverage);
    agents.push(...list);
  }
  agents.sort((a, b) => (a.module + a.name).localeCompare(b.module + b.name));
  await writeFile(join(OUT_DIR, 'agents.json'), JSON.stringify(agents, null, 2));

  const modules = MODULE_IDS.map((id) => {
    const moduleAgents = agents.filter((a) => a.module === id);
    const coverage = moduleEvalCoverage.get(id) || { scenarios: [] };
    const coverageLevel = evalCoverageLevel(moduleAgents, coverage.scenarios.length);
    return {
      id,
      agents_count: moduleAgents.length,
      evaluation: {
        scenario_count: coverage.scenarios.length,
        covered_agent_count: moduleAgents.filter((a) => a.evaluation.covered).length,
        coverage_level: coverageLevel,
        scenarios: coverage.scenarios,
      },
      runtime_readiness: {
        ...RUNTIME_READINESS[id],
        eval_coverage: coverageLevel,
      },
    };
  });
  await writeFile(join(OUT_DIR, 'modules.json'), JSON.stringify(modules, null, 2));

  console.log(`[build-manifests] wrote ${agents.length} agents across ${modules.length} modules`);
}

function evalCoverageLevel(moduleAgents, scenarioCount) {
  if (scenarioCount === 0) return 'none';
  if (moduleAgents.length > 0 && moduleAgents.every((a) => a.evaluation.covered)) return 'covered';
  return 'partial';
}

main().catch((err) => {
  console.error('[build-manifests] failed:', err);
  process.exitCode = 1;
});
