import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, Subscription, interval, startWith, switchMap, takeWhile } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { OPPORTUNITY_DS, WORKFLOW_DS } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { DataModeBannerComponent } from '../../shared/ui/data-mode-banner.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ScoreColorPipe } from '../../shared/pipes/score-color.pipe';
import type { ScanDetail, Opportunity, JobStatus, ActiveWorkflow } from '../../core/models';
import { DashboardPrefsService } from '../../core/config/dashboard-prefs.service';
import { DASHBOARD_POLL_INTERVAL_MS } from '../../core/config/polling';
import { ToastService } from '../../shared/ui/toast.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-scan-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    DataModeBannerComponent,
    WorkflowConstellationCardComponent,
    RelativeTimePipe,
    ScoreColorPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      [title]="'Scan ' + (scan() ? shortId(scan()!.id) : '…')"
      eyebrow="Opportunity · scan"
      icon="telescope"
    >
      <div actions>
        <a class="btn" routerLink="/opportunity">
          <lucide-icon name="arrow-right" [size]="12" style="transform: rotate(180deg)"></lucide-icon>
          Back
        </a>
        <button class="btn" (click)="copyJson()">
          <lucide-icon [name]="copied() ? 'check' : 'copy'" [size]="12"></lucide-icon>
          {{ copied() ? 'Copied' : 'Copy JSON' }}
        </button>
        <button
          *ngIf="canOfferRestart()"
          type="button"
          class="btn btn-restart"
          [disabled]="restartSubmitting()"
          [attr.title]="
            !scan()?.project_nickname
              ? 'No project nickname — cannot verify .projects folder on the server.'
              : null
          "
          (click)="openRestartModal()"
        >
          <lucide-icon name="refresh-cw" [size]="12"></lucide-icon>
          Rollback
        </button>
      </div>
    </app-page-header>

    <app-data-mode-banner module="opportunity"></app-data-mode-banner>

    <div *ngIf="error() as err" class="error-banner">
      <lucide-icon name="circle-alert" [size]="14"></lucide-icon>
      <span>{{ err }}</span>
    </div>

    <div class="sd-grid" *ngIf="!error()">
      <div class="sd-main">
        <!-- Status hero -->
        <div class="hero">
          <div class="hero-left">
            <div class="hero-label">Workflow status</div>
            <div class="hero-row">
              <app-status-badge [status]="scan()?.status ?? 'queued'"></app-status-badge>
              <ng-container *ngIf="job() as j">
                <span class="muted small">· {{ j.status }}</span>
              </ng-container>
            </div>
            <div class="hero-meta">
              <span *ngIf="scan()?.created_at">
                started {{ scan()!.created_at | relativeTime }}
              </span>
              <span *ngIf="scan()?.completed_at">
                · finished {{ scan()!.completed_at | relativeTime }}
              </span>
              <span *ngIf="scan()?.temporal_workflow_id" class="mono small">
                · {{ scan()!.temporal_workflow_id }}
              </span>
            </div>
          </div>
          <div class="hero-right">
            <div class="progress-ring">
              <svg viewBox="0 0 44 44" width="60" height="60">
                <circle cx="22" cy="22" r="18" stroke="var(--bg-3)" stroke-width="4" fill="none" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  [attr.stroke]="statusColor()"
                  stroke-width="4"
                  fill="none"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="113.1"
                  [attr.stroke-dashoffset]="113.1 - 113.1 * progress()"
                  transform="rotate(-90 22 22)"
                ></circle>
              </svg>
              <div class="progress-text">
                {{ (progress() * 100) | number: '1.0-0' }}<span class="small">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pipeline -->
        <app-workflow-constellation-card
          *ngIf="scan() as s"
          moduleId="opportunity"
          [workflowId]="s.id"
          [workflow]="workflow()"
        ></app-workflow-constellation-card>

        <!-- Tabs -->
        <app-section-card [title]="activeTab() === 'ranked' ? 'Ranked opportunities' : 'Raw payload'" [icon]="activeTab() === 'ranked' ? 'award' : 'terminal'">
          <div actions class="tabs">
            <button class="tab" [class.active]="activeTab() === 'ranked'" (click)="activeTab.set('ranked')">
              Ranked
            </button>
            <button class="tab" [class.active]="activeTab() === 'raw'" (click)="activeTab.set('raw')">
              Raw JSON
            </button>
          </div>

          <ng-container *ngIf="activeTab() === 'ranked'">
            <ng-container *ngIf="loading(); else opsList">
              <div class="stack">
                <app-skeleton height="48px" *ngFor="let _ of [1,2,3,4]"></app-skeleton>
              </div>
            </ng-container>
            <ng-template #opsList>
              <app-empty-state
                *ngIf="!opps().length"
                icon="inbox"
                title="No opportunities yet"
                subtitle="The workflow may still be running, or no candidates passed the quality gate."
              ></app-empty-state>
              <div class="ops" *ngIf="opps().length">
                <div class="op-row" *ngFor="let o of opps(); let i = index">
                  <div class="op-rank">
                    <span class="rank-n">{{ i + 1 }}</span>
                  </div>
                  <div class="op-main">
                    <div class="op-title">{{ o.title || o.problem_statement }}</div>
                    <div class="op-meta">
                      <span class="chip">{{ o.market_segment }}</span>
                      <span class="muted small" *ngIf="o.problem_statement && o.title && o.problem_statement !== o.title">
                        {{ o.problem_statement | slice: 0:140 }}{{ o.problem_statement.length > 140 ? '…' : '' }}
                      </span>
                    </div>
                    <div class="op-insights" *ngIf="o.key_insights?.length">
                      <span class="insight" *ngFor="let k of o.key_insights">
                        <lucide-icon name="sparkles" [size]="10"></lucide-icon>
                        {{ k }}
                      </span>
                    </div>
                  </div>
                  <div class="op-score" [style.color]="o.score | scoreColor">
                    <div class="score-num">{{ o.score }}</div>
                    <div class="score-lbl">score</div>
                  </div>
                </div>
              </div>
            </ng-template>
          </ng-container>

          <ng-container *ngIf="activeTab() === 'raw'">
            <pre class="raw">{{ rawJson() }}</pre>
          </ng-container>
        </app-section-card>
      </div>

      <aside class="sd-side">
        <app-section-card title="Summary" icon="info">
          <div class="kv" *ngIf="scan(); else ksk">
            <div>
              <span class="muted">Themes</span>
              <span class="val">
                <span class="chip" *ngFor="let t of scan()!.themes ?? []">{{ t }}</span>
                <span class="muted" *ngIf="!scan()!.themes?.length">—</span>
              </span>
            </div>
            <div>
              <span class="muted">Venture</span>
              <span class="val mono small">{{ scan()!.venture_id || '—' }}</span>
            </div>
            <div>
              <span class="muted">Project nickname</span>
              <span class="val mono small">{{ scan()!.project_nickname || '—' }}</span>
            </div>
            <div>
              <span class="muted">Opportunities</span>
              <span class="val">{{ scan()!.opportunities_found ?? '—' }}</span>
            </div>
            <div *ngIf="scan()!.error_message">
              <span class="muted">Error</span>
              <span class="val err">{{ scan()!.error_message }}</span>
            </div>
          </div>
          <ng-template #ksk>
            <div class="stack">
              <app-skeleton *ngFor="let _ of [1,2,3]" height="16px"></app-skeleton>
            </div>
          </ng-template>
        </app-section-card>

        <app-section-card title="What's happening" icon="cpu" hint="live view">
          <ol class="live" *ngIf="steps().length; else liveEmpty">
            <li
              *ngFor="let s of steps()"
              [attr.data-status]="s.status"
              [attr.data-warn]="s.status === 'done' && s.retries > 0 ? 'true' : null"
            >
              <span class="dot"></span>
              <span class="label">{{ s.label }}</span>
              <span class="live-retry" *ngIf="s.retries > 0" [title]="s.retries + ' retries'">
                <lucide-icon name="rotate-ccw" [size]="9"></lucide-icon>
                {{ s.retries }}
              </span>
              <span class="muted small">{{ s.statusLabel }}</span>
            </li>
          </ol>
          <ng-template #liveEmpty>
            <div class="muted small" style="padding: 6px 2px">
              Waiting for the workflow to report its first step…
            </div>
          </ng-template>
        </app-section-card>
      </aside>
    </div>

    <div
      *ngIf="restartModalOpen()"
      class="modal-backdrop"
      role="presentation"
      (click)="closeRestartModal()"
    >
      <div class="modal-dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <h2 class="modal-title">Restart from Add-Venture</h2>
          <button type="button" class="btn btn-ghost modal-close" (click)="closeRestartModal()" aria-label="Close">
            <lucide-icon name="x" [size]="14"></lucide-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-lead">
            This permanently deletes downstream data for this venture and starts structuring again.
          </p>
          <ul class="modal-list">
            <li>Database rows for <strong>Add-Venture</strong>, <strong>Brand-Aid</strong>, and <strong>Builder</strong></li>
            <li>Folders under <code>.projects/{{ scan()?.project_nickname || '…' }}/</code> for those modules</li>
            <li>In-flight Add-Venture Temporal workflows (best-effort)</li>
          </ul>
          <p class="modal-warn">
            You cannot undo this. Brand-Aid and Builder workflows may not be tracked yet; cancel is best-effort.
          </p>

          <label class="modal-field" *ngIf="uuidOpportunities().length">
            <span class="muted small">Opportunity to hand off (optional)</span>
            <select
              class="modal-select"
              [value]="restartOppId()"
              (change)="restartOppId.set($any($event.target).value)"
            >
              <option value="">First ranked (default)</option>
              <option *ngFor="let o of uuidOpportunities()" [value]="o.id">
                {{ o.title || o.problem_statement | slice: 0:72
                }}{{ (o.title || o.problem_statement || '').length > 72 ? '…' : '' }} — {{ o.score }}
              </option>
            </select>
          </label>

          <label class="modal-field" *ngIf="rollbackStepOptions().length">
            <span class="muted small">Rollback from agent/step</span>
            <select
              class="modal-select"
              [value]="rollbackStepId()"
              (change)="rollbackStepId.set($any($event.target).value)"
            >
              <option *ngFor="let s of rollbackStepOptions()" [value]="s.id">{{ s.label }}</option>
            </select>
          </label>

          <label class="modal-field">
            <span class="muted small">Type the project nickname to confirm</span>
            <input
              type="text"
              class="modal-input"
              [value]="restartNicknameInput()"
              (input)="restartNicknameInput.set($any($event.target).value)"
              autocomplete="off"
              placeholder="{{ scan()?.project_nickname || '' }}"
            />
          </label>

          <label class="modal-check">
            <input
              type="checkbox"
              [checked]="restartAck()"
              (change)="restartAck.set($any($event.target).checked)"
            />
            <span>I understand this action is irreversible.</span>
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" (click)="closeRestartModal()" [disabled]="restartSubmitting()">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            [disabled]="!canSubmitRestart() || restartSubmitting()"
            (click)="submitRestart()"
          >
            {{ restartSubmitting() ? 'Working…' : 'Restart pipeline' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sd-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 20px;
      }
      @media (max-width: 980px) {
        .sd-grid {
          grid-template-columns: 1fr;
        }
      }
      .sd-main {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .sd-side {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: var(--r-lg);
        background-image: radial-gradient(500px 200px at 100% 0%, rgba(124, 92, 255, 0.1), transparent 60%);
      }
      .hero-label {
        font-size: 11px;
        color: var(--fg-2);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 6px;
      }
      .hero-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .hero-meta {
        color: var(--fg-1);
        font-size: 12px;
        margin-top: 6px;
      }
      .progress-ring {
        position: relative;
      }
      .progress-text {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        color: var(--fg-0);
      }
      .progress-text .small {
        font-size: 10px;
        color: var(--fg-2);
        margin-left: 1px;
      }
      .pipe {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .step {
        background: var(--bg-2);
        border: 1px solid var(--border);
        padding: 12px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .step[data-status='done'] {
        border-color: rgba(34, 197, 94, 0.3);
      }
      .step[data-status='running'] {
        border-color: rgba(34, 211, 238, 0.3);
      }
      .step[data-status='failed'] {
        border-color: rgba(239, 68, 68, 0.3);
      }
      .step-head {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .step-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        display: grid;
        place-items: center;
        color: var(--fg-1);
      }
      .step[data-status='done'] .step-icon {
        color: var(--ok);
      }
      .step[data-status='running'] .step-icon {
        color: var(--accent-2);
      }
      .step[data-status='failed'] .step-icon {
        color: var(--err);
      }
      .step-label {
        font-size: 13px;
        font-weight: 600;
      }
      .step-bar {
        height: 4px;
        background: var(--bg-1);
        border-radius: 999px;
        overflow: hidden;
      }
      .step-fill {
        height: 100%;
        width: 0;
        background: var(--fg-2);
        transition: width 0.4s;
      }
      .step-fill.done {
        width: 100%;
        background: var(--ok);
      }
      .step-fill.run {
        width: 70%;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
        background-size: 200% 100%;
        animation: slide 1.2s infinite;
      }
      @keyframes slide {
        from {
          background-position: 100% 0;
        }
        to {
          background-position: -100% 0;
        }
      }
      @media (max-width: 980px) {
        .pipe {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .tabs {
        display: flex;
        gap: 4px;
        background: var(--bg-2);
        padding: 3px;
        border-radius: 8px;
        border: 1px solid var(--border);
      }
      .tab {
        background: transparent;
        border: 0;
        padding: 5px 10px;
        color: var(--fg-1);
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
      }
      .tab.active {
        background: var(--bg-0);
        color: var(--fg-0);
      }
      .ops {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .op-row {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        gap: 14px;
        padding: 14px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 10px;
        align-items: center;
      }
      .op-rank {
        display: grid;
        place-items: center;
      }
      .rank-n {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--bg-0);
        border: 1px solid var(--border);
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 12px;
        color: var(--fg-1);
      }
      .op-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .op-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .op-insights {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 6px;
      }
      .insight {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(124, 92, 255, 0.08);
        color: #b8a5ff;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 999px;
      }
      .op-score {
        text-align: right;
      }
      .score-num {
        font-family: 'Inter Tight', Inter, sans-serif;
        font-size: 28px;
        font-weight: 700;
      }
      .score-lbl {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--fg-2);
      }
      .raw {
        background: var(--bg-0);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 14px;
        font-size: 11px;
        max-height: 420px;
        overflow: auto;
        color: var(--fg-1);
      }
      .kv {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .kv > div {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 13px;
      }
      .kv .val {
        color: var(--fg-0);
        text-align: right;
      }
      .kv .val.err {
        color: var(--err);
      }
      .kv .chip {
        margin-left: 4px;
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .mono {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
      }
      .live {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .live li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
      }
      .live .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-2);
      }
      .live li[data-status='done'] .dot {
        background: var(--ok);
      }
      .live li[data-status='running'] .dot {
        background: var(--accent-2);
        box-shadow: 0 0 8px var(--accent-2);
      }
      .live li[data-status='failed'] .dot {
        background: var(--err);
      }
      .live li[data-warn='true'] .dot {
        background: var(--warn, #f59e0b);
      }
      .live li[data-warn='true'] .muted {
        color: var(--warn, #f59e0b);
      }
      .live .label {
        flex: 1;
      }
      .live-retry {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: 700;
        background: color-mix(in srgb, var(--warn, #f59e0b) 16%, var(--bg-1));
        color: var(--warn, #f59e0b);
        border: 1px solid color-mix(in srgb, var(--warn, #f59e0b) 40%, transparent);
      }
      .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        background: rgba(239, 68, 68, 0.08);
        color: var(--err);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 10px;
        margin-bottom: 16px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        background: var(--bg-3);
        color: var(--fg-1);
        border-radius: 999px;
        font-size: 11px;
      }
      .btn-restart {
        border-color: rgba(245, 158, 11, 0.45);
        color: #fbbf24;
      }
      .btn-restart:hover:not(:disabled) {
        background: rgba(245, 158, 11, 0.08);
      }
      .btn-danger {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.45);
        color: #fecaca;
      }
      .btn-danger:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.28);
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 80;
        background: rgba(0, 0, 0, 0.55);
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .modal-dialog {
        width: min(480px, 100%);
        max-height: min(90vh, 640px);
        overflow: auto;
        background: var(--bg-0);
        border: 1px solid var(--border);
        border-radius: var(--r-lg);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
      }
      .modal-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--border);
      }
      .modal-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
      }
      .modal-close {
        padding: 4px;
      }
      .modal-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-size: 13px;
        color: var(--fg-1);
      }
      .modal-lead {
        margin: 0;
      }
      .modal-list {
        margin: 0;
        padding-left: 18px;
      }
      .modal-warn {
        margin: 0;
        color: #fecaca;
        font-size: 12px;
      }
      .modal-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .modal-input,
      .modal-select {
        font: inherit;
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--bg-1);
        color: var(--fg-0);
      }
      .modal-check {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .modal-check input {
        margin-top: 2px;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 14px 18px;
        border-top: 1px solid var(--border);
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    `,
  ],
})
export class ScanDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly ds = inject(OPPORTUNITY_DS);
  private readonly workflowDs = inject(WORKFLOW_DS);
  private readonly prefs = inject(DashboardPrefsService);
  private readonly toast = inject(ToastService);
  private readonly autoRefresh$ = toObservable(this.prefs.autoRefreshEnabled);

  readonly scan = signal<ScanDetail | null>(null);
  readonly opps = signal<Opportunity[]>([]);
  readonly job = signal<JobStatus | null>(null);
  readonly workflow = signal<ActiveWorkflow | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'ranked' | 'raw'>('ranked');
  readonly copied = signal<boolean>(false);

  readonly restartModalOpen = signal(false);
  readonly restartNicknameInput = signal('');
  readonly restartAck = signal(false);
  readonly restartOppId = signal('');
  readonly rollbackStepId = signal('');
  readonly restartSubmitting = signal(false);

  readonly canOfferRestart = computed(() => {
    const s = this.scan();
    return !!(s?.status === 'completed' && s.venture_id && UUID_RE.test(s.venture_id));
  });

  readonly uuidOpportunities = computed(() =>
    this.opps().filter((o) => UUID_RE.test(o.id)),
  );

  readonly canSubmitRestart = computed(() => {
    const s = this.scan();
    const nick = s?.project_nickname;
    if (!nick || !this.restartAck()) return false;
    return this.restartNicknameInput().trim() === nick;
  });

  readonly rollbackStepOptions = computed(() => {
    const wf = this.workflow();
    if (!wf?.steps?.length) return [] as Array<{ id: string; label: string }>;
    return wf.steps.map((s) => ({ id: s.id, label: s.label || s.id }));
  });

  readonly progress = computed(() => {
    const wf = this.workflow();
    if (wf) return Math.min(1, Math.max(0, wf.progress));
    // Fallback to scan status while the observability workflow hasn't been
    // resolved yet (very early, or for legacy scans without an obs run).
    const s = this.scan();
    if (s?.status === 'completed') return 1;
    if (s?.status === 'failed') return 1;
    return 0;
  });

  readonly statusColor = computed(() => {
    const wf = this.workflow();
    const status = wf?.status ?? this.scan()?.status;
    if (status === 'completed') return 'var(--ok)';
    if (status === 'failed') return 'var(--err)';
    if (status === 'running' || status === 'queued') return 'var(--accent-2)';
    return 'var(--fg-2)';
  });

  readonly steps = computed(() => {
    const wf = this.workflow();
    if (!wf) {
      return [] as Array<{
        id: string;
        label: string;
        status: string;
        retries: number;
        statusLabel: string;
      }>;
    }
    return wf.steps.map((s) => {
      const retriesField = s.fields?.['retries'];
      const retriesFromBackend =
        retriesField && typeof retriesField.value === 'number' ? retriesField.value : 0;
      const subFails = (s.sub_steps ?? []).filter(
        (ss) => !!ss.quality_gate && ss.quality_gate.passed === false,
      ).length;
      const retries = Math.max(retriesFromBackend, subFails);
      const statusLabel =
        s.status === 'done' && retries > 0 ? 'done · with retries' : s.status;
      return {
        id: s.id,
        label: s.label,
        status: s.status,
        retries,
        statusLabel,
      };
    });
  });

  readonly rawJson = computed(() => {
    const s = this.scan();
    if (!s) return '';
    return JSON.stringify(s.result ?? {}, null, 2);
  });

  private pollSub?: Subscription;
  private workflowSub?: Subscription;
  private workflowPollSub?: Subscription;

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      if (id) this.load(id);
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.workflowSub?.unsubscribe();
    this.workflowPollSub?.unsubscribe();
  }

  copyJson(): void {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(this.rawJson()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }

  openRestartModal(): void {
    if (!this.scan()?.project_nickname) {
      this.toast.error(
        'Restart unavailable',
        'This scan has no project nickname. We block restart to avoid wiping the wrong project.',
      );
      return;
    }
    this.restartNicknameInput.set('');
    this.restartAck.set(false);
    this.restartOppId.set('');
    this.rollbackStepId.set(this.rollbackStepOptions()[0]?.id ?? '');
    this.restartModalOpen.set(true);
  }

  closeRestartModal(): void {
    if (this.restartSubmitting()) return;
    this.restartModalOpen.set(false);
  }

  submitRestart(): void {
    const s = this.scan();
    if (!s || !this.canSubmitRestart()) return;
    this.restartSubmitting.set(true);
    const oppRaw = this.restartOppId().trim();
    this.ds
      .restartDownstreamScan(s.id, {
        confirm_nickname: this.restartNicknameInput().trim(),
        acknowledge_irreversible: true,
        ...(oppRaw ? { opportunity_id: oppRaw } : {}),
        ...(this.rollbackStepId().trim() ? { rollback_from_step: this.rollbackStepId().trim() } : {}),
      })
      .subscribe({
        next: (r) => {
          this.restartSubmitting.set(false);
          this.closeRestartModal();
          this.toast.success('Pipeline restarted', `Workflow ${r.workflow_id}`);
          this.load(s.id);
        },
        error: (e: unknown) => {
          this.restartSubmitting.set(false);
          this.toast.error('Restart failed', this.extractRestartError(e));
        },
      });
  }

  shortId(id: string): string {
    if (!id) return '';
    if (id.length <= 18) return id;
    return id.slice(0, 10) + '…' + id.slice(-4);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.ds.getScan(id).subscribe({
      next: (s) => {
        this.scan.set(s);
        this.loading.set(false);
        if (s.status === 'completed') {
          this.ds.listOpportunities(s.id).subscribe({
            next: (ops) => this.opps.set(ops),
            error: () => this.opps.set([]),
          });
        }
        // Fetch (and poll) the structured workflow run from the observability
        // store. This is the single source of truth shared with the
        // constellation card via [workflow]="workflow()".
        this.loadWorkflow(s.id);
        if (s.temporal_workflow_id && s.status !== 'completed' && s.status !== 'failed') {
          this.pollSub?.unsubscribe();
          const scanId = s.id;
          const temporalId = s.temporal_workflow_id;
          this.pollSub = this.autoRefresh$
            .pipe(
              switchMap((enabled) =>
                enabled
                  ? this.ds.pollJob(temporalId)
                  : EMPTY,
              ),
            )
            .subscribe({
              next: (j) => {
                this.job.set(j);
                if (j.status === 'COMPLETED' || j.status === 'FAILED') {
                  this.ds.getScan(scanId).subscribe((fresh) => {
                    this.scan.set(fresh);
                    if (fresh.status === 'completed') {
                      this.ds.listOpportunities(fresh.id).subscribe({
                        next: (ops) => this.opps.set(ops),
                        error: () => this.opps.set([]),
                      });
                    }
                  });
                }
              },
              error: () => {
                /* ignore polling errors */
              },
            });
        }
      },
      error: (e: unknown) => {
        this.loading.set(false);
        this.error.set(this.extractError(e));
      },
    });
  }

  private loadWorkflow(scanId: string): void {
    this.workflowSub?.unsubscribe();
    this.workflowPollSub?.unsubscribe();
    this.workflowSub = this.workflowDs.get(scanId, 'opportunity').subscribe({
      next: (wf) => {
        this.workflow.set(wf);
        if (wf && (wf.status === 'running' || wf.status === 'queued')) {
          this.startWorkflowPolling(scanId);
        }
      },
      error: () => this.workflow.set(null),
    });
  }

  private startWorkflowPolling(scanId: string): void {
    this.workflowPollSub?.unsubscribe();
    this.workflowPollSub = this.autoRefresh$
      .pipe(
        switchMap((enabled) =>
          enabled
            ? interval(DASHBOARD_POLL_INTERVAL_MS).pipe(
                startWith(0),
                switchMap(() => this.workflowDs.get(scanId, 'opportunity')),
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

  private extractError(e: unknown): string {
    const any = e as any;
    if (any?.status === 0) return 'Network error — is the api-gateway running on :3010?';
    if (any?.status === 401) return 'Unauthorized — set a valid token in Settings.';
    if (any?.status === 404) return 'Scan not found.';
    return any?.error?.error ?? any?.message ?? 'Unknown error';
  }

  private extractRestartError(e: unknown): string {
    const any = e as any;
    const msg = any?.error?.error ?? any?.error?.message ?? any?.message;
    if (typeof msg === 'string' && msg.length) return msg;
    return this.extractError(e);
  }
}
