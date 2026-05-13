import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap, takeWhile, timer, catchError } from 'rxjs';
import { ApiService } from '../http/api.service';
import type {
  Scan,
  ScanDetail,
  Opportunity,
  StartScanRequest,
  StartScanResponse,
  JobStatus,
  Usage,
  RestartDownstreamRequest,
  RestartDownstreamResponse,
} from '../models';
import type { IOpportunityDataSource } from './tokens';
import { DASHBOARD_POLL_INTERVAL_MS } from '../config/polling';

interface RawScanListItem {
  id: string;
  status: string;
  themes: string[] | null;
  opportunities_found: number | null;
  created_at: string;
  completed_at: string | null;
  temporal_workflow_id: string | null;
}

interface RawScanDetail {
  id: string;
  status: string;
  themes: string[] | null;
  venture_id: string | null;
  project_nickname?: string | null;
  temporal_workflow_id: string | null;
  result: unknown;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class OpportunityRealDataSource implements IOpportunityDataSource {
  private readonly api = inject(ApiService);

  listScans(params?: { limit?: number; status?: string }): Observable<Scan[]> {
    return this.api
      .get<{ data: RawScanListItem[] }>('opportunity', '/scans', {
        params: { limit: params?.limit ?? 20, status: params?.status },
      })
      .pipe(
        map((r) =>
          r.data.map<Scan>((s) => ({
            id: s.id,
            status: normalizeStatus(s.status),
            themes: s.themes,
            venture_id: null,
            opportunities_found: s.opportunities_found,
            created_at: s.created_at,
            completed_at: s.completed_at,
            temporal_workflow_id: s.temporal_workflow_id,
          }))
        )
      );
  }

  getScan(id: string): Observable<ScanDetail> {
    return this.api.get<RawScanDetail>('opportunity', `/scans/${id}`).pipe(
      map<RawScanDetail, ScanDetail>((s) => ({
        id: s.id,
        status: normalizeStatus(s.status),
        themes: s.themes,
        venture_id: s.venture_id,
        project_nickname: s.project_nickname ?? null,
        opportunities_found: countOps(s.result),
        created_at: s.created_at,
        completed_at: s.status === 'completed' ? s.updated_at : null,
        temporal_workflow_id: s.temporal_workflow_id,
        result: s.result,
        error_message: s.error_message,
        updated_at: s.updated_at,
      }))
    );
  }

  listOpportunities(scanId: string, minScore?: number): Observable<Opportunity[]> {
    return this.api
      .get<{ opportunities: unknown[] }>('opportunity', `/scans/${scanId}/opportunities`, {
        params: { min_score: minScore },
      })
      .pipe(map((r) => r.opportunities.map((o, idx) => toOpportunity(o, idx, scanId))));
  }

  listAllOpportunities(limit = 20): Observable<Opportunity[]> {
    return this.api
      .get<{ data: Opportunity[] }>('opportunity', '/opportunities', { params: { limit } })
      .pipe(
        map((r) => r.data),
        catchError(() => of([] as Opportunity[]))
      );
  }

  startScan(req: StartScanRequest): Observable<StartScanResponse> {
    return this.api.post<any>('opportunity', '/scans', req).pipe(
      map((r) => ({
        workflow_id: r.workflow_id,
        id: r.id as string | undefined,
        execution_id: r.execution_id,
        status: r.status ?? 'queued',
      }))
    );
  }

  getJob(workflowId: string): Observable<JobStatus> {
    return this.api.get<JobStatus>('opportunity', `/jobs/${workflowId}`);
  }

  pollJob(workflowId: string): Observable<JobStatus> {
    return timer(0, DASHBOARD_POLL_INTERVAL_MS).pipe(
      switchMap(() => this.getJob(workflowId)),
      takeWhile(
        (j) =>
          j.status !== 'COMPLETED' &&
          j.status !== 'FAILED' &&
          j.status !== 'CANCELED' &&
          j.status !== 'TERMINATED' &&
          j.status !== 'TIMED_OUT',
        true
      )
    );
  }

  getUsage(): Observable<Usage> {
    return this.api.get<Usage>('opportunity', '/usage');
  }

  health(): Observable<{ status: string }> {
    return this.api.get<{ status: string }>('opportunity', '/health');
  }

  restartDownstreamScan(
    scanId: string,
    body: RestartDownstreamRequest,
  ): Observable<RestartDownstreamResponse> {
    return this.api.post('opportunity', `/scans/${scanId}/restart-downstream`, body);
  }
}

function normalizeStatus(s: string): Scan['status'] {
  const v = s?.toLowerCase();
  if (v === 'queued' || v === 'running' || v === 'completed' || v === 'failed' || v === 'canceled') {
    return v;
  }
  return 'queued';
}

function countOps(result: unknown): number | null {
  if (!result || typeof result !== 'object') return null;
  const r = result as Record<string, unknown>;
  for (const k of ['ranked_opportunities', 'scored_opportunities', 'opportunities']) {
    const arr = r[k];
    if (Array.isArray(arr)) return arr.length;
  }
  return null;
}

function toOpportunity(raw: unknown, idx: number, scanId: string): Opportunity {
  const o = (raw ?? {}) as Record<string, unknown>;
  const total = Number(o['total_score'] ?? o['score'] ?? 0);
  const id = String(o['id'] ?? o['slug'] ?? `${scanId}-${idx}`);
  return {
    id,
    title: String(o['title'] ?? o['name'] ?? o['problem_statement'] ?? 'Untitled'),
    problem_statement: String(o['problem_statement'] ?? o['title'] ?? ''),
    market_segment: String(o['market_segment'] ?? o['segment'] ?? o['category'] ?? 'general'),
    score: Math.round(total),
    total_score: Math.round(total),
    created_at: String(o['created_at'] ?? new Date().toISOString()),
    scan_id: scanId,
    key_insights: Array.isArray(o['key_insights']) ? (o['key_insights'] as string[]) : undefined,
    research_data: o['research_data'],
    competitive_landscape: o['competitive_landscape'],
  };
}
