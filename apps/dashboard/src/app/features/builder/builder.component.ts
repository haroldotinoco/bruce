import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BUILDER_DS, BuilderProject } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { WorkflowConstellationCardComponent } from '../../shared/workflow/workflow-constellation-card.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ScoreColorPipe } from '../../shared/pipes/score-color.pipe';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

@Component({
  selector: 'app-builder',
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
    ScoreColorPipe,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Builder"
      eyebrow="Module · mock"
      icon="hammer"
      subtitle="Product scaffolding, BDD scenarios, QA, and security — coordinated across spec-to-ship agents."
      badge="MOCK"
    >
      <div actions>
        <app-module-rollback-button moduleId="builder"></app-module-rollback-button>
      </div>
    </app-page-header>

    <app-workflow-constellation-card moduleId="builder"></app-workflow-constellation-card>

    <div class="kpis">
      <app-kpi-card label="Projects in flight" [value]="count()" icon="layers"></app-kpi-card>
      <app-kpi-card label="Components built" [value]="components()" icon="cpu"></app-kpi-card>
      <app-kpi-card label="BDD scenarios" [value]="scenarios()" icon="file-text"></app-kpi-card>
      <app-kpi-card label="Avg. QA pass rate" [value]="avgQa()" suffix="%" icon="gauge"></app-kpi-card>
    </div>

    <div class="build-grid" *ngIf="!loading(); else skel">
      <article class="proj" *ngFor="let p of projects()">
        <header>
          <div>
            <div class="name">{{ p.venture_name }}</div>
            <div class="muted small">updated {{ p.updated_at | relativeTime }}</div>
          </div>
          <app-status-badge [status]="p.status"></app-status-badge>
        </header>

        <div class="metrics">
          <div>
            <div class="val">{{ p.components }}</div>
            <div class="lbl muted small">components</div>
          </div>
          <div>
            <div class="val">{{ p.bdd_scenarios }}</div>
            <div class="lbl muted small">BDD</div>
          </div>
          <div>
            <div class="val" [style.color]="p.qa_pass_rate | scoreColor">{{ p.qa_pass_rate }}%</div>
            <div class="lbl muted small">QA</div>
          </div>
        </div>

        <div class="agents">
          <div class="agent" *ngFor="let a of p.agents">
            <span class="dot" [attr.data-status]="a.status"></span>
            <span class="nm">{{ a.name }}</span>
            <span class="muted small">{{ a.last | relativeTime }}</span>
          </div>
        </div>
      </article>
    </div>

    <ng-template #skel>
      <div class="build-grid">
        <app-skeleton height="260px" *ngFor="let _ of [1,2,3,4]"></app-skeleton>
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
      .build-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 900px) {
        .build-grid {
          grid-template-columns: 1fr;
        }
      }
      .proj {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .proj header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .name {
        font-family: 'Inter Tight';
        font-size: 16px;
        font-weight: 600;
      }
      .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        background: var(--bg-2);
        border-radius: 10px;
        padding: 12px;
      }
      .metrics .val {
        font-family: 'Inter Tight';
        font-size: 22px;
        font-weight: 700;
      }
      .agents {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .agent {
        display: grid;
        grid-template-columns: 10px 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px 10px;
        border-radius: 8px;
        background: var(--bg-2);
        font-size: 12px;
      }
      .agent .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fg-2);
      }
      .agent .dot[data-status='running'] {
        background: var(--accent-2);
        box-shadow: 0 0 8px var(--accent-2);
      }
      .agent .dot[data-status='done'] {
        background: var(--ok);
      }
      .agent .nm {
        color: var(--fg-0);
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
export class BuilderComponent implements OnInit {
  private readonly ds = inject(BUILDER_DS);
  readonly projects = signal<BuilderProject[]>([]);
  readonly loading = signal(true);

  count() {
    return this.projects().length;
  }
  components() {
    return this.projects().reduce((a, b) => a + b.components, 0);
  }
  scenarios() {
    return this.projects().reduce((a, b) => a + b.bdd_scenarios, 0);
  }
  avgQa() {
    const r = this.projects();
    if (!r.length) return 0;
    return Math.round(r.reduce((a, b) => a + b.qa_pass_rate, 0) / r.length);
  }

  ngOnInit() {
    this.ds.listProjects().subscribe((p) => {
      this.projects.set(p);
      this.loading.set(false);
    });
  }
}
