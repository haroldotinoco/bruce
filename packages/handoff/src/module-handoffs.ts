import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const BruceModuleNameSchema = z.enum([
  'opportunity',
  'add-venture',
  'brand-aid',
  'builder',
  'gtm',
  'startup-ops',
  'portfolio',
  'bruce-core',
  'bruce-memory',
]);

export type BruceModuleName = z.infer<typeof BruceModuleNameSchema>;

export const HANDOFF_ENVELOPE_POLICY = {
  canonicalEnvelope: 'ModuleHandoffEnvelope',
  transportEnvelope: 'InterModuleEvent',
  payloadLocations: ['payload.handoff', 'payload.handoffs.<target-module>'],
  strictValidationEnv: 'BRUCE_HANDOFF_VALIDATE_STRICT',
  correlationRoot: 'metadata.correlation_id',
  runtimeRule:
    'InterModuleEvent is the durable transport envelope; ModuleHandoffEnvelope is the canonical contract envelope inside event payloads.',
} as const;

const HandoffContextRefSchema = z
  .object({
    ref_type: z.enum(['venture_state_snapshot', 'artifact', 'metric_snapshot', 'decision_record']),
    ref_id: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

const HandoffValidationErrorSchema = z
  .object({
    path: z.string().optional(),
    error: z.string().min(1),
  })
  .strict();

export const ModuleHandoffEnvelopeSchema = z
  .object({
    handoff_id: z.string().uuid(),
    from_module: BruceModuleNameSchema,
    to_module: BruceModuleNameSchema,
    venture_id: z.string().min(1),
    payload: z.record(z.unknown()),
    context_refs: z.array(HandoffContextRefSchema).optional(),
    metadata: z
      .object({
        correlation_id: z.string().min(1),
        trace_id: z.string().optional(),
        triggered_by: z.enum(['workflow_step', 'event_subscription', 'manual_trigger', 'scheduled_task']).optional(),
        workflow_execution_id: z.string().optional(),
        timestamp: z.string().datetime({ offset: true }),
      })
      .strict(),
    validation: z
      .object({
        target_schema: z.string().optional(),
        is_valid: z.boolean().optional(),
        validation_errors: z.array(HandoffValidationErrorSchema).optional(),
        validated_at: z.string().datetime({ offset: true }).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type ModuleHandoffEnvelope = z.infer<typeof ModuleHandoffEnvelopeSchema>;

export interface ContractValidationResult<T extends Record<string, unknown>> {
  ok: boolean;
  errors?: string[];
  normalized?: T;
}

const VentureToBrandHandoffSchema = z
  .object({
    venture_id: z.string().min(1),
    value_proposition: z.string().min(1),
    target_audience: z
      .object({
        primary_segment: z.string().min(1),
        demographics: z.array(z.string()).optional(),
        psychographics: z.array(z.string()).optional(),
        pain_points: z.array(z.string()).optional(),
        aspirations: z.array(z.string()).optional(),
      })
      .passthrough(),
    positioning_statement: z.string().min(1),
    positioning_pillars: z.array(z.string()).min(2).max(4).optional(),
    tone_of_voice: z.array(z.string()).min(2).max(5),
    visual_mood: z.array(z.string()).min(2).max(5),
    competitive_differentiation: z.string().optional(),
    brand_archetypes: z.array(z.string()).optional(),
    brand_story: z.string().optional(),
    mission_statement: z.string().optional(),
    core_values: z.array(z.string()).optional(),
    brand_name_suggestions: z
      .array(
        z
          .object({
            name: z.string().optional(),
            rationale: z.string().optional(),
            availability_check: z.boolean().optional(),
          })
          .passthrough(),
      )
      .optional(),
    competitive_set: z
      .array(
        z
          .object({
            name: z.string().optional(),
            positioning: z.string().optional(),
            differentiation_opportunity: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    visual_direction_preferences: z
      .object({
        style_references: z.array(z.string()).optional(),
        color_temperature: z.enum(['cool', 'warm', 'neutral']).optional(),
        geometric_vs_organic: z.enum(['geometric', 'organic', 'mixed']).optional(),
        minimal_vs_detailed: z.enum(['minimal', 'detailed', 'balanced']).optional(),
      })
      .passthrough()
      .optional(),
    messaging_pillars: z
      .array(
        z
          .object({
            pillar: z.string().optional(),
            supporting_messages: z.array(z.string()).optional(),
          })
          .passthrough(),
      )
      .optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

const VentureToBuilderHandoffSchema = z
  .object({
    venture_id: z.string().min(1),
    mvp_scope: z
      .object({
        core_features: z
          .array(
            z
              .object({
                feature_name: z.string().min(1),
                description: z.string().min(1),
                user_stories: z.array(z.string()).optional(),
                acceptance_criteria: z.array(z.string()).optional(),
                priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
                estimated_effort: z.string().optional(),
              })
              .passthrough(),
          )
          .min(1),
        out_of_scope: z
          .array(
            z
              .object({
                feature_name: z.string().optional(),
                rationale: z.string().optional(),
              })
              .passthrough(),
          )
          .optional(),
        integrations: z
          .array(
            z
              .object({
                service_name: z.string().optional(),
                purpose: z.string().optional(),
                required_for_mvp: z.boolean().optional(),
              })
              .passthrough(),
          )
          .optional(),
      })
      .passthrough(),
    tech_stack: z
      .object({
        frontend: z.record(z.unknown()),
        backend: z.record(z.unknown()),
        database: z.record(z.unknown()),
        infrastructure: z.record(z.unknown()),
        authentication: z.string().optional(),
        analytics: z.array(z.string()).optional(),
      })
      .passthrough(),
    non_functional_requirements: z.record(z.unknown()).optional(),
    user_stories: z.array(z.record(z.unknown())),
    success_metrics: z.array(z.record(z.unknown())),
    ux_requirements: z.record(z.unknown()).optional(),
    security_requirements: z.record(z.unknown()).optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

const BuilderToGtmHandoffSchema = z
  .object({
    venture_id: z.string().min(1),
    product_name: z.string().min(1),
    product_url: z.string().url(),
    product_deployment_status: z.enum(['staging', 'alpha', 'beta', 'live']).optional(),
    product_description: z.string().min(1),
    core_value_delivered: z.string().min(1),
    mvp_features_shipped: z.array(z.string()).min(1),
    features_deferred: z.array(z.string()).optional(),
    target_user_profile: z
      .object({
        user_segment: z.string().optional(),
        primary_pain_point: z.string().optional(),
        secondary_pain_points: z.array(z.string()).optional(),
        buying_criteria: z.array(z.string()).optional(),
      })
      .passthrough(),
    key_differentiators: z
      .array(
        z
          .object({
            differentiator: z.string().optional(),
            competitive_advantage: z.string().optional(),
          })
          .passthrough(),
      )
      .min(1),
    launch_readiness_score: z.number().min(0).max(100),
    readiness_scorecard: z.record(z.unknown()).optional(),
    known_limitations: z.array(z.record(z.unknown())).optional(),
    beta_user_feedback: z.array(z.record(z.unknown())).optional(),
    onboarding_experience: z.record(z.unknown()).optional(),
    technical_implementation: z.record(z.unknown()).optional(),
    analytics_instrumentation: z.record(z.unknown()).optional(),
    marketing_assets: z.record(z.unknown()).optional(),
    pricing_model: z.record(z.unknown()).optional(),
    launch_prerequisites: z.array(z.record(z.unknown())).optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

const GtmToStartupOpsHandoffSchema = z
  .object({
    venture_id: z.string().min(1),
    launch_date: z.string().min(1),
    go_live_status: z.enum(['pre_launch', 'launched', 'paused']).optional(),
    gtm_strategy_summary: z.string().min(1),
    target_market: z.string().min(1),
    target_customer_profile: z.record(z.unknown()).optional(),
    launch_channels: z.array(z.record(z.unknown())).min(1),
    campaign_ids: z.array(z.record(z.unknown())).optional(),
    analytics_configuration: z.record(z.unknown()),
    critical_metrics: z.array(z.record(z.unknown())).min(1),
    hypothesis_being_validated: z.record(z.unknown()),
    customer_acquisition_strategy: z.record(z.unknown()).optional(),
    activation_strategy: z.record(z.unknown()).optional(),
    retention_strategy: z.record(z.unknown()).optional(),
    revenue_model: z.record(z.unknown()).optional(),
    pre_launch_checklist: z.array(z.record(z.unknown())).optional(),
    launch_risks: z.array(z.record(z.unknown())).optional(),
    post_launch_review_date: z.string().optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

const StartupOpsToPortfolioHandoffSchema = z
  .object({
    venture_id: z.string().min(1),
    report_period: z
      .object({
        start_date: z.string().min(1),
        end_date: z.string().min(1),
        report_frequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
      })
      .passthrough(),
    health_scores: z
      .object({
        activation: z.number(),
        retention: z.number(),
        revenue: z.number(),
        product_quality: z.number(),
        financial: z.number(),
        market_fit: z.number(),
      })
      .passthrough(),
    overall_health_score: z.number(),
    metric_snapshots: z.record(z.unknown()),
    metric_targets: z.record(z.unknown()).optional(),
    hypothesis_validation_status: z.enum(['validating', 'validated', 'invalidated', 'inconclusive']),
    hypothesis_validation_detail: z.record(z.unknown()).optional(),
    anomalies_detected: z.array(z.record(z.unknown())).optional(),
    successes_this_period: z.array(z.string()).optional(),
    challenges_this_period: z.array(z.record(z.unknown())).optional(),
    recommendations: z.array(z.record(z.unknown())).optional(),
    resource_needs: z.record(z.unknown()).optional(),
    decision_required: z.boolean().optional(),
    suggested_decision: z.enum(['continue', 'iterate', 'scale', 'pause', 'kill', 'escalate_to_human']).optional(),
    suggested_decision_rationale: z.string().optional(),
    decision_confidence: z.number().min(0).max(100).optional(),
    reported_at: z.string().datetime({ offset: true }),
    report_generated_by_agent: z.string().optional(),
  })
  .strict();

const PortfolioToBruceCoreHandoffSchema = z
  .object({
    venture_id: z.string().min(1),
    review_date: z.string().min(1),
    review_period: z.record(z.unknown()).optional(),
    venture_status: z.enum([
      'generated',
      'qualified',
      'structured',
      'built',
      'launched',
      'operating',
      'iterating',
      'scaling',
      'paused',
      'killed',
    ]),
    decision: z.enum(['scale', 'iterate', 'pause', 'kill', 'continue']),
    decision_type: z
      .enum([
        'continue_current_path',
        'increase_investment',
        'shift_hypothesis',
        'temporary_pause',
        'permanent_termination',
      ])
      .optional(),
    rationale: z.string().min(1),
    supporting_health_scores: z.record(z.unknown()).optional(),
    supporting_metrics: z.record(z.unknown()).optional(),
    trend_analysis: z.record(z.unknown()).optional(),
    confidence_score: z.number().min(0).max(100),
    risk_flags: z.array(z.record(z.unknown())).optional(),
    if_scale_decision: z.record(z.unknown()).optional(),
    if_iterate_decision: z.record(z.unknown()).optional(),
    if_pause_decision: z.record(z.unknown()).optional(),
    if_kill_decision: z.record(z.unknown()).optional(),
    resource_impact: z.record(z.unknown()).optional(),
    supporting_data_refs: z.array(z.string()).optional(),
    next_review_date: z.string().optional(),
    portfolio_context: z.record(z.unknown()).optional(),
    decision_ready: z.boolean().optional(),
    escalation_flags: z.array(z.string()).optional(),
    prepared_by: z.string().optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

function formatZodErrors(error: z.ZodError): string[] {
  return error.errors.map((entry) => `${entry.path.join('.')}: ${entry.message}`);
}

function validateRecord<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  raw: Record<string, unknown>,
): ContractValidationResult<T> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, normalized: parsed.data };
  }
  return { ok: false, errors: formatZodErrors(parsed.error) };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    : [];
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringArray(value: unknown, fallback: string[] = []): string[] {
  const array = Array.isArray(value) ? value : fallback;
  return array
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function firstNonEmpty(values: unknown[], fallback = ''): string {
  for (const value of values) {
    const normalized = stringValue(value);
    if (normalized) return normalized;
  }
  return fallback;
}

function normalizeTwoToFive(values: string[], fallback: string[]): string[] {
  const deduped = Array.from(new Set(values.filter((value) => value.length > 0)));
  const seeded = deduped.length >= 2 ? deduped : Array.from(new Set([...deduped, ...fallback]));
  return seeded.slice(0, 5);
}

function normalizeTwoToFour(values: string[], fallback: string[]): string[] {
  return normalizeTwoToFive(values, fallback).slice(0, 4);
}

function scoreFromBooleanSignals(signals: boolean[]): number {
  if (signals.length === 0) return 0;
  const pct = signals.filter(Boolean).length / signals.length;
  return Math.round(pct * 100);
}

export function validateVentureToBrandHandoff(raw: Record<string, unknown>) {
  return validateRecord(VentureToBrandHandoffSchema, raw);
}

export function validateVentureToBuilderHandoff(raw: Record<string, unknown>) {
  return validateRecord(VentureToBuilderHandoffSchema, raw);
}

export function validateBuilderToGtmHandoff(raw: Record<string, unknown>) {
  return validateRecord(BuilderToGtmHandoffSchema, raw);
}

export function validateGtmToStartupOpsHandoff(raw: Record<string, unknown>) {
  return validateRecord(GtmToStartupOpsHandoffSchema, raw);
}

export function validateStartupOpsToPortfolioHandoff(raw: Record<string, unknown>) {
  return validateRecord(StartupOpsToPortfolioHandoffSchema, raw);
}

export function validatePortfolioToBruceCoreHandoff(raw: Record<string, unknown>) {
  return validateRecord(PortfolioToBruceCoreHandoffSchema, raw);
}

export function createModuleHandoffEnvelope(params: {
  fromModule: BruceModuleName;
  toModule: BruceModuleName;
  ventureId: string;
  payload: Record<string, unknown>;
  correlationId: string;
  workflowExecutionId?: string;
  triggeredBy?: 'workflow_step' | 'event_subscription' | 'manual_trigger' | 'scheduled_task';
  targetSchema?: string;
  contextRefs?: Array<{ ref_type: 'venture_state_snapshot' | 'artifact' | 'metric_snapshot' | 'decision_record'; ref_id: string; description?: string }>;
  validationErrors?: string[];
}): ModuleHandoffEnvelope {
  const now = new Date().toISOString();
  return ModuleHandoffEnvelopeSchema.parse({
    handoff_id: randomUUID(),
    from_module: params.fromModule,
    to_module: params.toModule,
    venture_id: params.ventureId,
    payload: params.payload,
    ...(params.contextRefs?.length ? { context_refs: params.contextRefs } : {}),
    metadata: {
      correlation_id: params.correlationId,
      timestamp: now,
      trace_id: `${params.fromModule}:${params.ventureId}:${params.toModule}`,
      ...(params.workflowExecutionId ? { workflow_execution_id: params.workflowExecutionId } : {}),
      ...(params.triggeredBy ? { triggered_by: params.triggeredBy } : {}),
    },
    validation: {
      target_schema: params.targetSchema,
      is_valid: !params.validationErrors?.length,
      ...(params.validationErrors?.length
        ? {
            validation_errors: params.validationErrors.map((error) => ({
              error,
            })),
          }
        : {}),
      validated_at: now,
    },
  });
}

export function createValidatedModuleHandoffEnvelope<T extends Record<string, unknown>>(params: {
  fromModule: BruceModuleName;
  toModule: BruceModuleName;
  ventureId: string;
  payload: Record<string, unknown>;
  correlationId: string;
  workflowExecutionId?: string;
  triggeredBy?: 'workflow_step' | 'event_subscription' | 'manual_trigger' | 'scheduled_task';
  targetSchema: string;
  contextRefs?: Array<{ ref_type: 'venture_state_snapshot' | 'artifact' | 'metric_snapshot' | 'decision_record'; ref_id: string; description?: string }>;
  validator: (raw: Record<string, unknown>) => ContractValidationResult<T>;
}): ModuleHandoffEnvelope {
  const validation = params.validator(params.payload);
  if (!validation.ok || !validation.normalized) {
    throw new Error(
      `${params.targetSchema} invalid: ${validation.errors?.join('; ') ?? 'unknown validation error'}`,
    );
  }
  return createModuleHandoffEnvelope({
    fromModule: params.fromModule,
    toModule: params.toModule,
    ventureId: params.ventureId,
    payload: validation.normalized,
    correlationId: params.correlationId,
    workflowExecutionId: params.workflowExecutionId,
    triggeredBy: params.triggeredBy,
    targetSchema: params.targetSchema,
    contextRefs: params.contextRefs,
  });
}

export function resolveModuleHandoffEnvelope(
  payload: Record<string, unknown>,
  targetModule: BruceModuleName,
): ModuleHandoffEnvelope | undefined {
  const single = payload.handoff;
  if (single && typeof single === 'object' && !Array.isArray(single)) {
    const parsed = ModuleHandoffEnvelopeSchema.safeParse(single);
    if (parsed.success && parsed.data.to_module === targetModule) {
      return parsed.data;
    }
  }

  const handoffs = asRecord(payload.handoffs);
  const candidate = handoffs[targetModule];
  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
    const parsed = ModuleHandoffEnvelopeSchema.safeParse(candidate);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return undefined;
}

export function isModuleHandoffEnvelope(value: unknown): value is ModuleHandoffEnvelope {
  return ModuleHandoffEnvelopeSchema.safeParse(value).success;
}

export function buildVentureToBrandHandoff(params: {
  ventureId: string;
  vol2: Record<string, unknown>;
  vol3: Record<string, unknown>;
  vol6: Record<string, unknown>;
}): Record<string, unknown> {
  const primarySegment = asRecordArray(params.vol2.customer_segments)[0] ?? {};
  const positioning = asRecord(params.vol3.positioning_statement);
  const narrative = asRecord(params.vol6.brand_narrative);
  const differentiators = stringArray(params.vol3.unique_differentiators);
  const messagingPillars = asRecordArray(params.vol6.messaging_pillars);
  const comparison = asRecordArray(params.vol3.comparison_vs_alternatives);

  return {
    venture_id: params.ventureId,
    value_proposition: firstNonEmpty([
      params.vol3.core_value_proposition,
      params.vol6.one_liner,
    ]),
    target_audience: {
      primary_segment: firstNonEmpty([
        primarySegment.segment_name,
        positioning.for_target,
      ]),
      demographics: stringArray(primarySegment.customer_archetypes),
      psychographics: stringArray(narrative.why_now ? [String(narrative.why_now)] : []),
      pain_points: stringArray(primarySegment.primary_pain_points),
      aspirations: stringArray(asRecord(params.vol3.value_proposition_canvas).customer_gains),
    },
    positioning_statement: [
      firstNonEmpty([positioning.for_target], 'For a clearly defined customer'),
      firstNonEmpty([positioning.key_benefit, params.vol6.one_liner], 'this venture delivers a differentiated outcome'),
      firstNonEmpty([positioning.primary_differentiator], 'through a distinct angle'),
    ].join(' '),
    positioning_pillars: normalizeTwoToFour(
      [
        ...messagingPillars.map((pillar) => stringValue(pillar.pillar)),
        ...differentiators,
      ],
      ['clarity', 'credibility'],
    ),
    tone_of_voice: normalizeTwoToFive(stringArray(params.vol6.tone_of_voice), ['confident', 'pragmatic']),
    visual_mood: normalizeTwoToFive(
      [...stringArray(params.vol6.tagline_candidates).slice(0, 2), ...differentiators.map((item) => item.toLowerCase())],
      ['modern', 'credible'],
    ),
    competitive_differentiation: firstNonEmpty([
      differentiators.join('; '),
      comparison
        .map((entry) => firstNonEmpty([entry.our_advantage, entry.differentiation_opportunity]))
        .filter(Boolean)
        .join('; '),
    ]),
    brand_story: stringValue(narrative.heros_journey),
    mission_statement: firstNonEmpty([narrative.what_we_stand_for, narrative.customer_transformation]),
    competitive_set: comparison.map((entry) => ({
      name: stringValue(entry.alternative),
      positioning: stringValue(entry.their_strength),
      differentiation_opportunity: stringValue(entry.our_advantage),
    })),
    messaging_pillars: messagingPillars.map((entry) => ({
      pillar: stringValue(entry.pillar),
      supporting_messages: stringArray(entry.supporting_evidence),
    })),
    created_at: stringValue(params.vol6.execution_timestamp, new Date().toISOString()),
  };
}

export function buildVentureToBuilderHandoff(params: {
  ventureId: string;
  vol2: Record<string, unknown>;
  vol3: Record<string, unknown>;
  vol5: Record<string, unknown>;
  vol8: Record<string, unknown>;
}): Record<string, unknown> {
  const firstSegment = asRecordArray(params.vol2.customer_segments)[0] ?? {};
  const focusAreas = stringArray(asRecord(params.vol8.first_30_days).focus_areas);
  const launchPhases = asRecordArray(params.vol8.phases);
  const coreFeatures = (focusAreas.length ? focusAreas : launchPhases.flatMap((phase) => stringArray(phase.objectives))).slice(0, 6);
  const successMetrics = asRecordArray(params.vol8.success_metrics_and_gates);

  return {
    venture_id: params.ventureId,
    mvp_scope: {
      core_features: coreFeatures.map((feature, index) => ({
        feature_name: feature,
        description: `Derived from venture execution roadmap focus area ${index + 1}.`,
        user_stories: [
          `As ${firstNonEmpty([firstSegment.segment_name], 'the target customer')}, I need ${feature.toLowerCase()} so the venture can deliver its core value.`,
        ],
        acceptance_criteria: [`${feature} is usable in the first 30-day launch window.`],
        priority: index < 2 ? 'critical' : 'high',
        estimated_effort: index < 2 ? 'M' : 'S',
      })),
      out_of_scope: stringArray(params.vol3.data_gaps).slice(0, 4).map((item) => ({
        feature_name: item,
        rationale: 'Deferred until after the first validated MVP release.',
      })),
      integrations: asRecordArray(params.vol5.channel_priorities).slice(0, 3).map((channel) => ({
        service_name: stringValue(channel.channel),
        purpose: stringValue(channel.why_this_channel, 'Support launch acquisition workflow'),
        required_for_mvp: true,
      })),
    },
    tech_stack: {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        build_tool: 'Vite',
        ui_library: 'Tailwind CSS',
        state_management: 'Context API',
      },
      backend: {
        runtime: 'Node.js 20',
        framework: 'Hono',
        language: 'TypeScript',
        api_style: 'rest',
      },
      database: {
        primary: 'PostgreSQL',
        cache: 'Redis',
      },
      infrastructure: {
        hosting: 'AWS',
        compute: 'Containers',
        storage: 'S3',
      },
      authentication: 'JWT',
      analytics: ['Mixpanel'],
    },
    non_functional_requirements: {
      target_response_time_ms: 800,
      uptime_sla: 99,
      max_concurrent_users: Math.max(100, numberValue(firstSegment.segment_size_customers, 100)),
      projected_users_month_6: Math.max(250, numberValue(firstSegment.segment_size_customers, 250)),
    },
    user_stories: coreFeatures.map((feature) => ({
      story_title: feature,
      story_text: `As ${firstNonEmpty([firstSegment.segment_name], 'a customer')}, I want ${feature.toLowerCase()} so that ${stringValue(params.vol3.core_value_proposition, 'I realize the core product value')}.`,
      acceptance_criteria: [`${feature} supports the primary use case end-to-end.`],
      flow_steps: [`Discover ${feature}`, `Use ${feature}`, 'Observe value'],
    })),
    success_metrics: successMetrics.map((metric) => {
      const keyMetrics = asRecord(metric.key_metrics);
      const [metricName, target] = Object.entries(keyMetrics)[0] ?? ['MVP activation', '1'];
      return {
        metric_name: metricName,
        target_value: numberValue(target, 1),
        unit: 'count',
        how_to_measure: stringValue(metric.go_no_go_decision, 'Track via product analytics'),
      };
    }),
    ux_requirements: {
      target_devices: ['Desktop', 'Mobile'],
      mobile_first: false,
      accessibility_requirements: 'wcag_aa',
      browser_support: ['Chrome', 'Safari', 'Firefox'],
    },
    security_requirements: {
      data_encryption: true,
      gdpr_compliance: true,
      authentication_method: 'JWT',
      user_data_retention: 'Delete within 30 days of account closure',
    },
    created_at: stringValue(params.vol8.execution_timestamp, new Date().toISOString()),
  };
}

export function buildBrandAidAgentInputFromVentureToBrandHandoff(handoff: Record<string, unknown>): Record<string, unknown> {
  const targetAudience = asRecord(handoff.target_audience);
  const competitiveSet = asRecordArray(handoff.competitive_set);
  const messagingPillars = asRecordArray(handoff.messaging_pillars);

  return {
    venture_hypothesis: stringValue(handoff.value_proposition),
    competitors: competitiveSet.slice(0, 8).map((entry) => ({
      name: stringValue(entry.name, 'Competitor'),
      category: 'direct',
    })),
    customer_segment: firstNonEmpty([targetAudience.primary_segment], 'General market'),
    research_focus: [
      'brand messaging',
      'positioning claims',
      ...messagingPillars.map((entry) => stringValue(entry.pillar)).filter(Boolean),
    ].slice(0, 6),
    geographic_scope: 'global',
    timeframe: 'last_12_months',
    source_handoff: handoff,
  };
}

export function buildBuilderAgentInputFromVentureToBuilderHandoff(handoff: Record<string, unknown>): Record<string, unknown> {
  const mvpScope = asRecord(handoff.mvp_scope);
  const coreFeatures = asRecordArray(mvpScope.core_features);
  const techStack = asRecord(handoff.tech_stack);
  const backend = asRecord(techStack.backend);
  const database = asRecord(techStack.database);
  const infrastructure = asRecord(techStack.infrastructure);
  const nfr = asRecord(handoff.non_functional_requirements);
  const security = asRecord(handoff.security_requirements);

  return {
    functional_spec: {
      core_features: coreFeatures.map((feature, index) => ({
        feature_id: `FT-${String(index + 1).padStart(3, '0')}`,
        name: stringValue(feature.feature_name),
        description: stringValue(feature.description),
      })),
      integrations: asRecordArray(mvpScope.integrations),
      non_functional_requirements: {
        uptime_sla: `${numberValue(nfr.uptime_sla, 99)}%`,
        response_time_p99: `${numberValue(nfr.target_response_time_ms, 800)}ms`,
        data_retention: stringValue(security.user_data_retention, '1 year'),
      },
    },
    bdd_spec: {
      features: asRecordArray(handoff.user_stories).map((story) => ({
        feature_name: stringValue(story.story_title, 'User journey'),
        scenario_count: Math.max(1, stringArray(story.acceptance_criteria).length),
      })),
    },
    tech_stack_requirements: {
      backend_preference: firstNonEmpty([backend.framework, backend.runtime], 'Node.js'),
      database_preference: firstNonEmpty([database.primary], 'PostgreSQL'),
      cloud_provider: firstNonEmpty([infrastructure.hosting], 'AWS'),
    },
    scalability_requirements: {
      initial_users: 10,
      growth_forecast_months: 6,
      peak_concurrent_users: numberValue(nfr.max_concurrent_users, 100),
    },
    compliance_requirements: [
      security.gdpr_compliance ? 'GDPR' : '',
      security.soc2_compliance ? 'SOC2' : '',
    ].filter(Boolean),
    source_handoff: handoff,
  };
}

export function buildBuilderToGtmHandoff(params: {
  ventureId: string;
  result: Record<string, unknown>;
  sourceHandoff: Record<string, unknown>;
  projectNickname?: string;
}): Record<string, unknown> {
  const mvpScope = asRecord(params.sourceHandoff.mvp_scope);
  const targetStories = asRecordArray(params.sourceHandoff.user_stories);
  const differentiators = asRecordArray(params.sourceHandoff.success_metrics);
  const implementation = asRecord(params.result.infrastructure_spec);
  const sourceAudience = asRecordArray(asRecord(params.sourceHandoff.user_stories));
  const productName = params.projectNickname?.trim() || `venture-${params.ventureId.slice(0, 8)}`;
  const featureNames = asRecordArray(mvpScope.core_features).map((feature) => stringValue(feature.feature_name)).filter(Boolean);

  const readinessSignals = [
    asRecordArray(params.result.services).length > 0,
    asRecordArray(params.result.data_models).length > 0,
    asRecordArray(params.result.api_contract_refs).length > 0,
    stringValue(implementation.cloud_provider).length > 0,
  ];

  return {
    venture_id: params.ventureId,
    product_name: productName,
    product_url: `https://products.bruce.local/${params.ventureId}`,
    product_deployment_status: 'staging',
    product_description: firstNonEmpty([
      featureNames.join(', '),
      'Validated MVP ready for technical delivery',
    ]),
    core_value_delivered: firstNonEmpty([
      asRecord(params.sourceHandoff).value_proposition,
      targetStories.map((story) => stringValue(story.story_text)).find(Boolean),
    ]),
    mvp_features_shipped: featureNames,
    features_deferred: asRecordArray(mvpScope.out_of_scope).map((feature) => stringValue(feature.feature_name)).filter(Boolean),
    target_user_profile: {
      user_segment: firstNonEmpty([sourceAudience[0]?.story_title, 'Validated target user']),
      primary_pain_point: firstNonEmpty([
        asRecordArray(mvpScope.core_features)[0]?.description,
        'Deliver value quickly for the target user',
      ]),
      buying_criteria: ['Usability', 'Speed to value', 'Reliability'],
    },
    key_differentiators: differentiateSuccessMetrics(differentiators),
    launch_readiness_score: scoreFromBooleanSignals(readinessSignals),
    readiness_scorecard: {
      core_functionality: readinessSignals[0] ? 85 : 40,
      reliability: readinessSignals[1] ? 75 : 40,
      performance: readinessSignals[2] ? 70 : 40,
      user_experience: 70,
      documentation: 60,
      security: 65,
    },
    onboarding_experience: {
      time_to_value_minutes: 15,
      onboarding_steps: ['Sign up', 'Configure workspace', 'Complete first core workflow'],
      help_resources: ['In-app guide', 'Product walkthrough'],
    },
    technical_implementation: {
      tech_stack: [stringValue(implementation.cloud_provider), ...asRecordArray(params.result.services).map((service) => stringValue(service.tech))]
        .filter(Boolean)
        .join(', '),
      deployment_infrastructure: stringValue(implementation.cloud_provider, 'AWS'),
      third_party_dependencies: asRecordArray(mvpScope.integrations).map((integration) => stringValue(integration.service_name)).filter(Boolean),
    },
    analytics_instrumentation: {
      events_tracked: featureNames.slice(0, 5),
      analytics_provider: 'Mixpanel',
      dashboard_available: false,
    },
    marketing_assets: {
      product_screenshots: false,
      demo_video: false,
      case_study_templates: false,
    },
    launch_prerequisites: featureNames.slice(0, 3).map((feature) => ({
      prerequisite: `${feature} validated in staging`,
      status: 'in_progress',
    })),
    created_at: new Date().toISOString(),
  };
}

function differentiateSuccessMetrics(metrics: Array<Record<string, unknown>>) {
  const items = metrics
    .map((metric) => ({
      differentiator: stringValue(metric.metric_name),
      competitive_advantage: stringValue(metric.how_to_measure, 'Trackable business outcome'),
    }))
    .filter((entry) => entry.differentiator.length > 0);
  return items.length > 0
    ? items
    : [{ differentiator: 'Integrated execution', competitive_advantage: 'Single-system delivery path' }];
}

export function buildGtmAgentInputFromBuilderToGtmHandoff(handoff: Record<string, unknown>): Record<string, unknown> {
  const targetUser = asRecord(handoff.target_user_profile);
  const technical = asRecord(handoff.technical_implementation);
  return {
    product: {
      name: stringValue(handoff.product_name),
      category: 'b2b-saas',
      value_proposition: stringValue(handoff.core_value_delivered),
      competitive_positioning: asRecordArray(handoff.key_differentiators).map((item) => stringValue(item.competitive_advantage)).filter(Boolean).join('; '),
      price_point_usd: 12000,
    },
    target_audience: {
      primary_persona: firstNonEmpty([targetUser.user_segment], 'Validated buyer persona'),
      secondary_personas: stringArray(targetUser.secondary_pain_points),
      geography: ['US', 'EU'],
      company_size: { min_headcount: 10, max_headcount: 500 },
      media_consumption: ['LinkedIn', 'Industry communities'],
      psychographics: firstNonEmpty([targetUser.primary_pain_point], 'Outcome-oriented operators'),
    },
    resources: {
      monthly_budget_usd: 5000,
      team_size: 1,
      existing_capabilities: ['content', 'product demos'],
      founder_network: 'moderate',
    },
    market_context: {
      competitors: asRecordArray(handoff.key_differentiators).map((item) => ({
        name: stringValue(item.differentiator, 'Alternative'),
        estimated_active_channels: ['linkedin', 'content'],
      })),
      market_trends: ['AI adoption', 'Workflow automation'],
      time_to_revenue_days: 60,
    },
    goals: {
      target_mqls_per_month: 10,
      target_signups_per_month: 20,
      timeline_weeks: 6,
    },
    source_handoff: handoff,
    technical_context: technical,
  };
}

export function buildGtmToStartupOpsHandoff(params: {
  ventureId: string;
  result: Record<string, unknown>;
  sourceHandoff: Record<string, unknown>;
}): Record<string, unknown> {
  const channels = asRecordArray(params.result.recommended_channels);
  const resources = asRecord(params.result.resource_requirements);
  const targetAudience = asRecord(params.sourceHandoff.target_audience);
  const product = asRecord(params.sourceHandoff.product);

  return {
    venture_id: params.ventureId,
    launch_date: new Date().toISOString().slice(0, 10),
    go_live_status: 'pre_launch',
    gtm_strategy_summary: channels
      .slice(0, 3)
      .map((channel) => `${stringValue(channel.channel)}: ${stringValue(channel.rationale)}`)
      .join(' | '),
    target_market: firstNonEmpty([targetAudience.primary_persona], 'Validated target market'),
    target_customer_profile: {
      segment: stringValue(targetAudience.primary_persona),
      pain_point: stringValue(targetAudience.psychographics),
    },
    launch_channels: channels.map((channel) => ({
      channel_name: normalizeLaunchChannel(stringValue(channel.channel)),
      description: stringValue(channel.rationale),
      launch_date: new Date().toISOString().slice(0, 10),
      budget_allocated: asRecord(channel.estimated_budget_range_usd).min ?? 0,
    })),
    analytics_configuration: {
      analytics_provider: 'custom',
      events_to_track: channels.flatMap((channel) =>
        stringArray(channel.success_metrics).map((metric) => ({
          event_name: metric,
          event_description: `Track ${metric} for ${stringValue(channel.channel)}`,
          tracking_method: 'dashboard',
        })),
      ),
      dashboard_url: stringValue(asRecord(params.sourceHandoff.technical_context).dashboard_url),
    },
    critical_metrics: channels.flatMap((channel) =>
      stringArray(channel.success_metrics).slice(0, 2).map((metric) => ({
        metric_name: metric,
        definition: `Core metric for ${stringValue(channel.channel)}`,
        target_value: 1,
        unit: 'count',
        tracking_interval: 'daily',
      })),
    ),
    hypothesis_being_validated: {
      hypothesis_statement: `Channels selected for ${stringValue(product.name)} can acquire ${firstNonEmpty([targetAudience.primary_persona], 'the target audience')} efficiently.`,
      success_criteria: stringArray(params.result.next_steps).slice(0, 3).map((step) => ({
        criterion: step,
        target_metric: 'execution',
        target_value: 1,
      })),
      validation_timeline_weeks: Math.max(2, Math.ceil(numberValue(resources.timeline_to_first_result_days, 30) / 7)),
      decision_logic: 'If launch channels produce repeatable traction signals, continue scaling the plan.',
    },
    customer_acquisition_strategy: {
      cac_target_usd: 500,
      ltv_estimate_usd: numberValue(product.price_point_usd, 12000),
      ltv_cac_ratio_target: 3,
      acquisition_channels_priority: channels.map((channel) => stringValue(channel.channel)).filter(Boolean),
    },
    activation_strategy: {
      target_activation_rate: 25,
      activation_definition: 'Users complete the first core workflow within the first session.',
      key_activation_actions: ['Account setup', 'First workflow completion'],
    },
    retention_strategy: {
      target_retention_rate: 75,
      churn_monitoring: ['Weekly active use', 'Drop-off after onboarding'],
      retention_initiatives: ['Lifecycle emails', 'Success review cadence'],
    },
    revenue_model: {
      revenue_streams: ['Subscription'],
      target_mrr_usd: 10000,
      payback_period_months: 12,
    },
    pre_launch_checklist: stringArray(params.result.next_steps).slice(0, 4).map((step) => ({
      item: step,
      status: 'not_started',
    })),
    created_at: new Date().toISOString(),
  };
}

function normalizeLaunchChannel(channel: string): string {
  const value = channel.toLowerCase();
  if (value.includes('content')) return 'content';
  if (value.includes('email')) return 'email';
  if (value.includes('partner')) return 'partnerships';
  if (value.includes('community')) return 'community';
  if (value.includes('sales')) return 'direct_sales';
  if (value.includes('social')) return 'paid_social';
  if (value.includes('search') || value.includes('google')) return 'paid_search';
  return 'organic';
}

export function buildStartupOpsAgentInputFromGtmToStartupOpsHandoff(handoff: Record<string, unknown>): Record<string, unknown> {
  const channels = asRecordArray(handoff.launch_channels);
  const analytics = asRecord(handoff.analytics_configuration);
  return {
    venture_id: stringValue(handoff.venture_id),
    ingestion_config: {
      sources: ['gtm', ...(stringValue(analytics.analytics_provider) ? ['mixpanel'] : []), 'stripe'],
      time_range: '7d',
      include_historical_comparison: true,
      force_refresh: false,
    },
    stage: 'early',
    source_handoff: handoff,
    launch_context: {
      channels,
      hypothesis: asRecord(handoff.hypothesis_being_validated),
    },
  };
}

export function buildStartupOpsToPortfolioHandoff(params: {
  ventureId: string;
  result: Record<string, unknown>;
  sourceHandoff: Record<string, unknown>;
}): Record<string, unknown> {
  const metrics = asRecord(params.result.metrics);
  const product = asRecord(metrics.product);
  const revenue = asRecord(metrics.revenue);
  const acquisition = asRecord(metrics.acquisition);
  const financial = asRecord(metrics.financial);
  const sourceHypothesis = asRecord(params.sourceHandoff.hypothesis_being_validated);

  const activation = numberValue(asRecord(product.activation_rate).value, 0);
  const retention = numberValue(asRecord(product.d30_retention).value, 0);
  const revenueHealth = numberValue(asRecord(revenue.mrr_growth_rate).value, 0);
  const productQuality = 100 - Math.min(100, numberValue(asRecord(product.onboarding_completion_rate).deviation_percent, 0));
  const financialHealth = Math.min(100, numberValue(asRecord(financial.runway_months).value, 0) * 8);
  const marketFit = Math.round((activation + retention) / 2);
  const overall = Math.round((activation + retention + revenueHealth + productQuality + financialHealth + marketFit) / 6);

  return {
    venture_id: params.ventureId,
    report_period: {
      start_date: stringValue(asRecord(params.result.time_range).start, new Date().toISOString().slice(0, 10)),
      end_date: stringValue(asRecord(params.result.time_range).end, new Date().toISOString().slice(0, 10)),
      report_frequency: 'weekly',
    },
    health_scores: {
      activation,
      retention,
      revenue: revenueHealth,
      product_quality: productQuality,
      financial: financialHealth,
      market_fit: marketFit,
    },
    overall_health_score: overall,
    metric_snapshots: {
      dau: numberValue(asRecord(product.dau).value, 0),
      wau: numberValue(asRecord(product.wau).value, 0),
      mau: numberValue(asRecord(product.mau).value, 0),
      signups: numberValue(asRecord(product.new_signups).value, 0),
      activation_rate: activation,
      mrr: numberValue(asRecord(revenue.mrr).value, 0),
      arr: numberValue(asRecord(revenue.arr).value, 0),
      cac: numberValue(asRecord(acquisition.cac).value, 0),
      ltv: numberValue(asRecord(acquisition.ltv).value, 0),
      ltv_cac_ratio: numberValue(asRecord(acquisition.ltv_cac_ratio).value, 0),
      retention_rate: retention,
      burn_rate: numberValue(asRecord(financial.burn_rate).value, 0),
      runway_months: numberValue(asRecord(financial.runway_months).value, 0),
    },
    hypothesis_validation_status: overall >= 70 ? 'validated' : overall >= 50 ? 'validating' : 'inconclusive',
    hypothesis_validation_detail: {
      hypothesis: stringValue(sourceHypothesis.hypothesis_statement),
      validation_confidence: Math.min(100, numberValue(params.result.completeness_percent, 0)),
      next_steps: 'Continue collecting operational signals from launch channels.',
    },
    recommendations: [
      {
        recommendation: overall >= 70 ? 'Maintain launch cadence and monitor channel efficiency.' : 'Address activation and retention gaps before scaling spend.',
        rationale: 'Derived from current operational scorecard.',
        priority: overall >= 70 ? 'medium' : 'high',
      },
    ],
    decision_required: overall < 50,
    suggested_decision: overall >= 80 ? 'scale' : overall >= 60 ? 'continue' : overall >= 45 ? 'iterate' : 'pause',
    suggested_decision_rationale: overall >= 80
      ? 'Core health metrics are strong enough to scale.'
      : overall >= 60
        ? 'Signals are healthy but still early.'
        : overall >= 45
          ? 'Metrics require refinement before scaling.'
          : 'Operational health is too weak for continued acceleration.',
    decision_confidence: Math.min(100, numberValue(params.result.completeness_percent, 0)),
    reported_at: stringValue(params.result.collected_at, new Date().toISOString()),
    report_generated_by_agent: 'metrics-ingestion-agent',
  };
}

export function buildPortfolioAgentInputFromStartupOpsToPortfolioHandoff(handoff: Record<string, unknown>, ventureName?: string): Record<string, unknown> {
  const metrics = asRecord(handoff.metric_snapshots);
  const healthScores = asRecord(handoff.health_scores);
  return {
    review_cycle_id: `cycle-${Date.now()}`,
    review_timestamp: new Date().toISOString(),
    ventures: [
      {
        venture_id: stringValue(handoff.venture_id),
        name: ventureName ?? `venture-${stringValue(handoff.venture_id).slice(0, 8)}`,
        status: 'active',
        weeks_since_launch: 4,
        health_report: {
          report_date: stringValue(handoff.reported_at, new Date().toISOString().slice(0, 10)).slice(0, 10),
          metrics: {
            traction: {
              mrr: numberValue(metrics.mrr, 0),
              arr: numberValue(metrics.arr, 0),
              monthly_growth_rate: numberValue(metrics.activation_rate, 0) / 100,
              active_users: numberValue(metrics.mau, 0),
              user_growth_rate: numberValue(metrics.retention_rate, 0) / 100,
              conversion_rate: numberValue(metrics.activation_rate, 0) / 100,
              nps: numberValue(healthScores.market_fit, 0),
            },
            financial: {
              runway_months: numberValue(metrics.runway_months, 0),
              monthly_burn_rate: numberValue(metrics.burn_rate, 0),
              cash_position: 0,
              cac: numberValue(metrics.cac, 0),
              ltv: numberValue(metrics.ltv, 0),
              cac_ltv_ratio: numberValue(metrics.ltv_cac_ratio, 0),
            },
            team: {
              headcount: 1,
              headcount_planned: 2,
              key_hires_filled: 0,
              key_hires_open: 0,
              team_velocity: numberValue(handoff.overall_health_score, 0) >= 70 ? 'accelerating' : 'steady',
            },
            market: {
              customer_feedback: stringValue(handoff.suggested_decision_rationale),
            },
          },
        },
        context: {
          stage: 'early',
          flags: stringArray(asRecord(handoff).escalation_flags),
        },
      },
    ],
    portfolio_context: {
      total_ventures: 1,
      active_ventures: 1,
      dry_powder_mm: 0,
    },
    source_handoff: handoff,
  };
}

export function buildPortfolioToBruceCoreHandoff(params: {
  ventureId: string;
  result: Record<string, unknown>;
  sourceHandoff: Record<string, unknown>;
}): Record<string, unknown> {
  const snapshot = asRecord(params.result.portfolio_snapshot);
  const ranked = asRecordArray(snapshot.ventures_ranked);
  const top = ranked.find((entry) => stringValue(entry.venture_id) === params.ventureId) ?? ranked[0] ?? {};
  const sourceMetrics = asRecord(params.sourceHandoff.metric_snapshots);
  const score = numberValue(top.health_score, numberValue(params.sourceHandoff.overall_health_score, 0));

  const decision =
    score >= 80 ? 'scale' : score >= 60 ? 'continue' : score >= 45 ? 'iterate' : score >= 30 ? 'pause' : 'kill';

  return {
    venture_id: params.ventureId,
    review_date: stringValue(snapshot.review_timestamp, new Date().toISOString()),
    venture_status: decision === 'scale' ? 'scaling' : decision === 'continue' ? 'operating' : decision === 'iterate' ? 'iterating' : decision === 'pause' ? 'paused' : 'killed',
    decision,
    decision_type:
      decision === 'scale'
        ? 'increase_investment'
        : decision === 'iterate'
          ? 'shift_hypothesis'
          : decision === 'pause'
            ? 'temporary_pause'
            : decision === 'kill'
              ? 'permanent_termination'
              : 'continue_current_path',
    rationale: firstNonEmpty([
      stringValue(snapshot.analysis_notes),
      stringValue(params.sourceHandoff.suggested_decision_rationale),
      'Decision derived from portfolio health analysis.',
    ]),
    supporting_health_scores: asRecord(params.sourceHandoff.health_scores),
    supporting_metrics: {
      dau: numberValue(sourceMetrics.dau, 0),
      mau: numberValue(sourceMetrics.mau, 0),
      mrr: numberValue(sourceMetrics.mrr, 0),
      arr: numberValue(sourceMetrics.arr, 0),
      retention_rate: numberValue(sourceMetrics.retention_rate, 0),
      churn_rate: numberValue(sourceMetrics.churn_rate, 0),
      burn_rate: numberValue(sourceMetrics.burn_rate, 0),
      runway_months: numberValue(sourceMetrics.runway_months, 0),
      cac: numberValue(sourceMetrics.cac, 0),
      ltv: numberValue(sourceMetrics.ltv, 0),
      ltv_cac_ratio: numberValue(sourceMetrics.ltv_cac_ratio, 0),
    },
    confidence_score: Math.min(100, numberValue(top.confidence, numberValue(snapshot.analyst_confidence, 0))),
    trend_analysis: {
      user_growth_trend: trendToBruceTrend(stringValue(top.trend)),
      retention_trend: numberValue(sourceMetrics.retention_rate, 0) >= 70 ? 'improving' : 'stable',
      revenue_trend: numberValue(sourceMetrics.mrr, 0) > 0 ? 'growing' : 'flat',
      financial_runway_trend: numberValue(sourceMetrics.runway_months, 0) >= 9 ? 'stable' : 'worsening',
    },
    risk_flags: asRecordArray(snapshot.outliers)
      .filter((entry) => stringValue(entry.venture_id) === params.ventureId || !entry.venture_id)
      .map((entry) => ({
        risk: stringValue(entry.description),
        severity: stringValue(entry.priority, 'medium'),
        mitigation: stringValue(entry.recommended_action),
      })),
    supporting_data_refs: [stringValue(snapshot.review_cycle_id)].filter(Boolean),
    decision_ready: true,
    escalation_flags: decision === 'kill' || decision === 'pause' ? ['human_review_recommended'] : [],
    prepared_by: 'portfolio-analyst',
    created_at: new Date().toISOString(),
  };
}

function trendToBruceTrend(trend: string): 'accelerating' | 'steady' | 'decelerating' | 'contracting' {
  if (trend === 'improving') return 'accelerating';
  if (trend === 'declining') return 'decelerating';
  return 'steady';
}

export function buildBruceMemoryInputFromPortfolioDecisionHandoff(handoff: Record<string, unknown>): Record<string, unknown> {
  return {
    learning_record: {
      venture_id: stringValue(handoff.venture_id),
      venture_name: `venture-${stringValue(handoff.venture_id).slice(0, 8)}`,
      source_module: 'portfolio',
      learning_type: stringValue(handoff.decision) === 'kill' ? 'kill_postmortem' : 'product_decision',
      outcome:
        stringValue(handoff.decision) === 'scale'
          ? 'success'
          : stringValue(handoff.decision) === 'continue'
            ? 'partial_success'
            : 'inconclusive',
      narrative: `${stringValue(handoff.decision).toUpperCase()}: ${stringValue(handoff.rationale)}`,
      quantitative_data: {
        metric_name: 'confidence_score',
        value: numberValue(handoff.confidence_score, 0),
      },
      confidence: numberValue(handoff.confidence_score, 0),
      applicability_tags: [
        stringValue(handoff.venture_status),
        stringValue(handoff.decision),
      ].filter(Boolean),
      stage: 'early',
      timestamp: stringValue(handoff.created_at, new Date().toISOString()),
    },
    source_handoff: handoff,
  };
}
