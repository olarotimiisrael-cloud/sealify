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

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;