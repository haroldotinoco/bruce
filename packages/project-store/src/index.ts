import { logger } from '@bruce/logger';
import { initProjectFolder, projectPath } from './fs.js';
import { generateBaseNickname } from './nickname.js';
import { ensureUnique, type NicknameLookup } from './uniqueness.js';

export { generateBaseNickname } from './nickname.js';
export { ensureUnique, type NicknameLookup } from './uniqueness.js';
export {
  deliverableExists,
  deliverablePath,
  initProjectFolder,
  projectPath,
  projectsRoot,
  readDeliverable,
  removeProjectSubdirs,
  resolveRepoRoot,
  writeDeliverable,
  writeProjectKnowledgeDoc,
  type ProjectMeta,
} from './fs.js';

export interface CreateProjectParams {
  accountId: string;
  ventureId?: string;
  title?: string;
  /** Return all nicknames for this account that match `LIKE '<prefix>%'`. */
  lookup: NicknameLookup;
  /**
   * Called with the resolved unique nickname before the folder is created on
   * disk. Callers should INSERT into their durable store (e.g.
   * `platform.projects`) and throw if the write fails. The unique constraint on
   * the DB is the source of truth — if two concurrent workers both resolve the
   * same nickname, this callback will reject on the second and we will retry
   * with a fresh base nickname.
   */
  persist?: (nickname: string) => Promise<void>;
}

export interface CreateProjectResult {
  nickname: string;
  path: string;
}

const MAX_PERSIST_ATTEMPTS = 5;

/**
 * Generate a unique project nickname, persist it (optional callback), then
 * materialize `.projects/<nickname>/meta.json` on disk. On persist failures
 * (e.g. a unique-constraint race) we regenerate the base and retry up to
 * `MAX_PERSIST_ATTEMPTS` times before giving up.
 */
export async function createProject(
  params: CreateProjectParams,
): Promise<CreateProjectResult> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_PERSIST_ATTEMPTS; attempt++) {
    const base = generateBaseNickname();
    const nickname = await ensureUnique(base, params.lookup);
    try {
      if (params.persist) {
        await params.persist(nickname);
      }
    } catch (err) {
      lastError = err;
      logger.warn(
        { err, nickname, attempt, maxAttempts: MAX_PERSIST_ATTEMPTS },
        'Project persist failed (likely nickname race); retrying with new base',
      );
      continue;
    }
    const path = await initProjectFolder({
      nickname,
      account_id: params.accountId,
      venture_id: params.ventureId,
      title: params.title,
      created_at: new Date().toISOString(),
    });
    logger.info(
      {
        nickname,
        base,
        accountId: params.accountId,
        ventureId: params.ventureId,
        path,
      },
      'Project folder created',
    );
    return { nickname, path: projectPath(nickname) };
  }
  throw new Error(
    `createProject: exhausted ${MAX_PERSIST_ATTEMPTS} attempts to persist a unique nickname: ${String(lastError)}`,
  );
}
