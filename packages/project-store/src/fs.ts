import { existsSync, promises as fsp } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

const PROJECTS_DIR = '.projects';

function safeSegment(value: string, label: string): string {
  if (!value || value.includes('..') || value.includes(sep) || value.includes('/')) {
    throw new Error(`Invalid ${label}: '${value}'`);
  }
  return value;
}

let cachedRepoRoot: string | null = null;

/**
 * Walk up from cwd looking for `pnpm-workspace.yaml`. Cached so repeated
 * writes in the same process don't re-scan.
 */
export function resolveRepoRoot(): string {
  if (cachedRepoRoot) return cachedRepoRoot;
  let dir = resolve(process.cwd());
  const root = resolve(dir, '/');
  while (dir !== root) {
    if (
      existsSync(join(dir, 'pnpm-workspace.yaml')) ||
      existsSync(join(dir, 'pnpm-workspace.yml'))
    ) {
      cachedRepoRoot = dir;
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: env override or current cwd (tests can set BRUCE_REPO_ROOT).
  const envRoot = process.env.BRUCE_REPO_ROOT;
  cachedRepoRoot = envRoot ? resolve(envRoot) : resolve(process.cwd());
  return cachedRepoRoot;
}

export function projectsRoot(): string {
  return join(resolveRepoRoot(), PROJECTS_DIR);
}

export function projectPath(nickname: string): string {
  return join(projectsRoot(), safeSegment(nickname, 'nickname'));
}

export function deliverablePath(
  nickname: string,
  module: string,
  agent: string,
  filename: string,
): string {
  return join(
    projectPath(nickname),
    safeSegment(module, 'module'),
    safeSegment(agent, 'agent'),
    safeSegment(filename, 'filename'),
  );
}

export interface ProjectMeta {
  nickname: string;
  account_id: string;
  venture_id?: string;
  title?: string;
  created_at: string;
}

export async function initProjectFolder(meta: ProjectMeta): Promise<string> {
  const dir = projectPath(meta.nickname);
  await fsp.mkdir(dir, { recursive: true });
  const metaPath = join(dir, 'meta.json');
  if (!existsSync(metaPath)) {
    await writeFileAtomic(metaPath, JSON.stringify(meta, null, 2));
  }
  return dir;
}

/**
 * Atomic write: write to a tmp file in the same dir, then rename. Prevents
 * half-written files if the worker crashes mid-write.
 */
async function writeFileAtomic(target: string, contents: string): Promise<void> {
  const dir = dirname(target);
  await fsp.mkdir(dir, { recursive: true });
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fsp.writeFile(tmp, contents, 'utf8');
  await fsp.rename(tmp, target);
}

const KNOWLEDGE_DOC_ALLOWLIST = new Set([
  'OPPORTUNITY_SCAN_SUMMARY.md',
  'OPPORTUNITY_HANDOFF.md',
  'VENTURE_DOSSIER_SUMMARY.md',
  'STRUCTURING_INSIGHTS.md',
]);

/**
 * Writes markdown knowledge-base files at `.projects/<nickname>/<filename>`.
 * Filenames are allowlisted to avoid path traversal or arbitrary writes.
 */
export async function writeProjectKnowledgeDoc(
  nickname: string,
  filename: string,
  markdown: string,
): Promise<string> {
  if (!KNOWLEDGE_DOC_ALLOWLIST.has(filename)) {
    throw new Error(`Disallowed knowledge doc filename: ${filename}`);
  }
  const dir = projectPath(nickname);
  await fsp.mkdir(dir, { recursive: true });
  const target = join(dir, filename);
  await writeFileAtomic(target, markdown);
  return target;
}

export async function writeDeliverable(
  nickname: string,
  module: string,
  agent: string,
  filename: string,
  contents: unknown,
): Promise<string> {
  const target = deliverablePath(nickname, module, agent, filename);
  const body =
    typeof contents === 'string' ? contents : JSON.stringify(contents, null, 2);
  await writeFileAtomic(target, body);
  return target;
}

export async function readDeliverable(
  nickname: string,
  module: string,
  agent: string,
  filename: string,
): Promise<unknown | null> {
  const target = deliverablePath(nickname, module, agent, filename);
  try {
    const body = await fsp.readFile(target, 'utf8');
    if (filename.endsWith('.json')) {
      return JSON.parse(body);
    }
    return body;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}

export function deliverableExists(
  nickname: string,
  module: string,
  agent: string,
  filename: string,
): boolean {
  return existsSync(deliverablePath(nickname, module, agent, filename));
}

/**
 * Remove top-level module folders under `.projects/<nickname>/` (e.g. `add-venture`).
 * Safe segments only; missing dirs are ignored (`force: true`).
 */
export async function removeProjectSubdirs(nickname: string, moduleDirs: string[]): Promise<void> {
  const root = projectPath(nickname);
  for (const mod of moduleDirs) {
    safeSegment(mod, 'module');
    const dir = join(root, mod);
    await fsp.rm(dir, { recursive: true, force: true });
  }
}
