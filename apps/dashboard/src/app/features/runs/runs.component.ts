import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { RUNS_DS } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { MODULE_REGISTRY } from '../../core/config/module-registry';
import type { TemporalRun } from '../../core/models';

@Component({
  selector: 'app-runs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    KpiCardComponent,
    EmptyStateComponent,
    RelativeTimePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Runs"
      eyebrow="Cockpit · mock stream"
      icon="activity"
      subtitle="Temporal-style cockpit. Live stream with per-module status, steps, and durations."
      badge="MOCK"
    ></app-page-header>

    <div class="kpis">
      <app-kpi-card label="Running now" [value]="running().length" icon="play" sparkColor="var(--accent-2)"></app-kpi-card>
      <app-kpi-card label="Completed · 24h" [value]="completed24h()" icon="check" sparkColor="var(--ok)"></app-kpi-card>
      <app-kpi-card label="Failed · 24h" [value]="failed24h()" icon="x" sparkColor="var(--err)"></app-kpi-card>
      <app-kpi-card label="Avg. duration" [value]="avgDurationSec()" suffix="s" icon="clock"></app-kpi-card>
    </div>

    <app-section-card title="Active workflows" icon="workflow">
      <div actions class="filters">
        <select class="input" style="max-width: 160px" [(ngModel)]="moduleFilter">
          <option value="">All modules</option>
          <option *ngFor="let m of modules" [value]="m.id">{{ m.label }}</option>
        </select>
        <select class="input" style="max-width: 160px" [(ngModel)]="statusFilter">
          <option value="">All statuses</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="QUEUED">Queued</option>
        </select>
      </div>

      <div class="runs">
        <ng-container *ngFor="let r of filtered()">
          <div class="run-row" (click)="toggle(r.id)" [class.expanded]="expanded() === r.id">
            <div class="rr-status">
              <app-status-badge [status]="(r.status || '').toLowerCase()"></app-status-badge>
            </div>
            <div class="rr-name">
              <div class="wf">{{ r.workflow_type }}</div>
              <div class="muted small">{{ moduleLabel(r.module) }} · {{ r.id }}</div>
            </div>
            <div class="rr-prog">
              <div class="prog-bar">
                <div
                  class="prog-fill"
                  [style.width.%]="(r.progress ?? 0) * 100"
                  [class.done]="r.status === 'COMPLETED'"
                  [class.fail]="r.status === 'FAILED'"
                ></div>
              </div>
            </div>
            <div class="rr-dur muted small">
              <span *ngIf="r.duration_ms !== null">{{ (r.duration_ms! / 1000) | number: '1.0-1' }}s</span>
              <span *ngIf="r.duration_ms === null">—</span>
            </div>
            <div class="rr-when muted small">{{ r.started_at | relativeTime }}</div>
            <div class="rr-expand">
              <lucide-icon [name]="expanded() === r.id ? 'chevron-down' : 'chevron-right'" [size]="14"></lucide-icon>
            </div>
          </div>
          <div class="rr-detail" *ngIf="expanded() === r.id">
            <div class="steps">
              <div class="step" *ngFor="let s of r.steps ?? []" [attr.data-status]="s.status">
                <span class="dot"></span>
                <span class="name">{{ s.name }}</span>
                <span class="muted small" *ngIf="s.duration_ms">{{ (s.duration_ms / 1000) | number: '1.0-1' }}s</span>
                <span class="muted small" *ngIf="!s.duration_ms && s.status === 'running'">running…</span>
                <span class="muted small" *ngIf="!s.duration_ms && s.status === 'pending'">pending</span>
              </div>
            </div>
          </div>
        </ng-container>
        <app-empty-state
          *ngIf="!filtered().length"
          icon="inbox"
          title="No workflows match filters"
          subtitle="Clear filters above to see all runs."
        ></app-empty-state>
      </div>
    </app-section-card>
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }
      .filters {
        display: flex;
        gap: 8px;
      }
      .runs {
        display: flex;
        flex-direction: column;
      }
      .run-row {
        display: grid;
        grid-template-columns: 110px minmax(220px, 1.5fr) minmax(140px, 1fr) 70px 100px 24px;
        gap: 14px;
        padding: 12px 0;
        border-bottom: 1px solid var(--border);
        align-items: center;
        cursor: pointer;
      }
      .run-row:hover {
        background: var(--bg-2);
      }
      .run-row.expanded {
        background: var(--bg-2);
      }
      .wf {
        font-size: 13px;
        font-weight: 600;
      }
      .prog-bar {
        height: 4px;
        background: var(--bg-2);
        border-radius: 999px;
        overflow: hidden;
      }
      .prog-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
        background-size: 200% 100%;
        animation: mv 1.2s infinite;
        transition: width 0.4s;
      }
      .prog-fill.done {
        background: var(--ok);
        animation: none;
      }
      .prog-fill.fail {
        background: var(--err);
        animation: none;
      }
      @keyframes mv {
        from {
          background-position: 100% 0;
        }
        to {
          background-position: -100% 0;
        }
      }
      .rr-detail {
        padding: 12px 18px 16px;
        background: var(--bg-2);
        border-bottom: 1px solid var(--border);
      }
      .steps {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .step {
        display: grid;
        grid-template-columns: 10px 1fr auto;
        gap: 10px;
        padding: 8px 12px;
        background: var(--bg-1);
        border-radius: 8px;
        align-items: center;
      }
      .step .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-2);
      }
      .step[data-status='running'] .dot {
        background: var(--accent-2);
        box-shadow: 0 0 8px var(--accent-2);
      }
      .step[data-status='done'] .dot {
        background: var(--ok);
      }
      .step[data-status='failed'] .dot {
        background: var(--err);
      }
      .name {
        font-size: 12px;
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
export class RunsComponent implements OnInit, OnDestroy {
  private readonly ds = inject(RUNS_DS);
  private sub?: Subscription;

  readonly runs = signal<TemporalRun[]>([]);
  readonly expanded = signal<string | null>(null);
  readonly modules = MODULE_REGISTRY;
  moduleFilter = '';
  statusFilter = '';

  readonly running = computed(() => this.runs().filter((r) => r.status === 'RUNNING'));
  readonly completed24h = computed(() => this.runs().filter((r) => r.status === 'COMPLETED').length);
  readonly failed24h = computed(() => this.runs().filter((r) => r.status === 'FAILED').length);
  readonly avgDurationSec = computed(() => {
    const d = this.runs().filter((r) => r.duration_ms !== null).map((r) => r.duration_ms!);
    if (!d.length) return 0;
    return Math.round(d.reduce((a, b) => a + b, 0) / d.length / 1000);
  });

  readonly filtered = computed(() =>
    this.runs().filter(
      (r) =>
        (!this.moduleFilter || r.module === this.moduleFilter) &&
        (!this.statusFilter || r.status === this.statusFilter)
    )
  );

  ngOnInit() {
    this.sub = this.ds.streamRuns().subscribe((r) => this.runs.set(r));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggle(id: string) {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  moduleLabel(id: string) {
    return MODULE_REGISTRY.find((m) => m.id === id)?.label ?? id;
  }
}
