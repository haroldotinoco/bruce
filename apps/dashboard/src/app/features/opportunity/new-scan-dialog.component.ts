import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OPPORTUNITY_DS } from '../../core/data-sources/tokens';

@Component({
  selector: 'app-new-scan-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="close.emit()"></div>
    <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h3>Start new scan</h3>
        <button class="btn-ghost" (click)="close.emit()">
          <lucide-icon name="x" [size]="14"></lucide-icon>
        </button>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="mode() === 'themed'" (click)="mode.set('themed')">
          <lucide-icon name="sparkles" [size]="12"></lucide-icon>
          Themed discovery
        </button>
        <button class="tab" [class.active]="mode() === 'venture'" (click)="mode.set('venture')">
          <lucide-icon name="target" [size]="12"></lucide-icon>
          Venture-bound
        </button>
      </div>

      <div class="body">
        <ng-container *ngIf="mode() === 'themed'">
          <label>Themes <span class="muted">(optional · up to 5, Enter or comma to add)</span></label>
          <div class="chips-input">
            <span class="chip" *ngFor="let t of themes(); let i = index">
              {{ t }}
              <button class="chip-x" (click)="removeTheme(i)">
                <lucide-icon name="x" [size]="10"></lucide-icon>
              </button>
            </span>
            <input
              class="chip-entry"
              type="text"
              [(ngModel)]="themeDraft"
              (input)="onThemeDraftInput()"
              (paste)="onThemePaste($event)"
              (keydown.enter)="addTheme(); $event.preventDefault()"
              [placeholder]="themes().length ? 'add another…' : 'leave empty to let the AI pick trending themes'"
            />
          </div>
          <p class="muted small">
            <ng-container *ngIf="themes().length; else aiSuggest">
              Will run market-scanner → analyst → scoring on your themes.
            </ng-container>
            <ng-template #aiSuggest>
              <lucide-icon name="sparkles" [size]="11"></lucide-icon>
              No themes? The AI will suggest trending topics based on current market signals.
            </ng-template>
          </p>
        </ng-container>

        <ng-container *ngIf="mode() === 'venture'">
          <label>Venture ID</label>
          <input class="input" [(ngModel)]="ventureId" placeholder="venture_…" />
          <label class="mt">Optional themes</label>
          <input
            class="input"
            [(ngModel)]="ventureThemesRaw"
            placeholder="comma-separated, e.g. legaltech, compliance"
          />
          <p class="muted small">Scan is linked to a venture; opportunities are stored against it.</p>
        </ng-container>
      </div>

      <div class="error" *ngIf="error()">
        <lucide-icon name="circle-alert" [size]="12"></lucide-icon>
        <span>{{ error() }}</span>
      </div>

      <div class="foot">
        <button class="btn" (click)="close.emit()">Cancel</button>
        <button class="btn btn-primary" [disabled]="submitting()" (click)="submit()">
          <lucide-icon *ngIf="!submitting()" name="play" [size]="12"></lucide-icon>
          <span *ngIf="submitting()" class="spinner"></span>
          {{ submitting() ? 'Starting…' : 'Start scan' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 40;
        display: grid;
        place-items: center;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(6px);
      }
      .modal {
        position: relative;
        width: min(480px, calc(100vw - 32px));
        background: var(--bg-1);
        border: 1px solid var(--border-strong);
        border-radius: 16px;
        padding: 20px;
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .modal-head h3 {
        margin: 0;
        font-size: 16px;
      }
      .btn-ghost {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: transparent;
        border: 1px solid var(--border);
        color: var(--fg-1);
        display: grid;
        place-items: center;
        cursor: pointer;
      }
      .tabs {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 10px;
      }
      .tab {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px;
        background: transparent;
        border: 0;
        color: var(--fg-1);
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .tab.active {
        background: var(--bg-0);
        color: var(--fg-0);
        box-shadow: var(--shadow-1);
      }
      .body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .body label {
        font-size: 11px;
        font-weight: 600;
        color: var(--fg-1);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .body label.mt {
        margin-top: 8px;
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
      .chips-input {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 8px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 6px 3px 10px;
        border-radius: 999px;
        background: var(--bg-3);
        color: var(--fg-0);
        font-size: 11px;
      }
      .chip-x {
        background: transparent;
        border: 0;
        color: var(--fg-2);
        cursor: pointer;
        padding: 2px;
        display: inline-flex;
      }
      .chip-entry {
        flex: 1;
        min-width: 120px;
        background: transparent;
        border: 0;
        color: var(--fg-0);
        font-size: 13px;
        outline: 0;
      }
      .foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .error {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(239, 68, 68, 0.08);
        color: var(--err);
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 12px;
      }
      .spinner {
        width: 10px;
        height: 10px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: sp 0.8s linear infinite;
      }
      @keyframes sp {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class NewScanDialogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<string>();

  private readonly ds = inject(OPPORTUNITY_DS);

  readonly mode = signal<'themed' | 'venture'>('themed');
  readonly themes = signal<string[]>([]);
  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  themeDraft = '';
  ventureId = '';
  ventureThemesRaw = '';

  /** Flushes comma-separated segments into chips; leaves text after the last comma in the draft. */
  onThemeDraftInput(): void {
    while (this.themeDraft.includes(',')) {
      const idx = this.themeDraft.indexOf(',');
      const left = this.themeDraft.slice(0, idx).trim();
      const right = this.themeDraft.slice(idx + 1);
      if (left && this.themes().length < 5) {
        this.themes.update((arr) => [...arr, left]);
      }
      this.themeDraft = right;
    }
  }

  /** Paste of comma-separated text becomes multiple themes in one action (last segment included). */
  onThemePaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (!text.includes(',')) return;
    event.preventDefault();
    const parts = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const p of parts) {
      if (this.themes().length >= 5) break;
      this.themes.update((arr) => [...arr, p]);
    }
    this.themeDraft = '';
  }

  addTheme(): void {
    const v = this.themeDraft.trim();
    if (!v) return;
    if (this.themes().length >= 5) return;
    this.themes.update((arr) => [...arr, v]);
    this.themeDraft = '';
  }

  removeTheme(i: number): void {
    this.themes.update((arr) => arr.filter((_, idx) => idx !== i));
  }

  submit(): void {
    this.error.set(null);
    if (this.mode() === 'themed') {
      this.submitting.set(true);
      this.ds.startScan({ themes: this.themes() }).subscribe({
        next: (r) => {
          this.submitting.set(false);
          this.created.emit(r.id ?? r.workflow_id);
        },
        error: (e) => {
          this.submitting.set(false);
          this.error.set(this.extractError(e));
        },
      });
    } else {
      if (!this.ventureId.trim()) {
        this.error.set('Venture ID is required.');
        return;
      }
      const themes = this.ventureThemesRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      this.submitting.set(true);
      this.ds
        .startScan({
          venture_id: this.ventureId.trim(),
          opportunities: [],
          themes: themes.length ? themes : undefined,
        })
        .subscribe({
          next: (r) => {
            this.submitting.set(false);
            this.created.emit(r.id ?? r.workflow_id);
          },
          error: (e) => {
            this.submitting.set(false);
            this.error.set(this.extractError(e));
          },
        });
    }
  }

  private extractError(e: unknown): string {
    const any = e as any;
    if (any?.status === 401) return 'Unauthorized — set a valid token in Settings.';
    if (any?.status === 402) return 'Plan limit reached — upgrade your plan to run more scans.';
    return any?.error?.error ?? any?.message ?? 'Could not start scan';
  }
}
