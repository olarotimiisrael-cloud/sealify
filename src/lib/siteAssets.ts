import { uploadFileWithToken } from '@/lib/upload';

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

export async function uploadSiteAsset(
  kind: AssetKind,
  file: File,
  _previousPath?: string | null,
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

  try {
    const url = await uploadFileWithToken(file, `${SITE_ASSETS_BUCKET}/${path}`);
    return { url, path };
  } catch {
    throw new Error('The asset could not be uploaded.');
  }
}
