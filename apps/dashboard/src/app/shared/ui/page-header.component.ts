import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ph">
      <div class="ph-breadcrumb" *ngIf="eyebrow">{{ eyebrow }}</div>
      <div class="ph-row">
        <div class="ph-title">
          <lucide-icon *ngIf="icon" [name]="icon" [size]="20"></lucide-icon>
          <h1>{{ title }}</h1>
          <span class="ph-badge" *ngIf="badge" [style.background]="badgeBg">{{ badge }}</span>
        </div>
        <div class="ph-actions">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
      <p class="ph-sub" *ngIf="subtitle">{{ subtitle }}</p>
    </div>
  `,
  styles: [
    `
      .ph {
        padding: 28px 0 22px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 22px;
      }
      .ph-breadcrumb {
        color: var(--fg-2);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .ph-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }
      .ph-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--fg-0);
      }
      .ph-title h1 {
        font-family: 'Inter Tight', Inter, sans-serif;
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        letter-spacing: -0.03em;
      }
      .ph-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(124, 92, 255, 0.14);
        color: var(--accent);
      }
      .ph-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ph-sub {
        margin: 10px 0 0;
        color: var(--fg-1);
        font-size: 13px;
        max-width: 720px;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
  @Input() icon?: string;
  @Input() badge?: string;
  @Input() badgeBg?: string;
}
