/**
 * Server-side persistence for administrator-managed site metadata.
 *
 * Read path: edge cache -> optional KV -> Hyperdrive -> Supabase REST -> defaults
 * Write path: Hyperdrive -> Supabase REST, then cache invalidation.
 *
 * Imported only from Cloudflare Pages Functions and Hono API routes; never from
 * client code.
 */

import { getSql } from '../db/hyperdrive';
import {
  DEFAULT_SITE_METADATA,
  metadataToRow,
  rowToMetadata,
  type SiteMetadata,
} from '../lib/siteMetadata';

type MetadataEnv = {
  HYPERDRIVE?: { connectionString: string };
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUBLIC_SITE_URL?: string;
  APP_URL?: string;
  SITE_METADATA_KV?: {
    get(key: string, type?: string): Promise<unknown>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
  };
};

const CACHE_KEY = 'sealify:site-metadata:v1';
const CACHE_TTL_SECONDS = 300;
const DB_TIMEOUT_MS = 2000;

const METADATA_SELECT = 'SELECT * FROM public.site_settings WHERE is_active = true LIMIT 1';

export function getSiteOrigin(env: MetadataEnv, requestUrl?: string): string {
  // Prefer the host the request arrived on. Falling back to a fixed domain
  // produced absolute asset URLs (favicon, logo, share image) pointing at a
  // host that does not serve this deployment, which surfaced in the browser as
  // a 503 on /logo.png.
  const requestOrigin = requestUrl ? safeOrigin(requestUrl) : '';
  if (requestOrigin) return requestOrigin;

  return (env.PUBLIC_SITE_URL || env.APP_URL || '').replace(/\/$/, '');
}

function safeOrigin(requestUrl: string): string {
  try {
    return new URL(requestUrl).origin;
  } catch {
    return '';
  }
}

/* -------------------------------------------------------------------------- */
/* Edge cache                                                                  */
/* -------------------------------------------------------------------------- */

function getEdgeCache(): Cache | null {
  try {
    // `caches.default` is a Cloudflare Workers global; the DOM lib types it as
    // a plain CacheStorage, so reach it through a narrow cast.
    const workerCaches = caches as unknown as { default?: Cache };
    return workerCaches.default || null;
  } catch {
    return null;
  }
}

async function readFromEdgeCache(): Promise<SiteMetadata | null> {
  const cache = getEdgeCache();
  if (!cache) return null;

  try {
    const cached = await cache.match(CACHE_KEY);
    if (!cached) return null;
    return rowToMetadata(await cached.json());
  } catch {
    return null;
  }
}

