import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import type { LogValue, LogValueKind } from '../../core/models';

/**
 * Universal renderer for a structured log value (`{ kind, value, ... }`).
 * Switches on `kind` to produce a tight, typed visual: scores show as a
 * colored chip with `value/out_of`, `id_ref` becomes a pill with kind label,
 * `tags` becomes a chip cloud, `duration_ms`/`percent`/`currency`/`integer`
 * format the number, and so on. Falls back to a JSON snippet for unknown
 * kinds so nothing is ever lost.
 */
@Component({
  selector: 'app-log-value',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [ngSwitch]="kind()">
      <!-- null -->
      <span *ngSwitchCase="'null'" class="lv lv-null">null</span>

      <!-- boolean -->
      <span
        *ngSwitchCase="'boolean'"
        class="lv lv-bool"
        [attr.data-on]="!!value.value"
      >
        {{ value.value ? 'true' : 'false' }}
      </span>

      <!-- number / integer / percent / currency / duration_ms -->
      <span *ngSwitchCase="'integer'" class="lv lv-num mono">{{ formatNumber(value.value) }}<span *ngIf="value.unit" class="unit">{{ value.unit }}</span></span>
      <span *ngSwitchCase="'number'" class="lv lv-num mono">{{ formatNumber(value.value) }}<span *ngIf="value.unit" class="unit">{{ value.unit }}</span></span>
      <span *ngSwitchCase="'percent'" class="lv lv-num mono">{{ formatPercent(value.value) }}</span>
      <span *ngSwitchCase="'currency'" class="lv lv-num mono">{{ formatCurrency(value.value, value.unit) }}</span>
      <span *ngSwitchCase="'duration_ms'" class="lv lv-num mono">{{ formatDuration(value.value) }}</span>

      <!-- score: value/out_of with PASS/FAIL chip -->
      <span
        *ngSwitchCase="'score'"
        class="lv lv-score"
        [attr.data-variant]="scoreVariant()"
      >
        <span class="score-num mono">{{ formatNumber(value.value) }}<span class="muted" *ngIf="value.out_of">/{{ value.out_of }}</span></span>
        <span class="score-tag mono" *ngIf="value.passed != null">
          {{ value.passed ? 'PASS' : 'FAIL' }}
        </span>
      </span>

      <!-- text -->
      <span *ngSwitchCase="'text_short'" class="lv lv-text">{{ value.value }}</span>
      <span *ngSwitchCase="'text_long'" class="lv lv-text long">{{ value.value }}</span>

      <!-- markdown (very small subset: passthrough as preformatted text) -->
      <pre *ngSwitchCase="'markdown'" class="lv lv-md">{{ value.value }}</pre>
      <pre
        *ngSwitchCase="'code'"
        class="lv lv-code mono"
        [attr.data-lang]="value.language"
      ><code>{{ value.value }}</code></pre>

      <!-- date / time / datetime / timestamp -->
      <span *ngSwitchCase="'date'" class="lv lv-date mono">{{ value.value }}</span>
      <span *ngSwitchCase="'time'" class="lv lv-date mono">{{ value.value }}</span>
      <span *ngSwitchCase="'datetime'" class="lv lv-date mono">{{ value.value }}</span>
      <span *ngSwitchCase="'timestamp'" class="lv lv-date mono">{{ formatTimestamp(value.value) }}</span>

      <!-- url / email -->
      <a
        *ngSwitchCase="'url'"
        class="lv lv-link"
        [href]="value.value"
        target="_blank"
        rel="noopener noreferrer"
      >
        <lucide-icon name="external-link" [size]="12"></lucide-icon>
        {{ value.ref_label || value.value }}
      </a>
      <a
        *ngSwitchCase="'email'"
        class="lv lv-link"
        [href]="'mailto:' + value.value"
      >
        <lucide-icon name="mail" [size]="12"></lucide-icon>
        {{ value.value }}
      </a>

      <!-- image / video -->
      <img
        *ngSwitchCase="'image_url'"
        class="lv lv-img"
        [src]="value.value"
        [alt]="value.ref_label || ''"
        loading="lazy"
      />
      <video
        *ngSwitchCase="'video_url'"
        class="lv lv-video"
        [src]="value.value"
        controls
      ></video>

      <!-- color -->
      <span *ngSwitchCase="'color'" class="lv lv-color">
        <span class="swatch" [style.background]="value.value"></span>
        <span class="mono">{{ value.value }}</span>
      </span>

      <!-- tag / tags / badge / enum -->
      <span *ngSwitchCase="'tag'" class="lv chip">{{ value.value }}</span>
      <span *ngSwitchCase="'badge'" class="lv chip" [attr.data-variant]="value.variant || 'neutral'">{{ value.value }}</span>
      <span *ngSwitchCase="'enum'" class="lv chip" [attr.data-variant]="enumVariant()">{{ value.value }}</span>
      <span *ngSwitchCase="'tags'" class="lv lv-tags">
        <span class="chip" *ngFor="let t of asArray(value.value)">{{ t }}</span>
      </span>

      <!-- id_ref -->
      <span *ngSwitchCase="'id_ref'" class="lv lv-ref">
        <span class="ref-kind muted" *ngIf="value.ref_kind">{{ value.ref_kind }}</span>
        <a *ngIf="value.ref_url; else refSpan" [href]="value.ref_url" target="_blank" rel="noopener noreferrer">
          <span class="ref-label">{{ value.ref_label || idShort(value.value) }}</span>
        </a>
        <ng-template #refSpan>
          <span class="ref-label">{{ value.ref_label || idShort(value.value) }}</span>
        </ng-template>
        <span class="ref-id mono muted" *ngIf="value.ref_label">· {{ idShort(value.value) }}</span>
        <span class="unit muted" *ngIf="value.unit">· {{ value.unit }}</span>
      </span>

      <!-- array -->
      <ul *ngSwitchCase="'array'" class="lv lv-array">
        <li *ngFor="let item of asArray(value.value); trackBy: trackIdx">
          <app-log-value [value]="wrapItem(item)"></app-log-value>
        </li>
      </ul>

      <!-- object -->
      <dl *ngSwitchCase="'object'" class="lv lv-object">
        <ng-container *ngFor="let kv of asObjectEntries(value.value)">
          <dt class="muted">{{ kv[0] }}</dt>
          <dd>
            <app-log-value [value]="wrapAny(kv[1])"></app-log-value>
          </dd>
        </ng-container>
      </dl>

      <!-- json fallback -->
      <pre *ngSwitchDefault class="lv lv-json mono">{{ jsonPreview() }}</pre>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        max-width: 100%;
      }
      .mono {
        font-family: 'JetBrains Mono', monospace;
      }
      .muted {
        color: var(--fg-2);
      }
      .lv {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--fg-0);
      }
      .lv-null {
        color: var(--fg-2);
        font-style: italic;
      }
      .lv-bool[data-on='true'] {
        color: var(--ok);
      }
      .lv-bool[data-on='false'] {
        color: var(--fg-2);
      }
      .unit {
        margin-left: 2px;
        color: var(--fg-2);
        font-size: 10px;
      }
      .lv-text.long {
        display: block;
        white-space: normal;
      }
      .lv-md,
      .lv-code,
      .lv-json {
        display: block;
        white-space: pre-wrap;
        word-break: break-word;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 8px 10px;
        margin: 4px 0;
        font-size: 11px;
        color: var(--fg-0);
        max-width: 100%;
        overflow: auto;
      }
      .lv-link {
        color: var(--accent);
        text-decoration: none;
      }
      .lv-link:hover {
        text-decoration: underline;
      }
      .lv-img {
        max-width: 220px;
        max-height: 120px;
        border-radius: 8px;
        border: 1px solid var(--border);
      }
      .lv-video {
        max-width: 320px;
        border-radius: 8px;
      }
      .lv-color .swatch {
        display: inline-block;
        width: 14px;
        height: 14px;
        border-radius: 4px;
        border: 1px solid var(--border);
      }
      .chip {
        display: inline-flex;
        align-items: center;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.04em;
        padding: 2px 7px;
        border-radius: 999px;
        background: var(--bg-2);
        color: var(--fg-1);
        border: 1px solid var(--border);
      }
      .chip[data-variant='success'] {
        background: color-mix(in srgb, var(--ok) 16%, var(--bg-1));
        color: var(--ok);
        border-color: color-mix(in srgb, var(--ok) 40%, transparent);
      }
      .chip[data-variant='warn'] {
        background: color-mix(in srgb, var(--warn, #f59e0b) 16%, var(--bg-1));
        color: var(--warn, #f59e0b);
        border-color: color-mix(in srgb, var(--warn, #f59e0b) 40%, transparent);
      }
      .chip[data-variant='error'] {
        background: color-mix(in srgb, var(--err) 16%, var(--bg-1));
        color: var(--err);
        border-color: color-mix(in srgb, var(--err) 40%, transparent);
      }
      .chip[data-variant='info'] {
        background: color-mix(in srgb, var(--accent) 14%, var(--bg-1));
        color: var(--accent);
        border-color: color-mix(in srgb, var(--accent) 40%, transparent);
      }
      .lv-tags {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .lv-score {
        gap: 6px;
      }
      .score-tag {
        font-size: 10px;
        letter-spacing: 0.08em;
        padding: 1px 6px;
        border-radius: 999px;
      }
      .lv-score[data-variant='success'] .score-tag {
        background: color-mix(in srgb, var(--ok) 16%, var(--bg-1));
        color: var(--ok);
      }
      .lv-score[data-variant='warn'] .score-tag {
        background: color-mix(in srgb, var(--warn, #f59e0b) 16%, var(--bg-1));
        color: var(--warn, #f59e0b);
      }
      .lv-score[data-variant='error'] .score-tag {
        background: color-mix(in srgb, var(--err) 16%, var(--bg-1));
        color: var(--err);
      }
      .lv-ref {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 1px 8px;
      }
      .ref-kind {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .ref-id {
        font-size: 10px;
      }
      .lv-array {
        list-style: none;
        margin: 0;
        padding: 0 0 0 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        border-left: 2px solid var(--border);
      }
      .lv-object {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 4px 12px;
        margin: 0;
      }
      .lv-object dt {
        font-size: 11px;
      }
      .lv-object dd {
        margin: 0;
      }
    `,
  ],
})
export class LogValueComponent {
  @Input({ required: true }) value!: LogValue;

  readonly kind = computed<LogValueKind>(() => (this.value?.kind ?? 'json') as LogValueKind);

  scoreVariant(): 'success' | 'warn' | 'error' | 'neutral' {
    if (this.value?.variant) return this.value.variant as any;
    if (this.value?.passed === true) return 'success';
    if (this.value?.passed === false) return 'warn';
    return 'neutral';
  }

  enumVariant(): string {
    const map = this.value?.tone_map;
    const v = this.value?.value;
    if (map && typeof v === 'string' && map[v]) return map[v];
    return this.value?.variant ?? 'neutral';
  }

  formatNumber(v: unknown): string {
    if (typeof v !== 'number' || !Number.isFinite(v)) return String(v ?? '');
    return Math.abs(v) >= 1000 ? v.toLocaleString() : String(v);
  }

  formatPercent(v: unknown): string {
    if (typeof v !== 'number') return String(v ?? '');
    const pct = v <= 1 ? v * 100 : v;
    return `${pct.toFixed(pct >= 10 ? 0 : 1)}%`;
  }

  formatCurrency(v: unknown, unit?: string): string {
    if (typeof v !== 'number') return String(v ?? '');
    const sym = unit || '$';
    return `${sym}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDuration(v: unknown): string {
    if (typeof v !== 'number' || !Number.isFinite(v)) return String(v ?? '');
    if (v < 1000) return `${v}ms`;
    if (v < 60_000) return `${(v / 1000).toFixed(1)}s`;
    if (v < 3_600_000) return `${(v / 60_000).toFixed(1)}m`;
    return `${(v / 3_600_000).toFixed(1)}h`;
  }

  formatTimestamp(v: unknown): string {
    if (v == null) return '';
    const d = typeof v === 'string' || typeof v === 'number' ? new Date(v) : null;
    if (!d || isNaN(d.getTime())) return String(v);
    return d.toISOString();
  }

  asArray(v: unknown): unknown[] {
    if (Array.isArray(v)) return v;
    if (v == null) return [];
    return [v];
  }

  asObjectEntries(v: unknown): [string, unknown][] {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.entries(v as Record<string, unknown>);
    }
    return [];
  }

  /** Wrap a primitive item in the array's `item_kind` (or auto-detect). */
  wrapItem(item: unknown): LogValue {
    if (isLogValue(item)) return item;
    const itemKind = (this.value.item_kind ?? this.detectKind(item)) as LogValueKind;
    return { kind: itemKind, value: item };
  }

  wrapAny(v: unknown): LogValue {
    if (isLogValue(v)) return v;
    return { kind: this.detectKind(v), value: v };
  }

  private detectKind(v: unknown): LogValueKind {
    if (v == null) return 'null';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'number') return 'number';
    if (typeof v === 'string') {
      if (/^https?:\/\//.test(v)) return 'url';
      if (v.length > 80) return 'text_long';
      return 'text_short';
    }
    if (Array.isArray(v)) return 'array';
    return 'object';
  }

  idShort(v: unknown): string {
    const s = String(v ?? '');
    return s.length > 12 ? `${s.slice(0, 8)}…` : s;
  }

  jsonPreview(): string {
    try {
      return JSON.stringify(this.value?.value, null, 2);
    } catch {
      return String(this.value?.value);
    }
  }

  trackIdx(i: number): number {
    return i;
  }
}

function isLogValue(v: unknown): v is LogValue {
  return (
    !!v &&
    typeof v === 'object' &&
    'kind' in (v as object) &&
    'value' in (v as object)
  );
}
