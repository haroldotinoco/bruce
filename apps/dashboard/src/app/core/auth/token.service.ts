import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'bruce.auth.token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly _token = signal<string | null>(this.readFromStorage());

  readonly token = this._token.asReadonly();
  readonly hasToken = computed(() => !!this._token()?.trim());
  readonly masked = computed(() => {
    const t = this._token();
    if (!t) return '';
    if (t.length <= 12) return t;
    return `${t.slice(0, 6)}…${t.slice(-4)}`;
  });

  set(token: string | null): void {
    const value = (token ?? '').trim() || null;
    this._token.set(value);
    if (typeof window === 'undefined') return;
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  clear(): void {
    this.set(null);
  }

  private readFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEY);
  }
}
