import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { EMPTY, Subscription, interval, startWith, switchMap, takeWhile } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AGENTS_DS, WORKFLOW_DS } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { WorkflowStepInspectorComponent } from '../../shared/workflow/workflow-step-inspector.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { getModuleMeta } from '../../core/config/module-registry';
import type { ModuleId } from '../../core/config/env.types';
import type { ActiveWorkflow, AgentCapability, WorkflowStep } from '../../core/models';
import { normalizeLucideStepIcon } from '../../shared/workflow/lucide-step-icon';
import { DashboardPrefsService } from '../../core/config/dashboard-prefs.service';
import { DASHBOARD_POLL_INTERVAL_MS } from '../../core/config/polling';

@Component({
  selector: 'app-workflow-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    EmptyStateComponent,
    SkeletonComponent,
    WorkflowConstellationCardComponent,
    WorkflowStepInspectorComponent,
    RelativeTimePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      [title]="workflow()?.title ?? 'Workflow'"
      [eyebrow]="moduleLabel()"
      icon="workflow"
    >
      <div actions>
        <a class="btn" [routerLink]="['/', moduleId()]" *ngIf="moduleId()">
          <lucide-icon name="arrow-right" [size]="12" style="transform: rotate(180deg)"></lucide-icon>
          Back to module
        </a>
      </div>
    </app-page-header>

    <ng-container *ngIf="loading(); else loaded">
      <app-skeleton height="200px"></app-skeleton>
    </ng-container>

    <ng-template #loaded>
      <app-empty-state
        *ngIf="!workflow()"
        icon="workflow"
        title="Workflow not found"
        subtitle="This workflow may have completed and been archived."
      ></app-empty-state>

      <ng-container *ngIf="workflow() as wf">
        <app-workflow-constellation-card
          [moduleId]="wf.module"
          [workflowId]="wf.id"
          [workflow]="wf"
        ></app-workflow-constellation-card>

        <p class="run-llm muted small" *ngIf="wf.llm_usage as ru">
          <lucide-icon name="cpu" [size]="12"></lucide-icon>
          This run ·
          <span class="mono">{{ ru.total_tokens | number }}</span> tokens
          <ng-container *ngIf="ru.cost_usd != null">
            · est. $<span class="mono">{{ ru.cost_usd | number: '1.2-4' }}</span> USD
          </ng-container>
          · {{ ru.request_count }} LLM request(s)
        </p>

        <div class="detail-grid">
          <app-section-card title="Steps" icon="list-ordered">
            <ol class="step-list">
              <li
                *ngFor="let s of wf.steps; let i = index"
                [attr.data-status]="s.status"
                [class.active]="selectedStepId() === s.id"
                (click)="selectedStepId.set(s.id)"
              >
                <span class="num">{{ i + 1 }}</span>
                <div class="sl-main">
                  <div class="sl-top">
                    <lucide-icon [name]="normalizeLucideStepIcon(s.icon)" [size]="14"></lucide-icon>
                    <span class="sl-label">{{ s.label }}</span>
                    <span class="sl-retry-chip" *ngIf="retriesFor(s) as r" [title]="retriesTitle(s)">
                      <lucide-icon name="rotate-ccw" [size]="10"></lucide-icon>
                      {{ r }} retry{{ r === 1 ? '' : 'ies' }}
                    </span>
                    <span class="sl-status" [attr.data-variant]="statusVariant(s)">
                      {{ statusLabel(s) }}
                    </span>
                  </div>
                  <div class="muted small" *ngIf="s.description">{{ s.description }}</div>
                  <div class="muted small" *ngIf="s.started_at">
                    started {{ s.started_at | relativeTime }}
                    <ng-container *ngIf="s.finished_at">
                      · finished {{ s.finished_at | relativeTime }}
                    </ng-container>
                  </div>
                </div>
              </li>
            </ol>
          </app-section-card>

          <aside class="side">
            <app-workflow-step-inspector
              *ngIf="selectedStep() as ss"
              [step]="ss"
              [agents]="agentsForStep(ss)"
              [accent]="accent()"
              (close)="selectedStepId.set(null)"
            ></app-workflow-step-inspector>

            <app-section-card *ngIf="!selectedStep()" title="Summary" icon="info">
              <div class="kv">
                <div>
                  <span class="muted">Module</span>
                  <span>{{ moduleLabel() }}</span>
                </div>
                <div *ngIf="wf.venture_name">
                  <span class="muted">Venture</span>
                  <span>{{ wf.venture_name }}</span>
                </div>
                <div>
                  <span class="muted">Status</span>
                  <span>{{ wf.status }}</span>
                </div>
                <div>
                  <span class="muted">Started</span>
                  <span>{{ wf.started_at | relativeTime }}</span>
                </div>
                <div *ngIf="wf.completed_at">
                  <span class="muted">Completed</span>
                  <span>{{ wf.completed_at | relativeTime }}</span>
                </div>
                <div>
                  <span class="muted">Progress</span>
                  <span>{{ (wf.progress * 100) | number: '1.0-0' }}%</span>
                </div>
                <div *ngIf="wf.temporal_workflow_id">
                  <span class="muted">Temporal</span>
                  <span class="mono small">{{ wf.temporal_workflow_id }}</span>
                </div>
              </div>
            </app-section-card>
          </aside>
        </div>
      </ng-container>
    </ng-template>
  `,
  styles: [
    `
      .run-llm {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin: 0 0 16px;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 18px;
        margin-top: 20px;
      }
      @media (max-width: 980px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
      }
      .side {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .step-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .step-list li {
        display: grid;
        grid-template-columns: 28px 1fr;
        gap: 12px;
        padding: 12px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 10px;
        cursor: pointer;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .step-list li:hover,
      .step-list li.active {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 6%, var(--bg-2));
      }
      .num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--bg-1);
        border: 1px solid var(--border);
        display: grid;
        place-items: center;
        font-size: 11px;
        font-weight: 700;
        color: var(--fg-1);
      }
      .step-list li[data-status='done'] .num {
        background: color-mix(in srgb, var(--ok) 20%, var(--bg-1));
        color: var(--ok);
        border-color: var(--ok);
      }
      .step-list li[data-status='running'] .num {
        background: color-mix(in srgb, var(--accent-2) 20%, var(--bg-1));
        color: var(--accent-2);
        border-color: var(--accent-2);
      }
      .step-list li[data-status='failed'] .num {
        background: color-mix(in srgb, var(--err) 20%, var(--bg-1));
        color: var(--err);
        border-color: var(--err);
      }
      .sl-top {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sl-label {
        font-weight: 600;
        color: var(--fg-0);
        font-size: 13px;
      }
      .sl-status {
        margin-left: auto;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--fg-2);
      }
      .step-list li[data-status='running'] .sl-status {
        color: var(--accent-2);
      }
      .step-list li[data-status='done'] .sl-status {
        color: var(--ok);
      }
      .step-list li[data-status='failed'] .sl-status {
        color: var(--err);
      }
      .sl-status[data-variant='warn'] {
        color: var(--warn, #f59e0b) !important;
      }
      .sl-retry-chip {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        margin-left: auto;
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        background: color-mix(in srgb, var(--warn, #f59e0b) 16%, var(--bg-1));
        color: var(--warn, #f59e0b);
        border: 1px solid color-mix(in srgb, var(--warn, #f59e0b) 40%, transparent);
      }
      .sl-retry-chip + .sl-status {
        margin-left: 8px;
      }
      .kv {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .kv > div {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 13px;
        color: var(--fg-0);
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .mono {
        font-family: 'JetBrains Mono', monospace;
      }
    `,
  ],
})
export class WorkflowDetailComponent implements OnInit, OnDestroy {
  readonly normalizeLucideStepIcon = normalizeLucideStepIcon;

  private readonly route = inject(ActivatedRoute);
  private readonly workflowDs = inject(WORKFLOW_DS);
  private readonly agentsDs = inject(AGENTS_DS);
  private readonly prefs = inject(DashboardPrefsService);
  private readonly autoRefresh$ = toObservable(this.prefs.autoRefreshEnabled);

  readonly workflow = signal<ActiveWorkflow | null>(null);
  readonly agents = signal<AgentCapability[]>([]);
  readonly loading = signal<boolean>(true);
  readonly selectedStepId = signal<string | null>(null);

  readonly moduleId = computed<ModuleId | null>(() => this.workflow()?.module ?? null);

  readonly selectedStep = computed<WorkflowStep | null>(() => {
    const id = this.selectedStepId();
    const wf = this.workflow();
    if (!id || !wf) return null;
    return wf.steps.find((s) => s.id === id) ?? null;
  });

  private sub?: Subscription;

  moduleLabel(): string {
    const id = this.moduleId();
    if (!id) return 'Workflow';
    return getModuleMeta(id)?.label ?? id;
  }

  accent(): string {
    const id = this.moduleId();
    if (!id) return 'var(--accent)';
    return getModuleMeta(id)?.accent ?? 'var(--accent)';
  }

  agentsForStep(step: WorkflowStep): AgentCapability[] {
    const ids = new Set(step.agent_ids);
    return this.agents().filter((a) => ids.has(a.id) || ids.has(a.name));
  }

  /**
   * Number of times the workflow had to bounce back into this step. Pulled
   * from the structured `retries` field emitted by the backend, with a
   * fallback that counts failed quality gates among sub-steps so older runs
   * (or modules that don't emit the counter yet) still surface the truth.
   */
  retriesFor(step: WorkflowStep): number {
    const f = step.fields?.['retries'];
    if (f && typeof f.value === 'number' && f.value > 0) return f.value;
    const subFails = (step.sub_steps ?? []).filter(
      (ss) => !!ss.quality_gate && ss.quality_gate.passed === false,
    ).length;
    return subFails;
  }

  retriesTitle(step: WorkflowStep): string {
    const n = this.retriesFor(step);
    return `Quality gate bounced back ${n} time${n === 1 ? '' : 's'}`;
  }

  /** "done" with retries paints orange so it stops looking like a clean pass. */
  statusVariant(step: WorkflowStep): string | null {
    if (step.status === 'done' && this.retriesFor(step) > 0) return 'warn';
    return null;
  }

  statusLabel(step: WorkflowStep): string {
    if (step.status === 'done' && this.retriesFor(step) > 0) {
      return 'done · with retries';
    }
    return step.status;
  }

  ngOnInit(): void {
    this.agentsDs.listAgents().subscribe((a) => this.agents.set(a));
    this.route.paramMap.subscribe((pm) => {
      const workflowId = pm.get('workflowId');
      if (!workflowId) return;
      this.loading.set(true);
      this.sub?.unsubscribe();
      this.sub = this.workflowDs.get(workflowId).subscribe({
        next: (wf) => {
          this.workflow.set(wf);
          this.loading.set(false);
          if (wf && (wf.status === 'running' || wf.status === 'queued')) {
            this.startPolling(workflowId);
          }
        },
        error: () => {
          this.workflow.set(null);
          this.loading.set(false);
        },
      });
    });
  }

  private pollSub?: Subscription;

  private startPolling(workflowId: string): void {
    this.pollSub?.unsubscribe();
    this.pollSub = this.autoRefresh$
      .pipe(
        switchMap((enabled) =>
          enabled
            ? interval(DASHBOARD_POLL_INTERVAL_MS).pipe(
                startWith(0),
                switchMap(() => this.workflowDs.get(workflowId)),
                takeWhile(
                  (wf) => !!wf && (wf.status === 'running' || wf.status === 'queued'),
                  true,
                ),
              )
            : EMPTY,
        ),
      )
      .subscribe({
        next: (wf) => {
          if (wf) this.workflow.set(wf);
        },
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }
}
