import { getRedisClient } from '@bruce/redis';
import { readDeliverable, writeDeliverable } from '@bruce/project-store';
import type { StoredAsset, SerperImageReference } from './provider-clients.js';

export type BrandPackageStatus = 'generating' | 'ready' | 'failed' | 'archived';

export interface BrandAidPackage {
  id: string;
  account_id: string;
  venture_id: string;
  venture_name: string;
  status: BrandPackageStatus;
  updated_at: string;
  created_at: string;
  current_step?: string;
  names: string[];
  palette: string[];
  score: number;
  logo_count: number;
  moodboard: {
    clusters: Array<{ label: string; rationale: string; references: SerperImageReference[] }>;
    limitations?: string;
  };
  logo_studies: StoredAsset[];
  approved_logo?: StoredAsset;
  brand_imagery: StoredAsset[];
  brandbook?: unknown;
  export_manifest?: unknown;
  critique?: unknown;
  critique_iterations: Array<{ iteration: number; score: number; passed: boolean; focus: string }>;
  provider_metadata: Record<string, unknown>;
  asset_manifest: StoredAsset[];
  stage_outputs: Record<string, unknown>;
  project_nickname?: string;
  error?: string;
}

const MODULE = 'brand-aid';
const RESOURCE = 'packages';
const FIELD = 'package';
const INDEX_ID = 'index';
const TTL_SECONDS = Number(process.env.BRAND_AID_PACKAGE_TTL_SECONDS ?? 60 * 60 * 24 * 30);

export function packageIdFor(ventureId: string): string {
  return `brand_${ventureId}`;
}

export async function saveBrandPackage(pkg: BrandAidPackage): Promise<void> {
  const redis = getRedisClient();
  await redis.set(pkg.account_id, MODULE, RESOURCE, pkg.id, FIELD, pkg, TTL_SECONDS);
  const current = (await redis.get<string[]>(pkg.account_id, MODULE, RESOURCE, INDEX_ID, 'ids')) ?? [];
  const next = [pkg.id, ...current.filter((id) => id !== pkg.id)].slice(0, 100);
  await redis.set(pkg.account_id, MODULE, RESOURCE, INDEX_ID, 'ids', next, TTL_SECONDS);
  if (pkg.project_nickname) {
    await writeDeliverable(pkg.project_nickname, MODULE, 'package', 'manifest.json', pkg);
  }
}

export async function getBrandPackage(accountId: string, id: string): Promise<BrandAidPackage | null> {
  return getRedisClient().get<BrandAidPackage>(accountId, MODULE, RESOURCE, id, FIELD);
}

export async function listBrandPackages(accountId: string): Promise<BrandAidPackage[]> {
  const redis = getRedisClient();
  const ids = (await redis.get<string[]>(accountId, MODULE, RESOURCE, INDEX_ID, 'ids')) ?? [];
  const packages = await Promise.all(ids.map((id) => getBrandPackage(accountId, id)));
  return packages.filter((pkg): pkg is BrandAidPackage => Boolean(pkg));
}

export async function readProjectBrandPackage(projectNickname: string): Promise<BrandAidPackage | null> {
  return (await readDeliverable(projectNickname, MODULE, 'package', 'manifest.json')) as BrandAidPackage | null;
}
