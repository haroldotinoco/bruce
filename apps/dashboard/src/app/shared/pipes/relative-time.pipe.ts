import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', standalone: true, pure: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    const diff = Date.now() - d.getTime();
    if (diff < 0) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.round(-diff / 60_000),
        'minute'
      );
    }
    const sec = Math.floor(diff / 1000);
    if (sec < 45) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 14) return `${day}d ago`;
    const weeks = Math.floor(day / 7);
    if (weeks < 6) return `${weeks}w ago`;
    const months = Math.floor(day / 30);
    if (months < 18) return `${months}mo ago`;
    return `${Math.floor(day / 365)}y ago`;
  }
}
