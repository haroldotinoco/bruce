import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription, interval } from 'rxjs';
import { BRAND_AID_DS, WORKFLOW_DS, type BrandPackage } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DASHBOARD_POLL_INTERVAL_MS } from '../../core/config/polling';

@Component({
  selector: 'app-brand-aid-package-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    RelativeTimePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      [title]="pkg()?.venture_name ?? 'Brand package'"
      eyebrow="Brand-Aid · package"
      icon="palette"
    >
      <div actions>
        <a class="btn" routerLink="/brand-aid">
          <lucide-icon name="arrow-right" [size]="12" style="transform: rotate(180deg)"></lucide-icon>
          Back
        </a>
        <a class="btn btn-primary" *ngIf="workflowLink() as wl" [routerLink]="wl">
          <lucide-icon name="maximize-2" [size]="12"></lucide-icon>
          Open workflow
        </a>
      </div>
    </app-page-header>

    <app-skeleton *ngIf="loading()" height="420px"></app-skeleton>

    <app-empty-state
      *ngIf="!loading() && error()"
      icon="palette"
      title="Package not found"
      [subtitle]="error()!"
    ></app-empty-state>

    <ng-container *ngIf="!loading() && pkg() as p">
      <div class="hero-meta">
        <app-status-badge [status]="p.status"></app-status-badge>
        <span class="muted small">updated {{ p.updated_at | relativeTime }}</span>
        <span class="muted small" *ngIf="p.venture_id">· venture {{ p.venture_id }}</span>
      </div>

      <p class="error-banner" *ngIf="p.error">{{ p.error }}</p>
      <p class="warn-banner" *ngIf="p.moodboard_limitations">{{ p.moodboard_limitations }}</p>

      <app-section-card title="Moodboard" icon="images">
        <p class="muted small empty-hint" *ngIf="!hasMoodboardImages(p)">
          No moodboard images yet. Ensure SERPER_API_KEY is set and the pipeline reached the moodboard step.
        </p>
        <div class="cluster" *ngFor="let cluster of p.moodboard_clusters ?? []">
          <h4>{{ cluster.label }}</h4>
          <p class="muted small" *ngIf="cluster.rationale">{{ cluster.rationale }}</p>
          <div class="img-grid" *ngIf="cluster.references.length">
            <a
              *ngFor="let ref of cluster.references"
              class="img-cell"
              [href]="ref.link || ref.image_url"
              target="_blank"
              rel="noopener noreferrer"
              [title]="ref.title"
            >
              <img [src]="ref.image_url" [alt]="ref.title" referrerpolicy="no-referrer" loading="lazy" />
              <span class="img-cap">{{ ref.domain ?? ref.title }}</span>
            </a>
          </div>
        </div>
      </app-section-card>

      <div class="two-col">
        <app-section-card title="Names" icon="type" *ngIf="p.names.length">
          <div class="chips">
            <span class="chip" *ngFor="let n of p.names">{{ n }}</span>
          </div>
        </app-section-card>

        <app-section-card title="Palette" icon="palette">
          <div class="palette-row">
            <span *ngFor="let c of p.palette.length ? p.palette : ['#0f172a','#64748b','#e2e8f0']" [style.background]="c" [title]="c"></span>
          </div>
        </app-section-card>
      </div>

      <app-section-card title="Logo studies" icon="sparkles" *ngIf="p.logo_studies?.length">
        <div class="img-grid">
          <a
            *ngFor="let asset of p.logo_studies"
            class="img-cell wide"
            [href]="asset.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img *ngIf="asset.url" [src]="asset.url" [alt]="asset.label" loading="lazy" />
            <span class="img-cap">{{ asset.label }}</span>
          </a>
        </div>
      </app-section-card>

      <app-section-card title="Brand imagery" icon="image" *ngIf="p.brand_imagery?.length">
        <div class="img-grid">
          <a
            *ngFor="let asset of p.brand_imagery"
            class="img-cell wide"
            [href]="asset.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img *ngIf="asset.url" [src]="asset.url" [alt]="asset.label" loading="lazy" />
            <span class="img-cap">{{ asset.label }}</span>
          </a>
        </div>
      </app-section-card>

      <app-section-card title="Exports" icon="external-link" *ngIf="p.export_links?.length">
        <ul class="export-list">
          <li *ngFor="let link of p.export_links">
            <a [href]="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
          </li>
        </ul>
      </app-section-card>

      <details class="stage-outputs" *ngIf="p.stage_outputs">
        <summary>Stage outputs (debug)</summary>
        <pre>{{ p.stage_outputs | json }}</pre>
      </details>
    </ng-container>
  `,
  styles: [
    `
      .hero-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .error-banner,
      .warn-banner {
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 13px;
      }
      .error-banner {
        background: color-mix(in srgb, var(--err) 12%, transparent);
        color: var(--err);
      }
      .warn-banner {
        background: color-mix(in srgb, var(--warn) 12%, transparent);
        color: var(--warn);
      }
      .empty-hint {
        margin-bottom: 12px;
      }
      .cluster {
        margin-bottom: 20px;
      }
      .cluster h4 {
        margin: 0 0 4px;
        font-size: 14px;
      }
      .img-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
        margin-top: 10px;
      }
      .img-cell {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid var(--border);
        aspect-ratio: 1;
        display: block;
        background: var(--bg-2);
      }
      .img-cell.wide {
        aspect-ratio: 16 / 10;
      }
      .img-cell img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .img-cap {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 4px 6px;
        font-size: 10px;
        color: #fff;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      @media (max-width: 800px) {
        .two-col {
          grid-template-columns: 1fr;
        }
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        padding: 4px 10px;
        border-radius: 6px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        font-size: 13px;
      }
      .palette-row {
        display: flex;
        gap: 6px;
        height: 36px;
      }
      .palette-row span {
        flex: 1;
        border-radius: 6px;
        border: 1px solid var(--border);
      }
      .export-list {
        margin: 0;
        padding-left: 18px;
      }
      .stage-outputs {
        margin-top: 16px;
        font-size: 12px;
      }
      .stage-outputs pre {
        overflow: auto;
        max-height: 360px;
        background: var(--bg-2);
        padding: 12px;
        border-radius: 8px;
      }
    `,
  ],
})
export class BrandAidPackageDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly ds = inject(BRAND_AID_DS);
  private readonly workflowDs = inject(WORKFLOW_DS);

  readonly pkg = signal<BrandPackage | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly workflowLink = signal<string[] | null>(null);

  private sub?: Subscription;
  private pollSub?: Subscription;

  ngOnInit(): void {
    const packageId = this.route.snapshot.paramMap.get('packageId') ?? '';
    this.load(packageId);
    this.pollSub = interval(DASHBOARD_POLL_INTERVAL_MS).subscribe(() => {
      if (this.pkg()?.status !== 'generating') return;
      this.ds.getPackage(packageId).subscribe({
        next: (p) => {
          this.pkg.set(p);
          this.resolveWorkflowLink(p);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  hasMoodboardImages(p: BrandPackage): boolean {
    return (p.moodboard_clusters ?? []).some((c) => c.references.some((r) => r.image_url));
  }

  private load(packageId: string): void {
    this.sub = this.ds.getPackage(packageId).subscribe({
      next: (p) => {
        this.pkg.set(p);
        this.loading.set(false);
        this.error.set(null);
        this.resolveWorkflowLink(p);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.error ?? e?.message ?? 'Failed to load package');
      },
    });
  }

  private resolveWorkflowLink(p: BrandPackage): void {
    if (!p.venture_id) {
      this.workflowLink.set(null);
      return;
    }
    this.workflowDs.activeForModule('brand-aid').subscribe((runs) => {
      const match = runs.find((r) => r.venture_id === p.venture_id);
      if (match) {
        this.workflowLink.set(['/workflow', 'brand-aid', match.temporal_workflow_id ?? match.id]);
      } else {
        this.workflowLink.set(null);
      }
    });
  }
}
