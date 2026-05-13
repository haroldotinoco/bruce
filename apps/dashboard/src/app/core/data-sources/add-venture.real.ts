import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';
import { ApiService } from '../http/api.service';
import type { AddVentureDossier, IAddVentureDataSource } from './tokens';

interface RawDossierListItem {
  id: string;
  venture_id: string | null;
  pipeline_run_id: string | null;
  project_nickname: string | null;
  venture_name: string | null;
  critic_score: number | null;
  status: string | null;
  executive_summary: string | null;
  created_at: string;
  updated_at: string;
}

interface RawDossierDetail extends RawDossierListItem {
  dossier: unknown | null;
  dossier_source: 'filesystem' | 'missing';
}

function normalizeStatus(s: string | null): AddVentureDossier['status'] {
  const v = (s ?? '').toLowerCase();
  if (v === 'approved' || v === 'validated') return 'validated';
  if (v === 'composed' || v === 'needs_iteration') return 'composed';
  return 'draft';
}

function safeArray<T>(v: unknown, map: (x: unknown) => T | null): T[] {
  if (!Array.isArray(v)) return [];
  return v.map(map).filter((x): x is T => x != null);
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' && v.length > 0 ? v : fallback;
}

function extractBusinessModel(dossier: unknown): AddVentureDossier['business_model'] {
  const d = (dossier ?? {}) as Record<string, unknown>;
  const bm = (d['business_model'] ?? {}) as Record<string, unknown>;
  const vol2 = (d['customer_market'] ?? {}) as Record<string, unknown>;
  const segments = safeArray<string>(
    (vol2['segments'] ?? bm['segments']) as unknown,
    (x) => {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object') {
        const n = (x as Record<string, unknown>)['name'];
        return typeof n === 'string' ? n : null;
      }
      return null;
    },
  );
  const valuePropsRaw = (d['value_proposition'] ?? {}) as Record<string, unknown>;
  const valueProps = safeArray<string>(valuePropsRaw['value_propositions'], (x) => {
    if (typeof x === 'string') return x;
    if (x && typeof x === 'object') {
      const s = (x as Record<string, unknown>)['statement'];
      return typeof s === 'string' ? s : null;
    }
    return null;
  });
  const channels = safeArray<string>(bm['channels'], (x) =>
    typeof x === 'string' ? x : null,
  );
  return {
    segments: segments.slice(0, 6),
    value_props: valueProps.slice(0, 6),
    channels: channels.slice(0, 6),
  };
}

function extractNarrative(dossier: unknown, summary: string | null): string {
  const d = (dossier ?? {}) as Record<string, unknown>;
  const es = (d['executive_summary'] ?? {}) as Record<string, unknown>;
  return str(es['narrative_summary']) || str(summary);
}

function extractRoadmap(dossier: unknown): AddVentureDossier['roadmap'] {
  const d = (dossier ?? {}) as Record<string, unknown>;
  const er = (d['execution_roadmap'] ?? {}) as Record<string, unknown>;
  const phases = er['phases'];
  if (!Array.isArray(phases)) return [];
  return phases
    .map((p): AddVentureDossier['roadmap'][number] | null => {
      if (!p || typeof p !== 'object') return null;
      const o = p as Record<string, unknown>;
      return {
        quarter: str(o['quarter'] ?? o['timeframe'] ?? o['name'], 'Q?'),
        goal: str(o['goal'] ?? o['objective'] ?? o['description'], 'Goal'),
        owner: str(o['owner'] ?? o['lead'], 'Team'),
      };
    })
    .filter((x): x is AddVentureDossier['roadmap'][number] => x != null)
    .slice(0, 8);
}

function toDossier(raw: RawDossierListItem, detail?: RawDossierDetail | null): AddVentureDossier {
  const score = typeof raw.critic_score === 'number' ? Math.round(raw.critic_score) : 0;
  const dossierJson = detail?.dossier ?? null;
  return {
    id: raw.id,
    venture_id: raw.venture_id ?? raw.project_nickname ?? raw.id,
    venture_name: raw.venture_name ?? raw.project_nickname ?? 'Venture',
    status: normalizeStatus(raw.status),
    updated_at: raw.updated_at,
    business_model: dossierJson
      ? extractBusinessModel(dossierJson)
      : { segments: [], value_props: [], channels: [] },
    narrative: extractNarrative(dossierJson, raw.executive_summary),
    roadmap: dossierJson ? extractRoadmap(dossierJson) : [],
    critic_score: score,
  };
}

@Injectable({ providedIn: 'root' })
export class AddVentureRealDataSource implements IAddVentureDataSource {
  private readonly api = inject(ApiService);

  listDossiers(_ventureId?: string): Observable<AddVentureDossier[]> {
    return this.api
      .get<{ data: RawDossierListItem[] }>('add-venture', '/dossiers', {
        params: { limit: 50 },
      })
      .pipe(
        map((r) => r.data.map((row) => toDossier(row))),
        catchError(() => of([] as AddVentureDossier[])),
      );
  }

  getDossier(id: string): Observable<AddVentureDossier> {
    return this.api
      .get<RawDossierDetail>('add-venture', `/dossiers/${id}`)
      .pipe(map((row) => toDossier(row, row)));
  }
}
