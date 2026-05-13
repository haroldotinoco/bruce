import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MODULE_REGISTRY } from '../core/config/module-registry';
import { DataModeService } from '../core/data-sources/data-mode.service';
import { DashboardPrefsService } from '../core/config/dashboard-prefs.service';
import type { ModuleId } from '../core/config/env.types';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  accent?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sb" [class.sb--collapsed]="prefs.sidebarCollapsed()">
      <div class="sb-brand-row">
        <a class="sb-brand" routerLink="/overview">
          <div class="brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                stroke="url(#brandGrad)"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path d="M8 10.5L12 8.5L16 10.5M12 12V17" stroke="url(#brandGrad)" stroke-width="1.6" stroke-linecap="round" />
              <defs>
                <linearGradient id="brandGrad" x1="0" x2="24" y1="0" y2="24">
                  <stop stop-color="#7c5cff" />
                  <stop offset="1" stop-color="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">BruceAI</span>
            <span class="brand-sub">Venture platform</span>
          </div>
        </a>
        <button
          type="button"
          class="sb-collapse"
          [title]="prefs.sidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          (click)="prefs.toggleSidebarCollapsed()"
        >
          <lucide-icon [name]="prefs.sidebarCollapsed() ? 'panel-left-open' : 'panel-left-close'" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="sb-prefs">
        <label
          class="sb-auto"
          [title]="
            prefs.autoRefreshEnabled()
              ? 'Poll workflows and jobs every 10s (off = manual refresh only)'
              : 'Auto-refresh off — turn on to poll every 10s'
          "
        >
          <input
            type="checkbox"
            [checked]="prefs.autoRefreshEnabled()"
            (change)="prefs.toggleAutoRefresh()"
          />
          <span class="sb-auto-label">Auto-refresh</span>
          <lucide-icon class="sb-auto-icon" name="refresh-cw" [size]="14"></lucide-icon>
        </label>
      </div>

      <div class="sb-section">
        <div class="sb-heading">Command center</div>
        <a
          *ngFor="let item of topNav"
          class="sb-item"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.route === '/overview' }"
          [attr.title]="item.label"
        >
          <lucide-icon [name]="item.icon" [size]="16"></lucide-icon>
          <span>{{ item.label }}</span>
        </a>
      </div>

      <div class="sb-section">
        <div class="sb-heading">Modules</div>
        <a
          *ngFor="let m of modules"
          class="sb-item module"
          [routerLink]="m.route"
          routerLinkActive="active"
          [style.--mod-accent]="m.accent"
          [attr.title]="m.label"
        >
          <lucide-icon [name]="m.icon" [size]="16"></lucide-icon>
          <span>{{ m.label }}</span>
          <span
            class="sb-badge"
            [class.live]="isLive(m.id)"
            [class.fallback]="isFallback(m.id)"
            [title]="isFallback(m.id) ? 'Real backend configured but no token — falling back to mock' : ''"
          >
            {{ isLive(m.id) ? 'LIVE' : 'MOCK' }}
          </span>
        </a>
      </div>

      <div class="sb-section">
        <div class="sb-heading">System</div>
        <a
          *ngFor="let item of systemNav"
          class="sb-item"
          [routerLink]="item.route"
          routerLinkActive="active"
          [attr.title]="item.label"
        >
          <lucide-icon [name]="item.icon" [size]="16"></lucide-icon>
          <span>{{ item.label }}</span>
        </a>
      </div>

      <div class="sb-foot">
        <div class="env-chip">
          <span class="dot"></span>
          local · dev
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      .sb {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        background: var(--bg-1);
        border-right: 1px solid var(--border);
        padding: 16px 12px 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .sb-brand-row {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        padding: 8px 10px 14px;
        border-bottom: 1px solid var(--border);
      }
      .sb-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
        text-decoration: none;
        color: var(--fg-0);
      }
      .sb-collapse {
        flex-shrink: 0;
        margin-top: 2px;
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--bg-2);
        color: var(--fg-1);
        cursor: pointer;
        transition: background 0.12s, color 0.12s;
      }
      .sb-collapse:hover {
        background: var(--bg-3);
        color: var(--fg-0);
      }
      .sb-prefs {
        padding: 0 10px 10px;
        border-bottom: 1px solid var(--border);
      }
      .sb-auto {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: var(--fg-1);
        user-select: none;
      }
      .sb-auto input {
        accent-color: var(--accent);
        width: 14px;
        height: 14px;
        margin: 0;
        flex-shrink: 0;
      }
      .sb-auto-label {
        flex: 1;
      }
      .sb-auto-icon {
        color: var(--fg-2);
        flex-shrink: 0;
      }
      .sb--collapsed .sb-prefs {
        padding: 0 6px 8px;
      }
      .sb--collapsed .sb-auto {
        justify-content: center;
      }
      .sb--collapsed .sb-auto-label,
      .sb--collapsed .sb-auto input {
        display: none;
      }
      .sb--collapsed .sb-auto-icon {
        display: block;
        color: var(--fg-1);
      }
      .sb--collapsed .brand-text,
      .sb--collapsed .sb-heading,
      .sb--collapsed .sb-item > span:not(.sb-badge),
      .sb--collapsed .sb-badge,
      .sb--collapsed .env-chip {
        display: none;
      }
      .sb--collapsed .sb-brand-row {
        flex-direction: column;
        align-items: center;
        padding-left: 8px;
        padding-right: 8px;
        gap: 8px;
      }
      .sb--collapsed .sb-collapse {
        width: 28px;
        height: 28px;
        margin-top: 0;
      }
      .sb--collapsed .sb-item {
        justify-content: center;
        padding-left: 8px;
        padding-right: 8px;
      }
      .sb--collapsed .brand-logo {
        margin: 0 auto;
      }
      .brand-logo {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        display: grid;
        place-items: center;
      }
      .brand-name {
        font-family: 'Inter Tight', Inter, sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
        font-size: 15px;
        display: block;
        line-height: 1.1;
      }
      .brand-sub {
        display: block;
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--fg-2);
      }
      .sb-section {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .sb-heading {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--fg-2);
        padding: 8px 10px 6px;
      }
      .sb-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        color: var(--fg-1);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        position: relative;
        transition:
          background 0.1s,
          color 0.1s;
      }
      .sb-item:hover {
        background: var(--bg-2);
        color: var(--fg-0);
      }
      .sb-item.active {
        background: var(--bg-2);
        color: var(--fg-0);
      }
      .sb-item.module.active::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 8px;
        bottom: 8px;
        width: 3px;
        border-radius: 3px;
        background: var(--mod-accent, var(--accent));
      }
      .sb-badge {
        margin-left: auto;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 2px 5px;
        border-radius: 4px;
        background: var(--bg-3);
        color: var(--fg-2);
      }
      .sb-badge.live {
        color: var(--ok);
        background: rgba(34, 197, 94, 0.1);
      }
      .sb-badge.fallback {
        color: var(--warn);
        background: rgba(245, 158, 11, 0.1);
        position: relative;
      }
      .sb-badge.fallback::after {
        content: '';
        position: absolute;
        top: -2px;
        right: -2px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--warn);
        box-shadow: 0 0 6px var(--warn);
      }
      .sb-foot {
        margin-top: auto;
        padding-top: 14px;
        border-top: 1px solid var(--border);
      }
      .env-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--fg-1);
        background: var(--bg-2);
        padding: 4px 10px;
        border-radius: 999px;
      }
      .env-chip .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ok);
        box-shadow: 0 0 8px var(--ok);
      }
      @media (max-width: 980px) {
        .sb {
          padding: 12px 6px;
        }
        .brand-text,
        .sb-heading,
        .sb-item span,
        .sb-badge,
        .env-chip {
          display: none;
        }
        .sb-item {
          justify-content: center;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly mode = inject(DataModeService);
  readonly prefs = inject(DashboardPrefsService);

  readonly topNav: NavItem[] = [
    { label: 'Overview', icon: 'layout-dashboard', route: '/overview' },
    { label: 'Ventures', icon: 'compass', route: '/ventures' },
    { label: 'Runs', icon: 'activity', route: '/runs' },
    { label: 'Agents', icon: 'bot', route: '/agents' },
  ];

  readonly modules = [...MODULE_REGISTRY].sort((a, b) => a.order - b.order);

  readonly systemNav: NavItem[] = [{ label: 'Settings', icon: 'settings', route: '/settings' }];

  isLive(id: ModuleId): boolean {
    return this.mode.isLive(id);
  }

  isFallback(id: ModuleId): boolean {
    return this.mode.isFallback(id);
  }
}
