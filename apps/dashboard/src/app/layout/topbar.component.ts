import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TokenService } from '../core/auth/token.service';
import { MODULE_REGISTRY } from '../core/config/module-registry';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="tb">
      <div class="tb-search">
        <lucide-icon name="search" [size]="14"></lucide-icon>
        <input
          type="text"
          placeholder="Jump to venture, module, scan id…"
          [(ngModel)]="query"
          (keydown.enter)="search()"
        />
        <span class="kbd">⌘K</span>
      </div>
      <div class="tb-actions">
        <button class="btn-ghost" (click)="toggleTheme()" title="Toggle theme">
          <lucide-icon [name]="theme() === 'dark' ? 'sun' : 'moon'" [size]="14"></lucide-icon>
        </button>
        <a
          class="tb-token"
          [class.ok]="hasToken()"
          [class.warn]="!hasToken()"
          routerLink="/settings"
          [title]="hasToken() ? 'Token active' : 'No token — real data disabled'"
        >
          <span class="dot"></span>
          <span *ngIf="hasToken()">token · {{ masked() }}</span>
          <span *ngIf="!hasToken()">no token</span>
        </a>
      </div>
    </header>
  `,
  styles: [
    `
      .tb {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 58px;
        padding: 0 32px;
        border-bottom: 1px solid var(--border);
        background: rgba(11, 13, 18, 0.65);
        backdrop-filter: blur(12px);
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .tb-search {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 420px;
        max-width: 50%;
        padding: 6px 10px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--fg-2);
      }
      .tb-search input {
        flex: 1;
        background: transparent;
        border: 0;
        outline: 0;
        color: var(--fg-0);
        font-size: 13px;
      }
      .kbd {
        font-size: 10px;
        color: var(--fg-2);
        background: var(--bg-3);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .tb-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-ghost {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        background: transparent;
        border: 1px solid var(--border);
        color: var(--fg-1);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-ghost:hover {
        color: var(--fg-0);
        background: var(--bg-2);
      }
      .tb-token {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        color: var(--fg-1);
        font-size: 12px;
        text-decoration: none;
      }
      .tb-token.ok {
        color: var(--ok);
      }
      .tb-token.warn {
        color: var(--warn);
      }
      .tb-token .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
      }
      @media (max-width: 980px) {
        .tb {
          padding: 0 16px;
        }
        .tb-search {
          width: auto;
          flex: 1;
        }
      }
    `,
  ],
})
export class TopbarComponent {
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly hasToken = this.tokenService.hasToken;
  readonly masked = this.tokenService.masked;

  query = '';
  readonly theme = signal<'dark' | 'light'>(
    (typeof window !== 'undefined' ? (window.localStorage.getItem('bruce.theme') as 'dark' | 'light') : null) ?? 'dark'
  );

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);
    if (typeof window !== 'undefined') window.localStorage.setItem('bruce.theme', next);
  }

  private applyTheme(mode: 'dark' | 'light') {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', mode);
  }

  search() {
    const q = this.query.trim().toLowerCase();
    if (!q) return;
    const hit = MODULE_REGISTRY.find((m) => m.id.includes(q) || m.label.toLowerCase().includes(q));
    if (hit) {
      this.router.navigateByUrl(hit.route);
      this.query = '';
      return;
    }
    if (q.startsWith('scan_') || q.startsWith('opportunity-')) {
      this.router.navigateByUrl(`/opportunity/scans/${this.query}`);
      this.query = '';
    }
  }
}
