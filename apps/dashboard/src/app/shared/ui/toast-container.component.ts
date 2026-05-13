import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts">
      <div class="toast" *ngFor="let t of svc.items()" [attr.data-kind]="t.kind">
        <lucide-icon [name]="icon(t.kind)" [size]="16"></lucide-icon>
        <div class="body">
          <div class="title">{{ t.title }}</div>
          <div class="msg" *ngIf="t.message">{{ t.message }}</div>
        </div>
        <button class="close" (click)="svc.dismiss(t.id)" aria-label="Dismiss">
          <lucide-icon name="x" [size]="12"></lucide-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toasts {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 1000;
        pointer-events: none;
      }
      .toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-width: 260px;
        max-width: 380px;
        padding: 10px 12px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        animation: slide-in 180ms ease-out;
      }
      .toast[data-kind='success'] {
        border-left: 3px solid var(--ok);
        color: var(--ok);
      }
      .toast[data-kind='error'] {
        border-left: 3px solid var(--err);
        color: var(--err);
      }
      .toast[data-kind='warn'] {
        border-left: 3px solid var(--warn);
        color: var(--warn);
      }
      .toast[data-kind='info'] {
        border-left: 3px solid var(--accent-2);
        color: var(--accent-2);
      }
      .body {
        flex: 1;
        color: var(--fg-0);
      }
      .title {
        font-size: 13px;
        font-weight: 600;
      }
      .msg {
        font-size: 12px;
        color: var(--fg-1);
        margin-top: 2px;
      }
      .close {
        background: transparent;
        border: 0;
        color: var(--fg-2);
        cursor: pointer;
      }
      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateX(10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly svc = inject(ToastService);

  icon(kind: string): string {
    switch (kind) {
      case 'success':
        return 'circle-check';
      case 'error':
        return 'circle-x';
      case 'warn':
        return 'circle-alert';
      default:
        return 'info';
    }
  }
}
