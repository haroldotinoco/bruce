import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ENV } from '../../core/config/env.types';
import type { DataSourceMode, ModuleId } from '../../core/config/env.types';
import { MODULE_REGISTRY } from '../../core/config/module-registry';
import { TokenService } from '../../core/auth/token.service';
import { DataModeService } from '../../core/data-sources/data-mode.service';
import { ApiService } from '../../core/http/api.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { ToastService } from '../../shared/ui/toast.service';

type HealthState = 'idle' | 'checking' | 'ok' | 'error';

interface ModuleHealthRow {
  id: ModuleId;
  label: string;
  baseUrl: string;
  mode: DataSourceMode;
  state: HealthState;
  latency_ms: number | null;
  detail: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Settings"
      eyebrow="System"
      icon="settings"
      subtitle="Authentication, data source toggles, theme, and build info."
    ></app-page-header>

    <div class="grid">
      <app-section-card title="Authentication" icon="key-round" hint="Bearer token for api-gateway">
        <div class="row">
          <label class="muted small">JWT (Bearer)</label>
          <textarea
            class="input"
            [value]="tokenDraft()"
            (input)="onTokenInput($event)"
            rows="3"
            placeholder="eyJhbGciOi…"
          ></textarea>
        </div>
        <div class="actions">
          <button class="btn primary" (click)="saveToken()">
            <lucide-icon name="save" [size]="14"></lucide-icon> Save
          </button>
          <button class="btn ghost" (click)="clearToken()" *ngIf="tokenSvc.hasToken()">
            <lucide-icon name="trash-2" [size]="14"></lucide-icon> Clear
          </button>
          <div class="status" *ngIf="tokenSvc.hasToken()">
            <span class="dot ok"></span>
            <span class="muted small">Stored: {{ tokenSvc.masked() }}</span>
          </div>
          <div class="status" *ngIf="!tokenSvc.hasToken()">
            <span class="dot warn"></span>
            <span class="muted small">No token set</span>
          </div>
        </div>
        <div class="tip muted small">
          Tip: generate a dev JWT via <code>node scripts/print-dev-jwt.mjs</code>. The token is persisted
          locally and attached to every request to the api-gateway.
        </div>
      </app-section-card>

      <app-section-card title="Theme" icon="palette" hint="Dark-first, light optional">
        <div class="theme">
          <button class="btn" [class.primary]="theme() === 'dark'" (click)="setTheme('dark')">
            <lucide-icon name="moon" [size]="14"></lucide-icon> Dark
          </button>
          <button class="btn" [class.primary]="theme() === 'light'" (click)="setTheme('light')">
            <lucide-icon name="sun" [size]="14"></lucide-icon> Light
          </button>
        </div>
      </app-section-card>

      <app-section-card title="Data sources" icon="database" hint="Switch any module between live and mock">
        <div class="ds">
          <div class="ds-row head muted small">
            <span>Module</span>
            <span>Base URL</span>
            <span>Mode</span>
            <span>Health</span>
            <span>Latency</span>
            <span></span>
          </div>
          <div class="ds-row" *ngFor="let r of rows()">
            <span class="mod">
              <lucide-icon [name]="moduleIcon(r.id)" [size]="14"></lucide-icon>
              {{ r.label }}
            </span>
            <span class="mono small">{{ r.baseUrl }}</span>
            <span>
              <div class="toggle" role="group">
                <button
                  type="button"
                  class="seg"
                  [class.active]="r.mode === 'real'"
                  (click)="setMode(r.id, 'real')"
                  [disabled]="!moduleHasReal(r.id)"
                  [title]="moduleHasReal(r.id) ? 'Use live backend' : 'Real provider not implemented yet'"
                >
                  LIVE
                </button>
                <button
                  type="button"
                  class="seg"
                  [class.active]="r.mode === 'mock'"
                  (click)="setMode(r.id, 'mock')"
                >
                  MOCK
                </button>
              </div>
            </span>
            <span>
              <app-status-badge
                [status]="r.state === 'ok' ? 'completed' : r.state === 'error' ? 'failed' : r.state === 'checking' ? 'running' : 'queued'"
                [label]="r.state === 'ok' ? 'healthy' : r.state === 'error' ? 'down' : r.state === 'checking' ? 'checking…' : 'idle'"
              ></app-status-badge>
            </span>
            <span class="mono small">
              <ng-container *ngIf="r.latency_ms !== null">{{ r.latency_ms }}ms</ng-container>
              <ng-container *ngIf="r.latency_ms === null">—</ng-container>
            </span>
            <span>
              <button class="btn ghost xs" (click)="checkHealth(r)">
                <lucide-icon name="activity" [size]="12"></lucide-icon> Check
              </button>
            </span>
          </div>
        </div>
        <div class="actions">
          <button class="btn" (click)="checkAll()">
            <lucide-icon name="radar" [size]="14"></lucide-icon> Check all
          </button>
          <button class="btn ghost" (click)="resetOverrides()">
            <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon> Reset to defaults
          </button>
          <span class="muted small">
            Overrides are stored in <code>localStorage</code> and applied on next navigation.
          </span>
        </div>
      </app-section-card>

