/* eslint-disable */
// auto-generated from modules/builder/agents/security-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const SecurityAgentOutputSchema = z.object({
  "vulnerabilities": z.array(z.object({
  "id": z.string(),
  "title": z.string(),
  "severity": z.enum(["critical", "high", "medium", "low"]),
  "description": z.string(),
  "affected_component": z.string().nullish(),
  "recommendation": z.string().nullish(),
  "cwe_id": z.string().nullish()
})).nullish(),
  "overall_security_score": z.number(),
  "critical_count": z.number().int().nullish(),
  "high_count": z.number().int().nullish(),
  "medium_count": z.number().int().nullish(),
  "low_count": z.number().int().nullish(),
  "launch_blocked": z.boolean(),
  "security_report_ref": z.string().nullish(),
  "owasp_compliance": z.object({
  "a01_broken_access_control": z.string().nullish(),
  "a02_cryptographic_failures": z.string().nullish(),
  "a03_injection": z.string().nullish(),
  "a04_insecure_design": z.string().nullish(),
  "a05_security_misconfiguration": z.string().nullish(),
  "a06_vulnerable_outdated_components": z.string().nullish(),
  "a07_authentication_failures": z.string().nullish(),
  "a08_software_data_integrity_failures": z.string().nullish(),
  "a09_logging_monitoring_failures": z.string().nullish(),
  "a10_ssrf": z.string().nullish()
}).nullish()
});
export type SecurityAgentOutput = z.infer<typeof SecurityAgentOutputSchema>;
