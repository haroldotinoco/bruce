import type { ModuleId } from './env.types';

export interface ModuleMeta {
  id: ModuleId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  order: number;
  route: string;
  realAvailable: boolean;
}

export const MODULE_REGISTRY: ModuleMeta[] = [
  {
    id: 'bruce-core',
    label: 'Bruce Core',
    shortLabel: 'Core',
    description: 'Venture lifecycle, gates, governance',
    color: '#64748b',
    accent: '#94a3b8',
    icon: 'shield-check',
    order: 0,
    route: '/bruce-core',
    realAvailable: false,
  },
  {
    id: 'opportunity',
    label: 'Opportunity',
    shortLabel: 'Opp',
    description: 'Market scanning & opportunity screening',
    color: '#7c5cff',
    accent: '#a78bfa',
    icon: 'telescope',
    order: 1,
    route: '/opportunity',
    realAvailable: true,
  },
  {
    id: 'add-venture',
    label: 'Add-Venture',
    shortLabel: 'AddV',
    description: 'Dossier, business model, narrative, roadmap',
    color: '#22d3ee',
    accent: '#67e8f9',
    icon: 'lightbulb',
    order: 2,
    route: '/add-venture',
    realAvailable: true,
  },
  {
    id: 'brand-aid',
    label: 'Brand-Aid',
    shortLabel: 'Brand',
    description: 'Naming, moodboard, visual system, brand book',
    color: '#f472b6',
    accent: '#f9a8d4',
    icon: 'palette',
    order: 3,
    route: '/brand-aid',
    realAvailable: false,
  },
  {
    id: 'builder',
    label: 'Builder',
    shortLabel: 'Build',
    description: 'Product scaffolding, BDD, QA, security',
    color: '#f59e0b',
    accent: '#fbbf24',
    icon: 'hammer',
    order: 4,
    route: '/builder',
    realAvailable: false,
  },
  {
    id: 'gtm',
    label: 'GTM',
    shortLabel: 'GTM',
    description: 'Go-to-market, experiments, campaigns',
    color: '#22c55e',
    accent: '#4ade80',
    icon: 'rocket',
    order: 5,
    route: '/gtm',
    realAvailable: false,
  },
  {
    id: 'startup-ops',
    label: 'Startup-Ops',
    shortLabel: 'Ops',
    description: 'Operations, compliance, vendors',
    color: '#06b6d4',
    accent: '#22d3ee',
    icon: 'settings-2',
    order: 6,
    route: '/startup-ops',
    realAvailable: false,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    shortLabel: 'Port',
    description: 'Cross-venture portfolio analytics',
    color: '#ef4444',
    accent: '#f87171',
    icon: 'layout-grid',
    order: 7,
    route: '/portfolio',
    realAvailable: false,
  },
  {
    id: 'bruce-memory',
    label: 'Bruce-Memory',
    shortLabel: 'Mem',
    description: 'Patterns, cross-venture insights, retrieval',
    color: '#a855f7',
    accent: '#c084fc',
    icon: 'brain',
    order: 8,
    route: '/bruce-memory',
    realAvailable: false,
  },
];

export function getModuleMeta(id: ModuleId): ModuleMeta {
  return MODULE_REGISTRY.find((m) => m.id === id)!;
}
