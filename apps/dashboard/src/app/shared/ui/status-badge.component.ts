import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatusKind =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'idle'
  | 'ok'
  | 'degraded'
  | 'down'
  | 'draft'
  | 'ready'
  | 'archived'
  | string;

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [attr.data-kind]="normalized()">
      <span class="dot"></span>
      {{ (label ?? status) || '—' }}
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        padding: 3px 9px;
        border-radius: 999px;
        background: var(--bg-2);
        color: var(--fg-1);
        border: 1px solid var(--border);
        text-transform: capitalize;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 10px currentColor;
      }
      .badge[data-kind='running'] {
        color: var(--accent-2);
        background: rgba(34, 211, 238, 0.08);
        border-color: rgba(34, 211, 238, 0.2);
      }
      .badge[data-kind='running'] .dot {
        animation: pulse 1.4s ease-in-out infinite;
      }
      .badge[data-kind='queued'] {
        color: var(--fg-1);
      }
      .badge[data-kind='completed'],
      .badge[data-kind='ready'],
      .badge[data-kind='ok'],
      .badge[data-kind='done'] {
        color: var(--ok);
        background: rgba(34, 197, 94, 0.08);
        border-color: rgba(34, 197, 94, 0.2);
      }
      .badge[data-kind='failed'],
      .badge[data-kind='down'] {
        color: var(--err);
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.2);
      }
      .badge[data-kind='degraded'] {
        color: var(--warn);
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.2);
      }
      .badge[data-kind='idle'],
      .badge[data-kind='draft'],
      .badge[data-kind='archived'],
      .badge[data-kind='canceled'] {
        color: var(--fg-2);
      }
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(1.3);
        }
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() status: StatusKind = 'idle';
  @Input() label?: string;

  normalized() {
    return (this.status || '').toString().toLowerCase();
  }
}
