import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BootstrapDataSourceRouter } from '../../core/data-sources/bootstrap.router';
import { BRUCE_CORE_DS } from '../../core/data-sources/tokens';
import type { Venture } from '../../core/models';

@Component({
  selector: 'app-start-from-prompt-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <section class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <div>
            <div class="eyebrow">Bootstrap</div>
            <h2>Start from here</h2>
          </div>
          <button class="icon-btn" type="button" (click)="onCancel()" [disabled]="submitting()">×</button>
        </div>
        <p class="muted small">
          Describe your venture idea. Bruce will synthesize upstream pipeline artifacts, then start
          {{ moduleId() === 'brand-aid' ? 'brand-aid' : 'add-venture' }}.
        </p>

        <label class="field">
          <span>Venture</span>
          <select [(ngModel)]="ventureMode" [disabled]="submitting()">
            <option value="existing">Use existing venture</option>
            <option value="new">Create new venture</option>
          </select>
        </label>

        <label class="field" *ngIf="ventureMode === 'existing'">
          <span>Select venture</span>
          <select [(ngModel)]="selectedVentureId" [disabled]="submitting() || !ventures().length">
            <option value="" disabled>Select…</option>
            <option *ngFor="let v of ventures()" [value]="v.id">{{ v.name }}</option>
          </select>
        </label>

        <label class="field" *ngIf="ventureMode === 'new'">
          <span>New venture name</span>
          <input
            type="text"
            [(ngModel)]="newVentureName"
            [disabled]="submitting()"
            placeholder="e.g. ComplianceFlow"
          />
        </label>

        <label class="field">
          <span>{{ forcedNameLabel() }}</span>
          <input
            type="text"
            [(ngModel)]="forcedBrandName"
            [disabled]="submitting()"
            placeholder="e.g. b4u.bet"
          />
        </label>

        <label class="field">
          <span>Your prompt</span>
          <textarea
            rows="6"
            [(ngModel)]="prompt"
            [disabled]="submitting()"
            placeholder="Describe the problem, customer, and what you want to build…"
          ></textarea>
        </label>

        <label class="field">
          <span>Project nickname (optional)</span>
          <input
            type="text"
            [(ngModel)]="projectNickname"
            [disabled]="submitting()"
            placeholder="folder under .projects/"
          />
        </label>

        <p class="error-text" *ngIf="error()">{{ error() }}</p>

        <div class="modal-actions">
          <button class="btn" type="button" (click)="onCancel()" [disabled]="submitting()">Cancel</button>
          <button class="btn btn-primary" type="button" [disabled]="submitting()" (click)="submit()">
            {{ submitting() ? 'Starting…' : 'Start pipeline' }}
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(15, 23, 42, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .modal {
        width: min(520px, 100%);
        background: var(--surface, #fff);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
      }
      .modal-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }
      .eyebrow {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted, #64748b);
      }
      h2 {
        margin: 4px 0 0;
        font-size: 1.25rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 12px;
        font-size: 13px;
      }
      .field span {
        font-weight: 500;
      }
      textarea,
      input,
      select {
        width: 100%;
        border: 1px solid var(--border, #e2e8f0);
        border-radius: 8px;
        padding: 8px 10px;
        font: inherit;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
      .error-text {
        color: #b91c1c;
        font-size: 13px;
        margin-top: 8px;
      }
      .icon-btn {
        border: none;
        background: transparent;
        font-size: 1.25rem;
        cursor: pointer;
      }
    `,
  ],
})
export class StartFromPromptDialogComponent {
  readonly moduleId = input.required<'add-venture' | 'brand-aid'>();
  readonly closed = output<void>();
  readonly started = output<{ workflowId: string; ventureId: string }>();

  private readonly bootstrap = inject(BootstrapDataSourceRouter);
  private readonly venturesDs = inject(BRUCE_CORE_DS);

  readonly ventures = signal<Venture[]>([]);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  ventureMode: 'existing' | 'new' = 'existing';
  selectedVentureId = '';
  newVentureName = '';
  prompt = '';
  forcedBrandName = '';
  projectNickname = '';

  constructor() {
    this.venturesDs.listVentures().subscribe((v) => {
      this.ventures.set(v);
      if (v.length && !this.selectedVentureId) {
        this.selectedVentureId = v[0].id;
      }
    });
  }

  forcedNameLabel(): string {
    return this.moduleId() === 'brand-aid'
      ? 'Brand name (optional — skips naming in brand-aid)'
      : 'Brand / venture name (optional — locks naming in dossier)';
  }

  onCancel(): void {
    if (this.submitting()) return;
    this.closed.emit();
  }

  submit(): void {
    const prompt = this.prompt.trim();
    if (prompt.length < 20) {
      this.error.set('Prompt must be at least 20 characters.');
      return;
    }
    const body: {
      prompt: string;
      venture_id?: string;
      venture_name?: string;
      forced_brand_name?: string;
      project_nickname?: string;
    } = { prompt };
    if (this.ventureMode === 'existing') {
      if (!this.selectedVentureId) {
        this.error.set('Select a venture.');
        return;
      }
      body.venture_id = this.selectedVentureId;
    } else {
      const name = this.newVentureName.trim();
      if (!name) {
        this.error.set('Enter a name for the new venture.');
        return;
      }
      body.venture_name = name;
    }
    const nick = this.projectNickname.trim();
    if (nick) body.project_nickname = nick;
    const forced = this.forcedBrandName.trim();
    if (forced) body.forced_brand_name = forced;

    this.error.set(null);
    this.submitting.set(true);
    this.bootstrap.startFromPrompt(this.moduleId(), body).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.started.emit({ workflowId: res.workflow_id, ventureId: res.venture_id });
        this.closed.emit();
      },
      error: (e) => {
        this.submitting.set(false);
        this.error.set(e?.error?.error ?? e?.message ?? 'Failed to start from prompt.');
      },
    });
  }
}
