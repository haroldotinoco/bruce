import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { STARTUP_OPS_DS, OpsChecklist } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

@Component({
  selector: 'app-startup-ops',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    KpiCardComponent,
    SkeletonComponent,
    WorkflowConstellationCardComponent,
    RelativeTimePipe,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Startup-Ops"
      eyebrow="Module · mock"
      icon="settings-2"
      subtitle="Operations checklists, compliance signals, vendor catalog, and financial hygiene."
      badge="MOCK"
    >
      <div actions>
        <app-module-rollback-button moduleId="startup-ops"></app-module-rollback-button>
      </div>
    </app-page-header>

    <app-workflow-constellation-card moduleId="startup-ops"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Active checklists" [value]="count()" icon="layers"></app-kpi-card>
      <app-kpi-card label="Avg. completion" [value]="avg()" suffix="%" icon="gauge" [delta]="3"></app-kpi-card>
      <app-kpi-card label="Open items" [value]="openItems()" icon="circle-alert"></app-kpi-card>
      <app-kpi-card label="Compliance green" [value]="green()" suffix=" / 5" icon="shield"></app-kpi-card>
    </div>

    <div class="ops-grid">
      <app-section-card title="Operations by venture" icon="layout-grid" style="grid-column: span 2">
        <div class="ops-rows" *ngIf="!loading(); else skel">
          <div class="ops-row" *ngFor="let o of items()">
            <div>
              <div class="name">{{ o.venture_name }}</div>
              <span class="chip cat" [attr.data-cat]="o.category">{{ o.category }}</span>
            </div>
            <div class="bar-wrap">
              <div class="bar">
                <div class="bar-fill" [style.width.%]="o.progress" [attr.data-level]="level(o.progress)"></div>
              </div>
              <span class="muted small">{{ o.progress }}% · {{ o.open_items }} open</span>
            </div>
            <div class="muted small time">{{ o.updated_at | relativeTime }}</div>
          </div>
        </div>
        <ng-template #skel>
          <div class="stack">
            <app-skeleton height="56px" *ngFor="let _ of [1,2,3,4,5]"></app-skeleton>
          </div>
        </ng-template>
      </app-section-card>

      <app-section-card title="Compliance" icon="shield">
        <ul class="compliance">
          <li *ngFor="let c of compliance">
            <span class="check" [attr.data-status]="c.status">
              <lucide-icon [name]="c.status === 'ok' ? 'check' : 'circle-alert'" [size]="10"></lucide-icon>
            </span>
            <div>
              <strong>{{ c.label }}</strong>
              <span class="muted small">{{ c.note }}</span>
            </div>
          </li>
        </ul>
      </app-section-card>

      <app-section-card title="Vendor catalog" icon="briefcase">
        <ul class="vendors">
          <li *ngFor="let v of vendors">
            <span class="init">{{ v.name[0] }}</span>
            <div>
              <strong>{{ v.name }}</strong>
              <span class="muted small">{{ v.category }}</span>
            </div>
            <span class="muted small">$ {{ v.monthly | number }}</span>
          </li>
        </ul>
      </app-section-card>
    </div>
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }
      .ops-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 1180px) {
        .ops-grid {
          grid-template-columns: 1fr;
        }
      }
      .ops-rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ops-row {
        display: grid;
        grid-template-columns: 1.2fr 2fr auto;
        gap: 16px;
        align-items: center;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg-2);
      }
      .ops-row .name {
        font-size: 13px;
        font-weight: 600;
      }
      .chip {
        display: inline-flex;
        padding: 1px 7px;
        background: var(--bg-3);
        border-radius: 999px;
        font-size: 10px;
        color: var(--fg-1);
        margin-top: 3px;
        text-transform: capitalize;
      }
      .cat[data-cat='compliance'] {
        background: rgba(34, 197, 94, 0.12);
        color: var(--ok);
      }
      .cat[data-cat='legal'] {
        background: rgba(124, 92, 255, 0.12);
        color: var(--accent);
      }
      .cat[data-cat='finance'] {
        background: rgba(34, 211, 238, 0.12);
        color: var(--accent-2);
      }
      .cat[data-cat='hr'] {
        background: rgba(244, 114, 182, 0.12);
        color: #f472b6;
      }
      .cat[data-cat='vendors'] {
        background: rgba(245, 158, 11, 0.12);
        color: var(--warn);
      }
      .bar-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .bar {
        height: 6px;
        background: var(--bg-1);
        border-radius: 999px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        background: var(--accent);
      }
      .bar-fill[data-level='low'] {
        background: var(--err);
      }
      .bar-fill[data-level='mid'] {
        background: var(--warn);
      }
      .bar-fill[data-level='high'] {
        background: var(--ok);
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .compliance {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .compliance li {
        display: grid;
        grid-template-columns: 22px 1fr;
        gap: 10px;
        padding: 8px;
        border-radius: 8px;
        background: var(--bg-2);
      }
      .check {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--bg-3);
        color: var(--fg-2);
      }
      .check[data-status='ok'] {
        background: rgba(34, 197, 94, 0.15);
        color: var(--ok);
      }
      .check[data-status='warn'] {
        background: rgba(245, 158, 11, 0.15);
        color: var(--warn);
      }
      .vendors {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .vendors li {
        display: grid;
        grid-template-columns: 24px 1fr auto;
        gap: 10px;
        padding: 6px 8px;
        border-radius: 8px;
        background: var(--bg-2);
        align-items: center;
      }
      .init {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: var(--bg-3);
        display: grid;
        place-items: center;
        font-weight: 600;
        color: var(--fg-0);
        font-size: 11px;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `,
  ],
})
export class StartupOpsComponent implements OnInit {
  private readonly ds = inject(STARTUP_OPS_DS);
  readonly items = signal<OpsChecklist[]>([]);
  readonly loading = signal(true);

  readonly compliance = [
    { label: 'SOC 2 Type I', note: 'Audit in progress · Sep 2025', status: 'warn' },
    { label: 'GDPR DPA', note: 'Signed with 12 vendors', status: 'ok' },
    { label: 'PII inventory', note: 'Last review 3d ago', status: 'ok' },
    { label: 'Incident response', note: 'Runbook v1.3', status: 'ok' },
    { label: 'Annual pen-test', note: 'Scheduled Q4', status: 'warn' },
  ];

  readonly vendors = [
    { name: 'Stripe', category: 'Payments', monthly: 320 },
    { name: 'Vercel', category: 'Hosting', monthly: 180 },
    { name: 'OpenAI', category: 'LLM', monthly: 480 },
    { name: 'Rippling', category: 'HR', monthly: 250 },
    { name: 'Linear', category: 'Project mgmt', monthly: 96 },
  ];

  count() {
    return this.items().length;
  }
  avg() {
    const r = this.items();
    if (!r.length) return 0;
    return Math.round(r.reduce((a, b) => a + b.progress, 0) / r.length);
  }
  openItems() {
    return this.items().reduce((a, b) => a + b.open_items, 0);
  }
  green() {
    return this.compliance.filter((c) => c.status === 'ok').length;
  }

  level(v: number): string {
    if (v < 40) return 'low';
    if (v < 75) return 'mid';
    return 'high';
  }

  ngOnInit() {
    this.ds.listChecklists().subscribe((x) => {
      this.items.set(x);
      this.loading.set(false);
    });
  }
}
