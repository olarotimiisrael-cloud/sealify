import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getSql } from '../db/postgres.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAdmin } from '../middleware/auth.js';
import { auditLog } from '../services/admin-service.js';

export const adminRouter = Router();

const idSchema = z.string().uuid();
const moderationStatusSchema = z.enum(["pending", "in_review", "approved", "rejected", "resolved", "dismissed"]);
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
  role: z.enum(["buyer", "seller", "admin"]).optional(),
  status: z.enum(["active", "suspended", "banned", "restricted"]).optional(),
  verified: z.boolean().optional(),
  verification_type: z.enum(["individual", "business", "premium", "student", "none"]).optional(),
  restriction_reason: z.string().max(500).nullable().optional(),
  appeal_status: z.enum(["none", "pending", "resolved"]).optional(),
}).strict();

adminRouter.use(requireAdmin);

adminRouter.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
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
    res.json({
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
    next(err);
  }
});

adminRouter.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { search, role, status, verified, limit = '50', offset = '0' } = req.query;
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
    res.json({ users, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = idSchema.parse(req.params.id);
    const updates: any = { updated_at: new Date(), ...adminUserUpdateSchema.parse(req.body) };
    const result = await sql`UPDATE profiles SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new AppError('User not found', 404);
    await auditLog((req as any).user.id, 'User Updated', `Updated user ${id}`, 'user');
    res.json({ user: result[0] });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    if ((req as any).user.id === id) throw new AppError('Cannot delete your own account', 400);
    await sql`DELETE FROM profiles WHERE id = ${id}`;
    await auditLog((req as any).user.id, 'User Deleted', `Deleted user ${id}`, 'user');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { status = 'active', limit = '50', offset = '0' } = req.query;
    const listings = await sql`SELECT a.*, p.full_name as seller_name FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id WHERE a.status = ${status} ORDER BY a.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { status = 'pending', limit = '50', offset = '0' } = req.query;
    const reports = await sql`SELECT r.*, p.full_name as reporter_name FROM reports r LEFT JOIN profiles p ON r.reporter_id = p.id WHERE r.status = ${status} ORDER BY r.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/reports/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    const status = z.enum(["resolved", "dismissed"]).parse(req.body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(req.body.admin_notes);
    const result = await sql`UPDATE reports SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new AppError('Report not found', 404);
    await auditLog((req as any).user.id, 'Report Processed', `Report ${id} ${status}`, 'security');
    res.json({ report: result[0] });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/disputes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { status = 'pending', limit = '50', offset = '0' } = req.query;
    const disputes = await sql`SELECT d.*, p.full_name as user_name FROM disputes d LEFT JOIN profiles p ON d.user_id = p.id WHERE d.status = ${status} ORDER BY d.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ disputes });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/disputes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    const status = z.enum(["in_review", "resolved"]).parse(req.body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(req.body.admin_notes);
    const result = await sql`UPDATE disputes SET status = ${status}, admin_notes = ${admin_notes || null} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new AppError('Dispute not found', 404);
    await auditLog((req as any).user.id, 'Dispute Processed', `Dispute ${id} ${status}`, 'dispute');
    res.json({ dispute: result[0] });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/verifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { status = 'pending', limit = '50', offset = '0' } = req.query;
    const verifications = await sql`SELECT * FROM verification_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ verifications });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/verifications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    const status = z.enum(["approved", "rejected"]).parse(req.body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(req.body.admin_notes);
    const result = await sql`UPDATE verification_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new AppError('Verification not found', 404);
    if (status === 'approved') {
      await sql`UPDATE profiles SET verified = true, verification_type = (SELECT type FROM verification_requests WHERE id = ${id}) WHERE id = (SELECT user_id FROM verification_requests WHERE id = ${id})`;
    }
    await auditLog((req as any).user.id, 'Verification Processed', `Verification ${id} ${status}`, 'verification');
    res.json({ verification: result[0] });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/promotions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { status = 'pending', limit = '50', offset = '0' } = req.query;
    const promotions = await sql`SELECT pp.*, p.full_name as user_name FROM promotion_payments pp LEFT JOIN profiles p ON pp.user_id = p.id WHERE pp.status = ${status} ORDER BY pp.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ promotions });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/promotions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    const status = z.enum(["approved", "rejected"]).parse(req.body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(req.body.admin_notes);
    const result = await sql`UPDATE promotion_payments SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new AppError('Promotion not found', 404);
    if (status === 'approved') {
      await sql`UPDATE ads SET featured = true, promotion_plan_name = (SELECT plan_name FROM promotion_payments WHERE id = ${id}), promotion_duration_months = (SELECT duration_months FROM promotion_payments WHERE id = ${id}), promotion_start_date = NOW(), promotion_end_date = NOW() + INTERVAL '1 month' * (SELECT duration_months FROM promotion_payments WHERE id = ${id}) WHERE id = (SELECT ad_id FROM promotion_payments WHERE id = ${id})`;
    }
    await auditLog((req as any).user.id, 'Promotion Processed', `Promotion ${id} ${status}`, 'finance');
    res.json({ promotion: result[0] });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/passwords', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { status = 'pending', limit = '50', offset = '0' } = req.query;
    const passwords = await sql`SELECT * FROM password_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ passwords });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/passwords/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    const { status, admin_notes } = req.body;
    const result = await sql`UPDATE password_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new AppError('Password request not found', 404);
    await auditLog((req as any).user.id, 'Password Request Processed', `Password request ${id} ${status}`, 'security');
    res.json({ password: result[0] });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { type, limit = '100', offset = '0' } = req.query;
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    if (type) { whereClause += ` AND type = $${paramIndex}`; params.push(type); paramIndex++; }
    const logs = await sql`SELECT al.*, p.full_name as user_name FROM audit_logs al LEFT JOIN profiles p ON al.user_id = p.id ${sql(whereClause)} ORDER BY al.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/intrusion-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { limit = '100', offset = '0' } = req.query;
    const logs = await sql`SELECT * FROM intrusion_logs ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/system-config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const configs = await sql`SELECT * FROM system_configs ORDER BY key`;
    res.json({ configs });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/system-config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const body = req.body;
    for (const [key, value] of Object.entries(body)) {
      const typedValue = value as boolean | number | string;
      await sql`INSERT INTO system_configs (key, value, description) VALUES (${key}, ${typedValue}, '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    }
    await auditLog((req as any).user.id, 'System Config Updated', `Updated config: ${Object.keys(body).join(', ')}`, 'security');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/site-settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const settings = await sql`SELECT * FROM site_settings ORDER BY key`;
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/site-settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const body = req.body;
    for (const [key, value] of Object.entries(body)) {
      const typedValue = value as string;
      await sql`INSERT INTO site_settings (key, value, description) VALUES (${key}, ${typedValue}, '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    }
    await auditLog((req as any).user.id, 'Site Settings Updated', `Updated settings: ${Object.keys(body).join(', ')}`, 'settings');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/broadcast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { target, title, message } = req.body;
    const userIds = target === 'all'
      ? (await sql`SELECT id FROM profiles`).map((r: any) => r.id)
      : (await sql`SELECT id FROM profiles WHERE role = ${target}`).map((r: any) => r.id);
    for (const userId of userIds) {
      await sql`INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (${userId}, ${title}, ${message}, 'broadcast', NOW())`;
    }
    await auditLog((req as any).user.id, 'Broadcast Sent', `Sent to ${userIds.length} users`, 'notification');
    res.json({ success: true, recipients: userIds.length });
  } catch (err) {
    next(err);
  }
});
