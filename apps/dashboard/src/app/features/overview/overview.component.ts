import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { OPPORTUNITY_DS, METRICS_DS } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { ModuleHealthChipComponent } from '../../shared/ui/module-health-chip.component';
import { SparklineComponent } from '../../shared/ui/sparkline.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ScoreColorPipe } from '../../shared/pipes/score-color.pipe';
import { MODULE_REGISTRY, type ModuleMeta } from '../../core/config/module-registry';
import type { ModuleHealth, LiveEvent, Opportunity } from '../../core/models';
import type { GlobalKpis } from '../../core/data-sources/tokens';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    PageHeaderComponent,
    KpiCardComponent,
    SectionCardComponent,
    ModuleHealthChipComponent,
    SparklineComponent,
    EmptyStateComponent,
    SkeletonComponent,
    RelativeTimePipe,
    ScoreColorPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Command center"
      eyebrow="Bruce · overview"
      subtitle="A live, cross-venture view of everything in motion across the platform."
    >
      <div actions>
        <a class="btn" routerLink="/runs">
          <lucide-icon name="activity" [size]="12"></lucide-icon>
          Runs
        </a>
        <a class="btn btn-primary" routerLink="/opportunity">
          <lucide-icon name="telescope" [size]="12"></lucide-icon>
          Scan opportunities
        </a>
      </div>
    </app-page-header>

    <!-- Hero KPIs -->
    <div class="kpis">
      <app-kpi-card
        label="Active ventures"
        icon="compass"
        [value]="kpis()?.active_ventures ?? 0"
        [delta]="kpis()?.active_ventures_delta ?? null"
        [loading]="loading()"
        [spark]="[3, 4, 4, 5, 6, 6, 7, 8]"
      ></app-kpi-card>
      <app-kpi-card
        label="Workflows running"
        icon="workflow"
        [value]="kpis()?.workflows_running ?? 0"
        [delta]="kpis()?.workflows_running_delta ?? null"
        [loading]="loading()"
        sparkColor="var(--accent-2)"
        [spark]="[1, 2, 4, 3, 5, 7, 6, 9]"
      ></app-kpi-card>
      <app-kpi-card
        label="Opportunities (7d)"
        icon="telescope"
        [value]="kpis()?.opportunities_7d ?? 0"
        [delta]="kpis()?.opportunities_7d_delta ?? null"
        [loading]="loading()"
        sparkColor="#f472b6"
        [spark]="[2, 3, 3, 5, 6, 8, 10, 11]"
      ></app-kpi-card>
      <app-kpi-card
        label="LLM cost · month (USD)"
        icon="cpu"
        [value]="kpis()?.llm_cost_usd_month ?? 0"
        prefix="$"
        [delta]="kpis()?.llm_cost_usd_month_delta ?? null"
        [loading]="loading()"
        sparkColor="#22c55e"
        [spark]="costSpark()"
      ></app-kpi-card>
    </div>

    <!-- Bento grid -->
    <div class="bento">
      <!-- Venture funnel -->
      <app-section-card title="Venture funnel" icon="bar-chart3" class="cell-4">
        <div actions>
          <a class="muted small" routerLink="/ventures">All ventures →</a>
        </div>
        <div class="funnel" *ngIf="kpis()">
          <div class="stage" *ngFor="let st of funnelStages">
            <div class="stage-head">
              <span>{{ st.label }}</span>
              <strong>{{ kpis()!.venture_funnel[st.key] ?? 0 }}</strong>
            </div>
            <div class="stage-bar">
              <div
                class="stage-fill"
                [style.width.%]="percent(kpis()!.venture_funnel[st.key] ?? 0, maxFunnel())"
                [style.background]="st.color"
              ></div>
            </div>
          </div>
        </div>
      </app-section-card>

      <!-- Top opportunities (real) -->
      <app-section-card
        title="Top opportunities"
        icon="award"
        [hint]="topOpsHint()"
        class="cell-4"
      >
        <div actions>
          <a class="muted small" routerLink="/opportunity">All scans →</a>
        </div>
        <div class="top-ops" *ngIf="topOps().length; else topEmpty">
          <div class="top-row" *ngFor="let o of topOps(); let i = index">
            <span class="rank">{{ i + 1 }}</span>
            <div class="top-main">
              <div class="top-title">{{ o.title || o.problem_statement }}</div>
              <div class="top-meta">
                <span class="chip">{{ o.market_segment }}</span>
                <span class="muted small" *ngIf="o.scan_id">from {{ shortId(o.scan_id) }}</span>
              </div>
            </div>
            <div class="top-score" [style.color]="o.score | scoreColor">
              {{ o.score }}
            </div>
          </div>
        </div>
        <ng-template #topEmpty>
          <div class="top-empty">
            <app-empty-state
              icon="telescope"
              title="No ranked opportunities yet"
              subtitle="Run a scan to score and rank ideas from your market signals."
            >
              <a class="btn btn-primary" routerLink="/opportunity">
                <lucide-icon name="telescope" [size]="12"></lucide-icon>
                Run a scan
              </a>
            </app-empty-state>
          </div>
        </ng-template>
      </app-section-card>

      <!-- Activity heatmap -->
      <app-section-card title="Activity · 35d × 24h" icon="flame" class="cell-8">
        <div class="heatmap">
          <div class="hm-rows" *ngIf="heatmap().length">
            <div class="hm-row" *ngFor="let row of heatmap()">
              <span class="hm-cell" *ngFor="let v of row" [style.opacity]="cellOpacity(v)" [style.background]="cellColor(v)"></span>
            </div>
          </div>
          <p class="hm-caption muted small">Each column is one day; rows are hours of the day. Brighter cells mean more activity.</p>
          <div class="hm-legend">
            <span class="muted small">less</span>
            <span class="hm-cell" style="opacity: 0.15"></span>
            <span class="hm-cell" style="opacity: 0.35"></span>
            <span class="hm-cell" style="opacity: 0.6"></span>
            <span class="hm-cell" style="opacity: 0.9"></span>
            <span class="muted small">more</span>
          </div>
        </div>
      </app-section-card>

      <!-- Cost sparkline -->
      <app-section-card title="LLM spend · 14d" icon="line-chart" class="cell-4">
        <div class="spark-big">
          <app-sparkline
            [points]="costSpark()"
            [width]="320"
            [height]="110"
            color="#22c55e"
            [stretch]="true"
          ></app-sparkline>
        </div>
        <div class="cost-footer">
          <div>
            <span class="muted small">This week</span>
            <strong>$ {{ spendThisWeek() | number: '1.0-0' }}</strong>
          </div>
          <div>
            <span class="muted small">Last week</span>
            <strong class="muted">$ {{ spendLastWeek() | number: '1.0-0' }}</strong>
          </div>
        </div>
      </app-section-card>

      <!-- Module health -->
      <app-section-card title="Module health" icon="gauge" hint="9 modules" class="cell-8">
        <div class="module-strip">
          <app-module-health-chip
            *ngFor="let m of modules"
            [module]="m"
            [health]="healthFor(m.id)"
          ></app-module-health-chip>
        </div>
      </app-section-card>

      <!-- Live feed -->
      <app-section-card title="Live feed" icon="activity" class="cell-4">
        <div class="feed" *ngIf="feed().length; else feedSkel">
          <div class="feed-item" *ngFor="let e of feed()">
            <span class="feed-dot" [attr.data-sev]="e.severity"></span>
            <div class="feed-main">
              <div class="feed-msg">{{ e.message }}</div>
              <div class="feed-meta">
                <span class="chip small">{{ e.module }}</span>
                <span class="muted small">{{ e.at | relativeTime }}</span>
              </div>
            </div>
          </div>
        </div>
        <ng-template #feedSkel>
          <div class="stack">
            <app-skeleton *ngFor="let _ of [1,2,3,4]" height="36px"></app-skeleton>
          </div>
        </ng-template>
      </app-section-card>
    </div>
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
        margin-bottom: 26px;
      }
      :host ::ng-deep .kpis .kpi {
        border-color: var(--border-strong);
        box-shadow: var(--shadow-1);
      }
      @media (max-width: 980px) {
        .kpis {
          grid-template-columns: 1fr 1fr;
        }
      }
      .bento {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 18px;
        align-items: stretch;
      }
      :host ::ng-deep .bento app-section-card .sc {
        box-shadow: var(--shadow-1);
        border-color: var(--border-strong);
      }
      .cell-4 {
        grid-column: span 4;
      }
      .cell-8 {
        grid-column: span 8;
      }
      .cell-12 {
        grid-column: span 12;
      }
      @media (max-width: 1180px) {
        .cell-4,
        .cell-8 {
          grid-column: span 12;
        }
      }

      .funnel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 200px;
      }
      .stage-head {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--fg-1);
        font-weight: 500;
      }
      .stage-head strong {
        color: var(--fg-0);
        font-family: 'Inter Tight';
        font-weight: 700;
      }
      .stage-bar {
        height: 6px;
        background: var(--bg-2);
        border-radius: 999px;
        overflow: hidden;
        margin-top: 4px;
      }
      .stage-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.6s;
      }
      .top-ops {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .top-row {
        display: grid;
        grid-template-columns: 22px 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border-radius: 8px;
      }
      .top-row:hover {
        background: var(--bg-2);
      }
      .rank {
        color: var(--fg-2);
        font-weight: 600;
        font-size: 12px;
        text-align: right;
      }
      .top-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--fg-0);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .top-meta {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-top: 2px;
      }
      .top-score {
        font-family: 'Inter Tight';
        font-size: 18px;
        font-weight: 700;
      }
      .top-empty {
        margin: -6px 0 0;
      }
      .top-empty ::ng-deep .es {
        padding: 20px 12px 24px;
      }
      .top-empty ::ng-deep .es-title {
        font-size: 13px;
      }
      .top-empty ::ng-deep .es-sub {
        max-width: 280px;
      }
      .module-strip {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      @media (max-width: 1240px) {
        .module-strip {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 760px) {
        .module-strip {
          grid-template-columns: 1fr;
        }
      }
      .heatmap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        min-width: 0;
      }
      .hm-rows {
        display: grid;
        grid-template-columns: repeat(35, minmax(0, 1fr));
        gap: 2px;
        grid-auto-flow: column;
        grid-template-rows: repeat(24, 8px);
        width: 100%;
        min-width: 0;
      }
      .hm-row {
        display: contents;
      }
      .hm-caption {
        margin: 0;
        line-height: 1.35;
      }
      .hm-cell {
        display: inline-block;
        width: 100%;
        height: 8px;
        border-radius: 2px;
        background: var(--accent);
      }
      .hm-legend {
        display: flex;
        align-items: center;
        gap: 4px;
        justify-content: flex-end;
      }
      .hm-legend .hm-cell {
        width: 10px;
        height: 8px;
      }
      .spark-big {
        background: var(--bg-0);
        border-radius: 10px;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: stretch;
        min-height: 124px;
        height: 124px;
        border: 1px solid var(--border);
      }
      .spark-big app-sparkline {
        width: 100%;
        height: 100%;
        min-height: 0;
        flex: 1;
      }
      .cost-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
      }
      .cost-footer strong {
        display: block;
        font-family: 'Inter Tight';
        font-size: 18px;
      }
      .feed {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .feed-item {
        display: grid;
        grid-template-columns: 10px 1fr;
        gap: 10px;
        padding: 8px;
        border-radius: 8px;
        background: var(--bg-2);
      }
      .feed-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-2);
        margin-top: 5px;
      }
      .feed-dot[data-sev='success'] {
        background: var(--ok);
      }
      .feed-dot[data-sev='warn'] {
        background: var(--warn);
      }
      .feed-dot[data-sev='error'] {
        background: var(--err);
      }
      .feed-dot[data-sev='info'] {
        background: var(--accent-2);
      }
      .feed-msg {
        font-size: 12px;
        color: var(--fg-0);
      }
      .feed-meta {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-top: 2px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--bg-3);
        font-size: 10px;
        font-weight: 600;
        color: var(--fg-1);
        text-transform: capitalize;
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
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
export class OverviewComponent implements OnInit {
  private readonly metrics = inject(METRICS_DS);
  private readonly opportunity = inject(OPPORTUNITY_DS);

