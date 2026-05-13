import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BRUCE_CORE_DS } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ScoreColorPipe } from '../../shared/pipes/score-color.pipe';
import { MODULE_REGISTRY } from '../../core/config/module-registry';
import type { Venture } from '../../core/models';

@Component({
  selector: 'app-ventures',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    KpiCardComponent,
    StatusBadgeComponent,
    SkeletonComponent,
    RelativeTimePipe,
    ScoreColorPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Ventures"
      eyebrow="Pipeline"
      icon="compass"
      subtitle="Every active and archived venture, its stage, modules in motion, and latest signals."
    >
      <div actions>
        <div class="toggle">
          <button [class.active]="view() === 'kanban'" (click)="view.set('kanban')">
            <lucide-icon name="layout-grid" [size]="12"></lucide-icon>
            Kanban
          </button>
          <button [class.active]="view() === 'list'" (click)="view.set('list')">
            <lucide-icon name="layers" [size]="12"></lucide-icon>
            List
          </button>
        </div>
      </div>
    </app-page-header>

    <div class="kpis">
      <app-kpi-card label="Total ventures" [value]="count()" icon="compass"></app-kpi-card>
      <app-kpi-card label="Building" [value]="byStage('building').length" icon="hammer" sparkColor="var(--accent)"></app-kpi-card>
      <app-kpi-card label="Live" [value]="byStage('live').length" icon="rocket" sparkColor="var(--ok)"></app-kpi-card>
      <app-kpi-card label="Avg. score" [value]="avgScore()" suffix=" / 100" icon="gauge"></app-kpi-card>
    </div>

    <ng-container *ngIf="loading(); else loaded">
      <div class="stack">
        <app-skeleton height="200px"></app-skeleton>
      </div>
    </ng-container>

    <ng-template #loaded>
      <ng-container *ngIf="view() === 'kanban'">
        <div class="kanban">
          <div class="col" *ngFor="let st of stages">
            <div class="col-head">
              <span>{{ st }}</span>
              <strong>{{ byStage(st).length }}</strong>
            </div>
            <div class="card" *ngFor="let v of byStage(st)">
              <div class="c-head">
                <strong>{{ v.name }}</strong>
                <span class="score" [style.color]="v.score | scoreColor">{{ v.score }}</span>
              </div>
              <div class="c-desc muted small">{{ v.description }}</div>
              <div class="chips">
                <span class="chip" *ngFor="let m of v.modules_active">{{ moduleShort(m) }}</span>
              </div>
              <div class="c-foot muted small">
                <span>by {{ v.owner }}</span>
                <span>·</span>
                <span>{{ v.updated_at | relativeTime }}</span>
              </div>
            </div>
            <div class="empty muted small" *ngIf="!byStage(st).length">—</div>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="view() === 'list'">
        <app-section-card>
          <div class="list">
            <div class="list-head">
              <div>Venture</div>
              <div>Stage</div>
              <div>Modules</div>
              <div>Score</div>
              <div>Updated</div>
            </div>
            <div class="list-row" *ngFor="let v of ventures()">
              <div>
                <strong>{{ v.name }}</strong>
                <div class="muted small">{{ v.description }}</div>
              </div>
              <div><app-status-badge [status]="v.stage"></app-status-badge></div>
              <div class="chips">
                <span class="chip" *ngFor="let m of v.modules_active">{{ moduleShort(m) }}</span>
              </div>
              <div class="score-cell" [style.color]="v.score | scoreColor">{{ v.score }}</div>
              <div class="muted small">{{ v.updated_at | relativeTime }}</div>
            </div>
          </div>
        </app-section-card>
      </ng-container>
    </ng-template>
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }
      .toggle {
        display: flex;
        padding: 3px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 8px;
      }
      .toggle button {
        background: transparent;
        border: 0;
        color: var(--fg-1);
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .toggle button.active {
        background: var(--bg-0);
        color: var(--fg-0);
      }
      .kanban {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
      }
      @media (max-width: 1180px) {
        .kanban {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 720px) {
        .kanban {
          grid-template-columns: 1fr;
        }
      }
      .col {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
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
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .c-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .c-head strong {
        font-family: 'Inter Tight';
        font-size: 14px;
      }
      .score {
        font-family: 'Inter Tight';
        font-size: 18px;
        font-weight: 700;
      }
      .chips {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .chip {
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--bg-3);
        color: var(--fg-1);
        font-size: 10px;
        text-transform: capitalize;
      }
      .c-foot {
        display: flex;
        gap: 4px;
      }
      .empty {
        padding: 20px 0;
        text-align: center;
      }
      .list {
        display: flex;
        flex-direction: column;
      }
      .list-head {
        display: grid;
        grid-template-columns: 2fr 100px 1.2fr 60px 120px;
        gap: 14px;
        padding: 8px 14px;
        color: var(--fg-2);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .list-row {
        display: grid;
        grid-template-columns: 2fr 100px 1.2fr 60px 120px;
        gap: 14px;
        padding: 12px 14px;
        align-items: center;
        border-top: 1px solid var(--border);
      }
      .list-row strong {
        font-size: 13px;
      }
      .list-row .score-cell {
        text-align: right;
        font-family: 'Inter Tight';
        font-weight: 700;
        font-size: 18px;
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
        gap: 12px;
      }
    `,
  ],
})
export class VenturesComponent implements OnInit {
  private readonly ds = inject(BRUCE_CORE_DS);
  readonly ventures = signal<Venture[]>([]);
  readonly loading = signal(true);
  readonly view = signal<'kanban' | 'list'>('kanban');
  readonly stages: Venture['stage'][] = ['concept', 'scoping', 'building', 'live', 'archived'];

  count() {
    return this.ventures().length;
  }
  byStage(st: string): Venture[] {
    return this.ventures().filter((v) => v.stage === st);
  }
  avgScore() {
    const r = this.ventures();
    if (!r.length) return 0;
    const scores = r.filter((v) => typeof v.score === 'number');
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + (b.score ?? 0), 0) / scores.length);
  }

  moduleShort(id: string): string {
    return MODULE_REGISTRY.find((m) => m.id === id)?.shortLabel ?? id;
  }

  ngOnInit() {
    this.ds.listVentures().subscribe((v) => {
      this.ventures.set(v);
      this.loading.set(false);
    });
  }
}
