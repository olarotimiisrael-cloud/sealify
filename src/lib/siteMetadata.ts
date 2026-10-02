/**
 * Site metadata core.
 *
 * Isomorphic module: imported by the Cloudflare Pages middleware (crawler
 * visible `<head>`), the Hono API routes (server) and the React app (client
 * document head, live previews). Must therefore stay free of server-only
 * imports.
 */

import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type OgType = 'website' | 'article' | 'profile' | 'product';
export type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player';

export interface PageMetadataOverride {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: OgType;
  twitterCard?: TwitterCardType;
  noIndex?: boolean;
  headingTitle?: string;
  headingSubtitle?: string;
}

export interface SiteMetadata {
  id?: string;
  /* Identity */
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  /* Brand assets */
  logoUrl: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  /* Open Graph */
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  ogType: OgType;
  ogImageAlt: string;
  ogLocale: string;
  ogSiteUrl: string;
  /* Twitter / X card */
  twitterCard: TwitterCardType;
  twitterSiteHandle: string;
  twitterCreatorHandle: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  /* On-page headings (home hero) */
  headingHomeTitle: string;
  headingHomeSubtitle: string;
  headingHomeCta: string;
  headingHomeCtaUrl: string;
  headingHomeBadge: string;
  /* Page titles + meta descriptions */
  pageTitleHome: string;
  metaDescriptionHome: string;
  pageMetadata: Record<string, PageMetadataOverride>;
  canonicalUrl: string;
  themeColor: string;
  manifestName: string;
  manifestShortName: string;
  robotsIndexing: boolean;
  updatedAt?: string | null;
}

export interface ResolvedMetadata {
  siteName: string;
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  image: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  logoUrl: string;
  ogType: OgType;
  ogImageAlt: string;
  ogLocale: string;
  ogSiteUrl: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: TwitterCardType;
  twitterSiteHandle: string;
  twitterCreatorHandle: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robotsIndexing: boolean;
  themeColor: string;
  manifestName: string;
  manifestShortName: string;
  headingTitle: string;
  headingSubtitle: string;
  headingCta: string;
  headingCtaUrl: string;
  headingBadge: string;
}

/* -------------------------------------------------------------------------- */
/* Page registry                                                               */
/* -------------------------------------------------------------------------- */

export interface PageDefinition {
  /** Route path as declared in src/App.tsx. */
  path: string;
  /** Prefix used to match dynamic routes, e.g. "/listing/". */
  matchPrefix?: string;
  label: string;
  /** Whether the admin UI exposes per-page overrides for this route. */
  editable: boolean;
  /** Home renders the title verbatim; other routes suffix the site name. */
  rawTitle?: boolean;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgType: OgType;
  /** Personal, non-indexable surfaces. */
  noIndex?: boolean;
}