  readonly modules: ModuleMeta[] = [...MODULE_REGISTRY].sort((a, b) => a.order - b.order);
  readonly funnelStages = [
    { key: 'concept' as const, label: 'Concept', color: 'var(--fg-2)' },
    { key: 'scoping' as const, label: 'Scoping', color: 'var(--accent-2)' },
    { key: 'building' as const, label: 'Building', color: 'var(--accent)' },
    { key: 'live' as const, label: 'Live', color: 'var(--ok)' },
  ];

  readonly kpis = signal<GlobalKpis | null>(null);
  readonly health = signal<ModuleHealth[]>([]);
  readonly heatmap = signal<number[][]>([]);
  readonly costSpark = signal<number[]>([]);
  readonly feed = signal<LiveEvent[]>([]);
  readonly topOps = signal<Opportunity[]>([]);
  readonly topReal = signal<boolean>(false);
  readonly loading = signal<boolean>(true);

  readonly maxFunnel = computed(() => {
    const k = this.kpis();
    if (!k) return 1;
    return Math.max(1, ...Object.values(k.venture_funnel));
  });

  readonly spendThisWeek = computed(() => {
    const arr = this.costSpark();
    return arr.slice(-7).reduce((a, b) => a + b, 0);
  });

  readonly spendLastWeek = computed(() => {
    const arr = this.costSpark();
    return arr.slice(0, 7).reduce((a, b) => a + b, 0);
  });

