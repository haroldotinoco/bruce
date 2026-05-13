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

async function walkCapabilities(moduleId) {
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
      results.push({
        id,
        module: moduleId,
        name: cap.name || entry.name,
        label: cap.label || toTitleCase(cap.name || entry.name),
        description: cap.description || cap.summary || '',
        capabilities: Array.isArray(cap.capabilities)
          ? cap.capabilities
          : Array.isArray(cap.skills)
            ? cap.skills
            : [],
        inputs: Array.isArray(cap.inputs) ? cap.inputs : cap.input_schema ? Object.keys(cap.input_schema.properties || {}) : undefined,
        outputs: Array.isArray(cap.outputs) ? cap.outputs : cap.output_schema ? Object.keys(cap.output_schema.properties || {}) : undefined,
        model: cap.model || cap.default_model,
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
  for (const mod of MODULE_IDS) {
    const list = await walkCapabilities(mod);
    agents.push(...list);
  }
  agents.sort((a, b) => (a.module + a.name).localeCompare(b.module + b.name));
  await writeFile(join(OUT_DIR, 'agents.json'), JSON.stringify(agents, null, 2));

  const modules = MODULE_IDS.map((id) => ({
    id,
    agents_count: agents.filter((a) => a.module === id).length,
  }));
  await writeFile(join(OUT_DIR, 'modules.json'), JSON.stringify(modules, null, 2));

  console.log(`[build-manifests] wrote ${agents.length} agents across ${modules.length} modules`);
}

main().catch((err) => {
  console.error('[build-manifests] failed:', err);
  process.exitCode = 1;
});
