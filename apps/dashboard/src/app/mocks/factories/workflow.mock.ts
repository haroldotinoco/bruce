import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type {
  ActiveWorkflow,
  LogValue,
  StepLogEntry,
  WorkflowStep,
  WorkflowStepStatus,
} from '../../core/models';
import type { IWorkflowDataSource } from '../../core/data-sources/tokens';
import type { ModuleId } from '../../core/config/env.types';
import { SEED_VENTURES } from './ventures.mock';
import { minutesAgoIso, seededRandom, withLatency } from '../latency';

interface StepTemplate {
  id: string;
  label: string;
  icon: string;
  description: string;
  agent_ids: string[];
  inputs?: string[];
  outputs?: string[];
}

const TEMPLATES: Record<ModuleId, StepTemplate[]> = {
  'bruce-core': [
    {
      id: 'intake',
      label: 'Venture intake',
      icon: 'inbox',
      description: 'Capture venture concept, owner, and initial framing.',
      agent_ids: ['governance-agent'],
      outputs: ['venture_draft'],
    },
    {
      id: 'gate-review',
      label: 'Gate review',
      icon: 'shield-check',
      description: 'Apply governance gate and readiness checks.',
      agent_ids: ['governance-agent'],
      inputs: ['venture_draft'],
      outputs: ['gate_decision'],
    },
    {
      id: 'provision',
      label: 'Provisioning',
      icon: 'cpu',
      description: 'Provision modules and resources required for the stage.',
      agent_ids: ['governance-agent'],
      inputs: ['gate_decision'],
      outputs: ['provisioned_venture'],
    },
  ],
  opportunity: [
    {
      id: 'market-scanner',
      label: 'Market scanner',
      icon: 'search',
      description: 'Scan themes and sources to surface candidate opportunities.',
      agent_ids: ['market-scanner'],
      outputs: ['opportunity_candidates'],
    },
    {
      id: 'opportunity-analyst',
      label: 'Opportunity analyst',
      icon: 'file-text',
      description: 'Deep-dive candidates into structured dossiers.',
      agent_ids: ['opportunity-analyst'],
      inputs: ['opportunity_candidates'],
      outputs: ['opportunity_dossier'],
    },
    {
      id: 'scoring',
      label: 'Scoring',
      icon: 'gauge',
      description: 'Quality gate scoring at 70+.',
      agent_ids: ['opportunity-analyst'],
      inputs: ['opportunity_dossier'],
      outputs: ['scored_opportunities'],
    },
    {
      id: 'prioritization',
      label: 'Prioritization',
      icon: 'award',
      description: 'Rank by composite score and hand off to Add-Venture.',
      agent_ids: ['opportunity-analyst'],
      inputs: ['scored_opportunities'],
      outputs: ['ranked_opportunities'],
    },
  ],
  'add-venture': [
    {
      id: 'structuring',
      label: 'Structuring',
      icon: 'git-branch',
      description: 'Build initial dossier scaffold from opportunity.',
      agent_ids: ['structuring-agent'],
      outputs: ['dossier_draft'],
    },
    {
      id: 'business-model',
      label: 'Business model',
      icon: 'layers',
      description: 'Segments, value props, channels, pricing.',
      agent_ids: ['business-model-agent'],
      inputs: ['dossier_draft'],
      outputs: ['business_model'],
    },
    {
      id: 'narrative',
      label: 'Narrative',
      icon: 'book-open',
      description: 'Compose strategic narrative and positioning.',
      agent_ids: ['narrative-agent'],
      inputs: ['business_model'],
      outputs: ['narrative'],
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      icon: 'map',
      description: 'Quarterly roadmap with owners and gates.',
      agent_ids: ['roadmap-agent'],
      inputs: ['narrative'],
      outputs: ['roadmap'],
    },
    {
      id: 'critic',
      label: 'Critic review',
      icon: 'scale',
      description: 'Apply critic checklist and score the dossier.',
      agent_ids: ['critic-agent'],
      inputs: ['roadmap'],
      outputs: ['dossier_final'],
    },
  ],
  'brand-aid': [
    {
      id: 'naming',
      label: 'Naming',
      icon: 'type',
      description: 'Generate and validate candidate brand names.',
      agent_ids: ['naming-agent'],
      outputs: ['name_candidates'],
    },
    {
      id: 'moodboard',
      label: 'Moodboard',
      icon: 'image',
      description: 'Curate moodboard and visual direction.',
      agent_ids: ['moodboard-agent'],
      inputs: ['name_candidates'],
      outputs: ['moodboard'],
    },
    {
      id: 'visual-system',
      label: 'Visual system',
      icon: 'palette',
      description: 'Palette, type, tokens, logo family.',
      agent_ids: ['visual-system-agent'],
      inputs: ['moodboard'],
      outputs: ['visual_system'],
    },
    {
      id: 'brand-book',
      label: 'Brand book',
      icon: 'book',
      description: 'Assemble final brand book artifact.',
      agent_ids: ['brandbook-agent'],
      inputs: ['visual_system'],
      outputs: ['brand_book'],
    },
  ],
  builder: [
    {
      id: 'solution-architect',
      label: 'Solution architect',
      icon: 'network',
      description: 'Design high-level architecture from spec.',
      agent_ids: ['solution-architect'],
      outputs: ['architecture'],
    },
    {
      id: 'backend-agent',
      label: 'Backend',
      icon: 'server',
      description: 'Scaffold backend services and APIs.',
      agent_ids: ['backend-agent'],
      inputs: ['architecture'],
      outputs: ['backend'],
    },
    {
      id: 'frontend-agent',
      label: 'Frontend',
      icon: 'monitor',
      description: 'Scaffold UI and wire API clients.',
      agent_ids: ['frontend-agent'],
      inputs: ['backend'],
      outputs: ['frontend'],
    },
    {
      id: 'qa-agent',
      label: 'QA',
      icon: 'check-circle',
      description: 'Run BDD suites and regression checks.',
      agent_ids: ['qa-agent'],
      inputs: ['backend', 'frontend'],
      outputs: ['qa_report'],
    },
    {
      id: 'security-agent',
      label: 'Security',
      icon: 'shield',
      description: 'Static analysis and dependency review.',
      agent_ids: ['security-agent'],
      inputs: ['qa_report'],
      outputs: ['security_report'],
    },
  ],
  gtm: [
    {
      id: 'hypothesis',
      label: 'Hypothesis',
      icon: 'lightbulb',
      description: 'Formalize experiment hypothesis and metric.',
      agent_ids: ['gtm-strategist'],
      outputs: ['hypothesis'],
    },
    {
      id: 'channel',
      label: 'Channel design',
      icon: 'share-2',
      description: 'Pick channel, audience, and cadence.',
      agent_ids: ['channel-agent'],
      inputs: ['hypothesis'],
      outputs: ['channel_plan'],
    },
    {
      id: 'campaign',
      label: 'Campaign run',
      icon: 'rocket',
      description: 'Execute outbound / content / paid campaign.',
      agent_ids: ['campaign-agent'],
      inputs: ['channel_plan'],
      outputs: ['campaign_results'],
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: 'bar-chart-3',
      description: 'Compare observed vs target; mark won/lost.',
      agent_ids: ['gtm-analyst'],
      inputs: ['campaign_results'],
      outputs: ['experiment_outcome'],
    },
  ],
  'startup-ops': [
    {
      id: 'checklist',
      label: 'Checklist',
      icon: 'list-checks',
      description: 'Gather compliance and ops requirements.',
      agent_ids: ['ops-agent'],
      outputs: ['checklist'],
    },
    {
      id: 'legal',
      label: 'Legal',
      icon: 'scale',
      description: 'Contracts, entities, terms.',
      agent_ids: ['legal-agent'],
      inputs: ['checklist'],
      outputs: ['legal_pack'],
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: 'dollar-sign',
      description: 'Books, payroll, runway, reporting.',
      agent_ids: ['finance-agent'],
      inputs: ['checklist'],
      outputs: ['finance_pack'],
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: 'truck',
      description: 'Onboard and manage vendors.',
      agent_ids: ['vendor-agent'],
      inputs: ['checklist'],
      outputs: ['vendor_registry'],
    },
  ],
  portfolio: [
    {
      id: 'collect',
      label: 'Collect',
      icon: 'database',
      description: 'Pull cross-venture signals.',
      agent_ids: ['portfolio-analyst'],
      outputs: ['raw_signals'],
    },
    {
      id: 'score',
      label: 'Score',
      icon: 'gauge',
      description: 'Score each venture on risk/health.',
      agent_ids: ['portfolio-analyst'],
      inputs: ['raw_signals'],
      outputs: ['scored_portfolio'],
    },
    {
      id: 'rebalance',
      label: 'Rebalance',
      icon: 'shuffle',
      description: 'Suggest focus shifts and allocation.',
      agent_ids: ['portfolio-analyst'],
      inputs: ['scored_portfolio'],
      outputs: ['rebalance_plan'],
    },
  ],
  'bruce-memory': [
    {
      id: 'ingest',
      label: 'Ingest',
      icon: 'download',
      description: 'Ingest cross-venture artifacts.',
      agent_ids: ['memory-ingestor'],
      outputs: ['documents'],
    },
    {
      id: 'embed',
      label: 'Embed',
      icon: 'cpu',
      description: 'Embed and index documents.',
      agent_ids: ['memory-embedder'],
      inputs: ['documents'],
      outputs: ['index'],
    },
    {
      id: 'pattern-miner',
      label: 'Pattern miner',
      icon: 'sparkles',
      description: 'Mine recurring patterns and insights.',
      agent_ids: ['pattern-miner'],
      inputs: ['index'],
      outputs: ['patterns'],
    },
  ],
};

