import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { GTM_DS, GtmExperiment } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

@Component({
  selector: 'app-gtm',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    KpiCardComponent,
    SkeletonComponent,
    WorkflowConstellationCardComponent,
    RelativeTimePipe,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="GTM"
      eyebrow="Module · mock"
      icon="rocket"
      subtitle="Go-to-market experiments, campaign cadences, channel strategy, and weekly governance."
      badge="MOCK"
    >
      <div actions>
        <app-module-rollback-button moduleId="gtm"></app-module-rollback-button>
      </div>
    </app-page-header>

    <app-workflow-constellation-card moduleId="gtm"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Experiments" [value]="count()" icon="target"></app-kpi-card>
      <app-kpi-card label="Running" [value]="running()" icon="play" sparkColor="var(--accent-2)"></app-kpi-card>
      <app-kpi-card label="Won this month" [value]="won()" icon="award" [delta]="2"></app-kpi-card>
      <app-kpi-card label="Channels active" [value]="uniqueChannels()" icon="megaphone"></app-kpi-card>
    </div>

    <div class="g-grid">
      <app-section-card title="Experiments board" icon="layout-grid" style="grid-column: span 2">
        <div class="kanban">
          <div class="col" *ngFor="let st of ['backlog', 'running', 'won', 'lost']">
            <div class="col-head">
              <span>{{ st }}</span>
              <strong>{{ byStatus(st).length }}</strong>
            </div>
            <div class="card" *ngFor="let e of byStatus(st)">
              <div class="card-title">{{ e.hypothesis }}</div>
              <div class="card-meta">
                <span class="chip">{{ e.channel }}</span>
                <span class="chip">{{ e.venture_name }}</span>
              </div>
              <div class="progress">
                <div class="prog-bar">
                  <div class="prog-fill" [style.width.%]="Math.min(100, (e.observed / (e.target || 1)) * 100)"></div>
                </div>
                <span class="muted small">{{ e.observed }} / {{ e.target }} {{ e.metric }}</span>
              </div>
            </div>
          </div>
        </div>
      </app-section-card>

      <app-section-card title="Channel mix" icon="pie-chart">
        <div class="donut">
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--bg-2)" stroke-width="3"></circle>
            <circle
              *ngFor="let seg of donut(); let i = index"
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              [attr.stroke]="seg.color"
              stroke-width="3"
              [attr.stroke-dasharray]="seg.dash"
              [attr.stroke-dashoffset]="seg.offset"
              transform="rotate(-90 18 18)"
            ></circle>
          </svg>
          <ul class="legend">
            <li *ngFor="let seg of donut()">
              <span class="dot" [style.background]="seg.color"></span>
              <span>{{ seg.label }}</span>
              <strong>{{ seg.value }}</strong>
            </li>
          </ul>
        </div>
      </app-section-card>

      <app-section-card title="Weekly governance" icon="book-open">
        <ul class="weekly">
          <li *ngFor="let w of weekly">
            <div>
              <strong>{{ w.title }}</strong>
              <span class="muted small">{{ w.when }}</span>
            </div>
            <p>{{ w.note }}</p>
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
      .g-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
      }
      @media (max-width: 1180px) {
        .g-grid {
          grid-template-columns: 1fr;
        }
      }
      .kanban {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }
      @media (max-width: 800px) {
        .kanban {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .col {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 120px;
      }
      .col-head {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--fg-2);
      }
      .col-head strong {
        color: var(--fg-0);
      }
      .card {
        background: var(--bg-1);
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .card-title {
        font-size: 12px;
        color: var(--fg-0);
      }
      .card-meta {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .chip {
        display: inline-flex;
        padding: 2px 6px;
        background: var(--bg-3);
        border-radius: 999px;
        font-size: 10px;
        color: var(--fg-1);
      }
      .progress {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .prog-bar {
        height: 3px;
        background: var(--bg-3);
        border-radius: 999px;
        overflow: hidden;
      }
      .prog-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .donut {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .donut svg {
        width: 110px;
        height: 110px;
        flex-shrink: 0;
      }
      .legend {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
      }
      .legend li {
        display: grid;
        grid-template-columns: 10px 1fr auto;
        gap: 8px;
        align-items: center;
      }
      .legend .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .weekly {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .weekly li {
        padding: 10px;
        background: var(--bg-2);
        border-radius: 10px;
      }
      .weekly strong {
        font-size: 12px;
      }
      .weekly p {
        margin: 4px 0 0;
        color: var(--fg-1);
        font-size: 12px;
      }
    `,
  ],
})
export class GtmComponent implements OnInit {
  private readonly ds = inject(GTM_DS);
  readonly experiments = signal<GtmExperiment[]>([]);
  readonly Math = Math;

  readonly weekly = [
    { title: 'Monday standup', when: 'Mon 09:00', note: 'Reviewed cold-outbound-v2 hypothesis; reallocating credits from PH to newsletter.' },
    { title: 'Mid-week check', when: 'Wed 14:30', note: 'LinkedIn experiment is at 58% target; green-lighted weekend extension.' },
    { title: 'Friday retro', when: 'Fri 16:00', note: 'Captured 3 learnings into bruce-memory: pricing page vs /pricing redirect wins.' },
  ];

  count() {
    return this.experiments().length;
  }
  running() {
    return this.experiments().filter((e) => e.status === 'running').length;
  }
  won() {
    return this.experiments().filter((e) => e.status === 'won').length;
  }
  uniqueChannels() {
    return new Set(this.experiments().map((e) => e.channel)).size;
  }

  byStatus(st: string) {
    return this.experiments().filter((e) => e.status === st);
  }

  donut(): { label: string; value: number; dash: string; offset: number; color: string }[] {
    const counts: Record<string, number> = {};
    for (const e of this.experiments()) {
      counts[e.channel] = (counts[e.channel] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const colors = ['#7c5cff', '#22d3ee', '#22c55e', '#f59e0b', '#ef4444', '#f472b6', '#0ea5e9'];
    const circ = 100;
    let cursor = 0;
    return Object.entries(counts).map(([label, value], idx) => {
      const pct = (value / total) * circ;
      const dash = `${pct} ${circ - pct}`;
      const offset = -cursor;
      cursor += pct;
      return { label, value, dash, offset, color: colors[idx % colors.length] };
    });
  }

  ngOnInit() {
    this.ds.listExperiments().subscribe((x) => this.experiments.set(x));
  }
}
