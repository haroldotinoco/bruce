import { Injectable } from '@angular/core';
import { Observable, interval, map, startWith, BehaviorSubject } from 'rxjs';
import type { TemporalRun, RunStep } from '../../core/models';
import type { IRunsDataSource } from '../../core/data-sources/tokens';
import type { ModuleId } from '../../core/config/env.types';
import { seededRandom, pick, withLatency } from '../latency';
import { MODULE_REGISTRY } from '../../core/config/module-registry';

const WF_TYPES = [
  'opportunityScreeningWorkflow',
  'weeklyDiscoveryWorkflow',
  'ventureAnalysisWorkflow',
  'brandPackageWorkflow',
  'builderScaffoldWorkflow',
  'gtmExperimentWorkflow',
  'memoryPatternExtractionWorkflow',
  'opsChecklistSyncWorkflow',
];

function seedRuns(count = 18): TemporalRun[] {
  const rand = seededRandom(101);
  const modules: ModuleId[] = MODULE_REGISTRY.map((m) => m.id);
  return Array.from({ length: count }).map<TemporalRun>((_, i) => {
    const statusPick = pick(rand, ['RUNNING', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'QUEUED'] as const);
    const duration = statusPick === 'RUNNING' || statusPick === 'QUEUED'
      ? null
      : Math.floor(5000 + rand() * 280000);
    const startedAgoMin = i * 4 + Math.floor(rand() * 10);
    const started = new Date(Date.now() - startedAgoMin * 60_000).toISOString();
    const module = pick(rand, modules);
    const progress = statusPick === 'RUNNING' ? 0.2 + rand() * 0.7 : 1;
    const steps: RunStep[] = buildSteps(module, statusPick, progress);
    return {
      id: `wf_${i}_${Math.floor(rand() * 1e6).toString(36)}`,
      workflow_type: pick(rand, WF_TYPES),
      module,
      status: statusPick,
      started_at: started,
      duration_ms: duration,
      venture_id: rand() > 0.3 ? `venture_${Math.floor(rand() * 12)}` : undefined,
      progress,
      steps,
    };
  });
}

function buildSteps(_m: ModuleId, status: TemporalRun['status'], progress: number): RunStep[] {
  const names = ['market-scanner', 'analyst', 'scoring', 'prioritization'];
  return names.map((name, idx) => {
    const cutoff = progress * names.length;
    const st: RunStep['status'] =
      status === 'FAILED' && idx === Math.floor(cutoff)
        ? 'failed'
        : idx < Math.floor(cutoff)
          ? 'done'
          : idx === Math.floor(cutoff)
            ? status === 'RUNNING'
              ? 'running'
              : status === 'COMPLETED'
                ? 'done'
                : 'pending'
            : 'pending';
    return {
      name,
      status: st,
      duration_ms: st === 'done' ? 4000 + Math.floor(Math.random() * 40000) : undefined,
    };
  });
}

@Injectable({ providedIn: 'root' })
export class RunsMockDataSource implements IRunsDataSource {
  private readonly runs$ = new BehaviorSubject<TemporalRun[]>(seedRuns(22));

  constructor() {
    interval(4000).subscribe(() => {
      const rand = Math.random();
      const current = this.runs$.getValue();
      if (rand < 0.5) {
        const updated = current.map((r) =>
          r.status === 'RUNNING'
            ? {
                ...r,
                progress: Math.min(1, (r.progress ?? 0) + 0.08),
                status: (r.progress ?? 0) + 0.08 >= 1 ? ('COMPLETED' as const) : ('RUNNING' as const),
                duration_ms: (r.progress ?? 0) + 0.08 >= 1 ? Date.now() - new Date(r.started_at).getTime() : null,
              }
            : r
        );
        this.runs$.next(updated);
      } else {
        const mods = MODULE_REGISTRY.map((m) => m.id);
        const newRun: TemporalRun = {
          id: `wf_live_${Date.now().toString(36)}`,
          workflow_type: WF_TYPES[Math.floor(Math.random() * WF_TYPES.length)],
          module: mods[Math.floor(Math.random() * mods.length)],
          status: 'RUNNING',
          started_at: new Date().toISOString(),
          duration_ms: null,
          progress: 0.1,
          steps: buildSteps('opportunity', 'RUNNING', 0.1),
        };
        this.runs$.next([newRun, ...current].slice(0, 60));
      }
    });
  }

  listRuns(): Observable<TemporalRun[]> {
    return withLatency(this.runs$.getValue());
  }

  streamRuns(): Observable<TemporalRun[]> {
    return this.runs$.asObservable();
  }

  getRun(id: string): Observable<TemporalRun> {
    const r = this.runs$.getValue().find((x) => x.id === id) ?? this.runs$.getValue()[0];
    return withLatency(r);
  }
}
