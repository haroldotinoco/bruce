import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ADD_VENTURE_DS, AddVentureDossier } from '../../core/data-sources/tokens';
import { DataModeService } from '../../core/data-sources/data-mode.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ScoreColorPipe } from '../../shared/pipes/score-color.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';
import { StartFromPromptDialogComponent } from '../../shared/bootstrap/start-from-prompt-dialog.component';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-add-venture',
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
    ScoreColorPipe,
    ModuleRollbackButtonComponent,
    StartFromPromptDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Add-Venture"
      [eyebrow]="'Module · ' + (isLive() ? 'live' : 'mock')"
      icon="lightbulb"
      subtitle="Compose end-to-end venture dossiers: business model, narrative, value proposition, roadmap."
      [badge]="isLive() ? '' : 'MOCK'"
    >
      <div actions>
        <app-module-rollback-button moduleId="add-venture"></app-module-rollback-button>
        <button class="btn btn-primary" type="button" (click)="startFromPromptOpen.set(true)">
          <lucide-icon name="play" [size]="12"></lucide-icon>
          Start from here
        </button>
      </div>
    </app-page-header>

    <app-start-from-prompt-dialog
      *ngIf="startFromPromptOpen()"
      moduleId="add-venture"
      (closed)="startFromPromptOpen.set(false)"
      (started)="onStartedFromPrompt($event)"
    />

    <app-workflow-constellation-card moduleId="add-venture"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Dossiers composed" [value]="count()" icon="file-text" [delta]="3"></app-kpi-card>
      <app-kpi-card label="Avg. critic score" [value]="avgScore()" suffix=" / 100" icon="gauge" [delta]="2"></app-kpi-card>
      <app-kpi-card label="Awaiting validation" [value]="pending()" icon="clock" [delta]="-1"></app-kpi-card>
      <app-kpi-card label="Agents deployed" value="11" icon="bot" [delta]="0"></app-kpi-card>
    </div>

    <div class="grid-cols">
      <app-section-card title="Dossiers" icon="file-text" [hint]="count() + ' total'" style="grid-column: span 2">
        <div *ngIf="!loading(); else skel" class="doss">
          <div class="doss-row" *ngFor="let d of dossiers()">
            <div class="doss-head">
              <div>
                <div class="doss-name">{{ d.venture_name }}</div>
                <div class="doss-sub muted small">Composed {{ d.updated_at | relativeTime }}</div>
              </div>
              <app-status-badge [status]="d.status"></app-status-badge>
            </div>
            <div class="doss-meta">
              <span class="chip" *ngFor="let s of d.business_model.segments">{{ s }}</span>
            </div>
            <div class="doss-body">
              <div>
                <span class="muted small">Narrative</span>
                <p>{{ d.narrative }}</p>
              </div>
              <div class="score-card" [style.color]="d.critic_score | scoreColor">
                <div>{{ d.critic_score }}</div>
                <span class="muted small">critic</span>
              </div>
            </div>
            <div class="doss-roadmap">
              <div class="road-item" *ngFor="let r of d.roadmap">
                <div class="road-q">{{ r.quarter }}</div>
                <div class="road-goal">{{ r.goal }}</div>
                <div class="road-owner muted small">{{ r.owner }}</div>
              </div>
            </div>
          </div>
        </div>
        <ng-template #skel>
          <div class="stack">
            <app-skeleton height="160px" *ngFor="let _ of [1,2,3]"></app-skeleton>
          </div>
        </ng-template>
      </app-section-card>

      <app-section-card title="Agents" icon="bot">
        <ul class="agents">
          <li *ngFor="let a of agents">
            <div>
              <strong>{{ a.name }}</strong>
              <span class="muted small">{{ a.role }}</span>
            </div>
            <span class="chip">{{ a.status }}</span>
          </li>
        </ul>
      </app-section-card>

      <app-section-card title="Recent runs" icon="activity">
        <ul class="runs">
          <li *ngFor="let r of recentRuns">
            <span class="dot" [attr.data-status]="r.status"></span>
            <span>{{ r.name }}</span>
            <span class="muted small">{{ r.t }}</span>
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
      @media (max-width: 980px) {
        .kpis {
          grid-template-columns: 1fr 1fr;
        }
      }
      .grid-cols {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 1180px) {
        .grid-cols {
          grid-template-columns: 1fr;
        }
      }
      .doss {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .doss-row {
        padding: 14px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .doss-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .doss-name {
        font-weight: 600;
        font-size: 14px;
      }
      .doss-sub {
        margin-top: 2px;
      }
      .doss-meta {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .doss-body {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 16px;
        align-items: center;
      }
      .doss-body p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--fg-1);
      }
      .score-card {
        text-align: center;
        font-family: 'Inter Tight';
      }
      .score-card > div {
        font-size: 30px;
        font-weight: 700;
      }
      .doss-roadmap {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .road-item {
        padding: 8px 10px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--bg-1);
      }
      .road-q {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent);
        font-weight: 600;
      }
      .road-goal {
        font-size: 12px;
        color: var(--fg-0);
        margin-top: 2px;
      }
      .chip {
        display: inline-flex;
        padding: 2px 8px;
        background: var(--bg-3);
        border-radius: 999px;
        font-size: 11px;
        color: var(--fg-1);
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .agents {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .agents li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        background: var(--bg-2);
        border-radius: 8px;
      }
      .agents strong {
        display: block;
        font-size: 12px;
      }
      .runs {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .runs li {
        display: grid;
        grid-template-columns: 8px 1fr auto;
        gap: 8px;
        font-size: 12px;
        align-items: center;
      }
      .runs .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-2);
      }
      .runs .dot[data-status='ok'] {
        background: var(--ok);
      }
      .runs .dot[data-status='fail'] {
        background: var(--err);
      }
      .runs .dot[data-status='run'] {
        background: var(--accent-2);
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    `,
  ],
})
export class AddVentureComponent implements OnInit {
  private readonly ds = inject(ADD_VENTURE_DS);
  private readonly mode = inject(DataModeService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly dossiers = signal<AddVentureDossier[]>([]);
  readonly loading = signal(true);
  readonly isLive = computed(() => this.mode.isLive('add-venture'));
  readonly startFromPromptOpen = signal(false);

  readonly agents = [
    { name: 'business-model-modeler', role: 'maps canvases', status: 'idle' },
    { name: 'narrative-strategist', role: 'positioning', status: 'running' },
    { name: 'value-proposition-designer', role: 'VP statement', status: 'idle' },
    { name: 'execution-roadmap-planner', role: '12-week plan', status: 'idle' },
    { name: 'dossier-composer', role: 'stitch dossier', status: 'done' },
    { name: 'venture-critic', role: 'red-team review', status: 'running' },
  ];

  readonly recentRuns = [
    { name: 'Compose dossier · Helix', status: 'ok', t: '2m ago' },
    { name: 'Critic review · Beacon', status: 'run', t: '12m ago' },
    { name: 'Canvas refresh · Atlas', status: 'ok', t: '1h ago' },
    { name: 'Narrative draft · Kite', status: 'fail', t: '3h ago' },
  ];

  count() {
    return this.dossiers().length;
  }
  avgScore() {
    const rows = this.dossiers();
    if (!rows.length) return 0;
    return Math.round(rows.reduce((a, b) => a + b.critic_score, 0) / rows.length);
  }
  pending() {
    return this.dossiers().filter((d) => d.status !== 'validated').length;
  }

  ngOnInit(): void {
    this.ds.listDossiers().subscribe((rows) => {
      this.dossiers.set(rows);
      this.loading.set(false);
    });
  }

  onStartedFromPrompt(event: { workflowId: string; ventureId: string }): void {
    this.toast.success('Pipeline started', `Workflow ${event.workflowId}`);
    void this.router.navigate(['/workflow', 'add-venture', event.workflowId]);
  }
}
