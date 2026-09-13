import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../../_middleware/db';
import { requireAuth } from '../../_middleware/auth';
import type { AppContext } from '../../_middleware/types';

export const buyerRequestsRoutes = new Hono<AppContext>();

buyerRequestsRoutes.get('/', async (c) => {
  try {
    const sql = getSql(c.env);
    const { category, status = 'open', limit = '20', offset = '0' } = c.req.query();

    let whereClause = 'WHERE status = $1';
    const params: any[] = [status];
    let paramIndex = 2;

    if (category && category !== 'All') {
      whereClause += ` AND category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const requests = await sql`SELECT * FROM buyer_requests ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    return c.json({ requests });
  } catch (err) {
    console.error('Get buyer requests error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch buyer requests' });
  }
});

buyerRequestsRoutes.post('/', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const body = await c.req.json();
    const { title, category_id, max_budget, location, description } = body;

    if (!title || !category_id || !max_budget || !location || !description) {
      throw new HTTPException(400, { message: 'All fields are required' });
    }

    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;
    const result = await sql`INSERT INTO buyer_requests (user_id, user_name, user_avatar, title, category_id, max_budget, location, description, status, created_at, updated_at) VALUES (${user.id}, ${profile[0]?.full_name || 'User'}, ${profile[0]?.avatar_url || null}, ${title}, ${category_id}, ${max_budget}, ${location}, ${description}, 'open', NOW(), NOW()) RETURNING *`;

    return c.json({ request: result[0] }, 201);
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Create buyer request error:', err);
    throw new HTTPException(500, { message: 'Failed to create buyer request' });
  }
});

buyerRequestsRoutes.post('/:id/respond', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const requestId = c.req.param('id');
    const body = await c.req.json();
    const { proposed_price, message } = body;

    if (!proposed_price) throw new HTTPException(400, { message: 'Proposed price is required' });

    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;
    const request = await sql`SELECT * FROM buyer_requests WHERE id = ${requestId} AND status = 'open'`;
    if (request.length === 0) throw new HTTPException(404, { message: 'Request not found or closed' });

    const result = await sql`INSERT INTO buyer_request_responses (request_id, seller_id, seller_name, seller_avatar, proposed_price, message, status, created_at) VALUES (${requestId}, ${user.id}, ${profile[0]?.full_name || 'Seller'}, ${profile[0]?.avatar_url || null}, ${proposed_price}, ${message || null}, 'pending', NOW()) RETURNING *`;

    await sql`UPDATE buyer_requests SET status = 'responded', responses_count = responses_count + 1 WHERE id = ${requestId}`;
    await sql`INSERT INTO notifications (user_id, type, title, description, link_url, created_at) VALUES (${request[0].user_id}, 'offer', 'New Offer on Your Request', 'A seller responded to your request', '/requests', NOW())`;

    return c.json({ response: result[0] }, 201);
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Respond to buyer request error:', err);
    throw new HTTPException(500, { message: 'Failed to respond' });
  }
});

buyerRequestsRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const requestId = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    const request = await sql`SELECT user_id FROM buyer_requests WHERE id = ${requestId}`;
    if (request.length === 0 || request[0].user_id !== user.id) throw new HTTPException(403, { message: 'Not authorized' });

    await sql`UPDATE buyer_requests SET status = ${status}, updated_at = NOW() WHERE id = ${requestId}`;
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Update buyer request error:', err);
    throw new HTTPException(500, { message: 'Failed to update request' });
  }
});

buyerRequestsRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c.env);
    const user = c.get('user')!;
    const requestId = c.req.param('id');

    const request = await sql`SELECT user_id FROM buyer_requests WHERE id = ${requestId}`;
    if (request.length === 0 || request[0].user_id !== user.id) throw new HTTPException(403, { message: 'Not authorized' });

    await sql`DELETE FROM buyer_requests WHERE id = ${requestId}`;
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Delete buyer request error:', err);
    throw new HTTPException(500, { message: 'Failed to delete request' });
  }
});

export default buyerRequestsRoutes;