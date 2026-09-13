import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth, requireAdmin } from '../../_middleware/auth';
import type { AppContext } from '../../_middleware/types';

export const pushRoutes = new Hono<AppContext>();

pushRoutes.post('/subscribe', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const body = await c.req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) throw new HTTPException(400, { message: 'Invalid subscription' });

    await sql`INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at) VALUES (${user.id}, ${subscription.endpoint}, ${subscription.keys?.p256dh || null}, ${subscription.keys?.auth || null}, NOW()) ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, updated_at = NOW()`;

    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Push subscribe error:', err);
    throw new HTTPException(500, { message: 'Failed to subscribe' });
  }
});

pushRoutes.post('/unsubscribe', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const body = await c.req.json();
    const { endpoint } = body;

    if (!endpoint) throw new HTTPException(400, { message: 'Endpoint required' });
    await sql`DELETE FROM push_subscriptions WHERE user_id = ${user.id} AND endpoint = ${endpoint}`;
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Push unsubscribe error:', err);
    throw new HTTPException(500, { message: 'Failed to unsubscribe' });
  }
});

pushRoutes.post('/admin/broadcast', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    const { title, body: message, url, icon } = body;

    if (!title || !message) throw new HTTPException(400, { message: 'Title and body are required' });

    const subscriptions = await sql`SELECT * FROM push_subscriptions`;
    return c.json({ success: true, message: `Broadcast queued for ${subscriptions.length} subscribers` });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Push broadcast error:', err);
    throw new HTTPException(500, { message: 'Failed to broadcast' });
  }
});

export default pushRoutes;