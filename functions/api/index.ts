import { Hono } from 'hono';
import { corsMiddleware } from '../_middleware/cors';
import { errorMiddleware } from '../_middleware/error';
import type { Env } from '../_middleware/types';

// Import all route modules
import authRoutes from './auth';
import listingsRoutes from './listings';
import categoriesRoutes from './categories';
import searchRoutes from './search';
import reviewsRoutes from './reviews';
import buyerRequestsRoutes from './buyer-requests';
import messagesRoutes from './messages';
import notificationsRoutes from './notifications';
import usersRoutes from './users';
import analyticsRoutes from './analytics';
import pushRoutes from './push';
import copilotRoutes from './copilot';
import adminRoutes from './admin';
import healthRoutes from './health';

// Create main app
const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', corsMiddleware);
app.use('*', errorMiddleware);

// Health check (no auth required)
app.route('/api/health', healthRoutes);

// Auth routes (public)
app.route('/api/auth', authRoutes);

// Protected routes
app.route('/api/listings', listingsRoutes);
app.route('/api/categories', categoriesRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/reviews', reviewsRoutes);
app.route('/api/buyer-requests', buyerRequestsRoutes);
app.route('/api/messages', messagesRoutes);
app.route('/api/notifications', notificationsRoutes);
app.route('/api/users', usersRoutes);

// Admin-only routes
app.route('/api/analytics', analyticsRoutes);
app.route('/api/push', pushRoutes);
app.route('/api/copilot', copilotRoutes);
app.route('/api/admin', adminRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;