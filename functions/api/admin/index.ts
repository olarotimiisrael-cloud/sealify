import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { getSql } from '../../_middleware/db';
import { requireAdmin } from '../../_middleware/auth';
import { auditLog } from '../../_middleware/admin-service';
import type { AppContext } from '../../_middleware/types';

export const adminRoutes = new Hono<AppContext>();

adminRoutes.use('*', requireAdmin);

const idSchema = z.string().uuid();
const moderationStatusSchema = z.enum(['pending', 'in_review', 'approved', 'rejected', 'resolved', 'dismissed']);
const adminUserUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone_number: z.string().max(20).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  store_banner_url: z.string().url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  business_name: z.string().max(100).nullable().optional(),
  cac_number: z.string().max(100).nullable().optional(),
  business_hours: z.string().max(100).nullable().optional(),
  bank_name: z.string().max(100).nullable().optional(),
  account_number: z.string().max(30).nullable().optional(),
  account_name: z.string().max(100).nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  instagram_handle: z.string().max(50).nullable().optional(),
  twitter_handle: z.string().max(50).nullable().optional(),
  whatsapp_number: z.string().max(20).nullable().optional(),
  email_notifications: z.boolean().optional(),
  whatsapp_notifications: z.boolean().optional(),
  hide_phone_publicly: z.boolean().optional(),
  hide_location_publicly: z.boolean().optional(),
  role: z.enum(['buyer', 'seller', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'banned', 'restricted']).optional(),
  verified: z.boolean().optional(),
  verification_type: z.enum(['individual', 'business', 'premium', 'student', 'none']).optional(),
  restriction_reason: z.string().max(500).nullable().optional(),
  appeal_status: z.enum(['none', 'pending', 'resolved']).optional(),
}).strict();

adminRoutes.get('/stats', async (c) => {
  try {
    const sql = getSql(c.env);
    const [users, listings, revenue, reports, disputes, verifications, promotions, passwords] = await Promise.all([
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active, COUNT(*) FILTER (WHERE verified = true) as verified, COUNT(*) FILTER (WHERE role = 'admin') as admins FROM profiles`,
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM ads`,
      sql`SELECT SUM(rate) as total FROM promotion_plans WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM reports WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM disputes WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM verification_requests WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM promotion_payments WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM password_requests WHERE status = 'pending'`,
    ]);
    return c.json({
      users: users[0],
      listings: listings[0],
      revenue: revenue[0]?.total || 0,
      pending: {
        reports: reports[0]?.count || 0,
        disputes: disputes[0]?.count || 0,
        verifications: verifications[0]?.count || 0,
        promotions: promotions[0]?.count || 0,
        passwords: passwords[0]?.count || 0,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch admin stats' });
  }
});

adminRoutes.get('/users', async (c) => {
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
    if (role) { whereClause += ` AND role = $${paramIndex}`; params.push(role); paramIndex++; }
    if (status) { whereClause += ` AND status = $${paramIndex}`; params.push(status); paramIndex++; }
    if (verified !== undefined) { whereClause += ` AND verified = $${paramIndex}`; params.push(verified === 'true'); paramIndex++; }
    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    const offsetNum = parseInt(offset as string) || 0;
    const users = await sql`SELECT * FROM profiles ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM profiles ${sql(whereClause)}`;
    return c.json({ users, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (err) {
    console.error('Admin get users error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch users' });
  }
});

adminRoutes.put('/users/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = idSchema.parse(c.req.param('id'));
    const body = await c.req.json();
    const updates: any = { updated_at: new Date(), ...adminUserUpdateSchema.parse(body) };
    const result = await sql`UPDATE profiles SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'User not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'User Updated', `Updated user ${id}`, 'user');
    return c.json({ user: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update user error:', err);
    throw new HTTPException(500, { message: 'Failed to update user' });
  }
});

adminRoutes.delete('/users/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const user = c.get('user')!;
    if (user.id === id) throw new HTTPException(400, { message: 'Cannot delete your own account' });
    await sql`DELETE FROM profiles WHERE id = ${id}`;
    await auditLog(sql, user.id, 'User Deleted', `Deleted user ${id}`, 'user');
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin delete user error:', err);
    throw new HTTPException(500, { message: 'Failed to delete user' });
  }
});

adminRoutes.get('/listings', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'active', limit = '50', offset = '0' } = c.req.query();
    const listings = await sql`SELECT a.*, p.full_name as seller_name FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id WHERE a.status = ${status} ORDER BY a.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ listings });
  } catch (err) {
    console.error('Admin get listings error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch listings' });
  }
});

adminRoutes.get('/reports', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const reports = await sql`SELECT r.*, p.full_name as reporter_name FROM reports r LEFT JOIN profiles p ON r.reporter_id = p.id WHERE r.status = ${status} ORDER BY r.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ reports });
  } catch (err) {
    console.error('Admin get reports error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch reports' });
  }
});

adminRoutes.put('/reports/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['resolved', 'dismissed']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE reports SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Report not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Report Processed', `Report ${id} ${status}`, 'security');
    return c.json({ report: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update report error:', err);
    throw new HTTPException(500, { message: 'Failed to update report' });
  }
});

adminRoutes.get('/disputes', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const disputes = await sql`SELECT d.*, p.full_name as user_name FROM disputes d LEFT JOIN profiles p ON d.user_id = p.id WHERE d.status = ${status} ORDER BY d.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ disputes });
  } catch (err) {
    console.error('Admin get disputes error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch disputes' });
  }
});

adminRoutes.put('/disputes/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['in_review', 'resolved']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE disputes SET status = ${status}, admin_notes = ${admin_notes || null} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Dispute not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Dispute Processed', `Dispute ${id} ${status}`, 'dispute');
    return c.json({ dispute: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update dispute error:', err);
    throw new HTTPException(500, { message: 'Failed to update dispute' });
  }
});

