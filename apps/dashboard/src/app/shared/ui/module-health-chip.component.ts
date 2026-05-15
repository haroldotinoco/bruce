import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { ModuleHealth } from '../../core/models';
import type { ModuleMeta } from '../../core/config/module-registry';
import { getModuleRuntimeReadiness, readinessLabel } from '../../core/config/module-readiness';
import { RelativeTimePipe } from '../pipes/relative-time.pipe';

@Component({
  selector: 'app-module-health-chip',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="mh" [routerLink]="module.route" [style.--mh-accent]="module.accent" [title]="readinessTooltip">
      <div class="mh-head">
        <div class="mh-name">
          <lucide-icon [name]="module.icon" [size]="14"></lucide-icon>
          {{ module.label }}
        </div>
        <div class="mh-dot" [attr.data-status]="health?.status ?? 'idle'"></div>
      </div>
      <div class="mh-meta" *ngIf="health">
        <span>{{ health.jobs24h }} jobs 24h</span>
        <span *ngIf="health.failures24h" class="err">· {{ health.failures24h }} failed</span>
      </div>
      <div class="mh-sub" *ngIf="health?.lastRunAt">last run {{ health!.lastRunAt | relativeTime }}</div>
      <div class="mh-badge" [attr.data-state]="readiness.state">{{ readinessLabel(readiness.state) }}</div>
      <div class="mh-readiness muted">
        dashboard {{ readiness.dashboardDataSource }} · eval {{ readiness.evalCoverage }}
      </div>
    </a>
  `,
  styles: [
    `
      .mh {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px 14px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: var(--r-md);
        color: var(--fg-0);
        text-decoration: none;
        position: relative;
        transition:
          border-color 0.15s,
          transform 0.15s;
        min-height: 84px;
      }
      .mh:hover {
        border-color: var(--border-strong);
        transform: translateY(-1px);
      }
      .mh::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        border-radius: var(--r-md) 0 0 var(--r-md);
        background: var(--mh-accent, var(--accent));
        opacity: 0.55;
      }
      .mh-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .mh-name {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
      }
      .mh-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-2);
      }
      .mh-dot[data-status='ok'] {
        background: var(--ok);
        box-shadow: 0 0 8px var(--ok);
      }
      .mh-dot[data-status='degraded'] {
        background: var(--warn);
        box-shadow: 0 0 8px var(--warn);
      }
      .mh-dot[data-status='down'] {
        background: var(--err);
        box-shadow: 0 0 8px var(--err);
      }
      .mh-meta {
        color: var(--fg-1);
        font-size: 12px;
      }
      .mh-meta .err {
        color: var(--err);
      }
      .mh-sub {
        color: var(--fg-2);
        font-size: 11px;
      }
      .mh-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--fg-2);
        background: var(--bg-2);
        padding: 2px 6px;
        border-radius: 999px;
        text-transform: uppercase;
      }
      .mh-badge[data-state='live'] {
        color: var(--ok);
        background: rgba(34, 197, 94, 0.1);
      }
      .mh-badge[data-state='partial'] {
        color: var(--warn);
        background: rgba(245, 158, 11, 0.1);
      }
      .mh-readiness {
        margin-top: auto;
        font-size: 10px;
      }
      .muted {
        color: var(--fg-2);
      }
    `,
  ],
})
export class ModuleHealthChipComponent {
  @Input() module!: ModuleMeta;
  @Input() health?: ModuleHealth;

  readonly readinessLabel = readinessLabel;

  get readiness() {
    return getModuleRuntimeReadiness(this.module.id);
  }

  get readinessTooltip(): string {
    const r = this.readiness;
    return [
      r.summary,
      `Navigation: ${r.navigation}`,
      `HTTP health: ${r.httpHealth}`,
      `Workflow routes: ${r.workflowRoutes}`,
      `Temporal worker: ${r.temporalWorker}`,
      `Event worker: ${r.eventWorker}`,
      `Manifest: ${r.manifestCompleteness}`,
    ].join('\n');
  }
}
