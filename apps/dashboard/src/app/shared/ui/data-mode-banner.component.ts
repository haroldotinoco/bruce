import { ChangeDetectionStrategy, Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DataModeService } from '../../core/data-sources/data-mode.service';
import type { ModuleId } from '../../core/config/env.types';
import { MODULE_REGISTRY } from '../../core/config/module-registry';

@Component({
  selector: 'app-data-mode-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="banner" *ngIf="visible()" [attr.data-kind]="kind()">
      <div class="left">
        <div class="ic">
          <lucide-icon [name]="icon()" [size]="14"></lucide-icon>
        </div>
        <div class="msg">
          <strong>{{ title() }}</strong>
          <span class="muted">{{ message() }}</span>
        </div>
      </div>
      <a class="cta" routerLink="/settings">
        <lucide-icon name="key-round" [size]="12"></lucide-icon>
        Go to Settings
      </a>
    </div>
  `,
  styles: [
    `
      .banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 10px;
        margin-bottom: 16px;
        background: linear-gradient(90deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02));
        border: 1px solid rgba(245, 158, 11, 0.25);
        position: relative;
        overflow: hidden;
      }
      .banner[data-kind='live'] {
        background: linear-gradient(90deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02));
        border-color: rgba(34, 197, 94, 0.25);
      }
      .banner::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(600px circle at 0% 50%, rgba(245, 158, 11, 0.08), transparent 40%);
        pointer-events: none;
      }
      .banner[data-kind='live']::before {
        background: radial-gradient(600px circle at 0% 50%, rgba(34, 197, 94, 0.08), transparent 40%);
      }
      .left {
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1;
      }
      .ic {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: rgba(245, 158, 11, 0.15);
        color: var(--warn);
      }
      .banner[data-kind='live'] .ic {
        background: rgba(34, 197, 94, 0.15);
        color: var(--ok);
      }
      .msg {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      strong {
        font-size: 13px;
        font-weight: 600;
        color: var(--fg-0);
      }
      .muted {
        font-size: 12px;
        color: var(--fg-1);
      }
      .cta {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 8px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        color: var(--fg-0);
        font-size: 12px;
        font-weight: 600;
        text-decoration: none;
        z-index: 1;
      }
      .cta:hover {
        background: var(--bg-3);
      }
    `,
  ],
})
export class DataModeBannerComponent {
  @Input({ required: true }) module!: ModuleId;
  @Input() showWhenLive = false;

  private readonly svc = inject(DataModeService);

  readonly live = computed(() => this.svc.isLive(this.module));
  readonly fallback = computed(() => this.svc.isFallback(this.module));

  visible = computed(() => this.fallback() || (this.showWhenLive && this.live()));
  kind = computed(() => (this.live() ? 'live' : 'fallback'));
  icon = computed(() => (this.live() ? 'radio' : 'triangle-alert'));

  title = computed(() => {
    const meta = MODULE_REGISTRY.find((m) => m.id === this.module);
    if (this.live()) return `${meta?.label ?? this.module} · live backend`;
    return 'Showing mock data';
  });

  message = computed(() => {
    if (this.live()) return 'Requests are hitting the real api-gateway.';
    return 'The UI remains visible, but backend data is not live until a token is configured.';
  });
}
