import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval, startWith } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { BRAND_AID_DS, BrandPackage } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';
import { DataModeService } from '../../core/data-sources/data-mode.service';
import { StartFromPromptDialogComponent } from '../../shared/bootstrap/start-from-prompt-dialog.component';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-brand-aid',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    KpiCardComponent,
    SkeletonComponent,
    WorkflowConstellationCardComponent,
    RelativeTimePipe,
    ModuleRollbackButtonComponent,
    StartFromPromptDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Brand-Aid"
      [eyebrow]="'Module · ' + mode.resolvedFor('brand-aid')"
      icon="palette"
      subtitle="Naming, moodboards, visual systems, logo studies, brand imagery, and brand books."
      [badge]="mode.resolvedFor('brand-aid').toUpperCase()"
    >
      <div actions>
        <app-module-rollback-button moduleId="brand-aid"></app-module-rollback-button>
        <button class="btn btn-primary" type="button" (click)="startFromPromptOpen.set(true)">
          <lucide-icon name="play" [size]="12"></lucide-icon>
          Start from here
        </button>
      </div>
    </app-page-header>

    <app-start-from-prompt-dialog
      *ngIf="startFromPromptOpen()"
      moduleId="brand-aid"
      (closed)="startFromPromptOpen.set(false)"
      (started)="onStartedFromPrompt($event)"
    />

    <app-workflow-constellation-card moduleId="brand-aid"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Brand packages" [value]="count()" icon="layers" [delta]="2"></app-kpi-card>
      <app-kpi-card label="Logos generated" [value]="logos()" icon="palette" [delta]="4"></app-kpi-card>
      <app-kpi-card label="Avg. brand score" [value]="avgScore()" suffix=" / 100" icon="award" [delta]="1"></app-kpi-card>
      <app-kpi-card label="Ready for handoff" [value]="ready()" icon="check" [delta]="1"></app-kpi-card>
    </div>

    <div class="brand-grid" *ngIf="!loading(); else skel">
      <article
        class="bpkg clickable"
        *ngFor="let p of pkgs()"
        (click)="openPackage(p)"
        (keydown.enter)="openPackage(p)"
        tabindex="0"
        role="button"
      >
        <header>
          <div>
            <div class="bpkg-name">{{ p.venture_name }}</div>
            <div class="muted small">updated {{ p.updated_at | relativeTime }}</div>
          </div>
          <app-status-badge [status]="p.status"></app-status-badge>
        </header>

        <div class="palette">
          <span *ngFor="let c of p.palette.length ? p.palette : ['#0f172a','#64748b','#e2e8f0']" [style.background]="c"></span>
        </div>

        <div class="mood">
          <div
            class="mood-cell"
            *ngFor="let m of p.moodboard"
            [style.background]="m.image_url ? 'transparent' : m.color"
            [title]="m.image_url ? m.label : 'Aguardando moodboard ou Serper indisponível'"
            (click)="openMoodImage($event, m)"
          >
            <img
              *ngIf="m.image_url"
              [src]="m.image_url"
              [alt]="m.label"
              referrerpolicy="no-referrer"
              loading="lazy"
            />
            <span>{{ m.label }}</span>
          </div>
        </div>

        <div class="names">
          <span class="name-chip" *ngFor="let n of p.names">{{ n }}</span>
        </div>

        <footer>
          <span class="muted small">{{ p.logos }} logo assets · score {{ p.score }}</span>
          <button class="btn btn-ghost" type="button" (click)="openPackage(p, $event)">
            <lucide-icon name="external-link" [size]="12"></lucide-icon>
            {{ p.export_links?.length ? 'Exports' : 'Preview' }}
          </button>
        </footer>
      </article>
    </div>

    <ng-template #skel>
      <div class="brand-grid">
        <app-skeleton height="340px" *ngFor="let _ of [1,2,3]"></app-skeleton>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }
      @media (max-width: 980px) {
        .kpis {
          grid-template-columns: 1fr 1fr;
        }
      }
      .brand-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      @media (max-width: 1180px) {
        .brand-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 720px) {
        .brand-grid {
          grid-template-columns: 1fr;
        }
      }
      .bpkg {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .bpkg.clickable {
        cursor: pointer;
      }
      .bpkg.clickable:hover {
        border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
      }
      .bpkg header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .bpkg-name {
        font-family: 'Inter Tight';
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.02em;
      }
      .palette {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        height: 28px;
        border-radius: 6px;
        overflow: hidden;
      }
      .mood {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }
      .mood-cell {
        border-radius: 8px;
        aspect-ratio: 1;
        position: relative;
        display: grid;
        place-items: end start;
        padding: 6px;
        overflow: hidden;
        background: var(--bg-2);
      }
      .mood-cell img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .mood-cell span {
        position: relative;
        z-index: 1;
        font-size: 10px;
        color: #fff;
        font-weight: 600;
        background: rgba(0, 0, 0, 0.35);
        padding: 1px 4px;
        border-radius: 4px;
      }
      .names {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .name-chip {
        font-family: 'Inter Tight';
        font-size: 12px;
        padding: 3px 8px;
        background: var(--bg-2);
        color: var(--fg-0);
        border-radius: 6px;
        border: 1px solid var(--border);
      }
      .bpkg footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 8px;
        border-top: 1px solid var(--border);
      }
      .muted {
        color: var(--fg-2);
      }
      .small {
        font-size: 11px;
      }
    `,
  ],
})
export class BrandAidComponent implements OnInit, OnDestroy {
  private readonly ds = inject(BRAND_AID_DS);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly mode = inject(DataModeService);
  readonly pkgs = signal<BrandPackage[]>([]);
  readonly loading = signal(true);
  readonly startFromPromptOpen = signal(false);
  private pollSub?: Subscription;

  count() {
    return this.pkgs().length;
  }
  logos() {
    return this.pkgs().reduce((a, b) => a + b.logos, 0);
  }
  avgScore() {
    const r = this.pkgs();
    if (!r.length) return 0;
    return Math.round(r.reduce((a, b) => a + b.score, 0) / r.length);
  }
  ready() {
    return this.pkgs().filter((p) => p.status === 'ready').length;
  }

  ngOnInit(): void {
    this.refreshPackages();
    this.pollSub = interval(20_000)
      .pipe(startWith(0))
      .subscribe(() => {
        if (this.pkgs().some((p) => p.status === 'generating')) {
          this.refreshPackages(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  openPackage(p: BrandPackage, event?: Event): void {
    event?.stopPropagation();
    void this.router.navigate(['/brand-aid/package', p.id]);
  }

  openMoodImage(
    event: Event,
    m: { image_url?: string; link?: string },
  ): void {
    event.stopPropagation();
    const url = m.link ?? m.image_url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  private refreshPackages(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.ds.listPackages().subscribe((p) => {
      this.pkgs.set(p);
      this.loading.set(false);
    });
  }

  onStartedFromPrompt(event: { workflowId: string; ventureId: string }): void {
    this.toast.success('Pipeline started', `Workflow ${event.workflowId}`);
    void this.router.navigate(['/workflow', 'brand-aid', event.workflowId]);
  }
}
