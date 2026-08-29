import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { listingsRouter } from './routes/listings.js';
import { categoriesRouter } from './routes/categories.js';
import { searchRouter } from './routes/search.js';
import { reviewsRouter } from './routes/reviews.js';
import { buyerRequestsRouter } from './routes/buyer-requests.js';
import { messagesRouter } from './routes/messages.js';
import { notificationsRouter } from './routes/notifications.js';
import { usersRouter } from './routes/users.js';
import { analyticsRouter } from './routes/analytics.js';
import { pushRouter } from './routes/push.js';
import { copilotRouter } from './routes/copilot.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(corsMiddleware);

  if (!config.isProduction) {
    app.use(morgan('dev'));
  }

  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/listings', listingsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/buyer-requests', buyerRequestsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/push', pushRouter);
  app.use('/api/copilot', copilotRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
}
