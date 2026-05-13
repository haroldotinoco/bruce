import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import type { WorkflowStep } from '../../core/models';
import { normalizeLucideStepIcon } from './lucide-step-icon';

/**
 * Circular SVG progress ring around a step bullet.
 *
 * - When `step.progress_fraction` is set, the ring fills accordingly.
 * - When the step is running and there is no fraction, an indeterminate
 *   sweeping ring is shown.
 * - Attempt > 1 paints a small numeric badge.
 * - A failed quality gate paints a red "!" badge.
 */
@Component({
  selector: 'app-step-bullet',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bullet"
      [class.done]="step.status === 'done' && !hadRetries()"
      [class.done-warn]="step.status === 'done' && hadRetries()"
      [class.running]="step.status === 'running'"
      [class.failed]="step.status === 'failed'"
      [class.pending]="step.status === 'pending'"
      [class.skipped]="step.status === 'skipped'"
      [style.--bullet-size.px]="size"
      [style.--accent]="accent"
      [title]="bulletTitle()"
    >
      <svg
        class="ring"
        [attr.viewBox]="'0 0 ' + size + ' ' + size"
        [attr.width]="size"
        [attr.height]="size"
        aria-hidden="true"
      >
        <circle
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="radius()"
          fill="none"
          class="ring-bg"
          [attr.stroke-width]="strokeWidth"
        ></circle>
        <circle
          *ngIf="hasFraction()"
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="radius()"
          fill="none"
          class="ring-fg"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="dashOffset()"
          [attr.transform]="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"
          stroke-linecap="round"
        ></circle>
        <circle
          *ngIf="!hasFraction() && step.status === 'running'"
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="radius()"
          fill="none"
          class="ring-indeterminate"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke-dasharray]="indeterminateDash()"
          stroke-linecap="round"
        ></circle>
      </svg>

      <div class="node">
        <lucide-icon
          *ngIf="!showCheck() && !showFailIcon()"
          [name]="normalizeLucideStepIcon(step.icon)"
          [size]="iconSize()"
        ></lucide-icon>
        <lucide-icon
          *ngIf="showCheck()"
          name="check"
          [size]="iconSize()"
        ></lucide-icon>
        <lucide-icon
          *ngIf="showFailIcon()"
          name="x"
          [size]="iconSize()"
        ></lucide-icon>
      </div>

      <span class="badge attempt" *ngIf="attemptCurrent() > 1" [title]="attemptTitle()">
        ×{{ attemptCurrent() }}
      </span>

      <span class="badge retries" *ngIf="hadRetries()" [title]="retriesTitle()">
        ↺{{ retriesCount() }}
      </span>

      <span class="badge gate-fail" *ngIf="qualityFailed()" [title]="step.quality_gate?.reason || 'Quality gate failed'">!</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .bullet {
        --bullet-size: 44px;
        position: relative;
        width: var(--bullet-size);
        height: var(--bullet-size);
        display: inline-block;
      }
      .ring {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .ring-bg {
        stroke: var(--border);
      }
      .ring-fg {
        stroke: var(--accent);
        transition: stroke-dashoffset 280ms ease;
      }
      .ring-indeterminate {
        stroke: var(--accent);
        opacity: 0.85;
        transform-origin: center;
        animation: spin 1.4s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .bullet.done .ring-fg,
      .bullet.done .ring-indeterminate {
        stroke: var(--ok, #22c55e);
      }
      .bullet.done-warn .ring-fg,
      .bullet.done-warn .ring-indeterminate {
        stroke: var(--warn, #f59e0b);
      }
      .bullet.failed .ring-fg,
      .bullet.failed .ring-indeterminate {
        stroke: var(--err, #ef4444);
      }
      .node {
        position: absolute;
        inset: 4px;
        border-radius: 50%;
        background: var(--bg-1);
        border: 2px solid var(--border);
        display: grid;
        place-items: center;
        color: var(--fg-1);
      }
      .bullet.done .node {
        border-color: var(--ok, #22c55e);
        color: var(--ok, #22c55e);
        background: color-mix(in srgb, var(--ok, #22c55e) 14%, var(--bg-1));
      }
      .bullet.done-warn .node {
        border-color: var(--warn, #f59e0b);
        color: var(--warn, #f59e0b);
        background: color-mix(in srgb, var(--warn, #f59e0b) 14%, var(--bg-1));
      }
      .bullet.running .node {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--bg-1);
        box-shadow:
          0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent),
          0 0 16px color-mix(in srgb, var(--accent) 30%, transparent);
      }
      .bullet.failed .node {
        border-color: var(--err, #ef4444);
        color: var(--err, #ef4444);
        background: color-mix(in srgb, var(--err, #ef4444) 12%, var(--bg-1));
      }
      .bullet.skipped .node {
        opacity: 0.4;
      }
      .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-0);
        line-height: 1;
      }
      .badge.attempt {
        background: var(--warn, #f59e0b);
        color: #fff;
      }
      .badge.retries {
        background: var(--warn, #f59e0b);
        color: #fff;
        top: auto;
        bottom: -4px;
        right: -4px;
      }
      .badge.gate-fail {
        background: var(--err, #ef4444);
        color: #fff;
        bottom: -4px;
        right: -4px;
        top: auto;
      }
      /* If both retries and gate-fail badges are present, stack them. */
      .badge.gate-fail + .badge.retries,
      .badge.retries + .badge.gate-fail {
        right: 14px;
      }
    `,
  ],
})
export class StepBulletComponent {
  readonly normalizeLucideStepIcon = normalizeLucideStepIcon;

  @Input({ required: true }) step!: WorkflowStep;
  @Input() size = 44;
  @Input() strokeWidth = 3;
  @Input() accent = 'var(--accent)';

  readonly hasFraction = computed(() => {
    const f = this.step?.progress_fraction;
    return typeof f === 'number' && f > 0 && f <= 1;
  });

  radius(): number {
    return this.size / 2 - this.strokeWidth;
  }

  circumference(): number {
    return 2 * Math.PI * this.radius();
  }

  dashOffset(): number {
    const f =
      this.step.status === 'done'
        ? 1
        : Math.max(0, Math.min(1, this.step.progress_fraction ?? 0));
    return this.circumference() * (1 - f);
  }

  indeterminateDash(): string {
    const c = this.circumference();
    return `${c * 0.25} ${c * 0.75}`;
  }

  iconSize(): number {
    return Math.max(10, Math.round(this.size * 0.32));
  }

  showCheck(): boolean {
    return this.step.status === 'done';
  }

  showFailIcon(): boolean {
    return this.step.status === 'failed';
  }

  attemptCurrent(): number {
    return this.step.attempt?.current ?? 1;
  }

  attemptTitle(): string {
    const a = this.step.attempt;
    if (!a) return '';
    const max = a.max ? `/${a.max}` : '';
    const reason = a.reason ? ` — ${a.reason}` : '';
    return `Attempt ${a.current}${max}${reason}`;
  }

  qualityFailed(): boolean {
    const g = this.step.quality_gate;
    return !!g && g.passed === false;
  }

  /**
   * Number of times this top-level step had to bounce back into running
   * (workflow re-entered the step). Falls back to counting failed quality
   * gates among sub-steps if the backend hasn't emitted the counter yet.
   */
  retriesCount(): number {
    const f = this.step.fields?.['retries'];
    if (f && typeof f.value === 'number') return f.value;
    const subFails = (this.step.sub_steps ?? []).filter(
      (ss) => !!ss.quality_gate && ss.quality_gate.passed === false,
    ).length;
    return subFails;
  }

  hadRetries(): boolean {
    return this.retriesCount() > 0;
  }

  retriesTitle(): string {
    const n = this.retriesCount();
    return `${n} retry${n === 1 ? '' : 'ies'} — quality gate bounced back ${n} time${n === 1 ? '' : 's'}`;
  }

  bulletTitle(): string {
    const parts: string[] = [this.step.label || this.step.key || ''];
    if (this.step.status === 'done' && this.hadRetries()) {
      parts.push(`done after ${this.retriesCount()} retry${this.retriesCount() === 1 ? '' : 'ies'}`);
    } else if (this.step.status) {
      parts.push(this.step.status);
    }
    return parts.filter(Boolean).join(' · ');
  }
}
