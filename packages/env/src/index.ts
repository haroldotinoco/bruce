import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

let didLoad = false;

/**
 * Walk up from this package's location until we find `pnpm-workspace.yaml` (monorepo root).
 * Does not rely on `process.cwd()`, so it works when `pnpm --filter ... run worker` runs from `apps/*`.
 */
function findMonorepoRoot(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 12; i++) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return process.cwd();
}

/**
 * Load `.env` then `.env.local` from the repository root into `process.env`.
 * - Does not override variables already set in the environment (shell/CI wins).
 * - `.env.local` overrides `.env` for keys that appear in `.env.local`.
 * Safe to call multiple times (no-op after the first call in the same process).
 */
export function loadRepoEnv(): void {
  if (didLoad) {
    return;
  }
  didLoad = true;

  const root = findMonorepoRoot();
  const envPath = path.join(root, '.env');
  const localPath = path.join(root, '.env.local');

  if (existsSync(envPath)) {
    config({ path: envPath });
  }
  if (existsSync(localPath)) {
    config({ path: localPath, override: true });
  }
}
