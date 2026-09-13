import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth, requireAdmin } from '../../_middleware/auth';
import type { AppContext } from '../../_middleware/types';

export const reviewsRoutes = new Hono<AppContext>();

reviewsRoutes.get('/seller/:sellerId', async (c) => {
  try {
    const sql = getSql(c.env);
    const sellerId = c.req.param('sellerId');
    const { limit = '20', offset = '0' } = c.req.query();

    const reviews = await sql`SELECT r.*, u.full_name as buyer_name, u.avatar_url as buyer_avatar FROM reviews r LEFT JOIN profiles u ON r.buyer_id = u.id WHERE r.seller_id = ${sellerId} AND r.status = 'approved' ORDER BY r.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const avgRating = await sql`SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE seller_id = ${sellerId} AND status = 'approved'`;

    return c.json({
      reviews,
      avgRating: parseFloat(avgRating[0]?.avg_rating || '0'),
      totalReviews: parseInt(avgRating[0]?.total_reviews || '0')
    });
  } catch (err) {
    console.error('Get seller reviews error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch reviews' });
  }
});

reviewsRoutes.post('/', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const body = await c.req.json();
    const { seller_id, rating, comment } = body;

    if (!seller_id || !rating || !comment) throw new HTTPException(400, { message: 'seller_id, rating, and comment are required' });
    if (rating < 1 || rating > 5) throw new HTTPException(400, { message: 'Rating must be between 1 and 5' });

    const existing = await sql`SELECT * FROM reviews WHERE seller_id = ${seller_id} AND buyer_id = ${user.id}`;
    if (existing.length > 0) throw new HTTPException(400, { message: 'You have already reviewed this seller' });

    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;
    const result = await sql`INSERT INTO reviews (seller_id, buyer_id, buyer_name, buyer_avatar, rating, comment, status, created_at, updated_at) VALUES (${seller_id}, ${user.id}, ${profile[0]?.full_name || 'Buyer'}, ${profile[0]?.avatar_url || null}, ${rating}, ${comment}, 'approved', NOW(), NOW()) RETURNING *`;

    return c.json({ review: result[0] }, 201);
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Create review error:', err);
    throw new HTTPException(500, { message: 'Failed to create review' });
  }
});

reviewsRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const reviewId = c.req.param('id');
    const body = await c.req.json();
    const { rating, comment } = body;

    if (!rating || !comment) throw new HTTPException(400, { message: 'rating and comment are required' });

    const review = await sql`SELECT buyer_id FROM reviews WHERE id = ${reviewId}`;
    if (review.length === 0 || review[0].buyer_id !== user.id) throw new HTTPException(403, { message: 'Not authorized' });

    const result = await sql`UPDATE reviews SET rating = ${rating}, comment = ${comment}, updated_at = NOW() WHERE id = ${reviewId} RETURNING *`;
    return c.json({ review: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Update review error:', err);
    throw new HTTPException(500, { message: 'Failed to update review' });
  }
});

reviewsRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const reviewId = c.req.param('id');

    const review = await sql`SELECT buyer_id FROM reviews WHERE id = ${reviewId}`;
    if (review.length === 0 || review[0].buyer_id !== user.id) throw new HTTPException(403, { message: 'Not authorized' });

    await sql`DELETE FROM reviews WHERE id = ${reviewId}`;
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Delete review error:', err);
    throw new HTTPException(500, { message: 'Failed to delete review' });
  }
});

reviewsRoutes.get('/admin/all', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const { status, limit = '50', offset = '0' } = c.req.query();

    let whereClause = 'WHERE 1=1';
    if (status) whereClause += ` AND status = '${status}'`;

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const reviews = await sql`SELECT r.*, u1.full_name as seller_name, u2.full_name as buyer_name FROM reviews r LEFT JOIN profiles u1 ON r.seller_id = u1.id LEFT JOIN profiles u2 ON r.buyer_id = u2.id ${sql(whereClause)} ORDER BY r.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    return c.json({ reviews });
  } catch (err) {
    console.error('Admin get reviews error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch reviews' });
  }
});

reviewsRoutes.put('/admin/:id', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const reviewId = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    const result = await sql`UPDATE reviews SET status = ${status}, updated_at = NOW() WHERE id = ${reviewId} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Review not found' });
    return c.json({ review: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update review error:', err);
    throw new HTTPException(500, { message: 'Failed to update review' });
  }
});

reviewsRoutes.delete('/admin/:id', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const reviewId = c.req.param('id');
    await sql`DELETE FROM reviews WHERE id = ${reviewId}`;
    return c.json({ success: true });
  } catch (err) {
    console.error('Admin delete review error:', err);
    throw new HTTPException(500, { message: 'Failed to delete review' });
  }
});

export default reviewsRoutes;