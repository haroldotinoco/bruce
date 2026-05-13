import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PORTFOLIO_DS, PortfolioEntry } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { ScoreColorPipe } from '../../shared/pipes/score-color.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

const STAGES = ['concept', 'scoping', 'building', 'live'];

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    KpiCardComponent,
    SkeletonComponent,
    WorkflowConstellationCardComponent,
    ScoreColorPipe,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Portfolio"
      eyebrow="Module · mock"
      icon="layout-grid"
      subtitle="Cross-venture portfolio analytics — score, stage, revenue, risk, tags."
      badge="MOCK"
    >
      <div actions>
        <app-module-rollback-button moduleId="portfolio"></app-module-rollback-button>
      </div>
    </app-page-header>

    <app-workflow-constellation-card moduleId="portfolio"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Ventures" [value]="count()" icon="compass"></app-kpi-card>
      <app-kpi-card label="Portfolio score" [value]="avgScore()" suffix=" / 100" icon="gauge"></app-kpi-card>
      <app-kpi-card label="Revenue est. / yr" [value]="revenue()" prefix="$ " icon="trending-up" [delta]="7"></app-kpi-card>
      <app-kpi-card label="High-risk" [value]="highRisk()" icon="circle-alert"></app-kpi-card>
    </div>

    <app-section-card title="Matrix · stage × score" icon="layers">
      <div class="matrix">
        <div class="m-col" *ngFor="let st of stages">
          <div class="m-head">{{ st }}</div>
          <div class="m-card" *ngFor="let v of forStage(st)" [attr.data-risk]="v.risk">
            <div class="m-top">
              <strong>{{ v.name }}</strong>
              <span class="score" [style.color]="v.score | scoreColor">{{ v.score }}</span>
            </div>
            <div class="m-mid">
              <span class="chip" *ngFor="let t of v.tags">{{ t }}</span>
            </div>
            <div class="m-bot">
              <span class="muted small">$ {{ v.revenue_est | number }}/yr</span>
              <span class="risk" [attr.data-risk]="v.risk">{{ v.risk }}</span>
            </div>
          </div>
          <div class="muted small empty" *ngIf="!forStage(st).length">Nothing here</div>
        </div>
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
      .matrix {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      @media (max-width: 980px) {
        .matrix {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .m-col {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m-head {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--fg-2);
      }
      .m-card {
        padding: 10px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .m-top strong {
        font-family: 'Inter Tight';
        font-size: 14px;
      }
      .m-top .score {
        font-family: 'Inter Tight';
        font-size: 20px;
        font-weight: 700;
      }
      .m-mid {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .chip {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--bg-3);
        color: var(--fg-1);
      }
      .m-bot {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .risk {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--bg-3);
        color: var(--fg-1);
        text-transform: capitalize;
      }
      .risk[data-risk='low'] {
        background: rgba(34, 197, 94, 0.15);
        color: var(--ok);
      }
      .risk[data-risk='medium'] {
        background: rgba(245, 158, 11, 0.15);
        color: var(--warn);
      }
      .risk[data-risk='high'] {
        background: rgba(239, 68, 68, 0.15);
        color: var(--err);
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .empty {
        text-align: center;
        padding: 18px 0;
      }
    `,
  ],
})
export class PortfolioComponent implements OnInit {
  private readonly ds = inject(PORTFOLIO_DS);
  readonly items = signal<PortfolioEntry[]>([]);
  readonly stages = STAGES;

  count() {
    return this.items().length;
  }
  avgScore() {
    const r = this.items();
    if (!r.length) return 0;
    return Math.round(r.reduce((a, b) => a + b.score, 0) / r.length);
  }
  revenue() {
    return this.items().reduce((a, b) => a + b.revenue_est, 0);
  }
  highRisk() {
    return this.items().filter((v) => v.risk === 'high').length;
  }

  forStage(st: string): PortfolioEntry[] {
    return this.items().filter((v) => v.stage === st);
  }

  ngOnInit() {
    this.ds.listVenturesMatrix().subscribe((r) => this.items.set(r));
  }
}