export const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    path: '/',
    label: 'Home',
    editable: true,
    rawTitle: true,
    defaultTitle: 'Sealify — Nigeria\'s Trusted Local Marketplace',
    defaultDescription:
      'Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria. Verified sellers, safe meetup zones, and instant trading.',
    defaultOgType: 'website',
  },
  {
    path: '/vendors',
    label: 'Vendors',
    editable: true,
    defaultTitle: 'Vendors',
    defaultDescription: 'Discover verified vendors and businesses trading on Sealify across Ogbomosoland and Oyo State.',
    defaultOgType: 'website',
  },
  {
    path: '/post-ad',
    label: 'Post an ad',
    editable: true,
    defaultTitle: 'Post an ad',
    defaultDescription: 'List your item or service on Sealify and reach buyers near you in minutes.',
    defaultOgType: 'website',
  },
  {
    path: '/market-insights',
    label: 'Market insights',
    editable: true,
    defaultTitle: 'Market insights',
    defaultDescription: 'Live demand, pricing and deal trends across every marketplace category.',
    defaultOgType: 'website',
  },
  {
    path: '/requests',
    label: 'Buyer requests',
    editable: true,
    defaultTitle: 'Buyer requests',
    defaultDescription: 'Tell sellers exactly what you are looking for and receive offers directly.',
    defaultOgType: 'website',
  },
  {
    path: '/community',
    label: 'Community board',
    editable: true,
    defaultTitle: 'Community board',
    defaultDescription: 'News, tips and conversations from the Sealify community.',
    defaultOgType: 'website',
  },
  {
    path: '/how-it-works',
    label: 'How it works',
    editable: true,
    defaultTitle: 'How it works',
    defaultDescription: 'From listing to safe hand-off: how buying and selling on Sealify works.',
    defaultOgType: 'website',
  },
  {
    path: '/faq',
    label: 'FAQ',
    editable: true,
    defaultTitle: 'Frequently asked questions',
    defaultDescription: 'Answers to common questions about buying, selling, payments and safety on Sealify.',
    defaultOgType: 'website',
  },
  {
    path: '/help-center',
    label: 'Help center',
    editable: true,
    defaultTitle: 'Help center',
    defaultDescription: 'Guides and support for sellers and buyers on Sealify Nigeria.',
    defaultOgType: 'website',
  },
  {
    path: '/contact',
    label: 'Contact',
    editable: true,
    defaultTitle: 'Contact us',
    defaultDescription: 'Get in touch with the Sealify Nigeria team.',
    defaultOgType: 'website',
  },
  {
    path: '/safety',
    label: 'Safety center',
    editable: true,
    defaultTitle: 'Safety center',
    defaultDescription: 'Verified safe meetup zones, reporting tools and trading safety guidance.',
    defaultOgType: 'website',
  },
  {
    path: '/dispute',
    label: 'Dispute resolution',
    editable: true,
    defaultTitle: 'Dispute resolution',
    defaultDescription: 'Raise and track a trade dispute with the Sealify resolution team.',
    defaultOgType: 'website',
  },
  {
    path: '/listing/',
    label: 'Listing detail',
    matchPrefix: '/listing/',
    editable: false,
    defaultTitle: 'Listing',
    defaultDescription: 'View this listing on Sealify Nigeria.',
    defaultOgType: 'product',
  },
  {
    path: '/seller/',
    label: 'Seller profile',
    matchPrefix: '/seller/',
    editable: false,
    defaultTitle: 'Seller',
    defaultDescription: 'View this seller profile on Sealify Nigeria.',
    defaultOgType: 'profile',
  },
  {
    path: '/saved',
    label: 'Saved ads',
    editable: false,
    noIndex: true,
    defaultTitle: 'Saved ads',
    defaultDescription: 'Your saved listings on Sealify.',
    defaultOgType: 'website',
  },
  {
    path: '/my-ads',
    label: 'My ads',
    editable: false,
    noIndex: true,
    defaultTitle: 'My ads',
    defaultDescription: 'Manage the listings you have posted.',
    defaultOgType: 'website',
  },
  {
    path: '/messages',
    label: 'Messages',
    editable: false,
    noIndex: true,
    defaultTitle: 'Messages',
    defaultDescription: 'Your conversations with buyers and sellers.',
    defaultOgType: 'website',
  },
  {
    path: '/notifications',
    label: 'Notifications',
    editable: false,
    noIndex: true,
    defaultTitle: 'Notifications',
    defaultDescription: 'Your Sealify notifications.',
    defaultOgType: 'website',
  },
  {
    path: '/settings',
    label: 'Account settings',
    editable: false,
    noIndex: true,
    defaultTitle: 'Account settings',
    defaultDescription: 'Manage your Sealify account.',
    defaultOgType: 'website',
  },
  {
    path: '/verify',
    label: 'Verification',
    editable: false,
    noIndex: true,
    defaultTitle: 'Verification',
    defaultDescription: 'Complete your Sealify identity verification.',
    defaultOgType: 'website',
  },
  {
    path: '/profile-complete',
    label: 'Complete profile',
    editable: false,
    noIndex: true,
    defaultTitle: 'Complete your profile',
    defaultDescription: 'Finish setting up your Sealify profile.',
    defaultOgType: 'website',
  },
];

/** Routes offered in the admin "Page titles & descriptions" editor. */
export const EDITABLE_PAGE_DEFINITIONS = PAGE_DEFINITIONS.filter((definition) => definition.editable);

/** Home is edited through the dedicated fields, not the per-page overrides. */
export const HOME_PATH = '/';

export function normalisePathname(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0].split('#')[0];
  if (!withoutQuery.startsWith('/')) return `/${withoutQuery}`;
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.replace(/\/+$/, '') || '/';
  }
  return withoutQuery;
}

