function escapeMdCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function renderOpportunityScanSummaryMd(params: {
  themes: string[];
  scanId: string;
  workflowId?: string;
  summaryOverview?: string;
  rankedPreview: Array<{ title?: string; score?: number; recommendation?: string }>;
}): string {
  const lines: string[] = [
    '# Opportunity scan summary',
    '',
    `- **Scan ID**: ${params.scanId}`,
    ...(params.workflowId ? [`- **Workflow**: ${params.workflowId}`, ''] : ['']),
    `## Themes`,
    '',
    params.themes.length ? params.themes.map((t) => `- ${t}`).join('\n') : '_none_',
    '',
    ...(params.summaryOverview
      ? [`## Overview`, '', params.summaryOverview, '']
      : []),
    `## Top ranked`,
    '',
    '| Rank | Title | Score | Recommendation |',
    '| --- | --- | --- | --- |',
  ];

  params.rankedPreview.forEach((r, i) => {
    lines.push(
      `| ${i + 1} | ${escapeMdCell(String(r.title ?? '—'))} | ${r.score ?? '—'} | ${escapeMdCell(String(r.recommendation ?? '—'))} |`,
    );
  });

  lines.push('', '_Generated when the opportunity module completed scanning._');
  return lines.join('\n');
}

export function renderOpportunityHandoffMd(handoff: Record<string, unknown>): string {
  const title = typeof handoff.title === 'string' ? handoff.title : '—';
  const oid = typeof handoff.opportunity_id === 'string' ? handoff.opportunity_id : '—';
  const ps =
    typeof handoff.problem_statement === 'string'
      ? handoff.problem_statement
      : typeof handoff.description === 'string'
        ? handoff.description
        : '';
  const segment =
    typeof handoff.target_segment === 'string'
      ? handoff.target_segment
      : typeof handoff.market_segment === 'string'
        ? handoff.market_segment
        : '';

  return [
    '# Opportunity → Add-Venture handoff',
    '',
    `This snapshot documents what was passed to **add-venture** (merged prioritization + analyst + scoring).`,
    '',
    `- **Opportunity ID**: ${oid}`,
    `- **Title**: ${title}`,
    `- **Target segment**: ${segment || '_unset_'}`,
    '',
    `## Problem statement`,
    '',
    ps.trim() || '_empty — check pipeline merge if unexpected._',
    '',
    `## Raw handoff (truncated JSON)`,
    '',
    '```json',
    JSON.stringify(handoff, null, 2).slice(0, 12000),
    '```',
    '',
    '_Generated automatically for project knowledge-base._',
    '',
  ].join('\n');
}

export function renderVentureDossierSummaryMd(params: {
  ventureName: string;
  ventureId: string;
  status?: string;
  criticScore?: number | null;
  executiveSummary?: string | null;
  dossierPreview: unknown;
}): string {
  const body =
    typeof params.dossierPreview === 'object'
      ? JSON.stringify(params.dossierPreview, null, 2).slice(0, 14000)
      : String(params.dossierPreview);

  return [
    '# Venture dossier summary',
    '',
    `- **Venture**: ${params.ventureName}`,
    `- **Venture ID**: ${params.ventureId}`,
    `- **Status**: ${params.status ?? '—'}`,
    ...(params.criticScore != null ? [`- **Critic score**: ${params.criticScore}`, ''] : ['']),
    ...(params.executiveSummary
      ? [`## Executive summary`, '', params.executiveSummary, '']
      : []),
    `## Dossier excerpt`,
    '',
    '```json',
    body,
    '```',
    '',
    '_Generated when add-venture structuring completed._',
    '',
  ].join('\n');
}

export function renderStructuringInsightsMd(params: {
  ventureName: string;
  pipelineRunId?: string;
  stepsCompleted: string[];
}): string {
  return [
    '# Structuring insights',
    '',
    `- **Venture**: ${params.ventureName}`,
    ...(params.pipelineRunId ? [`- **Pipeline run**: ${params.pipelineRunId}`, ''] : ['']),
    `## Steps`,
    '',
    ...(params.stepsCompleted.length ? params.stepsCompleted.map((s) => `- ${s}`) : ['_none_']),
    '',
    '_See module folders under `.projects/<nickname>/add-venture/` for per-agent outputs._',
    '',
  ].join('\n');
}
