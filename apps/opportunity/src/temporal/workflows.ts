/**
 * Opportunity screening: market-scanner → analyst → scoring with quality gate retries,
 * then prioritization. Thresholds come from workflow args (`quality`, filled from env in scan.service).
 */
import {
  ApplicationFailure,
  defineQuery,
  proxyActivities,
  setHandler,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';
import type {
  LogValue,
  QualityGate,
  StepLogLevel,
  WorkflowStepStatus,
} from '@bruce/contracts/observability';
import type { OpportunityQualityConfig } from '../config/opportunity-quality.js';
import type * as Activities from './activities.js';
import {
  buildAnalystInputSummary,
  buildFeedbackFromScoring,
  buildScoringFields,
  extractTotalScore,
  hasNoScoringDimensions,
  isMissingScore,
  mergeQualityConfig,
  scoredOpportunitiesRowsFromMany,
  varyOpportunitySeed,
} from '../lib/opportunity-screening-helpers.js';
import { buildVentureHandoffFromPrioritization } from '@bruce/handoff/workflow';

const STEP_MARKET_SCANNER = 'market_scanner';
const STEP_OPPORTUNITY_ANALYST = 'opportunity_analyst';
const STEP_SCORING = 'scoring';
const STEP_PRIORITIZATION = 'prioritization';

const TOP_LEVEL_STEPS = [
  {
    key: STEP_MARKET_SCANNER,
    label: 'Market scanner',
    icon: 'search',
    description: 'Scan themes and sources to surface candidate opportunities.',
    agentIds: ['market-scanner'],
  },
  {
    key: STEP_OPPORTUNITY_ANALYST,
    label: 'Opportunity analyst',
    icon: 'file-text',
    description: 'Deep-dive candidates into structured dossiers.',
    agentIds: ['opportunity-analyst'],
  },
  {
    key: STEP_SCORING,
    label: 'Scoring',
    icon: 'gauge',
    description: 'Quality gate scoring at 70+.',
    agentIds: ['scoring-agent'],
  },
  {
    key: STEP_PRIORITIZATION,
    label: 'Prioritization',
    icon: 'trophy',
    description: 'Rank by composite score and hand off to Add-Venture.',
    agentIds: ['prioritization-agent'],
  },
];

export interface OpportunityScreeningState {
  status:
    | 'starting'
    | 'market_scanning'
    | 'analyzing'
    | 'scoring'
    | 'quality_retry'
    | 'prioritizing'
    | 'completed'
    | 'failed';
  currentStep: string;
  results?: unknown;
  error?: string;
  quality?: {
    lastScore?: number;
    candidateIndex?: number;
    improveAttempt?: number;
    inputSlot?: number;
  };
}

let workflowState: OpportunityScreeningState = {
  status: 'starting',
  currentStep: 'init',
};

export const queryState = defineQuery<OpportunityScreeningState>('state');

const act = proxyActivities<typeof Activities>({
  startToCloseTimeout: '20 minutes',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export async function opportunityScreeningWorkflow(input: {
  account_id: string;
  venture_id: string;
  opportunities: unknown[];
  correlation_id?: string;
  themes?: string[];
  quality?: Partial<OpportunityQualityConfig>;
  project_nickname?: string;
}): Promise<unknown> {
  const { account_id, venture_id, opportunities, correlation_id, themes = [] } = input;
  const correlationId = correlation_id ?? uuid4();
  const wfId = workflowInfo().workflowId;
  const quality = mergeQualityConfig(input.quality);
  const projectNickname = input.project_nickname;

  setHandler(queryState, () => workflowState);

  const obsRunId = await act.obsStartRun({
    accountId: account_id,
    module: 'opportunity',
    workflowType: 'opportunityScreeningWorkflow',
    temporalWorkflowId: wfId,
    ventureId: venture_id,
    title: themes.length
      ? `Opportunity scan · ${themes.join(' · ')}`
      : `Opportunity scan · ${wfId.slice(-8)}`,
    subtitle: themes.length ? themes.join(' · ') : undefined,
    steps: TOP_LEVEL_STEPS,
  });

  const obsEvent = (
    stepKey: string,
    level: StepLogLevel,
    message: string,
    fields?: Record<string, LogValue>,
    extra?: { parentKey?: string; attempt?: number; agentId?: string },
  ) =>
    act.obsStepEvent({
      runId: obsRunId,
      accountId: account_id,
      stepKey,
      parentKey: extra?.parentKey,
      level,
      message,
      fields,
      attempt: extra?.attempt,
      agentId: extra?.agentId,
    });

  const obsUpdate = (
    stepKey: string,
    patch: {
      parentKey?: string;
      label?: string;
      icon?: string;
      description?: string;
      agentIds?: string[];
      status?: WorkflowStepStatus;
      startedAt?: string;
      finishedAt?: string;
      progressFraction?: number;
      attempt?: { current: number; max?: number; reason?: string };
      qualityGate?: QualityGate;
      fields?: Record<string, LogValue>;
    },
  ) =>
    act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key: stepKey,
      ...patch,
    });

  /**
   * Sequential top-level step transitions.
   *
   * The opportunity workflow is interleaved per slot/candidate (scan → analyst →
   * scoring, then back for the next candidate). Without explicit transitions,
   * three top-level steps end up `running` in the DB simultaneously, which the
   * UI cannot represent cleanly. `enterStep` enforces a single source of truth:
   * exactly one top-level step is `running` at any moment; the previous one is
   * flipped to `done`. When the workflow re-enters a previous stage (e.g. slot 1
   * after slot 0 completes), the helper flips it back to `running` honestly.
   */
  let activeTopStep: string | null = null;
  // Counters per top-level step. `retries` is incremented every time we
  // re-enter a top step we already finished (i.e. the analyst/scoring loop
  // bounced back). `qualityFailures` tracks how many times the scoring step
  // produced a sub-step that failed the quality gate. These feed structured
  // `fields` so the dashboard's bullet/list can show "passed with N retries"
  // instead of a green check that hides the truth.
  const stageVisits = new Map<string, number>();
  const stageRetries = new Map<string, number>();
  const stageQualityFailures = new Map<string, number>();
  const incrQualityFailure = async (key: string) => {
    const next = (stageQualityFailures.get(key) ?? 0) + 1;
    stageQualityFailures.set(key, next);
    await obsUpdate(key, {
      fields: {
        retries: { kind: 'integer', value: stageRetries.get(key) ?? 0, unit: '' },
        quality_failures: { kind: 'integer', value: next, unit: '' },
      },
    });
  };
  const enterStep = async (key: string) => {
    if (activeTopStep === key) return;
    if (activeTopStep && activeTopStep !== key) {
      await obsUpdate(activeTopStep, {
        status: 'done',
        finishedAt: new Date().toISOString(),
        fields: {
          retries: { kind: 'integer', value: stageRetries.get(activeTopStep) ?? 0, unit: '' },
          outcome:
            (stageRetries.get(activeTopStep) ?? 0) > 0 ||
            (stageQualityFailures.get(activeTopStep) ?? 0) > 0
              ? { kind: 'badge', value: 'passed_with_retries', variant: 'warn' }
              : { kind: 'badge', value: 'passed_clean', variant: 'success' },
        },
      });
    }
    const visits = (stageVisits.get(key) ?? 0) + 1;
    stageVisits.set(key, visits);
    if (visits > 1) {
      stageRetries.set(key, (stageRetries.get(key) ?? 0) + 1);
    }
    await obsUpdate(key, {
      status: 'running',
      startedAt: new Date().toISOString(),
      fields: {
        retries: { kind: 'integer', value: stageRetries.get(key) ?? 0, unit: '' },
      },
    });
    activeTopStep = key;
  };

  try {
    const seeds =
      opportunities.length > 0
        ? opportunities
        : [{ primary_keywords: ['venture'], industry_verticals: ['general'] }];

    const passedAnalystOutputs: unknown[] = [];
    const passedScoredOutputs: unknown[] = [];

    await enterStep(STEP_MARKET_SCANNER);
    await obsUpdate(STEP_MARKET_SCANNER, {
      fields: {
        themes: { kind: 'tags', value: themes.length ? themes : ['(default)'] },
        seed_count: { kind: 'integer', value: seeds.length, unit: '' },
      },
    });

    let aggregatedCandidatesFound = 0;

    for (let opIdx = 0; opIdx < seeds.length; opIdx++) {
      const baseSeed = seeds[opIdx];
      let passedForThisSlot = false;

      for (let cand = 0; cand < quality.maxQualityCandidates; cand++) {
        const seed = cand === 0 ? baseSeed : varyOpportunitySeed(baseSeed, venture_id, cand);
        const slotKey = `slot_${opIdx}_cand_${cand}`;

        workflowState = {
          status: 'market_scanning',
          currentStep: `market_scanner:slot${opIdx}:cand${cand}`,
          quality: { inputSlot: opIdx, candidateIndex: cand },
        };

        await enterStep(STEP_MARKET_SCANNER);
        await obsUpdate(slotKey, {
          parentKey: STEP_MARKET_SCANNER,
          label: `Slot ${opIdx + 1} · candidate ${cand + 1}`,
          icon: 'search',
          status: 'running',
          startedAt: new Date().toISOString(),
        });

        const market = await act.runMarketScannerAgent({
          accountId: account_id,
          ventureId: venture_id,
          opportunity: seed,
          correlationId,
          observabilityRunId: obsRunId,
          observabilityStepKey: slotKey,
          observabilityParentStepKey: STEP_MARKET_SCANNER,
          projectNickname,
        });

        const marketOpps = (() => {
          const m = market as Record<string, unknown> | null;
          const list = m && Array.isArray(m.opportunities_found) ? m.opportunities_found : [];
          return list as Array<Record<string, unknown>>;
        })();
        aggregatedCandidatesFound += marketOpps.length;

        await obsUpdate(slotKey, {
          parentKey: STEP_MARKET_SCANNER,
          status: 'done',
          finishedAt: new Date().toISOString(),
          fields: {
            opportunities_found: { kind: 'integer', value: marketOpps.length, unit: '' },
          },
        });
        await obsEvent(
          slotKey,
          'success',
          `Market scanner returned ${marketOpps.length} candidate(s)`,
          undefined,
          { parentKey: STEP_MARKET_SCANNER, agentId: 'market-scanner' },
        );

        await obsUpdate(STEP_MARKET_SCANNER, {
          fields: {
            candidates_found: {
              kind: 'integer',
              value: aggregatedCandidatesFound,
              unit: '',
            },
            slots_scanned: { kind: 'integer', value: opIdx + 1, unit: '' },
          },
          progressFraction: Math.min(1, (opIdx + 1) / seeds.length),
        });

        let improveAttempts = 0;
        const analystSubKey = `slot_${opIdx}_cand_${cand}`;
        workflowState = {
          status: 'analyzing',
          currentStep: `opportunity_analyst:slot${opIdx}:cand${cand}`,
          quality: { inputSlot: opIdx, candidateIndex: cand, improveAttempt: 0 },
        };

        await enterStep(STEP_OPPORTUNITY_ANALYST);
        await obsUpdate(analystSubKey, {
          parentKey: STEP_OPPORTUNITY_ANALYST,
          label: `Slot ${opIdx + 1} · candidate ${cand + 1}`,
          icon: 'file-text',
          status: 'running',
          startedAt: new Date().toISOString(),
          attempt: { current: 1, max: quality.maxImproveAttempts + 1 },
        });

        let analyst = await act.runOpportunityAnalystAgent({
          accountId: account_id,
          ventureId: venture_id,
          marketScannerOutput: market,
          correlationId,
          observabilityRunId: obsRunId,
          observabilityStepKey: analystSubKey,
          observabilityParentStepKey: STEP_OPPORTUNITY_ANALYST,
          projectNickname,
        });

        const analystAsRecord = (analyst as Record<string, unknown>) ?? {};
        await obsUpdate(analystSubKey, {
          parentKey: STEP_OPPORTUNITY_ANALYST,
          status: 'done',
          finishedAt: new Date().toISOString(),
          fields: {
            opportunity: {
              kind: 'id_ref',
              ref_kind: 'opportunity',
              value: String(analystAsRecord.opportunity_id ?? ''),
              ref_label:
                typeof analystAsRecord.title === 'string'
                  ? (analystAsRecord.title as string)
                  : undefined,
            },
            target_segment: {
              kind: 'text_short',
              value: String(analystAsRecord.target_segment ?? 'general'),
            },
          },
        });

        const scoringSubKey = `slot_${opIdx}_cand_${cand}`;
        workflowState = {
          status: 'scoring',
          currentStep: `scoring_agent:slot${opIdx}:cand${cand}`,
          quality: { inputSlot: opIdx, candidateIndex: cand },
        };

        await enterStep(STEP_SCORING);
        await obsUpdate(scoringSubKey, {
          parentKey: STEP_SCORING,
          label: `Slot ${opIdx + 1} · candidate ${cand + 1}`,
          icon: 'gauge',
          status: 'running',
          startedAt: new Date().toISOString(),
          attempt: { current: 1, max: quality.maxImproveAttempts + 1 },
        });

        let scored = await act.runScoringAgent({
          accountId: account_id,
          ventureId: venture_id,
          analystOutput: analyst,
          scanThemes: themes,
          correlationId,
          observabilityRunId: obsRunId,
          observabilityStepKey: scoringSubKey,
          observabilityParentStepKey: STEP_SCORING,
          projectNickname,
        });

        let score = extractTotalScore(scored);
        const initialPassed = score >= quality.passScore;
        const initialMissing = isMissingScore(scored);
        const initialNoDims = hasNoScoringDimensions(scored);
        const initialReason = initialPassed
          ? undefined
          : initialMissing
            ? 'Scoring agent returned no total_score (treated as 0). Likely missing/invalid LLM output — check raw output below.'
            : initialNoDims
              ? `Total score ${score} below pass threshold ${quality.passScore}. Agent returned no per-dimension breakdown — see raw output for the agent's reasoning.`
              : `Total score ${score} below pass threshold ${quality.passScore}.`;
        // Always attach the analyst dossier the agent received and the raw
        // scoring output. This is what users open the inspector to see when
        // trying to debug "why did this score 0?".
        const initialFields: Record<string, LogValue> = {
          ...buildScoringFields(scored, quality.passScore),
          analyst_input: buildAnalystInputSummary(analyst),
          raw_input: { kind: 'json', value: analyst },
          raw_output: { kind: 'json', value: scored },
        };
        await obsUpdate(scoringSubKey, {
          parentKey: STEP_SCORING,
          status: initialPassed ? 'done' : 'running',
          finishedAt: initialPassed ? new Date().toISOString() : undefined,
          fields: initialFields,
          qualityGate: {
            name: 'min_score',
            score: {
              kind: 'score',
              value: score,
              out_of: 100,
              threshold: quality.passScore,
              passed: initialPassed,
            },
            threshold: quality.passScore,
            passed: initialPassed,
            attempt: 1,
            max_attempts: quality.maxImproveAttempts + 1,
            reason: initialReason,
          },
        });
        if (!initialPassed) {
          await incrQualityFailure(STEP_SCORING);
        }
        if (initialMissing) {
          await obsEvent(
            scoringSubKey,
            'warn',
            'Scoring agent returned no total_score field; defaulted to 0.',
            { raw_output: { kind: 'json', value: scored } },
            { parentKey: STEP_SCORING, agentId: 'scoring-agent', attempt: 1 },
          );
        } else if (initialNoDims) {
          await obsEvent(
            scoringSubKey,
            'warn',
            `Scoring agent returned total_score ${score} but no per-dimension breakdown. Surfacing raw output for debugging.`,
            { raw_output: { kind: 'json', value: scored } },
            { parentKey: STEP_SCORING, agentId: 'scoring-agent', attempt: 1 },
          );
        }
        await obsEvent(
          scoringSubKey,
          initialPassed ? 'success' : 'warn',
          `Initial score: ${score}/${quality.passScore}`,
          initialFields,
          { parentKey: STEP_SCORING, agentId: 'scoring-agent', attempt: 1 },
        );

        workflowState = {
          status: 'scoring',
          currentStep: `quality_check:slot${opIdx}:cand${cand}`,
          quality: { lastScore: score, inputSlot: opIdx, candidateIndex: cand, improveAttempt: improveAttempts },
        };

        while (score < quality.passScore) {
          if (score < quality.lowScoreThreshold) {
            await obsEvent(
              scoringSubKey,
              'error',
              `Aborting candidate: score ${score} below low threshold ${quality.lowScoreThreshold}`,
              undefined,
              { parentKey: STEP_SCORING, attempt: improveAttempts + 1 },
            );
            break;
          }
          if (improveAttempts >= quality.maxImproveAttempts) {
            await obsEvent(
              scoringSubKey,
              'warn',
              `Max improve attempts (${quality.maxImproveAttempts}) exhausted at score ${score}`,
              undefined,
              { parentKey: STEP_SCORING, attempt: improveAttempts + 1 },
            );
            break;
          }

          improveAttempts++;
          workflowState = {
            status: 'quality_retry',
            currentStep: `analyst_retry:slot${opIdx}:cand${cand}:try${improveAttempts}`,
            quality: {
              lastScore: score,
              inputSlot: opIdx,
              candidateIndex: cand,
              improveAttempt: improveAttempts,
            },
          };

          await enterStep(STEP_OPPORTUNITY_ANALYST);
          await obsUpdate(analystSubKey, {
            parentKey: STEP_OPPORTUNITY_ANALYST,
            status: 'running',
            attempt: {
              current: improveAttempts + 1,
              max: quality.maxImproveAttempts + 1,
              reason: `Score ${score} below pass ${quality.passScore}`,
            },
          });
          await obsEvent(
            analystSubKey,
            'warn',
            `Retrying analyst with feedback (attempt ${improveAttempts + 1})`,
            undefined,
            { parentKey: STEP_OPPORTUNITY_ANALYST, attempt: improveAttempts + 1 },
          );

          const feedback = buildFeedbackFromScoring(scored);
          analyst = await act.runOpportunityAnalystAgent({
            accountId: account_id,
            ventureId: venture_id,
            marketScannerOutput: market,
            correlationId,
            observabilityRunId: obsRunId,
            observabilityStepKey: analystSubKey,
            observabilityParentStepKey: STEP_OPPORTUNITY_ANALYST,
            projectNickname,
            qualityFeedback: {
              attempt: improveAttempts,
              previous_score: score,
              feedback,
              scoring_output: scored,
            },
          });

          workflowState = {
            status: 'scoring',
            currentStep: `scoring_retry:slot${opIdx}:cand${cand}:try${improveAttempts}`,
            quality: { inputSlot: opIdx, candidateIndex: cand, improveAttempt: improveAttempts },
          };

          await enterStep(STEP_SCORING);
          await obsUpdate(scoringSubKey, {
            parentKey: STEP_SCORING,
            status: 'running',
            attempt: {
              current: improveAttempts + 1,
              max: quality.maxImproveAttempts + 1,
              reason: `Re-scoring after analyst retry`,
            },
          });

          scored = await act.runScoringAgent({
            accountId: account_id,
            ventureId: venture_id,
            analystOutput: analyst,
            scanThemes: themes,
            correlationId,
            observabilityRunId: obsRunId,
            observabilityStepKey: scoringSubKey,
            observabilityParentStepKey: STEP_SCORING,
            projectNickname,
          });
          score = extractTotalScore(scored);
          const passedNow = score >= quality.passScore;
          const missingNow = isMissingScore(scored);
          const noDimsNow = hasNoScoringDimensions(scored);
          const retryFields: Record<string, LogValue> = {
            ...buildScoringFields(scored, quality.passScore),
            analyst_input: buildAnalystInputSummary(analyst),
            raw_input: { kind: 'json', value: analyst },
            raw_output: { kind: 'json', value: scored },
          };
          await obsUpdate(scoringSubKey, {
            parentKey: STEP_SCORING,
            status: passedNow ? 'done' : 'running',
            finishedAt: passedNow ? new Date().toISOString() : undefined,
            fields: retryFields,
            qualityGate: {
              name: 'min_score',
              score: {
                kind: 'score',
                value: score,
                out_of: 100,
                threshold: quality.passScore,
                passed: passedNow,
              },
              threshold: quality.passScore,
              passed: passedNow,
              attempt: improveAttempts + 1,
              max_attempts: quality.maxImproveAttempts + 1,
              reason: passedNow
                ? undefined
                : missingNow
                  ? 'Scoring agent returned no total_score (treated as 0).'
                  : noDimsNow
                    ? `Total score ${score} below pass threshold ${quality.passScore}. Agent returned no per-dimension breakdown — see raw output.`
                    : `Total score ${score} below pass threshold ${quality.passScore}.`,
            },
          });
          if (!passedNow) {
            await incrQualityFailure(STEP_SCORING);
          }
          if (missingNow) {
            await obsEvent(
              scoringSubKey,
              'warn',
              'Scoring agent returned no total_score field; defaulted to 0.',
              { raw_output: { kind: 'json', value: scored } },
              { parentKey: STEP_SCORING, agentId: 'scoring-agent', attempt: improveAttempts + 1 },
            );
          } else if (noDimsNow) {
            await obsEvent(
              scoringSubKey,
              'warn',
              `Scoring agent returned total_score ${score} but no per-dimension breakdown.`,
              { raw_output: { kind: 'json', value: scored } },
              { parentKey: STEP_SCORING, agentId: 'scoring-agent', attempt: improveAttempts + 1 },
            );
          }
          await obsEvent(
            scoringSubKey,
            passedNow ? 'success' : 'warn',
            `Re-score: ${score}/${quality.passScore}`,
            retryFields,
            { parentKey: STEP_SCORING, agentId: 'scoring-agent', attempt: improveAttempts + 1 },
          );
          workflowState = {
            status: 'scoring',
            currentStep: `quality_check:slot${opIdx}:cand${cand}`,
            quality: { lastScore: score, inputSlot: opIdx, candidateIndex: cand, improveAttempt: improveAttempts },
          };
        }

        if (score >= quality.passScore) {
          passedAnalystOutputs.push(analyst);
          passedScoredOutputs.push(scored);
          passedForThisSlot = true;
          break;
        } else {
          await obsUpdate(scoringSubKey, {
            parentKey: STEP_SCORING,
            status: 'failed',
            finishedAt: new Date().toISOString(),
          });
        }
      }

      if (!passedForThisSlot) {
        throw ApplicationFailure.nonRetryable(
          `Opportunity quality gate failed for input slot ${opIdx}: no candidate reached pass score ${quality.passScore} within ${quality.maxQualityCandidates} candidate(s) (see OPPORTUNITY_MAX_QUALITY_CANDIDATES).`,
          'OpportunityQualityGateFailed',
        );
      }
    }

    // Final field updates for the upstream stages. Status transitions are
    // handled by `enterStep` — those steps are already `done` once we reach
    // here, so we only refresh aggregate counters.
    await obsUpdate(STEP_MARKET_SCANNER, {
      fields: {
        candidates_found: {
          kind: 'integer',
          value: aggregatedCandidatesFound,
          unit: '',
        },
      },
    });
    await obsUpdate(STEP_OPPORTUNITY_ANALYST, {
      fields: {
        candidates_passed: {
          kind: 'integer',
          value: passedAnalystOutputs.length,
          unit: '',
        },
      },
    });
    await obsUpdate(STEP_SCORING, {
      fields: {
        candidates_passed: {
          kind: 'integer',
          value: passedScoredOutputs.length,
          unit: '',
        },
      },
    });

    await act.emitOpportunityLifecycleEvent({
      type: 'opportunity.analyzed',
      accountId: account_id,
      ventureId: venture_id,
      payload: { batch_size: passedAnalystOutputs.length, workflow_id: wfId },
    });

    workflowState = {
      status: 'scoring',
      currentStep: 'scoring_complete',
    };

    await act.updateExecutionState({
      accountId: account_id,
      ventureId: venture_id,
      step: 'scoring',
      state: { scored: true, passed: passedScoredOutputs.length },
    });

    await act.emitOpportunityLifecycleEvent({
      type: 'opportunity.scored',
      accountId: account_id,
      ventureId: venture_id,
      payload: { workflow_id: wfId },
    });

    workflowState = {
      status: 'prioritizing',
      currentStep: 'prioritization_agent',
    };

    await enterStep(STEP_PRIORITIZATION);

    const prioritizationInput = {
      scored_opportunities: scoredOpportunitiesRowsFromMany(passedScoredOutputs),
    };

    const prioritized = await act.runPrioritizationAgent({
      accountId: account_id,
      ventureId: venture_id,
      scoredOutput: prioritizationInput,
      correlationId,
      minimumAdvancementScore: quality.minimumAdvancementScore,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_PRIORITIZATION,
      projectNickname,
    });

    const ranked = (() => {
      const p = prioritized as Record<string, unknown> | null;
      const list =
        p && Array.isArray(p.ranked_opportunities) ? p.ranked_opportunities : [];
      return list as Array<Record<string, unknown>>;
    })();

    const venture_handoff = buildVentureHandoffFromPrioritization({
      prioritizedResults: prioritized as Record<string, unknown>,
      passedAnalystOutputs,
      passedScoredOutputs,
    });

    await obsUpdate(STEP_PRIORITIZATION, {
      status: 'done',
      finishedAt: new Date().toISOString(),
      fields: {
        ranking: {
          kind: 'array',
          item_kind: 'id_ref',
          value: ranked.slice(0, 10).map((r) => ({
            kind: 'id_ref',
            ref_kind: 'opportunity',
            value: String(r.opportunity_id ?? ''),
            ref_label:
              typeof r.title === 'string' ? (r.title as string) : undefined,
            unit:
              typeof r.total_score === 'number' ? `${r.total_score}/100` : undefined,
          })),
        },
        total_ranked: { kind: 'integer', value: ranked.length, unit: '' },
      },
    });

    await act.updateExecutionState({
      accountId: account_id,
      ventureId: venture_id,
      step: 'prioritizing',
      state: { prioritized: true },
    });

    await act.emitOpportunityLifecycleEvent({
      type: 'opportunity.ranked',
      accountId: account_id,
      ventureId: venture_id,
      payload: { workflow_id: wfId },
    });

    const scanId = await act.persistOpportunityScan({
      accountId: account_id,
      ventureId: venture_id,
      scanResults: prioritized,
      temporalWorkflowId: wfId,
      themes,
    });

    await act.emitOpportunityScanCompleted({
      accountId: account_id,
      ventureId: venture_id,
      scanId,
      results: prioritized,
    });

    await act.emitOpportunityAdvancedInterModule({
      accountId: account_id,
      ventureId: venture_id,
      scanId,
      results: prioritized,
      venture_handoff: venture_handoff,
      themes,
      temporalWorkflowId: wfId,
      correlationId,
      projectNickname,
    });

    const finalResult = {
      scan_id: scanId,
      status: 'completed',
      results: prioritized,
      quality_passed: passedScoredOutputs.length,
      observability_run_id: obsRunId,
    };

    await act.obsCompleteRun({
      runId: obsRunId,
      accountId: account_id,
      result: finalResult,
    });

    workflowState = {
      status: 'completed',
      currentStep: 'done',
      results: finalResult,
    };

    return finalResult;
  } catch (error) {
    const errorMessage = (error as Error).message;
    // Transition the currently-active top step to `failed` so the constellation,
    // the steps list, the inspector and the workflow-status badge all agree
    // ("Opportunity analyst still running while header says FAILED" is the
    // visual artifact this fixes).
    if (activeTopStep) {
      await obsUpdate(activeTopStep, {
        status: 'failed',
        finishedAt: new Date().toISOString(),
        description: errorMessage,
      });
      await obsEvent(activeTopStep, 'error', errorMessage);
      activeTopStep = null;
    }
    await act.obsFailRun({
      runId: obsRunId,
      accountId: account_id,
      errorMessage,
    });
    workflowState = {
      status: 'failed',
      currentStep: 'error',
      error: errorMessage,
    };
    throw error;
  }
}

export async function quickOpportunityScanWorkflow(input: {
  account_id: string;
  venture_id: string;
  opportunity: unknown;
  correlation_id?: string;
}): Promise<unknown> {
  const { account_id, venture_id, opportunity, correlation_id } = input;
  const correlationId = correlation_id ?? uuid4();

  setHandler(queryState, () => workflowState);

  workflowState = {
    status: 'market_scanning',
    currentStep: 'market_scanner',
  };

  const analysis = await act.runMarketScannerAgent({
    accountId: account_id,
    ventureId: venture_id,
    opportunity,
    correlationId,
  });

  workflowState = {
    status: 'completed',
    currentStep: 'done',
    results: { analysis },
  };

  return analysis;
}

export async function weeklyDiscoveryWorkflow(input: {
  account_id: string;
  themes: string[];
  venture_id?: string;
  correlation_id?: string;
  quality?: Partial<OpportunityQualityConfig>;
  project_nickname?: string;
}): Promise<unknown> {
  const { account_id, themes, venture_id, correlation_id, quality, project_nickname } = input;
  const defaultVenture = '00000000-0000-4000-8000-000000000001';
  const synthetic =
    themes.length > 0
      ? themes.map((t) => ({
          primary_keywords: [t],
          industry_verticals: [t],
        }))
      : [{ primary_keywords: ['venture'], industry_verticals: ['general'] }];

  return opportunityScreeningWorkflow({
    account_id,
    venture_id: venture_id ?? defaultVenture,
    opportunities: synthetic,
    correlation_id,
    themes,
    quality,
    project_nickname,
  });
}