export function resolvePageDefinition(pathname: string): PageDefinition {
  const path = normalisePathname(pathname);

  const exact = PAGE_DEFINITIONS.find((definition) => definition.path === path);
  if (exact) return exact;

  const dynamic = PAGE_DEFINITIONS
    .filter((definition) => definition.matchPrefix && path.startsWith(definition.matchPrefix))
    .sort((a, b) => (b.matchPrefix?.length || 0) - (a.matchPrefix?.length || 0))[0];

  return dynamic || PAGE_DEFINITIONS[0];
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                    */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SITE_METADATA: SiteMetadata = {
  siteName: 'Sealify Nigeria',
  siteDescription: 'Nigeria\'s Trusted Local Marketplace for Ogbomosoland & Oyo State.',
  contactEmail: 'support@sealify.ng',
  contactPhone: '+234 813 120 8468',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  appleTouchIconUrl: '/logo.png',
  ogImage: '/og-image.png',
  ogTitle: 'Sealify — Nigeria\'s Trusted Local Marketplace',
  ogDescription:
    'Everything you need in one place. Cars, real estate, electronics, fashion and more. Buy • Sell • Connect.',
  ogType: 'website',
  ogImageAlt: 'Sealify Nigeria marketplace',
  ogLocale: 'en_NG',
  ogSiteUrl: '',
  twitterCard: 'summary_large_image',
  twitterSiteHandle: '',
  twitterCreatorHandle: '',
  twitterTitle: 'Sealify — Nigeria\'s Trusted Local Marketplace',
  twitterDescription:
    'Buy, sell, and connect safely with verified buyers and sellers in Ogbomosoland and across Nigeria.',
  twitterImage: '/og-image.png',
  headingHomeTitle: 'Buy and sell anything, safely.',
  headingHomeSubtitle:
    'Nigeria\'s trusted local marketplace for Ogbomosoland, Oyo State and beyond. Verified sellers, safe meetup zones, instant trading.',
  headingHomeCta: 'Start trading',
  headingHomeCtaUrl: '/post-ad',
  headingHomeBadge: 'Trusted across Ogbomosoland',
  metaDescriptionHome:
    'Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria. Verified sellers, safe meetup zones, and instant trading.',
  pageTitleHome: 'Sealify — Nigeria\'s Trusted Local Marketplace',
  pageMetadata: {},
  canonicalUrl: '',
  themeColor: '#10b981',
  manifestName: 'Sealify Nigeria',
  manifestShortName: 'Sealify',
  robotsIndexing: true,
  updatedAt: null,
};

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

const TAB = 0x09;
const LINE_FEED = 0x0a;
const CARRIAGE_RETURN = 0x0d;
const SPACE = 0x20;
const DELETE = 0x7f;

/**
 * Normalises administrator input: drops C0 control characters and DEL (which
 * could otherwise corrupt rendered markup or response headers) while keeping
 * tab and line breaks intact for multi-line fields.
 */
export function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';

  const input = String(value);
  let output = '';

  for (const character of input) {
    const code = character.codePointAt(0) ?? 0;

    if (code === DELETE) continue;
    if (code < SPACE && code !== TAB && code !== LINE_FEED && code !== CARRIAGE_RETURN) continue;

    output += character;
  }

  return output.trim();
}

/**
 * Asset and canonical fields accept absolute http(s) URLs or root-relative
 * paths such as "/logo.png". Anything else (javascript:, data:, protocol
 * relative) is rejected.
 */
function isValidAssetValue(value: string): boolean {
  if (value === '') return true;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Every field is optional so a partial payload (or a sparse row read back from
 * the database) validates. `undefined` means "leave the stored value alone";
 * an empty string means "clear this field".
 */
const optionalText = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (value === undefined ? undefined : cleanText(value)))
    .refine((value) => value === undefined || value.length <= max, {
      message: `Must be ${max} characters or fewer`,
    });

const requiredText = (min: number, max: number, label: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (value === undefined ? undefined : cleanText(value)))
    .refine((value) => value === undefined || (value.length >= min && value.length <= max), {
      message: `${label} must be between ${min} and ${max} characters`,
    });

const assetPath = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => (value === undefined ? undefined : cleanText(value)))
  .refine((value) => value === undefined || value.length <= 2048, {
    message: 'Must be 2048 characters or fewer',
  })
  .refine((value) => value === undefined || isValidAssetValue(value), {
    message: 'Must be an absolute http(s) URL or a root-relative path such as /logo.png',
  });

const twitterHandle = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) =>
    value === undefined ? undefined : cleanText(value).replace(/^@/, ''),
  )
  .refine((value) => value === undefined || value === '' || /^[A-Za-z0-9_]{1,15}$/.test(value), {
    message: 'Must be a valid X/Twitter handle without the leading @',
  });

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Must be a 6-digit hex colour such as #10b981' });

