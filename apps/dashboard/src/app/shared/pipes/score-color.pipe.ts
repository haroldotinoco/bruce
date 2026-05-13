import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'scoreColor', standalone: true, pure: true })
export class ScoreColorPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) return 'var(--fg-2)';
    const v = Number(value);
    if (v >= 80) return 'var(--ok)';
    if (v >= 60) return 'var(--accent-2)';
    if (v >= 40) return 'var(--warn)';
    return 'var(--err)';
  }
}
