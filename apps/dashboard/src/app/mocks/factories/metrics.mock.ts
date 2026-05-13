import { Injectable, inject } from '@angular/core';
import { Observable, interval, map, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/http/api.service';
import type {
  GlobalKpis,
  IMetricsDataSource,
} from '../../core/data-sources/tokens';
import type { ModuleHealth, LiveEvent } from '../../core/models';
import type { ModuleId } from '../../core/config/env.types';
import { seededRandom, pick, minutesAgoIso, withLatency } from '../latency';
import { SEED_VENTURES } from './ventures.mock';
import { MODULE_REGISTRY } from '../../core/config/module-registry';

@Injectable({ providedIn: 'root' })
export class MetricsMockDataSource implements IMetricsDataSource {
  private readonly api = inject(ApiService);

  globalKpis(): Observable<GlobalKpis> {
    const activeStages = SEED_VENTURES.filter((v) => v.stage !== 'archived');
    const funnel = { concept: 0, scoping: 0, building: 0, live: 0 };
    for (const v of activeStages) {
      if (v.stage in funnel) (funnel as any)[v.stage]++;
    }
    const base: GlobalKpis = {
      active_ventures: activeStages.length,
      active_ventures_delta: 2,
      workflows_running: 7,
      workflows_running_delta: 3,
      opportunities_7d: 38,
      opportunities_7d_delta: 11,
      llm_cost_usd_month: 42.5,
      llm_cost_usd_month_delta: -3.2,
      venture_funnel: funnel,
    };
    return this.api.get<{ month: { cost_usd: number | null } }>('bruce-core', '/metrics/llm/global').pipe(
      catchError(() => of(null)),
      switchMap((res) => {
        const cost = res?.month?.cost_usd;
        const merged: GlobalKpis = {
          ...base,
          llm_cost_usd_month:
            typeof cost === 'number' && Number.isFinite(cost) ? cost : base.llm_cost_usd_month,
        };
        return withLatency(merged);
      }),
    );
  }

  moduleHealth(): Observable<ModuleHealth[]> {
    const rand = seededRandom(13);
    const out = MODULE_REGISTRY.map<ModuleHealth>((m) => {
      const jobs24h = Math.floor(rand() * 140);
      const failures = Math.floor(jobs24h * (rand() * 0.08));
      const status = m.id === 'opportunity'
        ? 'ok'
        : failures > 8
          ? 'degraded'
          : jobs24h === 0
            ? 'idle'
            : 'ok';
      return {
        id: m.id,
        status,
        jobs24h,
        failures24h: failures,
        avgLatencyMs: 200 + Math.floor(rand() * 1800),
        costUsd14d: Math.round(rand() * 420 * 100) / 100,
        lastRunAt: minutesAgoIso(Math.floor(rand() * 480)),
      };
    });
    return withLatency(out);
  }

  activityHeatmap(): Observable<number[][]> {
    const rand = seededRandom(97);
    const days = 35;
    const hours = 24;
    const grid = Array.from({ length: days }).map(() =>
      Array.from({ length: hours }).map(() => {
        const base = rand();
        return Math.round(base * base * 20);
      })
    );
    return withLatency(grid);
  }

  costSparkline(): Observable<number[]> {
    const rand = seededRandom(55);
    const out = Array.from({ length: 14 }).map((_, i) => {
      const base = 120 + Math.sin(i / 2) * 40;
      return Math.round(base + rand() * 60);
    });
    return withLatency(out);
  }

  liveFeed(): Observable<LiveEvent[]> {
    const rand = seededRandom(29);
    const modules: ModuleId[] = MODULE_REGISTRY.map((m) => m.id);
    const kinds = [
      'scan.completed',
      'workflow.started',
      'gate.passed',
      'agent.output',
      'venture.created',
      'dispatch.enqueued',
    ];
    const msgs = [
      'Opportunity scan completed with 5 ranked candidates',
      'Builder scaffolding finished for Helix',
      'Brand-Aid generated 12 naming candidates',
      'GTM experiment "cold-outbound-v2" reached target',
      'Bruce-Memory pattern extracted from 3 ventures',
      'Add-Venture dossier composed for Beacon',
      'Gate "scoping-complete" passed for Cobalt',
      'Portfolio rebalance suggested low-risk shift',
    ];
    const out: LiveEvent[] = Array.from({ length: 8 }).map((_, i) => {
      const sev = pick(rand, ['info', 'success', 'warn'] as const);
      return {
        id: `evt_${i}`,
        module: pick(rand, modules),
        kind: pick(rand, kinds),
        message: pick(rand, msgs),
        at: minutesAgoIso(i * 3 + Math.floor(rand() * 10)),
        severity: sev,
      };
    });
    return withLatency(out);
  }

  liveFeedStream(): Observable<LiveEvent> {
    const rand = seededRandom(Date.now() & 0xffff);
    const modules: ModuleId[] = MODULE_REGISTRY.map((m) => m.id);
    return interval(5000).pipe(
      map((i) => ({
        id: `stream_${i}_${Date.now()}`,
        module: pick(rand, modules),
        kind: 'workflow.tick',
        message: pick(rand, [
          'Module health refreshed',
          'Cost budget steady',
          'Agent output sampled',
          'Weekly scan scheduled',
          'New opportunity scored ≥70',
        ]),
        at: new Date().toISOString(),
        severity: 'info' as const,
      }))
    );
  }
}