export const pageOverrideSchema = z
  .object({
    title: optionalText(120),
    description: optionalText(320),
    ogTitle: optionalText(120),
    ogDescription: optionalText(320),
    ogImage: assetPath,
    ogType: z.enum(['website', 'article', 'profile', 'product']).nullish(),
    twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).nullish(),
    noIndex: z.boolean().nullish(),
    headingTitle: optionalText(160),
    headingSubtitle: optionalText(320),
  })
  .strict();

export const siteMetadataUpdateSchema = z
  .object({
    siteName: requiredText(2, 80, 'Site name'),
    siteDescription: requiredText(10, 300, 'Site description'),
    contactEmail: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((value) => (value === undefined ? undefined : cleanText(value)))
      .refine(
        (value) => value === undefined || value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        { message: 'Must be a valid email address' },
      ),
    contactPhone: optionalText(32),
    logoUrl: assetPath,
    faviconUrl: assetPath,
    appleTouchIconUrl: assetPath,
    ogImage: assetPath,
    ogTitle: requiredText(0, 120, 'Open Graph title'),
    ogDescription: requiredText(0, 320, 'Open Graph description'),
    ogType: z.enum(['website', 'article', 'profile', 'product']).default('website'),
    ogImageAlt: optionalText(420),
    ogLocale: z
      .string()
      .trim()
      .regex(/^[a-z]{2}_[A-Z]{2}$/, { message: 'Must look like en_NG' })
      .default('en_NG'),
    ogSiteUrl: assetPath,
    twitterCard: z
      .enum(['summary', 'summary_large_image', 'app', 'player'])
      .default('summary_large_image'),
    twitterSiteHandle: twitterHandle,
    twitterCreatorHandle: twitterHandle,
    twitterTitle: optionalText(120),
    twitterDescription: optionalText(320),
    twitterImage: assetPath,
    headingHomeTitle: requiredText(0, 120, 'Homepage heading'),
    headingHomeSubtitle: optionalText(320),
    headingHomeCta: optionalText(48),
    headingHomeCtaUrl: assetPath,
    headingHomeBadge: optionalText(64),
    pageTitleHome: requiredText(0, 120, 'Homepage title'),
    metaDescriptionHome: requiredText(0, 320, 'Homepage meta description'),
    pageMetadata: z
      .record(z.string(), pageOverrideSchema)
      .default({})
      .refine(
        (value) => Object.keys(value).length <= 100,
        { message: 'Too many page overrides' },
      ),
    canonicalUrl: assetPath,
    themeColor: hexColor.default('#10b981'),
    manifestName: optionalText(64),
    manifestShortName: optionalText(32),
    robotsIndexing: z.boolean().default(true),
  })
  .strict();

export type SiteMetadataUpdateInput = z.infer<typeof siteMetadataUpdateSchema>;

/**
 * Keys accepted by the admin write payload. Server-managed columns (`id`,
 * `updatedAt`) are excluded so the schema can stay strict while clients send a
 * whole settings record.
 */
export const SITE_METADATA_UPDATE_KEYS = Object.keys(
  siteMetadataUpdateSchema.shape,
) as (keyof SiteMetadataUpdateInput)[];

/** Projects a full settings record down to a validated write payload. */
export function toUpdatePayload(metadata: SiteMetadata): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const key of SITE_METADATA_UPDATE_KEYS) {
    payload[key as string] = metadata[key as keyof SiteMetadata];
  }

  return payload;
}

/* -------------------------------------------------------------------------- */
/* Database mapping                                                            */
/* -------------------------------------------------------------------------- */

const DB_COLUMN_MAP: Record<keyof SiteMetadata, string> = {
  id: 'id',
  siteName: 'site_name',
  siteDescription: 'site_description',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  logoUrl: 'logo_url',
  faviconUrl: 'favicon_url',
  appleTouchIconUrl: 'apple_touch_icon_url',
  ogImage: 'og_image',
  ogTitle: 'og_title',
  ogDescription: 'og_description',
  ogType: 'og_type',
  ogImageAlt: 'og_image_alt',
  ogLocale: 'og_locale',
  ogSiteUrl: 'og_site_url',
  twitterCard: 'twitter_card',
  twitterSiteHandle: 'twitter_site_handle',
  twitterCreatorHandle: 'twitter_creator_handle',
  twitterTitle: 'twitter_title',
  twitterDescription: 'twitter_description',
  twitterImage: 'twitter_image',
  headingHomeTitle: 'heading_home_title',
  headingHomeSubtitle: 'heading_home_subtitle',
  headingHomeCta: 'heading_home_cta',
  headingHomeCtaUrl: 'heading_home_cta_url',
  headingHomeBadge: 'heading_home_badge',
  pageTitleHome: 'page_title_home',
  metaDescriptionHome: 'meta_description_home',
  pageMetadata: 'page_metadata',
  canonicalUrl: 'canonical_url',
  themeColor: 'theme_color',
  manifestName: 'manifest_name',
  manifestShortName: 'manifest_short_name',
  robotsIndexing: 'robots_indexing',
  updatedAt: 'updated_at',
};

