import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV, ModuleId } from '../config/env.types';

export interface ApiRequestOptions {
  params?: Record<string, string | number | undefined | null>;
  body?: unknown;
}

/**
 * Thin wrapper around HttpClient that always routes module calls through
 * the api-gateway: `${gateway}/services/<module>/<path>`.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENV);

  url(module: ModuleId, path: string): string {
    const base = this.env.gatewayBaseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}/services/${module}${cleanPath}`;
  }

  directUrl(module: ModuleId, path: string): string {
    const base = this.env.moduleBaseUrls[module].replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }

  get<T>(module: ModuleId, path: string, opts: ApiRequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.url(module, path), { params: toParams(opts.params) });
  }

  post<T>(module: ModuleId, path: string, body: unknown, opts: ApiRequestOptions = {}): Observable<T> {
    return this.http.post<T>(this.url(module, path), body, { params: toParams(opts.params) });
  }

  put<T>(module: ModuleId, path: string, body: unknown, opts: ApiRequestOptions = {}): Observable<T> {
    return this.http.put<T>(this.url(module, path), body, { params: toParams(opts.params) });
  }

  delete<T>(module: ModuleId, path: string, opts: ApiRequestOptions = {}): Observable<T> {
    return this.http.delete<T>(this.url(module, path), { params: toParams(opts.params) });
  }
}

function toParams(input?: Record<string, string | number | undefined | null>): HttpParams {
  let params = new HttpParams();
  if (!input) return params;
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null || v === '') continue;
    params = params.set(k, String(v));
  }
  return params;
}
