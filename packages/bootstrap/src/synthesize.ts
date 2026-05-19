import { randomUUID } from 'crypto';
import { runAgentStep } from '@bruce/agent-runtime';
import { validateOpportunityToVentureHandoff } from '@bruce/handoff';
import { logger } from '@bruce/logger';
import {
  buildHeuristicDossier,
  buildHeuristicOpportunityPack,
  opportunityIdFromHandoff,
} from './heuristic.js';
import { asRecord, errorMessage, stringValue, useHeuristicSynthesis } from './util.js';

export type BootstrapTargetModule = 'add-venture' | 'brand-aid';

export interface SynthesizedOpportunityPack {
  ventureHandoff: Record<string, unknown>;
  scanResults: Record<string, unknown>;
}

async function runSynthesizerAgent(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = await runAgentStep({
    module: 'bootstrap',
    agentId: 'handoff-synthesizer',
    input,
    context: {
      accountId: stringValue(input.account_id, 'bootstrap'),
      ventureId: stringValue(input.venture_id),
      module: 'bootstrap',
      executionId: randomUUID(),
      correlationId: stringValue(input.correlation_id, randomUUID()),
    },
  });
  if (!result.success || result.output == null) {
    throw new Error(result.error ?? 'Handoff synthesizer agent failed');
  }
  return asRecord(result.output);
}

export async function synthesizeOpportunityPack(params: {
  prompt: string;
  ventureId: string;
  ventureName?: string;
  accountId: string;
  correlationId: string;
  validationErrors?: string[];
}): Promise<SynthesizedOpportunityPack> {
  if (useHeuristicSynthesis()) {
    return buildHeuristicOpportunityPack(params);
  }

  try {
    const output = await runSynthesizerAgent({
      prompt: params.prompt,
      target_module: 'add-venture',
      venture_id: params.ventureId,
      venture_name: params.ventureName,
      synthesis_phase: 'opportunity',
      validation_errors: params.validationErrors,
      account_id: params.accountId,
      correlation_id: params.correlationId,
    });
    const ventureHandoff = asRecord(output.venture_handoff);
    if (!stringValue(ventureHandoff.opportunity_id)) {
      ventureHandoff.opportunity_id = randomUUID();
    }
    const scanResults =
      asRecord(output.scan_results).ranked_opportunities != null
        ? asRecord(output.scan_results)
        : { ranked_opportunities: [ventureHandoff] };

    const validation = validateOpportunityToVentureHandoff(ventureHandoff);
    if (!validation.ok) {
      if (params.validationErrors?.length) {
        logger.warn({ errors: validation.errors }, 'Opportunity synthesis validation failed; using heuristic');
        return buildHeuristicOpportunityPack(params);
      }
      return synthesizeOpportunityPack({
        ...params,
        validationErrors: validation.errors ?? ['validation failed'],
      });
    }
    return {
      ventureHandoff: validation.normalized ?? ventureHandoff,
      scanResults,
    };
  } catch (error) {
    logger.warn({ error: errorMessage(error) }, 'LLM opportunity synthesis failed; using heuristic fallback');
    return buildHeuristicOpportunityPack(params);
  }
}

export async function synthesizeDossierPack(params: {
  prompt: string;
  ventureId: string;
  ventureName: string;
  ventureHandoff: Record<string, unknown>;
  accountId: string;
  correlationId: string;
  validationErrors?: string[];
}): Promise<Record<string, unknown>> {
  const opportunityId = opportunityIdFromHandoff(params.ventureHandoff);

  if (useHeuristicSynthesis()) {
    return buildHeuristicDossier({
      prompt: params.prompt,
      ventureId: params.ventureId,
      ventureName: params.ventureName,
      opportunityId,
    });
  }

  try {
    const output = await runSynthesizerAgent({
      prompt: params.prompt,
      target_module: 'brand-aid',
      venture_id: params.ventureId,
      venture_name: params.ventureName,
      synthesis_phase: 'dossier',
      opportunity_handoff: params.ventureHandoff,
      validation_errors: params.validationErrors,
      account_id: params.accountId,
      correlation_id: params.correlationId,
    });
    const dossier = asRecord(output.dossier);
    if (!dossier.volumes) {
      throw new Error('Synthesizer returned dossier without volumes');
    }
    dossier.venture_id = params.ventureId;
    dossier.opportunity_id = opportunityId;
    dossier.venture_name = params.ventureName;
    return dossier;
  } catch (error) {
    logger.warn({ error: errorMessage(error) }, 'LLM dossier synthesis failed; using heuristic fallback');
    return buildHeuristicDossier({
      prompt: params.prompt,
      ventureId: params.ventureId,
      ventureName: params.ventureName,
      opportunityId,
    });
  }
}
