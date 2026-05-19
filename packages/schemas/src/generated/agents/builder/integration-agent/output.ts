/* eslint-disable */
// auto-generated from modules/builder/agents/integration-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const IntegrationAgentOutputSchema = z.object({
  "integrations": z.array(z.object({
  "integration_id": z.string().nullish(),
  "name": z.string(),
  "type": z.enum(["payment", "analytics", "communication", "storage", "auth", "monitoring", "data-sync", "sdk", "api", "webhook"]),
  "description": z.string().nullish(),
  "priority": z.enum(["critical", "high", "medium", "low"]),
  "auth_method": z.enum(["api_key", "oauth2", "sdk", "jwt", "webhook_signature", "basic_auth", "bearer_token", "custom"]),
  "endpoints": z.array(z.object({
  "endpoint_name": z.string().nullish(),
  "method": z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).nullish(),
  "url_pattern": z.string().nullish(),
  "description": z.string().nullish(),
  "request_schema": z.object({}).nullish(),
  "response_schema": z.object({}).nullish()
})).nullish(),
  "error_handling": z.object({
  "retry_strategy": z.enum(["exponential_backoff", "linear_backoff", "fixed_delay", "none"]).nullish(),
  "max_retries": z.number().int().nullish(),
  "timeout_seconds": z.number().int().nullish(),
  "fallback_mechanism": z.string().nullish(),
  "error_codes_handled": z.array(z.string()).nullish()
}).nullish(),
  "rate_limits": z.object({
  "requests_per_minute": z.number().int().nullish(),
  "requests_per_hour": z.number().int().nullish(),
  "requests_per_day": z.number().int().nullish(),
  "burst_limit": z.number().int().nullish(),
  "backoff_strategy": z.string().nullish(),
  "notes": z.string().nullish()
}).nullish(),
  "estimated_setup_hours": z.number().nullish(),
  "cost_estimate": z.object({
  "monthly_cost": z.number().nullish(),
  "setup_cost": z.number().nullish(),
  "free_tier_available": z.boolean().nullish(),
  "free_tier_limits": z.string().nullish(),
  "paid_tier_start": z.string().nullish(),
  "cost_scaling_notes": z.string().nullish()
}).nullish(),
  "auth_token_rotation": z.object({
  "rotation_required": z.boolean().nullish(),
  "rotation_frequency_days": z.number().int().nullish(),
  "rotation_mechanism": z.string().nullish(),
  "secret_storage": z.enum(["environment_variables", "secrets_manager", "vault", "kms"]).nullish(),
  "credential_expiration": z.string().nullish()
}).nullish(),
  "data_handling": z.object({
  "stores_pii": z.boolean().nullish(),
  "pii_types": z.array(z.string()).nullish(),
  "encryption_required": z.boolean().nullish(),
  "encryption_type": z.string().nullish(),
  "compliance_frameworks": z.array(z.string()).nullish(),
  "data_retention_policy": z.string().nullish()
}).nullish(),
  "implementation_notes": z.string().nullish(),
  "risks": z.array(z.object({
  "risk": z.string().nullish(),
  "severity": z.enum(["critical", "high", "medium", "low"]).nullish(),
  "mitigation": z.string().nullish()
})).nullish(),
  "alternatives": z.array(z.object({
  "name": z.string().nullish(),
  "reason_not_chosen": z.string().nullish()
})).nullish()
})),
  "summary": z.object({
  "total_integrations": z.number().int().nullish(),
  "total_setup_hours": z.number().nullish(),
  "total_monthly_cost": z.number().nullish(),
  "free_tier_integrations": z.number().int().nullish(),
  "paid_integrations": z.number().int().nullish(),
  "critical_integrations": z.number().int().nullish(),
  "high_risk_integrations": z.number().int().nullish(),
  "implementation_phases": z.array(z.object({
  "phase": z.number().int().nullish(),
  "integrations": z.array(z.string()).nullish(),
  "estimated_weeks": z.number().nullish(),
  "dependencies": z.array(z.string()).nullish()
})).nullish(),
  "cost_optimization_recommendations": z.array(z.string()).nullish(),
  "compliance_notes": z.string().nullish()
}),
  "dependencies": z.object({
  "integration_order": z.array(z.string()).nullish(),
  "blocking_dependencies": z.array(z.string()).nullish(),
  "parallel_implementable": z.array(z.string()).nullish()
}).nullish(),
  "implementation_timeline": z.string().nullish(),
  "created_at": z.string().nullish()
});
export type IntegrationAgentOutput = z.infer<typeof IntegrationAgentOutputSchema>;
