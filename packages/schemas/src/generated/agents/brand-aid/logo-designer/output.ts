/* eslint-disable */
// auto-generated from modules/brand-aid/agents/logo-designer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const LogoDesignerOutputSchema = z.object({
  "concepts": z.array(z.object({
  "concept_name": z.string().nullish(),
  "visual_metaphor": z.string().nullish(),
  "rationale": z.string().nullish(),
  "design_approach": z.string().nullish(),
  "strengths": z.array(z.string()).nullish(),
  "considerations": z.array(z.string()).nullish()
})),
  "recommended_concept": z.object({
  "concept_name": z.string().nullish(),
  "rationale": z.string().nullish(),
  "design_decisions": z.string().nullish(),
  "strategic_fit": z.string().nullish()
}),
  "svg_output": z.object({
  "horizontal_lockup": z.string().nullish(),
  "vertical_lockup": z.string().nullish(),
  "icon_only": z.string().nullish(),
  "icon_with_text": z.string().nullish()
}),
  "color_variations": z.object({
  "full_color": z.string().nullish(),
  "monochrome": z.string().nullish(),
  "white": z.string().nullish(),
  "dark": z.string().nullish()
}).nullish(),
  "scale_testing_report": z.string().nullish(),
  "file_references": z.object({
  "svg_folder": z.string().nullish(),
  "file_sizes": z.object({}).nullish()
}).nullish(),
  "exploratory_studies": z.array(z.object({
  "id": z.string().nullish(),
  "label": z.string().nullish(),
  "url": z.string().nullish(),
  "storage_key": z.string().nullish()
})).nullish(),
  "approved_logo": z.object({
  "id": z.string().nullish(),
  "label": z.string().nullish(),
  "url": z.string().nullish(),
  "storage_key": z.string().nullish(),
  "mime_type": z.string().nullish()
}).nullish()
});
export type LogoDesignerOutput = z.infer<typeof LogoDesignerOutputSchema>;
