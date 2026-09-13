import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth } from '../../_middleware/auth';
import type { AppContext } from '../../_middleware/types';

export const notificationsRoutes = new Hono<AppContext>();

notificationsRoutes.get('/', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const { limit = '50', offset = '0', unreadOnly } = c.req.query();

    let whereClause = 'WHERE user_id = $1';
    const params: any[] = [user.id];
    if (unreadOnly === 'true') {
      whereClause += ' AND read = false';
    }

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const notifications = await sql`SELECT * FROM notifications ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const unreadCount = await sql`SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user.id} AND read = false`;

    return c.json({
      notifications,
      unreadCount: parseInt(unreadCount[0]?.count || '0'),
      limit: limitNum,
      offset: offsetNum
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch notifications' });
  }
});

notificationsRoutes.put('/:id/read', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const id = c.req.param('id');

    const result = await sql`UPDATE notifications SET read = true WHERE id = ${id} AND user_id = ${user.id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Notification not found' });

    return c.json({ notification: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Mark notification read error:', err);
    throw new HTTPException(500, { message: 'Failed to mark notification as read' });
  }
});

notificationsRoutes.put('/read-all', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;

    await sql`UPDATE notifications SET read = true WHERE user_id = ${user.id} AND read = false`;
    return c.json({ success: true });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    throw new HTTPException(500, { message: 'Failed to mark all notifications as read' });
  }
});

notificationsRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const id = c.req.param('id');

    await sql`DELETE FROM notifications WHERE id = ${id} AND user_id = ${user.id}`;
    return c.json({ success: true });
  } catch (err) {
    console.error('Delete notification error:', err);
    throw new HTTPException(500, { message: 'Failed to delete notification' });
  }
});

export default notificationsRoutes;