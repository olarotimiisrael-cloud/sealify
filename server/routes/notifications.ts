import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const { limit = "50", offset = "0", unreadOnly } = req.query;

    let whereClause = "WHERE user_id = $1";
    const params: any[] = [user.id];
    if (unreadOnly === "true") { whereClause += " AND read = false"; }

    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    const offsetNum = parseInt(offset as string) || 0;

    const notifications = await sql`SELECT * FROM notifications ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const unreadCount = await sql`SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user.id} AND read = false`;

    res.json({ notifications, unreadCount: parseInt(unreadCount[0]?.count || "0"), limit: limitNum, offset: offsetNum });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.put('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const id = req.params.id;

    const result = await sql`UPDATE notifications SET read = true WHERE id = ${id} AND user_id = ${user.id} RETURNING *`;
    if (result.length === 0) throw new AppError('Notification not found', 404);

    res.json({ notification: result[0] });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.put('/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;

    await sql`UPDATE notifications SET read = true WHERE user_id = ${user.id} AND read = false`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const id = req.params.id;

    await sql`DELETE FROM notifications WHERE id = ${id} AND user_id = ${user.id}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
