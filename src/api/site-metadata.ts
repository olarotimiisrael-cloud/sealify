/**
 * Public site metadata API.
 *
 * Unauthenticated by design: everything exposed here is already public (page
 * titles, meta descriptions, link previews, branding assets). The app uses it
 * to hydrate the document head and to render administrator-managed headings and
 * logos without a redeploy.
 */

import { Hono } from 'hono';
import { rateLimit } from '../middleware/security';
import {
  getSiteOrigin,
  loadSiteMetadata,
} from '../server/siteMetadataStore';
import {
  EDITABLE_PAGE_DEFINITIONS,
  PAGE_DEFINITIONS,
  resolveMetadata,
  type ResolveOptions,
} from '../lib/siteMetadata';

export const siteMetadataRoutes = new Hono<{ Bindings: any }>();

siteMetadataRoutes.use('*', rateLimit({ windowMs: 60000, maxRequests: 240 }));

/** GET /api/site-metadata?path=/faq */
siteMetadataRoutes.get('/', async (c) => {
  const metadata = await loadSiteMetadata(c.env);
  const origin = getSiteOrigin(c.env, c.req.url);
  const path = c.req.query('path') || '/';

  const resolved = resolveMetadata(metadata, { origin, path });

  // Allow the edge to cache briefly; the admin write path invalidates eagerly.
  c.header('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');

  return c.json({
    settings: metadata,
    resolved,
    pages: PAGE_DEFINITIONS.map((definition) => ({
      path: definition.path,
      label: definition.label,
      editable: definition.editable,
    })),
  });
});

/**
 * GET /api/site-metadata/resolve?path=/listing/123&title=...&image=...
 *
 * Resolves metadata for arbitrary entity routes (listing detail, seller
 * profile) where the client knows the entity details.
 */
siteMetadataRoutes.get('/resolve', async (c) => {
  const metadata = await loadSiteMetadata(c.env);
  const origin = getSiteOrigin(c.env, c.req.url);

  const options: ResolveOptions = {
    origin,
    path: c.req.query('path') || '/',
    title: c.req.query('title') || undefined,
    description: c.req.query('description') || undefined,
    image: c.req.query('image') || undefined,
  };

  return c.json({ resolved: resolveMetadata(metadata, options) });
});

/** GET /api/site-metadata/pages — editable route registry for the admin UI. */
siteMetadataRoutes.get('/pages', async (c) => {
  const metadata = await loadSiteMetadata(c.env);
  const origin = getSiteOrigin(c.env, c.req.url);

  return c.json({
    pages: EDITABLE_PAGE_DEFINITIONS.map((definition) => ({
      path: definition.path,
      label: definition.label,
      defaultTitle: definition.defaultTitle,
      defaultDescription: definition.defaultDescription,
      override: metadata.pageMetadata?.[definition.path] || {},
      resolved: resolveMetadata(metadata, { origin, path: definition.path }),
    })),
  });
});

export default siteMetadataRoutes;
