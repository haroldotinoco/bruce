import { describe, expect, it } from 'vitest';
import {
  buildVentureToBrandHandoff,
  validateOpportunityToVentureHandoff,
  validateVentureToBrandHandoff,
} from '@bruce/handoff';
import { buildHeuristicDossier, buildHeuristicOpportunityPack, dossierVolumes } from './heuristic.js';

describe('bootstrap heuristic packs', () => {
  it('produces valid opportunity-to-venture handoff', () => {
    const ventureId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const { ventureHandoff } = buildHeuristicOpportunityPack({
      prompt: 'A B2B platform that automates compliance reporting for fintech startups with real-time dashboards.',
      ventureId,
      ventureName: 'ComplianceFlow',
    });
    const validation = validateOpportunityToVentureHandoff(ventureHandoff);
    expect(validation.ok).toBe(true);
  });

  it('produces brand handoff from heuristic dossier volumes', () => {
    const ventureId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const { ventureHandoff } = buildHeuristicOpportunityPack({
      prompt: 'Brand for a modern wellness app targeting busy professionals.',
      ventureId,
    });
    const dossier = buildHeuristicDossier({
      prompt: 'Brand for a modern wellness app targeting busy professionals.',
      ventureId,
      ventureName: 'WellnessPro',
      opportunityId: String(ventureHandoff.opportunity_id),
    });
    const { vol2, vol3, vol6 } = dossierVolumes(dossier);
    const brand = buildVentureToBrandHandoff({ ventureId, vol2, vol3, vol6 });
    const validation = validateVentureToBrandHandoff(brand);
    expect(validation.ok).toBe(true);
  });
});
