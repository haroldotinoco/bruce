/* eslint-disable */
// auto-generated from modules/portfolio/agents/portfolio-reporter/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PortfolioReporterInputSchema = z.object({
  "portfolio_snapshot": z.object({}),
  "risk_assessment": z.object({}),
  "allocation_decisions": z.object({}),
  "governance_decisions": z.object({}),
  "report_config": z.object({
  "audience": z.enum(["operators", "investors", "board", "team"]).nullish(),
  "include_appendices": z.boolean().nullish(),
  "focus_areas": z.array(z.string()).nullish(),
  "previous_report": z.object({}).nullish()
}).nullish()
});
export type PortfolioReporterInput = z.infer<typeof PortfolioReporterInputSchema>;
