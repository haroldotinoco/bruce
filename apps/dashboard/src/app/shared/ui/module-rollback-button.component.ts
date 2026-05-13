import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { OPPORTUNITY_DS, WORKFLOW_DS } from '../../core/data-sources/tokens';
import type { ModuleId } from '../../core/config/env.types';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-module-rollback-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="btn btn-rollback" type="button" [disabled]="submitting()" (click)="open()">
      <lucide-icon name="rotate-ccw" [size]="12"></lucide-icon>
      Rollback
    </button>

    <div *ngIf="openModal()" class="rb-backdrop" role="presentation" (click)="close()">
      <div class="rb-dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="rb-head">
          <h3>Rollback · {{ moduleId }}</h3>
          <button class="btn btn-ghost" type="button" (click)="close()">Close</button>
        </div>
        <div class="rb-body">
          <p>Select the agent/step from where execution should restart.</p>
          <label class="rb-field">
            <span class="muted small">Rollback from step</span>
            <select class="rb-select" [value]="selectedStep()" (change)="selectedStep.set($any($event.target).value)">
              <option *ngFor="let s of stepOptions()" [value]="s.id">{{ s.label }}</option>
            </select>
          </label>
          <p class="muted small" *ngIf="!stepOptions().length">No live workflow steps found for this module yet.</p>
        </div>
        <div class="rb-actions">
          <button class="btn btn-ghost" type="button" (click)="close()">Cancel</button>
          <button class="btn btn-danger" type="button" [disabled]="submitting()" (click)="confirmRollback()">
            {{ submitting() ? 'Working…' : 'Apply rollback' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .btn-rollback { border-color: rgba(248, 113, 113, 0.45); color: #fecaca; }
      .rb-backdrop { position: fixed; inset: 0; z-index: 90; background: rgba(0,0,0,.5); display: grid; place-items: center; padding: 20px; }
      .rb-dialog { width: min(460px, 100%); background: var(--bg-0); border: 1px solid var(--border); border-radius: 12px; }
      .rb-head, .rb-actions { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid var(--border); }
      .rb-actions { border-bottom: 0; border-top: 1px solid var(--border); justify-content: flex-end; gap: 8px; }
      .rb-head h3 { margin: 0; font-size: 14px; }
      .rb-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
      .rb-field { display: flex; flex-direction: column; gap: 6px; }
      .rb-select { font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-1); color: var(--fg-0); }
      .btn-danger { background: rgba(239,68,68,.15); border-color: rgba(239,68,68,.45); color: #fecaca; }
    `,
  ],
})
export class ModuleRollbackButtonComponent {
  @Input({ required: true }) moduleId!: ModuleId;
  @Input() targetId?: string;
  @Input() projectNickname?: string | null;

  private readonly workflowDs = inject(WORKFLOW_DS);
  private readonly oppDs = inject(OPPORTUNITY_DS);
  private readonly toast = inject(ToastService);

  readonly openModal = signal(false);
  readonly selectedStep = signal('');
  readonly submitting = signal(false);
  readonly stepOptions = signal<Array<{ id: string; label: string }>>([]);

  readonly firstStep = computed(() => this.stepOptions()[0]?.id ?? '');

  open(): void {
    this.workflowDs.activeForModule(this.moduleId).subscribe({
      next: (runs) => {
        const wf = runs[0];
        const options =
          wf?.steps?.map((s) => ({ id: s.id, label: s.label || s.id })) ?? [];
        this.stepOptions.set(options);
        this.selectedStep.set(options[0]?.id ?? '');
        this.openModal.set(true);
      },
      error: () => {
        this.stepOptions.set([]);
        this.selectedStep.set('');
        this.openModal.set(true);
      },
    });
  }

  close(): void {
    if (this.submitting()) return;
    this.openModal.set(false);
  }

  confirmRollback(): void {
    const rollbackFrom = this.selectedStep() || this.firstStep();
    if (this.moduleId === 'opportunity' && this.targetId) {
      if (!this.projectNickname) {
        this.toast.error('Rollback unavailable', 'No project nickname found for this scan.');
        return;
      }
      this.submitting.set(true);
      this.oppDs
        .restartDownstreamScan(this.targetId, {
          confirm_nickname: this.projectNickname,
          acknowledge_irreversible: true,
          ...(rollbackFrom ? { rollback_from_step: rollbackFrom } : {}),
        })
        .subscribe({
          next: (res) => {
            this.submitting.set(false);
            this.openModal.set(false);
            this.toast.success('Rollback started', `Workflow ${res.workflow_id}`);
          },
          error: (e: any) => {
            this.submitting.set(false);
            this.toast.error('Rollback failed', e?.error?.error ?? e?.message ?? 'Unknown error');
          },
        });
      return;
    }

    this.toast.warn(
      'Rollback queued (UI)',
      `Module ${this.moduleId}: backend rollback wiring is pending.`,
    );
    this.openModal.set(false);
  }
}

