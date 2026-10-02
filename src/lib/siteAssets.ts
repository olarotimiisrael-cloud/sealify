/**
 * Admin branding asset uploads.
 *
 * Writes to the public `site-assets` Supabase Storage bucket provisioned by
 * supabase/migrations/20261001000000_site_metadata_and_branding.sql. Access is
 * gated by RLS (admin-only writes, public reads), so this runs with the
 * signed-in administrator's own session.
 */

import { supabase } from '@/integrations/supabase/client';

export const SITE_ASSETS_BUCKET = 'site-assets';

export type AssetKind = 'favicon' | 'logo' | 'og';

interface AssetRule {
  folder: string;
  maxBytes: number;
  accept: string;
  hint: string;
}

export const ASSET_RULES: Record<AssetKind, AssetRule> = {
  favicon: {
    folder: 'favicon',
    maxBytes: 1024 * 1024,
    accept: 'image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml',
    hint: 'PNG, ICO or SVG · max 1 MB · 32×32 or 64×64 works best',
  },
  logo: {
    folder: 'logo',
    maxBytes: 2 * 1024 * 1024,
    accept: 'image/png,image/jpeg,image/webp,image/svg+xml',
    hint: 'PNG, JPG, WEBP or SVG · max 2 MB',
  },
  og: {
    folder: 'og',
    maxBytes: 3 * 1024 * 1024,
    accept: 'image/png,image/jpeg,image/webp',
    hint: '1200×630 PNG or JPG · max 3 MB',
  },
};

function buildFileName(kind: AssetKind, file: File): string {
  const extension = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${ASSET_RULES[kind].folder}/${stamp}.${extension}`;
}

export interface UploadAssetResult {
  url: string;
  path: string;
}

/**
 * Uploads a branding asset and returns its public URL. Replaces any previously
 * uploaded file of the same kind so the bucket does not accumulate orphans.
 */
export async function uploadSiteAsset(
  kind: AssetKind,
  file: File,
  previousPath?: string | null,
): Promise<UploadAssetResult> {
  const rule = ASSET_RULES[kind];

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded here.');
  }

  if (file.size > rule.maxBytes) {
    const limitMb = Math.round(rule.maxBytes / (1024 * 1024));
    throw new Error(`That file is too large. The limit for this asset is ${limitMb} MB.`);
  }

  const path = buildFileName(kind, file);

  const { error } = await supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });

  if (error) {
    throw new Error(error.message || 'The asset could not be uploaded.');
  }

  const { data } = supabase.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(path);

  if (previousPath && previousPath.includes(`/${SITE_ASSETS_BUCKET}/`)) {
    const previous = previousPath.split(`/${SITE_ASSETS_BUCKET}/`)[1];
    if (previous && previous !== path) {
      await supabase.storage.from(SITE_ASSETS_BUCKET).remove([previous]);
    }
  }

  return { url: data.publicUrl, path };
}
