import { Injectable, computed, inject, signal } from '@angular/core';
import { ENV } from '../config/env.types';
import type { DataSourceMode, ModuleId } from '../config/env.types';
import { MODULE_REGISTRY } from '../config/module-registry';
import { TokenService } from '../auth/token.service';
import { STORAGE_OVERRIDES_KEY } from './providers';

@Injectable({ providedIn: 'root' })
export class DataModeService {
  private readonly env = inject(ENV);
  private readonly token = inject(TokenService);

  private readonly _overrides = signal<Partial<Record<ModuleId, DataSourceMode>>>(this.readOverrides());

  readonly resolved = computed<Record<ModuleId, DataSourceMode>>(() => {
    const overrides = this._overrides();
    const has = this.token.hasToken();
    const out = {} as Record<ModuleId, DataSourceMode>;
    for (const meta of MODULE_REGISTRY) {
      const desired = overrides[meta.id] ?? this.env.moduleDataSources[meta.id] ?? 'mock';
      const realPossible = desired === 'real' && meta.realAvailable && has;
      out[meta.id] = realPossible ? 'real' : 'mock';
    }
    return out;
  });

  resolvedFor(id: ModuleId): DataSourceMode {
    return this.resolved()[id];
  }

  desiredFor(id: ModuleId): DataSourceMode {
    const overrides = this._overrides();
    return overrides[id] ?? this.env.moduleDataSources[id] ?? 'mock';
  }

  isLive(id: ModuleId): boolean {
    return this.resolvedFor(id) === 'real';
  }

  isFallback(id: ModuleId): boolean {
    const overrides = this._overrides();
    const desired = overrides[id] ?? this.env.moduleDataSources[id] ?? 'mock';
    const meta = MODULE_REGISTRY.find((m) => m.id === id);
    if (!meta?.realAvailable) return false;
    return desired === 'real' && !this.token.hasToken();
  }

  fallbackReason(id: ModuleId): string | null {
    const desired = this.desiredFor(id);
    const meta = MODULE_REGISTRY.find((m) => m.id === id);
    if (desired !== 'real') return null;
    if (!meta?.realAvailable) return 'Real provider not implemented.';
    if (!this.token.hasToken()) return 'Token missing; using mock data.';
    return null;
  }

  setOverride(id: ModuleId, mode: DataSourceMode) {
    const next = { ...this._overrides() };
    if (mode === this.env.moduleDataSources[id]) {
      delete next[id];
    } else {
      next[id] = mode;
    }
    this.writeOverrides(next);
    this._overrides.set(next);
  }

  reset() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_OVERRIDES_KEY);
    }
    this._overrides.set({});
  }

  private readOverrides(): Partial<Record<ModuleId, DataSourceMode>> {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_OVERRIDES_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private writeOverrides(o: Partial<Record<ModuleId, DataSourceMode>>) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(o));
  }
}
