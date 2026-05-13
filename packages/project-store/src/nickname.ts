import dockerNames from 'docker-names';

/**
 * Generate a base nickname `<adjective>_<noun>` from `docker-names`.
 * Example: `romantic_williamson`. Collisions are handled by `ensureUnique`,
 * which appends an unbounded `_N` numeric suffix.
 */
export function generateBaseNickname(): string {
  return dockerNames.getRandomName();
}
