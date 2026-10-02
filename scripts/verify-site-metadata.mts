import { readFileSync } from 'node:fs';
import {
  DEFAULT_SITE_METADATA,
  METADATA_COLUMN_NAMES,
  buildHeadHtml,
  injectHeadIntoHtml,
  metadataToRow,
  resolveMetadata,
  rowToMetadata,
  siteMetadataUpdateSchema,
  toUpdatePayload,
} from '../src/lib/siteMetadata';
import { buildSiteMetadataUpsert } from '../src/server/siteMetadataStore';

let failures = 0;
const check = (name: string, condition: boolean, detail?: unknown) => {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}`, detail === undefined ? '' : JSON.stringify(detail));
  }
};

const origin = 'https://sealify.ng';
const admin: typeof DEFAULT_SITE_METADATA = {
  ...DEFAULT_SITE_METADATA,
  siteName: 'Ogbomo Trade',
  faviconUrl: 'https://cdn.example.com/favicon.png',
  logoUrl: '/logo.png',
  pageTitleHome: 'Ogbomo Trade | Buy & Sell Safely',
  metaDescriptionHome: 'Admin managed description for the Ogbomo marketplace.',
  headingHomeTitle: 'Trade with confidence',
  headingHomeSubtitle: 'Verified sellers across Oyo State.',
  headingHomeCta: 'Post an ad',
  ogTitle: 'Ogbomo Trade on social',
  ogImage: '/og-image.png',
  twitterSiteHandle: 'ogbomotrade',
  pageMetadata: {
    '/faq': {
      title: 'Frequently asked questions',
      description: 'Everything buyers ask about trading on Ogbomo Trade.',
      noIndex: true,
    },
  },
};

console.log('\n1. Row <-> API shape mapping');
const row = {
  site_name: 'Ogbomo Trade',
  favicon_url: '/favicon.ico',
  og_type: 'website',
  robots_indexing: true,
  page_metadata: { '/faq': { title: 'FAQ' } },
  updated_at: '2026-10-01T00:00:00.000Z',
};
const mapped = rowToMetadata(row);
check('snake_case row maps to camelCase', mapped.siteName === 'Ogbomo Trade' && mapped.faviconUrl === '/favicon.ico');
check('jsonb column parsed', mapped.pageMetadata['/faq']?.title === 'FAQ');
check('empty row falls back to defaults', rowToMetadata(null).siteName === DEFAULT_SITE_METADATA.siteName);
check('whitespace-only column keeps default', rowToMetadata({ site_name: '   ' }).siteName === DEFAULT_SITE_METADATA.siteName);

console.log('\n2. Path resolution');
const home = resolveMetadata(admin, { origin, path: '/' });
check('home uses the managed title verbatim', home.title === admin.pageTitleHome, home.title);
check('home description comes from meta_description_home', home.description === admin.metaDescriptionHome);
check('home image is absolutised', home.image === `${origin}/og-image.png`, home.image);

const faq = resolveMetadata(admin, { origin, path: '/faq' });
check('per-page title override applied', faq.title === 'Frequently asked questions | Ogbomo Trade', faq.title);
check('per-page description override applied', faq.description.startsWith('Everything buyers ask'));
check('noindex override respected', faq.robotsIndexing === false);
check('non-editable route keeps default title', resolveMetadata(admin, { origin, path: '/how-it-works' }).title === 'How it works | Ogbomo Trade');

const settings = resolveMetadata(admin, { origin, path: '/settings' });
check('private route is noindex by default', settings.robotsIndexing === false);

const trailing = resolveMetadata(admin, { origin, path: '/faq/' });
check('trailing slash normalises to the same page', trailing.title === faq.title, trailing.title);

const listing = resolveMetadata(admin, { origin, path: '/listing/abc', title: 'Toyota Camry 2018', image: '/car.jpg' });
check('entity title overrides the page default', listing.title === 'Toyota Camry 2018 | Ogbomo Trade', listing.title);
check('entity image overrides the default', listing.image === `${origin}/car.jpg`, listing.image);
check('listing uses product og:type', listing.ogType === 'product');

const canonical = resolveMetadata(admin, { origin, path: '/faq' });
check('canonical includes the route', canonical.canonicalUrl === `${origin}/faq`, canonical.canonicalUrl);

console.log('\n3. Head rendering + escaping');
const hostile = resolveMetadata(
  { ...admin, pageTitleHome: '</title><script>alert(1)</script>' },
  { origin, path: '/' },
);
const head = buildHeadHtml(hostile);
check('title content is escaped', !head.includes('<script>alert(1)</script>'), head);
check('title tag is well formed', (head.match(/<\/title>/g) || []).length === 1);
check('twitter handle emitted', head.includes('name="twitter:site" content="ogbomotrade"'));
check('canonical link emitted', head.includes('<link rel="canonical"'));
check('favicon link emitted', head.includes('rel="icon"'));
check('robots meta emitted', head.includes('name="robots" content="noindex, nofollow"') || head.includes('name="robots" content="index, follow"'));

console.log('\n4. Injection into the real built index.html');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const injected = injectHeadIntoHtml(html, home);

check('title replaced exactly once', (injected.match(/<title>/g) || []).length === 1);
check('no duplicate description tags', (injected.match(/<meta name="description"/g) || []).length === 1);
check('no duplicate og:title tags', (injected.match(/<meta property="og:title"/g) || []).length === 1);
check('no duplicate twitter:card tags', (injected.match(/<meta name="twitter:card"/g) || []).length === 1);
check('managed title present', injected.includes('<title>Ogbomo Trade | Buy &amp; Sell Safely</title>'));
check('managed favicon present', injected.includes('rel="icon" href="https://cdn.example.com/favicon.png"'));
check('og:title present', injected.includes('<meta property="og:title" content="Ogbomo Trade on social">'));
check('theme colour from settings', injected.includes('name="theme-color" content="#10b981"'));
check('app entry script preserved', injected.includes('/assets/index-') || injected.includes('src="/assets/'));
check('body markup preserved', injected.includes('<div id="root"></div>'));
check('adsense script preserved', injected.includes('adsbygoogle'));
check('manifest link preserved', injected.includes('rel="manifest"'));
check('html length grew (tags added)', injected.length > html.length);

console.log('\n5. Injection safety');
check('non-html document is untouched', injectHeadIntoHtml('<p>no head here</p>', home) === '<p>no head here</p>');
const empty = injectHeadIntoHtml('<html><head></head><body></body></html>', home);
check('empty head is handled', empty.includes('<title>') && empty.includes('</head>'));

console.log('\n6. Write payload validation');
const valid = siteMetadataUpdateSchema.safeParse(toUpdatePayload(DEFAULT_SITE_METADATA));
check('defaults validate', valid.success, valid.success ? '' : valid.error.issues);

const fromLoadedRow = siteMetadataUpdateSchema.safeParse(
  toUpdatePayload(rowToMetadata({ ...row, id: 'abc-123' })),
);
check(
  'a loaded row (with id/updatedAt) validates as a payload',
  fromLoadedRow.success,
  fromLoadedRow.success ? '' : fromLoadedRow.error.issues,
);
check(
  'server-managed keys are stripped from the payload',
  !('updatedAt' in toUpdatePayload(DEFAULT_SITE_METADATA)) &&
    !('id' in toUpdatePayload(DEFAULT_SITE_METADATA)),
);
check(
  'stray unknown keys are rejected by the strict schema',
  !siteMetadataUpdateSchema.safeParse({ ...toUpdatePayload(DEFAULT_SITE_METADATA), hacked: 1 }).success,
);

const badUrl = siteMetadataUpdateSchema.safeParse({ ...toUpdatePayload(DEFAULT_SITE_METADATA), logoUrl: 'javascript:alert(1)' });
check('javascript: asset URL rejected', !badUrl.success);

const badColor = siteMetadataUpdateSchema.safeParse({ ...toUpdatePayload(DEFAULT_SITE_METADATA), themeColor: 'red' });
check('non-hex theme colour rejected', !badColor.success);

const badCard = siteMetadataUpdateSchema.safeParse({ ...toUpdatePayload(DEFAULT_SITE_METADATA), twitterCard: 'gigantic' });
check('unknown twitter card rejected', !badCard.success);

const badOverride = siteMetadataUpdateSchema.safeParse({
  ...DEFAULT_SITE_METADATA,
  pageMetadata: { '/faq': { unknownField: 'x' } },
});
check('unknown page override key rejected', !badOverride.success);

const tooLong = siteMetadataUpdateSchema.safeParse({
  ...toUpdatePayload(DEFAULT_SITE_METADATA),
  siteName: 'x'.repeat(81),
});
check('over-long site name rejected', !tooLong.success);

const trimmed = siteMetadataUpdateSchema.safeParse({
  ...toUpdatePayload(DEFAULT_SITE_METADATA),
  twitterSiteHandle: '@SealifyNG',
  siteName: `  ${DEFAULT_SITE_METADATA.siteName}  `,
});
check('handles normalise without the @', trimmed.success && trimmed.data?.twitterSiteHandle === 'SealifyNG', trimmed.success ? trimmed.data?.twitterSiteHandle : trimmed.error.issues);

console.log('\n7. Generated upsert SQL');
const upsert = buildSiteMetadataUpsert(admin);
const placeholderCount = (upsert.text.match(/\$\d+/g) || []).length;
const insertedColumns = upsert.text
  .slice(upsert.text.indexOf('(') + 1, upsert.text.indexOf(')'))
  .split(',')
  .map((column) => column.trim());

check('inserts into public.site_settings', upsert.text.startsWith('INSERT INTO public.site_settings ('));
check('targets the partial unique index', upsert.text.includes('ON CONFLICT (is_active) WHERE is_active DO UPDATE'));
check('refreshes updated_at on conflict', upsert.text.includes('updated_at = NOW()'));
check('does not overwrite is_active', !upsert.text.includes('is_active = EXCLUDED'));
check(
  'placeholder count matches the value count',
  placeholderCount === upsert.values.length,
  { placeholders: placeholderCount, values: upsert.values.length },
);
check('returns the saved row', upsert.text.trim().endsWith('RETURNING *'));
check(
  'no duplicate insert columns',
  new Set(insertedColumns).size === insertedColumns.length,
);
check('is_active included so the conflict target resolves', insertedColumns.includes('is_active'));
check(
  'jsonb column is serialised',
  typeof upsert.values[insertedColumns.indexOf('page_metadata')] === 'string',
);

console.log('\n8. TypeScript columns <-> migration DDL');
const migration = readFileSync(
  new URL('../supabase/migrations/20261001000000_site_metadata_and_branding.sql', import.meta.url),
  'utf8',
);

// Columns that already exist in the base schema and are therefore not added by
// this migration.
const LEGACY_COLUMNS = [
  'site_name',
  'site_description',
  'contact_email',
  'contact_phone',
  'logo_url',
  'og_image',
];

const newlyAddedColumns = METADATA_COLUMN_NAMES.filter(
  (column) => !LEGACY_COLUMNS.includes(column),
);
const missingInMigration = newlyAddedColumns.filter(
  (column) => !new RegExp(`ADD COLUMN IF NOT EXISTS ${column}\\b`).test(migration),
);
check(
  'every column added by this feature is created by the migration',
  missingInMigration.length === 0,
  missingInMigration,
);
check(
  'legacy columns are left to the pre-existing schema',
  LEGACY_COLUMNS.every((column) => !new RegExp(`ADD COLUMN IF NOT EXISTS ${column}\\b`).test(migration)),
);
check('spot-checked columns are all mapped in TypeScript',
  ['page_title_home', 'favicon_url', 'twitter_card', 'heading_home_title', 'robots_indexing', 'page_metadata'].every(
    (column) => METADATA_COLUMN_NAMES.includes(column as never),
  ),
);
check(
  'the singleton column is written but not editable',
  insertedColumns.includes('is_active') && !METADATA_COLUMN_NAMES.includes('is_active' as never),
);

check('migration creates the partial unique index', /CREATE UNIQUE INDEX IF NOT EXISTS site_settings_single_active[\s\S]*WHERE is_active;/.test(migration));
check('migration seeds a row when the table is empty', /WHERE NOT EXISTS \(SELECT 1 FROM public\.site_settings\);/.test(migration));
check('migration provisions the public bucket', migration.includes("'site-assets'"));
check('migration restricts writes to admins', migration.includes("bucket_id = 'site-assets' AND public.is_admin()"));
check('migration is idempotent', !/CREATE TABLE(?! IF NOT EXISTS)/.test(migration));

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
