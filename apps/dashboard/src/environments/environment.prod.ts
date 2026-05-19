import type { ModuleDataSourceMap, EnvConfig } from '../app/core/config/env.types';

export const environment: EnvConfig = {
  production: true,
  appVersion: '0.1.0',
  gatewayBaseUrl: 'http://localhost:3010',
  moduleBaseUrls: {
    'bruce-core': 'http://localhost:3000',
    opportunity: 'http://localhost:3002',
    'add-venture': 'http://localhost:3003',
    'brand-aid': 'http://localhost:3004',
    builder: 'http://localhost:3005',
    gtm: 'http://localhost:3006',
    'startup-ops': 'http://localhost:3007',
    portfolio: 'http://localhost:3008',
    'bruce-memory': 'http://localhost:3009',
  },
  moduleDataSources: <ModuleDataSourceMap>{
    opportunity: 'real',
    'bruce-core': 'mock',
    'add-venture': 'real',
    'brand-aid': 'real',
    builder: 'mock',
    gtm: 'mock',
    'startup-ops': 'mock',
    portfolio: 'mock',
    'bruce-memory': 'mock',
  },
};
