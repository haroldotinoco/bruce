import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SparklineComponent } from './sparkline.component';
import { AnimatedNumberComponent } from './animated-number.component';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SparklineComponent, AnimatedNumberComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi" [class.is-loading]="loading">
      <div class="kpi-head">
        <div class="kpi-label">
          <lucide-icon *ngIf="icon" [name]="icon" [size]="14"></lucide-icon>
          <span>{{ label }}</span>
        </div>
        <div
          *ngIf="delta !== null && delta !== undefined && !loading"
          class="kpi-delta"
          [class.up]="delta > 0"
          [class.down]="delta < 0"
        >
          <lucide-icon [name]="delta > 0 ? 'trending-up' : delta < 0 ? 'trending-down' : 'minus'" [size]="12"></lucide-icon>
          <span>{{ delta > 0 ? '+' : '' }}{{ delta }}{{ deltaUnit }}</span>
        </div>
      </div>
      <div class="kpi-value">
        <app-animated-number
          *ngIf="!loading; else skel"
          [value]="value"
          [prefix]="prefix"
          [suffix]="suffix"
        ></app-animated-number>
        <ng-template #skel>
          <span class="kpi-skel"></span>
        </ng-template>
      </div>
      <div class="kpi-spark" *ngIf="spark && spark.length">
        <app-sparkline [points]="spark" [color]="sparkColor"></app-sparkline>
      </div>
      <div class="kpi-sub" *ngIf="sublabel">{{ sublabel }}</div>
    </div>
  `,
  styles: [
    `
      .kpi {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: var(--r-lg);
        position: relative;
        overflow: hidden;
        min-height: 120px;
      }
      .kpi::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(400px 200px at 100% 0%, rgba(124, 92, 255, 0.07), transparent 60%);
        pointer-events: none;
      }
      .kpi-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .kpi-label {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--fg-1);
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .kpi-delta {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 7px;
        border-radius: 999px;
        background: var(--bg-2);
        color: var(--fg-1);
      }
      .kpi-delta.up {
        color: var(--ok);
        background: rgba(34, 197, 94, 0.1);
      }
      .kpi-delta.down {
        color: var(--err);
        background: rgba(239, 68, 68, 0.1);
      }
      .kpi-value {
        font-family: 'Inter Tight', Inter, sans-serif;
        font-size: 34px;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--fg-0);
        line-height: 1.05;
      }
      .kpi-skel {
        display: inline-block;
        width: 120px;
        height: 34px;
        background: linear-gradient(90deg, var(--bg-2), var(--bg-3), var(--bg-2));
        background-size: 200% 100%;
        animation: skelmove 1.2s infinite;
        border-radius: 6px;
      }
      @keyframes skelmove {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      .kpi-spark {
        margin-top: 2px;
      }
      .kpi-sub {
        color: var(--fg-2);
        font-size: 11px;
      }
    `,
  ],
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() delta: number | null = null;
  @Input() deltaUnit = '';
  @Input() icon?: string;
  @Input() sublabel?: string;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() spark: number[] | null = null;
  @Input() sparkColor = 'var(--accent)';
  @Input() loading = false;
}
