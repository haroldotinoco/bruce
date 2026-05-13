import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AGENTS_DS } from '../../core/data-sources/tokens';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SectionCardComponent } from '../../shared/ui/section-card.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { MODULE_REGISTRY, getModuleMeta } from '../../core/config/module-registry';
import type { ModuleId } from '../../core/config/env.types';
import type { AgentCapability } from '../../core/models';

interface ModuleNode {
  id: ModuleId;
  label: string;
  shortLabel: string;
  accent: string;
  icon: string;
  x: number;
  y: number;
  agents: AgentCapability[];
  angle: number;
}

interface AgentNode {
  agent: AgentCapability;
  x: number;
  y: number;
  active: boolean;
  angle: number;
}

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    PageHeaderComponent,
    SectionCardComponent,
    KpiCardComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Agents"
      eyebrow="Constellation"
      icon="bot"
      subtitle="Every named agent across the platform, orbiting its module. Click a module to expand its cluster."
    >
      <div actions>
        <div class="toggle">
          <button class="seg" [class.active]="view() === 'graph'" (click)="view.set('graph')">
            <lucide-icon name="network" [size]="12"></lucide-icon> Graph
          </button>
          <button class="seg" [class.active]="view() === 'list'" (click)="view.set('list')">
            <lucide-icon name="layout-grid" [size]="12"></lucide-icon> List
          </button>
        </div>
      </div>
    </app-page-header>

    <div class="kpis">
      <app-kpi-card label="Total agents" [value]="count()" icon="bot"></app-kpi-card>
      <app-kpi-card label="Modules" [value]="moduleCount()" icon="layers"></app-kpi-card>
      <app-kpi-card label="Active now" [value]="activeCount()" icon="activity" sparkColor="var(--accent-2)"></app-kpi-card>
      <app-kpi-card label="With I/O schemas" [value]="withIo()" icon="file-text"></app-kpi-card>
    </div>

    <ng-container *ngIf="loading()">
      <app-skeleton height="620px"></app-skeleton>
    </ng-container>

    <ng-container *ngIf="!loading()">
      <!-- GRAPH VIEW -->
      <div class="graph-wrap" *ngIf="view() === 'graph'">
        <svg
          class="constellation"
          viewBox="0 0 1000 620"
          preserveAspectRatio="xMidYMid meet"
          (click)="selectModule(null)"
        >
          <defs>
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stop-color="#7c5cff" stop-opacity="0.18" />
              <stop offset="50%" stop-color="#22d3ee" stop-opacity="0.05" />
              <stop offset="100%" stop-color="#0b0d12" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.9" />
              <stop offset="70%" stop-color="#7c5cff" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#7c5cff" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#7c5cff" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.6" />
            </linearGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- background atmosphere -->
          <rect width="1000" height="620" fill="url(#bgGlow)" opacity="0.8"></rect>

          <!-- rotating dashed orbits -->
          <g class="orbits" transform="translate(500 310)">
            <circle r="290" fill="none" stroke="rgba(124,92,255,0.06)" stroke-width="1" stroke-dasharray="2 8" class="orbit-slow"></circle>
            <circle r="240" fill="none" stroke="rgba(34,211,238,0.06)" stroke-width="1" stroke-dasharray="3 6" class="orbit-med"></circle>
            <circle r="150" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="1 4" class="orbit-fast"></circle>
          </g>

          <!-- edges from core to modules -->
          <g class="edges">
            <g *ngFor="let m of moduleNodes(); let i = index" [attr.data-mid]="m.id">
              <path
                [attr.id]="'edge-' + m.id"
                [attr.d]="'M 500 310 L ' + m.x + ' ' + m.y"
                stroke="url(#edgeGrad)"
                stroke-width="1"
                fill="none"
                opacity="0.35"
                [class.dim]="selected() && selected() !== m.id"
              ></path>
              <!-- dash travel -->
              <path
                [attr.d]="'M 500 310 L ' + m.x + ' ' + m.y"
                stroke="rgba(255,255,255,0.25)"
                stroke-width="0.8"
                fill="none"
                stroke-dasharray="4 22"
                class="dash-run"
                [style.animation-delay.s]="i * 0.35"
              ></path>
              <!-- data packet -->
              <circle r="2.4" fill="#e7ebf2" opacity="0.9">
                <animateMotion
                  [attr.dur]="(4 + i * 0.4) + 's'"
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath [attr.href]="'#edge-' + m.id"></mpath>
                </animateMotion>
              </circle>
            </g>
          </g>

          <!-- edges from module to its agents when selected -->
          <g class="agent-edges" *ngIf="selectedNode() as mn">
            <line
              *ngFor="let a of selectedAgents(); let j = index"
              [attr.x1]="mn.x"
              [attr.y1]="mn.y"
              [attr.x2]="a.x"
              [attr.y2]="a.y"
              [attr.stroke]="mn.accent"
              stroke-width="1"
              stroke-opacity="0.35"
              stroke-dasharray="2 4"
              class="agent-edge"
              [style.animation-delay.ms]="j * 40"
            ></line>
          </g>

          <!-- core hub -->
          <g class="core" transform="translate(500 310)">
            <circle r="72" fill="url(#coreGrad)" opacity="0.55" class="pulse-slow"></circle>
            <circle r="36" fill="#0f1220" stroke="rgba(167,139,250,0.5)" stroke-width="1"></circle>
            <circle r="36" fill="none" stroke="rgba(167,139,250,0.2)" stroke-width="1" class="ring-spin"></circle>
            <text text-anchor="middle" y="-4" fill="#e7ebf2" font-size="10" font-weight="700" letter-spacing="2">BRUCE</text>
            <text text-anchor="middle" y="10" fill="#9aa3b2" font-size="8" letter-spacing="3">CORE · HUB</text>
            <text text-anchor="middle" y="22" fill="#7c5cff" font-size="9" font-weight="700">{{ count() }} agents</text>
          </g>

          <!-- module nodes -->
          <g class="modules">
            <g
              *ngFor="let m of moduleNodes()"
              class="module"
              [class.selected]="selected() === m.id"
              [class.dim]="selected() && selected() !== m.id"
              [attr.transform]="'translate(' + m.x + ' ' + m.y + ')'"
              (click)="$event.stopPropagation(); selectModule(m.id)"
              tabindex="0"
              [attr.aria-label]="m.label"
            >
              <circle r="38" [attr.fill]="m.accent" fill-opacity="0.06" [attr.stroke]="m.accent" stroke-opacity="0.4" stroke-width="1" class="halo"></circle>
              <circle r="24" fill="#12151d" [attr.stroke]="m.accent" stroke-width="1.2" filter="url(#softGlow)"></circle>
              <text text-anchor="middle" dy="4" [attr.fill]="m.accent" font-size="11" font-weight="700">{{ m.shortLabel }}</text>
              <!-- agent count ring -->
              <g transform="translate(0 36)">
                <rect x="-22" y="-7" width="44" height="14" rx="7" fill="#12151d" [attr.stroke]="m.accent" stroke-opacity="0.3"></rect>
                <text text-anchor="middle" dy="3" fill="#e7ebf2" font-size="8" font-weight="600">{{ m.agents.length }} agents</text>
              </g>
              <!-- orbiting dots when not selected -->
              <ng-container *ngIf="selected() !== m.id">
                <g class="mini-orbit">
                  <circle
                    *ngFor="let _ of m.agents.slice(0, 6); let k = index"
                    r="1.6"
                    [attr.cx]="orbitX(k, m.agents.length > 6 ? 6 : m.agents.length, 32)"
                    [attr.cy]="orbitY(k, m.agents.length > 6 ? 6 : m.agents.length, 32)"
                    [attr.fill]="m.accent"
                    opacity="0.8"
                  ></circle>
                </g>
              </ng-container>
            </g>
          </g>

          <!-- agent nodes for selected module -->
          <g class="agent-nodes" *ngIf="selected()">
            <g
              *ngFor="let a of selectedAgents()"
              [attr.transform]="'translate(' + a.x + ' ' + a.y + ')'"
            >
              <g
                class="agent"
                [class.active]="a.active"
                (click)="$event.stopPropagation(); focusAgent(a.agent)"
              >
                <circle r="12" fill="#0f1220" [attr.stroke]="selectedNode()!.accent" stroke-width="1"></circle>
                <circle *ngIf="a.active" r="16" fill="none" [attr.stroke]="selectedNode()!.accent" stroke-width="1" class="agent-pulse"></circle>
                <circle r="3" [attr.fill]="a.active ? selectedNode()!.accent : 'rgba(255,255,255,0.4)'"></circle>
                <text text-anchor="middle" y="26" fill="#e7ebf2" font-size="9" font-weight="500">
                  {{ shortName(a.agent.label || a.agent.name) }}
                </text>
              </g>
            </g>
          </g>
        </svg>

        <!-- side panel -->
        <aside class="inspect" *ngIf="focused() as f">
          <div class="ins-head">
            <div class="ins-module" [style.--accent]="moduleColor(f.module)">
              <span class="dot"></span>
              {{ moduleLabel(f.module) }}
            </div>
            <button class="close" (click)="focused.set(null)">
              <lucide-icon name="x" [size]="14"></lucide-icon>
            </button>
          </div>
          <h3>{{ f.label || f.name }}</h3>
          <p class="muted">{{ f.description }}</p>
          <div class="caps" *ngIf="f.capabilities?.length">
            <span class="cap" *ngFor="let c of f.capabilities">{{ c }}</span>
          </div>
          <dl class="io" *ngIf="f.inputs?.length || f.outputs?.length">
            <ng-container *ngIf="f.inputs?.length">
              <dt>Inputs</dt>
              <dd>
                <span class="tag" *ngFor="let x of f.inputs">{{ x }}</span>
              </dd>
            </ng-container>
            <ng-container *ngIf="f.outputs?.length">
              <dt>Outputs</dt>
              <dd>
                <span class="tag out" *ngFor="let x of f.outputs">{{ x }}</span>
              </dd>
            </ng-container>
            <ng-container *ngIf="f.model">
              <dt>Model</dt>
              <dd><span class="mono">{{ f.model }}</span></dd>
            </ng-container>
          </dl>
        </aside>

        <div class="legend">
          <span class="lg"><span class="dot" style="background: var(--accent-2)"></span> data flow</span>
          <span class="lg"><span class="dot pulse"></span> active agent</span>
          <span class="lg muted">click a module to expand its agents</span>
        </div>
      </div>

      <!-- LIST VIEW -->
      <app-section-card *ngIf="view() === 'list'" title="Catalog" icon="layout-grid">
        <div actions class="filters">
          <input type="text" class="input" [(ngModel)]="q" placeholder="Search…" style="max-width: 220px" />
          <select class="input" style="max-width: 160px" [(ngModel)]="moduleFilter">
            <option value="">All modules</option>
            <option *ngFor="let m of modules" [value]="m.id">{{ m.label }}</option>
          </select>
        </div>
        <div class="grid" *ngIf="filtered().length; else none">
          <article class="card" *ngFor="let a of filtered()" [style.--accent]="moduleColor(a.module)">
            <div class="card-head">
              <span class="badge">{{ moduleShort(a.module) }}</span>
              <h3>{{ a.label || a.name }}</h3>
            </div>
            <p>{{ a.description }}</p>
            <div class="caps" *ngIf="a.capabilities?.length">
              <span class="cap" *ngFor="let c of a.capabilities">{{ c }}</span>
            </div>
            <footer>
              <span class="muted small" *ngIf="a.inputs?.length">in: {{ a.inputs?.join(', ') }}</span>
              <span class="muted small" *ngIf="a.outputs?.length">out: {{ a.outputs?.join(', ') }}</span>
              <span class="model" *ngIf="a.model">{{ a.model }}</span>
            </footer>
          </article>
        </div>
        <ng-template #none>
          <app-empty-state icon="bot" title="No agents found"></app-empty-state>
        </ng-template>
      </app-section-card>
    </ng-container>
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }
      .toggle {
        display: inline-flex;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 999px;
        overflow: hidden;
        padding: 2px;
      }
      .seg {
        background: transparent;
        border: 0;
        color: var(--fg-2);
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border-radius: 999px;
      }
      .seg.active {
        background: var(--bg-3);
        color: var(--fg-0);
      }

      /* GRAPH */
      .graph-wrap {
        position: relative;
        background:
          radial-gradient(1200px 600px at 50% 40%, rgba(124, 92, 255, 0.08), transparent 60%),
          linear-gradient(180deg, #0b0d12, #0f1220);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        min-height: 620px;
      }
      .constellation {
        width: 100%;
        height: 620px;
        display: block;
        cursor: default;
        user-select: none;
      }
      .orbit-slow {
        animation: spin 60s linear infinite;
        transform-origin: 0 0;
      }
      .orbit-med {
        animation: spin 40s linear infinite reverse;
        transform-origin: 0 0;
      }
      .orbit-fast {
        animation: spin 25s linear infinite;
        transform-origin: 0 0;
      }
      .pulse-slow {
        animation: pulseGlow 4s ease-in-out infinite;
        transform-origin: 0 0;
      }
      .ring-spin {
        stroke-dasharray: 6 6;
        animation: spin 20s linear infinite;
        transform-origin: 0 0;
      }
      .dash-run {
        animation: dash 2.5s linear infinite;
      }
      .module {
        cursor: pointer;
        transition: opacity 180ms ease;
      }
      .module .halo {
        transition: fill-opacity 220ms ease, r 220ms ease;
      }
      .module:hover .halo,
      .module:focus .halo {
        fill-opacity: 0.14;
      }
      .module.selected .halo {
        fill-opacity: 0.2;
      }
      .module.dim {
        opacity: 0.35;
      }
      .edges .dim {
        opacity: 0.08 !important;
      }
      .mini-orbit {
        animation: spin 18s linear infinite;
        transform-origin: 0 0;
      }
      .agent {
        cursor: pointer;
        animation: popIn 260ms ease-out both;
      }
      .agent-edge {
        animation: dash 4s linear infinite, fadeIn 400ms ease-out both;
      }
      .agent-pulse {
        animation: pulseRing 1.8s ease-out infinite;
        transform-origin: 0 0;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes dash {
        to {
          stroke-dashoffset: -120;
        }
      }
      @keyframes pulseGlow {
        0%,
        100% {
          opacity: 0.35;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.08);
        }
      }
      @keyframes pulseRing {
        0% {
          opacity: 0.8;
          r: 12;
        }
        100% {
          opacity: 0;
          r: 28;
        }
      }
      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.6);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .agent {
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Inspector panel */
      .inspect {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 300px;
        max-height: calc(100% - 32px);
        overflow: auto;
        background: rgba(18, 21, 29, 0.92);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px;
        animation: slide 200ms ease-out;
      }
      @keyframes slide {
        from {
          opacity: 0;
          transform: translateX(8px);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      .ins-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .ins-module {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--accent, var(--fg-1));
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .ins-module .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent, var(--fg-1));
        box-shadow: 0 0 8px var(--accent, var(--fg-1));
      }
      .inspect h3 {
        margin: 4px 0 6px;
        font-size: 15px;
        font-weight: 600;
        color: var(--fg-0);
      }
      .inspect p {
        color: var(--fg-1);
        font-size: 12px;
        margin: 0 0 10px;
      }
      .close {
        background: transparent;
        border: 0;
        color: var(--fg-2);
        cursor: pointer;
      }
      .caps {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .cap {
        font-size: 10px;
        padding: 2px 6px;
        background: rgba(124, 92, 255, 0.1);
        color: #b8a5ff;
        border-radius: 4px;
      }
      .io {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 6px 10px;
        margin: 0;
      }
      .io dt {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--fg-2);
      }
      .io dd {
        margin: 0;
      }
      .tag {
        display: inline-block;
        font-size: 10px;
        padding: 2px 6px;
        background: rgba(34, 211, 238, 0.08);
        color: #67e8f9;
        border-radius: 4px;
        margin-right: 4px;
        margin-bottom: 4px;
      }
      .tag.out {
        background: rgba(34, 197, 94, 0.08);
        color: #4ade80;
      }
      .mono {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
      }
      .legend {
        position: absolute;
        bottom: 12px;
        left: 16px;
        display: flex;
        gap: 14px;
        align-items: center;
        font-size: 11px;
        color: var(--fg-2);
      }
      .legend .lg {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .legend .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-2);
      }
      .legend .dot.pulse {
        background: var(--accent);
        box-shadow: 0 0 10px var(--accent);
        animation: pulseGlow 1.4s ease-in-out infinite;
      }

      /* LIST VIEW styles */
      .filters {
        display: flex;
        gap: 8px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      @media (max-width: 1180px) {
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 720px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
      .card {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        overflow: hidden;
      }
      .card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--accent);
      }
      .card-head {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .badge {
        padding: 2px 7px;
        background: var(--bg-2);
        border-radius: 999px;
        font-size: 10px;
        color: var(--fg-1);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .card h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .card p {
        margin: 0;
        color: var(--fg-1);
        font-size: 12px;
        min-height: 48px;
      }
      .card footer {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
        flex-wrap: wrap;
      }
      .model {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: var(--fg-1);
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
export class AgentsComponent implements OnInit {
  private readonly ds = inject(AGENTS_DS);
  readonly agents = signal<AgentCapability[]>([]);
  readonly loading = signal(true);
  readonly modules = MODULE_REGISTRY;

  readonly view = signal<'graph' | 'list'>('graph');
  readonly selected = signal<ModuleId | null>(null);
  readonly focused = signal<AgentCapability | null>(null);

  q = '';
  moduleFilter = '';

  private readonly CENTER = { x: 500, y: 310 };
  private readonly MODULE_RADIUS = 220;
  private readonly AGENT_RADIUS = 85;

  private readonly _activeSet = new Set<string>();

  constructor() {
    setInterval(() => this.rotateActive(), 2600);
  }

  count = computed(() => this.agents().length);
  moduleCount = computed(() => new Set(this.agents().map((a) => a.module)).size);
  withIo = computed(() => this.agents().filter((a) => (a.inputs?.length ?? 0) || (a.outputs?.length ?? 0)).length);
  activeCount = computed(() => Math.max(1, Math.round(this.count() * 0.12)));

  readonly moduleNodes = computed<ModuleNode[]>(() => {
    const list = MODULE_REGISTRY;
    const n = list.length;
    return list.map((m, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        id: m.id,
        label: m.label,
        shortLabel: m.shortLabel,
        accent: m.accent,
        icon: m.icon,
        x: this.CENTER.x + Math.cos(angle) * this.MODULE_RADIUS,
        y: this.CENTER.y + Math.sin(angle) * this.MODULE_RADIUS,
        agents: this.agents().filter((a) => a.module === m.id),
        angle,
      };
    });
  });

  readonly selectedNode = computed<ModuleNode | null>(() => {
    const id = this.selected();
    if (!id) return null;
    return this.moduleNodes().find((m) => m.id === id) ?? null;
  });

  readonly selectedAgents = computed<AgentNode[]>(() => {
    const mn = this.selectedNode();
    if (!mn) return [];
    const list = mn.agents;
    const n = list.length;
    const baseR = Math.min(this.AGENT_RADIUS + Math.max(0, n - 6) * 4, 120);
    return list.map((a, i) => {
      const spread = Math.min(Math.PI * 1.1, (n <= 1 ? 0.01 : (n - 1) * 0.22));
      const start = mn.angle - spread / 2;
      const angle = n === 1 ? mn.angle : start + (i / (n - 1)) * spread;
      return {
        agent: a,
        x: mn.x + Math.cos(angle) * baseR,
        y: mn.y + Math.sin(angle) * baseR,
        active: this._activeSet.has(a.id),
        angle,
      };
    });
  });

  readonly filtered = computed(() => {
    const q = this.q.toLowerCase().trim();
    return this.agents().filter((a) => {
      if (this.moduleFilter && a.module !== this.moduleFilter) return false;
      if (!q) return true;
      const hay = `${a.name} ${a.label} ${a.description} ${(a.capabilities ?? []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  });

  moduleShort(id: string): string {
    return getModuleMeta(id as ModuleId)?.shortLabel ?? id;
  }
  moduleLabel(id: string): string {
    return getModuleMeta(id as ModuleId)?.label ?? id;
  }
  moduleColor(id: string): string {
    return getModuleMeta(id as ModuleId)?.accent ?? 'var(--accent)';
  }

  shortName(label: string): string {
    return label.length > 18 ? label.slice(0, 17) + '…' : label;
  }

  orbitX(i: number, total: number, r: number): number {
    const angle = (i / total) * Math.PI * 2;
    return Math.cos(angle) * r;
  }
  orbitY(i: number, total: number, r: number): number {
    const angle = (i / total) * Math.PI * 2;
    return Math.sin(angle) * r;
  }

  selectModule(id: ModuleId | null) {
    this.selected.set(id);
    this.focused.set(null);
  }

  focusAgent(a: AgentCapability) {
    this.focused.set(a);
  }

  private rotateActive() {
    const all = this.agents();
    if (!all.length) return;
    const targetCount = this.activeCount();
    this._activeSet.clear();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    for (const a of shuffled.slice(0, targetCount)) {
      this._activeSet.add(a.id);
    }
    this.agents.update((x) => [...x]);
  }

  ngOnInit() {
    this.ds.listAgents().subscribe((a) => {
      this.agents.set(a);
      this.loading.set(false);
      this.rotateActive();
    });
  }
}