function buildWorkflow(
  moduleId: ModuleId,
  seed: number,
  ventureIdx: number,
  forceStatus?: 'running' | 'completed' | 'failed' | 'queued',
): ActiveWorkflow {
  const template = TEMPLATES[moduleId];
  const rand = seededRandom(seed);
  const venture = SEED_VENTURES[ventureIdx % SEED_VENTURES.length];
  const totalMinutes = 2 + Math.floor(rand() * 45);
  const status: ActiveWorkflow['status'] = forceStatus ?? 'running';

  const currentIdx =
    status === 'completed'
      ? template.length
      : status === 'failed'
        ? Math.max(0, Math.min(template.length - 1, Math.floor(rand() * template.length)))
        : Math.min(template.length - 1, 1 + Math.floor(rand() * (template.length - 1)));

  const steps: WorkflowStep[] = template.map((tpl, idx) => {
    let stStatus: WorkflowStepStatus;
    if (status === 'completed') stStatus = 'done';
    else if (status === 'failed' && idx === currentIdx) stStatus = 'failed';
    else if (idx < currentIdx) stStatus = 'done';
    else if (idx === currentIdx) stStatus = 'running';
    else stStatus = 'pending';

    const stepStartedAt =
      idx <= currentIdx
        ? minutesAgoIso(totalMinutes - idx * Math.max(1, Math.floor(totalMinutes / template.length)))
        : undefined;
    const stepFinishedAt =
      idx < currentIdx
        ? minutesAgoIso(
            totalMinutes - (idx + 1) * Math.max(1, Math.floor(totalMinutes / template.length)),
          )
        : undefined;

    const events =
      stStatus === 'done' || stStatus === 'running'
        ? [
            {
              at: stepStartedAt ?? new Date().toISOString(),
              message: `${tpl.label} started`,
              severity: 'info' as const,
            },
            ...(stStatus === 'done'
              ? [
                  {
                    at: stepFinishedAt ?? new Date().toISOString(),
                    message: `${tpl.label} completed`,
                    severity: 'success' as const,
                  },
                ]
              : []),
          ]
        : stStatus === 'failed'
          ? [
              {
                at: stepStartedAt ?? new Date().toISOString(),
                message: `${tpl.label} failed: synthetic error`,
                severity: 'error' as const,
              },
            ]
          : [];

    const durationMs =
      stStatus === 'done'
        ? 10_000 + Math.floor(rand() * 60_000)
        : undefined;
    const elapsedMs =
      stStatus === 'running' ? 8_000 + Math.floor(rand() * 20_000) : undefined;
    const progressFraction =
      stStatus === 'running' ? 0.1 + rand() * 0.7 : undefined;

    // For some demo realism, scoring steps get a quality gate / score field with retries.
    const isScoringLike = /scor/i.test(tpl.id);
    const score = isScoringLike ? 50 + Math.floor(rand() * 50) : undefined;
    const passed = score != null ? score >= 70 : undefined;
    const attempt =
      isScoringLike && stStatus !== 'pending' && rand() > 0.6
        ? { current: 2, max: 3, reason: 'Score below pass threshold (retrying)' }
        : undefined;

    const fields: Record<string, LogValue> | undefined = (() => {
      const f: Record<string, LogValue> = {};
      if (score != null) {
        f['score'] = {
          kind: 'score',
          value: score,
          out_of: 100,
          threshold: 70,
          passed,
          variant: passed ? 'success' : 'warn',
        };
      }
      if (idx === 0) {
        f['themes'] = { kind: 'tags', value: ['ai', 'b2b', 'developer-tools'] };
      }
      if (/analyst|opportunity/i.test(tpl.id) && stStatus !== 'pending') {
        f['opportunity'] = {
          kind: 'id_ref',
          ref_kind: 'opportunity',
          value: `opp_${seed.toString(16).slice(0, 8)}_${idx}`,
          ref_label: `Candidate #${idx + 1}`,
        };
      }
      if (stStatus === 'done' && durationMs != null) {
        f['duration'] = { kind: 'duration_ms', value: durationMs };
      }
      return Object.keys(f).length ? f : undefined;
    })();

    const qualityGate =
      isScoringLike && score != null
        ? {
            name: 'min_score',
            score: {
              kind: 'score' as const,
              value: score,
              out_of: 100,
              threshold: 70,
              passed,
            },
            threshold: 70,
            passed: !!passed,
            attempt: attempt?.current ?? 1,
            max_attempts: attempt?.max,
            reason: passed ? undefined : 'Score below pass threshold',
          }
        : undefined;

    // Sub-steps for the currently-running step (mock candidates).
    const subSteps: WorkflowStep[] | undefined =
      stStatus === 'running'
        ? Array.from({ length: 2 }).map((_, k): WorkflowStep => {
            const ssStatus: WorkflowStepStatus = k === 0 ? 'done' : 'running';
            const ssStarted = stepStartedAt;
            const ssDuration = ssStatus === 'done' ? 4_000 + Math.floor(rand() * 12_000) : undefined;
            const ssElapsed = ssStatus === 'running' ? 3_000 + Math.floor(rand() * 9_000) : undefined;
            return {
              id: `${tpl.id}__sub_${k}`,
              key: `${tpl.id}__sub_${k}`,
              label: `Candidate ${k + 1}`,
              icon: tpl.icon,
              agent_ids: tpl.agent_ids,
              status: ssStatus,
              started_at: ssStarted,
              finished_at: ssStatus === 'done' ? stepFinishedAt : undefined,
              duration_ms: ssDuration,
              elapsed_ms: ssElapsed,
              progress_fraction: ssStatus === 'running' ? 0.45 : 1,
              fields: {
                slot: { kind: 'integer', value: k + 1 },
              },
            };
          })
        : undefined;

    // Structured log timeline.
    const log: StepLogEntry[] | undefined = (() => {
      const entries: StepLogEntry[] = [];
      if (stStatus === 'running' || stStatus === 'done' || stStatus === 'failed') {
        entries.push({
          at: stepStartedAt ?? new Date().toISOString(),
          level: 'info',
          message: `${tpl.label} started`,
          agent_id: tpl.agent_ids[0],
        });
      }
      if (attempt) {
        entries.push({
          at: stepStartedAt ?? new Date().toISOString(),
          level: 'warn',
          message: `Retry attempt ${attempt.current} — ${attempt.reason}`,
          attempt: attempt.current,
        });
      }
      if (score != null) {
        entries.push({
          at: stepFinishedAt ?? stepStartedAt ?? new Date().toISOString(),
          level: passed ? 'success' : 'warn',
          message: `Score: ${score}/100 (threshold 70)`,
          fields: {
            score: {
              kind: 'score',
              value: score,
              out_of: 100,
              threshold: 70,
              passed,
            },
          },
        });
      }
      if (stStatus === 'done') {
        entries.push({
          at: stepFinishedAt ?? new Date().toISOString(),
          level: 'success',
          message: `${tpl.label} completed`,
        });
      }
      if (stStatus === 'failed') {
        entries.push({
          at: stepStartedAt ?? new Date().toISOString(),
          level: 'error',
          message: `${tpl.label} failed: synthetic error`,
        });
      }
      return entries.length ? entries : undefined;
    })();

    return {
      id: tpl.id,
      label: tpl.label,
      icon: tpl.icon,
      description: tpl.description,
      agent_ids: tpl.agent_ids,
      status: stStatus,
      started_at: stepStartedAt,
      finished_at: stepFinishedAt,
      duration_ms: durationMs,
      elapsed_ms: elapsedMs,
      progress_fraction: progressFraction,
      attempt,
      quality_gate: qualityGate,
      fields,
      sub_steps: subSteps,
      log,
      inputs: tpl.inputs,
      outputs: tpl.outputs,
      events,
    };
  });

  const progress =
    status === 'completed'
      ? 1
      : status === 'failed'
        ? currentIdx / template.length
        : Math.min(0.95, currentIdx / template.length + 0.1);

  return {
    id: `wf_${moduleId}_${ventureIdx}_${seed}`,
    module: moduleId,
    venture_id: venture.id,
    venture_name: venture.name,
    title: `${prettyLabel(moduleId)} · ${venture.name}`,
    subtitle: template[Math.min(currentIdx, template.length - 1)]?.label,
    status,
    started_at: minutesAgoIso(totalMinutes),
    completed_at: status === 'completed' ? minutesAgoIso(0) : undefined,
    progress,
    steps,
  };
}

function prettyLabel(id: ModuleId): string {
  return id
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

@Injectable({ providedIn: 'root' })
export class WorkflowMockDataSource implements IWorkflowDataSource {
  private readonly cache = new Map<string, ActiveWorkflow>();

  activeForModule(moduleId: ModuleId): Observable<ActiveWorkflow[]> {
    const count = 1 + Math.floor(seededRandom(moduleId.length * 31 + 7)() * 2);
    const wfs: ActiveWorkflow[] = [];
    for (let i = 0; i < count; i++) {
      const wf = buildWorkflow(moduleId, moduleId.length * 13 + i * 17 + 101, i);
      this.cache.set(wf.id, wf);
      wfs.push(wf);
    }
    return withLatency(wfs, 120, 320);
  }

  get(workflowId: string): Observable<ActiveWorkflow | null> {
    return of(this.cache.get(workflowId) ?? null);
  }
}
