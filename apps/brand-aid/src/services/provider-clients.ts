import { getStorageClient } from '@bruce/storage';
import { logger } from '@bruce/logger';

export interface StoredAsset {
  id: string;
  type: 'moodboard_reference' | 'logo_study' | 'brand_imagery' | 'logo_svg' | 'brandbook';
  label: string;
  url?: string;
  storage_key?: string;
  source_url?: string;
  source_domain?: string;
  mime_type?: string;
  metadata?: Record<string, unknown>;
}

export interface SerperImageReference {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url?: string;
  source?: string;
  domain?: string;
  link?: string;
  storage_key?: string;
  persisted_url?: string;
}

export function moodboardReferenceDisplayUrl(ref: SerperImageReference): string {
  return stringValue(ref.persisted_url, stringValue(ref.image_url, stringValue(ref.thumbnail_url)));
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function safeDomain(input: string): string | undefined {
  try {
    return new URL(input).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

async function downloadBytes(url: string): Promise<{ bytes: Buffer; contentType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`asset download failed ${response.status}: ${await response.text()}`);
  }
  const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
  return { bytes: Buffer.from(await response.arrayBuffer()), contentType };
}

export class SerperImageClient {
  private readonly apiKey = process.env.SERPER_API_KEY;
  private readonly apiUrl = process.env.SERPER_IMAGES_API_URL ?? 'https://google.serper.dev/images';

  async search(query: string, limit = 12): Promise<{
    references: SerperImageReference[];
    provider_metadata: Record<string, unknown>;
    limitations?: string;
  }> {
    if (!this.apiKey) {
      return {
        references: [],
        provider_metadata: { provider: 'serper', available: false, reason: 'SERPER_API_KEY missing' },
        limitations: 'Serper image search was unavailable because SERPER_API_KEY is not configured.',
      };
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: limit }),
    });

    if (!response.ok) {
      return {
        references: [],
        provider_metadata: { provider: 'serper', available: false, status: response.status },
        limitations: `Serper image search failed with HTTP ${response.status}.`,
      };
    }

    const payload = (await response.json()) as { images?: unknown[] };
    const seen = new Set<string>();
    const references: SerperImageReference[] = [];

    for (const item of Array.isArray(payload.images) ? payload.images : []) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      const imageUrl = stringValue(row.imageUrl);
      if (!imageUrl) continue;
      const link = stringValue(row.link);
      const domain = stringValue(row.domain, safeDomain(link) ?? safeDomain(imageUrl) ?? 'source');
      const dedupeKey = `${imageUrl}|${link}|${domain}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      references.push({
        id: `serper_${references.length + 1}`,
        title: stringValue(row.title, `Reference ${references.length + 1}`),
        image_url: imageUrl,
        thumbnail_url: stringValue(row.thumbnailUrl) || undefined,
        source: stringValue(row.source) || undefined,
        domain,
        link: link || undefined,
      });
      if (references.length >= limit) break;
    }

    return {
      references,
      provider_metadata: { provider: 'serper', available: true, result_count: references.length },
    };
  }
}

/** Best-effort upload of Serper moodboard refs to object storage; keeps original URLs on failure. */
export async function persistMoodboardReferences(params: {
  accountId: string;
  ventureId: string;
  references: SerperImageReference[];
}): Promise<SerperImageReference[]> {
  if (params.references.length === 0) return params.references;

  const storage = getStorageClient();
  const ttl = Number(process.env.BRAND_AID_ASSET_URL_TTL_SECONDS ?? 3600);
  const persisted: SerperImageReference[] = [];

  for (const ref of params.references) {
    const sourceUrl = stringValue(ref.image_url, stringValue(ref.thumbnail_url));
    if (!sourceUrl) {
      persisted.push(ref);
      continue;
    }
    try {
      const { bytes, contentType } = await downloadBytes(sourceUrl);
      const ext = contentType.includes('jpeg')
        ? 'jpg'
        : contentType.includes('webp')
          ? 'webp'
          : 'png';
      const filename = `moodboard-${ref.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
      const key = await storage.upload(
        'brand-aid',
        params.accountId,
        params.ventureId,
        filename,
        bytes,
        contentType,
      );
      const signedUrl = await storage.getSignedUrl(key, ttl);
      persisted.push({
        ...ref,
        storage_key: key,
        persisted_url: signedUrl,
      });
    } catch (error) {
      logger.warn(
        { error: (error as Error).message, refId: ref.id, ventureId: params.ventureId },
        'brand-aid: moodboard reference storage failed; keeping Serper URL',
      );
      persisted.push(ref);
    }
  }

  return persisted;
}

export async function refreshMoodboardReferenceUrls(
  references: SerperImageReference[],
): Promise<SerperImageReference[]> {
  const ttl = Number(process.env.BRAND_AID_ASSET_URL_TTL_SECONDS ?? 3600);
  return Promise.all(
    references.map(async (ref) => {
      if (!ref.storage_key) return ref;
      try {
        const signedUrl = await getStorageClient().getSignedUrl(ref.storage_key, ttl);
        return { ...ref, persisted_url: signedUrl };
      } catch {
        return ref;
      }
    }),
  );
}

