/* eslint-disable */
// auto-generated from modules/add-venture/agents/value-proposition-designer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ValuePropositionDesignerOutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(3),
  "volume_title": z.string(),
  "core_value_proposition": z.string(),
  "differentiation_strategy": z.array(z.object({
  "differentiator": z.string().nullish(),
  "why_matters_to_customer": z.string().nullish(),
  "defensibility_rationale": z.string().nullish(),
  "competitive_comparison": z.string().nullish()
})),
  "value_proposition_canvas": z.object({
  "customer_pains": z.array(z.string()).nullish(),
  "customer_gains": z.array(z.string()).nullish(),
  "pain_relievers": z.array(z.object({
  "pain": z.string().nullish(),
  "how_we_relieve": z.string().nullish()
})).nullish(),
  "gain_creators": z.array(z.object({
  "gain": z.string().nullish(),
  "how_we_create": z.string().nullish()
})).nullish()
}),
  "positioning_statement": z.object({
  "for_target": z.string().nullish(),
  "product_name": z.string().nullish(),
  "category": z.string().nullish(),
  "key_benefit": z.string().nullish(),
  "primary_differentiator": z.string().nullish(),
  "proof_point": z.string().nullish()
}),
  "unique_differentiators": z.array(z.string()).nullish(),
  "comparison_vs_alternatives": z.array(z.object({
  "alternative": z.string().nullish(),
  "their_strength": z.string().nullish(),
  "our_advantage": z.string().nullish()
})).nullish(),
  "assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "key_sections": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type ValuePropositionDesignerOutput = z.infer<typeof ValuePropositionDesignerOutputSchema>;
