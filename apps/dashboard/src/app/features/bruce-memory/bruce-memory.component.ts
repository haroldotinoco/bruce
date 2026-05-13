import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BRUCE_MEMORY_DS, MemoryPattern, MemoryDocument } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

@Component({
  selector: 'app-bruce-memory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    KpiCardComponent,
    EmptyStateComponent,
    WorkflowConstellationCardComponent,
    RelativeTimePipe,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Bruce-Memory"
      eyebrow="Module · mock"
      icon="brain"
      subtitle="Patterns across ventures, cross-venture analyst insights, and semantic retrieval."
      badge="MOCK"
    >
      <div actions>
        <app-module-rollback-button moduleId="bruce-memory"></app-module-rollback-button>
      </div>
    </app-page-header>

    <app-workflow-constellation-card moduleId="bruce-memory"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Patterns detected" [value]="count()" icon="sparkles"></app-kpi-card>
      <app-kpi-card label="Cross-venture links" value="27" icon="network" [delta]="4"></app-kpi-card>
      <app-kpi-card label="Documents indexed" value="1,218" icon="database"></app-kpi-card>
      <app-kpi-card label="Avg. confidence" [value]="avgConfidence()" suffix="%" icon="gauge"></app-kpi-card>
    </div>

    <div class="mem-grid">
      <app-section-card title="Patterns" icon="sparkles" style="grid-column: span 2">
        <div class="patterns">
          <div class="pattern" *ngFor="let p of patterns()">
            <div class="p-head">
              <div>
                <strong>{{ p.title }}</strong>
                <div class="muted small">detected {{ p.updated_at | relativeTime }} · {{ p.ventures_matched }} ventures</div>
              </div>
              <div class="conf">
                <div class="conf-bar">
                  <div class="conf-fill" [style.width.%]="p.confidence * 100"></div>
                </div>
                <span class="muted small">{{ (p.confidence * 100) | number: '1.0-0' }}%</span>
              </div>
            </div>
            <p>{{ p.insight }}</p>
          </div>
        </div>
      </app-section-card>

      <app-section-card title="Semantic search" icon="search">
        <div class="search">
          <input
            class="input"
            type="text"
            [(ngModel)]="query"
            (keydown.enter)="doSearch()"
            placeholder="Ask memory anything…"
          />
          <button class="btn btn-primary" (click)="doSearch()">
            <lucide-icon name="search" [size]="12"></lucide-icon>
            Search
          </button>
        </div>
        <ng-container *ngIf="results().length; else searchEmpty">
          <div class="results">
            <div class="result" *ngFor="let r of results()">
              <div class="r-head">
                <strong>{{ r.title }}</strong>
                <span class="score">{{ (r.score * 100) | number: '1.0-0' }}%</span>
              </div>
              <div class="muted small">{{ r.venture }}</div>
              <p>{{ r.snippet }}</p>
            </div>
          </div>
        </ng-container>
        <ng-template #searchEmpty>
          <app-empty-state icon="search" title="Nothing searched yet" subtitle="Try 'activation', 'pricing', or 'outbound'."></app-empty-state>
        </ng-template>
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
      .mem-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
      }
      @media (max-width: 1080px) {
        .mem-grid {
          grid-template-columns: 1fr;
        }
      }
      .patterns {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .pattern {
        padding: 14px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 10px;
      }
      .p-head {
        display: flex;
        justify-content: space-between;
        gap: 14px;
      }
      .p-head strong {
        font-size: 14px;
      }
      .conf {
        min-width: 110px;
        text-align: right;
      }
      .conf-bar {
        height: 4px;
        background: var(--bg-1);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 4px;
      }
      .conf-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
      }
      .pattern p {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--fg-1);
      }
      .search {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      .search .input {
        flex: 1;
      }
      .results {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .result {
        padding: 10px 12px;
        background: var(--bg-2);
        border-radius: 10px;
      }
      .r-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .r-head .score {
        font-family: 'Inter Tight';
        color: var(--accent-2);
        font-weight: 700;
      }
      .result p {
        margin: 6px 0 0;
        font-size: 12px;
        color: var(--fg-1);
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
export class BruceMemoryComponent implements OnInit {
  private readonly ds = inject(BRUCE_MEMORY_DS);
  readonly patterns = signal<MemoryPattern[]>([]);
  readonly results = signal<MemoryDocument[]>([]);
  query = '';

  count() {
    return this.patterns().length;
  }
  avgConfidence() {
    const r = this.patterns();
    if (!r.length) return 0;
    return Math.round((r.reduce((a, b) => a + b.confidence, 0) / r.length) * 100);
  }

  doSearch() {
    const q = this.query.trim();
    if (!q) {
      this.results.set([]);
      return;
    }
    this.ds.search(q).subscribe((docs) => this.results.set(docs));
  }

  ngOnInit() {
    this.ds.listPatterns().subscribe((p) => this.patterns.set(p));
  }
}
