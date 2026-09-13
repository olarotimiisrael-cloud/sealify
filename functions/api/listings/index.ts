import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth } from '../../_middleware/auth';
import { listingsRateLimit, querySchema, createListingSchema, updateListingSchema, sanitizeInput } from '../../_middleware/security';
import { auditLog } from '../../_middleware/admin-service';
import type { AppContext } from '../../_middleware/types';

export const listingsRoutes = new Hono<AppContext>();

// GET /api/listings - List with filters
listingsRoutes.get('/', listingsRateLimit, async (c) => {
  try {
    const sql = getSql(c.env);
    const query = querySchema.parse(c.req.query());
    const {
      category, condition, location, minPrice, maxPrice,
      searchQuery, sortBy = 'newest', status = 'active',
      limit = '20', offset = '0', featured
    } = query;

    let whereClause = 'WHERE a.status = $1';
    const params: any[] = [status];
    let paramIndex = 2;

    if (category && category !== 'All') {
      whereClause += ` AND a.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (condition && condition !== 'All') {
      whereClause += ` AND a.condition = $${paramIndex}`;
      params.push(condition);
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

    if (searchQuery) {
      whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (featured === true) {
      whereClause += ` AND a.featured = true`;
    }

    let orderClause = 'ORDER BY a.created_at DESC';
    if (sortBy === 'price-asc') orderClause = 'ORDER BY a.price ASC';
    else if (sortBy === 'price-desc') orderClause = 'ORDER BY a.price DESC';
    else if (sortBy === 'popular') orderClause = 'ORDER BY a.views_count DESC';

    const limitNum = Math.min(parseInt(String(limit)) || 20, 100);
    const offsetNum = parseInt(String(offset)) || 0;

    const listings = await sql`
      SELECT
        a.*,
        p.full_name as seller_name,
        CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone,
        p.avatar_url as seller_avatar,
        p.verified as seller_verified,
        p.verification_type as seller_verification_type
      FROM ads a
      LEFT JOIN profiles p ON a.seller_id = p.id
      ${sql(whereClause)}
      ${sql(orderClause)}
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total FROM ads a
      ${sql(whereClause)}
    `;

    return c.json({
      listings,
      total: parseInt(countResult[0]?.total || '0'),
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Get listings error:', error);
    throw new HTTPException(500, { message: 'Failed to fetch listings' });
  }
});

// GET /api/listings/meta/categories - Get category stats
listingsRoutes.get('/meta/categories', async (c) => {
  try {
    const sql = getSql(c.env);
    const categories = await sql`
      SELECT category_id as category, COUNT(*) as count
      FROM ads
      WHERE status = 'active'
      GROUP BY category_id
      ORDER BY count DESC
    `;

    return c.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    throw new HTTPException(500, { message: 'Failed to fetch categories' });
  }
});

// GET /api/listings/:id - Get single listing
listingsRoutes.get('/:id', listingsRateLimit, async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');

    const listing = await sql`
      SELECT
        a.*,
        p.full_name as seller_name,
        CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone,
        p.avatar_url as seller_avatar,
        p.verified as seller_verified,
        p.verification_type as seller_verification_type
      FROM ads a
      LEFT JOIN profiles p ON a.seller_id = p.id
      WHERE a.id = ${id}
    `;

    if (listing.length === 0) {
      throw new HTTPException(404, { message: 'Listing not found' });
    }

    // Increment view count
    await sql`UPDATE ads SET views_count = views_count + 1 WHERE id = ${id}`;

    return c.json({ listing: listing[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Get listing error:', error);
    throw new HTTPException(500, { message: 'Failed to fetch listing' });
  }
});

// POST /api/listings - Create listing
listingsRoutes.post('/', requireAuth, async (c) => {
  try {
    const user = c.get('user')!;
    const sql = getSql(c.env);
    const body = await c.req.json();
    const validated = createListingSchema.parse(body);
    const {
      title, description, price, category_id, subcategory_id,
      condition, location, images, video_url, specifications = {}
    } = validated;

    // Check daily post limit (anti-spam)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const postCount = await sql`
      SELECT COUNT(*) as count FROM ads
      WHERE seller_id = ${user.id} AND created_at >= ${todayStart.toISOString()}
    `;
    if (Number(postCount[0]?.count || 0) >= 10) {
      throw new HTTPException(429, { message: 'Daily post limit reached (10 ads/day)' });
    }

    // Sanitize text fields
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedLocation = sanitizeInput(location);

    const result = await sql`
      INSERT INTO ads (
        seller_id, title, description, price, category_id, subcategory_id,
        condition, location, images, video_url, specifications, status, views_count, created_at, updated_at
      ) VALUES (
        ${user.id}, ${sanitizedTitle}, ${sanitizedDescription}, ${price}, ${category_id}, ${subcategory_id || null},
        ${condition}, ${sanitizedLocation}, ${images}, ${video_url || null}, ${JSON.stringify(specifications)},
        'active', 1, NOW(), NOW()
      )
      RETURNING *
    `;

    await auditLog(sql, user.id, 'Listing Created', `Created listing: ${sanitizedTitle}`, 'listing');

    return c.json({ listing: result[0] }, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HTTPException(400, { message: 'Validation failed', cause: error });
    }
    console.error('Create listing error:', error);
    throw new HTTPException(500, { message: 'Failed to create listing' });
  }
});

// PUT /api/listings/:id - Update listing
listingsRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user')!;
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const validated = updateListingSchema.parse(body);

    // Check ownership
    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw new HTTPException(404, { message: 'Listing not found' });
    }
    if (existing[0].seller_id !== user.id) {
      throw new HTTPException(403, { message: 'Not authorized to update this listing' });
    }

    const allowedFields = [
      'title', 'description', 'price', 'category_id', 'subcategory_id',
      'condition', 'location', 'images', 'video_url', 'specifications',
      'status'
    ];

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (validated[field as keyof typeof validated] !== undefined) {
        updates[field] = validated[field as keyof typeof validated];
      }
    }

    // Sanitize text fields
    for (const key of Object.keys(updates)) {
      if (typeof updates[key] === 'string') {
        updates[key] = sanitizeInput(updates[key]);
      }
    }

    const result = await sql`
      UPDATE ads SET ${sql(updates)} WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      throw new HTTPException(404, { message: 'Listing not found' });
    }

    await auditLog(sql, user.id, 'Listing Updated', `Updated listing ${id}`, 'listing');

    return c.json({ listing: result[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HTTPException(400, { message: 'Validation failed', cause: error });
    }
    console.error('Update listing error:', error);
    throw new HTTPException(500, { message: 'Failed to update listing' });
  }
});

// DELETE /api/listings/:id - Delete listing
listingsRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user')!;
    const sql = getSql(c.env);
    const id = c.req.param('id');

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw new HTTPException(404, { message: 'Listing not found' });
    }
    if (existing[0].seller_id !== user.id) {
      throw new HTTPException(403, { message: 'Not authorized to delete this listing' });
    }

    await sql`DELETE FROM ads WHERE id = ${id}`;

    await auditLog(sql, user.id, 'Listing Deleted', `Deleted listing ${id}`, 'listing');

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Delete listing error:', error);
    throw new HTTPException(500, { message: 'Failed to delete listing' });
  }
});

// POST /api/listings/:id/featured - Toggle featured
listingsRoutes.post('/:id/featured', requireAuth, async (c) => {
  try {
    const user = c.get('user')!;
    const sql = getSql(c.env);
    const id = c.req.param('id');

    const existing = await sql`SELECT seller_id, featured FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw new HTTPException(404, { message: 'Listing not found' });
    }
    if (existing[0].seller_id !== user.id) {
      throw new HTTPException(403, { message: 'Not authorized' });
    }

    const newFeatured = !existing[0].featured;
    const result = await sql`
      UPDATE ads SET featured = ${newFeatured}, updated_at = NOW() WHERE id = ${id} RETURNING *
    `;

    await auditLog(sql, user.id, 'Featured Toggled', `Listing ${id} featured: ${newFeatured}`, 'listing');

    return c.json({ listing: result[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Toggle featured error:', error);
    throw new HTTPException(500, { message: 'Failed to toggle featured' });
  }
});

export default listingsRoutes;