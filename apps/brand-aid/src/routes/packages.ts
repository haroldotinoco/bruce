import { Hono } from 'hono';
import { getStorageClient } from '@bruce/storage';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';
import { getBrandPackage, listBrandPackages, readProjectBrandPackage, type BrandAidPackage } from '../services/package-store.js';
import {
  refreshMoodboardReferenceUrls,
  type SerperImageReference,
  type StoredAsset,
} from '../services/provider-clients.js';

export const packageRoutes = new Hono();

async function refreshAsset(asset: StoredAsset): Promise<StoredAsset> {
  if (!asset.storage_key) return asset;
  try {
    const url = await getStorageClient().getSignedUrl(
      asset.storage_key,
      Number(process.env.BRAND_AID_ASSET_URL_TTL_SECONDS ?? 3600),
    );
    return { ...asset, url };
  } catch {
    return asset;
  }
}

async function refreshMoodboardClusters(
  moodboard: BrandAidPackage['moodboard'],
): Promise<BrandAidPackage['moodboard']> {
  const clusters = await Promise.all(
    (moodboard.clusters ?? []).map(async (cluster) => ({
      ...cluster,
      references: await refreshMoodboardReferenceUrls(cluster.references as SerperImageReference[]),
    })),
  );
  return { ...moodboard, clusters };
}

async function refreshPackageAssets(pkg: BrandAidPackage): Promise<BrandAidPackage> {
  const [logoStudies, brandImagery, approvedLogo, assetManifest, moodboard] = await Promise.all([
    Promise.all(pkg.logo_studies.map(refreshAsset)),
    Promise.all(pkg.brand_imagery.map(refreshAsset)),
    pkg.approved_logo ? refreshAsset(pkg.approved_logo) : Promise.resolve(undefined),
    Promise.all(pkg.asset_manifest.map(refreshAsset)),
    refreshMoodboardClusters(pkg.moodboard),
  ]);
  return {
    ...pkg,
    logo_studies: logoStudies,
    brand_imagery: brandImagery,
    approved_logo: approvedLogo,
    asset_manifest: assetManifest,
    moodboard,
  };
}

packageRoutes.get('/', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  try {
    const packages = await Promise.all((await listBrandPackages(accountId)).map(refreshPackageAssets));
    return c.json({ packages, items: packages });
  } catch (error) {
    logger.error({ error, accountId, correlationId }, 'brand-aid packages.list failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

packageRoutes.get('/project/:nickname', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const nickname = c.req.param('nickname');
  try {
    const pkg = await readProjectBrandPackage(nickname);
    if (!pkg || pkg.account_id !== accountId) return c.json({ error: 'Brand package not found' }, 404);
    return c.json(await refreshPackageAssets(pkg));
  } catch (error) {
    logger.error({ error, accountId, correlationId, nickname }, 'brand-aid packages.project failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

packageRoutes.get('/:id', async (c) => {
  const { accountId, correlationId } = requireAuth(c);
  const id = c.req.param('id');
  try {
    const pkg = await getBrandPackage(accountId, id);
    if (!pkg) return c.json({ error: 'Brand package not found' }, 404);
    return c.json(await refreshPackageAssets(pkg));
  } catch (error) {
    logger.error({ error, accountId, correlationId, id }, 'brand-aid packages.get failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

packageRoutes.get('/:id/moodboard', async (c) => {
  const { accountId } = requireAuth(c);
  const pkg = await getBrandPackage(accountId, c.req.param('id'));
  if (!pkg) return c.json({ error: 'Brand package not found' }, 404);
  return c.json(pkg.moodboard);
});

packageRoutes.get('/:id/logo-studies', async (c) => {
  const { accountId } = requireAuth(c);
  const pkg = await getBrandPackage(accountId, c.req.param('id'));
  if (!pkg) return c.json({ error: 'Brand package not found' }, 404);
  return c.json({ assets: (await refreshPackageAssets(pkg)).logo_studies });
});

packageRoutes.get('/:id/critique', async (c) => {
  const { accountId } = requireAuth(c);
  const pkg = await getBrandPackage(accountId, c.req.param('id'));
  if (!pkg) return c.json({ error: 'Brand package not found' }, 404);
  return c.json({ critique: pkg.critique, iterations: pkg.critique_iterations, score: pkg.score });
});

packageRoutes.get('/:id/brand-imagery', async (c) => {
  const { accountId } = requireAuth(c);
  const pkg = await getBrandPackage(accountId, c.req.param('id'));
  if (!pkg) return c.json({ error: 'Brand package not found' }, 404);
  return c.json({ assets: (await refreshPackageAssets(pkg)).brand_imagery });
});

packageRoutes.get('/:id/brandbook', async (c) => {
  const { accountId } = requireAuth(c);
  const pkg = await getBrandPackage(accountId, c.req.param('id'));
  if (!pkg) return c.json({ error: 'Brand package not found' }, 404);
  return c.json({ brandbook: pkg.brandbook, export_manifest: pkg.export_manifest });
});

packageRoutes.get('/:id/export-manifest', async (c) => {
  const { accountId } = requireAuth(c);
  const pkg = await getBrandPackage(accountId, c.req.param('id'));
  if (!pkg) return c.json({ error: 'Brand package not found' }, 404);
  return c.json({ export_manifest: pkg.export_manifest, asset_manifest: (await refreshPackageAssets(pkg)).asset_manifest });
});
