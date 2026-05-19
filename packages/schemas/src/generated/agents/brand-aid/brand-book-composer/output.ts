/* eslint-disable */
// auto-generated from modules/brand-aid/agents/brand-book-composer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BrandBookComposerOutputSchema = z.object({
  "brand_book_pdf": z.object({
  "file_path": z.string().nullish(),
  "file_size_kb": z.number().nullish(),
  "page_count": z.number().int().nullish(),
  "sections": z.array(z.string()).nullish()
}),
  "brand_book_json": z.object({
  "metadata": z.object({}).nullish(),
  "strategy": z.object({}).nullish(),
  "visual_system": z.object({}).nullish(),
  "logo": z.object({}).nullish(),
  "naming": z.object({}).nullish(),
  "moodboard": z.object({}).nullish(),
  "logo_studies": z.array(z.object({})).nullish(),
  "approved_logo": z.object({}).nullish(),
  "brand_imagery": z.array(z.object({})).nullish(),
  "usage_guidelines": z.object({}).nullish()
}),
  "design_tokens_json": z.object({}).nullish(),
  "design_tokens_css": z.string().nullish(),
  "design_tokens_figma": z.string().nullish(),
  "export_manifest": z.object({
  "timestamp": z.string().nullish(),
  "brand_name": z.string().nullish(),
  "files": z.array(z.object({
  "name": z.string().nullish(),
  "format": z.string().nullish(),
  "path": z.string().nullish(),
  "size_kb": z.number().nullish()
})).nullish(),
  "critique_score": z.number().int().nullish()
}),
  "asset_manifest": z.array(z.object({
  "id": z.string().nullish(),
  "type": z.string().nullish(),
  "label": z.string().nullish(),
  "url": z.string().nullish(),
  "storage_key": z.string().nullish(),
  "mime_type": z.string().nullish()
})).nullish()
});
export type BrandBookComposerOutput = z.infer<typeof BrandBookComposerOutputSchema>;
