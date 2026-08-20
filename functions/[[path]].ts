import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { api } from '../src/entry-server';

/**
 * This is the main Cloudflare Pages Function entry point.
 * It handles all requests that are not static assets.
 *
 * We are mounting the existing Hono application from `src/entry-server.ts`.
 * This keeps all API logic, middleware, and route definitions in the `src`
 * directory, consistent with the rest of the application code.
 */

const app = new Hono();

app.route('/api', api);

export const onRequest: PagesFunction = handle(app);