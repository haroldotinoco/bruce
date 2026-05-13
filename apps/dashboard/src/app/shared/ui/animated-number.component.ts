import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-number',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span>{{ prefix }}{{ format(displayed()) }}{{ suffix }}</span>`,
  styles: [`:host { display: inline; }`],
})
export class AnimatedNumberComponent implements OnChanges, OnDestroy {
  @Input() value: number | string = 0;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() duration = 700;
  @Input() decimals = 0;

  readonly displayed = signal<number>(0);
  private raf?: number;
  private start = 0;
  private from = 0;
  private to = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes) {
      const next = this.toNumber(this.value);
      this.from = this.displayed();
      this.to = next;
      this.start = performance.now();
      if (this.raf) cancelAnimationFrame(this.raf);
      const step = (t: number) => {
        const k = Math.min(1, (t - this.start) / this.duration);
        const eased = 1 - Math.pow(1 - k, 3);
        const v = this.from + (this.to - this.from) * eased;
        this.displayed.set(v);
        if (k < 1) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  format(n: number): string {
    const rounded = this.decimals ? Number(n.toFixed(this.decimals)) : Math.round(n);
    if (typeof this.value === 'string' && isNaN(Number(this.value))) return this.value;
    if (Math.abs(rounded) >= 10_000) {
      return rounded.toLocaleString('en-US');
    }
    return String(rounded);
  }

  private toNumber(v: number | string): number {
    if (typeof v === 'number') return v;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }
}
