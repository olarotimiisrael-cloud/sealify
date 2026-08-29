import { Router, Request, Response, NextFunction } from 'express';
import { getSql } from '../db/postgres.js';
import { getSupabase } from '../db/supabase.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth, requireAdmin, type AuthenticatedRequest } from '../middleware/auth.js';

export const reviewsRouter = Router();

reviewsRouter.get('/seller/:sellerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const sellerId = req.params.sellerId;
    const { limit = "20", offset = "0" } = req.query;

    const reviews = await sql`SELECT r.*, u.full_name as buyer_name, u.avatar_url as buyer_avatar FROM reviews r LEFT JOIN profiles u ON r.buyer_id = u.id WHERE r.seller_id = ${sellerId} AND r.status = 'approved' ORDER BY r.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    const avgRating = await sql`SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE seller_id = ${sellerId} AND status = 'approved'`;

    res.json({ reviews, avgRating: parseFloat(avgRating[0]?.avg_rating || "0"), totalReviews: parseInt(avgRating[0]?.total_reviews || "0") });
  } catch (err) {
    next(err);
  }
});

reviewsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const { seller_id, rating, comment } = req.body;

    if (!seller_id || !rating || !comment) throw new AppError('seller_id, rating, and comment are required', 400);
    if (rating < 1 || rating > 5) throw new AppError('Rating must be between 1 and 5', 400);

    const existing = await sql`SELECT * FROM reviews WHERE seller_id = ${seller_id} AND buyer_id = ${user.id}`;
    if (existing.length > 0) throw new AppError('You have already reviewed this seller', 400);

    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;
    const result = await sql`INSERT INTO reviews (seller_id, buyer_id, buyer_name, buyer_avatar, rating, comment, status, created_at, updated_at) VALUES (${seller_id}, ${user.id}, ${profile[0]?.full_name || 'Buyer'}, ${profile[0]?.avatar_url || null}, ${rating}, ${comment}, 'approved', NOW(), NOW()) RETURNING *`;

    res.json({ review: result[0] }, 201);
  } catch (err) {
    next(err);
  }
});

reviewsRouter.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || !comment) throw new AppError('rating and comment are required', 400);

    const review = await sql`SELECT buyer_id FROM reviews WHERE id = ${reviewId}`;
    if (review.length === 0 || review[0].buyer_id !== user.id) throw new AppError('Not authorized', 403);

    const result = await sql`UPDATE reviews SET rating = ${rating}, comment = ${comment}, updated_at = NOW() WHERE id = ${reviewId} RETURNING *`;
    res.json({ review: result[0] });
  } catch (err) {
    next(err);
  }
});

reviewsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const user = req.user!;
    const reviewId = req.params.id;

    const review = await sql`SELECT buyer_id FROM reviews WHERE id = ${reviewId}`;
    if (review.length === 0 || review[0].buyer_id !== user.id) throw new AppError('Not authorized', 403);

    await sql`DELETE FROM reviews WHERE id = ${reviewId}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

reviewsRouter.get('/admin/all', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const { status, limit = "50", offset = "0" } = req.query;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;
    if (status) { whereClause += ` AND status = $${paramIndex}`; params.push(status); paramIndex++; }

    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    const offsetNum = parseInt(offset as string) || 0;

    const reviews = await sql`SELECT r.*, u1.full_name as seller_name, u2.full_name as buyer_name FROM reviews r LEFT JOIN profiles u1 ON r.seller_id = u1.id LEFT JOIN profiles u2 ON r.buyer_id = u2.id ${sql(whereClause)} ORDER BY r.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

reviewsRouter.put('/admin/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const reviewId = req.params.id;
    const { status } = req.body;

    const result = await sql`UPDATE reviews SET status = ${status}, updated_at = NOW() WHERE id = ${reviewId} RETURNING *`;
    if (result.length === 0) throw new AppError('Review not found', 404);
    res.json({ review: result[0] });
  } catch (err) {
    next(err);
  }
});

reviewsRouter.delete('/admin/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sql = getSql();
    const reviewId = req.params.id;
    await sql`DELETE FROM reviews WHERE id = ${reviewId}`;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