adminRoutes.get('/verifications', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const verifications = await sql`SELECT * FROM verification_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ verifications });
  } catch (err) {
    console.error('Admin get verifications error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch verifications' });
  }
});

adminRoutes.put('/verifications/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['approved', 'rejected']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE verification_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Verification not found' });
    if (status === 'approved') {
      await sql`UPDATE profiles SET verified = true, verification_type = (SELECT type FROM verification_requests WHERE id = ${id}) WHERE id = (SELECT user_id FROM verification_requests WHERE id = ${id})`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Verification Processed', `Verification ${id} ${status}`, 'verification');
    return c.json({ verification: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update verification error:', err);
    throw new HTTPException(500, { message: 'Failed to update verification' });
  }
});

adminRoutes.get('/promotions', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const promotions = await sql`SELECT pp.*, p.full_name as user_name FROM promotion_payments pp LEFT JOIN profiles p ON pp.user_id = p.id WHERE pp.status = ${status} ORDER BY pp.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ promotions });
  } catch (err) {
    console.error('Admin get promotions error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch promotions' });
  }
});

adminRoutes.put('/promotions/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['approved', 'rejected']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE promotion_payments SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Promotion not found' });
    if (status === 'approved') {
      await sql`UPDATE ads SET featured = true, promotion_plan_name = (SELECT plan_name FROM promotion_payments WHERE id = ${id}), promotion_duration_months = (SELECT duration_months FROM promotion_payments WHERE id = ${id}), promotion_start_date = NOW(), promotion_end_date = NOW() + INTERVAL '1 month' * (SELECT duration_months FROM promotion_payments WHERE id = ${id}) WHERE id = (SELECT ad_id FROM promotion_payments WHERE id = ${id})`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Promotion Processed', `Promotion ${id} ${status}`, 'finance');
    return c.json({ promotion: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update promotion error:', err);
    throw new HTTPException(500, { message: 'Failed to update promotion' });
  }
});

adminRoutes.get('/passwords', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const passwords = await sql`SELECT * FROM password_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ passwords });
  } catch (err) {
    console.error('Admin get passwords error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch password requests' });
  }
});

adminRoutes.put('/passwords/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const { status, admin_notes } = body;
    const result = await sql`UPDATE password_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Password request not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Password Request Processed', `Password request ${id} ${status}`, 'security');
    return c.json({ password: result[0] });
  } catch (err) {
    console.error('Admin update password error:', err);
    throw new HTTPException(500, { message: 'Failed to update password request' });
  }
});

adminRoutes.get('/audit-logs', async (c) => {
  try {
    const sql = getSql(c.env);
    const { type, limit = '100', offset = '0' } = c.req.query();
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    if (type) { whereClause += ` AND type = $${paramIndex}`; params.push(type); paramIndex++; }
    const logs = await sql`SELECT al.*, p.full_name as user_name FROM audit_logs al LEFT JOIN profiles p ON al.user_id = p.id ${sql(whereClause)} ORDER BY al.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ logs });
  } catch (err) {
    console.error('Admin get audit logs error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch audit logs' });
  }
});

adminRoutes.get('/intrusion-logs', async (c) => {
  try {
    const sql = getSql(c.env);
    const { limit = '100', offset = '0' } = c.req.query();
    const logs = await sql`SELECT * FROM intrusion_logs ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ logs });
  } catch (err) {
    console.error('Admin get intrusion logs error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch intrusion logs' });
  }
});

adminRoutes.get('/system-config', async (c) => {
  try {
    const sql = getSql(c.env);
    const configs = await sql`SELECT * FROM system_configs ORDER BY key`;
    return c.json({ configs });
  } catch (err) {
    console.error('Admin get system config error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch system config' });
  }
});

adminRoutes.put('/system-config', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
      const typedValue = value as boolean | number | string;
      await sql`INSERT INTO system_configs (key, value, description) VALUES (${key}, ${typedValue}, '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'System Config Updated', `Updated config: ${Object.keys(body).join(', ')}`, 'security');
    return c.json({ success: true });
  } catch (err) {
    console.error('Admin update system config error:', err);
    throw new HTTPException(500, { message: 'Failed to update system config' });
  }
});

adminRoutes.get('/site-settings', async (c) => {
  try {
    const sql = getSql(c.env);
    const settings = await sql`SELECT * FROM site_settings ORDER BY key`;
    return c.json({ settings });
  } catch (err) {
    console.error('Admin get site settings error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch site settings' });
  }
});

adminRoutes.put('/site-settings', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
      const typedValue = value as string;
      await sql`INSERT INTO site_settings (key, value, description) VALUES (${key}, ${typedValue}, '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Site Settings Updated', `Updated settings: ${Object.keys(body).join(', ')}`, 'settings');
    return c.json({ success: true });
  } catch (err) {
    console.error('Admin update site settings error:', err);
    throw new HTTPException(500, { message: 'Failed to update site settings' });
  }
});

adminRoutes.post('/broadcast', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    const { target, title, message } = body;
    const userIds = target === 'all'
      ? (await sql`SELECT id FROM profiles`).map((r: any) => r.id)
      : (await sql`SELECT id FROM profiles WHERE role = ${target}`).map((r: any) => r.id);
    for (const userId of userIds) {
      await sql`INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (${userId}, ${title}, ${message}, 'broadcast', NOW())`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Broadcast Sent', `Sent to ${userIds.length} users`, 'notification');
    return c.json({ success: true, recipients: userIds.length });
  } catch (err) {
    console.error('Admin broadcast error:', err);
    throw new HTTPException(500, { message: 'Failed to send broadcast' });
  }
});

export default adminRoutes;