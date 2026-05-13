import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OPPORTUNITY_DS } from '../../core/data-sources/tokens';
import { ApiService } from '../../core/http/api.service';
import type { LlmUsageTotals } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { DataModeBannerComponent } from '../../shared/ui/data-mode-banner.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import type { Scan, Usage } from '../../core/models';
import { NewScanDialogComponent } from './new-scan-dialog.component';
import { ModuleRollbackButtonComponent } from '../../shared/ui/module-rollback-button.component';

@Component({
  selector: 'app-scans-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatusBadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    RelativeTimePipe,
    NewScanDialogComponent,
    DataModeBannerComponent,
    ModuleRollbackButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Opportunity"
      eyebrow="Module · live"
      icon="telescope"
      subtitle="Discover, score, and rank opportunities from themes or venture-bound seeds."
      badge="LIVE"
      badgeBg="rgba(34, 197, 94, 0.15)"
    >
      <div actions>
        <app-module-rollback-button moduleId="opportunity"></app-module-rollback-button>
        <button class="btn" (click)="reload()">
          <lucide-icon name="refresh-cw" [size]="12"></lucide-icon>
          Refresh
        </button>
        <button class="btn btn-primary" (click)="openWizard()">
          <lucide-icon name="plus" [size]="12"></lucide-icon>
          New scan
        </button>
      </div>
    </app-page-header>

    <app-data-mode-banner module="opportunity" [showWhenLive]="true"></app-data-mode-banner>

    <div class="op-grid">
      <div class="op-main">
        <app-section-card title="Scans" icon="activity" [hint]="count() + ' total'">
          <div actions class="flex gap-2">
            <select class="input" style="max-width: 160px" [(ngModel)]="statusFilter" (change)="reload()">
              <option value="">All statuses</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
          </div>

          <ng-container *ngIf="error() as err">
            <app-empty-state icon="circle-alert" title="Could not load scans" [subtitle]="err">
              <button class="btn" (click)="reload()">Retry</button>
            </app-empty-state>
          </ng-container>

          <ng-container *ngIf="!error()">
            <div class="tbl" *ngIf="!loading() && scans().length; else skel">
              <div class="tbl-row head">
                <div>ID</div>
                <div>Status</div>
                <div>Themes</div>
                <div class="num">Opps</div>
                <div>Created</div>
                <div>Completed</div>
                <div></div>
              </div>
              <a
                class="tbl-row"
                *ngFor="let s of scans()"
                [routerLink]="'/opportunity/scans/' + s.id"
              >
                <div class="mono">{{ shortId(s.id) }}</div>
                <app-status-badge [status]="s.status"></app-status-badge>
                <div class="chips">
                  <span class="chip" *ngFor="let t of (s.themes ?? []).slice(0, 3)">{{ t }}</span>
                  <span class="muted" *ngIf="!s.themes?.length">—</span>
                </div>
                <div class="num">
                  <span *ngIf="s.opportunities_found !== null">{{ s.opportunities_found }}</span>
                  <span class="muted" *ngIf="s.opportunities_found === null">—</span>
                </div>
                <div class="muted">{{ s.created_at | relativeTime }}</div>
                <div class="muted">
                  <span *ngIf="s.completed_at">{{ s.completed_at | relativeTime }}</span>
                  <span *ngIf="!s.completed_at">—</span>
                </div>
                <div class="cta">
                  <lucide-icon name="chevron-right" [size]="14"></lucide-icon>
                </div>
              </a>
            </div>

            <ng-template #skel>
              <ng-container *ngIf="loading()">
                <div class="tbl">
                  <div class="tbl-row head">
                    <div>ID</div>
                    <div>Status</div>
                    <div>Themes</div>
                    <div class="num">Opps</div>
                    <div>Created</div>
                    <div>Completed</div>
                    <div></div>
                  </div>
                  <div class="tbl-row" *ngFor="let _ of [1,2,3,4,5]">
                    <div><app-skeleton width="80px"></app-skeleton></div>
                    <div><app-skeleton width="60px"></app-skeleton></div>
                    <div><app-skeleton width="140px"></app-skeleton></div>
                    <div class="num"><app-skeleton width="30px"></app-skeleton></div>
                    <div><app-skeleton width="60px"></app-skeleton></div>
                    <div><app-skeleton width="60px"></app-skeleton></div>
                    <div></div>
                  </div>
                </div>
              </ng-container>
              <app-empty-state
                *ngIf="!loading() && !scans().length"
                icon="telescope"
                title="No scans yet"
                subtitle="Kick off a themed discovery or venture-bound scan to populate this list."
              >
                <button class="btn btn-primary" (click)="openWizard()">
                  <lucide-icon name="plus" [size]="12"></lucide-icon>
                  New scan
                </button>
              </app-empty-state>
            </ng-template>
          </ng-container>
        </app-section-card>
      </div>

      <aside class="op-side">
        <app-section-card title="Plan usage" icon="gauge">
          <div class="usage" *ngIf="usage(); else usageSkel">
            <div class="usage-big" *ngIf="!isUnlimited(); else unlimitedBlock">
              <span class="num">{{ usage()!.scans_this_month }}</span>
              <span class="divider">/</span>
              <span class="limit">{{ usage()!.scans_limit_month }}</span>
              <span class="lbl">scans · month</span>
            </div>
            <ng-template #unlimitedBlock>
              <div class="usage-big unlimited">
                <span class="num">{{ usage()!.scans_this_month }}</span>
                <span class="lbl">scans · this month</span>
                <span class="pill">Unlimited</span>
              </div>
            </ng-template>
            <div class="bar" *ngIf="!isUnlimited()">
              <div class="bar-fill" [style.width.%]="usagePercent()"></div>
            </div>
            <div class="kv">
              <div><span class="muted">Plan</span><strong class="cap">{{ usage()!.plan }}</strong></div>
              <div>
                <span class="muted">AI credits / mo</span>
                <strong *ngIf="!isUnlimited(); else unlimitedCredits">{{ usage()!.max_ai_credits_per_month | number }}</strong>
                <ng-template #unlimitedCredits><strong>∞</strong></ng-template>
              </div>
            </div>
          </div>
          <ng-template #usageSkel>
            <div class="stack">
              <app-skeleton width="50%" height="26px"></app-skeleton>
              <app-skeleton width="100%" height="8px"></app-skeleton>
              <app-skeleton width="80%" height="12px"></app-skeleton>
            </div>
          </ng-template>
        </app-section-card>

        <app-section-card title="LLM usage (7d)" icon="cpu" hint="This module · OpenRouter">
          <div class="usage" *ngIf="llmModule() as m; else llmSkel">
            <div class="kv">
              <div>
                <span class="muted">Total tokens</span>
                <strong>{{ m.total_tokens | number }}</strong>
              </div>
              <div>
                <span class="muted">Est. cost</span>
                <strong *ngIf="m.cost_usd != null; else noLlmCost"
                  >$<span>{{ m.cost_usd | number: '1.2-2' }}</span></strong
                >
                <ng-template #noLlmCost><strong>—</strong></ng-template>
              </div>
              <div>
                <span class="muted">Requests</span>
                <strong>{{ m.request_count }}</strong>
              </div>
            </div>
          </div>
          <ng-template #llmSkel>
            <div class="stack">
              <app-skeleton width="70%" height="14px"></app-skeleton>
              <app-skeleton width="50%" height="14px"></app-skeleton>
            </div>
          </ng-template>
        </app-section-card>

        <app-section-card title="Recipe" icon="sparkles" hint="what a scan does">
          <ol class="recipe">
            <li><strong>market-scanner</strong><span>Scans themes and web sources for candidates.</span></li>
            <li><strong>opportunity-analyst</strong><span>Builds a structured dossier for each candidate.</span></li>
            <li><strong>scoring</strong><span>Scores each dossier against quality criteria.</span></li>
            <li><strong>prioritization</strong><span>Ranks opportunities, returning the top picks.</span></li>
          </ol>
        </app-section-card>
      </aside>
    </div>

    <app-new-scan-dialog
      *ngIf="wizardOpen()"
      (close)="wizardOpen.set(false)"
      (created)="onCreated($event)"
    ></app-new-scan-dialog>
  `,
  styles: [
    `
      .op-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 20px;
      }
      @media (max-width: 980px) {
        .op-grid {
          grid-template-columns: 1fr;
        }
      }
      .op-side {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .tbl {
        display: flex;
        flex-direction: column;
      }
      .tbl-row {
        display: grid;
        grid-template-columns: 140px 120px minmax(0, 1fr) 60px 120px 120px 32px;
        gap: 14px;
        align-items: center;
        padding: 12px 4px;
        border-top: 1px solid var(--border);
        color: var(--fg-0);
        text-decoration: none;
        font-size: 13px;
      }
      .tbl-row.head {
        border-top: 0;
        color: var(--fg-2);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 8px 4px;
      }
      .tbl-row:hover:not(.head) {
        background: var(--bg-2);
        border-radius: 8px;
      }
      .tbl-row .num {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .tbl-row .chips {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .tbl-row .mono {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--fg-1);
      }
      .cta {
        color: var(--fg-2);
      }
      .muted {
        color: var(--fg-2);
      }
      .usage-big {
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-family: 'Inter Tight', Inter, sans-serif;
      }
      .usage-big .num {
        font-size: 34px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .usage-big .divider {
        color: var(--fg-2);
      }
      .usage-big .limit {
        color: var(--fg-1);
        font-size: 18px;
      }
      .usage-big .lbl {
        color: var(--fg-2);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-left: 8px;
      }
      .usage-big.unlimited .pill {
        margin-left: auto;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 3px 8px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
        color: #0b0b10;
      }
      .bar {
        height: 6px;
        background: var(--bg-2);
        border-radius: 999px;
        overflow: hidden;
        margin: 10px 0 14px;
      }
      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
      }
      .kv {
        display: grid;
        gap: 8px;
      }
      .kv > div {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }
      .kv strong {
        color: var(--fg-0);
        font-weight: 600;
      }
      .cap {
        text-transform: capitalize;
      }
      .recipe {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        counter-reset: step;
      }
      .recipe li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 12px;
        color: var(--fg-1);
      }
      .recipe li::before {
        content: counter(step);
        counter-increment: step;
        flex: 0 0 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--bg-2);
        border: 1px solid var(--border);
        display: grid;
        place-items: center;
        font-size: 10px;
        color: var(--fg-1);
      }
      .recipe strong {
        display: block;
        color: var(--fg-0);
        font-weight: 600;
      }
      .recipe span {
        display: block;
        color: var(--fg-1);
      }
    `,
  ],
})
export class ScansListComponent implements OnInit {
  private readonly ds = inject(OPPORTUNITY_DS);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  readonly scans = signal<Scan[]>([]);
  readonly usage = signal<Usage | null>(null);
  readonly llmModule = signal<LlmUsageTotals | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly wizardOpen = signal<boolean>(false);
  readonly count = computed(() => this.scans().length);
  readonly usagePercent = computed(() => {
    const u = this.usage();
    if (!u || !u.scans_limit_month) return 0;
    return Math.min(100, Math.round((u.scans_this_month / u.scans_limit_month) * 100));
  });
  readonly isUnlimited = computed(() => {
    const u = this.usage();
    if (!u) return false;
    if (u.unlimited) return true;
    return (u.scans_limit_month ?? 0) >= 100_000;
  });

  statusFilter = '';

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ds.listScans({ limit: 20, status: this.statusFilter || undefined }).subscribe({
      next: (rows) => {
        this.scans.set(rows);
        this.loading.set(false);
      },
      error: (e: unknown) => {
        this.loading.set(false);
        this.error.set(this.extractError(e));
      },
    });
    this.ds.getUsage().subscribe({
      next: (u) => this.usage.set(u),
      error: () => {
        /* ignore usage errors in UI */
      },
    });
    this.api
      .get<{ period: LlmUsageTotals }>('bruce-core', '/metrics/llm/module', {
        params: { module: 'opportunity', days: 7 },
      })
      .subscribe({
        next: (r) => this.llmModule.set(r.period),
        error: () => this.llmModule.set(null),
      });
  }

  openWizard(): void {
    this.wizardOpen.set(true);
  }

  onCreated(workflowId: string): void {
    this.wizardOpen.set(false);
    this.router.navigateByUrl(`/opportunity/scans/${workflowId}`);
  }

  shortId(id: string): string {
    if (!id) return '';
    if (id.length <= 16) return id;
    return id.slice(0, 8) + '…' + id.slice(-4);
  }

  private extractError(e: unknown): string {
    const any = e as any;
    if (any?.status === 0) return 'Network error — is the api-gateway running on :3010?';
    if (any?.status === 401) return 'Unauthorized — set a valid token in Settings.';
    return any?.error?.error ?? any?.message ?? 'Unknown error';
  }
}
