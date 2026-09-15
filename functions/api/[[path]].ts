import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { corsMiddleware } from '../_middleware/cors';
import { errorMiddleware } from '../_middleware/error';
import type { Env } from '../_middleware/types';
import { healthRoutes } from '../../src/api/health';
import { authRoutes } from '../../src/api/auth';
import { listingsRoutes } from '../../src/api/listings';
import { categoriesRoutes } from '../../src/api/categories';
import { searchRoutes } from '../../src/api/search';
import { reviewsRoutes } from '../../src/api/reviews';
import { buyerRequestsRoutes } from '../../src/api/buyer-requests';
import { messagesRoutes } from '../../src/api/messages';
import { notificationsRoutes } from '../../src/api/notifications';
import { usersRoutes } from '../../src/api/users';
import { analyticsRoutes } from '../../src/api/analytics';
import { pushRoutes } from '../../src/api/push';
import { copilotRoutes } from '../../src/api/copilot';
import { adminRoutes } from '../../src/api/admin';
import { marketInsightsRoutes } from '../../src/api/market-insights';

const app = new Hono<{ Bindings: Env }>().basePath('/api');

// Global middleware
app.use('*', corsMiddleware);
app.use('*', errorMiddleware);

// Health check (no auth required)
app.route('/health', healthRoutes);

// Auth routes (public)
app.route('/auth', authRoutes);

// Protected routes
app.route('/listings', listingsRoutes);
app.route('/categories', categoriesRoutes);
app.route('/search', searchRoutes);
app.route('/reviews', reviewsRoutes);
app.route('/buyer-requests', buyerRequestsRoutes);
app.route('/messages', messagesRoutes);
app.route('/notifications', notificationsRoutes);
app.route('/users', usersRoutes);

// Admin-only routes
app.route('/analytics', analyticsRoutes);
app.route('/push', pushRoutes);
app.route('/copilot', copilotRoutes);
app.route('/admin', adminRoutes);
app.route('/market-insights', marketInsightsRoutes);

export const onRequest = handle(app);
export default app;