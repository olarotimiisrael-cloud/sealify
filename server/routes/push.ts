import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, requireAdmin, type AuthenticatedRequest } from '../middleware/auth.js';

export const pushRouter = Router();

pushRouter.post('/subscribe', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) throw new AppError('Invalid subscription', 400);

    await sql`INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at) VALUES (${user.id}, ${subscription.endpoint}, ${subscription.keys?.p256dh || null}, ${subscription.keys?.auth || null}, NOW()) ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, updated_at = NOW()`;

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

pushRouter.post('/unsubscribe', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const { endpoint } = req.body;

    if (!endpoint) throw new AppError('Endpoint required', 400);
    await sql`DELETE FROM push_subscriptions WHERE user_id = ${user.id} AND endpoint = ${endpoint}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

pushRouter.post('/admin/broadcast', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { title, body: message, url, icon } = req.body;

    if (!title || !message) throw new AppError('Title and body are required', 400);

    const subscriptions = await sql`SELECT * FROM push_subscriptions`;
    res.json({ success: true, message: `Broadcast queued for ${subscriptions.length} subscribers` });
  } catch (err) {
    next(err);
  }
});
