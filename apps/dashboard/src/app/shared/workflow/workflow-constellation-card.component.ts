import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AGENTS_DS, WORKFLOW_DS } from '../../core/data-sources/tokens';
import { RelativeTimePipe } from '../pipes/relative-time.pipe';
import { WorkflowStepInspectorComponent } from './workflow-step-inspector.component';
import { StepBulletComponent } from './step-bullet.component';
import { getModuleMeta } from '../../core/config/module-registry';
import type { ActiveWorkflow, AgentCapability, StepLogEntry, WorkflowStep } from '../../core/models';
import type { ModuleId } from '../../core/config/env.types';
import { EMPTY, Subscription, interval, startWith, switchMap, takeWhile } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { DashboardPrefsService } from '../../core/config/dashboard-prefs.service';
import { DASHBOARD_POLL_INTERVAL_MS } from '../../core/config/polling';

@Component({
  selector: 'app-workflow-constellation-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    RelativeTimePipe,
    WorkflowStepInspectorComponent,
    StepBulletComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wf-card" *ngIf="workflows().length; else emptyOrHidden" [style.--accent]="accent()">
      <header class="wf-head">
        <div class="wf-title">
          <span class="wf-badge">
            <span class="pulse"></span>
            Active workflow<span *ngIf="workflows().length > 1">s</span>
          </span>
          <h3>{{ currentWorkflow()?.title }}</h3>
          <span class="muted small" *ngIf="currentWorkflow()?.venture_name">
            · {{ currentWorkflow()!.venture_name }}
          </span>
        </div>
        <div class="wf-actions">
          <div class="tabs" *ngIf="workflows().length > 1">
            <button
              *ngFor="let wf of workflows(); let i = index"
              class="tab"
              [class.active]="i === activeIdx()"
              (click)="setActive(i)"
            >
              {{ i + 1 }}
            </button>
          </div>
          <span class="status" [attr.data-status]="currentWorkflow()?.status">
            {{ currentWorkflow()?.status }}
          </span>
          <a
            class="btn small"
            *ngIf="currentWorkflow()"
            [routerLink]="['/workflow', moduleId, currentWorkflow()!.id]"
          >
            <lucide-icon name="maximize-2" [size]="12"></lucide-icon>
            Expand
          </a>
        </div>
      </header>

      <div class="wf-body" [class.has-inspector]="!!selectedStep()">
        <div class="wf-flow">
          <div
            class="step"
            *ngFor="let s of currentWorkflow()!.steps; let i = index; trackBy: trackStep"
            [class.active]="i === currentIdx()"
            [class.done]="s.status === 'done'"
            [class.pending]="s.status === 'pending'"
            [class.failed]="s.status === 'failed'"
            [class.selected]="selectedStepId() === s.id"
            (click)="selectStep(s.id)"
            tabindex="0"
            (keydown.enter)="selectStep(s.id)"
          >
            <div class="step-connector" *ngIf="i > 0" aria-hidden="true"></div>
            <app-step-bullet [step]="s" [accent]="accent()" [size]="46"></app-step-bullet>
            <div class="step-label">{{ s.label }}</div>
            <ul
              class="step-sub-list muted small"
              *ngIf="attemptLines(s) as lines; else singleSubline"
            >
              <li
                *ngFor="let line of lines; trackBy: trackAttemptLine"
                class="sub-line"
                [class.is-failed]="line.label === 'failed'"
                [class.is-running]="line.label === 'running'"
              >
                <span class="sub-idx">#{{ line.attempt }}</span>
                <span class="sub-text">
                  {{ line.label
                  }}<ng-container *ngIf="line.durationLabel as d"> {{ d }}</ng-container>
                </span>
              </li>
            </ul>
            <ng-template #singleSubline>
              <div class="step-sub muted small">
                {{ stepHint(s) }}
                <span *ngIf="stepDurationLabel(s) as d"> · {{ d }}</span>
              </div>
            </ng-template>

            <!-- mini-constellation of agents on the active step -->
            <svg
              *ngIf="i === currentIdx() && agentsForStep(s).length"
              class="mini"
              viewBox="-40 -40 80 80"
              preserveAspectRatio="xMidYMid meet"
            >
              <g
                *ngFor="let a of agentsForStep(s); let k = index; let n = count"
                [attr.transform]="'translate(' + orbitXY(k, agentsForStep(s).length).x + ' ' + orbitXY(k, agentsForStep(s).length).y + ')'"
              >
                <g class="mini-agent">
                  <circle r="7" [attr.fill]="accent()" fill-opacity="0.15" [attr.stroke]="accent()" stroke-opacity="0.6" stroke-width="0.8"></circle>
                  <circle r="12" fill="none" [attr.stroke]="accent()" stroke-width="0.6" opacity="0.4" class="mini-pulse"></circle>
                  <circle r="2" [attr.fill]="accent()"></circle>
                  <title>{{ a.label || a.name }}</title>
                </g>
              </g>
              <!-- link lines from step center to each agent -->
              <g *ngFor="let a of agentsForStep(s); let k = index">
                <line
                  x1="0"
                  y1="0"
                  [attr.x2]="orbitXY(k, agentsForStep(s).length).x"
                  [attr.y2]="orbitXY(k, agentsForStep(s).length).y"
                  [attr.stroke]="accent()"
                  stroke-width="0.4"
                  stroke-opacity="0.4"
                  stroke-dasharray="1 2"
                ></line>
              </g>
            </svg>
          </div>
        </div>

        <div class="wf-inspector" *ngIf="selectedStep() as ss">
          <app-workflow-step-inspector
            [step]="ss"
            [agents]="agentsForStep(ss)"
            [accent]="accent()"
            (close)="selectedStepId.set(null)"
          ></app-workflow-step-inspector>
        </div>
      </div>

      <footer class="wf-foot">
        <span class="muted small">
          started {{ currentWorkflow()!.started_at | relativeTime }}
          · progress {{ (currentWorkflow()!.progress * 100) | number: '1.0-0' }}%
        </span>
        <span class="legend">
          <span class="lg-dot done"></span> done
          <span class="lg-dot running"></span> running
          <span class="lg-dot failed"></span> failed
          <span class="lg-dot pending"></span> pending
        </span>
      </footer>
    </section>

    <ng-template #emptyOrHidden>
      <section class="wf-empty" *ngIf="!loading() && showEmpty">
        <div class="wf-empty-inner">
          <lucide-icon name="workflow" [size]="18"></lucide-icon>
          <div>
            <div class="wf-empty-title">No active workflow</div>
            <div class="muted small">When this module has a running workflow, it will appear here.</div>
          </div>
        </div>
      </section>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 20px;
      }
      .wf-card {
        --accent: var(--accent);
        position: relative;
        background:
          radial-gradient(700px 250px at 20% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%),
          var(--bg-1);
        border: 1px solid var(--border-strong, var(--border));
        border-radius: 16px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow: hidden;
      }
      .wf-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--accent);
        opacity: 0.6;
      }
      .wf-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .wf-title {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .wf-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--accent);
        padding: 3px 8px;
        border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent) 10%, transparent);
      }
      .wf-badge .pulse {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 8px var(--accent);
        animation: ping 1.5s ease-in-out infinite;
      }
      @keyframes ping {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(0.6);
        }
      }
      .wf-title h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--fg-0);
        font-family: 'Inter Tight', Inter, sans-serif;
      }
      .wf-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tabs {
        display: inline-flex;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 2px;
      }
      .tab {
        background: transparent;
        border: 0;
        color: var(--fg-2);
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 999px;
        min-width: 22px;
      }
      .tab.active {
        background: var(--bg-3);
        color: var(--fg-0);
      }
      .status {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 999px;
        background: var(--bg-2);
        color: var(--fg-1);
      }
      .status[data-status='running'] {
        color: var(--accent-2);
        background: rgba(34, 211, 238, 0.1);
      }
      .status[data-status='completed'] {
        color: var(--ok);
        background: rgba(34, 197, 94, 0.1);
      }
      .status[data-status='failed'] {
        color: var(--err);
        background: rgba(239, 68, 68, 0.1);
      }
      .btn.small {
        padding: 4px 10px;
        font-size: 11px;
        gap: 4px;
      }
      .wf-body {
        display: grid;
        grid-template-columns: 1fr;
        gap: 18px;
        align-items: stretch;
      }
      .wf-body.has-inspector {
        grid-template-columns: minmax(0, 1fr) auto;
      }
      @media (max-width: 980px) {
        .wf-body.has-inspector {
          grid-template-columns: 1fr;
        }
      }
      .wf-flow {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        overflow-x: auto;
        padding: 18px 4px 22px;
        scrollbar-width: thin;
      }
      .step {
        position: relative;
        flex: 1 1 0;
        min-width: 150px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 10px 8px 8px;
        cursor: pointer;
        border-radius: 12px;
        opacity: 0.45;
        transition: opacity 200ms ease, background 200ms ease, transform 200ms ease;
      }
      .step.done {
        opacity: 0.85;
      }
      .step.active {
        opacity: 1;
      }
      .step.failed {
        opacity: 1;
      }
      .step:hover {
        opacity: 1;
      }
      .step.selected {
        background: color-mix(in srgb, var(--accent) 8%, transparent);
      }
      .step-connector {
        position: absolute;
        left: calc(-50% + 22px);
        right: calc(50% + 22px);
        top: 30px;
        height: 2px;
        background: linear-gradient(90deg, var(--border), var(--border-strong, var(--border)));
        border-radius: 999px;
      }
      .step.done .step-connector {
        background: linear-gradient(90deg, var(--accent), var(--accent));
        opacity: 0.7;
      }
      .step.active .step-connector {
        background: linear-gradient(90deg, var(--accent), transparent);
        opacity: 0.6;
      }
      .step.failed .step-connector {
        background: linear-gradient(90deg, var(--err), transparent);
        opacity: 0.6;
      }
      .step-node {
        position: relative;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--bg-1);
        border: 2px solid var(--border);
        color: var(--fg-1);
        z-index: 1;
      }
      .step.done .step-node {
        border-color: var(--accent);
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 15%, var(--bg-1));
      }
      .step.active .step-node {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--bg-1);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent), 0 0 24px color-mix(in srgb, var(--accent) 40%, transparent);
      }
      .step.failed .step-node {
        border-color: var(--err);
        color: var(--err);
      }
      .step-pulse {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid var(--accent);
        opacity: 0;
        animation: stepPulse 1.8s ease-out infinite;
      }
      @keyframes stepPulse {
        0% {
          opacity: 0.8;
          transform: scale(0.8);
        }
        100% {
          opacity: 0;
          transform: scale(1.4);
        }
      }
      .step-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--fg-0);
        text-align: center;
      }
      .step-sub {
        text-align: center;
      }
      .step-sub-list {
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        text-align: center;
        font-size: 10px;
        line-height: 1.3;
        font-variant-numeric: tabular-nums;
        max-width: 11rem;
        font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
      }
      .sub-line {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: baseline;
        gap: 0.2em 0.35em;
        color: var(--fg-2);
        width: 100%;
      }
      .sub-line .sub-idx {
        color: var(--fg-2);
        opacity: 0.8;
        font-weight: 600;
      }
      .sub-line .sub-text {
        color: var(--fg-2);
      }
      .sub-line.is-failed .sub-text {
        color: var(--err, #f87171);
      }
      .sub-line.is-running .sub-text {
        color: var(--accent-2, #22d3ee);
      }
      .mini {
        width: 96px;
        height: 96px;
        margin-top: 4px;
      }
      .mini-agent circle:nth-of-type(1) {
        animation: miniPop 260ms ease-out both;
      }
      .mini-pulse {
        animation: miniPulse 2s ease-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes miniPop {
        from {
          opacity: 0;
          r: 2;
        }
        to {
          opacity: 1;
          r: 7;
        }
      }
      @keyframes miniPulse {
        0% {
          opacity: 0.6;
          r: 9;
        }
        100% {
          opacity: 0;
          r: 18;
        }
      }
      .wf-inspector {
        max-width: 340px;
      }
      .wf-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .legend {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 11px;
        color: var(--fg-2);
      }
      .lg-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 4px;
        background: var(--fg-2);
        vertical-align: middle;
      }
      .lg-dot.done {
        background: var(--accent);
      }
      .lg-dot.running {
        background: var(--accent-2);
        box-shadow: 0 0 8px var(--accent-2);
      }
      .lg-dot.pending {
        background: var(--bg-3);
      }
      .lg-dot.failed {
        background: var(--err, #f87171);
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .wf-empty {
        padding: 16px 18px;
        border: 1px dashed var(--border);
        border-radius: 14px;
        background: var(--bg-0);
      }
      .wf-empty-inner {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--fg-2);
      }
      .wf-empty-title {
        font-size: 13px;
        color: var(--fg-1);
        font-weight: 600;
      }
    `,
  ],
})
export class WorkflowConstellationCardComponent implements OnInit, OnChanges, OnDestroy {
  private readonly workflowDs = inject(WORKFLOW_DS);
  private readonly agentsDs = inject(AGENTS_DS);
  private readonly prefs = inject(DashboardPrefsService);
  private readonly autoRefresh$ = toObservable(this.prefs.autoRefreshEnabled);

  @Input({ required: true }) moduleId!: ModuleId;
  /** If provided, pin to a specific workflow id instead of auto-listing. */
  @Input() workflowId?: string;
  /**
   * Pre-fetched workflow data. When provided, the card skips its own HTTP
   * load/polling and renders the input directly. Lets a parent page own the
   * single polling loop and feed a consistent snapshot to every consumer.
   */
  @Input() workflow?: ActiveWorkflow | null;
  /** If false, the card is simply not rendered when there are no workflows. */
  @Input() showEmpty = false;

  @Output() workflowClick = new EventEmitter<ActiveWorkflow>();

  readonly workflows = signal<ActiveWorkflow[]>([]);
  readonly loading = signal<boolean>(true);
  readonly activeIdx = signal<number>(0);
  readonly selectedStepId = signal<string | null>(null);
  readonly agents = signal<AgentCapability[]>([]);

  readonly currentWorkflow = computed<ActiveWorkflow | null>(() => {
    const wfs = this.workflows();
    if (!wfs.length) return null;
    return wfs[Math.min(this.activeIdx(), wfs.length - 1)] ?? null;
  });

  readonly currentIdx = computed(() => {
    const wf = this.currentWorkflow();
    if (!wf) return -1;
    const statuses = wf.steps.map((s) => s.status);
    // Prefer the (single) running step when the workflow is alive.
    const running = statuses.indexOf('running');
    if (running >= 0) return running;
    // When the workflow is failed and nothing is running, highlight the
    // last failed step so the constellation matches the workflow status.
    const lastFailed = statuses.lastIndexOf('failed');
    if (wf.status === 'failed' && lastFailed >= 0) return lastFailed;
    const firstFailed = statuses.indexOf('failed');
    if (firstFailed >= 0) return firstFailed;
    if (wf.status === 'completed') return wf.steps.length - 1;
    const lastDone = statuses.lastIndexOf('done');
    return Math.max(0, lastDone);
  });

  readonly selectedStep = computed<WorkflowStep | null>(() => {
    const id = this.selectedStepId();
    const wf = this.currentWorkflow();
    if (!id || !wf) return null;
    return wf.steps.find((s) => s.id === id) ?? null;
  });

  private sub?: Subscription;
  private pollSub?: Subscription;
  private tickSub?: Subscription;
  /** signal that ticks every second so currently-running steps re-render their elapsed time */
  readonly nowTick = signal<number>(Date.now());

  accent(): string {
    return getModuleMeta(this.moduleId)?.accent ?? 'var(--accent)';
  }

  stepDurationLabel(step: WorkflowStep): string | null {
    if (step.status === 'running' && step.started_at) {
      // depend on nowTick so OnPush change detection re-renders each second
      const elapsed = this.nowTick() - new Date(step.started_at).getTime();
      return formatMs(elapsed);
    }
    if (typeof step.duration_ms === 'number') return formatMs(step.duration_ms);
    if (typeof step.elapsed_ms === 'number') return formatMs(step.elapsed_ms);
    return null;
  }

  ngOnInit(): void {
    this.agentsDs.listAgents().subscribe((a) => this.agents.set(a));
    if (this.workflow !== undefined) {
      this.applyExternalWorkflow(this.workflow);
    } else {
      this.load();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflow']) {
      // Parent owns the data: stop our own fetching and mirror the input.
      this.applyExternalWorkflow(this.workflow ?? null);
      return;
    }
    if (changes['moduleId'] || changes['workflowId']) {
      this.load();
    }
  }

  /** Mirror parent-provided workflow into the local signal; keep the elapsed-time ticker only. */
  private applyExternalWorkflow(wf: ActiveWorkflow | null): void {
    this.sub?.unsubscribe();
    this.pollSub?.unsubscribe();
    this.workflows.set(wf ? [wf] : []);
    this.activeIdx.set(0);
    this.loading.set(false);
    this.startTicker();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.pollSub?.unsubscribe();
    this.tickSub?.unsubscribe();
  }

  private load(): void {
    if (!this.moduleId) return;
    this.loading.set(true);
    this.sub?.unsubscribe();
    this.pollSub?.unsubscribe();

    if (this.workflowId) {
      this.sub = this.workflowDs.get(this.workflowId, this.moduleId).subscribe({
        next: (wf) => {
          this.workflows.set(wf ? [wf] : []);
          this.loading.set(false);
          if (wf && (wf.status === 'running' || wf.status === 'queued')) {
            this.startPollingPinned(this.workflowId!);
          }
          this.startTicker();
        },
        error: () => this.loading.set(false),
      });
      return;
    }

    this.sub = this.workflowDs.activeForModule(this.moduleId).subscribe({
      next: (list) => {
        this.workflows.set(list);
        this.activeIdx.set(0);
        this.loading.set(false);
        if (list.some((w) => w.status === 'running' || w.status === 'queued')) {
          this.startPollingActive();
        }
        this.startTicker();
      },
      error: () => this.loading.set(false),
    });
  }

  private startPollingPinned(workflowId: string): void {
    this.pollSub?.unsubscribe();
    this.pollSub = this.autoRefresh$
      .pipe(
        switchMap((enabled) =>
          enabled
            ? interval(DASHBOARD_POLL_INTERVAL_MS).pipe(
                startWith(0),
                switchMap(() => this.workflowDs.get(workflowId, this.moduleId)),
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
          if (wf) this.workflows.set([wf]);
        },
      });
  }

  private startPollingActive(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = this.autoRefresh$
      .pipe(
        switchMap((enabled) =>
          enabled
            ? interval(DASHBOARD_POLL_INTERVAL_MS).pipe(
                startWith(0),
                switchMap(() => this.workflowDs.activeForModule(this.moduleId)),
                takeWhile(
                  (list) => list.some((w) => w.status === 'running' || w.status === 'queued'),
                  true,
                ),
              )
            : EMPTY,
        ),
      )
      .subscribe({
        next: (list) => this.workflows.set(list),
      });
  }

  private startTicker(): void {
    this.tickSub?.unsubscribe();
    this.tickSub = interval(1000).subscribe(() => this.nowTick.set(Date.now()));
  }

  setActive(i: number): void {
    this.activeIdx.set(i);
    this.selectedStepId.set(null);
  }

  selectStep(stepId: string): void {
    this.selectedStepId.set(this.selectedStepId() === stepId ? null : stepId);
  }

  agentsForStep(step: WorkflowStep): AgentCapability[] {
    const ids = new Set(step.agent_ids);
    const all = this.agents();
    const matched = all.filter((a) => ids.has(a.id) || ids.has(a.name));
    return matched;
  }

  stepHint(step: WorkflowStep): string {
    if (step.status === 'running') return 'running';
    if (step.status === 'done') return 'done';
    if (step.status === 'failed') return 'failed';
    if (step.status === 'skipped') return 'skipped';
    return 'pending';
  }

  /**
   * Lines per **attempt** (observability `log[].attempt`), not per `sub_steps`.
   * Uses the most relevant leaf under this step so slot/candidate nesting does not
   * become the row index — retries for the same leaf are #1, #2, #3…
   */
  attemptLines(step: WorkflowStep): AttemptLine[] | null {
    void this.nowTick();
    return buildAttemptLinesFromStep(step, Date.now());
  }

  orbitXY(i: number, total: number): { x: number; y: number } {
    const r = total <= 1 ? 0 : 22;
    const angle = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  }

  trackStep(_: number, s: WorkflowStep): string {
    return s.id;
  }

  trackAttemptLine(_: number, line: AttemptLine): string {
    return String(line.attempt);
  }
}

/** One visual row: a single pass through the step (backend `log[].attempt`). */
export interface AttemptLine {
  attempt: number;
  label: 'done' | 'failed' | 'running' | 'skipped' | 'pending';
  durationLabel: string | null;
}

function buildAttemptLinesFromStep(topStep: WorkflowStep, nowMs: number): AttemptLine[] | null {
  const leaf = bestLeafForAttemptLogs(topStep);
  const logs = mergeLogsDedup(topStep.log, leaf.log);
  const withAttempt = logs.filter(
    (l): l is StepLogEntry & { attempt: number } =>
      typeof l.attempt === 'number' && l.attempt >= 1,
  );
  if (!withAttempt.length) return null;

  const byAttempt = new Map<number, StepLogEntry[]>();
  for (const l of withAttempt) {
    const a = l.attempt;
    const list = byAttempt.get(a) ?? [];
    list.push(l);
    byAttempt.set(a, list);
  }

  const attempts = [...byAttempt.keys()].sort((x, y) => x - y);
  const maxAttempt = attempts[attempts.length - 1] ?? 1;
  const out: AttemptLine[] = [];

  for (const a of attempts) {
    const group = (byAttempt.get(a) ?? []).slice().sort((x, y) => x.at.localeCompare(y.at));
    if (!group.length) continue;
    const first = new Date(group[0].at).getTime();
    const last = group[group.length - 1];
    const lastMs = new Date(last.at).getTime();
    const lastLevel = last.level;
    const isLastAttempt = a === maxAttempt;

    let label: AttemptLine['label'];
    if (lastLevel === 'success') {
      label = 'done';
    } else if (lastLevel === 'error') {
      label = 'failed';
    } else if (
      isLastAttempt &&
      lastLevel !== 'warn' &&
      (topStep.status === 'running' || leaf.status === 'running')
    ) {
      label = 'running';
    } else {
      label = 'failed';
    }

    let durationMs: number;
    if (label === 'running') {
      durationMs = nowMs - first;
    } else {
      durationMs = Math.max(0, lastMs - first);
    }

    out.push({
      attempt: a,
      label,
      durationLabel: formatMs(durationMs),
    });
  }

  return out.length ? out : null;
}

/** Prefer the path that has activity: running child, else most recent finished/started. */
function bestLeafForAttemptLogs(step: WorkflowStep): WorkflowStep {
  if (!step.sub_steps?.length) return step;
  if (step.sub_steps.length === 1) return bestLeafForAttemptLogs(step.sub_steps[0]);
  const running = step.sub_steps.find((s) => s.status === 'running');
  const pick =
    running ??
    step.sub_steps
      .slice()
      .sort(
        (a, b) =>
          Math.max(recency(b), 0) - Math.max(recency(a), 0) ||
          (b.started_at ?? '').localeCompare(a.started_at ?? ''),
      )[0];
  return bestLeafForAttemptLogs(pick);
}

function recency(s: WorkflowStep): number {
  const t = s.finished_at ?? s.started_at;
  if (!t) return 0;
  return new Date(t).getTime();
}

function mergeLogsDedup(
  a: StepLogEntry[] | undefined,
  b: StepLogEntry[] | undefined,
): StepLogEntry[] {
  const seen = new Set<string>();
  const out: StepLogEntry[] = [];
  for (const l of [...(a ?? []), ...(b ?? [])]) {
    const id = l.id ?? `${l.at}\0${l.message ?? ''}\0${l.attempt ?? 0}\0${l.level}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(l);
  }
  return out;
}

function formatMs(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return '0s';
  if (v < 1000) return `${v}ms`;
  if (v < 60_000) return `${(v / 1000).toFixed(1)}s`;
  if (v < 3_600_000) return `${Math.floor(v / 60_000)}m ${Math.floor((v % 60_000) / 1000)}s`;
  return `${Math.floor(v / 3_600_000)}h ${Math.floor((v % 3_600_000) / 60_000)}m`;
}
