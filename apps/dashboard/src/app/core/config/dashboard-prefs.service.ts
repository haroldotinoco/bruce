import { Injectable, signal } from '@angular/core';

const LS_SIDEBAR = 'bruce.dashboard.sidebarCollapsed';
const LS_AUTO_REFRESH = 'bruce.dashboard.autoRefresh';

@Injectable({ providedIn: 'root' })
export class DashboardPrefsService {
  private readonly sidebarCollapsedSig = signal(false);
  private readonly autoRefreshSig = signal(true);

  readonly sidebarCollapsed = this.sidebarCollapsedSig.asReadonly();
  readonly autoRefreshEnabled = this.autoRefreshSig.asReadonly();

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    try {
      if (localStorage.getItem(LS_SIDEBAR) === '1') {
        this.sidebarCollapsedSig.set(true);
      }
      if (localStorage.getItem(LS_AUTO_REFRESH) === '0') {
        this.autoRefreshSig.set(false);
      }
    } catch {
      /* private mode / no storage */
    }
  }

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsedSig.update((v) => !v);
    try {
      localStorage.setItem(LS_SIDEBAR, this.sidebarCollapsedSig() ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  setAutoRefresh(enabled: boolean): void {
    this.autoRefreshSig.set(enabled);
    try {
      localStorage.setItem(LS_AUTO_REFRESH, enabled ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  toggleAutoRefresh(): void {
    this.setAutoRefresh(!this.autoRefreshSig());
  }
}
