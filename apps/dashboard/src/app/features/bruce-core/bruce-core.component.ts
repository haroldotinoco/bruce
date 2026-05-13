import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BRUCE_CORE_DS } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

@Component({
  selector: 'app-bruce-core',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    KpiCardComponent,
    RelativeTimePipe,
    SkeletonComponent,
    WorkflowConstellationCardComponent,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Bruce Core"
      eyebrow="Module · mock"
      icon="shield-check"
      subtitle="Venture lifecycle, governance gates, module dispatch, and policy enforcement."
      badge="MOCK"
    >
      <div actions>
        <app-module-rollback-button moduleId="bruce-core"></app-module-rollback-button>
      </div>
    </app-page-header>

    <app-workflow-constellation-card moduleId="bruce-core"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Gates passed · 7d" value="34" icon="check" [delta]="6"></app-kpi-card>
      <app-kpi-card label="Gates blocked · 7d" value="5" icon="x" [delta]="-2"></app-kpi-card>
      <app-kpi-card label="Policies active" value="8" icon="shield"></app-kpi-card>
      <app-kpi-card label="Dispatches · 7d" value="129" icon="workflow"></app-kpi-card>
    </div>

    <div class="fc-grid">
      <app-section-card title="Governance events" icon="flag" style="grid-column: span 2">
        <ul class="events">
          <li *ngFor="let e of events()">
            <span class="dot" [attr.data-type]="e.type"></span>
            <div>
              <strong>{{ e.message }}</strong>
              <span class="muted small">{{ e.type }} · {{ e.at | relativeTime }}</span>
            </div>
          </li>
        </ul>
      </app-section-card>

      <app-section-card title="Gate policy" icon="shield">
        <div class="policy">
          <div>
            <strong>Quality threshold</strong>
            <span class="val">≥ 70 score</span>
          </div>
          <div>
            <strong>Minimum ventures for pattern</strong>
            <span class="val">3</span>
          </div>
          <div>
            <strong>Dispatch retry</strong>
            <span class="val">max 3, 2x backoff</span>
          </div>
          <div>
            <strong>Auto-archive</strong>
            <span class="val">90 days idle</span>
          </div>
        </div>
      </app-section-card>

      <app-section-card title="Dispatcher load" icon="network">
        <div class="dispatch">
          <div class="row" *ngFor="let m of dispatchLoad">
            <span>{{ m.module }}</span>
            <div class="bar-wrap">
              <div class="bar">
                <div class="fill" [style.width.%]="m.pct"></div>
              </div>
              <span class="muted small">{{ m.jobs }}</span>
            </div>
          </div>
        </div>
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
      .fc-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 1180px) {
        .fc-grid {
          grid-template-columns: 1fr;
        }
      }
      .events {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .events li {
        display: grid;
        grid-template-columns: 10px 1fr;
        gap: 10px;
        align-items: center;
        padding: 10px 12px;
        background: var(--bg-2);
        border-radius: 10px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-2);
      }
      .dot[data-type='gate.passed'] {
        background: var(--ok);
      }
      .dot[data-type='gate.rejected'] {
        background: var(--err);
      }
      .dot[data-type='dispatch'] {
        background: var(--accent-2);
      }
      .dot[data-type='gate.opened'] {
        background: var(--accent);
      }
      .policy {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .policy > div {
        display: flex;
        justify-content: space-between;
        padding: 10px 12px;
        background: var(--bg-2);
        border-radius: 10px;
        font-size: 13px;
      }
      .policy .val {
        color: var(--accent-2);
        font-weight: 600;
      }
      .dispatch {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 10px;
        align-items: center;
        font-size: 12px;
      }
      .bar-wrap {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .bar {
        flex: 1;
        height: 6px;
        background: var(--bg-2);
        border-radius: 999px;
        overflow: hidden;
      }
      .fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
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
export class BruceCoreComponent implements OnInit {
  private readonly ds = inject(BRUCE_CORE_DS);
  readonly events = signal<{ at: string; type: string; message: string }[]>([]);

  readonly dispatchLoad = [
    { module: 'opportunity', jobs: 48, pct: 82 },
    { module: 'add-venture', jobs: 22, pct: 38 },
    { module: 'brand-aid', jobs: 14, pct: 24 },
    { module: 'builder', jobs: 29, pct: 49 },
    { module: 'gtm', jobs: 11, pct: 18 },
    { module: 'startup-ops', jobs: 8, pct: 14 },
    { module: 'portfolio', jobs: 3, pct: 5 },
    { module: 'bruce-memory', jobs: 6, pct: 10 },
  ];

  ngOnInit() {
    this.ds.listGovernanceEvents().subscribe((e) => this.events.set(e));
  }
}
