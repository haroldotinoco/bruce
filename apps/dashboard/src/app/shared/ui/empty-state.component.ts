import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="es">
      <div class="es-icon">
        <lucide-icon [name]="icon" [size]="22"></lucide-icon>
      </div>
      <div class="es-title">{{ title }}</div>
      <div class="es-sub" *ngIf="subtitle">{{ subtitle }}</div>
      <div class="es-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .es {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 36px 16px;
        gap: 8px;
        text-align: center;
      }
      .es-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        display: grid;
        place-items: center;
        color: var(--fg-1);
        margin-bottom: 4px;
      }
      .es-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--fg-0);
      }
      .es-sub {
        font-size: 12px;
        color: var(--fg-1);
        max-width: 340px;
      }
      .es-actions {
        margin-top: 8px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'sparkles';
  @Input() title = 'Nothing here yet';
  @Input() subtitle?: string;
}
