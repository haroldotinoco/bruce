import { Injectable } from '@angular/core';
import { Observable, map, of, timer } from 'rxjs';
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
} from '../../core/models';
import type { IOpportunityDataSource } from '../../core/data-sources/tokens';
import { DASHBOARD_POLL_INTERVAL_MS } from '../../core/config/polling';
import { daysAgoIso, pick, seededRandom, withLatency, minutesAgoIso } from '../latency';

const MOCK_VENTURE_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const THEMES = [
  ['AI infra', 'developer tools'],
  ['climate tech', 'carbon markets'],
  ['creator economy', 'short-form video'],
  ['legaltech', 'contract automation'],
  ['healthtech', 'preventive care'],
  ['fintech', 'embedded finance'],
];

const SEGMENTS = ['SMB SaaS', 'Prosumer', 'Enterprise', 'DevTools', 'Creator', 'Vertical SaaS'];

const PROBLEMS = [
  'Teams spend hours reconciling LLM usage across vendors',
  'Solo founders lack automated brand book generation',
  'Agencies need repeatable BDD scaffolding for client apps',
  'Ops teams struggle to keep compliance evidence fresh',
  'Creators need lightweight multi-channel analytics',
  'Cross-venture learnings evaporate between projects',
  'Opportunity scans rarely get re-scored with fresh signal',
  'Customer research gets locked inside one tool',
];

@Injectable({ providedIn: 'root' })
export class OpportunityMockDataSource implements IOpportunityDataSource {
  private readonly scans: ScanDetail[] = this.seedScans();

  listScans(params?: { limit?: number; status?: string }): Observable<Scan[]> {
    let rows = this.scans.slice();
    if (params?.status) rows = rows.filter((s) => s.status === params.status);
    if (params?.limit) rows = rows.slice(0, params.limit);
    return withLatency(
      rows.map<Scan>((s) => ({
        id: s.id,
        status: s.status,
        themes: s.themes,
        venture_id: s.venture_id ?? null,
        opportunities_found: s.opportunities_found,
        created_at: s.created_at,
        completed_at: s.completed_at,
        temporal_workflow_id: s.temporal_workflow_id,
      }))
    );
  }

  getScan(id: string): Observable<ScanDetail> {
    const s = this.scans.find((x) => x.id === id);
    if (!s) return withLatency(this.scans[0]);
    return withLatency(s);
  }

  listOpportunities(scanId: string): Observable<Opportunity[]> {
    const s = this.scans.find((x) => x.id === scanId) ?? this.scans[0];
    const res = (s.result as any) ?? {};
    const raw: any[] = res.ranked_opportunities ?? res.opportunities ?? [];
    return withLatency(raw);
  }

  listAllOpportunities(limit = 20): Observable<Opportunity[]> {
    const all: Opportunity[] = this.scans.flatMap((s) => {
      const r = (s.result as any) ?? {};
      return (r.ranked_opportunities ?? []) as Opportunity[];
    });
    all.sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
    return withLatency(all.slice(0, limit));
  }

  startScan(req: StartScanRequest): Observable<StartScanResponse> {
    const id = `opportunity-mock-${Date.now()}`;
    const themes = 'themes' in req && req.themes ? (req.themes as string[]) : ['mock theme'];
    this.scans.unshift({
      id,
      status: 'running',
      themes,
      venture_id: (req as any).venture_id ?? null,
      project_nickname: null,
      temporal_workflow_id: id,
      result: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      opportunities_found: null,
      completed_at: null,
    });
    return withLatency({ workflow_id: id, id, execution_id: id, status: 'queued' });
  }

  getJob(workflowId: string): Observable<JobStatus> {
    const s = this.scans.find((x) => x.id === workflowId || x.temporal_workflow_id === workflowId);
    const status: JobStatus = {
      workflow_id: workflowId,
      status: s?.status === 'completed' ? 'COMPLETED' : s?.status === 'failed' ? 'FAILED' : 'RUNNING',
      started_at: s?.created_at,
      completed_at: s?.completed_at ?? undefined,
      result: s?.result,
    };
    return withLatency(status, 80, 240);
  }

  pollJob(workflowId: string): Observable<JobStatus> {
    let n = 0;
    return timer(0, DASHBOARD_POLL_INTERVAL_MS).pipe(
      map(() => {
        n += 1;
        const completed = n >= 2;
        return <JobStatus>{
          workflow_id: workflowId,
          status: completed ? 'COMPLETED' : 'RUNNING',
          started_at: minutesAgoIso(2),
          completed_at: completed ? new Date().toISOString() : undefined,
        };
      })
    );
  }

  getUsage(): Observable<Usage> {
    return withLatency<Usage>({
      plan: 'pro',
      scans_this_month: 7,
      scans_limit_month: 20,
      max_ai_credits_per_month: 5_000,
    });
  }

  health(): Observable<{ status: string }> {
    return of({ status: 'ok' });
  }

  restartDownstreamScan(
    scanId: string,
    _body: RestartDownstreamRequest,
  ): Observable<RestartDownstreamResponse> {
    const id = `mock-restart-${scanId}-${Date.now()}`;
    return withLatency({
      workflow_id: id,
      pipeline_run_id: null,
      status: 'queued',
      execution_id: id,
      poll_url: `/jobs/${id}`,
    });
  }

  private seedScans(): ScanDetail[] {
    const rand = seededRandom(1234);
    const out: ScanDetail[] = [];
    for (let i = 0; i < 9; i++) {
      const themes = pick(rand, THEMES);
      const opps: Opportunity[] = Array.from({ length: 3 + Math.floor(rand() * 4) }).map((_, idx) => {
        const score = 50 + Math.floor(rand() * 45);
        return {
          id: `op_${i}_${idx}`,
          title: pick(rand, PROBLEMS).split(' ').slice(0, 5).join(' '),
          problem_statement: pick(rand, PROBLEMS),
          market_segment: pick(rand, SEGMENTS),
          score,
          total_score: score,
          created_at: daysAgoIso(i + idx, rand),
          scan_id: `scan_${i}`,
          key_insights: [
            'Early adopter cohort shows >3x retention',
            'Incumbents bundle but don’t specialize',
            'Willingness-to-pay validated on cold outbound',
          ].slice(0, 1 + Math.floor(rand() * 3)),
        };
      });
      const status: ScanDetail['status'] =
        i === 0 ? 'running' : i === 1 ? 'failed' : 'completed';
      const ventureUuidForRestartDemo = i >= 2 && i <= 4 ? MOCK_VENTURE_UUID : null;
      out.push({
        id: `scan_${i}`,
        status,
        themes,
        venture_id: ventureUuidForRestartDemo ?? (i % 2 === 0 ? `venture_${i % 5}` : null),
        project_nickname:
          status === 'completed' && ventureUuidForRestartDemo ? `mock-quokka-${i}` : null,
        temporal_workflow_id: `opportunity-weekly-${i}-${1000 + i}`,
        created_at: daysAgoIso(i * 2 + 1, rand),
        completed_at: status === 'completed' ? daysAgoIso(i * 2, rand) : null,
        updated_at: daysAgoIso(i * 2, rand),
        opportunities_found: status === 'completed' ? opps.length : null,
        error_message: status === 'failed' ? 'Timeout on analyst retry' : null,
        result:
          status === 'completed'
            ? { ranked_opportunities: opps.sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0)) }
            : null,
      });
    }
    return out;
  }
}
