/**
 * Resolve the opportunity record add-venture should run from an inter-module payload.
 */

import {
  handoffPayloadFallbackTotal,
  handoffPayloadIntegrityViolationTotal,
} from './metrics.js';

export class MissingVentureHandoffError extends Error {
  constructor(message = 'Missing required venture_handoff in inter-module payload') {
    super(message);
    this.name = 'MissingVentureHandoffError';
  }
}

export function enrichBriefingAliases(opportunity: Record<string, unknown>): Record<string, unknown> {
  const ps =
    typeof opportunity.problem_statement === 'string' && opportunity.problem_statement.trim().length > 0
      ? opportunity.problem_statement
      : typeof opportunity.description === 'string'
        ? opportunity.description
        : '';

  const ts =
    typeof opportunity.target_segment === 'string' && opportunity.target_segment.trim().length > 0
      ? opportunity.target_segment
      : typeof opportunity.market_segment === 'string'
        ? opportunity.market_segment
        : typeof opportunity.segment === 'string'
          ? opportunity.segment
          : '';

  return {
    ...opportunity,
    problem_statement: ps,
    target_segment: ts,
  };
}

function firstRankedFromResults(results: Record<string, unknown>): Record<string, unknown> | undefined {
  const ranked =
    results.ranked_opportunities ?? results.opportunities ?? results.scored_opportunities;
  if (Array.isArray(ranked) && ranked.length > 0 && ranked[0] && typeof ranked[0] === 'object') {
    return ranked[0] as Record<string, unknown>;
  }
  return undefined;
}

export function resolveOpportunityFromInterModulePayload(
  payload: Record<string, unknown>,
  options?: { allowFallback?: boolean }
): Record<string, unknown> {
  const explicit = payload.venture_handoff;
  if (explicit && typeof explicit === 'object' && !Array.isArray(explicit)) {
    return enrichBriefingAliases(explicit as Record<string, unknown>);
  }

  if (!options?.allowFallback) {
    handoffPayloadIntegrityViolationTotal.labels('missing_venture_handoff').inc();
    throw new MissingVentureHandoffError();
  }

  const results = payload.results as Record<string, unknown> | undefined;
  if (!results) {
    handoffPayloadFallbackTotal.labels('synthetic_default').inc();
    return enrichBriefingAliases({
      title: 'From inter-module event',
      problem_statement: 'Derived from opportunity scan completion',
      target_segment: 'general',
    });
  }

  const row = firstRankedFromResults(results);
  if (row) {
    handoffPayloadFallbackTotal.labels('ranked_results').inc();
    return enrichBriefingAliases(row);
  }

  handoffPayloadFallbackTotal.labels('synthetic_default').inc();
  return enrichBriefingAliases({
    title: 'From inter-module event',
    problem_statement: 'No ranked list in payload',
    target_segment: 'general',
  });
}