      <app-section-card title="OpenRouter catalog" icon="cpu" hint="sync models into Postgres">
        <p class="muted small">
          Fetches the full model list from OpenRouter (same as dev stack after migrate). Requires a valid token
          and running bruce-core.
        </p>
        <div class="actions">
          <button class="btn primary" type="button" (click)="syncOpenRouterModels()" [disabled]="syncBusy()">
            <lucide-icon name="refresh-cw" [size]="14"></lucide-icon>
            {{ syncBusy() ? 'Syncing…' : 'Refresh model catalog' }}
          </button>
        </div>
        <p class="muted small mono" *ngIf="syncLast()">{{ syncLast() }}</p>
      </app-section-card>

      <app-section-card title="Build info" icon="info">
        <dl class="kv">
          <dt>App version</dt>
          <dd class="mono">{{ env.appVersion }}</dd>
          <dt>Production</dt>
          <dd class="mono">{{ env.production }}</dd>
          <dt>Gateway</dt>
          <dd class="mono">{{ env.gatewayBaseUrl }}</dd>
          <dt>User Agent</dt>
          <dd class="mono small">{{ ua() }}</dd>
        </dl>
      </app-section-card>
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 960px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
      .row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      textarea.input {
        width: 100%;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        resize: vertical;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        flex-wrap: wrap;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .dot.ok {
        background: var(--ok);
        box-shadow: 0 0 10px var(--ok);
      }
      .dot.warn {
        background: var(--warn);
      }
      .tip {
        margin-top: 10px;
      }
      code {
        background: var(--bg-2);
        padding: 1px 4px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
      }
      .ds {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ds-row {
        display: grid;
        grid-template-columns: 1.3fr 1.8fr 1.1fr 1.1fr 0.7fr 0.8fr;
        align-items: center;
        gap: 8px;
        padding: 10px 10px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 12px;
      }
      .ds-row.head {
        background: transparent;
        border: none;
        padding: 0 10px;
      }
      .mod {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
      .toggle {
        display: inline-flex;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 999px;
        overflow: hidden;
      }
      .seg {
        background: transparent;
        border: none;
        color: var(--fg-2);
        padding: 4px 10px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.05em;
        cursor: pointer;
      }
      .seg.active {
        background: var(--accent);
        color: #fff;
      }
      .seg:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .theme {
        display: flex;
        gap: 8px;
      }
      .btn.xs {
        padding: 3px 6px;
        font-size: 10px;
      }
      .kv {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 6px 16px;
        margin: 0;
      }
      .kv dt {
        color: var(--fg-2);
        font-size: 12px;
      }
      .kv dd {
        margin: 0;
      }
      .mono {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
    `,
  ],
})
export class SettingsComponent {
  readonly env = inject(ENV);
  readonly tokenSvc = inject(TokenService);
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly modeSvc = inject(DataModeService);

  readonly syncBusy = signal(false);
  readonly syncLast = signal<string | null>(null);

  readonly tokenDraft = signal<string>(this.tokenSvc.token() ?? '');
  readonly theme = signal<'dark' | 'light'>(this.readTheme());
  readonly ua = computed(() => (typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a'));

  readonly rows = signal<ModuleHealthRow[]>(
    MODULE_REGISTRY.map((m) => ({
      id: m.id,
      label: m.label,
      baseUrl: this.env.moduleBaseUrls[m.id],
      mode: this.currentMode(m.id),
      state: 'idle',
      latency_ms: null,
      detail: '',
    }))
  );

  moduleHasReal(id: ModuleId): boolean {
    return !!MODULE_REGISTRY.find((m) => m.id === id)?.realAvailable;
  }

  moduleIcon(id: ModuleId): string {
    return MODULE_REGISTRY.find((m) => m.id === id)?.icon ?? 'box';
  }

  onTokenInput(ev: Event) {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.tokenDraft.set(v);
  }

  saveToken() {
    this.tokenSvc.set(this.tokenDraft());
    this.refreshRows();
    if (this.tokenSvc.hasToken()) {
      this.toast.success('Token saved', 'Live data sources are now enabled.');
    } else {
      this.toast.warn('Token cleared', 'Live modules will fall back to mock.');
    }
  }

  clearToken() {
    this.tokenSvc.clear();
    this.tokenDraft.set('');
    this.refreshRows();
    this.toast.info('Token cleared');
  }

  private refreshRows() {
    this.rows.update((rows) =>
      rows.map((r) => ({ ...r, mode: this.modeSvc.resolvedFor(r.id) }))
    );
  }

  setTheme(t: 'dark' | 'light') {
    this.theme.set(t);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset['theme'] = t;
      try {
        window.localStorage.setItem('bruce.theme', t);
      } catch {}
    }
  }

  private readTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem('bruce.theme');
    return stored === 'light' ? 'light' : 'dark';
  }

  private currentMode(id: ModuleId): DataSourceMode {
    return this.modeSvc.resolvedFor(id);
  }

  setMode(id: ModuleId, mode: DataSourceMode) {
    if (mode === 'real' && !this.moduleHasReal(id)) {
      this.toast.warn('Not available', `Real data source not implemented for ${id}.`);
      return;
    }
    this.modeSvc.setOverride(id, mode);
    this.rows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, mode: this.modeSvc.resolvedFor(id) } : r))
    );
    this.toast.info(`${id} → ${mode}`, 'Live across the app.');
  }

  resetOverrides() {
    this.modeSvc.reset();
    this.rows.update((rows) =>
      rows.map((r) => ({ ...r, mode: this.modeSvc.resolvedFor(r.id) }))
    );
    this.toast.success('Overrides cleared');
  }

  async checkAll() {
    await Promise.all(this.rows().map((r) => this.checkHealth(r)));
  }

  async syncOpenRouterModels() {
    this.syncBusy.set(true);
    try {
      const r = await firstValueFrom(
        this.api.post<{ upserted: number; synced_at: string }>(
          'bruce-core',
          '/admin/openrouter/models/sync',
          {},
        ),
      );
      this.syncLast.set(`Upserted ${r.upserted} models · ${r.synced_at}`);
      this.toast.success('OpenRouter catalog updated', `${r.upserted} models`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      this.toast.error('OpenRouter sync failed', msg);
    } finally {
      this.syncBusy.set(false);
    }
  }

  async checkHealth(row: ModuleHealthRow) {
    this.rows.update((rows) =>
      rows.map((r) => (r.id === row.id ? { ...r, state: 'checking', latency_ms: null } : r))
    );
    const start = performance.now();
    try {
      const url = `${this.env.gatewayBaseUrl}/services/${row.id}/health`;
      await firstValueFrom(this.http.get(url, { responseType: 'text' }));
      const latency = Math.round(performance.now() - start);
      this.rows.update((rows) =>
        rows.map((r) => (r.id === row.id ? { ...r, state: 'ok', latency_ms: latency } : r))
      );
    } catch (err: unknown) {
      const latency = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : 'failed';
      this.rows.update((rows) =>
        rows.map((r) =>
          r.id === row.id ? { ...r, state: 'error', latency_ms: latency, detail: msg } : r
        )
      );
    }
  }
}
