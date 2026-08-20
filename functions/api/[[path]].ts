import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { EventContext } from '@cloudflare/workers-types';

import { authRoutes } from '../../src/api/auth';
import { listingsRoutes } from '../../src/api/listings';
import { messagesRoutes } from '../../src/api/messages';
import { notificationsRoutes } from '../../src/api/notifications';
import { adminRoutes } from '../../src/api/admin';
import { usersRoutes } from '../../src/api/users';
import { categoriesRoutes } from '../../src/api/categories';
import { buyerRequestsRoutes } from '../../src/api/buyer-requests';
import { reviewsRoutes } from '../../src/api/reviews';
import { searchRoutes } from '../../src/api/search';
import { analyticsRoutes } from '../../src/api/analytics';
import { pushRoutes } from '../../src/api/push';
import { healthRoutes } from '../../src/api/health';
import { copilotRoutes } from '../../src/api/copilot';

interface HyperdriveBinding {
  connectionString: string;
}

interface Env {
  HYPERDRIVE?: HyperdriveBinding;
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_ANON_KEY: string;
  [key: string]: unknown;
}

const api = new Hono<{ Bindings: Env }>();

api.use(
  '*',
  cors({
    origin: [
      'https://sealify.thesealconsult.com.ng',
      'https://sealify.pages.dev',
      'https://sealify.ng',
      'https://www.sealify.ng',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

api.route('/api', healthRoutes);
api.route('/api/auth', authRoutes);
api.route('/api/copilot', copilotRoutes);
api.route('/api/listings', listingsRoutes);
api.route('/api/users', usersRoutes);
api.route('/api/messages', messagesRoutes);
api.route('/api/notifications', notificationsRoutes);
api.route('/api/admin', adminRoutes);
api.route('/api/categories', categoriesRoutes);
api.route('/api/buyer-requests', buyerRequestsRoutes);
api.route('/api/reviews', reviewsRoutes);
api.route('/api/search', searchRoutes);
api.route('/api/analytics', analyticsRoutes);
api.route('/api/push', pushRoutes);

export const onRequest = (context: EventContext<Env>): Promise<Response> => {
  const env: Env = {
    ...context.env,
    NEXT_PUBLIC_SUPABASE_URL:
      context.env.SUPABASE_URL || context.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  return api.fetch(context.request, env, context);
};
