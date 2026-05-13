import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import type { Venture, VentureStage } from '../../core/models';
import type { IBruceCoreDataSource } from '../../core/data-sources/tokens';
import type { ModuleId } from '../../core/config/env.types';
import { daysAgoIso, seededRandom, pick, withLatency } from '../latency';

const NAMES = [
  'Helix',
  'Beacon',
  'Cobalt',
  'Nimbus',
  'Ember',
  'Atlas',
  'Orbit',
  'Sprout',
  'Loom',
  'Spire',
  'Kite',
  'Fable',
  'Onyx',
  'Juniper',
];

const STAGES: VentureStage[] = ['concept', 'scoping', 'building', 'live', 'archived'];

const MODS: ModuleId[] = [
  'opportunity',
  'add-venture',
  'brand-aid',
  'builder',
  'gtm',
  'startup-ops',
  'portfolio',
  'bruce-memory',
];

export const SEED_VENTURES: Venture[] = (() => {
  const rand = seededRandom(42);
  return Array.from({ length: 12 }).map<Venture>((_, i) => {
    const stage = pick(rand, STAGES);
    const activeCount = stage === 'concept' ? 1 : stage === 'scoping' ? 2 : stage === 'building' ? 5 : stage === 'live' ? 4 : 0;
    const modulesActive: ModuleId[] = MODS.slice(0, activeCount).sort(() => rand() - 0.5);
    return {
      id: `venture_${i}`,
      name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${i}` : ''),
      stage,
      created_at: daysAgoIso(i * 7 + 3, rand),
      updated_at: daysAgoIso(Math.floor(rand() * 7), rand),
      score: 40 + Math.floor(rand() * 55),
      modules_active: modulesActive,
      owner: pick(rand, ['Harold', 'Beatriz', 'Paulo', 'Marta', 'Rui']),
      description: `Synthetic venture focused on ${pick(rand, [
        'AI ops',
        'climate data',
        'creator tools',
        'fintech embedded',
        'legal automation',
        'devtool SDK',
      ])}.`,
    };
  });
})();

@Injectable({ providedIn: 'root' })
export class BruceCoreMockDataSource implements IBruceCoreDataSource {
  listVentures(): Observable<Venture[]> {
    return withLatency(SEED_VENTURES);
  }

  getVenture(id: string): Observable<Venture> {
    const v = SEED_VENTURES.find((x) => x.id === id) ?? SEED_VENTURES[0];
    return withLatency(v);
  }

  createVenture(input: { name: string; stage?: string }): Observable<Venture> {
    const v: Venture = {
      id: `venture_${Date.now()}`,
      name: input.name,
      stage: (input.stage as VentureStage) ?? 'concept',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      modules_active: ['opportunity'],
      score: 50,
      description: 'New venture.',
    };
    SEED_VENTURES.unshift(v);
    return withLatency(v);
  }

  startAnalysis(ventureId: string): Observable<{ job_id: string }> {
    return withLatency({ job_id: `analyze-${ventureId}-${Date.now()}` });
  }

  listGovernanceEvents(): Observable<{ at: string; type: string; message: string }[]> {
    const rand = seededRandom(7);
    const out = Array.from({ length: 10 }).map((_, i) => ({
      at: daysAgoIso(i / 2, rand),
      type: pick(rand, ['gate.opened', 'gate.passed', 'gate.rejected', 'dispatch', 'policy.updated']),
      message: pick(rand, [
        'Gate "scoping-complete" passed for Helix',
        'Module opportunity dispatched to Beacon',
        'Policy quality-threshold updated to 72',
        'Venture lifecycle: Orbit → building',
        'Rejected gate for Atlas due to missing artifacts',
      ]),
    }));
    return withLatency(out);
  }
}