async function writeToEdgeCache(metadata: SiteMetadata): Promise<void> {
  const cache = getEdgeCache();
  if (!cache) return;

  try {
    const response = new Response(JSON.stringify(metadataToRow(metadata)), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=0, s-maxage=${CACHE_TTL_SECONDS}`,
      },
    });
    await cache.put(CACHE_KEY, response);
  } catch {
    /* caching is best-effort */
  }
}

/** Called by admin write routes so the next request sees the new values. */
export async function invalidateSiteMetadataCacheFor(env: MetadataEnv): Promise<void> {
  const kv = env?.SITE_METADATA_KV;
  if (kv) {
    try {
      await kv.delete(CACHE_KEY);
    } catch {
      /* ignore */
    }
  }

  const cache = getEdgeCache();
  if (cache) {
    try {
      await cache.delete(CACHE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/* -------------------------------------------------------------------------- */
/* KV                                                                          */
/* -------------------------------------------------------------------------- */

async function readFromKv(env: MetadataEnv): Promise<SiteMetadata | null> {
  const kv = env.SITE_METADATA_KV;
  if (!kv) return null;

  try {
    const value = await kv.get(CACHE_KEY, 'json');
    if (!value) return null;
    return rowToMetadata(value as Record<string, unknown>);
  } catch {
    return null;
  }
}

async function writeToKv(env: MetadataEnv, metadata: SiteMetadata): Promise<void> {
  const kv = env.SITE_METADATA_KV;
  if (!kv) return;

  try {
    await kv.put(CACHE_KEY, JSON.stringify(metadataToRow(metadata)));
  } catch {
    /* best effort */
  }
}

/* -------------------------------------------------------------------------- */
/* Database                                                                    */
/* -------------------------------------------------------------------------- */

async function readViaHyperdrive(env: MetadataEnv): Promise<SiteMetadata | null> {
  const sql = getSql(env);
  const rows = await sql.unsafe(METADATA_SELECT);
  return rows.length > 0 ? rowToMetadata(rows[0] as Record<string, unknown>) : null;
}

async function readViaRest(env: MetadataEnv): Promise<SiteMetadata | null> {
  if (!env.SUPABASE_URL) return null;

  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);

  try {
    const url = new URL(`${env.SUPABASE_URL}/rest/v1/site_settings`);
    url.searchParams.set('select', '*');
    url.searchParams.set('is_active', 'eq.true');
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString(), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const rows = (await response.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0
      ? rowToMetadata(rows[0] as Record<string, unknown>)
      : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Load metadata for request-time rendering. Never throws: a failure degrades to
 * the compiled defaults so page delivery is not blocked by the database.
 */
export async function loadSiteMetadata(env: MetadataEnv): Promise<SiteMetadata> {
  const cached = await readFromEdgeCache();
  if (cached) return cached;

  const fromKv = await readFromKv(env);
  if (fromKv) {
    await writeToEdgeCache(fromKv);
    return fromKv;
  }

  try {
    const fromDb = await readViaHyperdrive(env);
    if (fromDb) {
      await writeToKv(env, fromDb);
      await writeToEdgeCache(fromDb);
      return fromDb;
    }
  } catch {
    // Hyperdrive is unavailable in some environments (for example local dev
    // without a connection string); fall through to PostgREST.
  }

  const fromRest = await readViaRest(env);
  if (fromRest) {
    await writeToKv(env, fromRest);
    await writeToEdgeCache(fromRest);
    return fromRest;
  }

  return { ...DEFAULT_SITE_METADATA };
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                      */
/* -------------------------------------------------------------------------- */

export interface SaveResult {
  metadata: SiteMetadata;
  storage: 'hyperdrive' | 'rest';
}

/**
 * Builds the singleton upsert. Exported so the generated SQL can be asserted in
 * tests without a database connection.
 */
export function buildSiteMetadataUpsert(metadata: SiteMetadata): {
  text: string;
  values: unknown[];
} {
  // `is_active` is server-managed rather than part of the editable record, but
  // it must be written explicitly so the upsert always targets the singleton
  // row through the partial unique index.
  const row: Record<string, unknown> = { ...metadataToRow(metadata), is_active: true };
  const columns = Object.keys(row);
  const updates = columns
    .filter((column) => column !== 'is_active')
    .map((column) => `${column} = EXCLUDED.${column}`);

  updates.push('updated_at = NOW()');

  return {
    text:
      `INSERT INTO public.site_settings (${columns.join(', ')}) ` +
      `VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')}) ` +
      `ON CONFLICT (is_active) WHERE is_active DO UPDATE SET ${updates.join(', ')} ` +
      `RETURNING *`,
    values: columns.map((column) => {
      const value = row[column];
      return value === undefined ? null : value;
    }),
  };
}

async function saveViaHyperdrive(env: MetadataEnv, metadata: SiteMetadata): Promise<SiteMetadata> {
  const sql = getSql(env);
  const { text, values } = buildSiteMetadataUpsert(metadata);
  const rows = await sql.unsafe(text, values as never[]);

  if (rows.length === 0) {
    throw new Error('site_settings upsert returned no rows');
  }

  return rowToMetadata(rows[0] as Record<string, unknown>);
}

async function saveViaRest(env: MetadataEnv, metadata: SiteMetadata): Promise<SiteMetadata> {
  if (!env.SUPABASE_URL) {
    throw new Error('No database binding is available for site metadata persistence');
  }

  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('SUPABASE_ANON_KEY is not configured');
  }

  const row = metadataToRow(metadata);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);

  try {
    const url = new URL(`${env.SUPABASE_URL}/rest/v1/site_settings`);
    url.searchParams.set('on_conflict', 'is_active');
    // PostgREST cannot target a partial unique index through Prefer headers, so
    // the admin write path here uses an explicit read-then-write sequence.
    const controllerResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify([row]),
      signal: controller.signal,
    });

    if (!controllerResponse.ok) {
      throw new Error(`PostgREST write failed with HTTP ${controllerResponse.status}`);
    }

    const rows = (await controllerResponse.json()) as unknown[];
    return rows.length > 0
      ? rowToMetadata(rows[0] as Record<string, unknown>)
      : { ...metadata, updatedAt: new Date().toISOString() };
  } finally {
    clearTimeout(timeout);
  }
}

export async function saveSiteMetadata(
  env: MetadataEnv,
  metadata: SiteMetadata,
): Promise<SaveResult> {
  let storage: SaveResult['storage'] = 'hyperdrive';

  try {
    const saved = await saveViaHyperdrive(env, metadata);
    await writeToKv(env, saved);
    await writeToEdgeCache(saved);
    return { metadata: saved, storage };
  } catch (hyperdriveError) {
    console.error(
      '[site-metadata] Hyperdrive write failed, falling back to PostgREST:',
      hyperdriveError instanceof Error ? hyperdriveError.message : hyperdriveError,
    );
  }

  storage = 'rest';
  const saved = await saveViaRest(env, metadata);
  await writeToKv(env, saved);
  await writeToEdgeCache(saved);
  return { metadata: saved, storage };
}
