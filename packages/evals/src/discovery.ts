import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface ModuleEvalInventory {
  module_name: string;
  agent_count: number;
  eval_count: number;
  eval_files: string[];
  has_evaluations_dir: boolean;
  coverage_level: 'none' | 'partial' | 'covered';
}

export function listEvaluationModules(repoRoot: string): string[] {
  const modulesDir = join(repoRoot, 'modules');
  if (!existsSync(modulesDir)) return [];

  return readdirSync(modulesDir)
    .filter((entry) => statSync(join(modulesDir, entry)).isDirectory())
    .filter((moduleName) => getEvalFiles(repoRoot, moduleName).length > 0)
    .sort();
}

export function buildEvalInventory(repoRoot: string): ModuleEvalInventory[] {
  const modulesDir = join(repoRoot, 'modules');
  if (!existsSync(modulesDir)) return [];

  return readdirSync(modulesDir)
    .filter((entry) => statSync(join(modulesDir, entry)).isDirectory())
    .sort()
    .flatMap((moduleName) => {
      const agentsDir = join(modulesDir, moduleName, 'agents');
      const agentCount = existsSync(agentsDir)
        ? readdirSync(agentsDir).filter((entry) => statSync(join(agentsDir, entry)).isDirectory())
            .length
        : 0;
      const evalFiles = getEvalFiles(repoRoot, moduleName);
      const hasEvaluationsDir = existsSync(join(modulesDir, moduleName, 'evaluations'));
      if (agentCount === 0 && !hasEvaluationsDir) return [];
      return [{
        module_name: moduleName,
        agent_count: agentCount,
        eval_count: evalFiles.length,
        eval_files: evalFiles,
        has_evaluations_dir: hasEvaluationsDir,
        coverage_level:
          evalFiles.length === 0 ? 'none' : evalFiles.length >= agentCount ? 'covered' : 'partial',
      }];
    });
}

export function getEvalFiles(repoRoot: string, moduleName: string): string[] {
  const evalDir = join(repoRoot, 'modules', moduleName, 'evaluations');
  if (!existsSync(evalDir)) return [];
  return readdirSync(evalDir)
    .filter((entry) => entry.endsWith('.eval.json'))
    .sort();
}
