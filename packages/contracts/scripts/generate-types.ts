import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { compile } from 'json-schema-to-typescript';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');
const repoRoot = join(packageRoot, '../..');
const modulesDir = join(repoRoot, 'modules');
const outRoot = join(packageRoot, 'src/generated');

function pathToInterfaceName(rel: string): string {
  const base = rel.replace(/\.schema\.json$/i, '');
  const parts = base.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const pascal = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return (pascal || 'Generated') + 'Json';
}

async function findSchemas(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await findSchemas(full, acc);
    else if (e.name.endsWith('.schema.json')) {
      const rel = relative(modulesDir, full).replace(/\\/g, '/');
      if (/\/agents\/[^/]+\/(?:input|output)\.schema\.json$/.test(rel)) {
        continue;
      }
      acc.push(full);
    }
  }
  return acc;
}

async function main(): Promise<void> {
  const schemas = await findSchemas(modulesDir);
  await mkdir(outRoot, { recursive: true });

  let ok = 0;
  for (const abs of schemas) {
    const relFromModules = relative(modulesDir, abs).replace(/\\/g, '/');
    const outRel = relFromModules.replace(/\.schema\.json$/i, '.ts');
    const outPath = join(outRoot, outRel);
    await mkdir(dirname(outPath), { recursive: true });

    try {
      const raw = await readFile(abs, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.warn(`[generate-types] skip ${relFromModules}: root must be a JSON Schema object`);
        continue;
      }
      const schema = parsed as Record<string, unknown>;
      const interfaceName = pathToInterfaceName(relFromModules);
      let ts = await compile(schema as never, interfaceName, {
        bannerComment: `/* eslint-disable */\n/* auto-generated from modules/${relFromModules} */`,
        unknownAny: true,
      });
      const body = ts.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (body.length === 0) {
        ts = `/* eslint-disable */\n/* auto-generated from modules/${relFromModules} (empty schema) */\nexport {};\n`;
      }
      await writeFile(outPath, ts, 'utf8');
      ok += 1;
    } catch (err) {
      console.warn(`[generate-types] skip ${relFromModules}:`, err);
    }
  }

  console.log(`[generate-types] wrote ${ok}/${schemas.length} schema files → ${outRoot}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
