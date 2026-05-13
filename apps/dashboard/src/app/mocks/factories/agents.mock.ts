import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import type { AgentCapability } from '../../core/models';
import type { IAgentsDataSource } from '../../core/data-sources/tokens';

const FALLBACK: AgentCapability[] = [
  {
    id: 'opportunity-analyst',
    module: 'opportunity',
    name: 'opportunity-analyst',
    label: 'Opportunity Analyst',
    description: 'Deep-dives a candidate opportunity into a structured dossier with market sizing and fit.',
    capabilities: ['market_sizing', 'evidence_collection', 'scoring_inputs'],
    inputs: ['seed_opportunity', 'web_research'],
    outputs: ['opportunity_dossier'],
    model: 'openrouter/auto',
  },
  {
    id: 'market-scanner',
    module: 'opportunity',
    name: 'market-scanner',
    label: 'Market Scanner',
    description: 'Scans themes and web sources to surface candidate opportunities.',
    capabilities: ['web_search', 'trend_detection'],
    outputs: ['opportunity_candidates'],
  },
];

@Injectable({ providedIn: 'root' })
export class AgentsManifestDataSource implements IAgentsDataSource {
  private readonly http = inject(HttpClient);
  private cache?: AgentCapability[];

  listAgents(): Observable<AgentCapability[]> {
    if (this.cache) return of(this.cache);
    return this.http.get<AgentCapability[]>('assets/manifests/agents.json').pipe(
      map((agents) => (Array.isArray(agents) && agents.length ? agents : FALLBACK)),
      catchError(() => of(FALLBACK)),
      map((list) => {
        this.cache = list;
        return list;
      })
    );
  }
}
