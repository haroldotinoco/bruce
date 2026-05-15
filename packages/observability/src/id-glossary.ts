export interface ObservabilityIdGlossaryEntry {
  id: string;
  label: string;
  scope: string;
  purpose: string;
  lookupHint: string;
}

export const LIFECYCLE_CORRELATION_POLICY = {
  root: 'correlation_id',
  requiredCarriers: [
    'Temporal workflow args',
    'Temporal memo',
    'workflow_runs.correlation_id',
    'InterModuleEvent.correlation_id',
    'ModuleHandoffEnvelope.metadata.correlation_id',
    'structured logs',
    'DLQ payloads',
    'dashboard workflow links',
  ],
  lookupOrder: [
    'observability_run_id',
    'temporal_workflow_id',
    'correlation_id',
    'event_id',
    'venture_id',
    'domain_record_id',
  ],
} as const;

export const OBSERVABILITY_ID_GLOSSARY: ObservabilityIdGlossaryEntry[] = [
  {
    id: 'observability_run_id',
    label: 'Observability run ID',
    scope: 'workflow_runs.id',
    purpose: 'Canonical dashboard workflow run identifier.',
    lookupHint: 'Use GET /workflows/:run_id with the module that owns the run.',
  },
  {
    id: 'temporal_workflow_id',
    label: 'Temporal workflow ID',
    scope: 'Temporal namespace and task queue',
    purpose: 'Durable workflow execution identifier used by workers and job polling.',
    lookupHint: 'Resolve through workflow_runs.temporal_workflow_id.',
  },
  {
    id: 'correlation_id',
    label: 'Correlation ID',
    scope: 'Lifecycle or handoff chain',
    purpose: 'Carries lineage across Temporal memos, observability runs, events, and logs.',
    lookupHint: 'Search workflow_runs.correlation_id, event envelopes, and structured logs.',
  },
  {
    id: 'event_id',
    label: 'Inter-module event ID',
    scope: 'BullMQ event envelope',
    purpose: 'Unique durable event envelope identifier, distinct from BullMQ job ID.',
    lookupHint: 'Search event worker logs and intermodule idempotency keys.',
  },
  {
    id: 'venture_id',
    label: 'Venture ID',
    scope: 'Domain record',
    purpose: 'Connects workflow runs, events, and module artifacts to a venture.',
    lookupHint: 'Filter workflow lists by venture_id.',
  },
  {
    id: 'scan_id',
    label: 'Opportunity scan ID',
    scope: 'Opportunity domain',
    purpose: 'Domain identifier that Opportunity can bridge to a Temporal workflow ID.',
    lookupHint: 'Use Opportunity /workflows/:scan_id fallback.',
  },
];

export const TRACEABILITY_INCIDENT_CHECKLIST = [
  'Identify the module that owns the visible workflow or event.',
  'Resolve the observability_run_id first; treat it as the canonical dashboard run.',
  'Record temporal_workflow_id, correlation_id, venture_id, and any domain ID from id_lineage.',
  'Search inter-module events by correlation_id and event_id.',
  'Confirm downstream event payloads include observability_run_id and temporal_workflow_id.',
  'Check LLM usage rows for the same run_id and step attribution.',
] as const;