export class IdeogramClient {
  private readonly apiKey = process.env.IDEOGRAM_API_KEY;
  private readonly apiUrl =
    process.env.IDEOGRAM_API_URL ?? 'https://api.ideogram.ai/v1/ideogram-v3/generate';
  private readonly renderingSpeed = process.env.IDEOGRAM_DEFAULT_RENDERING_SPEED ?? 'DEFAULT';
  private readonly fallbackEnabled = process.env.BRAND_AID_PROVIDER_FALLBACK !== 'false';

  async generateAndStore(params: {
    accountId: string;
    ventureId: string;
    prompt: string;
    count: number;
    assetType: 'logo_study' | 'brand_imagery';
    transparentBackground?: boolean;
  }): Promise<{ assets: StoredAsset[]; provider_metadata: Record<string, unknown> }> {
    if (!this.apiKey) {
      if (!this.fallbackEnabled) throw new Error('IDEOGRAM_API_KEY missing');
      return {
        assets: this.placeholderAssets(params),
        provider_metadata: { provider: 'ideogram', available: false, reason: 'IDEOGRAM_API_KEY missing' },
      };
    }

    const body = new FormData();
    body.set('prompt', params.prompt);
    body.set('num_images', String(params.count));
    body.set('rendering_speed', this.renderingSpeed);
    if (params.transparentBackground) body.set('transparent_background', 'true');

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Api-Key': this.apiKey },
      body,
    });

    if (response.status === 429) throw new Error('Ideogram rate limit exceeded');
    if (!response.ok) throw new Error(`Ideogram generation failed ${response.status}: ${await response.text()}`);

    const payload = (await response.json()) as { data?: Array<{ url?: string; prompt?: string }> };
    const rows = Array.isArray(payload.data) ? payload.data : [];
    const storage = getStorageClient();
    const assets: StoredAsset[] = [];

    for (let i = 0; i < rows.length; i++) {
      const url = stringValue(rows[i]?.url);
      if (!url) continue;
      const { bytes, contentType } = await downloadBytes(url);
      const ext = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
      const filename = `${params.assetType}-${i + 1}.${ext}`;
      const baseAsset: StoredAsset = {
        id: `${params.assetType}_${i + 1}`,
        type: params.assetType,
        label: params.assetType === 'logo_study' ? `Logo study ${i + 1}` : `Brand image ${i + 1}`,
        source_url: url,
        mime_type: contentType,
        metadata: { prompt: rows[i]?.prompt ?? params.prompt },
      };

      try {
        const key = await storage.upload(
          'brand-aid',
          params.accountId,
          params.ventureId,
          filename,
          bytes,
          contentType,
        );
        const signedUrl = await storage.getSignedUrl(
          key,
          Number(process.env.BRAND_AID_ASSET_URL_TTL_SECONDS ?? 3600),
        );
        assets.push({ ...baseAsset, storage_key: key, url: signedUrl });
      } catch (uploadError) {
        logger.warn(
          { error: uploadError, url, ventureId: params.ventureId, assetType: params.assetType },
          'Ideogram asset storage failed; keeping provider URL',
        );
        assets.push({ ...baseAsset, url });
      }
    }

    if (assets.length === 0) {
      throw new Error('Ideogram returned no downloadable images');
    }

    return {
      assets,
      provider_metadata: {
        provider: 'ideogram',
        available: true,
        asset_count: assets.length,
        persisted_count: assets.filter((asset) => asset.storage_key).length,
      },
    };
  }

  private placeholderAssets(params: {
    count: number;
    assetType: 'logo_study' | 'brand_imagery';
    prompt: string;
  }): StoredAsset[] {
    const encodedPrompt = encodeURIComponent(params.prompt.slice(0, 90));
    return Array.from({ length: params.count }).map((_, index) => ({
      id: `${params.assetType}_${index + 1}`,
      type: params.assetType,
      label: params.assetType === 'logo_study' ? `Logo study ${index + 1}` : `Brand image ${index + 1}`,
      url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420'%3E%3Crect width='640' height='420' fill='%23f3f4f6'/%3E%3Ctext x='40' y='210' font-family='Inter,Arial' font-size='24' fill='%23111827'%3E${encodedPrompt}%3C/text%3E%3C/svg%3E`,
      metadata: { provider_fallback: true },
    }));
  }
}

export async function storeSvgAsset(params: {
  accountId: string;
  ventureId: string;
  filename: string;
  svg: string;
  label: string;
}): Promise<StoredAsset> {
  try {
    const storage = getStorageClient();
    const key = await storage.upload(
      'brand-aid',
      params.accountId,
      params.ventureId,
      params.filename,
      params.svg,
      'image/svg+xml',
    );
    const signedUrl = await storage.getSignedUrl(key, Number(process.env.BRAND_AID_ASSET_URL_TTL_SECONDS ?? 3600));
    return {
      id: params.filename.replace(/\.svg$/, ''),
      type: 'logo_svg',
      label: params.label,
      storage_key: key,
      url: signedUrl,
      mime_type: 'image/svg+xml',
    };
  } catch (error) {
    logger.warn({ error }, 'brand-aid: SVG storage upload failed; using inline asset URL');
    return {
      id: params.filename.replace(/\.svg$/, ''),
      type: 'logo_svg',
      label: params.label,
      url: `data:image/svg+xml,${encodeURIComponent(params.svg)}`,
      mime_type: 'image/svg+xml',
      metadata: { storage_error: (error as Error).message },
    };
  }
}
