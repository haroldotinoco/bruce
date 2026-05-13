import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="sk" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></span>`,
  styles: [
    `
      .sk {
        display: inline-block;
        background: linear-gradient(90deg, var(--bg-2), var(--bg-3), var(--bg-2));
        background-size: 200% 100%;
        animation: skm 1.3s infinite;
      }
      @keyframes skm {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '14px';
  @Input() radius = '6px';
}
