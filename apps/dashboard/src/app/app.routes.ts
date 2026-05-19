import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  {
    path: 'overview',
    loadComponent: () =>
      import('./features/overview/overview.component').then((m) => m.OverviewComponent),
  },
  {
    path: 'ventures',
    loadComponent: () =>
      import('./features/ventures/ventures.component').then((m) => m.VenturesComponent),
  },
  {
    path: 'opportunity',
    loadComponent: () =>
      import('./features/opportunity/scans-list.component').then((m) => m.ScansListComponent),
  },
  {
    path: 'opportunity/scans/:id',
    loadComponent: () =>
      import('./features/opportunity/scan-detail.component').then((m) => m.ScanDetailComponent),
  },
  {
    path: 'add-venture',
    loadComponent: () =>
      import('./features/add-venture/add-venture.component').then((m) => m.AddVentureComponent),
  },
  {
    path: 'brand-aid',
    loadComponent: () =>
      import('./features/brand-aid/brand-aid.component').then((m) => m.BrandAidComponent),
  },
  {
    path: 'brand-aid/package/:packageId',
    loadComponent: () =>
      import('./features/brand-aid/brand-aid-package-detail.component').then(
        (m) => m.BrandAidPackageDetailComponent,
      ),
  },
  {
    path: 'builder',
    loadComponent: () =>
      import('./features/builder/builder.component').then((m) => m.BuilderComponent),
  },
  {
    path: 'gtm',
    loadComponent: () => import('./features/gtm/gtm.component').then((m) => m.GtmComponent),
  },
  {
    path: 'startup-ops',
    loadComponent: () =>
      import('./features/startup-ops/startup-ops.component').then((m) => m.StartupOpsComponent),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./features/portfolio/portfolio.component').then((m) => m.PortfolioComponent),
  },
  {
    path: 'bruce-memory',
    loadComponent: () =>
      import('./features/bruce-memory/bruce-memory.component').then((m) => m.BruceMemoryComponent),
  },
  {
    path: 'bruce-core',
    loadComponent: () =>
      import('./features/bruce-core/bruce-core.component').then((m) => m.BruceCoreComponent),
  },
  {
    path: 'runs',
    loadComponent: () => import('./features/runs/runs.component').then((m) => m.RunsComponent),
  },
  {
    path: 'agents',
    loadComponent: () =>
      import('./features/agents/agents.component').then((m) => m.AgentsComponent),
  },
  {
    path: 'workflow/:moduleId/:workflowId',
    loadComponent: () =>
      import('./features/workflow/workflow-detail.component').then(
        (m) => m.WorkflowDetailComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '**', redirectTo: 'overview' },
];