const BOOLEAN_FIELDS = new Set<keyof SiteMetadata>(['robotsIndexing']);

const JSON_FIELDS = new Set<keyof SiteMetadata>(['pageMetadata']);

/** Columns carrying jsonb payloads rather than scalars. */
const JSONB_COLUMNS = new Set(['page_metadata']);

/** Every writable column, in a stable order, for generated SQL. */
export const METADATA_COLUMN_NAMES: string[] = (
  Object.keys(DB_COLUMN_MAP) as (keyof SiteMetadata)[]
)
  .filter((key) => key !== 'id' && key !== 'updatedAt')
  .map((key) => DB_COLUMN_MAP[key]);

/** Scalar columns only; jsonb columns are passed through JSON.stringify. */
export const METADATA_SCALAR_COLUMNS = METADATA_COLUMN_NAMES.filter(
  (column) => !JSONB_COLUMNS.has(column),
);

/** Convert a `site_settings` database row into the camelCase API shape. */
export function rowToMetadata(row: Record<string, unknown> | null | undefined): SiteMetadata {
  const result: SiteMetadata = { ...DEFAULT_SITE_METADATA };

  if (!row) return result;

  for (const key of Object.keys(DB_COLUMN_MAP) as (keyof SiteMetadata)[]) {
    const value = row[DB_COLUMN_MAP[key]];
    if (value === null || value === undefined) continue;

    if (JSON_FIELDS.has(key)) {
      result[key] = (typeof value === 'string' ? safeParseJson(value) : value) as never;
      continue;
    }

    if (BOOLEAN_FIELDS.has(key)) {
      (result[key] as boolean) = value === true || value === 'true';
      continue;
    }

    // An empty or whitespace-only column keeps the compiled default, so a
    // partially configured row can never blank out the site name or branding.
    const text = cleanText(value);
    if (text === '') continue;

    (result[key] as string) = text;
  }

  result.pageMetadata = result.pageMetadata && typeof result.pageMetadata === 'object' ? result.pageMetadata : {};
  result.updatedAt = row.updated_at ? String(row.updated_at) : null;

  return result;
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

/** Convert the camelCase API shape into a snake_case `site_settings` row. */
export function metadataToRow(metadata: SiteMetadata): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  for (const key of Object.keys(DB_COLUMN_MAP) as (keyof SiteMetadata)[]) {
    if (key === 'id' || key === 'updatedAt') continue;

    const value = metadata[key];
    row[DB_COLUMN_MAP[key]] = JSON_FIELDS.has(key)
      ? JSON.stringify(value ?? {})
      : value === undefined
        ? null
        : value;
  }

  return row;
}

/** Merge a validated patch over the stored settings, filling defaults. */
export function mergeSiteMetadata(
  current: SiteMetadata,
  patch: Partial<SiteMetadata>,
): SiteMetadata {
  const merged: SiteMetadata = { ...DEFAULT_SITE_METADATA, ...current };

  for (const key of Object.keys(DEFAULT_SITE_METADATA) as (keyof SiteMetadata)[]) {
    if (key === 'pageMetadata' || key === 'id' || key === 'updatedAt') continue;
    const incoming = patch[key];
    if (incoming !== undefined) {
      (merged[key] as unknown) = incoming;
    }
  }

  if (patch.pageMetadata) {
    merged.pageMetadata = { ...(current.pageMetadata || {}), ...patch.pageMetadata };
  }

  return merged;
}

/* -------------------------------------------------------------------------- */
/* Resolution                                                                  */
/* -------------------------------------------------------------------------- */

export function toAbsoluteUrl(value: string, origin: string): string {
  const candidate = cleanText(value);
  if (!candidate) return '';
  if (candidate.startsWith('//')) return `https:${candidate}`;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (candidate.startsWith('/')) return `${origin.replace(/\/$/, '')}${candidate}`;
  return `${origin.replace(/\/$/, '')}/${candidate}`;
}

