import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { q, category, location, minPrice, maxPrice, condition, sortBy = "newest", limit = "20", offset = "0" } = req.query;

    let whereClause = "WHERE a.status = 'active'";
    const params: any[] = [];
    let paramIndex = 1;

    if (q) { whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`; params.push(`%${q}%`); paramIndex++; }
    if (category && category !== "All") { whereClause += ` AND a.category_id = $${paramIndex}`; params.push(category); paramIndex++; }
    if (location) { whereClause += ` AND a.location ILIKE $${paramIndex}`; params.push(`%${location}%`); paramIndex++; }
    if (minPrice) { whereClause += ` AND a.price >= $${paramIndex}`; params.push(parseFloat(minPrice as string)); paramIndex++; }
    if (maxPrice) { whereClause += ` AND a.price <= $${paramIndex}`; params.push(parseFloat(maxPrice as string)); paramIndex++; }
    if (condition && condition !== "All") { whereClause += ` AND a.condition = $${paramIndex}`; params.push(condition); paramIndex++; }

    let orderClause = "ORDER BY a.created_at DESC";
    if (sortBy === "price-asc") orderClause = "ORDER BY a.price ASC";
    else if (sortBy === "price-desc") orderClause = "ORDER BY a.price DESC";
    else if (sortBy === "popular") orderClause = "ORDER BY a.views_count DESC";

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const offsetNum = parseInt(offset as string) || 0;

    const listings = await sql`SELECT a.*, p.full_name as seller_name, p.phone_number as seller_phone, p.avatar_url as seller_avatar, p.verified as seller_verified, p.verification_type as seller_verification_type FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id ${sql(whereClause)} ${sql(orderClause)} LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM ads a ${sql(whereClause)}`;

    res.json({ listings, total: parseInt(countResult[0]?.total || "0"), limit: limitNum, offset: offsetNum });
  } catch (err) {
    next(err);
  }
});

searchRouter.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { q } = req.query;
    if (!q || (q as string).length < 2) { res.json({ suggestions: [] }); return; }

    const suggestions = await sql`SELECT DISTINCT title FROM ads WHERE status = 'active' AND title ILIKE ${'%' + q + '%'} LIMIT 10`;
    const categories = await sql`SELECT DISTINCT category_id FROM ads WHERE status = 'active' AND category_id ILIKE ${'%' + q + '%'} LIMIT 5`;

    res.json({ suggestions: [...suggestions.map((s: any) => s.title), ...categories.map((c: any) => c.category_id)].slice(0, 10) });
  } catch (err) {
    next(err);
  }
});

searchRouter.get('/trending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const trending = await sql`SELECT category_id as category, COUNT(*) as count, AVG(price) as avg_price FROM ads WHERE status = 'active' AND created_at > NOW() - INTERVAL '7 days' GROUP BY category_id ORDER BY count DESC LIMIT 10`;
    res.json({ trending });
  } catch (err) {
    next(err);
  }
});

searchRouter.post('/alerts', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const { query, category, maxPrice, location } = req.body;
    if (!query) throw new AppError('Query is required', 400);

    const result = await sql`INSERT INTO search_alerts (user_id, query, category_id, max_price, location, is_active, created_at, updated_at) VALUES (${user.id}, ${query}, ${category || null}, ${maxPrice || null}, ${location || null}, true, NOW(), NOW()) RETURNING *`;
    res.json({ alert: result[0] }, 201);
  } catch (err) {
    next(err);
  }
});

searchRouter.get('/alerts', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const alerts = await sql`SELECT * FROM search_alerts WHERE user_id = ${user.id} AND is_active = true ORDER BY created_at DESC`;
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
});

searchRouter.delete('/alerts/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const alertId = req.params.id;

    const alert = await sql`SELECT user_id FROM search_alerts WHERE id = ${alertId}`;
    if (alert.length === 0 || alert[0].user_id !== user.id) throw new AppError('Not authorized', 403);

    await sql`DELETE FROM search_alerts WHERE id = ${alertId}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
