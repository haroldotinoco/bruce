import type { DataSourceMode, ModuleId } from './env.types';

export type ReadinessState = 'live' | 'partial' | 'mock';
export type ReadinessDimension = 'ready' | 'partial' | 'missing' | 'mock';
export type EvalCoverageLevel = 'none' | 'partial' | 'covered';

export interface ModuleRuntimeReadiness {
  id: ModuleId;
  state: ReadinessState;
  navigation: ReadinessDimension;
  httpHealth: ReadinessDimension;
  workflowRoutes: ReadinessDimension;
  temporalWorker: ReadinessDimension;
  eventWorker: ReadinessDimension;
  dashboardDataSource: DataSourceMode;
  manifestCompleteness: ReadinessDimension;
  evalCoverage: EvalCoverageLevel;
  summary: string;
}

export const MODULE_RUNTIME_READINESS: Record<ModuleId, ModuleRuntimeReadiness> = {
  'bruce-core': {
    id: 'bruce-core',
    state: 'partial',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'ready',
    temporalWorker: 'ready',
    eventWorker: 'ready',
    dashboardDataSource: 'mock',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Backend and workers exist, but dashboard content is still mock-backed.',
  },
  opportunity: {
    id: 'opportunity',
    state: 'live',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'ready',
    temporalWorker: 'ready',
    eventWorker: 'partial',
    dashboardDataSource: 'real',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Primary dashboard flow can use the live service when a token is configured.',
  },
  'add-venture': {
    id: 'add-venture',
    state: 'live',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'ready',
    temporalWorker: 'ready',
    eventWorker: 'ready',
    dashboardDataSource: 'real',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Primary dashboard flow can use the live service when a token is configured.',
  },
  'brand-aid': {
    id: 'brand-aid',
    state: 'mock',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'partial',
    temporalWorker: 'partial',
    eventWorker: 'partial',
    dashboardDataSource: 'mock',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Visible in navigation, but dashboard content is mock-backed.',
  },
  builder: {
    id: 'builder',
    state: 'mock',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'partial',
    temporalWorker: 'partial',
    eventWorker: 'partial',
    dashboardDataSource: 'mock',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Visible in navigation, but dashboard content is mock-backed.',
  },
  gtm: {
    id: 'gtm',
    state: 'mock',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'partial',
    temporalWorker: 'partial',
    eventWorker: 'partial',
    dashboardDataSource: 'mock',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Visible in navigation, but dashboard content is mock-backed.',
  },
  'startup-ops': {
    id: 'startup-ops',
    state: 'mock',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'partial',
    temporalWorker: 'partial',
    eventWorker: 'partial',
    dashboardDataSource: 'mock',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Visible in navigation, but dashboard content is mock-backed.',
  },
  portfolio: {
    id: 'portfolio',
    state: 'mock',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'partial',
    temporalWorker: 'partial',
    eventWorker: 'partial',
    dashboardDataSource: 'mock',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Visible in navigation, but dashboard content is mock-backed.',
  },
  'bruce-memory': {
    id: 'bruce-memory',
    state: 'mock',
    navigation: 'ready',
    httpHealth: 'ready',
    workflowRoutes: 'partial',
    temporalWorker: 'partial',
    eventWorker: 'partial',
    dashboardDataSource: 'mock',
    manifestCompleteness: 'partial',
    evalCoverage: 'partial',
    summary: 'Visible in navigation, but dashboard content is mock-backed.',
  },
};

export function getModuleRuntimeReadiness(id: ModuleId): ModuleRuntimeReadiness {
  return MODULE_RUNTIME_READINESS[id];
}

export function readinessLabel(state: ReadinessState): string {
  if (state === 'live') return 'live-ready';
  if (state === 'partial') return 'partial';
  return 'mock-only';
}
