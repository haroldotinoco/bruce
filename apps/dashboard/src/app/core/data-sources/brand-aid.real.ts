import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../http/api.service';
import type {
  BrandMoodboardCluster,
  BrandMoodboardReference,
  BrandPackage,
  IBrandAidDataSource,
} from './tokens';

interface RawAsset {
  label?: string;
  url?: string;
  source_domain?: string;
}

interface RawMoodboardRef {
  id?: string;
  title?: string;
  image_url?: string;
  thumbnail_url?: string;
  persisted_url?: string;
  link?: string;
  domain?: string;
  source?: string;
}

interface RawPackage {
  id: string;
  venture_id?: string;
  venture_name?: string;
  status?: string;
  updated_at?: string;
  names?: string[];
  palette?: string[];
  moodboard?: {
    clusters?: Array<{
      label?: string;
      rationale?: string;
      references?: RawMoodboardRef[];
    }>;
    limitations?: string;
  };
  logo_studies?: RawAsset[];
  approved_logo?: RawAsset;
  brand_imagery?: RawAsset[];
  export_manifest?: { files?: Array<{ name?: string; path?: string; format?: string }> };
  logo_count?: number;
  score?: number;
  error?: string;
  stage_outputs?: Record<string, unknown>;
}

function normalizeStatus(value: string | undefined): BrandPackage['status'] {
  if (value === 'ready' || value === 'failed' || value === 'archived') return value;
  return 'generating';
}

function refDisplayUrl(ref: RawMoodboardRef): string {
  return (ref.persisted_url ?? ref.image_url ?? ref.thumbnail_url ?? '').trim();
}

function toMoodboardRef(ref: RawMoodboardRef): BrandMoodboardReference {
  return {
    id: ref.id ?? 'ref',
    title: ref.title ?? 'Reference',
    image_url: refDisplayUrl(ref),
    thumbnail_url: ref.thumbnail_url,
    link: ref.link,
    domain: ref.domain,
    source: ref.source,
    persisted_url: ref.persisted_url,
  };
}

function toMoodboardClusters(raw: RawPackage['moodboard']): BrandMoodboardCluster[] {
  return (raw?.clusters ?? []).map((cluster) => ({
    label: cluster.label ?? 'Mood',
    rationale: cluster.rationale ?? '',
    references: (cluster.references ?? []).map(toMoodboardRef).filter((r) => r.image_url),
  }));
}

function toPackage(raw: RawPackage): BrandPackage {
  const clusters = toMoodboardClusters(raw.moodboard);
  const moodboard = clusters.flatMap((cluster) => {
    if (!cluster.references.length) {
      return [{ label: cluster.label, color: '#475569' }];
    }
    return cluster.references.map((ref) => ({
      label: cluster.label,
      color: '#475569',
      image_url: ref.image_url,
      source_domain: ref.domain,
      link: ref.link,
    }));
  });

  const exportLinks = (raw.export_manifest?.files ?? [])
    .map((file) => {
      const url = file.path;
      if (!url) return null;
      return { label: file.name ?? file.format ?? 'Export', url };
    })
    .filter((item): item is { label: string; url: string } => item != null);

  return {
    id: raw.id,
    venture_id: raw.venture_id,
    venture_name: raw.venture_name ?? raw.id,
    status: normalizeStatus(raw.status),
    updated_at: raw.updated_at ?? new Date().toISOString(),
    names: (raw.names ?? []).slice(0, 5),
    palette: (raw.palette ?? []).slice(0, 6),
    moodboard,
    moodboard_clusters: clusters,
    moodboard_limitations: raw.moodboard?.limitations,
    logo_studies: (raw.logo_studies ?? []).map((asset, index) => ({
      label: asset.label ?? `Logo study ${index + 1}`,
      url: asset.url,
    })),
    approved_logo: raw.approved_logo
      ? { label: raw.approved_logo.label ?? 'Approved logo', url: raw.approved_logo.url }
      : undefined,
    brand_imagery: (raw.brand_imagery ?? []).map((asset, index) => ({
      label: asset.label ?? `Brand image ${index + 1}`,
      url: asset.url,
    })),
    export_links: exportLinks,
    logos: raw.logo_count ?? (raw.logo_studies?.length ?? 0) + (raw.approved_logo ? 1 : 0),
    score: raw.score ?? 0,
    error: raw.error,
    stage_outputs: raw.stage_outputs,
  };
}

function toAsset(asset: RawAsset, fallback: string): { label: string; url?: string } {
  return { label: asset.label ?? fallback, url: asset.url };
}

@Injectable({ providedIn: 'root' })
export class BrandAidRealDataSource implements IBrandAidDataSource {
  private readonly api = inject(ApiService);

  listPackages(): Observable<BrandPackage[]> {
    return this.api.get<{ packages?: RawPackage[]; items?: RawPackage[] }>('brand-aid', '/packages').pipe(
      map((response) => (response.packages ?? response.items ?? []).map(toPackage)),
      catchError(() => of([] as BrandPackage[])),
    );
  }

  getPackage(id: string): Observable<BrandPackage> {
    return this.api.get<RawPackage>('brand-aid', `/packages/${encodeURIComponent(id)}`).pipe(map(toPackage));
  }
}
