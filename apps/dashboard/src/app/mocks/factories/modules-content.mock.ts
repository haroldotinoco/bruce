import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { seededRandom, pick, daysAgoIso, withLatency } from '../latency';
import type {
  IAddVentureDataSource,
  AddVentureDossier,
  IBrandAidDataSource,
  BrandPackage,
  IBuilderDataSource,
  BuilderProject,
  IGtmDataSource,
  GtmExperiment,
  IStartupOpsDataSource,
  OpsChecklist,
  IPortfolioDataSource,
  PortfolioEntry,
  IBruceMemoryDataSource,
  MemoryPattern,
  MemoryDocument,
} from '../../core/data-sources/tokens';
import { SEED_VENTURES } from './ventures.mock';

@Injectable({ providedIn: 'root' })
export class AddVentureMockDataSource implements IAddVentureDataSource {
  listDossiers(): Observable<AddVentureDossier[]> {
    const rand = seededRandom(200);
    const rows = SEED_VENTURES.slice(0, 8).map<AddVentureDossier>((v, i) => ({
      id: `dossier_${i}`,
      venture_id: v.id,
      venture_name: v.name,
      status: pick(rand, ['draft', 'composed', 'validated'] as const),
      updated_at: daysAgoIso(i, rand),
      business_model: {
        segments: [pick(rand, ['SMB', 'Prosumer', 'Mid-market']), pick(rand, ['DevOps', 'Ops', 'Revenue'])],
        value_props: ['10x faster', 'Zero-config', 'Audit-ready'],
        channels: ['PLG', 'Outbound', 'Partners'],
      },
      narrative: 'A pragmatic wedge into vertical SaaS for AI-native teams.',
      roadmap: [
        { quarter: 'Q1', goal: 'Ship MVP with 3 design partners', owner: 'Product' },
        { quarter: 'Q2', goal: 'Close first $10k ARR', owner: 'GTM' },
        { quarter: 'Q3', goal: 'Launch self-serve', owner: 'Engineering' },
      ],
      critic_score: 60 + Math.floor(rand() * 35),
    }));
    return withLatency(rows);
  }

  getDossier(id: string): Observable<AddVentureDossier> {
    return this.listDossiers() as unknown as Observable<AddVentureDossier>;
  }
}

@Injectable({ providedIn: 'root' })
export class BrandAidMockDataSource implements IBrandAidDataSource {
  listPackages(): Observable<BrandPackage[]> {
    const rand = seededRandom(300);
    const palettes = [
      ['#7c5cff', '#22d3ee', '#f472b6', '#22c55e'],
      ['#ef4444', '#f59e0b', '#22c55e', '#14b8a6'],
      ['#0ea5e9', '#8b5cf6', '#ec4899', '#f97316'],
      ['#1f2937', '#64748b', '#94a3b8', '#e2e8f0'],
    ];
    const rows = SEED_VENTURES.slice(0, 6).map<BrandPackage>((v, i) => ({
      id: `brand_${i}`,
      venture_name: v.name,
      status: pick(rand, ['generating', 'ready', 'archived'] as const),
      updated_at: daysAgoIso(i, rand),
      names: [`${v.name}ly`, `${v.name}Lab`, `Try${v.name}`, `${v.name}.io`, `${v.name}Kit`],
      palette: pick(rand, palettes),
      moodboard: [
        { label: 'Editorial', color: '#1e293b' },
        { label: 'Vivid', color: '#7c5cff' },
        { label: 'Techno', color: '#22d3ee' },
        { label: 'Warm', color: '#f59e0b' },
      ],
      logos: 3 + Math.floor(rand() * 5),
      score: 55 + Math.floor(rand() * 40),
    }));
    return withLatency(rows);
  }

