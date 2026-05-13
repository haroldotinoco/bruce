import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import type { IWorkflowDataSource } from './tokens';
import type { ActiveWorkflow, WorkflowRunSummary } from '../models';
import type { ModuleId } from '../config/env.types';
import { DataModeService } from './data-mode.service';
import { WorkflowMockDataSource } from '../../mocks/factories/workflow.mock';
import { ApiService } from '../http/api.service';

interface ListResp {
  runs: WorkflowRunSummary[];
}

@Injectable({ providedIn: 'root' })
export class WorkflowDataSourceRouter implements IWorkflowDataSource {
  private readonly mock = inject(WorkflowMockDataSource);
  private readonly mode = inject(DataModeService);
  private readonly api = inject(ApiService);

  /**
   * List recent active workflow runs for a module via the universal observability
   * endpoint `GET /services/<module>/workflows`. Falls back to the mock if not live
   * or on error.
   */
  activeForModule(moduleId: ModuleId): Observable<ActiveWorkflow[]> {
    if (!this.mode.isLive(moduleId)) {
      return this.mock.activeForModule(moduleId);
    }
    return this.api
      .get<ListResp>(moduleId, '/workflows', { params: { limit: 5 } })
      .pipe(
        map((resp) => {
          const summaries = resp?.runs ?? [];
          return summaries.map((s) => summaryToActive(s, moduleId));
        }),
        catchError(() => this.mock.activeForModule(moduleId)),
      );
  }

  /**
   * Fetches a single workflow run with full step tree from
   * `GET /services/<module>/workflows/:run_id`. Tries the user's preferred
   * module first (opportunity by default), then falls back to other modules
   * if not found, and finally to the mock.
   *
   * `runId` may be either an observability UUID or a Temporal workflow id —
   * the backend resolves both.
   */
  get(runId: string, moduleHint?: ModuleId): Observable<ActiveWorkflow | null> {
    const candidates: ModuleId[] = moduleHint
      ? [moduleHint]
      : (['opportunity', 'add-venture', 'brand-aid', 'builder', 'gtm', 'portfolio', 'startup-ops', 'bruce-memory', 'bruce-core'] as ModuleId[]);

    return this.tryGet(candidates, runId);
  }

  private tryGet(modules: ModuleId[], runId: string): Observable<ActiveWorkflow | null> {
    if (!modules.length) return this.mock.get(runId);
    const [first, ...rest] = modules;
    if (!this.mode.isLive(first)) {
      return rest.length ? this.tryGet(rest, runId) : this.mock.get(runId);
    }
    return this.api
      .get<ActiveWorkflow>(first, `/workflows/${encodeURIComponent(runId)}`)
      .pipe(
        map((wf) => attachLiveElapsed(wf)),
        catchError(() => this.tryGet(rest, runId)),
      );
  }
}

function summaryToActive(s: WorkflowRunSummary, moduleId: ModuleId): ActiveWorkflow {
  const status: ActiveWorkflow['status'] =
    s.status === 'completed'
      ? 'completed'
      : s.status === 'failed'
        ? 'failed'
        : s.status === 'queued'
          ? 'queued'
          : 'running';
  const elapsed =
    status === 'running'
      ? Date.now() - new Date(s.started_at).getTime()
      : s.completed_at
        ? new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()
        : undefined;
  return {
    id: s.id,
    module: (s.module ?? moduleId) as ModuleId,
    workflow_type: s.workflow_type,
    venture_id: s.venture_id,
    venture_name: s.subtitle,
    title: s.title,
    subtitle: s.subtitle,
    status,
    started_at: s.started_at,
    completed_at: s.completed_at,
    elapsed_ms: elapsed,
    progress: s.progress,
    steps: [],
    temporal_workflow_id: s.temporal_workflow_id,
  };
}

/**
 * Compute live `elapsed_ms` for the run and any currently-running steps so the
 * UI can render a ticking timer without extra requests.
 */
function attachLiveElapsed(wf: ActiveWorkflow | null): ActiveWorkflow | null {
  if (!wf) return wf;
  const now = Date.now();
  const runElapsed =
    wf.status === 'running'
      ? now - new Date(wf.started_at).getTime()
      : wf.completed_at
        ? new Date(wf.completed_at).getTime() - new Date(wf.started_at).getTime()
        : undefined;
  return {
    ...wf,
    elapsed_ms: runElapsed,
    steps: (wf.steps ?? []).map((s) => attachStepElapsed(s, now)),
  };
}

function attachStepElapsed(step: ActiveWorkflow['steps'][number], now: number): ActiveWorkflow['steps'][number] {
  const elapsed =
    step.status === 'running' && step.started_at
      ? now - new Date(step.started_at).getTime()
      : step.duration_ms;
  return {
    ...step,
    elapsed_ms: elapsed,
    sub_steps: step.sub_steps?.map((c) => attachStepElapsed(c, now)),
  };
}