  readonly topOpsHint = computed(() => {
    if (!this.topOps().length) return undefined;
    return this.topReal() ? 'live' : 'synthetic';
  });

  ngOnInit(): void {
    forkJoin({
      kpis: this.metrics.globalKpis(),
      health: this.metrics.moduleHealth(),
      heatmap: this.metrics.activityHeatmap(),
      cost: this.metrics.costSparkline(),
      feed: this.metrics.liveFeed(),
    }).subscribe(({ kpis, health, heatmap, cost, feed }) => {
      this.kpis.set(kpis);
      this.health.set(health);
      this.heatmap.set(heatmap);
      this.costSpark.set(cost);
      this.feed.set(feed);
      this.loading.set(false);
    });

    // Try real data for top ops
    this.opportunity.listScans({ limit: 10 }).subscribe({
      next: (scans) => {
        const completed = scans.find((s) => s.status === 'completed');
        if (!completed) {
          this.fallbackTopOps();
          return;
        }
        this.opportunity.listOpportunities(completed.id).subscribe({
          next: (ops) => {
            const top = ops
              .slice()
              .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
              .slice(0, 5);
            if (top.length) {
              this.topOps.set(top);
              this.topReal.set(true);
            } else {
              this.fallbackTopOps();
            }
          },
          error: () => this.fallbackTopOps(),
        });
      },
      error: () => this.fallbackTopOps(),
    });
  }

  private fallbackTopOps(): void {
    // Try mock datasource fallback via listAllOpportunities if available
    try {
      this.opportunity.listAllOpportunities?.(5).subscribe({
        next: (ops) => {
          if (ops.length) {
            this.topOps.set(ops.slice(0, 5));
            this.topReal.set(false);
          }
        },
        error: () => {
          /* swallow */
        },
      });
    } catch {
      /* no-op */
    }
  }

  healthFor(id: string): ModuleHealth | undefined {
    return this.health().find((h) => h.id === id);
  }

  percent(v: number, max: number): number {
    return Math.round((v / max) * 100);
  }

  shortId(id: string): string {
    if (id.length <= 12) return id;
    return id.slice(0, 8) + '…';
  }

  cellOpacity(v: number): number {
    const max = 20;
    return 0.1 + Math.min(1, v / max) * 0.85;
  }

  cellColor(v: number): string {
    if (v > 15) return 'var(--accent)';
    if (v > 8) return 'var(--accent-2)';
    if (v > 0) return 'var(--ok)';
    return 'var(--bg-3)';
  }
}
