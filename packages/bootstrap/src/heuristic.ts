import { randomUUID } from 'crypto';
import { asRecord, stringValue } from './util.js';

function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.split('\n').find((l) => l.trim())?.trim() ?? prompt.trim();
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine || 'Synthetic venture';
}

export function buildHeuristicOpportunityPack(params: {
  prompt: string;
  ventureId: string;
  ventureName?: string;
}): { ventureHandoff: Record<string, unknown>; scanResults: Record<string, unknown> } {
  const opportunityId = randomUUID();
  const title = params.ventureName?.trim() || titleFromPrompt(params.prompt);
  const screenedAt = new Date().toISOString();
  const score = 82;

  const ventureHandoff: Record<string, unknown> = {
    opportunity_id: opportunityId,
    title,
    problem_statement: params.prompt.slice(0, 500),
    problem_context: params.prompt,
    market_segment: 'B2B SaaS',
    market_size_estimate: {
      tam: 2_500_000_000,
      tam_reasoning: 'Synthetic TAM from operator prompt bootstrap.',
      addressable_market: 400_000_000,
      capturable_market: 25_000_000,
    },
    validation_score: score,
    validation_criteria: {
      problem_severity_score: 80,
      market_size_score: 78,
      competitive_intensity_score: 65,
      founder_market_fit_score: 75,
      uniqueness_score: 80,
    },
    key_insights: [
      {
        insight: 'Operator-provided concept shows clear problem-solution fit.',
        evidence: params.prompt.slice(0, 300),
        confidence_score: 85,
      },
      {
        insight: 'Market timing appears favorable for a focused MVP launch.',
        evidence: 'Synthetic screening from start-from-prompt.',
        confidence_score: 72,
      },
    ],
    competitive_landscape: [
      {
        competitor_name: 'Incumbent suite',
        positioning: 'Broad horizontal platform',
        strengths: ['Brand recognition'],
        weaknesses: ['Slow iteration'],
      },
    ],
    target_customer_profile: {
      customer_segment: 'Mid-market operators',
      pain_points: ['Fragmented workflows', 'Unclear ROI'],
    },
    recommended_approach: 'Land with a narrow wedge, expand after activation metrics.',
    screened_at: screenedAt,
    screened_by_agent: 'bootstrap-handoff-synthesizer-heuristic',
  };

  const rankedRow = {
    ...ventureHandoff,
    opportunity_id: opportunityId,
    total_score: score,
    validation_score: score,
    recommendation: 'advance',
    status: 'ADVANCE',
    rank: 1,
    description: ventureHandoff.problem_statement,
    target_segment: ventureHandoff.market_segment,
  };

  const scanResults = {
    ranked_opportunities: [rankedRow],
    prioritization_timestamp: screenedAt,
    summary: {
      overview: `Synthetic opportunity scan for venture ${params.ventureId}`,
    },
  };

  return { ventureHandoff, scanResults };
}

export function buildHeuristicDossier(params: {
  prompt: string;
  ventureId: string;
  ventureName: string;
  opportunityId: string;
}): Record<string, unknown> {
  const now = new Date().toISOString();
  const segmentName = 'Primary target segment';

  const vol2 = {
    customer_segments: [
      {
        segment_name: segmentName,
        segment_size_customers: 5000,
        primary_pain_points: ['Manual processes', 'Poor visibility'],
        customer_archetypes: ['Ops lead', 'Founder'],
      },
    ],
  };

  const vol3 = {
    core_value_proposition: params.prompt.slice(0, 280),
    unique_differentiators: ['Focused workflow', 'Faster time-to-value'],
    positioning_statement: {
      for_target: segmentName,
      key_benefit: 'Delivers outcomes with less operational overhead',
      primary_differentiator: 'Purpose-built for the wedge use case',
    },
    comparison_vs_alternatives: [
      {
        alternative: 'Spreadsheets + email',
        their_strength: 'Familiar',
        our_advantage: 'Structured automation',
      },
    ],
    value_proposition_canvas: {
      customer_gains: ['Predictability', 'Speed'],
    },
  };

  const vol6 = {
    one_liner: params.ventureName || titleFromPrompt(params.prompt),
    brand_narrative: {
      heros_journey: params.prompt.slice(0, 400),
      why_now: 'Market readiness and operator conviction.',
      what_we_stand_for: 'Clarity and execution quality',
      customer_transformation: 'From reactive chaos to repeatable outcomes',
    },
    tone_of_voice: ['confident', 'pragmatic', 'clear'],
    tagline_candidates: [params.ventureName, 'Build with focus', 'Outcomes first'].filter(
      (value, index, arr) => value.length > 0 && arr.indexOf(value) === index,
    ),
    messaging_pillars: [
      { pillar: 'Clarity', supporting_evidence: ['Simple onboarding'] },
      { pillar: 'Trust', supporting_evidence: ['Transparent metrics'] },
    ],
    execution_timestamp: now,
  };

  return {
    venture_id: params.ventureId,
    opportunity_id: params.opportunityId,
    venture_name: params.ventureName,
    created_date: now,
    created_by: 'bootstrap-handoff-synthesizer',
    volumes: {
      vol_1: { market_overview: params.prompt.slice(0, 500) },
      vol_2: vol2,
      vol_3: vol3,
      vol_4: { revenue_model: 'Subscription SaaS' },
      vol_5: { gtm_motion: 'Product-led + founder sales' },
      vol_6: vol6,
      vol_7: { top_risks: ['Adoption velocity'] },
      vol_8: { first_30_days: { focus_areas: ['MVP validation', 'Design partners'] } },
    },
    critique_result: { overall_score: 78, pass_fail: true },
    executive_summary: {
      narrative_summary: params.prompt.slice(0, 600),
      opportunity_snapshot: 'Synthetic dossier from operator prompt.',
      customer_snapshot: segmentName,
      business_model_snapshot: 'Subscription with services attach',
    },
    key_metrics: {
      market_tam_usd: 2_500_000_000,
      primary_segment_size: 5000,
      critique_overall_score: 78,
      year_1_revenue_target: 500_000,
    },
    status: 'approved',
    execution_timestamp: now,
    agent_id: 'bootstrap-handoff-synthesizer',
  };
}

export function dossierVolumes(dossier: unknown): {
  vol2: Record<string, unknown>;
  vol3: Record<string, unknown>;
  vol5: Record<string, unknown>;
  vol6: Record<string, unknown>;
  vol8: Record<string, unknown>;
} {
  const volumes = asRecord(asRecord(dossier).volumes);
  return {
    vol2: asRecord(volumes.vol_2),
    vol3: asRecord(volumes.vol_3),
    vol5: asRecord(volumes.vol_5),
    vol6: asRecord(volumes.vol_6),
    vol8: asRecord(volumes.vol_8),
  };
}

export function opportunityIdFromHandoff(handoff: Record<string, unknown>): string {
  return stringValue(handoff.opportunity_id, randomUUID());
}
