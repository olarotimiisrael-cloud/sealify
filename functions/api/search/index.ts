import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth } from '../../_middleware/auth';
import { searchQuerySchema } from '../../_middleware/security';
import type { AppContext } from '../../_middleware/types';

export const searchRoutes = new Hono<AppContext>();

searchRoutes.get('/', async (c) => {
  try {
    const sql = getSql(c.env);
    const query = searchQuerySchema.parse(c.req.query());
    const { q, category, location, minPrice, maxPrice, condition, sortBy = 'newest', limit = '20', offset = '0' } = query;

    let whereClause = 'WHERE a.status = \'active\'';
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    if (category && category !== 'All') {
      whereClause += ` AND a.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (location) {
      whereClause += ` AND a.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    if (minPrice) {
      whereClause += ` AND a.price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }
    if (maxPrice) {
      whereClause += ` AND a.price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }
    if (condition && condition !== 'All') {
      whereClause += ` AND a.condition = $${paramIndex}`;
      params.push(condition);
      paramIndex++;
    }

    let orderClause = 'ORDER BY a.created_at DESC';
    if (sortBy === 'price-asc') orderClause = 'ORDER BY a.price ASC';
    else if (sortBy === 'price-desc') orderClause = 'ORDER BY a.price DESC';
    else if (sortBy === 'popular') orderClause = 'ORDER BY a.views_count DESC';

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const listings = await sql`
      SELECT a.*, p.full_name as seller_name, p.phone_number as seller_phone, p.avatar_url as seller_avatar, p.verified as seller_verified, p.verification_type as seller_verification_type
      FROM ads a
      LEFT JOIN profiles p ON a.seller_id = p.id
      ${sql(whereClause)}
      ${sql(orderClause)}
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;
    const countResult = await sql`SELECT COUNT(*) as total FROM ads a ${sql(whereClause)}`;

    return c.json({ listings, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Search error:', err);
    throw new HTTPException(500, { message: 'Search failed' });
  }
});

searchRoutes.get('/suggestions', async (c) => {
  try {
    const sql = getSql(c.env);
    const { q } = c.req.query();
    if (!q || q.length < 2) {
      return c.json({ suggestions: [] });
    }

    const suggestions = await sql`SELECT DISTINCT title FROM ads WHERE status = 'active' AND title ILIKE ${'%' + q + '%'} LIMIT 10`;
    const categories = await sql`SELECT DISTINCT category_id FROM ads WHERE status = 'active' AND category_id ILIKE ${'%' + q + '%'} LIMIT 5`;

    const combined = [...suggestions.map((s: any) => s.title), ...categories.map((c: any) => c.category_id)].slice(0, 10);
    return c.json({ suggestions: combined });
  } catch (err) {
    console.error('Suggestions error:', err);
    throw new HTTPException(500, { message: 'Failed to get suggestions' });
  }
});

searchRoutes.get('/trending', async (c) => {
  try {
    const sql = getSql(c.env);
    const trending = await sql`SELECT category_id as category, COUNT(*) as count, AVG(price) as avg_price FROM ads WHERE status = 'active' AND created_at > NOW() - INTERVAL '7 days' GROUP BY category_id ORDER BY count DESC LIMIT 10`;
    return c.json({ trending });
  } catch (err) {
    console.error('Trending error:', err);
    throw new HTTPException(500, { message: 'Failed to get trending' });
  }
});

searchRoutes.post('/alerts', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const body = await c.req.json();
    const { query, category, maxPrice, location } = body;
    if (!query) throw new HTTPException(400, { message: 'Query is required' });

    const result = await sql`INSERT INTO search_alerts (user_id, query, category_id, max_price, location, is_active, created_at, updated_at) VALUES (${user.id}, ${query}, ${category || null}, ${maxPrice || null}, ${location || null}, true, NOW(), NOW()) RETURNING *`;
    return c.json({ alert: result[0] }, 201);
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Create search alert error:', err);
    throw new HTTPException(500, { message: 'Failed to create alert' });
  }
});

searchRoutes.get('/alerts', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const alerts = await sql`SELECT * FROM search_alerts WHERE user_id = ${user.id} AND is_active = true ORDER BY created_at DESC`;
    return c.json({ alerts });
  } catch (err) {
    console.error('Get search alerts error:', err);
    throw new HTTPException(500, { message: 'Failed to get alerts' });
  }
});

searchRoutes.delete('/alerts/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const alertId = c.req.param('id');

    const alert = await sql`SELECT user_id FROM search_alerts WHERE id = ${alertId}`;
    if (alert.length === 0 || alert[0].user_id !== user.id) throw new HTTPException(403, { message: 'Not authorized' });

    await sql`DELETE FROM search_alerts WHERE id = ${alertId}`;
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Delete search alert error:', err);
    throw new HTTPException(500, { message: 'Failed to delete alert' });
  }
});

export default searchRoutes;