import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, requireAdmin, type AuthenticatedRequest } from '../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get('/', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { search, role, status, verified, limit = "50", offset = "0" } = req.query;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;
    if (search) { whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`; params.push(`%${search}%`); paramIndex++; }
    if (role) { whereClause += ` AND role = $${paramIndex}`; params.push(role); paramIndex++; }
    if (status) { whereClause += ` AND status = $${paramIndex}`; params.push(status); paramIndex++; }
    if (verified !== undefined) { whereClause += ` AND verified = $${paramIndex}`; params.push(verified === "true"); paramIndex++; }

    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    const offsetNum = parseInt(offset as string) || 0;

    const users = await sql`SELECT * FROM profiles ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM profiles ${sql(whereClause)}`;

    res.json({ users, total: parseInt(countResult[0]?.total || "0"), limit: limitNum, offset: offsetNum });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;

    const user = await sql`SELECT * FROM profiles WHERE id = ${id}`;
    if (user.length === 0) throw new AppError('User not found', 404);

    const listingsCount = await sql`SELECT COUNT(*) as count FROM ads WHERE seller_id = ${id}`;
    res.json({ user: user[0], listingsCount: parseInt(listingsCount[0]?.count || "0") });
  } catch (err) {
    next(err);
  }
});

usersRouter.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const id = req.params.id;

    const requester = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    const isAdmin = requester.length > 0 && requester[0].role === 'admin';
    if (!isAdmin && user.id !== id) throw new AppError('Forbidden', 403);

    const allowedFields = ['full_name', 'phone_number', 'avatar_url', 'store_banner_url', 'bio', 'location', 'business_name', 'cac_number', 'business_hours', 'bank_name', 'account_number', 'account_name', 'website_url', 'instagram_handle', 'twitter_handle', 'whatsapp_number', 'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly', 'hide_location_publicly'];
    if (isAdmin) allowedFields.push('role', 'status', 'verified', 'verification_type', 'restriction_reason', 'appeal_status');

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if ((req.body as any)[field] !== undefined) updates[field] = (req.body as any)[field];
    }

    const result = await sql`UPDATE profiles SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new AppError('User not found', 404);

    res.json({ user: result[0] });
  } catch (err) {
    next(err);
  }
});

usersRouter.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const id = req.params.id;

    if (user.id === id) throw new AppError('Cannot delete your own account', 400);
    await sql`DELETE FROM profiles WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:id/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    const { status = "active", limit = "20", offset = "0" } = req.query;

    const listings = await sql`SELECT * FROM ads WHERE seller_id = ${id} AND status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:id/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;

    const reviews = await sql`SELECT r.*, u.full_name as buyer_name, u.avatar_url as buyer_avatar FROM reviews r LEFT JOIN profiles u ON r.buyer_id = u.id WHERE r.seller_id = ${id} ORDER BY r.created_at DESC`;
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});
