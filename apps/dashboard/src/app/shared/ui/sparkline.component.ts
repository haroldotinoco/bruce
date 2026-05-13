import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Catmull–Rom (uniform) segment Pi→Pi+1 → cubic Bézier control points. */
function catmullRomSegment(
  p0: readonly [number, number],
  p1: readonly [number, number],
  p2: readonly [number, number],
  p3: readonly [number, number],
): [[number, number], [number, number]] {
  const cp1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const cp2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  return [cp1, cp2];
}

function buildSmoothLinePath(coords: [number, number][]): string {
  const n = coords.length;
  if (n === 0) return '';
  if (n === 1) return `M ${coords[0][0]} ${coords[0][1]}`;
  if (n === 2) {
    return `M ${coords[0][0]} ${coords[0][1]} L ${coords[1][0]} ${coords[1][1]}`;
  }
  const p = (i: number): [number, number] => coords[Math.max(0, Math.min(n - 1, i))];
  const parts: string[] = [`M ${coords[0][0]} ${coords[0][1]}`];
  for (let i = 0; i < n - 1; i++) {
    const [cp1, cp2] = catmullRomSegment(p(i - 1), p(i), p(i + 1), p(i + 2));
    const end = coords[i + 1];
    parts.push(`C ${cp1[0]} ${cp1[1]} ${cp2[0]} ${cp2[1]} ${end[0]} ${end[1]}`);
  }
  return parts.join(' ');
}

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
      [attr.width]="stretch() ? '100%' : width()"
      [attr.height]="stretch() ? '100%' : height()"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient [attr.id]="gradId" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.35" />
          <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path *ngIf="areaPath()" [attr.d]="areaPath()" [attr.fill]="'url(#' + gradId + ')'" stroke="none"></path>
      <path
        [attr.d]="linePath()"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        line-height: 0;
      }
      :host(.stretch) {
        display: block;
        width: 100%;
        min-width: 0;
      }
      :host(.stretch) svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  host: {
    '[class.stretch]': 'stretch()',
  },
})
export class SparklineComponent {
  /** Sample values (y-axis); x is implicit index. */
  readonly points = input<number[] | null>(null);
  /** Coordinate space width (path math). */
  readonly width = input(120);
  /** Coordinate space height (path math). */
  readonly height = input(28);
  readonly color = input('var(--accent)');
  readonly area = input(true);
  /** When true, SVG fills host; parent should set height (e.g. overview spark-big). */
  readonly stretch = input(false);

  readonly gradId = `sparkgrad_${Math.random().toString(36).slice(2)}`;

  readonly linePath = computed(() => this.buildPath(this.points() ?? [], false));
  readonly areaPath = computed(() => (this.area() ? this.buildPath(this.points() ?? [], true) : ''));

  private buildPath(values: number[], asArea: boolean): string {
    if (!values.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const padding = 2;
    const w = this.width() - padding * 2;
    const h = this.height() - padding * 2;
    const stepX = values.length > 1 ? w / (values.length - 1) : w;

    const coords: [number, number][] = values.map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + h - ((v - min) / span) * h;
      return [x, y];
    });

    const d = buildSmoothLinePath(coords);
    if (!asArea) return d;
    if (!coords.length) return '';
    const last = coords[coords.length - 1];
    const first = coords[0];
    return `${d} L ${last[0]} ${this.height()} L ${first[0]} ${this.height()} Z`;
  }
}
