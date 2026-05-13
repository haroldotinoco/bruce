import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BRAND_AID_DS, BrandPackage } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

@Component({
  selector: 'app-brand-aid',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    KpiCardComponent,
    SkeletonComponent,
    WorkflowConstellationCardComponent,
    RelativeTimePipe,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Brand-Aid"
      eyebrow="Module · mock"
      icon="palette"
      subtitle="Naming, moodboards, visual systems, and brand books — all generated and red-teamed."
      badge="MOCK"
    >
      <div actions>
        <app-module-rollback-button moduleId="brand-aid"></app-module-rollback-button>
      </div>
    </app-page-header>

    <app-workflow-constellation-card moduleId="brand-aid"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Brand packages" [value]="count()" icon="layers" [delta]="2"></app-kpi-card>
      <app-kpi-card label="Logos generated" [value]="logos()" icon="palette" [delta]="4"></app-kpi-card>
      <app-kpi-card label="Avg. brand score" [value]="avgScore()" suffix=" / 100" icon="award" [delta]="1"></app-kpi-card>
      <app-kpi-card label="Ready for handoff" [value]="ready()" icon="check" [delta]="1"></app-kpi-card>
    </div>

    <div class="brand-grid" *ngIf="!loading(); else skel">
      <article class="bpkg" *ngFor="let p of pkgs()">
        <header>
          <div>
            <div class="bpkg-name">{{ p.venture_name }}</div>
            <div class="muted small">updated {{ p.updated_at | relativeTime }}</div>
          </div>
          <app-status-badge [status]="p.status"></app-status-badge>
        </header>

        <div class="palette">
          <span *ngFor="let c of p.palette" [style.background]="c"></span>
        </div>

        <div class="mood">
          <div class="mood-cell" *ngFor="let m of p.moodboard" [style.background]="m.color">
            <span>{{ m.label }}</span>
          </div>
        </div>

        <div class="names">
          <span class="name-chip" *ngFor="let n of p.names">{{ n }}</span>
        </div>

        <footer>
          <span class="muted small">{{ p.logos }} logos · score {{ p.score }}</span>
          <button class="btn btn-ghost">
            <lucide-icon name="external-link" [size]="12"></lucide-icon>
            Preview
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
      }
      .mood-cell span {
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
export class BrandAidComponent implements OnInit {
  private readonly ds = inject(BRAND_AID_DS);
  readonly pkgs = signal<BrandPackage[]>([]);
  readonly loading = signal(true);

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
    this.ds.listPackages().subscribe((p) => {
      this.pkgs.set(p);
      this.loading.set(false);
    });
  }
}
