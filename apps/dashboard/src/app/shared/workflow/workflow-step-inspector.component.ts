import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RelativeTimePipe } from '../pipes/relative-time.pipe';
import { LogValueComponent } from './log-value.component';
import { StepBulletComponent } from './step-bullet.component';
import type {
  AgentCapability,
  LogValue,
  StepLogEntry,
  WorkflowStep,
} from '../../core/models';
import { normalizeLucideStepIcon } from './lucide-step-icon';

interface FieldEntry {
  key: string;
  value: LogValue;
}

@Component({
  selector: 'app-workflow-step-inspector',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    RelativeTimePipe,
    LogValueComponent,
    StepBulletComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="inspect" *ngIf="step">
      <header class="ins-head">
        <div class="ins-badge" [style.--accent]="accent">
          <span class="dot"></span>
          Step · <strong>{{ step.status }}</strong>
        </div>
        <button class="close" (click)="close.emit()" aria-label="Close">
          <lucide-icon name="x" [size]="14"></lucide-icon>
        </button>
      </header>

      <h3>
        <lucide-icon [name]="normalizeLucideStepIcon(step.icon)" [size]="14"></lucide-icon>
        {{ step.label }}
      </h3>
      <p class="muted" *ngIf="step.description">{{ step.description }}</p>

      <!-- Quality gate banner (PASS/FAIL with attempt counter) -->
      <section class="qgate" *ngIf="step.quality_gate as g" [attr.data-passed]="g.passed">
        <div class="qg-head">
          <lucide-icon [name]="g.passed ? 'shield-check' : 'shield-alert'" [size]="14"></lucide-icon>
          <span class="qg-name">{{ g.name }}</span>
          <span class="qg-tag mono">{{ g.passed ? 'PASS' : 'FAIL' }}</span>
          <span class="qg-attempt mono small muted">
            attempt {{ g.attempt }}<ng-container *ngIf="g.max_attempts">/{{ g.max_attempts }}</ng-container>
          </span>
        </div>
        <div class="qg-body">
          <app-log-value *ngIf="g.score" [value]="g.score"></app-log-value>
          <span class="muted small" *ngIf="g.threshold != null">threshold {{ g.threshold }}</span>
        </div>
        <div class="qg-reason muted small" *ngIf="g.reason">{{ g.reason }}</div>
      </section>

      <section class="llm-usage" *ngIf="step.llm_usage as u">
        <h4>LLM usage</h4>
        <dl class="field-grid">
          <dt>Requests</dt>
          <dd class="mono">{{ u.request_count }}</dd>
          <dt>Prompt tokens</dt>
          <dd class="mono">{{ u.prompt_tokens | number }}</dd>
          <dt>Completion tokens</dt>
          <dd class="mono">{{ u.completion_tokens | number }}</dd>
          <dt>Total tokens</dt>
          <dd class="mono">{{ u.total_tokens | number }}</dd>
          <dt>Est. cost (USD)</dt>
          <dd class="mono">{{ u.cost_usd != null ? (u.cost_usd | number: '1.2-4') : '—' }}</dd>
        </dl>
      </section>

      <!-- Structured fields (typed key/value grid) -->
      <section class="fields" *ngIf="fieldEntries().length">
        <h4>Fields</h4>
        <dl class="field-grid">
          <ng-container *ngFor="let f of fieldEntries(); trackBy: trackField">
            <dt>{{ f.key }}</dt>
            <dd>
              <app-log-value [value]="f.value"></app-log-value>
            </dd>
          </ng-container>
        </dl>
      </section>

      <!-- Sub-steps (collapsible) -->
      <section class="subs" *ngIf="step.sub_steps?.length">
        <button class="subs-toggle" (click)="subsOpen.set(!subsOpen())">
          <lucide-icon [name]="subsOpen() ? 'chevron-down' : 'chevron-right'" [size]="12"></lucide-icon>
          Sub-steps
          <span class="muted small">· {{ step.sub_steps!.length }}</span>
        </button>
        <ul class="sub-list" *ngIf="subsOpen()">
          <li *ngFor="let ss of step.sub_steps; trackBy: trackSub">
            <app-step-bullet [step]="ss" [accent]="accent" [size]="28" [strokeWidth]="2"></app-step-bullet>
            <div class="sub-main">
              <div class="sub-top">
                <span class="sub-label">{{ ss.label }}</span>
                <span class="sub-status mono small" [attr.data-status]="ss.status">{{ ss.status }}</span>
                <span
                  class="sub-attempt mono small muted"
                  *ngIf="ss.attempt && (ss.attempt.current > 1 || (ss.attempt.max ?? 1) > 1)"
                >
                  attempt {{ ss.attempt.current }}<ng-container *ngIf="ss.attempt.max">/{{ ss.attempt.max }}</ng-container>
                </span>
              </div>
              <div class="muted small" *ngIf="ss.description">{{ ss.description }}</div>

              <!-- Inline quality gate: shows score · threshold · PASS/FAIL · reason -->
              <div class="sub-qgate" *ngIf="ss.quality_gate as g" [attr.data-passed]="g.passed">
                <span class="qg-tag mono">{{ g.passed ? 'PASS' : 'FAIL' }}</span>
                <app-log-value *ngIf="g.score" [value]="g.score"></app-log-value>
                <span class="muted small" *ngIf="g.threshold != null">· threshold {{ g.threshold }}</span>
                <span class="muted small qg-reason" *ngIf="g.reason">— {{ g.reason }}</span>
              </div>

              <!-- Why was this attempt aborted/retried? -->
              <div class="sub-attempt-reason muted small" *ngIf="ss.attempt?.reason">
                {{ ss.attempt!.reason }}
              </div>

              <!--
                Scoring breakdown: when a sub-step carries dimensions plus
                recommendation/confidence/notes fields (as the scoring agent
                does), we render them as a structured "why" card instead of
                a flat key/value list. This is the surface through which
                users see WHY a score was given.
              -->
              <div class="scoring-breakdown" *ngIf="scoringBreakdown(ss) as sb">
                <!-- Recommendation + confidence summary row -->
                <div class="sb-summary" *ngIf="sb.recommendation || sb.confidence">
                  <span class="sb-label muted small" *ngIf="sb.recommendation">Recommendation</span>
                  <app-log-value *ngIf="sb.recommendation" [value]="sb.recommendation"></app-log-value>
                  <span class="sb-divider muted small" *ngIf="sb.recommendation && sb.confidence">·</span>
                  <ng-container *ngIf="sb.confidence">
                    <span class="sb-label muted small">Confidence</span>
                    <app-log-value [value]="sb.confidence"></app-log-value>
                  </ng-container>
                </div>

                <!--
                  What the agent SAW: a compact view of the analyst dossier
                  that was fed into scoring. This is the primary answer to
                  "why did the agent give this score?" — start by checking
                  whether the inputs themselves were thin/missing.
                -->
                <details class="sb-debug" *ngIf="sb.analystInput" open>
                  <summary>
                    <lucide-icon name="inbox" [size]="11"></lucide-icon>
                    What the agent received
                  </summary>
                  <div class="sb-debug-body">
                    <app-log-value [value]="sb.analystInput"></app-log-value>
                  </div>
                </details>

                <!-- Per-dimension cards (when the agent returned them) -->
                <div class="sb-dim-list" *ngIf="sb.dimensions.length">
                  <div class="sb-dim" *ngFor="let d of sb.dimensions; trackBy: trackDim">
                    <div class="sb-dim-head">
                      <span class="sb-dim-name">{{ d.label }}</span>
                      <app-log-value *ngIf="d.score" [value]="d.score"></app-log-value>
                    </div>
                    <div class="sb-dim-rationale" *ngIf="d.rationale">
                      <app-log-value [value]="d.rationale"></app-log-value>
                    </div>
                    <div class="sb-dim-factors" *ngIf="d.factors">
                      <app-log-value [value]="d.factors"></app-log-value>
                    </div>
                  </div>
                </div>

                <!--
                  When the agent returned NO dimensions, show a loud banner
                  pointing the user to the raw output blob below. This is
                  the case the user hit (score 0/100 with no explanation).
                -->
                <div
                  class="sb-no-dims"
                  *ngIf="!sb.dimensions.length && (sb.rawOutput || sb.rawInput)"
                >
                  <lucide-icon name="circle-alert" [size]="12"></lucide-icon>
                  <span>
                    Scoring agent did not return a per-dimension breakdown — see the raw output below for the agent's actual response.
                  </span>
                </div>

                <div class="sb-notes" *ngIf="sb.notes">
                  <span class="sb-label muted small">Scoring notes</span>
                  <app-log-value [value]="sb.notes"></app-log-value>
                </div>

                <!-- Raw input/output JSON, collapsed by default unless the agent returned no dimensions -->
                <ng-container *ngIf="sb.rawInput || sb.rawOutput">
                  <button
                    class="sb-debug-toggle"
                    type="button"
                    (click)="toggleDebug(ss)"
                  >
                    <lucide-icon
                      [name]="isDebugOpen(ss) || !sb.dimensions.length ? 'chevron-down' : 'chevron-right'"
                      [size]="12"
                    ></lucide-icon>
                    Raw agent I/O
                    <span class="muted small">(JSON)</span>
                  </button>
                  <div
                    class="sb-debug-grid"
                    *ngIf="isDebugOpen(ss) || !sb.dimensions.length"
                  >
                    <div class="sb-debug-block" *ngIf="sb.rawInput">
                      <span class="sb-label muted small">→ Sent to agent</span>
                      <app-log-value [value]="sb.rawInput"></app-log-value>
                    </div>
                    <div class="sb-debug-block" *ngIf="sb.rawOutput">
                      <span class="sb-label muted small">← Agent response</span>
                      <app-log-value [value]="sb.rawOutput"></app-log-value>
                    </div>
                  </div>
                </ng-container>
              </div>

              <!--
                Remaining structured fields (anything we did not pull into
                the breakdown card above). Keeps the renderer extensible
                for non-scoring sub-steps without duplicating values.
              -->
              <div class="sub-fields" *ngIf="ssOtherFields(ss).length">
                <ng-container *ngFor="let f of ssOtherFields(ss); trackBy: trackField">
                  <span class="sub-field">
                    <span class="muted small">{{ f.key }}:</span>
                    <app-log-value [value]="f.value"></app-log-value>
                  </span>
                </ng-container>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Agents -->
      <div class="agents" *ngIf="agents?.length">
        <div class="agent-row" *ngFor="let a of agents">
          <span class="ag-dot" [style.background]="accent"></span>
          <div class="ag-main">
            <div class="ag-name">{{ a.label || a.name }}</div>
            <div class="ag-desc muted small">{{ a.description }}</div>
          </div>
          <span class="ag-model mono small" *ngIf="a.model">{{ a.model }}</span>
        </div>
      </div>

      <!-- Legacy I/O tags -->
      <dl class="io" *ngIf="step.inputs?.length || step.outputs?.length">
        <ng-container *ngIf="step.inputs?.length">
          <dt>Inputs</dt>
          <dd>
            <span class="tag" *ngFor="let x of step.inputs">{{ x }}</span>
          </dd>
        </ng-container>
        <ng-container *ngIf="step.outputs?.length">
          <dt>Outputs</dt>
          <dd>
            <span class="tag out" *ngFor="let x of step.outputs">{{ x }}</span>
          </dd>
        </ng-container>
      </dl>

      <div class="timing" *ngIf="step.started_at || step.finished_at || step.duration_ms">
        <div *ngIf="step.started_at">
          <span class="muted small">Started</span>
          <span>{{ step.started_at | relativeTime }}</span>
        </div>
        <div *ngIf="step.finished_at">
          <span class="muted small">Finished</span>
          <span>{{ step.finished_at | relativeTime }}</span>
        </div>
        <div *ngIf="step.duration_ms">
          <span class="muted small">Duration</span>
          <span>{{ formatDuration(step.duration_ms) }}</span>
        </div>
      </div>

      <!-- Structured log timeline (StepLogEntry[]). Falls back to legacy events. -->
      <section class="events" *ngIf="logEntries().length">
        <h4>Timeline</h4>
        <ol>
          <li *ngFor="let e of logEntries(); trackBy: trackEntry" [attr.data-sev]="logSeverity(e)">
            <span class="ev-dot"></span>
            <div class="ev-body">
              <div class="ev-msg">{{ e.message }}</div>
              <div class="muted small">
                {{ e.at | relativeTime }}
                <span *ngIf="e.agent_id"> · {{ e.agent_id }}</span>
                <span *ngIf="e.attempt && e.attempt > 1"> · attempt {{ e.attempt }}</span>
              </div>
              <div class="ev-fields" *ngIf="entryFields(e).length">
                <ng-container *ngFor="let f of entryFields(e); trackBy: trackField">
                  <span class="ev-field">
                    <span class="muted small">{{ f.key }}:</span>
                    <app-log-value [value]="f.value"></app-log-value>
                  </span>
                </ng-container>
              </div>
            </div>
          </li>
        </ol>
      </section>
    </aside>
  `,
  styles: [
    `
      .inspect {
        --accent: var(--accent);
        width: 360px;
        max-width: 100%;
        background: rgba(18, 21, 29, 0.95);
        backdrop-filter: blur(14px);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        animation: slide 220ms ease-out;
        max-height: 100%;
        overflow: auto;
      }
      @keyframes slide {
        from {
          opacity: 0;
          transform: translateX(8px);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      .ins-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ins-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .ins-badge .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 8px var(--accent);
      }
      .ins-badge strong {
        color: var(--fg-0);
      }
      h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--fg-0);
      }
      h4 {
        margin: 0 0 6px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--fg-2);
      }
      p {
        margin: 0;
        color: var(--fg-1);
        font-size: 12px;
      }
      .close {
        background: transparent;
        border: 0;
        color: var(--fg-2);
        cursor: pointer;
      }
      .qgate {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px 12px;
        background: var(--bg-2);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .qgate[data-passed='true'] {
        border-color: color-mix(in srgb, var(--ok, #22c55e) 50%, transparent);
        background: color-mix(in srgb, var(--ok, #22c55e) 10%, var(--bg-2));
      }
      .qgate[data-passed='false'] {
        border-color: color-mix(in srgb, var(--err, #ef4444) 50%, transparent);
        background: color-mix(in srgb, var(--err, #ef4444) 10%, var(--bg-2));
      }
      .qg-head {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--fg-0);
      }
      .qg-name {
        font-weight: 600;
      }
      .qg-tag {
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 999px;
        background: var(--bg-1);
        color: var(--fg-1);
      }
      .qgate[data-passed='true'] .qg-tag {
        background: color-mix(in srgb, var(--ok, #22c55e) 18%, var(--bg-1));
        color: var(--ok, #22c55e);
      }
      .qgate[data-passed='false'] .qg-tag {
        background: color-mix(in srgb, var(--err, #ef4444) 18%, var(--bg-1));
        color: var(--err, #ef4444);
      }
      .qg-attempt {
        margin-left: auto;
      }
      .qg-body {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .field-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 6px 12px;
        margin: 0;
      }
      .field-grid dt {
        font-size: 11px;
        color: var(--fg-2);
      }
      .field-grid dd {
        margin: 0;
      }
      .subs-toggle {
        background: transparent;
        border: 0;
        color: var(--fg-1);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 0;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .sub-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .sub-list li {
        display: grid;
        grid-template-columns: 28px 1fr;
        gap: 10px;
        align-items: flex-start;
        padding: 8px 10px;
        background: var(--bg-2);
        border-radius: 8px;
      }
      .sub-top {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sub-label {
        font-size: 12px;
        color: var(--fg-0);
        font-weight: 600;
      }
      .sub-status {
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 9px;
        color: var(--fg-2);
      }
      .sub-status[data-status='running'] {
        color: var(--accent-2);
      }
      .sub-status[data-status='done'] {
        color: var(--ok);
      }
      .sub-status[data-status='failed'] {
        color: var(--err);
      }
      .sub-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 10px;
        margin-top: 4px;
      }
      .sub-field {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .sub-attempt {
        margin-left: auto;
      }
      .sub-qgate {
        margin-top: 4px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 6px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        flex-wrap: wrap;
      }
      .sub-qgate[data-passed='true'] {
        border-color: color-mix(in srgb, var(--ok, #22c55e) 50%, transparent);
        background: color-mix(in srgb, var(--ok, #22c55e) 10%, var(--bg-1));
      }
      .sub-qgate[data-passed='false'] {
        border-color: color-mix(in srgb, var(--err, #ef4444) 50%, transparent);
        background: color-mix(in srgb, var(--err, #ef4444) 10%, var(--bg-1));
      }
      .sub-qgate .qg-tag {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--bg-1);
        color: var(--fg-1);
      }
      .sub-qgate[data-passed='true'] .qg-tag {
        background: color-mix(in srgb, var(--ok, #22c55e) 20%, var(--bg-1));
        color: var(--ok, #22c55e);
      }
      .sub-qgate[data-passed='false'] .qg-tag {
        background: color-mix(in srgb, var(--err, #ef4444) 20%, var(--bg-1));
        color: var(--err, #ef4444);
      }
      .qg-reason {
        flex-basis: 100%;
      }
      .sub-attempt-reason {
        margin-top: 2px;
        font-style: italic;
      }
      .agents {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .agent-row {
        display: grid;
        grid-template-columns: 10px 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 8px 10px;
        background: var(--bg-2);
        border-radius: 8px;
      }
      .ag-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        box-shadow: 0 0 8px currentColor;
      }
      .ag-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--fg-0);
      }
      .ag-desc {
        font-size: 11px;
      }
      .ag-model {
        color: var(--fg-1);
      }
      .io {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 6px 10px;
        margin: 0;
      }
      .io dt {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--fg-2);
      }
      .io dd {
        margin: 0;
      }
      .tag {
        display: inline-block;
        font-size: 10px;
        padding: 2px 6px;
        background: rgba(34, 211, 238, 0.1);
        color: #67e8f9;
        border-radius: 4px;
        margin-right: 4px;
        margin-bottom: 4px;
      }
      .tag.out {
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
      }
      .timing {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        padding: 10px;
        background: var(--bg-2);
        border-radius: 8px;
      }
      .timing > div {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 12px;
        color: var(--fg-0);
      }
      .events ol {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .events li {
        display: grid;
        grid-template-columns: 10px 1fr;
        gap: 8px;
        align-items: flex-start;
        padding: 6px 8px;
        background: var(--bg-2);
        border-radius: 6px;
      }
      .ev-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--fg-2);
        margin-top: 6px;
      }
      .events li[data-sev='success'] .ev-dot {
        background: var(--ok);
      }
      .events li[data-sev='warn'] .ev-dot {
        background: var(--warn);
      }
      .events li[data-sev='error'] .ev-dot {
        background: var(--err);
      }
      .events li[data-sev='info'] .ev-dot {
        background: var(--accent-2);
      }
      .ev-msg {
        color: var(--fg-0);
        font-size: 12px;
      }
      .ev-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 10px;
        margin-top: 4px;
      }
      .ev-field {
        display: inline-flex;
        align-items: center;
        gap: 4px;
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
      .scoring-breakdown {
        margin-top: 6px;
        padding: 8px 10px;
        background: color-mix(in srgb, var(--accent) 4%, var(--bg-2));
        border: 1px solid var(--border);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .sb-summary {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .sb-label {
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .sb-divider {
        opacity: 0.6;
      }
      .sb-dim-list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 6px;
      }
      .sb-dim {
        padding: 6px 8px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .sb-dim-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }
      .sb-dim-name {
        font-size: 11px;
        font-weight: 700;
        color: var(--fg-0);
      }
      .sb-dim-rationale {
        font-size: 11px;
        color: var(--fg-1);
        line-height: 1.45;
      }
      .sb-dim-factors {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .sb-notes {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .sb-debug {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 6px 8px;
      }
      .sb-debug summary {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 700;
        color: var(--fg-1);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        list-style: none;
      }
      .sb-debug summary::-webkit-details-marker {
        display: none;
      }
      .sb-debug-body {
        margin-top: 6px;
      }
      .sb-no-dims {
        display: flex;
        gap: 6px;
        align-items: flex-start;
        padding: 6px 8px;
        background: color-mix(in srgb, var(--warn, #f59e0b) 12%, var(--bg-1));
        color: var(--warn, #f59e0b);
        border: 1px solid color-mix(in srgb, var(--warn, #f59e0b) 40%, transparent);
        border-radius: 6px;
        font-size: 11px;
        line-height: 1.45;
      }
      .sb-no-dims lucide-icon {
        flex-shrink: 0;
        margin-top: 1px;
      }
      .sb-debug-toggle {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: 0;
        color: var(--fg-1);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        cursor: pointer;
        padding: 0;
        margin-top: 2px;
      }
      .sb-debug-toggle:hover {
        color: var(--accent);
      }
      .sb-debug-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .sb-debug-block {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 6px 8px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 6px;
      }
    `,
  ],
})
export class WorkflowStepInspectorComponent {
  readonly normalizeLucideStepIcon = normalizeLucideStepIcon;

  @Input() step: WorkflowStep | null = null;
  @Input() agents: AgentCapability[] = [];
  @Input() accent = 'var(--accent)';
  @Output() close = new EventEmitter<void>();

  readonly subsOpen = signal<boolean>(true);

  fieldEntries(): FieldEntry[] {
    const f = this.step?.fields;
    if (!f) return [];
    return Object.entries(f).map(([key, value]) => ({ key, value }));
  }

  ssFieldEntries(ss: WorkflowStep): FieldEntry[] {
    const f = ss.fields;
    if (!f) return [];
    return Object.entries(f).map(([key, value]) => ({ key, value }));
  }

  /**
   * Same as `ssFieldEntries` but excludes the keys that are rendered by the
   * dedicated scoring breakdown card (including the analyst input + raw
   * agent I/O blocks). Prevents the same value from showing up twice in
   * the inspector.
   */
  ssOtherFields(ss: WorkflowStep): FieldEntry[] {
    const sb = this.scoringBreakdown(ss);
    if (!sb) return this.ssFieldEntries(ss);
    const skip = new Set([
      'dimensions',
      'recommendation',
      'confidence',
      'notes',
      'analyst_input',
      'raw_input',
      'raw_output',
    ]);
    return this.ssFieldEntries(ss).filter((f) => !skip.has(f.key));
  }

  /**
   * If the sub-step has structured scoring output (dimensions array +
   * recommendation/confidence/notes), unpack it into a typed view-model so
   * the template can render dimension cards instead of a generic key-value
   * grid. Returns `null` for sub-steps that don't carry scoring data.
   */
  scoringBreakdown(ss: WorkflowStep): {
    dimensions: Array<{ label: string; score?: LogValue; rationale?: LogValue; factors?: LogValue }>;
    recommendation?: LogValue;
    confidence?: LogValue;
    notes?: LogValue;
    analystInput?: LogValue;
    rawInput?: LogValue;
    rawOutput?: LogValue;
  } | null {
    const f = ss.fields;
    if (!f) return null;
    const dimsField = f['dimensions'];
    const hasDims = !!dimsField && dimsField.kind === 'array' && Array.isArray(dimsField.value);
    const recommendation = f['recommendation'];
    const confidence = f['confidence'];
    const notes = f['notes'];
    const analystInput = f['analyst_input'];
    const rawInput = f['raw_input'];
    const rawOutput = f['raw_output'];
    if (
      !hasDims &&
      !recommendation &&
      !confidence &&
      !notes &&
      !analystInput &&
      !rawInput &&
      !rawOutput
    ) {
      return null;
    }

    const dimensions: Array<{
      label: string;
      score?: LogValue;
      rationale?: LogValue;
      factors?: LogValue;
    }> = [];
    if (hasDims && dimsField) {
      const items = dimsField.value as unknown[];
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const inner = item as { kind?: string; value?: unknown };
        const obj =
          inner.kind === 'object' && inner.value && typeof inner.value === 'object'
            ? (inner.value as Record<string, LogValue | undefined>)
            : (item as Record<string, LogValue | undefined>);
        const dimensionField = obj['dimension'];
        const label =
          dimensionField && typeof dimensionField.value === 'string'
            ? (dimensionField.value as string)
            : 'Dimension';
        dimensions.push({
          label,
          score: obj['score'],
          rationale: obj['rationale'],
          factors: obj['factors'],
        });
      }
    }

    return {
      dimensions,
      recommendation,
      confidence,
      notes,
      analystInput,
      rawInput,
      rawOutput,
    };
  }

  /**
   * Per-substep open/closed state for the heavy debug panels (raw JSON
   * blobs). Keyed by sub-step id so each one remembers its own toggle.
   */
  readonly debugOpen = signal<Record<string, boolean>>({});

  isDebugOpen(ss: WorkflowStep): boolean {
    return !!this.debugOpen()[ss.id];
  }

  toggleDebug(ss: WorkflowStep): void {
    const cur = this.debugOpen();
    this.debugOpen.set({ ...cur, [ss.id]: !cur[ss.id] });
  }

  trackDim(_: number, d: { label: string }): string {
    return d.label;
  }

  /** Returns the structured `log[]` if present, otherwise adapts legacy `events[]`. */
  logEntries(): StepLogEntry[] {
    const log = this.step?.log;
    if (log && log.length) return log;
    const ev = this.step?.events;
    if (!ev?.length) return [];
    return ev.map((e) => ({
      at: e.at,
      level: e.severity,
      message: e.message,
      fields: e.fields,
    }));
  }

  entryFields(e: StepLogEntry): FieldEntry[] {
    if (!e.fields) return [];
    return Object.entries(e.fields).map(([key, value]) => ({ key, value }));
  }

  logSeverity(e: StepLogEntry): string {
    switch (e.level) {
      case 'success':
        return 'success';
      case 'warn':
        return 'warn';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const sec = Math.round(ms / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return rem === 0 ? `${min}m` : `${min}m ${rem}s`;
  }

  trackField(_: number, f: FieldEntry): string {
    return f.key;
  }

  trackSub(_: number, s: WorkflowStep): string {
    return s.id;
  }

  trackEntry(i: number, e: StepLogEntry): string {
    return e.id ?? `${e.at}-${i}`;
  }
}
