/**
 * Root Pages middleware: server-rendered site metadata.
 *
 * The React app only runs after JavaScript executes, so social crawlers
 * (WhatsApp, X, Facebook, Slack) and search engines would otherwise read the
 * static tags baked into index.html at build time. This middleware rewrites
 * served HTML documents so favicon, page titles, meta descriptions and
 * Open Graph / Twitter card tags reflect whatever an administrator saved most
 * recently — no redeploy required.
 *
 * Safety properties:
 *   * only document requests (GET/HEAD without a file extension) are touched
 *   * `/api/*` is left entirely to the API router
 *   * the HTML is only buffered when the response really is text/html
 *   * any failure falls through to the untouched response
 */

import type { EventContext } from 'hono/cloudflare-pages';
import {
  buildRobotsTxt,
  buildSitemapXml,
  injectHeadIntoHtml,
  resolveMetadata,
} from '../src/lib/siteMetadata';
import {
  getSiteOrigin,
  loadSiteMetadata,
} from '../src/server/siteMetadataStore';

/** Routes that must never receive public marketing metadata. */
const EXCLUDED_PREFIXES = ['/api', '/admin', '/auth'];

const DOCUMENT_CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';
const CRAWLER_CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600';

function isDocumentRequest(pathname: string): boolean {
  const lastSegment = pathname.split('/').pop() || '';
  // A trailing dot-segment or extension means this is a static asset.
  return !lastSegment.includes('.');
}

function isExcluded(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Serves robots.txt and sitemap.xml generated from the admin-managed settings so
 * hiding a page in the SEO panel also removes it from the crawl directives. Any
 * failure falls through to the static file checked into public/.
 */
async function serveGeneratedCrawlerFile(
  context: EventContext<any, any, any>,
): Promise<Response | null> {
  const { request, env, next } = context;
  const url = new URL(request.url);

  const kind = url.pathname === '/robots.txt' ? 'robots' : url.pathname === '/sitemap.xml' ? 'sitemap' : null;
  if (!kind) return null;

  try {
    const origin = getSiteOrigin(env, request.url);
    const metadata = await loadSiteMetadata(env);

    const body =
      kind === 'robots'
        ? buildRobotsTxt(metadata, origin)
        : buildSitemapXml(metadata, origin);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': kind === 'robots' ? 'text/plain; charset=utf-8' : 'application/xml; charset=utf-8',
        'Cache-Control': CRAWLER_CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error(`[site-metadata] generated ${url.pathname} failed:`, error);
    return next();
  }
}

export const onRequest = async (context: EventContext<any, any, any>) => {
  const { request, env, next } = context;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  const url = new URL(request.url);

  if (isExcluded(url.pathname)) {
    return next();
  }

  const crawlerFile = await serveGeneratedCrawlerFile(context);
  if (crawlerFile) return crawlerFile;

  if (!isDocumentRequest(url.pathname)) {
    return next();
  }

  try {
    const response = await next();
    const contentType = response.headers.get('Content-Type') || '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    const html = await response.text();
    const origin = getSiteOrigin(env, request.url);
    const metadata = await loadSiteMetadata(env);
    const resolved = resolveMetadata(metadata, { origin, path: url.pathname });
    const patched = injectHeadIntoHtml(html, resolved);

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', DOCUMENT_CACHE_CONTROL);

    return new Response(patched, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('[site-metadata] head injection skipped:', error);
    return next();
  }
};
