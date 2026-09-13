import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth, requireAdmin } from '../../_middleware/auth';
import { isAdmin } from '../../_middleware/admin-service';
import type { AppContext } from '../../_middleware/types';

export const usersRoutes = new Hono<AppContext>();

usersRoutes.get('/', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const { search, role, status, verified, limit = '50', offset = '0' } = c.req.query();

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (verified !== undefined) {
      whereClause += ` AND verified = $${paramIndex}`;
      params.push(verified === 'true');
      paramIndex++;
    }

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const users = await sql`SELECT * FROM profiles ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM profiles ${sql(whereClause)}`;

    return c.json({ users, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (err) {
    console.error('Get users error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch users' });
  }
});

usersRoutes.get('/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');

    const user = await sql`SELECT * FROM profiles WHERE id = ${id}`;
    if (user.length === 0) throw new HTTPException(404, { message: 'User not found' });

    const listingsCount = await sql`SELECT COUNT(*) as count FROM ads WHERE seller_id = ${id}`;
    return c.json({ user: user[0], listingsCount: parseInt(listingsCount[0]?.count || '0') });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Get user error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch user' });
  }
});

usersRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const id = c.req.param('id');

    const requester = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    const isAdminUser = requester.length > 0 && requester[0].role === 'admin';
    if (!isAdminUser && user.id !== id) throw new HTTPException(403, { message: 'Forbidden' });

    const body = await c.req.json();
    const allowedFields = ['full_name', 'phone_number', 'avatar_url', 'store_banner_url', 'bio', 'location', 'business_name', 'cac_number', 'business_hours', 'bank_name', 'account_number', 'account_name', 'website_url', 'instagram_handle', 'twitter_handle', 'whatsapp_number', 'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly', 'hide_location_publicly'];
    if (isAdminUser) allowedFields.push('role', 'status', 'verified', 'verification_type', 'restriction_reason', 'appeal_status');

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const result = await sql`UPDATE profiles SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'User not found' });

    return c.json({ user: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Update user error:', err);
    throw new HTTPException(500, { message: 'Failed to update user' });
  }
});

usersRoutes.delete('/:id', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const id = c.req.param('id');

    if (user.id === id) throw new HTTPException(400, { message: 'Cannot delete your own account' });
    await sql`DELETE FROM profiles WHERE id = ${id}`;
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Delete user error:', err);
    throw new HTTPException(500, { message: 'Failed to delete user' });
  }
});

usersRoutes.get('/:id/listings', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const { status = 'active', limit = '20', offset = '0' } = c.req.query();

    const listings = await sql`SELECT * FROM ads WHERE seller_id = ${id} AND status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    return c.json({ listings });
  } catch (err) {
    console.error('Get user listings error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch user listings' });
  }
});

usersRoutes.get('/:id/reviews', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');

    const reviews = await sql`SELECT r.*, u.full_name as buyer_name, u.avatar_url as buyer_avatar FROM reviews r LEFT JOIN profiles u ON r.buyer_id = u.id WHERE r.seller_id = ${id} ORDER BY r.created_at DESC`;
    return c.json({ reviews });
  } catch (err) {
    console.error('Get user reviews error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch user reviews' });
  }
});

export default usersRoutes;