export interface ResolveOptions {
  /** Absolute origin used to absolutise relative asset paths. */
  origin: string;
  /** Route the metadata is resolved for. */
  path?: string;
  /** Per-entity overrides (listing title/image) applied for dynamic routes. */
  title?: string;
  description?: string;
  image?: string;
  type?: OgType;
}

export function resolveMetadata(
  metadata: SiteMetadata,
  options: ResolveOptions,
): ResolvedMetadata {
  const path = normalisePathname(options.path ?? '/');
  const definition = resolvePageDefinition(path);
  const origin = options.origin.replace(/\/$/, '');
  const overrides = metadata.pageMetadata?.[definition.path] || {};

  const siteName = cleanText(metadata.siteName) || DEFAULT_SITE_METADATA.siteName;
  const isHome = definition.path === HOME_PATH;

  const baseTitle =
    cleanText(options.title) ||
    cleanText(overrides.title) ||
    (isHome
      ? cleanText(metadata.pageTitleHome) || DEFAULT_SITE_METADATA.pageTitleHome
      : definition.defaultTitle);

  const title =
    definition.rawTitle && !cleanText(options.title) && !cleanText(overrides.title)
      ? baseTitle
      : baseTitle === siteName
        ? baseTitle
        : `${baseTitle} | ${siteName}`;

  const description =
    cleanText(options.description) ||
    cleanText(overrides.description) ||
    (isHome
      ? cleanText(metadata.metaDescriptionHome) || DEFAULT_SITE_METADATA.metaDescriptionHome
      : definition.defaultDescription);

  const imageValue =
    cleanText(options.image) ||
    cleanText(overrides.ogImage) ||
    cleanText(metadata.ogImage) ||
    DEFAULT_SITE_METADATA.ogImage;

  const ogTitle = cleanText(overrides.ogTitle) || cleanText(metadata.ogTitle) || title;
  const ogDescription =
    cleanText(overrides.ogDescription) || cleanText(metadata.ogDescription) || description;

  const canonicalBase = cleanText(metadata.canonicalUrl) || origin;
  const canonicalUrl = toAbsoluteUrl(canonicalBase, origin) + (path === '/' ? '' : path);

  return {
    siteName,
    path,
    title,
    description,
    canonicalUrl,
    image: toAbsoluteUrl(imageValue, origin),
    faviconUrl: cleanText(metadata.faviconUrl) || DEFAULT_SITE_METADATA.faviconUrl,
    appleTouchIconUrl:
      cleanText(metadata.appleTouchIconUrl) ||
      cleanText(metadata.logoUrl) ||
      DEFAULT_SITE_METADATA.appleTouchIconUrl,
    logoUrl: cleanText(metadata.logoUrl) || DEFAULT_SITE_METADATA.logoUrl,
    ogType: ((cleanText(options.type) || overrides.ogType || definition.defaultOgType) as OgType),
    ogImageAlt: cleanText(metadata.ogImageAlt) || siteName,
    ogLocale: cleanText(metadata.ogLocale) || DEFAULT_SITE_METADATA.ogLocale,
    ogSiteUrl: toAbsoluteUrl(cleanText(metadata.ogSiteUrl) || canonicalBase, origin).replace(/\/$/, ''),
    ogTitle,
    ogDescription,
    twitterCard:
      overrides.twitterCard || (cleanText(metadata.twitterCard) as TwitterCardType) || 'summary_large_image',
    twitterSiteHandle: cleanText(metadata.twitterSiteHandle),
    twitterCreatorHandle: cleanText(metadata.twitterCreatorHandle),
    twitterTitle: cleanText(metadata.twitterTitle) || ogTitle,
    twitterDescription: cleanText(metadata.twitterDescription) || ogDescription,
    twitterImage: toAbsoluteUrl(cleanText(metadata.twitterImage) || imageValue, origin),
    robotsIndexing: metadata.robotsIndexing !== false && !definition.noIndex && overrides.noIndex !== true,
    themeColor: cleanText(metadata.themeColor) || DEFAULT_SITE_METADATA.themeColor,
    manifestName: cleanText(metadata.manifestName) || siteName,
    manifestShortName: cleanText(metadata.manifestShortName) || siteName.slice(0, 12),
    headingTitle: cleanText(overrides.headingTitle) || cleanText(metadata.headingHomeTitle),
    headingSubtitle: cleanText(overrides.headingSubtitle) || cleanText(metadata.headingHomeSubtitle),
    headingCta: cleanText(metadata.headingHomeCta),
    headingCtaUrl: cleanText(metadata.headingHomeCtaUrl),
    headingBadge: cleanText(metadata.headingHomeBadge),
  };
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface HeadTag {
  attr: 'name' | 'property' | 'rel' | 'charset';
  key: string;
  content: string;
}

/** Tags emitted for a resolved metadata set, in declaration order. */
export function buildHeadTags(resolved: ResolvedMetadata): HeadTag[] {
  const tags: HeadTag[] = [
    { attr: 'name', key: 'description', content: resolved.description },
    { attr: 'name', key: 'robots', content: resolved.robotsIndexing ? 'index, follow' : 'noindex, nofollow' },
    { attr: 'name', key: 'theme-color', content: resolved.themeColor },
    { attr: 'name', key: 'apple-mobile-web-app-title', content: resolved.manifestShortName },

    { attr: 'property', key: 'og:type', content: resolved.ogType },
    { attr: 'property', key: 'og:site_name', content: resolved.siteName },
    { attr: 'property', key: 'og:title', content: resolved.ogTitle },
    { attr: 'property', key: 'og:description', content: resolved.ogDescription },
    { attr: 'property', key: 'og:url', content: resolved.canonicalUrl },
    { attr: 'property', key: 'og:image', content: resolved.image },
    { attr: 'property', key: 'og:image:alt', content: resolved.ogImageAlt },
    { attr: 'property', key: 'og:image:width', content: '1200' },
    { attr: 'property', key: 'og:image:height', content: '630' },
    { attr: 'property', key: 'og:locale', content: resolved.ogLocale },
    { attr: 'property', key: 'og:site', content: resolved.ogSiteUrl },

    { attr: 'name', key: 'twitter:card', content: resolved.twitterCard },
    { attr: 'name', key: 'twitter:site', content: resolved.twitterSiteHandle },
    { attr: 'name', key: 'twitter:creator', content: resolved.twitterCreatorHandle },
    { attr: 'name', key: 'twitter:title', content: resolved.twitterTitle },
    { attr: 'name', key: 'twitter:description', content: resolved.twitterDescription },
    { attr: 'name', key: 'twitter:image', content: resolved.twitterImage },
    { attr: 'name', key: 'twitter:image:alt', content: resolved.ogImageAlt },
  ];

  return tags.filter((tag) => tag.content.length > 0);
}

/** Serialise the managed head block (title + tags + icons + canonical). */
export function buildHeadHtml(resolved: ResolvedMetadata): string {
  const lines: string[] = [`<title>${escapeHtml(resolved.title)}</title>`];

  const canonical = `<link rel="canonical" href="${escapeHtml(resolved.canonicalUrl)}">`;
  const icon = resolved.faviconUrl
    ? `<link rel="icon" href="${escapeHtml(resolved.faviconUrl)}">`
    : '';
  const appleIcon = resolved.appleTouchIconUrl
    ? `<link rel="apple-touch-icon" href="${escapeHtml(resolved.appleTouchIconUrl)}">`
    : '';

  lines.push(canonical, icon, appleIcon);

  for (const tag of buildHeadTags(resolved)) {
    lines.push(
      `<meta ${tag.attr}="${tag.key}" content="${escapeHtml(tag.content)}">`,
    );
  }

  return lines.join('\n    ');
}

/** Meta tags + icons this module owns; stripped before re-injection. */
const MANAGED_NAME_TAGS = [
  'description',
  'robots',
  'theme-color',
  'apple-mobile-web-app-title',
  'twitter:card',
  'twitter:site',
  'twitter:creator',
  'twitter:title',
  'twitter:description',
  'twitter:image',
  'twitter:image:alt',
];

const MANAGED_PROPERTY_TAGS = [
  'og:type',
  'og:site_name',
  'og:title',
  'og:description',
  'og:url',
  'og:image',
  'og:image:alt',
  'og:image:width',
  'og:image:height',
  'og:locale',
  'og:site',
];

const MANAGED_LINK_RELS = ['canonical', 'icon', 'apple-touch-icon', 'shortcut icon'];

function stripManagedTags(html: string): string {
  let output = html;

  output = output.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  output = output.replace(/<link\b[^>]*>/gi, (tag) =>
    MANAGED_LINK_RELS.some((rel) => tag.includes(`rel="${rel}"`) || tag.includes(`rel='${rel}'`))
      ? ''
      : tag,
  );
  output = output.replace(/<meta\b[^>]*>/gi, (tag) => {
    const nameMatch = tag.match(/\bname=["']([^"']+)["']/i);
    const propertyMatch = tag.match(/\bproperty=["']([^"']+)["']/i);
    const key = (nameMatch?.[1] || propertyMatch?.[1] || '').toLowerCase();

    if (nameMatch && MANAGED_NAME_TAGS.includes(key)) return '';
    if (propertyMatch && MANAGED_PROPERTY_TAGS.includes(key)) return '';
    return tag;
  });

  return output;
}

/**
 * Rewrite a served HTML document so crawlers (which do not execute
 * JavaScript) see the administrator-managed metadata. Existing managed tags are
 * stripped first so the document never contains duplicates.
 */
export function injectHeadIntoHtml(html: string, resolved: ResolvedMetadata): string {
  const headOpen = html.match(/<head\b[^>]*>/i);
  if (!headOpen) return html;

  const openIndex = headOpen.index! + headOpen[0].length;
  const closeIndex = html.toLowerCase().indexOf('</head>', openIndex);
  if (closeIndex === -1) return html;

  const inner = stripManagedTags(html.slice(openIndex, closeIndex)).replace(/\n{3,}/g, '\n\n');
  const body = `${inner.trimEnd()}\n    ${buildHeadHtml(resolved)}\n  `;

  return `${html.slice(0, openIndex)}${body}${html.slice(closeIndex)}`;
}

/* -------------------------------------------------------------------------- */
/* Browser application (client only)                                           */
/* -------------------------------------------------------------------------- */

export interface DocumentMetadataOverrides {
  title?: string;
  description?: string;
  image?: string;
  type?: OgType;
}

/**
 * Apply resolved metadata to the live document. Safe to call repeatedly;
 * mirrors what the edge middleware rendered so client-side navigation keeps the
 * head in sync.
 */
export function applyMetadataToDocument(
  resolved: ResolvedMetadata,
  overrides: DocumentMetadataOverrides = {},
): void {
  if (typeof document === 'undefined') return;

  const title = overrides.title
    ? `${overrides.title} | ${resolved.siteName}`
    : resolved.title;
  const description = overrides.description || resolved.description;
  const image = overrides.image || resolved.image;

  document.title = title;

  const upsert = (attr: 'name' | 'property', key: string, content: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, key);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  upsert('name', 'description', description);
  upsert('name', 'robots', resolved.robotsIndexing ? 'index, follow' : 'noindex, nofollow');
  upsert('name', 'theme-color', resolved.themeColor);

  upsert('property', 'og:type', overrides.type || resolved.ogType);
  upsert('property', 'og:site_name', resolved.siteName);
  upsert('property', 'og:title', overrides.title || resolved.ogTitle);
  upsert('property', 'og:description', description);
  upsert('property', 'og:url', window.location.href);
  upsert('property', 'og:image', image);
  upsert('property', 'og:image:alt', resolved.ogImageAlt);
  upsert('property', 'og:image:width', '1200');
  upsert('property', 'og:image:height', '630');
  upsert('property', 'og:locale', resolved.ogLocale);
  upsert('property', 'og:site', resolved.ogSiteUrl);

  upsert('name', 'twitter:card', resolved.twitterCard);
  if (resolved.twitterSiteHandle) upsert('name', 'twitter:site', resolved.twitterSiteHandle);
  if (resolved.twitterCreatorHandle) upsert('name', 'twitter:creator', resolved.twitterCreatorHandle);
  upsert('name', 'twitter:title', overrides.title || resolved.twitterTitle);
  upsert('name', 'twitter:description', description);
  upsert('name', 'twitter:image', overrides.image || resolved.twitterImage);

  const upsertLink = (rel: string, href: string) => {
    if (!href) return;
    let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', toAbsoluteUrl(href, window.location.origin));
  };

  upsertLink('canonical', resolved.canonicalUrl);
  upsertLink('icon', resolved.faviconUrl);
  upsertLink('apple-touch-icon', resolved.appleTouchIconUrl);
}

/** Client-side convenience wrapper around resolveMetadata. */
export function resolveMetadataForBrowser(
  metadata: SiteMetadata,
  path: string,
  overrides: DocumentMetadataOverrides = {},
): ResolvedMetadata {
  return resolveMetadata(metadata, {
    origin: typeof window === 'undefined' ? '' : window.location.origin,
    path,
    title: overrides.title,
    description: overrides.description,
    image: overrides.image,
    type: overrides.type,
  });
}
