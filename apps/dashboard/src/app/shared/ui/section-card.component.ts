import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-section-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sc" [class.flat]="flat">
      <header class="sc-head" *ngIf="title || hint">
        <div class="sc-title">
          <lucide-icon *ngIf="icon" [name]="icon" [size]="14"></lucide-icon>
          <h3>{{ title }}</h3>
          <span class="sc-hint" *ngIf="hint">{{ hint }}</span>
        </div>
        <div class="sc-actions">
          <ng-content select="[actions]"></ng-content>
        </div>
      </header>
      <div class="sc-body">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      .sc {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: var(--r-lg);
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        position: relative;
        overflow: hidden;
      }
      .sc.flat {
        background: transparent;
        border: 1px dashed var(--border);
      }
      .sc-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .sc-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--fg-0);
      }
      .sc-title h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .sc-hint {
        color: var(--fg-2);
        font-size: 12px;
        margin-left: 4px;
      }
      .sc-body {
        flex: 1;
        min-height: 0;
      }
      .sc-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    `,
  ],
})
export class SectionCardComponent {
  @Input() title?: string;
  @Input() hint?: string;
  @Input() icon?: string;
  @Input() flat = false;
}
