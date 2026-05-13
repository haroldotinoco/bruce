import { Provider } from '@angular/core';
import type { DataSourceMode, ModuleId } from '../config/env.types';
import {
  OPPORTUNITY_DS,
  BRUCE_CORE_DS,
  ADD_VENTURE_DS,
  BRAND_AID_DS,
  BUILDER_DS,
  GTM_DS,
  STARTUP_OPS_DS,
  PORTFOLIO_DS,
  BRUCE_MEMORY_DS,
  METRICS_DS,
  RUNS_DS,
  AGENTS_DS,
  WORKFLOW_DS,
} from './tokens';
import { OpportunityDataSourceRouter } from './opportunity.router';
import { AddVentureDataSourceRouter } from './add-venture.router';
import { WorkflowDataSourceRouter } from './workflow.router';
import { BruceCoreMockDataSource } from '../../mocks/factories/ventures.mock';
import {
  AddVentureMockDataSource,
  BrandAidMockDataSource,
  BuilderMockDataSource,
  GtmMockDataSource,
  StartupOpsMockDataSource,
  PortfolioMockDataSource,
  BruceMemoryMockDataSource,
} from '../../mocks/factories/modules-content.mock';
import { MetricsMockDataSource } from '../../mocks/factories/metrics.mock';
import { RunsMockDataSource } from '../../mocks/factories/runs.mock';
import { AgentsManifestDataSource } from '../../mocks/factories/agents.mock';

export const STORAGE_OVERRIDES_KEY = 'bruce.moduleDataSources.overrides';
export type { DataSourceMode, ModuleId };

export const dataSourceProviders: Provider[] = [
  { provide: OPPORTUNITY_DS, useExisting: OpportunityDataSourceRouter },
  { provide: BRUCE_CORE_DS, useExisting: BruceCoreMockDataSource },
  { provide: ADD_VENTURE_DS, useExisting: AddVentureDataSourceRouter },
  { provide: BRAND_AID_DS, useExisting: BrandAidMockDataSource },
  { provide: BUILDER_DS, useExisting: BuilderMockDataSource },
  { provide: GTM_DS, useExisting: GtmMockDataSource },
  { provide: STARTUP_OPS_DS, useExisting: StartupOpsMockDataSource },
  { provide: PORTFOLIO_DS, useExisting: PortfolioMockDataSource },
  { provide: BRUCE_MEMORY_DS, useExisting: BruceMemoryMockDataSource },
  { provide: METRICS_DS, useExisting: MetricsMockDataSource },
  { provide: RUNS_DS, useExisting: RunsMockDataSource },
  { provide: AGENTS_DS, useExisting: AgentsManifestDataSource },
  { provide: WORKFLOW_DS, useExisting: WorkflowDataSourceRouter },
];