  getPackage(id: string): Observable<BrandPackage> {
    return this.listPackages().pipe(
      map((packages) => packages.find((pkg) => pkg.id === id) ?? packages[0] ?? {
        id,
        venture_name: 'Brand package',
        status: 'generating',
        updated_at: new Date().toISOString(),
        names: [],
        palette: [],
        moodboard: [],
        logos: 0,
        score: 0,
      }),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class BuilderMockDataSource implements IBuilderDataSource {
  listProjects(): Observable<BuilderProject[]> {
    const rand = seededRandom(400);
    const rows = SEED_VENTURES.slice(0, 6).map<BuilderProject>((v, i) => ({
      id: `build_${i}`,
      venture_name: v.name,
      status: pick(rand, ['planning', 'scaffolding', 'testing', 'deployed'] as const),
      updated_at: daysAgoIso(i, rand),
      components: 12 + Math.floor(rand() * 40),
      bdd_scenarios: 6 + Math.floor(rand() * 30),
      qa_pass_rate: 70 + Math.floor(rand() * 28),
      agents: [
        { name: 'solution-architect', status: 'done', last: daysAgoIso(i + 1, rand) },
        { name: 'backend-agent', status: pick(rand, ['running', 'done'] as const), last: daysAgoIso(i, rand) },
        { name: 'frontend-agent', status: pick(rand, ['idle', 'running'] as const), last: daysAgoIso(i, rand) },
        { name: 'qa-agent', status: pick(rand, ['running', 'done'] as const), last: daysAgoIso(i, rand) },
        { name: 'security-agent', status: pick(rand, ['idle', 'done'] as const), last: daysAgoIso(i + 1, rand) },
      ],
    }));
    return withLatency(rows);
  }
}

@Injectable({ providedIn: 'root' })
export class GtmMockDataSource implements IGtmDataSource {
  listExperiments(): Observable<GtmExperiment[]> {
    const rand = seededRandom(500);
    const channels = ['Cold email', 'LinkedIn', 'Twitter', 'Partnerships', 'Communities', 'SEO', 'Paid search'];
    const rows = Array.from({ length: 10 }).map<GtmExperiment>((_, i) => {
      const v = SEED_VENTURES[i % SEED_VENTURES.length];
      const status = pick(rand, ['backlog', 'running', 'won', 'lost'] as const);
      const target = 5 + Math.floor(rand() * 45);
      const observed = status === 'won'
        ? target + Math.floor(rand() * 20)
        : status === 'lost'
          ? Math.floor(target * 0.3)
          : Math.floor(target * (0.3 + rand() * 0.7));
      return {
        id: `gtm_${i}`,
        venture_name: v.name,
        channel: pick(rand, channels),
        hypothesis: pick(rand, [
          'If we personalize subject lines, reply rate >8%',
          'If we bundle onboarding call, activation >40%',
          'If we launch on PH, signups >200 in a week',
          'If we partner with newsletter, CPL < $12',
        ]),
        status,
        metric: pick(rand, ['reply_rate', 'signups', 'cpl', 'activation']),
        target,
        observed,
        updated_at: daysAgoIso(i, rand),
      };
    });
    return withLatency(rows);
  }
}

@Injectable({ providedIn: 'root' })
export class StartupOpsMockDataSource implements IStartupOpsDataSource {
  listChecklists(): Observable<OpsChecklist[]> {
    const rand = seededRandom(600);
    const categories: OpsChecklist['category'][] = ['legal', 'finance', 'hr', 'compliance', 'vendors'];
    const rows = SEED_VENTURES.slice(0, 7).map<OpsChecklist>((v, i) => ({
      id: `ops_${i}`,
      venture_name: v.name,
      category: categories[i % categories.length],
      progress: 20 + Math.floor(rand() * 75),
      open_items: Math.floor(rand() * 12),
      updated_at: daysAgoIso(i, rand),
    }));
    return withLatency(rows);
  }
}

@Injectable({ providedIn: 'root' })
export class PortfolioMockDataSource implements IPortfolioDataSource {
  listVenturesMatrix(): Observable<PortfolioEntry[]> {
    const rand = seededRandom(700);
    const rows = SEED_VENTURES.map<PortfolioEntry>((v) => ({
      id: v.id,
      name: v.name,
      stage: v.stage,
      score: v.score ?? 50,
      revenue_est: Math.floor(rand() * 90_000),
      risk: pick(rand, ['low', 'medium', 'high'] as const),
      tags: [pick(rand, ['AI', 'climate', 'creator', 'fintech', 'legal']), pick(rand, ['B2B', 'B2C', 'B2B2C'])],
    }));
    return withLatency(rows);
  }
}

@Injectable({ providedIn: 'root' })
export class BruceMemoryMockDataSource implements IBruceMemoryDataSource {
  listPatterns(): Observable<MemoryPattern[]> {
    const rand = seededRandom(800);
    const rows = Array.from({ length: 8 }).map<MemoryPattern>((_, i) => ({
      id: `pattern_${i}`,
      title: pick(rand, [
        'Weekly cadence beats monthly for early ventures',
        'Bundling onboarding boosts activation >35%',
        'Naming with 1-2 syllables wins recall tests',
        'Outbound + community 2-tier funnel works at seed',
        'Quality gate at 70 reduces noise from discovery',
      ]),
      ventures_matched: 2 + Math.floor(rand() * 6),
      insight: 'Cross-venture analyst detected a consistent lift when this pattern is applied early.',
      confidence: 0.6 + rand() * 0.35,
      updated_at: daysAgoIso(i, rand),
    }));
    return withLatency(rows);
  }

  search(q: string): Observable<MemoryDocument[]> {
    if (!q.trim()) return of([]);
    const rand = seededRandom(q.length * 13);
    const rows = Array.from({ length: 5 }).map<MemoryDocument>((_, i) => ({
      id: `doc_${i}`,
      title: `Finding ${i + 1}: "${q}"`,
      venture: SEED_VENTURES[i % SEED_VENTURES.length].name,
      snippet: `We observed a strong correlation between ${q} and activation uplift in cohort ${i + 2}.`,
      score: 0.45 + rand() * 0.5,
    }));
    return withLatency(rows);
  }
}
