import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getSql } from '../db/postgres.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const listingsRouter = Router();

const createListingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  price: z.number().positive().max(100000000),
  category_id: z.string().min(1),
  subcategory_id: z.string().optional().nullable(),
  condition: z.enum(["Brand New", "Like New", "Used - Good", "Used - Fair"]),
  location: z.string().min(2).max(100),
  images: z.array(z.string().url()).min(1).max(10),
  video_url: z.string().url().optional().nullable(),
  specifications: z.record(z.string()).optional(),
});

const updateListingSchema = createListingSchema.partial().extend({
  status: z.literal("sold").optional(),
});

const querySchema = z.object({
  category: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  searchQuery: z.string().optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
  status: z.enum(["active", "sold", "draft", "pending_review"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  featured: z.coerce.boolean().optional(),
});

listingsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const query = querySchema.parse(req.query);
    const { category, condition, location, minPrice, maxPrice, searchQuery, sortBy = "newest", status = "active", limit = "20", offset = "0", featured } = query;

    let whereClause = "WHERE a.status = $1";
    const params: any[] = [status];
    let paramIndex = 2;

    if (category && category !== "All") { whereClause += ` AND a.category_id = $${paramIndex}`; params.push(category); paramIndex++; }
    if (condition && condition !== "All") { whereClause += ` AND a.condition = $${paramIndex}`; params.push(condition); paramIndex++; }
    if (location) { whereClause += ` AND a.location ILIKE $${paramIndex}`; params.push(`%${location}%`); paramIndex++; }
    if (minPrice) { whereClause += ` AND a.price >= $${paramIndex}`; params.push(minPrice); paramIndex++; }
    if (maxPrice) { whereClause += ` AND a.price <= $${paramIndex}`; params.push(maxPrice); paramIndex++; }
    if (searchQuery) { whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`; params.push(`%${searchQuery}%`); paramIndex++; }
    if (featured === true) { whereClause += ` AND a.featured = true`; }

    let orderClause = "ORDER BY a.created_at DESC";
    if (sortBy === "price-asc") orderClause = "ORDER BY a.price ASC";
    else if (sortBy === "price-desc") orderClause = "ORDER BY a.price DESC";
    else if (sortBy === "popular") orderClause = "ORDER BY a.views_count DESC";

    const limitNum = Math.min(parseInt(String(limit)) || 20, 100);
    const offsetNum = parseInt(String(offset)) || 0;

    const listings = await sql`SELECT a.*, p.full_name as seller_name, CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone, p.avatar_url as seller_avatar, p.verified as seller_verified, p.verification_type as seller_verification_type FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id ${sql(whereClause)} ${sql(orderClause)} LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM ads a ${sql(whereClause)}`;

    res.json({ listings, total: parseInt(countResult[0]?.total || "0"), limit: limitNum, offset: offsetNum });
  } catch (err) {
    next(err);
  }
});

listingsRouter.get('/meta/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const categories = await sql`SELECT category_id as category, COUNT(*) as count FROM ads WHERE status = 'active' GROUP BY category_id ORDER BY count DESC`;
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

listingsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const id = req.params.id;
    const listing = await sql`SELECT a.*, p.full_name as seller_name, CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone, p.avatar_url as seller_avatar, p.verified as seller_verified, p.verification_type as seller_verification_type FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id WHERE a.id = ${id}`;
    if (listing.length === 0) throw new AppError('Listing not found', 404);
    await sql`UPDATE ads SET views_count = views_count + 1 WHERE id = ${id}`;
    res.json({ listing: listing[0] });
  } catch (err) {
    next(err);
  }
});

listingsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const validated = createListingSchema.parse(req.body);
    const { title, description, price, category_id, subcategory_id, condition, location, images, video_url, specifications = {} } = validated;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const postCount = await sql`SELECT COUNT(*) as count FROM ads WHERE seller_id = ${user.id} AND created_at >= ${todayStart.toISOString()}`;
    if (Number(postCount[0]?.count || 0) >= 10) {
      throw new AppError('Daily post limit reached (10 ads/day)', 429);
    }

    const result = await sql`INSERT INTO ads (seller_id, title, description, price, category_id, subcategory_id, condition, location, images, video_url, specifications, status, views_count, created_at, updated_at) VALUES (${user.id}, ${title}, ${description}, ${price}, ${category_id}, ${subcategory_id || null}, ${condition}, ${location}, ${images}, ${video_url || null}, ${JSON.stringify(specifications)}, 'active', 1, NOW(), NOW()) RETURNING *`;

    res.json({ listing: result[0] }, 201);
  } catch (err) {
    next(err);
  }
});

listingsRouter.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const id = req.params.id;
    const validated = updateListingSchema.parse(req.body);

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) throw new AppError('Listing not found', 404);
    if (existing[0].seller_id !== user.id) throw new AppError('Not authorized to update this listing', 403);

    const allowedFields = ['title', 'description', 'price', 'category_id', 'subcategory_id', 'condition', 'location', 'images', 'video_url', 'specifications', 'status'];
    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if ((validated as any)[field] !== undefined) updates[field] = (validated as any)[field];
    }

    const result = await sql`UPDATE ads SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    res.json({ listing: result[0] });
  } catch (err) {
    next(err);
  }
});

listingsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const id = req.params.id;

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) throw new AppError('Listing not found', 404);
    if (existing[0].seller_id !== user.id) throw new AppError('Not authorized to delete this listing', 403);

    await sql`DELETE FROM ads WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

listingsRouter.post('/:id/featured', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const id = req.params.id;

    const existing = await sql`SELECT seller_id, featured FROM ads WHERE id = ${id}`;
    if (existing.length === 0) throw new AppError('Listing not found', 404);
    if (existing[0].seller_id !== user.id) throw new AppError('Not authorized', 403);

    const newFeatured = !existing[0].featured;
    const result = await sql`UPDATE ads SET featured = ${newFeatured}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
    res.json({ listing: result[0] });
  } catch (err) {
    next(err);
  }
});
