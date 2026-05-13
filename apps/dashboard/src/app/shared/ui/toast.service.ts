import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'error' | 'warn';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  timeout_ms: number;
}

let _id = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly items = signal<Toast[]>([]);

  show(kind: ToastKind, title: string, message?: string, timeout_ms = 3500) {
    const id = ++_id;
    const item: Toast = { id, kind, title, message, timeout_ms };
    this.items.update((list) => [...list, item]);
    if (timeout_ms > 0) {
      setTimeout(() => this.dismiss(id), timeout_ms);
    }
    return id;
  }

  success(title: string, message?: string) {
    return this.show('success', title, message);
  }
  error(title: string, message?: string) {
    return this.show('error', title, message, 5000);
  }
  info(title: string, message?: string) {
    return this.show('info', title, message);
  }
  warn(title: string, message?: string) {
    return this.show('warn', title, message);
  }

  dismiss(id: number) {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }
}
