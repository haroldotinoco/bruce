import { describe, expect, it } from 'vitest';
import {
  buildBrandAidAgentInputFromVentureToBrandHandoff,
  buildVentureToBrandHandoff,
  createValidatedModuleHandoffEnvelope,
  resolveModuleHandoffEnvelope,
  validateVentureToBrandHandoff,
} from './module-handoffs.js';

describe('module handoffs', () => {
  it('builds and resolves a validated envelope', () => {
    const payload = buildVentureToBrandHandoff({
      ventureId: 'venture-1',
      vol2: {
        customer_segments: [
          {
            segment_name: 'Compliance leaders',
            primary_pain_points: ['Manual reporting'],
            customer_archetypes: ['Risk-averse', 'Process-heavy'],
          },
        ],
      },
      vol3: {
        core_value_proposition: 'Automate compliance workflows',
        positioning_statement: {
          for_target: 'Compliance leaders',
          key_benefit: 'faster audits',
          primary_differentiator: 'integrated evidence',
        },
        unique_differentiators: ['Automation', 'Auditability'],
        value_proposition_canvas: {
          customer_gains: ['Faster reviews'],
        },
      },
      vol6: {
        one_liner: 'Compliance automation for AI teams',
        tone_of_voice: ['confident', 'clear'],
        brand_narrative: {
          heros_journey: 'Teams move from reactive reporting to proactive governance.',
        },
        messaging_pillars: [
          { pillar: 'Trust', supporting_evidence: ['Traceability'] },
          { pillar: 'Speed', supporting_evidence: ['Automated evidence'] },
        ],
      },
    });

    const envelope = createValidatedModuleHandoffEnvelope({
      fromModule: 'add-venture',
      toModule: 'brand-aid',
      ventureId: 'venture-1',
      payload,
      correlationId: 'corr-1',
      targetSchema: 'venture-to-brand.schema.json',
      validator: validateVentureToBrandHandoff,
    });

    const resolved = resolveModuleHandoffEnvelope({ handoff: envelope }, 'brand-aid');
    expect(resolved?.payload).toMatchObject({
      venture_id: 'venture-1',
      value_proposition: 'Automate compliance workflows',
    });
  });

  it('maps a validated venture-to-brand handoff into brand-aid input', () => {
    const input = buildBrandAidAgentInputFromVentureToBrandHandoff({
      venture_id: 'venture-2',
      value_proposition: 'Clear product value',
      target_audience: { primary_segment: 'Technical founders' },
      positioning_statement: 'Distinct positioning',
      tone_of_voice: ['clear', 'expert'],
      visual_mood: ['modern', 'credible'],
      competitive_set: [{ name: 'Competitor A' }],
    });

    expect(input).toMatchObject({
      venture_hypothesis: 'Clear product value',
      customer_segment: 'Technical founders',
    });
  });
});
