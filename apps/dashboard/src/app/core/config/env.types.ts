import { InjectionToken } from '@angular/core';

export type ModuleId =
  | 'bruce-core'
  | 'opportunity'
  | 'add-venture'
  | 'brand-aid'
  | 'builder'
  | 'gtm'
  | 'startup-ops'
  | 'portfolio'
  | 'bruce-memory';

export type DataSourceMode = 'real' | 'mock';

export type ModuleDataSourceMap = Record<ModuleId, DataSourceMode>;

export interface EnvConfig {
  production: boolean;
  appVersion: string;
  gatewayBaseUrl: string;
  moduleBaseUrls: Record<ModuleId, string>;
  moduleDataSources: ModuleDataSourceMap;
}

export const ENV = new InjectionToken<EnvConfig>('ENV');
