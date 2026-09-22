import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { corsMiddleware } from '../_middleware/cors';
import { errorMiddleware } from '../_middleware/error';
import type { Env } from '../_middleware/types';
import { healthRoutes } from '../../src/api/health';

let cachedApp: Hono<{ Bindings: Env }> | null = null;
let appPromise: Promise<Hono<{ Bindings: Env }>> | null = null;

async function getApp(): Promise<Hono<{ Bindings: Env }>> {
  if (cachedApp) return cachedApp;
  if (appPromise) return appPromise;

  appPromise = buildApp();
  return appPromise;
}

async function buildApp(): Promise<Hono<{ Bindings: Env }>> {
  const app = new Hono<{ Bindings: Env }>().basePath('/api');

  app.use('*', corsMiddleware);
  app.use('*', errorMiddleware);

  app.route('/health', healthRoutes);

const routeMap = [
    ['/auth', () => import('../../src/api/auth')],
    ['/listings', () => import('../../src/api/listings')],
    ['/categories', () => import('../../src/api/categories')],
    ['/search', () => import('../../src/api/search')],
    ['/reviews', () => import('../../src/api/reviews')],
    ['/buyer-requests', () => import('../../src/api/buyer-requests')],
    ['/messages', () => import('../../src/api/messages')],
    ['/notifications', () => import('../../src/api/notifications')],
    ['/users', () => import('../../src/api/users')],
    ['/analytics', () => import('../../src/api/analytics')],
    ['/push', () => import('../../src/api/push')],
    ['/copilot', () => import('../../src/api/copilot')],
    ['/admin', () => import('../../src/api/admin')],
    ['/market-insights', () => import('../../src/api/market-insights')],
    ['/email', () => import('../../src/api/email')],
    ['/otp', () => import('../../src/api/otp')],
    ['/admin-messaging', () => import('../../src/api/admin-messaging')],
  ] as const;

  for (const [path, loader] of routeMap) {
    try {
      const mod = await loader();
      const routeModule = mod.default || mod;
      app.route(path, routeModule as any);
    } catch (err) {
      console.error(`[routes] Failed to load ${path}:`, err instanceof Error ? err.message : String(err));
    }
  }

  app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
  });

  cachedApp = app;
  return app;
}

export const onRequest = async (context: any) => {
  const app = await getApp();
  return handle(app)(context);
};
